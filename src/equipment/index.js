import { Equipment } from './Equipment.js';

export class Spinach extends Equipment {
  constructor() {
    super({ id: 'spinach', name: 'Spinach', description: '+10% damage per level.', icon: '🥬', statKey: 'damageMult', bonusPerLevel: 0.1, baseValue: 1.1 });
  }
}

export class Armor extends Equipment {
  constructor() {
    super({ id: 'armor', name: 'Armor', description: '-8% damage taken per level.', icon: '🛡️', statKey: 'defMult', bonusPerLevel: -0.08, baseValue: 0.92 });
  }
}

export class Wings extends Equipment {
  constructor() {
    super({ id: 'wings', name: 'Wings', description: '+8% movement speed per level.', icon: '🦋', statKey: 'speedMult', bonusPerLevel: 0.08, baseValue: 1.08 });
  }
}

export class EmptyTome extends Equipment {
  constructor() {
    super({ id: 'empty_tome', name: 'Empty Tome', description: '-8% weapon cooldowns per level.', icon: '📖', statKey: 'cooldownMult', bonusPerLevel: -0.08, baseValue: 0.92 });
  }
}

export class Candelabrador extends Equipment {
  constructor() {
    super({ id: 'candelabrador', name: 'Candelabrador', description: '+10% attack area per level.', icon: '🕯️', statKey: 'areaMult', bonusPerLevel: 0.1, baseValue: 1.1 });
  }
}

export class Attractorb extends Equipment {
  constructor() {
    super({ id: 'attractorb', name: 'Attractorb', description: '+30% pickup radius per level.', icon: '🔮', statKey: 'pickupMult', bonusPerLevel: 0.3, baseValue: 1.5 });
  }
}

export const ALL_EQUIPMENT_CLASSES = [Spinach, Armor, Wings, EmptyTome, Candelabrador, Attractorb];
