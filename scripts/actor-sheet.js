activateListeners(html) {
  super.activateListeners(html);

  html.find(".roll-might").click(() => {
    const might = this.actor.system.abilities.might.value;

    const roll = new Roll(`1d20 + ${might}`);
    roll.roll();

    roll.toMessage({
      speaker: ChatMessage.getSpeaker({ actor: this.actor }),
      flavor: "Might Roll"
    });
  });
}
