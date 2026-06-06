import { Enemy } from '../Enemy.js';

export class Reaper extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'reaper', { hp: Infinity, speed: 220, damage: 9999, xpValue: 0, bodyW: 26, bodyH: 36 });
    this.setDepth(15);
    this.setTint(0x880000);
    this.bypassDefense = true;
  }

  takeDamage() {
    // Unkillable
  }

  _die() {
    // Cannot die
  }
}
