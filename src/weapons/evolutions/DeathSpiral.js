import { Weapon } from '../Weapon.js';

export class DeathSpiral extends Weapon {
  constructor(scene, player) {
    super(scene, player, {
      id: 'death_spiral',
      name: 'Death Spiral',
      description: 'Axes orbit you, dealing massive damage.',
      baseCooldown: 100,
      icon: '🌀',
    });
    this.level = 8;
    this.maxLevel = 8;
    this.evolved = true;
    this._orbitAngle = 0;
    this._orbitAxes = [];
    for (let i = 0; i < 4; i++) {
      const ax = scene.add.rectangle(player.x, player.y, 14, 10, 0xcc8844);
      this._orbitAxes.push({ obj: ax, angleOffset: (Math.PI * 2 / 4) * i });
    }
  }

  update(delta) {
    const stats = this.scene.playerStats;
    this._orbitAngle += delta * 0.003;
    const r = 90 * stats.areaMult;
    for (const ax of this._orbitAxes) {
      const a = this._orbitAngle + ax.angleOffset;
      ax.obj.setPosition(this.player.x + Math.cos(a) * r, this.player.y + Math.sin(a) * r);
      ax.obj.setAngle(Phaser.Math.RadToDeg(a));
      ax.obj.setDepth(3);
    }
    // Damage enemies near each axe
    this.timer += delta;
    if (this.timer >= this.cooldown * stats.cooldownMult) {
      this.timer = 0;
      this.fire();
    }
  }

  fire() {
    const stats = this.scene.playerStats;
    for (const ax of this._orbitAxes) {
      for (const e of this.scene.enemies.getChildren()) {
        if (!e.active) continue;
        const d = Phaser.Math.Distance.Between(ax.obj.x, ax.obj.y, e.x, e.y);
        if (d < 24) e.takeDamage(110 * stats.damageMult);
      }
    }
  }

  destroy() {
    super.destroy();
    for (const ax of this._orbitAxes) ax.obj.destroy();
  }
}
