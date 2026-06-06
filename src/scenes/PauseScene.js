import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

export class PauseScene extends Phaser.Scene {
  constructor() { super('Pause'); }

  init(data) {
    this._player      = data.player;
    this._playerStats = data.playerStats;
    this._weapons     = data.weapons     || [];
    this._equipment   = data.equipment   || [];
    this._elapsed     = data.elapsed     || 0;
    this._killCount   = data.killCount   || 0;
    this._level       = data.level       || 1;
    this._extraStats  = data.extraStats  || {};
    this._isOverlay   = data.isOverlay   || false; // true when launched on top of LevelUp/ChestReward
  }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;
    const W  = 900, H = 560;

    // Backdrop
    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.6);
    this.add.rectangle(cx, cy, W, H, 0x0d0d22, 1).setStrokeStyle(2, 0x4455aa);

    this.add.text(cx, cy - H / 2 + 24, 'PAUSED', {
      fontSize: '32px', fontFamily: 'monospace', color: '#ffdd44',
      stroke: '#886600', strokeThickness: 4,
    }).setOrigin(0.5);

    this._drawStats(cx - W / 2 + 24, cy - H / 2 + 60);
    this._drawLoadout(cx + 40, cy - H / 2 + 60);

    // Run summary bar
    const ms = this._elapsed;
    const m  = Math.floor(ms / 60000);
    const s  = Math.floor((ms % 60000) / 1000);
    this.add.text(cx, cy + H / 2 - 70,
      `Time: ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}   ` +
      `Level: ${this._level}   Kills: ${this._killCount}`,
      { fontSize: '14px', fontFamily: 'monospace', color: '#aaaaaa' }).setOrigin(0.5);

    // Buttons
    const resumeBtn = this.add.text(cx + 110, cy + H / 2 - 30, '[ RESUME ]', {
      fontSize: '24px', fontFamily: 'monospace', color: '#88ff88',
      stroke: '#004400', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    resumeBtn.on('pointerover', () => resumeBtn.setColor('#ffff44'));
    resumeBtn.on('pointerout',  () => resumeBtn.setColor('#88ff88'));
    resumeBtn.on('pointerdown', () => this._resume());

    const quitBtn = this.add.text(cx - 110, cy + H / 2 - 30, '[ QUIT RUN ]', {
      fontSize: '24px', fontFamily: 'monospace', color: '#ff6666',
      stroke: '#440000', strokeThickness: 3,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    quitBtn.on('pointerover', () => quitBtn.setColor('#ffff44'));
    quitBtn.on('pointerout',  () => quitBtn.setColor('#ff6666'));
    quitBtn.on('pointerdown', () => this._quit());

    this.input.keyboard.once('keydown-ESC', () => this._resume());
    this.input.keyboard.once('keydown-P',   () => this._resume());
  }

  _resume() {
    this.scene.stop();
    if (!this._isOverlay) {
      this.scene.resume('Game');
    }
  }

  _quit() {
    const gameScene = this.scene.get('Game');
    if (gameScene?.quitRun) {
      gameScene.quitRun();
    } else {
      // Fallback
      this.scene.stop();
      if (!this._isOverlay) this.scene.resume('Game');
    }
  }

  _drawStats(x, y) {
    const stats  = this._playerStats;
    const eq     = this._equipment;
    const extra  = this._extraStats;
    const player = this._player;

    const title = (t) => { this.add.text(x, y, t, { fontSize: '13px', fontFamily: 'monospace', color: '#ffdd44' }); };
    const row = (label, val, note = '') => {
      this.add.text(x, y, label, { fontSize: '12px', fontFamily: 'monospace', color: '#cccccc' });
      this.add.text(x + 180, y, val, { fontSize: '12px', fontFamily: 'monospace', color: '#ffffff' });
      if (note) this.add.text(x + 280, y, note, { fontSize: '11px', fontFamily: 'monospace', color: '#888888' });
      y += 22;
    };
    const divider = () => { y += 6; };

    title('📊 STATS'); y += 22;
    this.add.text(x, y, '─'.repeat(30), { fontSize: '11px', fontFamily: 'monospace', color: '#444455' }); y += 14;

    // HP
    row('HP:', `${Math.ceil(player.hp)} / ${player.maxHp}`);

    // Move speed
    const speedPct = Math.round((stats.speedMult - 1) * 100);
    const wings = eq.find(e => e.id === 'wings');
    row('Move Speed:', speedPct >= 0 ? `+${speedPct}%` : `${speedPct}%`, wings ? `Wings L${wings.level}` : '');

    // Damage
    const dmgPct = Math.round((stats.damageMult - 1) * 100);
    const spinach = eq.find(e => e.id === 'spinach');
    row('Damage:', dmgPct >= 0 ? `+${dmgPct}%` : `${dmgPct}%`, spinach ? `Spinach L${spinach.level}` : '');

    // Defense — show as positive "damage reduction"
    const defPct = Math.round((1 - stats.defMult) * 100);
    const armor = eq.find(e => e.id === 'armor');
    row('Defense:', defPct > 0 ? `+${defPct}% dmg reduction` : '—', armor ? `Armor L${armor.level}` : '');

    // Cooldown
    const cdPct = Math.round((1 - stats.cooldownMult) * 100);
    const tome = eq.find(e => e.id === 'empty_tome');
    row('Cooldown:', cdPct > 0 ? `-${cdPct}%` : '—', tome ? `Empty Tome L${tome.level}` : '');

    // Area
    const areaPct = Math.round((stats.areaMult - 1) * 100);
    const cande = eq.find(e => e.id === 'candelabrador');
    row('Area:', areaPct > 0 ? `+${areaPct}%` : '—', cande ? `Candelabrador L${cande.level}` : '');

    // Pickup radius
    const pickPct = Math.round((stats.pickupMult - 1) * 100);
    const attract = eq.find(e => e.id === 'attractorb');
    row('Pickup Range:', pickPct > 0 ? `+${pickPct}%` : '—', attract ? `Attractorb L${attract.level}` : '');

    // Extra stat boosts
    const extraKeys = Object.keys(extra).filter(k => Math.abs(extra[k] - 1) > 0.001);
    if (extraKeys.length > 0) {
      divider();
      this.add.text(x, y, '✨ BONUS BOOSTS', { fontSize: '11px', fontFamily: 'monospace', color: '#aaaaff' }); y += 18;
      const LABEL = { damageMult: 'Damage', speedMult: 'Speed', cooldownMult: 'Cooldown', areaMult: 'Area', pickupMult: 'Pickup', defMult: 'Defense' };
      for (const k of extraKeys) {
        let pct, display;
        if (k === 'defMult' || k === 'cooldownMult') {
          // These get smaller = better; show as positive reduction
          pct = Math.round((1 - extra[k]) * 100);
          display = pct > 0 ? `+${pct}%` : `${pct}%`;
        } else {
          pct = Math.round((extra[k] - 1) * 100);
          display = pct >= 0 ? `+${pct}%` : `${pct}%`;
        }
        row(`${LABEL[k] ?? k}:`, display);
      }
    }
  }

  _drawLoadout(x, y) {
    this.add.text(x, y, '⚔ WEAPONS', { fontSize: '13px', fontFamily: 'monospace', color: '#ffdd44' }); y += 22;
    this.add.text(x, y, '─'.repeat(24), { fontSize: '11px', fontFamily: 'monospace', color: '#444455' }); y += 14;

    for (const w of this._weapons) {
      const tag = w.evolved ? 'EVOLVED' : `L${w.level}`;
      const color = w.evolved ? '#ffaa00' : '#ffffff';
      this.add.text(x, y, `${w.icon} ${w.name}`, { fontSize: '12px', fontFamily: 'monospace', color });
      this.add.text(x + 220, y, tag, { fontSize: '11px', fontFamily: 'monospace', color: w.evolved ? '#ffaa00' : '#888888' });
      y += 20;
    }

    y += 12;
    this.add.text(x, y, '🎒 EQUIPMENT', { fontSize: '13px', fontFamily: 'monospace', color: '#cc88ff' }); y += 22;
    this.add.text(x, y, '─'.repeat(24), { fontSize: '11px', fontFamily: 'monospace', color: '#444455' }); y += 14;

    for (const e of this._equipment) {
      this.add.text(x, y, `${e.icon} ${e.name}`, { fontSize: '12px', fontFamily: 'monospace', color: '#ddaaff' });
      this.add.text(x + 220, y, `L${e.level}`, { fontSize: '11px', fontFamily: 'monospace', color: '#888888' });
      y += 20;
    }
  }
}
