import { Injectable } from '@angular/core';
import { Activity, ActivityLoopEntry } from '../game-state/activity';
import { AttributeType, CharacterAttribute } from '../game-state/character';
import { CharacterService } from '../game-state/character.service';
import { InventoryService } from '../game-state/inventory.service';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {
  activityLoop: ActivityLoopEntry[] = [];

  activities: Activity[] = [
    {
      name: 'Odd Jobs',
      description: "Run errands, pull weeds, clean toilet pits, or whatever else you earn a coin doing. Undignified work for a future immortal, but you have to eat to live.",
      consequenceDescription: "Increases a random attribute and provides a little money.",
      consequence: () => {
        const keys = Object.keys(this.characterService.characterState.attributes) as AttributeType[];
        // randomly choose any of the stats except the last one (spirituality)
        const key = keys[Math.floor(Math.random() * (keys.length - 1))];
        this.characterService.characterState.increaseAttribute(key, 0.1);
        this.characterService.characterState.status.stamina.value -= 5;
        this.characterService.characterState.money += 1;
      },
      requirements: {
        strength: 0,
        toughness: 0,
        speed: 0,
        intelligence: 0,
        charisma: 0,
        spirituality: 0
      }
    },
    {
      name: 'Resting',
      description: "Take a break and get some sleep. Good sleeping habits are essential for cultivating immortal attributes.",
      consequenceDescription: "Restores stamina and a little health.",
      consequence: () => {
        this.characterService.characterState.status.stamina.value += (this.characterService.characterState.status.stamina.max / 2);
        this.characterService.characterState.status.health.value += 2;
        this.characterService.characterState.checkOverage();
      },
      requirements: {
        strength: 0,
        toughness: 0,
        speed: 0,
        intelligence: 0,
        charisma: 0,
        spirituality: 0
      }
    },
    {
      name: 'Begging',
      description: "Find a nice spot on the side of the street, look sad, and put your hand out. Someone might put a coin in it if you are charasmatic enough.",
      consequenceDescription: "Increases charisma and provides a little money.",
      consequence: () => {
        this.characterService.characterState.increaseAttribute("charisma",  0.1);
        this.characterService.characterState.status.stamina.value -= 1;
        this.characterService.characterState.money += this.characterService.characterState.attributes.charisma.value * 0.1;
        //TODO: figure out diminishing returns for this
      },
      requirements: {
        strength: 0,
        toughness: 0,
        speed: 0,
        intelligence: 0,
        charisma: 5,
        spirituality: 0
      }
    },
    {
      name: 'Apprentice Blacksmithing',
      description: "Work for the local blacksmith. You mostly pump the bellows, but at least you're learning a trade.",
      consequenceDescription: "Increases strength and toughness and provides a little money.",
      consequence: () => {
        this.characterService.characterState.increaseAttribute("strength",  0.1);
        this.characterService.characterState.increaseAttribute("toughness",  0.1);
        this.characterService.characterState.status.stamina.value -= 25;
        this.characterService.characterState.money += this.characterService.characterState.attributes.strength.value * 0.1;
      },
      requirements: {
        strength: 10,
        toughness: 10,
        speed: 0,
        intelligence: 0,
        charisma: 0,
        spirituality: 0
      }
    },
    {
      name: 'Blacksmithing',
      description: "Mold metal into useful things. You might even produce something you want to keep now and then.",
      consequenceDescription: "Increases strength and toughness and provides a little money.",
      consequence: () => {
        this.characterService.characterState.increaseAttribute("strength",  0.2);
        this.characterService.characterState.increaseAttribute("toughness",  0.2);
        this.characterService.characterState.status.stamina.value -= 25;
        this.characterService.characterState.money += this.characterService.characterState.attributes.strength.value * 0.3;
        if (Math.random() < 0.1){
          this.inventoryService.addItem(this.inventoryService.itemRepo.junk);
        }
      },
      requirements: {
        strength: 100,
        toughness: 100,
        speed: 0,
        intelligence: 0,
        charisma: 0,
        spirituality: 0
      }
    },
    {
      name: 'Gather Herbs',
      description: "Search the natural world for useful herbs.",
      consequenceDescription: "",
      consequence: () => {
        this.characterService.characterState.increaseAttribute("intelligence",  0.1);
        this.characterService.characterState.increaseAttribute("speed",  0.1);
        this.characterService.characterState.status.stamina.value -= 5;
        this.inventoryService.addItem(this.inventoryService.itemRepo.herbs);
      },
      requirements: {
        strength: 0,
        toughness: 0,
        speed: 10,
        intelligence: 10,
        charisma: 0,
        spirituality: 0
      }
    }

  ];
  constructor(private characterService: CharacterService,
    private inventoryService: InventoryService) {
  }
    meetsRequirements(activity: Activity): boolean {
    const keys: (keyof CharacterAttribute)[] = Object.keys(this.characterService.characterState.attributes) as (keyof CharacterAttribute)[];
    for (const keyIndex in keys){
      const key = keys[keyIndex];
      if (this.characterService.characterState.attributes[key].value < activity.requirements[key]){
        return false;
      }
    }
    return true;
  }

   checkRequirements(){
     for (let i = this.activityLoop.length - 1; i >= 0; i--){
      if (!this.meetsRequirements(this.activityLoop[i].activity)){
        this.activityLoop.splice(i, 1);
      }
     }
   }

   reset(){
    this.activityLoop = [];
   }
}