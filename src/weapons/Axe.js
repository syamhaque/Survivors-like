import { Weapon } from './Weapon.js';

const LEVELS = [
  { damage: 35, cooldown: 2000, speed: 400, count: 1 },
  { damage: 45, cooldown: 1900, speed: 410, count: 1 },
  { damage: 55, cooldown: 1800, speed: 420, count: 1 },
  { damage: 65, cooldown: 1700, speed: 430, count: 2 },
  { damage: 75, cooldown: 1600, speed: 440, count: 2 },
  { damage: 90, cooldown: 1500, speed: 450, count: 2 },
  { damage: 105,cooldown: 1400, speed: 460, count: 3 },
  { damage: 125,cooldown: 1300, speed: 480, count: 3 },
];

export class Axe extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'axe',
      name: 'Axe',
      description: 'Throws axes in your movement direction that arc and return.',
      baseCooldown: 2000,
      evolutionId: 'death_spiral',
      requiredPassive: 'candelabrador',
      icon: '🪓',
    });
    this._applyLevel();
  }

  _applyLevel() {
    const l = LEVELS[this.level - 1];
    this.cooldown = l.cooldown;
    this._damage = l.damage;
    this._speed = l.speed;
    this._count = l.count;
  }

  onLevelUp() { this._applyLevel(); }

  fire() {
    const stats = this.scene.playerStats;
    const angle = this.player.lastAngle || 0;
    const spread = Math.PI / 8;
    const startAngle = angle - spread * (this._count - 1) / 2;
    for (let i = 0; i < this._count; i++) {
      const a = startAngle + spread * i;
      const vx = Math.cos(a) * this._speed;
      const vy = Math.sin(a) * this._speed;
      const b = this.spawnBullet(vx, vy, 0xcc8844, 8, this._damage, 3, 800);
      b.spinAngle = a;
      b.life = 0;
      b.maxLife = 700;
    }
  }

  updateProjectiles(delta) {
    const dt = delta / 1000;
    for (const b of this.projectiles) {
      if (!b.active) continue;
      b.life += delta;
      // Simulate arc: gravity pulls down after half-life
      const t = b.life / b.maxLife;
      b.vy += (t < 0.5 ? -600 : 900) * dt;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.angle = (b.angle + 12) % 360;
      if (b.life >= b.maxLife) b.destroy();
    }
  }
}
