import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export class ChestRewardScene extends Phaser.Scene {
  constructor() { super('ChestReward'); }

  init(data) {
    this._rewards = data.rewards || [];
    this._onClose = data.onClose;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72);

    this.add.text(cx, cy - 220, '📦 CHEST OPENED!', {
      fontSize: '38px', fontFamily: 'monospace', color: '#ffcc44',
      stroke: '#886600', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 170, 'You received:', {
      fontSize: '16px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5);

    const cardW = 150, cardH = 200, gap = 20;
    const count = this._rewards.length;
    const totalW = count * cardW + (count - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;

    this._rewards.forEach((r, i) => {
      const x = startX + i * (cardW + gap);
      this._makeCard(x, cy, cardW, cardH, r);
    });

    const continueBtn = this.add.text(cx, cy + 200, '[ CONTINUE ]', {
      fontSize: '28px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#444444', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on('pointerover', () => continueBtn.setColor('#ffff44'));
    continueBtn.on('pointerout',  () => continueBtn.setColor('#ffffff'));
    continueBtn.on('pointerdown', () => this._close());

    this.input.keyboard.once('keydown-SPACE', () => this._close());
    this.input.keyboard.once('keydown-ENTER', () => this._close());

    // ESC opens pause (does not close chest screen)
    this.input.keyboard.on('keydown-ESC', () => this._openPause());
    this.input.keyboard.on('keydown-P',   () => this._openPause());
  }

  _makeCard(x, y, w, h, reward) {
    const isEvolution = reward.isEvolution;
    const isHpXp = reward.type === 'hp' || reward.type === 'xp';
    const borderColor = isEvolution ? 0xffaa00 : reward.isNew ? 0x44cc44 : isHpXp ? 0x228844 : 0x4444aa;

    this.add.rectangle(x, y, w, h, 0x1a1a2e).setStrokeStyle(2, borderColor);

    this.add.text(x, y - 60, reward.icon || '?', {
      fontSize: '34px', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const nameColor = isEvolution ? '#ffaa00' : reward.isNew ? '#88ffaa' : isHpXp ? '#88ffaa' : '#ffffff';
    this.add.text(x, y - 10, reward.name, {
      fontSize: '12px', fontFamily: 'monospace', color: nameColor,
      wordWrap: { width: w - 12 }, align: 'center',
    }).setOrigin(0.5);

    // Type tag — no level display
    let tag = '', tagColor = '#888888';
    if (isEvolution) { tag = 'EVOLUTION'; tagColor = '#ffaa00'; }
    else if (reward.isNew) { tag = 'NEW'; tagColor = '#88ffaa'; }
    else if (isHpXp) { tag = 'BONUS'; tagColor = '#88ffaa'; }

    if (tag) {
      this.add.text(x, y + 20, tag, {
        fontSize: '10px', fontFamily: 'monospace', color: tagColor,
      }).setOrigin(0.5);
    }

    if (reward.description) {
      this.add.text(x, y + 52, reward.description, {
        fontSize: '10px', fontFamily: 'monospace', color: '#777777',
        wordWrap: { width: w - 12 }, align: 'center',
      }).setOrigin(0.5);
    }
  }

  _openPause() {
    const gameScene = this.scene.get('Game');
    if (!gameScene) return;
    this.scene.launch('Pause', {
      isOverlay:   true,
      player:      gameScene.player,
      playerStats: gameScene.playerStats,
      weapons:     gameScene.weapons,
      equipment:   gameScene.equipment,
      elapsed:     gameScene._elapsed,
      killCount:   gameScene._killCount,
      level:       gameScene.xpSystem?.level || 1,
      extraStats:  gameScene._extraStats,
    });
  }

  _close() {
    if (this._onClose) this._onClose();
    this.scene.stop();
    this.scene.resume('Game');
  }
}
