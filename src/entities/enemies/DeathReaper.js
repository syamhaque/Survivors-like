import { Enemy } from '../Enemy.js';
import { WORLD_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../../constants.js';

// Killable Death Reaper — spawns during the final minute (30:00–31:00).
export class DeathReaper extends Enemy {
  constructor(scene, x, y, wave = 1) {
    const scale = 1 + (wave - 1) * 0.3;
    super(scene, x, y, 'reaper', {
      hp:       Math.round(8000 * scale),
      speed:    220,
      damage:   60,
      xpValue:  200,
      bodyW:    28,
      bodyH:    38,
    });

    this.isDeathReaper = true;
    this.isBoss = false;
    this.setScale(1.8);
    this.setTint(0x880000);
    this.setDepth(12);

    this._hpBarBg.setSize(56, 6);
    this._hpBarFg.setSize(56, 6);
  }

  update(delta, player) {
    super.update(delta, player);
    this._teleportIfNeeded(player);
  }

  _updateHpBar() {
    const pct = this.hp / this.maxHp;
    this._hpBarBg.setPosition(this.x - 28, this.y - 38);
    this._hpBarFg.setPosition(this.x - 28, this.y - 38);
    this._hpBarFg.setSize(56 * pct, 6);
    this._hpBarFg.setFillStyle(0xff0000);
  }

  _teleportIfNeeded(player) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist > 1000) this._placeNearPlayer(player);
  }

  _placeNearPlayer(player) {
    const cam = this.scene.cameras.main;
    const margin = 90;
    const side = Phaser.Math.Between(0, 3);
    let x, y;
    if (side === 0)      { x = Phaser.Math.Between(cam.scrollX, cam.scrollX + GAME_WIDTH); y = cam.scrollY - margin; }
    else if (side === 1) { x = Phaser.Math.Between(cam.scrollX, cam.scrollX + GAME_WIDTH); y = cam.scrollY + GAME_HEIGHT + margin; }
    else if (side === 2) { x = cam.scrollX - margin; y = Phaser.Math.Between(cam.scrollY, cam.scrollY + GAME_HEIGHT); }
    else                 { x = cam.scrollX + GAME_WIDTH + margin; y = Phaser.Math.Between(cam.scrollY, cam.scrollY + GAME_HEIGHT); }
    this.setPosition(
      Phaser.Math.Clamp(x, 0, WORLD_SIZE),
      Phaser.Math.Clamp(y, 0, WORLD_SIZE),
    );
  }
}
