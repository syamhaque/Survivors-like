import { Enemy } from '../Enemy.js';

export class Ghost extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'ghost', { hp: 50, speed: 80, damage: 12, xpValue: 3, isGhost: true, bodyW: 16, bodyH: 24 });
    this.setAlpha(0.75);
    this._phaseTimer = 0;
  }

  update(delta, player) {
    super.update(delta, player);
    // Gentle pulse opacity
    this._phaseTimer += delta * 0.003;
    this.setAlpha(0.55 + Math.sin(this._phaseTimer) * 0.2);
  }
}
