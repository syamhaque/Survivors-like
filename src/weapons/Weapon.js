export class Weapon {
  constructor(scene, player, config) {
    this.scene = scene;
    this.player = player;
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.level = 1;
    this.maxLevel = 8;
    this.cooldown = config.baseCooldown;
    this.timer = 0;
    this.evolved = false;
    this.evolutionId = config.evolutionId || null;
    this.requiredPassive = config.requiredPassive || null;
    this.icon = config.icon || '⚔️';
    // Plain array — no physics group. Bullets are moved manually each frame.
    this.projectiles = [];
  }

  update(delta) {
    const stats = this.scene.playerStats;
    const effectiveCooldown = this.cooldown * stats.cooldownMult;
    this.timer += delta;
    if (this.timer >= effectiveCooldown) {
      this.timer = 0;
      this.fire();
    }
    this.updateProjectiles(delta);
    // Purge destroyed bullets every frame
    this.projectiles = this.projectiles.filter(b => b.active);
  }

  fire() {}
  updateProjectiles(_delta) {}

  levelUp() {
    if (this.level < this.maxLevel) {
      this.level++;
      this.onLevelUp();
    }
  }

  onLevelUp() {}
  isMaxLevel() { return this.level >= this.maxLevel; }

  destroy() {
    for (const b of this.projectiles) { if (b.active) b.destroy(); }
    this.projectiles = [];
  }

  getNearestEnemy() {
    const cam = this.scene.cameras.main;
    const enemies = this.scene.enemies?.getChildren() || [];
    let nearest = null, minDist = Infinity;
    for (const e of enemies) {
      if (!e.active) continue;
      // Only target enemies visible on screen or close to it
      if (!cam.worldView.contains(e.x, e.y) &&
          Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y) > 800) continue;
      const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
      if (d < minDist) { minDist = d; nearest = e; }
    }
    return nearest;
  }

  // Creates a bullet as a visual circle. vx/vy are px/sec. Bullet moves manually.
  spawnBullet(vx, vy, color, radius, damage, pierce, range) {
    const stats = this.scene.playerStats;
    const b = this.scene.add.circle(this.player.x, this.player.y, Math.max(2, radius * stats.areaMult), color);
    b.setDepth(8);
    b.vx = vx;
    b.vy = vy;
    b.damage = damage * stats.damageMult;
    b.pierce = pierce;
    b.maxRange = range;
    b.traveled = 0;
    b.hitEnemies = new Set();
    this.projectiles.push(b);
    return b;
  }

  // Moves all bullets by their velocity, culls those past maxRange.
  // Weapons with special movement (Axe, Cross) override updateProjectiles instead.
  _moveBullets(delta) {
    const dt = delta / 1000;
    for (const b of this.projectiles) {
      if (!b.active) continue;
      const dx = b.vx * dt;
      const dy = b.vy * dt;
      b.x += dx;
      b.y += dy;
      b.traveled += Math.sqrt(dx * dx + dy * dy);
      if (b.traveled >= b.maxRange) {
        b.destroy();
      }
    }
  }
}
