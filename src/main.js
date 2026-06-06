import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { MenuScene } from './scenes/MenuScene.js';
import { GameScene } from './scenes/GameScene.js';
import { LevelUpScene } from './scenes/LevelUpScene.js';
import { GameOverScene } from './scenes/GameOverScene.js';
import { AchievementsScene } from './scenes/AchievementsScene.js';
import { PauseScene } from './scenes/PauseScene.js';
import { ChestRewardScene } from './scenes/ChestRewardScene.js';
import { CodexScene } from './scenes/CodexScene.js';
import { GAME_WIDTH, GAME_HEIGHT } from './constants.js';

// ── Error logger ──────────────────────────────────────────────────────────────
const LOG_KEY = 'survivors_like_error_log';
const MAX_LOG_ENTRIES = 50;

export function logError(context, err) {
  const entry = {
    t: new Date().toISOString(),
    ctx: context,
    msg: err?.message ?? String(err),
    stack: err?.stack ?? '',
  };
  console.error(`[CRASH] ${context}:`, err);

  try {
    const raw = localStorage.getItem(LOG_KEY);
    const log = raw ? JSON.parse(raw) : [];
    log.push(entry);
    if (log.length > MAX_LOG_ENTRIES) log.splice(0, log.length - MAX_LOG_ENTRIES);
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {}
}

export function getErrorLog() {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function clearErrorLog() {
  try { localStorage.removeItem(LOG_KEY); } catch {}
}

// Expose on window so you can run getErrorLog() / clearErrorLog() in DevTools
window.__vsLog    = getErrorLog;
window.__vsClear  = clearErrorLog;
window.__vsPrint  = () => {
  const log = getErrorLog();
  if (!log.length) { console.log('[VS-LOG] No errors recorded.'); return; }
  console.group(`[VS-LOG] ${log.length} error(s) recorded`);
  log.forEach((e, i) => {
    console.group(`#${i + 1} [${e.t}] ${e.ctx}`);
    console.error(e.msg);
    if (e.stack) console.log(e.stack);
    console.groupEnd();
  });
  console.groupEnd();
};

window.onerror = (msg, src, line, col, err) => {
  logError(`window.onerror @ ${src}:${line}:${col}`, err ?? new Error(String(msg)));
};
window.onunhandledrejection = (ev) => {
  logError('unhandledRejection', ev.reason instanceof Error ? ev.reason : new Error(String(ev.reason)));
};

console.info('[VS] Error logger active. Run __vsPrint() in DevTools to see captured errors.');
// ─────────────────────────────────────────────────────────────────────────────

const config = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  backgroundColor: '#1a1a2e',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false },
  },
  scene: [BootScene, MenuScene, GameScene, LevelUpScene, GameOverScene, AchievementsScene, PauseScene, ChestRewardScene, CodexScene],
  pixelArt: true,
  roundPixels: true,
};

new Phaser.Game(config);
