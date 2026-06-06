import { Enemy } from '../Enemy.js';

export class Bat extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'bat', { hp: 20, speed: 110, damage: 8, xpValue: 1, bodyW: 14, bodyH: 10 });
    this._flapTimer = 0;
  }

  update(delta, player) {
    super.update(delta, player);
    // Slight sine-wave weave
    this._flapTimer += delta * 0.006;
    const perp = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y) + Math.PI / 2;
    this.body.velocity.x += Math.cos(perp) * Math.sin(this._flapTimer) * 40;
    this.body.velocity.y += Math.sin(perp) * Math.sin(this._flapTimer) * 40;
  }
}
