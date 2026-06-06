import { GAME_WIDTH, GAME_HEIGHT } from '../constants.js';

const WEAPON_DATA = [
  { icon: '🪄', name: 'Magic Wand',    desc: 'Fires a fast projectile at the nearest enemy. High fire rate.',   evo: 'Holy Wand',    evoReq: 'Empty Tome' },
  { icon: '🧄', name: 'Garlic',        desc: 'Emits a damaging aura around you, dealing AoE each pulse.',       evo: 'Soul Eater',   evoReq: 'Pummarola' },
  { icon: '⚡', name: 'Lightning Ring', desc: 'Zaps random on-screen enemies. Hits multiple targets.',          evo: 'Thunder Loop', evoReq: 'Attractorb' },
  { icon: '🪓', name: 'Axe',           desc: 'Throws axes in a high arc. Deals heavy damage.',                  evo: 'Death Spiral', evoReq: 'Candelabrador' },
  { icon: '🔥', name: 'Fire Wand',     desc: 'Fires a slow but devastating fireball at nearest enemy.',          evo: 'Hellfire',     evoReq: 'Spinach' },
  { icon: '✝️', name: 'Cross',         desc: 'Throws a boomerang cross that returns to you.',                   evo: 'Heaven Sword', evoReq: 'Wings' },
];

const EQUIP_DATA = [
  { icon: '🥬', name: 'Spinach',        stat: '+10% damage',          note: 'per level, max L5. Enables Hellfire evolution.' },
  { icon: '🛡️', name: 'Armor',          stat: '-8% damage taken',     note: 'per level, max L5. Enables Soul Eater evolution.' },
  { icon: '🦋', name: 'Wings',          stat: '+8% move speed',        note: 'per level, max L5. Enables Heaven Sword evolution.' },
  { icon: '📖', name: 'Empty Tome',     stat: '-8% weapon cooldowns',  note: 'per level, max L5. Enables Holy Wand evolution.' },
  { icon: '🕯️', name: 'Candelabrador', stat: '+10% attack area',      note: 'per level, max L5. Enables Death Spiral evolution.' },
  { icon: '🔮', name: 'Attractorb',     stat: '+30% pickup radius',    note: 'per level, max L5. Enables Thunder Loop evolution.' },
];

const ENEMY_DATA = [
  { icon: '🦇', name: 'Bat',          hp: 20,    speed: 110,  dmg: 8,    note: 'Spawns from the start.' },
  { icon: '💀', name: 'Skeleton',     hp: 60,    speed: 75,   dmg: 14,   note: 'Appears around 2:00.' },
  { icon: '👻', name: 'Ghost',        hp: 50,    speed: 80,   dmg: 12,   note: 'Appears around 5:00.' },
  { icon: '🧟', name: 'Zombie',       hp: 160,   speed: 48,   dmg: 22,   note: 'Appears around 8:00.' },
  { icon: '⚠️', name: 'Boss',         hp: 1800,  speed: 32,   dmg: 35,   note: 'Appears every ~5 min. Drops a chest.' },
  { icon: '💀', name: 'Death Reaper', hp: 8000,  speed: 220,  dmg: 60,   note: 'Appears at 30:00. Respawns until 31:00.' },
  { icon: '☠️', name: 'Reaper',       hp: '∞',   speed: 220,  dmg: '∞',  note: 'Appears at 31:00. Unkillable. One-shots you.' },
];

export class CodexScene extends Phaser.Scene {
  constructor() { super('Codex'); }

  create() {
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    this.add.rectangle(cx, cy, GAME_WIDTH, GAME_HEIGHT, 0x080814);

    this.add.text(cx, 28, '📖 CODEX', {
      fontSize: '32px', fontFamily: 'monospace', color: '#88ccff',
      stroke: '#002244', strokeThickness: 4,
    }).setOrigin(0.5);

    // Tab state
    this._tab = 'weapons';
    this._tabContents = [];

    // Tab buttons
    const tabs = [
      { key: 'weapons',   label: '⚔  WEAPONS',   x: cx - 260 },
      { key: 'equipment', label: '🎒 EQUIPMENT',  x: cx },
      { key: 'enemies',   label: '👾 ENEMIES',    x: cx + 260 },
    ];

    this._tabBtns = {};
    for (const t of tabs) {
      const btn = this.add.text(t.x, 72, t.label, {
        fontSize: '16px', fontFamily: 'monospace',
        color: t.key === 'weapons' ? '#ffffff' : '#666666',
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      btn.on('pointerover', () => { if (this._tab !== t.key) btn.setColor('#ffff44'); });
      btn.on('pointerout',  () => { if (this._tab !== t.key) btn.setColor('#666666'); });
      btn.on('pointerdown', () => this._switchTab(t.key));
      this._tabBtns[t.key] = btn;
    }

    // Divider
    this.add.rectangle(cx, 90, GAME_WIDTH - 60, 1, 0x334466).setOrigin(0.5);

    // Content container (cleared on tab switch)
    this._contentY = 108;
    this._showWeapons();

    // Back button
    const back = this.add.text(cx, GAME_HEIGHT - 30, '[ BACK TO MENU ]', {
      fontSize: '20px', fontFamily: 'monospace', color: '#aaaaaa',
      stroke: '#222222', strokeThickness: 2,
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    back.on('pointerover', () => back.setColor('#ffff44'));
    back.on('pointerout',  () => back.setColor('#aaaaaa'));
    back.on('pointerdown', () => this.scene.start('Menu'));
    this.input.keyboard.once('keydown-ESC', () => this.scene.start('Menu'));
  }

  _switchTab(key) {
    if (this._tab === key) return;
    this._tab = key;

    // Update button colors
    for (const [k, btn] of Object.entries(this._tabBtns)) {
      btn.setColor(k === key ? '#ffffff' : '#666666');
    }

    // Destroy old content
    for (const obj of this._tabContents) {
      if (obj?.active) obj.destroy();
    }
    this._tabContents = [];

    if (key === 'weapons')   this._showWeapons();
    else if (key === 'equipment') this._showEquipment();
    else if (key === 'enemies')   this._showEnemies();
  }

  _add(obj) {
    this._tabContents.push(obj);
    return obj;
  }

  _showWeapons() {
    const startY = this._contentY;
    const colW = (GAME_WIDTH - 80) / 2;
    const cx = GAME_WIDTH / 2;

    // Header row
    this._add(this.add.text(40, startY, 'WEAPON', { fontSize: '11px', fontFamily: 'monospace', color: '#ffdd44' }));
    this._add(this.add.text(40 + colW * 0.45, startY, 'DESCRIPTION', { fontSize: '11px', fontFamily: 'monospace', color: '#ffdd44' }));
    this._add(this.add.text(40 + colW * 0.45 + 280, startY, 'EVOLUTION → REQUIRES', { fontSize: '11px', fontFamily: 'monospace', color: '#ffdd44' }));

    let y = startY + 18;
    this._add(this.add.rectangle(cx, y, GAME_WIDTH - 40, 1, 0x334466).setOrigin(0.5));
    y += 8;

    for (const w of WEAPON_DATA) {
      this._add(this.add.text(40, y, `${w.icon} ${w.name}`, {
        fontSize: '13px', fontFamily: 'monospace', color: '#ffffff',
      }));
      this._add(this.add.text(40 + colW * 0.45, y, w.desc, {
        fontSize: '11px', fontFamily: 'monospace', color: '#aaaaaa',
        wordWrap: { width: 270 },
      }));
      this._add(this.add.text(40 + colW * 0.45 + 280, y, `⚗️ ${w.evo}`, {
        fontSize: '11px', fontFamily: 'monospace', color: '#ffaa00',
      }));
      this._add(this.add.text(40 + colW * 0.45 + 280, y + 16, `   + ${w.evoReq}`, {
        fontSize: '10px', fontFamily: 'monospace', color: '#888855',
      }));
      y += 48;
      this._add(this.add.rectangle(cx, y - 4, GAME_WIDTH - 80, 1, 0x223344).setOrigin(0.5));
    }
  }

  _showEquipment() {
    const startY = this._contentY;
    const cx = GAME_WIDTH / 2;

    this._add(this.add.text(cx, startY, 'EQUIPMENT', {
      fontSize: '11px', fontFamily: 'monospace', color: '#ffdd44',
    }).setOrigin(0.5));

    let y = startY + 20;
    this._add(this.add.rectangle(cx, y, GAME_WIDTH - 40, 1, 0x334466).setOrigin(0.5));
    y += 14;

    for (const e of EQUIP_DATA) {
      const rowBg = this._add(this.add.rectangle(cx, y + 20, GAME_WIDTH - 60, 44, 0x111122, 0.6).setOrigin(0.5));

      this._add(this.add.text(60, y + 8, `${e.icon} ${e.name}`, {
        fontSize: '14px', fontFamily: 'monospace', color: '#ddaaff',
      }));
      this._add(this.add.text(260, y + 8, e.stat, {
        fontSize: '13px', fontFamily: 'monospace', color: '#88ff88',
      }));
      this._add(this.add.text(60, y + 26, e.note, {
        fontSize: '10px', fontFamily: 'monospace', color: '#666688',
        wordWrap: { width: GAME_WIDTH - 120 },
      }));
      y += 56;
    }
  }

  _showEnemies() {
    const startY = this._contentY;
    const cx = GAME_WIDTH / 2;

    // Column headers
    const headers = [
      { label: 'ENEMY', x: 60 }, { label: 'HP', x: 280 },
      { label: 'SPEED', x: 360 }, { label: 'DAMAGE', x: 460 }, { label: 'NOTES', x: 580 },
    ];
    for (const h of headers) {
      this._add(this.add.text(h.x, startY, h.label, { fontSize: '11px', fontFamily: 'monospace', color: '#ffdd44' }));
    }

    let y = startY + 18;
    this._add(this.add.rectangle(cx, y, GAME_WIDTH - 40, 1, 0x334466).setOrigin(0.5));
    y += 8;

    for (const e of ENEMY_DATA) {
      this._add(this.add.text(60, y, `${e.icon} ${e.name}`, {
        fontSize: '12px', fontFamily: 'monospace', color: '#ffffff',
      }));
      this._add(this.add.text(280, y, String(e.hp), {
        fontSize: '12px', fontFamily: 'monospace', color: '#ff8888',
      }));
      this._add(this.add.text(360, y, String(e.speed), {
        fontSize: '12px', fontFamily: 'monospace', color: '#88ccff',
      }));
      this._add(this.add.text(460, y, String(e.dmg), {
        fontSize: '12px', fontFamily: 'monospace', color: '#ffcc44',
      }));
      this._add(this.add.text(580, y, e.note, {
        fontSize: '10px', fontFamily: 'monospace', color: '#888888',
        wordWrap: { width: 260 },
      }));
      y += 40;
      this._add(this.add.rectangle(cx, y - 4, GAME_WIDTH - 80, 1, 0x1a2233).setOrigin(0.5));
    }
  }
}
