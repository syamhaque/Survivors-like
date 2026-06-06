export const GAME_WIDTH = 1280;
export const GAME_HEIGHT = 720;
export const WORLD_SIZE = 8000; // square world

export const PLAYER_SPEED = 160;
export const PLAYER_MAX_HP = 100;
export const PICKUP_RADIUS = 110;  // increased base pickup radius
export const XP_ATTRACT_SPEED = 120;
export const XP_ORB_DRIFT_SPEED = 20;

export const REAPER_WARNING_MS     = 29 * 60 * 1000;
export const DEATH_REAPER_PHASE_MS = 30 * 60 * 1000; // killable death reapers begin
export const FINAL_REAPER_MS       = 31 * 60 * 1000; // invincible reaper, game ends
// Legacy alias kept for GameScene death-trigger timing
export const RUN_DURATION_MS = FINAL_REAPER_MS;

export const TILE_SIZE = 32;
export const MAP_TILES_X = Math.ceil(WORLD_SIZE / TILE_SIZE);
export const MAP_TILES_Y = Math.ceil(WORLD_SIZE / TILE_SIZE);

export const ENEMY_SPAWN_MARGIN = 80; // px outside viewport

export const MAX_WEAPONS = 6;
export const MAX_EQUIPMENT = 6;

// Boss schedule (ms) — fixed spawn times
export const BOSS_SCHEDULE_MS = [
  5  * 60000,
  10 * 60000,
  11 * 60000,
  17 * 60000,
  20 * 60000,
  21 * 60000,
  27 * 60000,
];

export const LEVEL_THRESHOLDS = [
  0, 10, 25, 45, 70, 100, 135, 175, 220, 270,
  325, 385, 450, 520, 595, 675, 760, 850, 945, 1045,
  1150, 1260, 1375, 1495, 1620, 1750, 1885, 2025, 2170, 2320,
  2475, 2635, 2800, 2970, 3145, 3325, 3510, 3700, 3895, 4095,
  4300,
];
