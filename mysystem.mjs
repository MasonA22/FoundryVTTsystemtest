const fields = foundry.data.fields;

class CharacterData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      health: new fields.SchemaField({
        value: new fields.NumberField({ initial: 10, integer: true }),
        max: new fields.NumberField({ initial: 10, integer: true })
      }),

      abilities: new fields.SchemaField({
        might: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true })
        }),
        agility: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true })
        }),
        intellect: new fields.SchemaField({
          value: new fields.NumberField({ initial: 0, integer: true })
        })
      })
    };
  }
}

class WeaponData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      damage: new fields.StringField({ initial: "1d6" })
    };
  }
}

class MySystemActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["mysystem", "sheet", "actor"],
      template: "systems/mysystem/templates/actor-sheet.hbs",
      width: 500,
      height: 400
    });
  }

  getData() {
    const context = super.getData();
    context.system = this.actor.system;
    return context;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find(".roll-might").on("click", async (event) => {
      event.preventDefault();

      console.log("Might button clicked");

      const might = this.actor.system.abilities.might.value ?? 0;
      const roll = await new Roll(`1d20 + ${might}`).evaluate();

      await roll.toMessage({
        speaker: ChatMessage.getSpeaker({ actor: this.actor }),
        flavor: "Might Roll"
      });
    });
  }
}

Hooks.once("init", () => {
  console.log("mysystem | Initializing");

  CONFIG.Actor.dataModels.character = CharacterData;
  CONFIG.Item.dataModels.weapon = WeaponData;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("mysystem", MySystemActorSheet, {
    types: ["character"],
    makeDefault: true
  });
});
