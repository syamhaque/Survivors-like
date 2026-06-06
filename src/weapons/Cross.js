import { Weapon } from './Weapon.js';

const LEVELS = [
  { damage: 20, cooldown: 2200, speed: 450, count: 1 },
  { damage: 28, cooldown: 2100, speed: 460, count: 1 },
  { damage: 36, cooldown: 2000, speed: 470, count: 1 },
  { damage: 44, cooldown: 1900, speed: 480, count: 2 },
  { damage: 52, cooldown: 1800, speed: 490, count: 2 },
  { damage: 62, cooldown: 1700, speed: 500, count: 2 },
  { damage: 72, cooldown: 1600, speed: 510, count: 3 },
  { damage: 85, cooldown: 1500, speed: 520, count: 3 },
];

export class Cross extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'cross',
      name: 'Cross',
      description: 'Throws a cross that bounces back to you.',
      baseCooldown: 2200,
      evolutionId: 'heaven_sword',
      requiredPassive: 'wings',
      icon: '✝️',
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
    const spread = Math.PI / 6;
    const baseAngle = this.player.lastAngle || 0;
    const startAngle = baseAngle - spread * (this._count - 1) / 2;
    for (let i = 0; i < this._count; i++) {
      const a = startAngle + spread * i;
      const vx = Math.cos(a) * this._speed;
      const vy = Math.sin(a) * this._speed;
      const b = this.spawnBullet(vx, vy, 0xffffff, 7, this._damage, 2, 700);
      b.returnTimer = 0;
      b.returning = false;
    }
  }

  updateProjectiles(delta) {
    const dt = delta / 1000;
    for (const b of this.projectiles) {
      if (!b.active) continue;
      // Once half the range is traveled, steer back toward player
      if (!b.returning) {
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.traveled += Math.sqrt(b.vx * b.vx + b.vy * b.vy) * dt;
        if (b.traveled >= b.maxRange * 0.5) b.returning = true;
      } else {
        const angle = Phaser.Math.Angle.Between(b.x, b.y, this.player.x, this.player.y);
        b.vx = Math.cos(angle) * this._speed;
        b.vy = Math.sin(angle) * this._speed;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (Phaser.Math.Distance.Between(b.x, b.y, this.player.x, this.player.y) < 16) b.destroy();
      }
      b.angle = (b.angle + 10) % 360;
    }
  }
}
