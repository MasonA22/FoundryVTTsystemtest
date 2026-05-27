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
}

Hooks.once("init", () => {
  console.log("mysystem | Initializing");

  Actors.unregisterSheet("core", ActorSheet);

  Actors.registerSheet("mysystem", MySystemActorSheet, {
    types: ["character"],
    makeDefault: true
  });
});
