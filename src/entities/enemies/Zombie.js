import { Enemy } from '../Enemy.js';

export class Zombie extends Enemy {
  constructor(scene, x, y) {
    super(scene, x, y, 'zombie', { hp: 160, speed: 48, damage: 22, xpValue: 6, bodyW: 20, bodyH: 28 });
  }
}
