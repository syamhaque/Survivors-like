import { PLAYER_SPEED, PLAYER_MAX_HP, PICKUP_RADIUS } from '../constants.js';

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDepth(10);
    this.setCollideWorldBounds(true);
    this.body.setSize(20, 24);

    this.hp = PLAYER_MAX_HP;
    this.maxHp = PLAYER_MAX_HP;
    this.speed = PLAYER_SPEED;
    this.lastAngle = 0;
    this.invincibleTimer = 0;
    this._hitFlashTimer = 0;
    this._facing = 1;
    this.frozen = false; // set true when final reaper spawns

    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      upArr: Phaser.Input.Keyboard.KeyCodes.UP,
      downArr: Phaser.Input.Keyboard.KeyCodes.DOWN,
      leftArr: Phaser.Input.Keyboard.KeyCodes.LEFT,
      rightArr: Phaser.Input.Keyboard.KeyCodes.RIGHT,
    });
  }

  update(delta, speedMult = 1, touch = null) {
    if (this.frozen) {
      this.setVelocity(0, 0);
      // Still process invincibility flicker
      if (this.invincibleTimer > 0) {
        this.invincibleTimer -= delta;
        this._hitFlashTimer += delta;
        this.setAlpha(Math.sin(this._hitFlashTimer * 0.04) > 0 ? 1 : 0.4);
      } else {
        this.setAlpha(1);
        this._hitFlashTimer = 0;
      }
      return;
    }

    const { up, down, left, right, upArr, downArr, leftArr, rightArr } = this.keys;
    const spd = this.speed * speedMult;
    let vx = 0, vy = 0;

    if (left.isDown || leftArr.isDown)  vx -= spd;
    if (right.isDown || rightArr.isDown) vx += spd;
    if (up.isDown || upArr.isDown)   vy -= spd;
    if (down.isDown || downArr.isDown)  vy += spd;

    // Touch/pointer movement (only when no keyboard input)
    if (vx === 0 && vy === 0 && touch?.active) {
      const len = Math.sqrt(touch.dx * touch.dx + touch.dy * touch.dy);
      const deadzone = 15;
      if (len > deadzone) {
        const intensity = Math.min(1, (len - deadzone) / 80);
        vx = (touch.dx / len) * spd * intensity;
        vy = (touch.dy / len) * spd * intensity;
      }
    }

    if (vx !== 0 && vy !== 0) {
      vx *= 0.707;
      vy *= 0.707;
    }

    this.setVelocity(vx, vy);

    if (vx !== 0 || vy !== 0) {
      this.lastAngle = Math.atan2(vy, vx);
      if (vx > 0) this._facing = 1;
      else if (vx < 0) this._facing = -1;
    }

    this.setFlipX(this._facing < 0);

    // Invincibility frames
    if (this.invincibleTimer > 0) {
      this.invincibleTimer -= delta;
      this._hitFlashTimer += delta;
      this.setAlpha(Math.sin(this._hitFlashTimer * 0.04) > 0 ? 1 : 0.4);
    } else {
      this.setAlpha(1);
      this._hitFlashTimer = 0;
    }
  }

  takeDamage(amount, defMult = 1) {
    if (this.invincibleTimer > 0) return;
    const dmg = Math.max(1, Math.floor(amount * defMult));
    this.hp = Math.max(0, this.hp - dmg);
    this.invincibleTimer = 800;

    this.scene.cameras.main.shake(80, 0.006);
    this.scene.tweens.add({ targets: this, tint: 0xff0000, duration: 60, yoyo: true, onComplete: () => this.clearTint() });

    if (this.hp <= 0) this.emit('dead');
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  getPickupRadius(pickupMult = 1) {
    return PICKUP_RADIUS * pickupMult;
  }
}
