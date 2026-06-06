import { Weapon } from './Weapon.js';

const LEVELS = [
  { damage: 10, cooldown: 1200, speed: 500, pierce: 1, range: 600 },
  { damage: 15, cooldown: 1100, speed: 520, pierce: 1, range: 620 },
  { damage: 20, cooldown: 1000, speed: 540, pierce: 1, range: 650 },
  { damage: 25, cooldown: 900,  speed: 560, pierce: 1, range: 680 },
  { damage: 30, cooldown: 800,  speed: 580, pierce: 2, range: 700 },
  { damage: 35, cooldown: 750,  speed: 600, pierce: 2, range: 720 },
  { damage: 40, cooldown: 700,  speed: 620, pierce: 2, range: 750 },
  { damage: 50, cooldown: 650,  speed: 640, pierce: 3, range: 800 },
];

export class MagicWand extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'magic_wand',
      name: 'Magic Wand',
      description: 'Fires a magic projectile at the nearest enemy.',
      baseCooldown: 1200,
      evolutionId: 'holy_wand',
      requiredPassive: 'empty_tome',
      icon: '🪄',
    });
    this._applyLevel();
  }

  _applyLevel() {
    const l = LEVELS[this.level - 1];
    this.cooldown = l.cooldown;
    this._speed = l.speed;
    this._damage = l.damage;
    this._pierce = l.pierce;
    this._range = l.range;
  }

  onLevelUp() { this._applyLevel(); }

  fire() {
    const target = this.getNearestEnemy();
    const angle = target
      ? Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y)
      : this.player.lastAngle || 0;

    const vx = Math.cos(angle) * this._speed;
    const vy = Math.sin(angle) * this._speed;
    this.spawnBullet(vx, vy, 0x88aaff, 6, this._damage, this._pierce, this._range);
  }

  updateProjectiles(delta) { this._moveBullets(delta); }
}
