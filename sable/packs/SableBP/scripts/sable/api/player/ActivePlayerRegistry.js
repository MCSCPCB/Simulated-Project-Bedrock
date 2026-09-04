import {
  InputButton,
  system,
  world
} from "@minecraft/server";
class ActivePlayerRegistry {
  #players = /* @__PURE__ */ new Map();
  #sneakingPlayers = /* @__PURE__ */ new Map();
  #started = false;
  start() {
    if (this.#started) return;
    this.#started = true;
    world.afterEvents.playerSpawn.subscribe((event) => this.#syncPlayer(event.player));
    world.afterEvents.playerDimensionChange.subscribe((event) => this.#syncPlayer(event.player));
    world.afterEvents.playerButtonInput.subscribe(
      (event) => this.#syncPlayer(event.player),
      { buttons: [InputButton.Sneak] }
    );
    world.beforeEvents.playerLeave.subscribe((event) => this.remove(event.player.id));
    system.run(() => {
      for (const player of world.getPlayers()) this.#syncPlayer(player);
    });
  }
  get(playerId) {
    const player = this.#players.get(playerId);
    if (!player) return void 0;
    if (player.isValid) return player;
    this.remove(playerId);
    return void 0;
  }
  hasSneakingPlayer(playerId) {
    return this.#sneakingPlayers.has(playerId);
  }
  *players() {
    for (const [playerId, player] of this.#players) {
      if (!player.isValid) {
        this.remove(playerId);
        continue;
      }
      yield player;
    }
  }
  *sneakingPlayers() {
    for (const [playerId, player] of this.#sneakingPlayers) {
      if (!isActivelySneaking(player)) {
        this.#sneakingPlayers.delete(playerId);
        continue;
      }
      yield player;
    }
  }
  remove(playerId) {
    this.#players.delete(playerId);
    this.#sneakingPlayers.delete(playerId);
  }
  #syncPlayer(player) {
    if (!player.isValid) {
      this.remove(player.id);
      return;
    }
    this.#players.set(player.id, player);
    if (isActivelySneaking(player)) this.#sneakingPlayers.set(player.id, player);
    else this.#sneakingPlayers.delete(player.id);
  }
}
function isActivelySneaking(player) {
  try {
    return player.isValid && player.isSneaking;
  } catch {
    return false;
  }
}
export {
  ActivePlayerRegistry
};
