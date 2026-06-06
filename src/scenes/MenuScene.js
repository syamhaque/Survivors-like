import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export class MenuScene extends Phaser.Scene {
  constructor() { super('Menu'); }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x0d0d1a);

    this.add.text(cx, cy - 140, 'SURVIVORS-LIKE', {
      fontSize: '52px', fontFamily: 'monospace', color: '#ff3333',
      stroke: '#880000', strokeThickness: 6,
    }).setOrigin(0.5);

    const playBtn = this.add.text(cx, cy + 20, '[ PLAY ]', {
      fontSize: '36px', fontFamily: 'monospace', color: '#ffffff',
      stroke: '#444444', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    playBtn.on('pointerover', () => playBtn.setColor('#ffff44'));
    playBtn.on('pointerout',  () => playBtn.setColor('#ffffff'));
    playBtn.on('pointerdown', () => this.scene.start('Game'));

    const achBtn = this.add.text(cx, cy + 90, '[ ACHIEVEMENTS ]', {
      fontSize: '22px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    achBtn.on('pointerover', () => achBtn.setColor('#ffff44'));
    achBtn.on('pointerout',  () => achBtn.setColor('#aaaaaa'));
    achBtn.on('pointerdown', () => this.scene.start('Achievements'));

    const codexBtn = this.add.text(cx, cy + 135, '[ CODEX ]', {
      fontSize: '22px', fontFamily: 'monospace', color: '#88ccff',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    codexBtn.on('pointerover', () => codexBtn.setColor('#ffff44'));
    codexBtn.on('pointerout',  () => codexBtn.setColor('#88ccff'));
    codexBtn.on('pointerdown', () => this.scene.start('Codex'));

    // Random LevelUp toggle
    const rlKey = 'survivors_like_random_levelup';
    let rlOn = localStorage.getItem(rlKey) === '1';

    const rlBtn = this.add.text(cx, cy + 190, `[ AUTO LEVEL-UP: ${rlOn ? 'ON ' : 'OFF'} ]`, {
      fontSize: '18px', fontFamily: 'monospace',
      color: rlOn ? '#88ff44' : '#666666',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    const rlHint = this.add.text(cx, cy + 215, 'Skip level-up screens — auto picks a random upgrade', {
      fontSize: '11px', fontFamily: 'monospace', color: '#444455',
    }).setOrigin(0.5);

    const refreshRlBtn = () => {
      rlBtn.setText(`[ AUTO LEVEL-UP: ${rlOn ? 'ON ' : 'OFF'} ]`);
      rlBtn.setColor(rlOn ? '#88ff44' : '#666666');
    };

    rlBtn.on('pointerover', () => rlBtn.setColor('#ffff44'));
    rlBtn.on('pointerout',  () => rlBtn.setColor(rlOn ? '#88ff44' : '#666666'));
    rlBtn.on('pointerdown', () => {
      rlOn = !rlOn;
      localStorage.setItem(rlKey, rlOn ? '1' : '0');
      refreshRlBtn();
    });

    this.add.text(cx, GAME_HEIGHT - 30, 'WASD / Arrow keys to move  •  ESC to pause', {
      fontSize: '13px', fontFamily: 'monospace', color: '#444455',
    }).setOrigin(0.5);

    this.input.keyboard.once('keydown-SPACE', () => this.scene.start('Game'));
    this.input.keyboard.once('keydown-ENTER', () => this.scene.start('Game'));
  }
}
