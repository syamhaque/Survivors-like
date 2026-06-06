export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, key, config) {
    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(5);
    this.body.setSize(config.bodyW || 18, config.bodyH || 24);

    this.maxHp = config.hp;
    this.hp = config.hp;
    this.speed = config.speed;
    this.damage = config.damage;
    this.xpValue = config.xpValue;
    this.isGhost = config.isGhost || false;

    this._hitFlash = 0;
    this._hpBar = null;
    this._makeHpBar();
  }

  _makeHpBar() {
    this._hpBarBg  = this.scene.add.rectangle(this.x, this.y - 18, 20, 3, 0x330000).setDepth(6);
    this._hpBarFg  = this.scene.add.rectangle(this.x, this.y - 18, 20, 3, 0x00ff44).setDepth(7);
    this._hpBarFg.setOrigin(0, 0.5);
    this._hpBarBg.setOrigin(0, 0.5);
  }

  update(delta, player) {
    if (!this.active) return;
    this._moveToward(player, delta);
    this._updateHpBar();
    if (this._hitFlash > 0) {
      this._hitFlash -= delta;
      if (this._hitFlash <= 0) this.clearTint();
    }
  }

  _moveToward(player, delta) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    this.setVelocity(Math.cos(angle) * this.speed, Math.sin(angle) * this.speed);
    this.setFlipX(player.x < this.x);
  }

  _updateHpBar() {
    const pct = this.hp / this.maxHp;
    this._hpBarBg.setPosition(this.x - 10, this.y - 18);
    this._hpBarFg.setPosition(this.x - 10, this.y - 18);
    this._hpBarFg.setSize(20 * pct, 3);
    this._hpBarFg.setFillStyle(pct > 0.5 ? 0x00ff44 : pct > 0.25 ? 0xffcc00 : 0xff3300);
  }

  takeDamage(amount) {
    if (!this.active) return;
    this.hp -= amount;
    this.setTint(0xffffff);
    this._hitFlash = 80;

    // Damage number popup
    const txt = this.scene.add.text(this.x + Phaser.Math.Between(-10, 10), this.y - 20,
      Math.round(amount).toString(), {
        fontSize: '12px', fontFamily: 'monospace',
        color: amount > 50 ? '#ff8800' : '#ffffff',
        stroke: '#000000', strokeThickness: 2,
      }).setDepth(20);
    this.scene.tweens.add({
      targets: txt, y: txt.y - 28, alpha: 0, duration: 600,
      onComplete: () => txt.destroy(),
    });

    if (this.hp <= 0) this._die();
  }

  _die() {
    this.scene.events.emit('enemy-died', this);
    this._hpBarBg.destroy();
    this._hpBarFg.destroy();
    this.destroy();
  }

  destroy() {
    if (this._hpBarBg?.active) this._hpBarBg.destroy();
    if (this._hpBarFg?.active) this._hpBarFg.destroy();
    super.destroy();
  }
}
