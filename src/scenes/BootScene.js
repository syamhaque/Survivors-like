export class BootScene extends Phaser.Scene {
  constructor() { super('Boot'); }

  preload() {
    // Generate all sprites procedurally via canvas textures
    this._makeRect('player',    24, 32, 0x4488ff, 0x2255cc);
    this._makeRect('bat',       18, 14, 0x884488, 0x552266);
    this._makeRect('skeleton',  20, 30, 0xddddbb, 0x999977);
    this._makeRect('ghost',     20, 28, 0xaaccff, 0x7799cc);
    this._makeRect('zombie',    24, 32, 0x558855, 0x336633);
    this._makeRect('reaper',    30, 40, 0x111111, 0x440000);
    this._makeRect('xp_orb',    8,  8,  0x44ff88, 0x22cc55);
    this._makeRect('chicken',   20, 16, 0xffcc44, 0xcc9922);
    this._makeRect('chest',     24, 20, 0xcc8833, 0x885522);
    this._makeGrassTile();
  }

  create() {
    this.scene.start('Menu');
  }

  _makeRect(key, w, h, fillColor, strokeColor) {
    const canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#' + fillColor.toString(16).padStart(6, '0');
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = '#' + strokeColor.toString(16).padStart(6, '0');
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, w - 2, h - 2);
    this.textures.addCanvas(key, canvas);
  }

  _makeGrassTile() {
    const size = 64;
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, 0, size, size);
    // Subtle variation
    ctx.fillStyle = '#336633';
    ctx.fillRect(0, 0, size / 2, size / 2);
    ctx.fillRect(size / 2, size / 2, size / 2, size / 2);
    ctx.strokeStyle = '#1e3d1a';
    ctx.lineWidth = 1;
    ctx.strokeRect(0, 0, size, size);
    this.textures.addCanvas('grass_tile', canvas);
  }
}
