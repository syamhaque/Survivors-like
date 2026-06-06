import { GAME_WIDTH, GAME_HEIGHT, WORLD_SIZE } from '../constants.js';

const MM_SIZE   = 140; // minimap square size in screen pixels
const MM_RIGHT  = GAME_WIDTH  - 8;   // right edge of minimap
const MM_TOP    = 8;                  // top edge of minimap
const MM_SCALE  = MM_SIZE / WORLD_SIZE;

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this._weaponSlots = [];
    this._equipSlots  = [];
    this._create();
  }

  _create() {
    const s = this.scene;

    // Black bars
    s.add.rectangle(0, 0, GAME_WIDTH, 44, 0x000000, 0.75).setOrigin(0).setScrollFactor(0).setDepth(50);
    s.add.rectangle(0, GAME_HEIGHT - 48, GAME_WIDTH, 48, 0x000000, 0.75).setOrigin(0).setScrollFactor(0).setDepth(50);

    // HP bar
    this._hpBg  = s.add.rectangle(8, 8, 160, 14, 0x330000).setOrigin(0).setScrollFactor(0).setDepth(51);
    this._hpFg  = s.add.rectangle(8, 8, 160, 14, 0xff3333).setOrigin(0).setScrollFactor(0).setDepth(52);
    this._hpTxt = s.add.text(8, 24, 'HP', { fontSize: '11px', fontFamily: 'monospace', color: '#ffaaaa' })
      .setScrollFactor(0).setDepth(52);

    // Level
    this._lvlTxt = s.add.text(180, 4, 'LV 1', { fontSize: '14px', fontFamily: 'monospace', color: '#ffdd44' })
      .setScrollFactor(0).setDepth(52);

    // Timer (center, but shifted left to leave room for minimap)
    this._timerTxt = s.add.text(GAME_WIDTH / 2 - 80, 6, '00:00', {
      fontSize: '20px', fontFamily: 'monospace', color: '#ffffff', stroke: '#000000', strokeThickness: 3,
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(52);

    // Kill counter (left of minimap)
    this._killTxt = s.add.text(MM_RIGHT - MM_SIZE - 12, 6, 'Kills: 0', {
      fontSize: '13px', fontFamily: 'monospace', color: '#cccccc',
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(52);

    // XP bar
    this._xpBg = s.add.rectangle(0, GAME_HEIGHT - 10, GAME_WIDTH, 10, 0x003300).setOrigin(0).setScrollFactor(0).setDepth(51);
    this._xpFg = s.add.rectangle(0, GAME_HEIGHT - 10, 0,          10, 0x44ff88).setOrigin(0).setScrollFactor(0).setDepth(52);

    // Weapon slots (bottom left)
    for (let i = 0; i < 6; i++) {
      const bx = 8 + i * 48;
      const bg   = s.add.rectangle(bx, GAME_HEIGHT - 46, 42, 38, 0x222222, 0.9).setOrigin(0).setScrollFactor(0).setDepth(51);
      const icon = s.add.text(bx + 4, GAME_HEIGHT - 44, '', { fontSize: '20px', fontFamily: 'monospace' }).setScrollFactor(0).setDepth(52);
      const lvl  = s.add.text(bx + 28, GAME_HEIGHT - 18, '', { fontSize: '10px', fontFamily: 'monospace', color: '#ffdd44' }).setScrollFactor(0).setDepth(52);
      this._weaponSlots.push({ bg, icon, lvl });
    }

    // Equipment slots (bottom right)
    for (let i = 0; i < 6; i++) {
      const bx = GAME_WIDTH - 8 - (6 - i) * 48;
      const bg   = s.add.rectangle(bx, GAME_HEIGHT - 46, 42, 38, 0x221122, 0.9).setOrigin(0).setScrollFactor(0).setDepth(51);
      const icon = s.add.text(bx + 4, GAME_HEIGHT - 44, '', { fontSize: '20px', fontFamily: 'monospace' }).setScrollFactor(0).setDepth(52);
      const lvl  = s.add.text(bx + 28, GAME_HEIGHT - 18, '', { fontSize: '10px', fontFamily: 'monospace', color: '#cc88ff' }).setScrollFactor(0).setDepth(52);
      this._equipSlots.push({ bg, icon, lvl });
    }

    // ── Minimap ─────────────────────────────────────────────────────────────
    const mmX = MM_RIGHT - MM_SIZE; // top-left x of minimap area
    // Background + border
    s.add.rectangle(mmX - 2, MM_TOP - 2, MM_SIZE + 4, MM_SIZE + 4, 0x000000, 0.85)
      .setOrigin(0).setScrollFactor(0).setDepth(55);
    s.add.rectangle(mmX - 2, MM_TOP - 2, MM_SIZE + 4, MM_SIZE + 4, 0x000000, 0)
      .setStrokeStyle(1, 0x556677).setOrigin(0).setScrollFactor(0).setDepth(56);
    // Label
    s.add.text(mmX, MM_TOP + MM_SIZE + 3, 'MAP', {
      fontSize: '9px', fontFamily: 'monospace', color: '#556677',
    }).setScrollFactor(0).setDepth(56);
    // Dynamic graphics for dots
    this._mmGfx = s.add.graphics().setScrollFactor(0).setDepth(57);
    this._mmX   = mmX;
  }

  update(player, xpSystem, weapons, equipment, elapsed, kills, chestPositions, chickenPositions) {
    // HP bar
    const hpPct = player.hp / player.maxHp;
    this._hpFg.setSize(160 * hpPct, 14);
    this._hpFg.setFillStyle(hpPct > 0.5 ? 0x33cc33 : hpPct > 0.25 ? 0xffcc00 : 0xff2200);
    this._hpTxt.setText(`HP ${Math.ceil(player.hp)}/${player.maxHp}`);

    // Level
    this._lvlTxt.setText(`LV ${xpSystem.level}`);

    // Timer
    const m = Math.floor(elapsed / 60000);
    const s = Math.floor((elapsed % 60000) / 1000);
    this._timerTxt.setText(`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    if (elapsed >= 29 * 60 * 1000) this._timerTxt.setColor('#ff4444');

    // Kills
    this._killTxt.setText(`Kills: ${kills}`);

    // XP bar
    this._xpFg.setSize(GAME_WIDTH * xpSystem.getProgress(), 10);

    // Weapon slots
    for (let i = 0; i < 6; i++) {
      const w = weapons[i];
      this._weaponSlots[i].icon.setText(w ? w.icon : '');
      this._weaponSlots[i].lvl.setText(w ? (w.evolved ? 'EV' : `L${w.level}`) : '');
      this._weaponSlots[i].bg.setFillStyle(w ? (w.evolved ? 0x332200 : 0x222222) : 0x111111);
    }

    // Equipment slots
    for (let i = 0; i < 6; i++) {
      const e = equipment[i];
      this._equipSlots[i].icon.setText(e ? e.icon : '');
      this._equipSlots[i].lvl.setText(e ? `L${e.level}` : '');
    }

    // Minimap
    this._updateMinimap(player.x, player.y, chestPositions || [], chickenPositions || []);
  }

  _updateMinimap(px, py, chests, chickens) {
    const g   = this._mmGfx;
    const ox  = this._mmX;
    const oy  = MM_TOP;
    const sc  = MM_SCALE;

    g.clear();

    // World border on minimap
    g.lineStyle(1, 0x334455, 0.6);
    g.strokeRect(ox, oy, MM_SIZE, MM_SIZE);

    // Chest markers (gold squares)
    g.fillStyle(0xffcc44, 0.9);
    for (const ch of chests) {
      if (!ch || !ch.active) continue;
      g.fillRect(ox + ch.x * sc - 2, oy + ch.y * sc - 2, 4, 4);
    }

    // Chicken markers (orange dots)
    g.fillStyle(0xff8800, 0.85);
    for (const ck of chickens) {
      if (!ck || !ck.active) continue;
      g.fillCircle(ox + ck.x * sc, oy + ck.y * sc, 1.5);
    }

    // Player dot (white, slightly larger)
    const dotX = ox + px * sc;
    const dotY = oy + py * sc;
    g.fillStyle(0xffffff, 1);
    g.fillCircle(dotX, dotY, 3);

    // Camera viewport rect on minimap (faint)
    const cam = this.scene.cameras.main;
    g.lineStyle(1, 0x88aacc, 0.4);
    g.strokeRect(
      ox + cam.scrollX * sc,
      oy + cam.scrollY * sc,
      GAME_WIDTH  * sc,
      GAME_HEIGHT * sc,
    );
  }
}
