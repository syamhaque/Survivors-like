import { Enemy } from '../Enemy.js';

export class Skeleton extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'skeleton', { hp: 60, speed: 75, damage: 14, xpValue: 3, bodyW: 16, bodyH: 26 });
  }
}
