import { Weapon } from './Weapon.js';

const LEVELS = [
  { damage: 20, cooldown: 1800, targets: 1 },
  { damage: 28, cooldown: 1700, targets: 1 },
  { damage: 36, cooldown: 1600, targets: 1 },
  { damage: 45, cooldown: 1500, targets: 2 },
  { damage: 55, cooldown: 1400, targets: 2 },
  { damage: 65, cooldown: 1300, targets: 2 },
  { damage: 75, cooldown: 1200, targets: 3 },
  { damage: 90, cooldown: 1000, targets: 3 },
];

export class LightningRing extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'lightning_ring',
      name: 'Lightning Ring',
      description: 'Zaps random nearby enemies with lightning.',
      baseCooldown: 1800,
      evolutionId: 'thunder_loop',
      requiredPassive: 'attractorb',
      icon: '⚡',
    });
    this._applyLevel();
  }

  _applyLevel() {
    const l = LEVELS[this.level - 1];
    this.cooldown = l.cooldown;
    this._damage = l.damage;
    this._targets = l.targets;
  }

  onLevelUp() { this._applyLevel(); }

  fire() {
    const stats = this.scene.playerStats;
    const cam = this.scene.cameras.main;
    const enemies = this.scene.enemies.getChildren().filter(e =>
      e.active && cam.worldView.contains(e.x, e.y));
    if (!enemies.length) return;

    Phaser.Utils.Array.Shuffle(enemies);
    const targets = enemies.slice(0, this._targets);
    for (const e of targets) {
      e.takeDamage(this._damage * stats.damageMult);
      // Lightning bolt visual: line from player to enemy
      const line = this.scene.add.graphics();
      line.lineStyle(2, 0xffff00, 1);
      line.beginPath();
      line.moveTo(this.player.x, this.player.y);
      // Jagged line
      const steps = 6;
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const lx = this.player.x + (e.x - this.player.x) * t + Phaser.Math.Between(-15, 15);
        const ly = this.player.y + (e.y - this.player.y) * t + Phaser.Math.Between(-15, 15);
        line.lineTo(lx, ly);
      }
      line.lineTo(e.x, e.y);
      line.strokePath();
      line.setDepth(5);
      this.scene.time.delayedCall(120, () => line.destroy());
    }
  }
}
