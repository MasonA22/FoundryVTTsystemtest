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

Hooks.on("renderWallConfig", (app, html, data) => {
  ui.notifications.info("WallConfig hook fired");

  const wall = app.object;
  const cover = wall.getFlag("mysystem", "cover") ?? {};

  const coverHTML = `
    <fieldset>
      <legend>MySystem Cover</legend>

      <div class="form-group">
        <label>Enable Cover</label>
        <input type="checkbox" name="flags.mysystem.cover.enabled" ${cover.enabled ? "checked" : ""}>
      </div>

      <div class="form-group">
        <label>Height</label>
        <input type="number" step="0.1" name="flags.mysystem.cover.height" value="${cover.height ?? 1.0}">
      </div>

      <div class="form-group">
        <label>Material</label>
        <input type="text" name="flags.mysystem.cover.material" value="${cover.material ?? "wood"}">
      </div>

      <div class="form-group">
        <label>Hardness</label>
        <input type="number" step="0.1" name="flags.mysystem.cover.hardness" value="${cover.hardness ?? 0.5}">
      </div>

      <div class="form-group">
        <label>Density</label>
        <input type="number" step="0.1" name="flags.mysystem.cover.density" value="${cover.density ?? 0.5}">
      </div>
    </fieldset>
  `;

  // html may itself be the form, not contain a form
  const $html = html instanceof jQuery ? html : $(html);

  let target = $html.find("form");
  if (!target.length && $html.is("form")) target = $html;
  if (!target.length) target = $html.find(".window-content");
  if (!target.length) target = $html;

  target.append(coverHTML);
});

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
