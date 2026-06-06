import { Weapon } from './Weapon.js';

const LEVELS = [
  { damage: 50,  cooldown: 3000, speed: 300, radius: 10 },
  { damage: 70,  cooldown: 2800, speed: 310, radius: 11 },
  { damage: 90,  cooldown: 2600, speed: 320, radius: 12 },
  { damage: 115, cooldown: 2400, speed: 330, radius: 13 },
  { damage: 140, cooldown: 2200, speed: 340, radius: 14 },
  { damage: 170, cooldown: 2000, speed: 350, radius: 15 },
  { damage: 200, cooldown: 1800, speed: 360, radius: 16 },
  { damage: 240, cooldown: 1600, speed: 380, radius: 18 },
];

export class FireWand extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'fire_wand',
      name: 'Fire Wand',
      description: 'Launches a slow, devastating fireball.',
      baseCooldown: 3000,
      evolutionId: 'hellfire',
      requiredPassive: 'spinach',
      icon: '🔥',
    });
    this._applyLevel();
  }

  _applyLevel() {
    const l = LEVELS[this.level - 1];
    this.cooldown = l.cooldown;
    this._damage = l.damage;
    this._speed = l.speed;
    this._radius = l.radius;
  }

  onLevelUp() { this._applyLevel(); }

  fire() {
    const target = this.getNearestEnemy();
    const angle = target
      ? Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y)
      : this.player.lastAngle || 0;
    const vx = Math.cos(angle) * this._speed;
    const vy = Math.sin(angle) * this._speed;
    this.spawnBullet(vx, vy, 0xff4400, this._radius, this._damage, 1, 900);
  }

  updateProjectiles(delta) { this._moveBullets(delta); }
}
