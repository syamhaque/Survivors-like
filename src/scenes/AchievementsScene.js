import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';

export class AchievementsScene extends Phaser.Scene {
  constructor() { super('Achievements'); }

  create() {
    const cx = GAME_WIDTH / 2;
    this.add.rectangle(cx, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x0a0a18);

    this.add.text(cx, 40, 'ACHIEVEMENTS', {
      fontSize: '36px', fontFamily: 'monospace', color: '#ffdd44',
      stroke: '#886600', strokeThickness: 4,
    }).setOrigin(0.5);

    const unlocked = AchievementSystem.loadUnlocked();
    const all = AchievementSystem.getAll();

    all.forEach((ach, i) => {
      const row = Math.floor(i / 2);
      const col = i % 2;
      const x = col === 0 ? 250 : GAME_WIDTH - 250;
      const y = 120 + row * 80;
      const done = unlocked.has(ach.id);

      const bg = this.add.rectangle(x, y, 440, 68, done ? 0x1a2a1a : 0x1a1a1a)
        .setStrokeStyle(1, done ? 0x44aa44 : 0x333333);

      this.add.text(x - 190, y - 12, `${ach.icon} ${ach.name}`, {
        fontSize: '15px', fontFamily: 'monospace',
        color: done ? '#88ffaa' : '#666666',
      });

      this.add.text(x - 190, y + 10, ach.description, {
        fontSize: '11px', fontFamily: 'monospace',
        color: done ? '#aaaaaa' : '#444444',
      });

      if (done) {
        this.add.text(x + 180, y, '✓', {
          fontSize: '24px', fontFamily: 'monospace', color: '#44ff88',
        }).setOrigin(0.5);
      }
    });

    const back = this.add.text(cx, GAME_HEIGHT - 40, '[ BACK ]', {
      fontSize: '22px', fontFamily: 'monospace', color: '#aaaaaa',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    back.on('pointerover', () => back.setColor('#ffff44'));
    back.on('pointerout',  () => back.setColor('#aaaaaa'));
    back.on('pointerdown', () => this.scene.start('Menu'));

    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Menu'));
  }
}
