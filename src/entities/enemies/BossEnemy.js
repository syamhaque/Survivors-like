import { Enemy } from '../Enemy.js';
import { WORLD_SIZE, GAME_WIDTH, GAME_HEIGHT } from '../../constants.js';

export class BossEnemy extends Enemy {
  constructor(scene, x, y, bossNumber = 1, rewardCount = 3) {
    const scale = 1 + (bossNumber - 1) * 0.4;
    super(scene, x, y, 'zombie', {
      hp:      Math.round(1800 * scale),
      speed:   32,
      damage:  35,
      xpValue: 40 * bossNumber,
      bodyW:   48,
      bodyH:   60,
    });

    this.isBoss      = true;
    this.bossNumber  = bossNumber;
    this.rewardCount = rewardCount;

    this.setScale(2.2);
    this.setTint(0xcc2222);
    this.setDepth(8);

    this._hpBarBg.setSize(56, 6);
    this._hpBarFg.setSize(56, 6);
  }

  update(delta, player) {
    super.update(delta, player);
    this._teleportIfNeeded(player);
  }

  _teleportIfNeeded(player) {
    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    if (dist > 1200) this._placeNearPlayer();
  }

  _placeNearPlayer() {
    const cam    = this.scene.cameras.main;
    const margin = 90;
    const side   = Phaser.Math.Between(0, 3);
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

  _updateHpBar() {
    const pct = this.hp / this.maxHp;
    this._hpBarBg.setPosition(this.x - 28, this.y - 40);
    this._hpBarFg.setPosition(this.x - 28, this.y - 40);
    this._hpBarFg.setSize(56 * pct, 6);
    this._hpBarFg.setFillStyle(pct > 0.5 ? 0xff6600 : pct > 0.25 ? 0xff3300 : 0xff0000);
  }
}
