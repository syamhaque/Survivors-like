import { Weapon } from './Weapon.js';

const LEVELS = [
  { damage: 5,  radius: 60,  cooldown: 1500 },
  { damage: 8,  radius: 70,  cooldown: 1400 },
  { damage: 11, radius: 80,  cooldown: 1300 },
  { damage: 14, radius: 90,  cooldown: 1200 },
  { damage: 18, radius: 100, cooldown: 1100 },
  { damage: 22, radius: 110, cooldown: 1000 },
  { damage: 26, radius: 120, cooldown: 900 },
  { damage: 32, radius: 140, cooldown: 800 },
];

export class Garlic extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'garlic',
      name: 'Garlic',
      description: 'Continuously damages enemies in an area around you.',
      baseCooldown: 1500,
      evolutionId: 'soul_eater',
      requiredPassive: 'armor',
      icon: '🧄',
    });
    this._applyLevel();
    // Visual ring
    this._ring = scene.add.circle(player.x, player.y, this._radius, 0xffffaa, 0.15);
    this._ring.setStrokeStyle(2, 0xffffaa, 0.6);
    this._ring.setDepth(1);
  }

  _applyLevel() {
    const l = LEVELS[this.level - 1];
    this.cooldown = l.cooldown;
    this._damage = l.damage;
    this._radius = l.radius;
    if (this._ring) {
      const r = this._radius * (this.scene.playerStats?.areaMult || 1);
      this._ring.setRadius(r);
    }
  }

  onLevelUp() { this._applyLevel(); }

  update(delta) {
    const stats = this.scene.playerStats;
    this._ring.setPosition(this.player.x, this.player.y);
    const r = this._radius * stats.areaMult;
    this._ring.setRadius(r);

    this.timer += delta;
    if (this.timer >= this.cooldown * stats.cooldownMult) {
      this.timer = 0;
      this.fire();
    }
  }

  fire() {
    const stats = this.scene.playerStats;
    const r = this._radius * stats.areaMult;
    for (const e of this.scene.enemies.getChildren()) {
      if (!e.active) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d <= r) {
        e.takeDamage(this._damage * stats.damageMult);
      }
    }
    // Flash ring
    this.scene.tweens.add({ targets: this._ring, alpha: 0.5, duration: 80, yoyo: true });
  }

  destroy() {
    super.destroy();
    this._ring.destroy();
  }
}
