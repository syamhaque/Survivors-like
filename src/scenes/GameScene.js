import { logError } from '../main.js';
import {
  GAME_WIDTH, GAME_HEIGHT, WORLD_SIZE,
  RUN_DURATION_MS, REAPER_WARNING_MS, DEATH_REAPER_PHASE_MS,
  MAX_WEAPONS, MAX_EQUIPMENT,
} from '../constants.js';
import { Player }            from '../entities/Player.js';
import { XPSystem }          from '../systems/XPSystem.js';
import { EnemySpawner }      from '../systems/EnemySpawner.js';
import { PickupSpawner }     from '../systems/PickupSpawner.js';
import { HUD }               from '../systems/HUD.js';
import { AchievementSystem } from '../systems/AchievementSystem.js';
import { getAvailableEvolutions, createEvolution } from '../evolutions/EvolutionRegistry.js';
import { MagicWand }     from '../weapons/MagicWand.js';
import { Garlic }        from '../weapons/Garlic.js';
import { LightningRing } from '../weapons/LightningRing.js';
import { Axe }           from '../weapons/Axe.js';
import { FireWand }      from '../weapons/FireWand.js';
import { Cross }         from '../weapons/Cross.js';
import { ALL_EQUIPMENT_CLASSES } from '../equipment/index.js';

const ALL_WEAPON_CLASSES = [MagicWand, Garlic, LightningRing, Axe, FireWand, Cross];

const CHICKEN_HEAL     = 20;
const CHICKEN_XP_VALUE = 8;
const CHEST_HP_BONUS   = 30;
const CHEST_XP_BONUS   = 150;

const STAT_BOOST_OPTIONS = [
  { type: 'stat-boost', icon: '⚔️',  name: '+10% Damage',       description: 'Permanently increases all damage.',       statKey: 'damageMult',   mult: 1.10, isNew: false, currentLevel: 0 },
  { type: 'stat-boost', icon: '💨',  name: '+8% Move Speed',    description: 'Permanently increases movement speed.',   statKey: 'speedMult',    mult: 1.08, isNew: false, currentLevel: 0 },
  { type: 'stat-boost', icon: '⏱️',  name: '-5% Cooldown',      description: 'Permanently reduces weapon cooldowns.',   statKey: 'cooldownMult', mult: 0.95, isNew: false, currentLevel: 0 },
  { type: 'stat-boost', icon: '🌀',  name: '+10% Area',         description: 'Permanently increases attack area.',      statKey: 'areaMult',     mult: 1.10, isNew: false, currentLevel: 0 },
  { type: 'stat-boost', icon: '🧲',  name: '+15% Pickup Range', description: 'Permanently increases pickup radius.',    statKey: 'pickupMult',   mult: 1.15, isNew: false, currentLevel: 0 },
  { type: 'stat-boost', icon: '🛡️',  name: '-3% Dmg Taken',    description: 'Permanently reduces damage taken.',       statKey: 'defMult',      mult: 0.97, isNew: false, currentLevel: 0 },
];

export class GameScene extends Phaser.Scene {
  constructor() { super('Game'); }

  create() {
    this._elapsed        = 0;
    this._killCount      = 0;
    this._levelUpPending = false;
    this._chestPending   = false;
    this._paused         = false;
    this._reaperWarned   = false;
    this._deathReaperPhaseStarted = false;
    this._gameEnded      = false;
    this._pendingLevelUps = []; // queued level-ups while UI is blocking

    // Read persistent settings
    this._randomLevelUp = localStorage.getItem('survivors_like_random_levelup') === '1';

    this.playerStats = { damageMult: 1, defMult: 1, speedMult: 1, cooldownMult: 1, areaMult: 1, pickupMult: 1 };
    this._extraStats = { damageMult: 1, speedMult: 1, cooldownMult: 1, areaMult: 1, pickupMult: 1, defMult: 1 };

    // Touch/pointer movement state
    this._touch = { active: false, startX: 0, startY: 0, dx: 0, dy: 0 };

    this._buildWorld();

    this.player = new Player(this, WORLD_SIZE / 2, WORLD_SIZE / 2);
    this.player.on('dead', () => this._endGame(false));

    this.cameras.main.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    this.enemies = this.physics.add.group({ runChildUpdate: false });

    this.xpSystem      = new XPSystem(this, this.player);
    this.enemySpawner  = new EnemySpawner(this, this.player, this.enemies);
    this.pickupSpawner = new PickupSpawner(this);
    this.hud           = new HUD(this);
    this.achievements  = new AchievementSystem(this);

    this.weapons   = [];
    this.equipment = [];

    this._addWeapon(new MagicWand(this, this.player));

    this.physics.world.setBounds(0, 0, WORLD_SIZE, WORLD_SIZE);

    this._setupCollisions();
    this._setupEvents();
    this._setupPauseKey();
    this._setupTouchControls();
  }

  _buildWorld() {
    const tilesX = Math.ceil(WORLD_SIZE / 64) + 1;
    const tilesY = Math.ceil(WORLD_SIZE / 64) + 1;
    for (let ty = 0; ty < tilesY; ty++) {
      for (let tx = 0; tx < tilesX; tx++) {
        this.add.image(tx * 64 + 32, ty * 64 + 32, 'grass_tile').setDepth(0);
      }
    }
    const g = this.add.graphics().setDepth(1);
    g.lineStyle(4, 0x884444, 1);
    g.strokeRect(0, 0, WORLD_SIZE, WORLD_SIZE);
  }

  _setupCollisions() {
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (!enemy.active || !player.active) return;
      if (enemy.bypassDefense) {
        // Final Reaper one-shots regardless of defense
        player.hp = 0;
        player.emit('dead');
      } else {
        player.takeDamage(enemy.damage, this.playerStats.defMult);
      }
    });
    this.physics.add.overlap(this.player, this.pickupSpawner.chickens, (_p, chicken) => {
      this.pickupSpawner.collectChicken(this.player, chicken);
    });
    this.physics.add.overlap(this.player, this.pickupSpawner.chests, (_p, chest) => {
      this.pickupSpawner.collectChest(this.player, chest);
    });
  }

  _setupEvents() {
    this.events.on('enemy-died',        this._onEnemyDied,        this);
    this.events.on('level-up',          this._onLevelUp,          this);
    this.events.on('boss-spawned',      () => {},                 this);
    this.events.on('chest-opened',      this._onChestOpened,      this);
    this.events.on('chicken-collected', this._onChickenCollected, this);
    this.events.on('final-reaper-spawned', () => {
      this.player.frozen = true;
    }, this);
  }

  _setupPauseKey() {
    this.input.keyboard.on('keydown-ESC', () => this._togglePause());
    this.input.keyboard.on('keydown-P',   () => this._togglePause());
  }

  _setupTouchControls() {
    this.input.on('pointerdown', (ptr) => {
      this._touch.active = true;
      this._touch.startX = ptr.worldX;
      this._touch.startY = ptr.worldY;
      this._touch.dx = 0;
      this._touch.dy = 0;
    });
    this.input.on('pointermove', (ptr) => {
      if (!this._touch.active || !ptr.isDown) return;
      this._touch.dx = ptr.worldX - this._touch.startX;
      this._touch.dy = ptr.worldY - this._touch.startY;
    });
    this.input.on('pointerup', () => {
      this._touch.active = false;
      this._touch.dx = 0;
      this._touch.dy = 0;
    });
  }

  _togglePause() {
    if (this._gameEnded || this._levelUpPending || this._chestPending) return;
    if (this._paused) return;
    this._paused = true;
    this.scene.pause();
    this.scene.launch('Pause', {
      player:      this.player,
      playerStats: this.playerStats,
      weapons:     this.weapons,
      equipment:   this.equipment,
      elapsed:     this._elapsed,
      killCount:   this._killCount,
      level:       this.xpSystem.level,
      extraStats:  this._extraStats,
      isOverlay:   false,
    });
    this.scene.get('Pause').events.once('shutdown', () => {
      this._paused = false;
    });
  }

  // Public method callable from any overlay scene for quitting the run safely
  quitRun() {
    if (this._gameEnded) return;
    this._gameEnded = true;
    this._levelUpPending = false;
    this._chestPending = false;
    this._paused = false;
    ['Pause', 'LevelUp', 'ChestReward'].forEach(k => {
      try { if (this.scene.isActive(k)) this.scene.stop(k); } catch (e) {}
    });
    this.scene.start('GameOver', {
      won: false,
      level: this.xpSystem?.level || 1,
      elapsed: this._elapsed || 0,
      kills: this._killCount || 0,
      stats: this.achievements?._runStats || {},
    });
  }

  // ── Main loop ──────────────────────────────────────────────────────────────

  update(_time, delta) {
    if (this._gameEnded || this._levelUpPending || this._chestPending || this._paused) return;

    try {
      this._elapsed += delta;
      const stats = this.playerStats;

      this.player.update(delta, stats.speedMult, this._touch);

      for (const w of this.weapons) {
        try { w.update(delta); }
        catch (err) { logError(`weapon.update [${w?.id}]`, err); }
      }

      try { this._checkProjectileHits(); }
      catch (err) { logError('_checkProjectileHits', err); }

      for (const e of this.enemies.getChildren()) {
        if (!e.active) continue;
        try { e.update(delta, this.player); }
        catch (err) { logError(`enemy.update [${e?.constructor?.name}]`, err); }
      }

      try { this.xpSystem.update(delta, this.player.getPickupRadius(stats.pickupMult)); }
      catch (err) { logError('xpSystem.update', err); }

      try { this.enemySpawner.update(this._elapsed); }
      catch (err) { logError('enemySpawner.update', err); }

      try {
        this.hud.update(
          this.player, this.xpSystem, this.weapons, this.equipment,
          this._elapsed, this._killCount,
          this.pickupSpawner.getChestPositions(),
          this.pickupSpawner.getChickenPositions(),
        );
      } catch (err) { logError('hud.update', err); }

      if (!this._reaperWarned && this._elapsed >= REAPER_WARNING_MS) {
        this._reaperWarned = true;
        this._showReaperWarning();
      }

      if (!this._deathReaperPhaseStarted && this._elapsed >= DEATH_REAPER_PHASE_MS) {
        this._deathReaperPhaseStarted = true;
        this.achievements.updateStat('timeReached', DEATH_REAPER_PHASE_MS);
      }

      this.achievements.updateStat('timeReached', this._elapsed);
    } catch (err) {
      logError('GameScene.update (outer)', err);
    }
  }

  _checkProjectileHits() {
    for (const w of this.weapons) {
      if (!w.projectiles?.length) continue;
      for (const proj of w.projectiles) {
        if (!proj.active) continue;
        for (const enemy of this.enemies.getChildren()) {
          if (!enemy.active) continue;
          if (proj.hitEnemies?.has(enemy)) continue;
          const dist = Phaser.Math.Distance.Between(proj.x, proj.y, enemy.x, enemy.y);
          if (dist < (proj.radius || 6) + 14) {
            enemy.takeDamage(proj.damage);
            proj.hitEnemies?.add(enemy);
            proj.pierce = (proj.pierce || 1) - 1;
            if (proj.pierce <= 0) proj.destroy();
          }
        }
      }
    }
  }

  // ── Event handlers ─────────────────────────────────────────────────────────

  _onEnemyDied(enemy) {
    try {
      this._killCount++;
      this.xpSystem.spawnOrb(enemy.x, enemy.y, enemy.xpValue);
      this.achievements.updateStat('killCount', 1);

      if (enemy.isBoss) {
        this.pickupSpawner.dropChest(enemy.x, enemy.y, enemy.rewardCount ?? 3);
        this.enemySpawner.onBossKilled();
        this._showBossKillFX(enemy.x, enemy.y);
      } else if (enemy.isDeathReaper) {
        this.enemySpawner.onDeathReaperKilled(this._elapsed);
      } else {
        this.pickupSpawner.maybeDropChicken(enemy.x, enemy.y);
      }
    } catch (err) { logError('_onEnemyDied', err); }
  }

  _onChickenCollected(player) {
    try {
      if (player.hp >= player.maxHp) {
        this.xpSystem.xp += CHICKEN_XP_VALUE;
        this.xpSystem._checkLevelThreshold();
        this._floatText(player.x, player.y - 20, `+${CHICKEN_XP_VALUE} XP`, '#44ff88');
      } else {
        player.heal(CHICKEN_HEAL);
        this._floatText(player.x, player.y - 20, `+${CHICKEN_HEAL} HP`, '#ffcc44');
      }
      this.achievements.updateStat('chickensEaten', 1);
    } catch (err) { logError('_onChickenCollected', err); }
  }

  _onChestOpened(rewardCount) {
    try {
      if (this._chestPending) return;
      this.achievements.updateStat('chestsOpened', 1);
      this._chestPending = true;
      this.scene.pause();

      const rewards = this._buildChestRewards(rewardCount || 3);
      rewards.forEach(r => {
        try { this._applyChoice(r); } catch (err) { logError('chest _applyChoice', err); }
      });
      this._recalcStats();

      this.scene.launch('ChestReward', {
        rewards,
        onClose: () => {
          this._chestPending = false;
          this._processPendingLevelUps();
        },
      });
    } catch (err) {
      logError('_onChestOpened', err);
      this._chestPending = false;
    }
  }

  // Builds N unique reward choices — no duplicates; fills remainder with HP/XP
  _buildChestRewards(count) {
    const pool = this._buildUpgradePool(true);
    Phaser.Utils.Array.Shuffle(pool);
    const rewards = [];

    for (let i = 0; i < count; i++) {
      if (i < pool.length) {
        rewards.push(pool[i]);
      } else {
        // Pool exhausted — fill with HP, then XP
        if (this.player.hp < this.player.maxHp) {
          rewards.push({ type: 'hp', icon: '❤️', name: `+${CHEST_HP_BONUS} HP`, description: 'Restores health.', isNew: false, currentLevel: 0 });
        } else {
          rewards.push({ type: 'xp', icon: '✨', name: `+${CHEST_XP_BONUS} XP`, description: 'Grants experience.', isNew: false, currentLevel: 0 });
        }
      }
    }
    return rewards;
  }

  // ── Level-up flow ───────────────────────────────────────────────────────────

  _onLevelUp(level) {
    if (this._gameEnded) return;
    try {
      this.achievements.updateStat('maxLevel', level);

      // If blocked by another UI, queue it
      if (this._chestPending || this._levelUpPending) {
        this._pendingLevelUps.push(level);
        return;
      }

      if (this._randomLevelUp) {
        // Auto-pick: no pause, just apply immediately and show float text
        const choices = this._buildLevelUpChoices();
        const pick = choices[Phaser.Math.Between(0, choices.length - 1)];
        this._applyChoice(pick);
        this._recalcStats();
        const cam = this.cameras.main;
        this._floatText(
          cam.worldView.centerX,
          cam.worldView.centerY - 60,
          `LV ${level}: ${pick.icon} ${pick.name}`,
          '#ffdd44',
        );
        return;
      }

      this._levelUpPending = true;
      this.scene.pause();

      const choices = this._buildLevelUpChoices();
      this.scene.launch('LevelUp', {
        choices,
        onPick: (index) => {
          try {
            this._applyChoice(choices[index]);
            this._recalcStats();
          } catch (err) {
            logError(`_applyChoice [index=${index}]`, err);
          } finally {
            this._levelUpPending = false;
            this._processPendingLevelUps();
          }
        },
      });
    } catch (err) {
      logError('_onLevelUp', err);
      this._levelUpPending = false;
    }
  }

  _processPendingLevelUps() {
    if (this._pendingLevelUps.length === 0 || this._gameEnded) return;

    if (this._randomLevelUp) {
      // Apply all pending auto-picks at once
      while (this._pendingLevelUps.length > 0) {
        const level = this._pendingLevelUps.shift();
        const choices = this._buildLevelUpChoices();
        const pick = choices[Phaser.Math.Between(0, choices.length - 1)];
        this._applyChoice(pick);
        this._recalcStats();
        const cam = this.cameras.main;
        this._floatText(
          cam.worldView.centerX,
          cam.worldView.centerY - 60 - this._pendingLevelUps.length * 24,
          `LV ${level}: ${pick.icon} ${pick.name}`,
          '#ffdd44',
        );
      }
    } else {
      // Show UI for one at a time (next will be processed after this one closes)
      const level = this._pendingLevelUps.shift();
      this.time.delayedCall(50, () => this._onLevelUp(level));
    }
  }

  _buildLevelUpChoices() {
    const choices = [];

    // Evolution slot (guaranteed if eligible)
    const evos = getAvailableEvolutions(this.weapons, this.equipment);
    if (evos.length > 0) {
      const evo = evos[0];
      choices.push({ type: 'evolution', icon: '⚗️', name: evo.name, description: evo.desc, isEvolution: true, evolutionDef: evo });
    }

    const pool = this._buildUpgradePool(false);
    Phaser.Utils.Array.Shuffle(pool);
    for (const item of pool) {
      if (choices.length >= 3) break;
      choices.push(item);
    }

    // If pool is empty (everything maxed), offer stat boosts
    if (choices.length === 0) {
      const shuffled = Phaser.Utils.Array.Shuffle([...STAT_BOOST_OPTIONS]);
      choices.push(...shuffled.slice(0, 3));
    }

    return choices.slice(0, 3);
  }

  _buildUpgradePool(includeEvolutions = false) {
    const pool = [];

    if (includeEvolutions) {
      const evos = getAvailableEvolutions(this.weapons, this.equipment);
      for (const evo of evos) {
        pool.push({ type: 'evolution', icon: '⚗️', name: evo.name, description: evo.desc, isEvolution: true, evolutionDef: evo });
      }
    }

    for (const WCls of ALL_WEAPON_CLASSES) {
      const existing = this.weapons.find(w => w instanceof WCls);
      if (existing) {
        if (!existing.isMaxLevel() && !existing.evolved) {
          pool.push({ type: 'weapon-level', icon: existing.icon, name: existing.name, description: existing.description, currentLevel: existing.level, isNew: false, ref: existing });
        }
      } else if (this.weapons.length < MAX_WEAPONS) {
        const temp = new WCls(this, this.player);
        pool.push({ type: 'weapon-new', icon: temp.icon, name: temp.name, description: temp.description, currentLevel: 0, isNew: true, cls: WCls });
        temp.destroy();
      }
    }

    for (const ECls of ALL_EQUIPMENT_CLASSES) {
      const existing = this.equipment.find(e => e instanceof ECls);
      if (existing) {
        if (!existing.isMaxLevel()) {
          pool.push({ type: 'equip-level', icon: existing.icon, name: existing.name, description: existing.description, currentLevel: existing.level, isNew: false, ref: existing });
        }
      } else if (this.equipment.length < MAX_EQUIPMENT) {
        const temp = new ECls();
        pool.push({ type: 'equip-new', icon: temp.icon, name: temp.name, description: temp.description, currentLevel: 0, isNew: true, cls: ECls });
      }
    }

    return pool;
  }

  _applyChoice(choice) {
    if (choice.type === 'weapon-level') {
      choice.ref.levelUp();
    } else if (choice.type === 'weapon-new') {
      this._addWeapon(new choice.cls(this, this.player));
    } else if (choice.type === 'equip-level') {
      choice.ref.levelUp();
    } else if (choice.type === 'equip-new') {
      this.equipment.push(new choice.cls());
    } else if (choice.type === 'evolution') {
      const evolved = createEvolution(choice.evolutionDef, this, this.player);
      const src = choice.evolutionDef.sourceWeapon;
      const idx = this.weapons.indexOf(src);
      if (idx !== -1) { src.destroy(); this.weapons[idx] = evolved; }
      this.achievements.updateStat('evolutionsObtained', 1);
    } else if (choice.type === 'stat-boost') {
      this._extraStats[choice.statKey] = (this._extraStats[choice.statKey] ?? 1) * choice.mult;
    } else if (choice.type === 'hp') {
      this.player.heal(CHEST_HP_BONUS);
    } else if (choice.type === 'xp') {
      this.xpSystem.xp += CHEST_XP_BONUS;
      this.xpSystem._checkLevelThreshold();
    }
    this.achievements.updateStat('maxWeaponsHeld', this.weapons.length);
  }

  _addWeapon(weapon) {
    if (this.weapons.length < MAX_WEAPONS) this.weapons.push(weapon);
  }

  _recalcStats() {
    const stats = { damageMult: 1, defMult: 1, speedMult: 1, cooldownMult: 1, areaMult: 1, pickupMult: 1 };
    for (const eq of this.equipment) {
      const v = eq.getValue();
      if      (eq._statKey === 'damageMult')   stats.damageMult  *= v;
      else if (eq._statKey === 'defMult')       stats.defMult      = Math.min(stats.defMult, v);
      else if (eq._statKey === 'speedMult')     stats.speedMult   *= v;
      else if (eq._statKey === 'cooldownMult')  stats.cooldownMult *= v;
      else if (eq._statKey === 'areaMult')      stats.areaMult    *= v;
      else if (eq._statKey === 'pickupMult')    stats.pickupMult  *= v;
    }
    stats.damageMult   *= this._extraStats.damageMult;
    stats.speedMult    *= this._extraStats.speedMult;
    stats.cooldownMult *= this._extraStats.cooldownMult;
    stats.areaMult     *= this._extraStats.areaMult;
    stats.pickupMult   *= this._extraStats.pickupMult;
    stats.defMult      *= this._extraStats.defMult;
    this.playerStats = stats;
  }

  // ── Helpers ─────────────────────────────────────────────────────────────────

  _floatText(x, y, msg, color = '#ffffff') {
    const txt = this.add.text(x, y, msg, {
      fontSize: '14px', fontFamily: 'monospace', color,
      stroke: '#000000', strokeThickness: 2,
    }).setDepth(30).setOrigin(0.5);
    this.tweens.add({ targets: txt, y: y - 36, alpha: 0, duration: 900, onComplete: () => txt.destroy() });
  }

  _showBossKillFX(x, y) {
    this.cameras.main.shake(600, 0.02);
    const txt = this.add.text(x, y - 60, '⚔ BOSS DEFEATED ⚔', {
      fontSize: '22px', fontFamily: 'monospace', color: '#ffaa00',
      stroke: '#000000', strokeThickness: 4,
    }).setOrigin(0.5).setDepth(80);
    this.tweens.add({ targets: txt, y: txt.y - 50, alpha: 0, duration: 2000, onComplete: () => txt.destroy() });
  }

  _showReaperWarning() {
    const cam = this.cameras.main;
    const txt = this.add.text(
      cam.scrollX + GAME_WIDTH / 2, cam.scrollY + GAME_HEIGHT / 2 - 80,
      '⚠️ THE REAPER APPROACHES ⚠️',
      { fontSize: '28px', fontFamily: 'monospace', color: '#ff3333', stroke: '#000000', strokeThickness: 4 },
    ).setOrigin(0.5).setDepth(100);
    cam.shake(400, 0.012);
    this.tweens.add({ targets: txt, alpha: 0, duration: 3000, delay: 1500, onComplete: () => txt.destroy() });
  }

  _endGame(won) {
    if (this._gameEnded) return;
    this._gameEnded = true;
    ['Pause', 'LevelUp', 'ChestReward'].forEach(k => {
      if (this.scene.isActive(k)) this.scene.stop(k);
    });
    this.time.delayedCall(won ? 0 : 1200, () => {
      this.scene.start('GameOver', {
        won, level: this.xpSystem.level,
        elapsed: this._elapsed, kills: this._killCount,
        stats: this.achievements._runStats,
      });
    });
  }
}
