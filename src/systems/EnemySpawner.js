import { ENEMY_SPAWN_MARGIN, GAME_WIDTH, GAME_HEIGHT, WORLD_SIZE, BOSS_SCHEDULE_MS, DEATH_REAPER_PHASE_MS, FINAL_REAPER_MS } from '../constants.js';
import { ENEMY_WAVES } from '../data/enemyWaves.js';
import { Bat }         from '../entities/enemies/Bat.js';
import { Skeleton }    from '../entities/enemies/Skeleton.js';
import { Ghost }       from '../entities/enemies/Ghost.js';
import { Zombie }      from '../entities/enemies/Zombie.js';
import { Reaper }      from '../entities/enemies/Reaper.js';
import { BossEnemy }   from '../entities/enemies/BossEnemy.js';
import { DeathReaper } from '../entities/enemies/DeathReaper.js';

const TYPE_MAP = { Bat, Skeleton, Ghost, Zombie, Reaper };
const BOSS_DIFFICULTY_MULT = 0.30; // +30% enemy stats per boss killed

export class EnemySpawner {
  constructor(scene, player, enemyGroup) {
    this.scene    = scene;
    this.player   = player;
    this.enemies  = enemyGroup;

    this._waveIndex         = 0;
    this._activeWaves       = [];
    this._bossScheduleIdx   = 0;
    this._bossesKilled      = 0;
    this._diffMult          = 1.0;

    this._bgTimer    = 0;
    this._bgInterval = 3000;

    this._deathReaperPhase   = false;
    this._deathReaperActive  = false;
    this._deathReaperWave    = 0;
    this._finalReaperSpawned = false;
  }

  onBossKilled() {
    this._bossesKilled++;
    this._diffMult += BOSS_DIFFICULTY_MULT;
  }

  getDifficultyMult() { return this._diffMult; }

  onDeathReaperKilled(elapsed) {
    if (elapsed >= FINAL_REAPER_MS) return;
    this._deathReaperActive = false;
    this.scene.time.delayedCall(3000, () => {
      if (!this._finalReaperSpawned) this._spawnDeathReaper();
    });
  }

  update(elapsed) {
    if (this._deathReaperPhase) {
      this._tickDeathReaperPhase(elapsed);
      return;
    }

    const dt = this.scene.game.loop.delta;

    // ── Scripted waves ──────────────────────────────────────────────────────
    while (this._waveIndex < ENEMY_WAVES.length && ENEMY_WAVES[this._waveIndex].time <= elapsed) {
      this._activeWaves.push({ ...ENEMY_WAVES[this._waveIndex], spawned: 0, timer: 0 });
      this._waveIndex++;
    }
    for (const wave of this._activeWaves) {
      if (wave.spawned >= wave.count) continue;
      wave.timer += dt;
      if (wave.timer >= wave.interval) {
        wave.timer = 0;
        wave.spawned++;
        this._spawnOne(wave.type);
      }
    }
    this._activeWaves = this._activeWaves.filter(w => w.spawned < w.count);

    // ── Background continuous spawn ─────────────────────────────────────────
    this._bgTimer += dt;
    if (this._bgTimer >= this._bgInterval) {
      this._bgTimer = 0;
      const type  = this._bgEnemyType(elapsed);
      const count = 2 + Math.floor(elapsed / (3 * 60000)); // more aggressive: 2 base, +1 per 3 min
      for (let i = 0; i < Math.min(count, 8); i++) this._spawnOne(type);
      this._bgInterval = Math.max(600, 3000 - elapsed / 2500); // shrinks faster
    }

    // ── Boss schedule ───────────────────────────────────────────────────────
    while (
      this._bossScheduleIdx < BOSS_SCHEDULE_MS.length &&
      elapsed >= BOSS_SCHEDULE_MS[this._bossScheduleIdx]
    ) {
      const bossNum = this._bossScheduleIdx + 1;
      const spawnTime = BOSS_SCHEDULE_MS[this._bossScheduleIdx];
      const rewardCount = spawnTime >= 20 * 60000 ? 5 : 3;
      this._bossScheduleIdx++;
      this._spawnBoss(bossNum, rewardCount);
    }

    // ── Transition to death reaper phase ───────────────────────────────────
    if (elapsed >= DEATH_REAPER_PHASE_MS) {
      this._deathReaperPhase = true;
    }
  }

  spawnReaper() {
    if (this._finalReaperSpawned) return;
    this._finalReaperSpawned = true;
    const { x, y } = this._edgePosition();
    const r = new Reaper(this.scene, x, y);
    this.enemies.add(r);
    this.scene.events.emit('final-reaper-spawned');
  }

  _tickDeathReaperPhase(elapsed) {
    if (elapsed >= FINAL_REAPER_MS && !this._finalReaperSpawned) {
      this.spawnReaper();
      return;
    }
    if (!this._deathReaperActive && !this._finalReaperSpawned) {
      this._spawnDeathReaper();
    }
  }

  _spawnDeathReaper() {
    this._deathReaperActive = true;
    this._deathReaperWave++;
    const { x, y } = this._edgePosition();
    const dr = new DeathReaper(this.scene, x, y, this._deathReaperWave);
    this.enemies.add(dr);
    this.scene.cameras.main.shake(300, 0.014);
  }

  _spawnBoss(bossNum, rewardCount) {
    const { x, y } = this._edgePosition();
    const boss = new BossEnemy(this.scene, x, y, bossNum, rewardCount);
    this.enemies.add(boss);
    this.scene.events.emit('boss-spawned', boss);
    this.scene.cameras.main.shake(500, 0.015);
  }

  _spawnOne(type) {
    const { x, y } = this._edgePosition();
    const Cls = TYPE_MAP[type];
    if (!Cls) return;
    const enemy = new Cls(this.scene, x, y);
    if (this._diffMult > 1.0) {
      enemy.maxHp   = Math.round(enemy.maxHp   * this._diffMult);
      enemy.hp      = enemy.maxHp;
      enemy.speed   = enemy.speed  * this._diffMult;
      enemy.xpValue = Math.round(enemy.xpValue * this._diffMult);
    }
    this.enemies.add(enemy);
  }

  _bgEnemyType(elapsed) {
    if (elapsed < 120000)  return 'Bat';
    if (elapsed < 300000)  return Math.random() < 0.6 ? 'Bat' : 'Skeleton';
    if (elapsed < 480000)  return Math.random() < 0.4 ? 'Ghost' : 'Skeleton';
    if (elapsed < 720000)  return Math.random() < 0.3 ? 'Zombie' : 'Ghost';
    const r = Math.random();
    if (r < 0.25) return 'Bat';
    if (r < 0.50) return 'Skeleton';
    if (r < 0.75) return 'Ghost';
    return 'Zombie';
  }

  _edgePosition() {
    const cam    = this.scene.cameras.main;
    const margin = ENEMY_SPAWN_MARGIN;
    const side   = Phaser.Math.Between(0, 3);

    const left   = Math.max(0, cam.scrollX - margin);
    const right  = Math.min(WORLD_SIZE, cam.scrollX + GAME_WIDTH  + margin);
    const top    = Math.max(0, cam.scrollY - margin);
    const bottom = Math.min(WORLD_SIZE, cam.scrollY + GAME_HEIGHT + margin);

    let x, y;
    if (side === 0)      { x = Phaser.Math.Between(left, right); y = top; }
    else if (side === 1) { x = Phaser.Math.Between(left, right); y = bottom; }
    else if (side === 2) { x = left;  y = Phaser.Math.Between(top, bottom); }
    else                 { x = right; y = Phaser.Math.Between(top, bottom); }

    return {
      x: Phaser.Math.Clamp(x, 1, WORLD_SIZE - 1),
      y: Phaser.Math.Clamp(y, 1, WORLD_SIZE - 1),
    };
  }
}
