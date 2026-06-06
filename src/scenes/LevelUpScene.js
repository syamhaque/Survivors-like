import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export class LevelUpScene extends Phaser.Scene {
  constructor() { super('LevelUp'); }

  init(data) {
    this._choices = data.choices || [];
    this._onPick  = data.onPick;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    // Dim overlay
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.72);

    this.add.text(cx, cy - 200, 'LEVEL UP!', {
      fontSize: '42px', fontFamily: 'monospace', color: '#ffdd44',
      stroke: '#886600', strokeThickness: 5,
    }).setOrigin(0.5);

    this.add.text(cx, cy - 155, 'Choose an upgrade', {
      fontSize: '18px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5);

    const cardW = 220, cardH = 220;
    const gap   = 30;
    const totalW = this._choices.length * cardW + (this._choices.length - 1) * gap;
    const startX = cx - totalW / 2 + cardW / 2;

    this._choices.forEach((choice, i) => {
      const x = startX + i * (cardW + gap);
      this._makeCard(x, cy, cardW, cardH, choice, i);
    });

    // Keyboard shortcut hints
    const keys = ['1', '2', '3'];
    this._choices.forEach((choice, i) => {
      this.input.keyboard.once(`keydown-${keys[i]}`, () => this._pick(i));
    });

    // ESC opens pause without closing this screen
    this.input.keyboard.on('keydown-ESC', () => this._openPause());
    this.input.keyboard.on('keydown-P',   () => this._openPause());
  }

  _makeCard(x, y, w, h, choice, index) {
    const isEvolution = choice.isEvolution;
    const borderColor = isEvolution ? 0xffaa00 : choice.isNew ? 0x44cc44 : 0x4444aa;
    const bg = this.add.rectangle(x, y, w, h, 0x1a1a2e, 1)
      .setStrokeStyle(2, borderColor);

    const icon = this.add.text(x, y - 60, choice.icon || '?', {
      fontSize: '40px', fontFamily: 'monospace',
    }).setOrigin(0.5);

    const nameColor = isEvolution ? '#ffaa00' : choice.isNew ? '#88ffaa' : '#ffffff';
    this.add.text(x, y - 10, choice.name, {
      fontSize: '15px', fontFamily: 'monospace', color: nameColor,
      wordWrap: { width: w - 20 },
    }).setOrigin(0.5);

    if (isEvolution) {
      this.add.text(x, y + 18, 'EVOLUTION', {
        fontSize: '11px', fontFamily: 'monospace', color: '#ffaa00',
      }).setOrigin(0.5);
    } else if (choice.isNew) {
      this.add.text(x, y + 18, 'NEW', {
        fontSize: '11px', fontFamily: 'monospace', color: '#88ffaa',
      }).setOrigin(0.5);
    }

    this.add.text(x, y + 50, choice.description || '', {
      fontSize: '11px', fontFamily: 'monospace', color: '#999999',
      wordWrap: { width: w - 20 }, align: 'center',
    }).setOrigin(0.5);

    this.add.text(x, y + 90, `[${index + 1}]`, {
      fontSize: '16px', fontFamily: 'monospace', color: '#555555',
    }).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on('pointerover',  () => bg.setStrokeStyle(3, 0xffdd44));
    bg.on('pointerout',   () => bg.setStrokeStyle(2, borderColor));
    bg.on('pointerdown',  () => this._pick(index));
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

  _pick(index) {
    if (this._onPick) this._onPick(index);
    this.scene.stop();
    this.scene.resume('Game');
  }
}
