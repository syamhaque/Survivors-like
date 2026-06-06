import { Weapon } from '../Weapon.js';

export class Hellfire extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'hellfire',
      name: 'Hellfire',
      description: 'Rains giant fireballs from the sky in all directions.',
      baseCooldown: 1200,
      icon: '☄️',
    });
    this.level = 8;
    this.maxLevel = 8;
    this.evolved = true;
  }

  fire() {
    const stats = this.scene.playerStats;
    const count = 8;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 / count) * i;
      const vx = Math.cos(a) * 250;
      const vy = Math.sin(a) * 250;
      this.spawnBullet(vx, vy, 0xff2200, 14, 200 * stats.damageMult, 999, 1000);
    }
  }

  updateProjectiles(delta) { this._moveBullets(delta); }
}
