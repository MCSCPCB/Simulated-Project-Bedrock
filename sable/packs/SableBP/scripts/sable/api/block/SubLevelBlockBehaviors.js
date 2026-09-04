class SubLevelBlockBehaviorRegistry {
  #byTypeId = /* @__PURE__ */ new Map();
  register(typeId, behavior) {
    if (this.#byTypeId.has(typeId)) {
      throw new Error(`A sub-level block behavior for ${typeId} is already registered.`);
    }
    this.#byTypeId.set(typeId, behavior);
  }
  get(typeId) {
    return this.#byTypeId.get(typeId);
  }
  /** Every distinct behavior, for whole-sub-level notifications. */
  *behaviors() {
    yield* new Set(this.#byTypeId.values());
  }
}
export {
  SubLevelBlockBehaviorRegistry
};
