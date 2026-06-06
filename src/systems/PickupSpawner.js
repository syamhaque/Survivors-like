import { WORLD_SIZE } from '../constants.js';

const CORNER_MARGIN = 300; // distance from corner edges for chest placement
const CORNER_REWARD_COUNT = 3;

export class PickupSpawner {
  constructor(scene) {
    this.scene    = scene;
    this.chickens = scene.physics.add.staticGroup();
    this.chests   = scene.physics.add.staticGroup();
    this._spawnCornerChests();
  }

  // ── Drop methods (called on enemy death) ──────────────────────────────────

  maybeDropChicken(x, y) {
    if (Math.random() > 0.10) return;
    this._dropChicken(x, y);
  }

  dropChest(x, y, rewardCount = 3) {
    const ch = this.scene.add.sprite(x, y, 'chest').setDepth(3);
    this.scene.physics.add.existing(ch, true);
    ch.opened      = false;
    ch.rewardCount = rewardCount;
    this.chests.add(ch);
  }

  // ── Collection callbacks ───────────────────────────────────────────────────

  collectChicken(player, chicken) {
    if (!chicken.active) return;
    chicken.destroy();
    this.scene.events.emit('chicken-collected', player);
  }

  collectChest(player, chest) {
    if (!chest.active || chest.opened) return;
    chest.opened = true;
    const count  = chest.rewardCount ?? 3;
    chest.destroy();
    this.scene.events.emit('chest-opened', count);
  }

  // ── Minimap data helpers ───────────────────────────────────────────────────

  getChestPositions()   { return this.chests.getChildren().filter(c => c.active && !c.opened); }
  getChickenPositions() { return this.chickens.getChildren().filter(c => c.active); }

  // ── Private ────────────────────────────────────────────────────────────────

  _dropChicken(x, y) {
    const c = this.scene.add.sprite(x, y, 'chicken').setDepth(3);
    this.scene.physics.add.existing(c, true);
    this.chickens.add(c);
    // Auto-despawn after 30 seconds
    this.scene.time.delayedCall(30000, () => { if (c.active) c.destroy(); });
  }

  _spawnCornerChests() {
    const m  = CORNER_MARGIN;
    const sz = WORLD_SIZE;
    const corners = [
      { x: m,      y: m      },
      { x: sz - m, y: m      },
      { x: m,      y: sz - m },
      { x: sz - m, y: sz - m },
    ];
    for (const pos of corners) {
      const ch = this.scene.add.sprite(pos.x, pos.y, 'chest').setDepth(3).setTint(0xffdd44);
      this.scene.physics.add.existing(ch, true);
      ch.opened      = false;
      ch.rewardCount = CORNER_REWARD_COUNT;
      ch.isCorner    = true;
      this.chests.add(ch);
    }
  }
}
