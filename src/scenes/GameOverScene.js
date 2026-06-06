import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOver'); }

  init(data) {
    this._won     = data.won || false;
    this._stats   = data.stats || {};
    this._level   = data.level || 1;
    this._elapsed = data.elapsed || 0;
    this._kills   = data.kills || 0;
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.92);

    const title = this._won ? '⏱️ YOU SURVIVED!' : '💀 YOU DIED';
    const titleColor = this._won ? '#ffdd44' : '#ff3333';
    this.add.text(cx, cy - 160, title, {
      fontSize: '46px', fontFamily: 'monospace', color: titleColor,
      stroke: '#000000', strokeThickness: 5,
    }).setOrigin(0.5);

    const ms = this._elapsed;
    const m = Math.floor(ms / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    const timeStr = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;

    const lines = [
      `Time survived: ${timeStr}`,
      `Level reached: ${this._level}`,
      `Enemies killed: ${this._kills}`,
      `Chests opened: ${this._stats.chestsOpened || 0}`,
      `Chickens eaten: ${this._stats.chickensEaten || 0}`,
      `Evolutions: ${this._stats.evolutionsObtained || 0}`,
    ];

    lines.forEach((line, i) => {
      this.add.text(cx, cy - 70 + i * 32, line, {
        fontSize: '18px', fontFamily: 'monospace', color: '#cccccc',
      }).setOrigin(0.5);
    });

    const playAgain = this.add.text(cx, cy + 140, '[ PLAY AGAIN ]', {
      fontSize: '28px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#444444', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playAgain.on('pointerover', () => playAgain.setColor('#ffff44'));
    playAgain.on('pointerout',  () => playAgain.setColor('#ffffff'));
    playAgain.on('pointerdown', () => this.scene.start('Game'));

    const menu = this.add.text(cx, cy + 190, '[ MAIN MENU ]', {
      fontSize: '20px', fontFamily: 'monospace', color: '#888888',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    menu.on('pointerover', () => menu.setColor('#ffff44'));
    menu.on('pointerout',  () => menu.setColor('#888888'));
    menu.on('pointerdown', () => this.scene.start('Menu'));

    this.input.keyboard.once('keydown-R', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'));
  }
}
