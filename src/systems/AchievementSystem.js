import { ACHIEVEMENTS } from '../data/achievements.js';

const STORAGE_KEY = 'survivors_like_achievements';

export class AchievementSystem {
  constructor(scene) {
    this.scene = scene;
    this._unlocked = this._load();
    this._runStats = {
      timeReached: 0,
      maxLevel: 1,
      evolutionsObtained: 0,
      maxWeaponsHeld: 0,
      killCount: 0,
      chestsOpened: 0,
      chickensEaten: 0,
    };
  }

  updateStat(key, value) {
    if (key === 'killCount' || key === 'chestsOpened' || key === 'chickensEaten' || key === 'evolutionsObtained') {
      this._runStats[key] = (this._runStats[key] || 0) + value;
    } else {
      this._runStats[key] = Math.max(this._runStats[key] || 0, value);
    }
    this._checkAll();
  }

  _checkAll() {
    for (const ach of ACHIEVEMENTS) {
      if (this._unlocked.has(ach.id)) continue;
      if (ach.check(this._runStats)) {
        this._unlocked.add(ach.id);
        this._save();
        this._notify(ach);
      }
    }
  }

  _notify(ach) {
    const s = this.scene;
    const txt = s.add.text(s.cameras.main.scrollX + 640, s.cameras.main.scrollY + 60,
      `${ach.icon} Achievement: ${ach.name}`, {
        fontSize: '16px', fontFamily: 'monospace', color: '#ffdd44',
        stroke: '#000000', strokeThickness: 3,
        backgroundColor: '#222200',
        padding: { x: 10, y: 6 },
      }).setOrigin(0.5).setDepth(80);

    s.tweens.add({
      targets: txt, y: txt.y - 40, alpha: 0,
      duration: 2500, delay: 1500,
      onComplete: () => txt.destroy(),
    });
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  }

  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this._unlocked]));
    } catch {}
  }

  getUnlocked() { return [...this._unlocked]; }

  static getAll() { return ACHIEVEMENTS; }

  static loadUnlocked() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch { return new Set(); }
  }
}
