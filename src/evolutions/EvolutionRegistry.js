import { HolyWand } from '../weapons/evolutions/HolyWand.js';
import { SoulEater } from '../weapons/evolutions/SoulEater.js';
import { ThunderLoop } from '../weapons/evolutions/ThunderLoop.js';
import { DeathSpiral } from '../weapons/evolutions/DeathSpiral.js';
import { Hellfire } from '../weapons/evolutions/Hellfire.js';

// { weaponId, passiveId } -> EvolvedClass
const EVOLUTIONS = [
  { weaponId: 'magic_wand',     passiveId: 'empty_tome',     EvolvedClass: HolyWand,    name: 'Holy Wand',    desc: 'Magic Wand evolved: fires twin piercing holy bolts.' },
  { weaponId: 'garlic',         passiveId: 'armor',          EvolvedClass: SoulEater,   name: 'Soul Eater',   desc: 'Garlic evolved: life-draining aura.' },
  { weaponId: 'lightning_ring', passiveId: 'attractorb',     EvolvedClass: ThunderLoop, name: 'Thunder Loop', desc: 'Lightning Ring evolved: chain-zaps 5 enemies.' },
  { weaponId: 'axe',            passiveId: 'candelabrador',  EvolvedClass: DeathSpiral, name: 'Death Spiral', desc: 'Axe evolved: orbiting axes of doom.' },
  { weaponId: 'fire_wand',      passiveId: 'spinach',        EvolvedClass: Hellfire,    name: 'Hellfire',     desc: 'Fire Wand evolved: 8-directional firestorm.' },
];

export function getAvailableEvolutions(playerWeapons, playerEquipment) {
  const results = [];
  for (const ev of EVOLUTIONS) {
    const weapon = playerWeapons.find(w => w.id === ev.weaponId);
    const passive = playerEquipment.find(e => e.id === ev.passiveId);
    if (weapon && weapon.isMaxLevel() && passive && !weapon.evolved) {
      results.push({ ...ev, sourceWeapon: weapon });
    }
  }
  return results;
}

export function createEvolution(evolutionDef, scene, player) {
  return new evolutionDef.EvolvedClass(scene, player);
}
