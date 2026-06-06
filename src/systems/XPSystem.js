import { LEVEL_THRESHOLDS, XP_ATTRACT_SPEED, XP_ORB_DRIFT_SPEED } from '../constants.js';

export class XPSystem {
  constructor(scene, player) {
    this.scene = scene;
    this.player = player;
    this.xp = 0;
    this.level = 1;
    this.orbs = scene.physics.add.group();
  }

  spawnOrb(x, y, value) {
    const orb = this.scene.add.circle(x, y, 5, 0x44ff88);
    this.scene.physics.add.existing(orb);
    orb.body.setVelocity(
      Phaser.Math.Between(-30, 30) * XP_ORB_DRIFT_SPEED / 20,
      Phaser.Math.Between(-30, 30) * XP_ORB_DRIFT_SPEED / 20,
    );
    orb.xpValue = value;
    orb.setDepth(4);
    this.orbs.add(orb);
  }

  update(delta, pickupRadius) {
    for (const orb of this.orbs.getChildren()) {
      if (!orb.active) continue;
      const dist = Phaser.Math.Distance.Between(orb.x, orb.y, this.player.x, this.player.y);
      if (dist <= pickupRadius) {
        const angle = Phaser.Math.Angle.Between(orb.x, orb.y, this.player.x, this.player.y);
        const spd = XP_ATTRACT_SPEED + (1 - dist / pickupRadius) * 200;
        orb.body.setVelocity(Math.cos(angle) * spd, Math.sin(angle) * spd);
      }
      if (dist < 12) {
        this._collect(orb);
      }
    }
  }

  // Dynamic threshold — extrapolates beyond the hard-coded table
  _getThreshold(level) {
    if (level < LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[level];
    const last = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const prev = LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 2];
    const step = last - prev; // ~200 per level near the end
    return last + step * (level - LEVEL_THRESHOLDS.length + 1);
  }

  _collect(orb) {
    this.xp += orb.xpValue;
    orb.destroy();
    this._checkLevelThreshold();
  }

  // Also called after manually bumping this.xp (chicken/chest XP rewards)
  _checkLevelThreshold() {
    const threshold = this._getThreshold(this.level);
    if (this.xp >= threshold) {
      this.level++;
      this.scene.events.emit('level-up', this.level);
    }
  }

  getProgress() {
    const prev = this.level > 0 ? this._getThreshold(this.level - 1) : 0;
    const next = this._getThreshold(this.level);
    const range = next - prev;
    return range > 0 ? Math.min(1, (this.xp - prev) / range) : 1;
  }
}
