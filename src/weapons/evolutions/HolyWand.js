import { Weapon } from '../Weapon.js';

export class HolyWand extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'holy_wand',
      name: 'Holy Wand',
      description: 'Fires two piercing holy bolts at the nearest enemy.',
      baseCooldown: 500,
      icon: '✨',
    });
    this.level = 8;
    this.maxLevel = 8;
    this.evolved = true;
  }

  fire() {
    const stats = this.scene.playerStats;
    const target = this.getNearestEnemy();
    const angle = target
      ? Phaser.Math.Angle.Between(this.player.x, this.player.y, target.x, target.y)
      : this.player.lastAngle || 0;
    for (const off of [-0.12, 0.12]) {
      const a = angle + off;
      this.spawnBullet(Math.cos(a) * 600, Math.sin(a) * 600, 0xffffff, 7, 80 * stats.damageMult, 999, 900);
    }
  }

  updateProjectiles(delta) { this._moveBullets(delta); }
}
