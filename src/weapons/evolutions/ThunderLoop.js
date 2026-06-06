import { Weapon } from '../Weapon.js';

export class ThunderLoop extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'thunder_loop',
      name: 'Thunder Loop',
      description: 'Chains lightning between up to 5 enemies repeatedly.',
      baseCooldown: 800,
      icon: '🌩️',
    });
    this.level = 8;
    this.maxLevel = 8;
    this.evolved = true;
  }

  fire() {
    const stats = this.scene.playerStats;
    const cam = this.scene.cameras.main;
    const enemies = this.scene.enemies.getChildren().filter(e => e.active && cam.worldView.contains(e.x, e.y));
    if (!enemies.length) return;
    Phaser.Utils.Array.Shuffle(enemies);
    const targets = enemies.slice(0, 5);
    for (const e of targets) {
      e.takeDamage(100 * stats.damageMult);
    }
    // Draw chain
    const gfx = this.scene.add.graphics();
    gfx.lineStyle(2, 0xffff00, 1);
    gfx.beginPath();
    gfx.moveTo(this.player.x, this.player.y);
    for (const e of targets) {
      gfx.lineTo(e.x + Phaser.Math.Between(-10, 10), e.y + Phaser.Math.Between(-10, 10));
    }
    gfx.strokePath();
    gfx.setDepth(5);
    this.scene.time.delayedCall(150, () => gfx.destroy());
  }
}
