// Each entry: { time (ms), type, count, interval (ms between spawns) }
// Time is the game clock time at which the wave begins spawning
export const ENEMY_WAVES = [
  // ── Bats from the start ──
  { time: 0,        type: 'Bat',      count: 4,  interval: 800 },
  { time: 10000,    type: 'Bat',      count: 6,  interval: 700 },
  { time: 30000,    type: 'Bat',      count: 8,  interval: 600 },
  { time: 60000,    type: 'Bat',      count: 10, interval: 500 },

  // ── Skeletons from 2 min ──
  { time: 120000,   type: 'Skeleton', count: 5,  interval: 900 },
  { time: 150000,   type: 'Skeleton', count: 8,  interval: 800 },
  { time: 180000,   type: 'Bat',      count: 12, interval: 400 },
  { time: 240000,   type: 'Skeleton', count: 10, interval: 700 },

  // ── Ghosts from 5 min ──
  { time: 300000,   type: 'Ghost',    count: 5,  interval: 1000 },
  { time: 360000,   type: 'Ghost',    count: 8,  interval: 900 },
  { time: 360000,   type: 'Skeleton', count: 10, interval: 600 },
  { time: 420000,   type: 'Bat',      count: 15, interval: 350 },

  // ── Zombies from 8 min ──
  { time: 480000,   type: 'Zombie',   count: 4,  interval: 1200 },
  { time: 540000,   type: 'Zombie',   count: 6,  interval: 1000 },
  { time: 600000,   type: 'Ghost',    count: 10, interval: 700 },
  { time: 600000,   type: 'Zombie',   count: 8,  interval: 900 },

  // ── Heavy mixing 10-20 min ──
  { time: 720000,   type: 'Bat',      count: 20, interval: 300 },
  { time: 720000,   type: 'Skeleton', count: 15, interval: 500 },
  { time: 900000,   type: 'Zombie',   count: 10, interval: 800 },
  { time: 900000,   type: 'Ghost',    count: 12, interval: 700 },
  { time: 1080000,  type: 'Bat',      count: 25, interval: 250 },
  { time: 1200000,  type: 'Skeleton', count: 20, interval: 450 },
  { time: 1200000,  type: 'Zombie',   count: 12, interval: 750 },

  // ── Escalation 20-29 min ──
  { time: 1320000,  type: 'Bat',      count: 30, interval: 200 },
  { time: 1440000,  type: 'Zombie',   count: 15, interval: 600 },
  { time: 1560000,  type: 'Ghost',    count: 20, interval: 500 },
  { time: 1680000,  type: 'Skeleton', count: 25, interval: 400 },
  { time: 1680000,  type: 'Zombie',   count: 18, interval: 550 },

  // Reaper at 30 min is handled separately in GameScene
];
