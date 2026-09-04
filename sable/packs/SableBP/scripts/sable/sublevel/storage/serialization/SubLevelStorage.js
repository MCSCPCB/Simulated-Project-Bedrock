import {
  DynamicPropertyJsonStore
} from "../../../util/DynamicPropertyJsonStore.js";
import {
  isSubLevelStorageManifest
} from "./SubLevelData.js";
import {
  deserializeSubLevelStructure,
  serializeSubLevelStructure
} from "./SubLevelSerializer.js";
const DEFAULT_STORE_PREFIX = "sable_sublevel";
class SubLevelStorage {
  #prefix;
  #target;
  #manifestStore;
  #recordStores = /* @__PURE__ */ new Map();
  constructor(prefix = DEFAULT_STORE_PREFIX, target) {
    this.#prefix = prefix;
    this.#target = target;
    this.#manifestStore = this.#createStore(`${prefix}_manifest`);
  }
  /** The ids of every persisted sub-level; an unreadable manifest reads empty. */
  listSubLevelIds() {
    return [...this.#loadManifest().subLevelIds];
  }
  loadSubLevel(id) {
    const raw = this.#recordStore(id).load();
    if (raw === void 0) return void 0;
    const structure = deserializeSubLevelStructure(raw);
    if (structure.id !== id) {
      throw new Error(`Stored sub-level record ${id} carries mismatched id ${structure.id}.`);
    }
    return structure;
  }
  saveSubLevel(id, source) {
    const structure = serializeSubLevelStructure(id, source);
    if (this.#recordStore(id).saveWithResult(structure) === "failed") return false;
    const manifest = this.#loadManifest();
    if (manifest.subLevelIds.includes(id)) return true;
    manifest.subLevelIds.push(id);
    return this.#manifestStore.saveWithResult(manifest) !== "failed";
  }
  deleteSubLevel(id) {
    const manifest = this.#loadManifest();
    const index = manifest.subLevelIds.indexOf(id);
    if (index >= 0) {
      manifest.subLevelIds.splice(index, 1);
      if (this.#manifestStore.saveWithResult(manifest) === "failed") return false;
    }
    const cleared = this.#recordStore(id).clear();
    this.#recordStores.delete(id);
    return cleared;
  }
  #loadManifest() {
    const raw = this.#manifestStore.load();
    return isSubLevelStorageManifest(raw) ? raw : { subLevelIds: [] };
  }
  #recordStore(id) {
    let store = this.#recordStores.get(id);
    if (!store) {
      store = this.#createStore(`${this.#prefix}_r_${id}`);
      this.#recordStores.set(id, store);
    }
    return store;
  }
  #createStore(prefix) {
    return this.#target ? new DynamicPropertyJsonStore(prefix, void 0, this.#target) : new DynamicPropertyJsonStore(prefix);
  }
}
export {
  SubLevelStorage
};
