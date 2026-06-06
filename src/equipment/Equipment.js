export class Equipment {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.icon = config.icon || '📦';
    this.level = 1;
    this.maxLevel = 5;
    this._statKey = config.statKey;
    this._bonusPerLevel = config.bonusPerLevel;
    this._baseValue = config.baseValue ?? 1;
  }

  // Returns the multiplier/modifier for this passive at current level
  getValue() {
    return this._baseValue + this._bonusPerLevel * (this.level - 1);
  }

  levelUp() {
    if (this.level < this.maxLevel) this.level++;
  }

  isMaxLevel() { return this.level >= this.maxLevel; }
}
