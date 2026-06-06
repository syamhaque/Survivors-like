import { Weapon } from '../Weapon.js';

export class SoulEater extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'soul_eater',
      name: 'Soul Eater',
      description: 'Massive garlic aura that steals life from enemies.',
      baseCooldown: 700,
      icon: '💀',
    });
    this.level = 8;
    this.maxLevel = 8;
    this.evolved = true;
    this._ring = scene.add.circle(player.x, player.y, 180, 0x440044, 0.2);
    this._ring.setStrokeStyle(3, 0xaa00ff, 0.8);
    this._ring.setDepth(1);
  }

  update(delta) {
    const stats = this.scene.playerStats;
    this._ring.setPosition(this.player.x, this.player.y);
    this._ring.setRadius(180 * stats.areaMult);
    this.timer += delta;
    if (this.timer >= this.cooldown * stats.cooldownMult) {
      this.timer = 0;
      this.fire();
    }
  }

  fire() {
    const stats = this.scene.playerStats;
    const r = 180 * stats.areaMult;
    let healed = 0;
    for (const e of this.scene.enemies.getChildren()) {
      if (!e.active) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d <= r) {
        e.takeDamage(60 * stats.damageMult);
        healed += 0.5;
      }
    }
    if (healed > 0) this.player.heal(Math.min(healed, 5));
    this.scene.tweens.add({ targets: this._ring, alpha: 0.5, duration: 80, yoyo: true });
  }

  destroy() {
    super.destroy();
    this._ring.destroy();
  }
}
