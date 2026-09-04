// Persists sub-level structures behind chunked atomic dynamic-property stores:
// one manifest store listing the saved ids plus one record store per id.
import {
  DynamicPropertyJsonStore,
  type DynamicPropertyTarget
} from "../../../util/DynamicPropertyJsonStore.js";
import {
  isSubLevelStorageManifest,
  type SerializedSubLevelStructure,
  type SubLevelStorageManifest
} from "./SubLevelData.js";
import {
  deserializeSubLevelStructure,
  serializeSubLevelStructure,
  type SubLevelStructureSource
} from "./SubLevelSerializer.js";

const DEFAULT_STORE_PREFIX = "sable_sublevel";

export class SubLevelStorage {
  readonly #prefix: string;
  readonly #target: DynamicPropertyTarget | undefined;
  readonly #manifestStore: DynamicPropertyJsonStore;
  readonly #recordStores = new Map<string, DynamicPropertyJsonStore>();

  constructor(prefix = DEFAULT_STORE_PREFIX, target?: DynamicPropertyTarget) {
    this.#prefix = prefix;
    this.#target = target;
    this.#manifestStore = this.#createStore(`${prefix}_manifest`);
  }

  /** The ids of every persisted sub-level. */
  listSubLevelIds(): string[] {
    return [...this.#loadManifest().subLevelIds];
  }

  loadSubLevel(id: string): SerializedSubLevelStructure | undefined {
    const raw = this.#recordStore(id).load<unknown>();
    if (raw === undefined) return undefined;
    const structure = deserializeSubLevelStructure(raw);
    if (structure.id !== id) {
      throw new Error(`Stored sub-level record ${id} carries mismatched id ${structure.id}.`);
    }
    return structure;
  }

  saveSubLevel(id: string, source: SubLevelStructureSource): boolean {
    const structure = serializeSubLevelStructure(id, source);
    if (this.#recordStore(id).saveWithResult(structure) === "failed") return false;
    const manifest = this.#loadManifest();
    if (manifest.subLevelIds.includes(id)) return true;
    manifest.subLevelIds.push(id);
    return this.#manifestStore.saveWithResult(manifest) !== "failed";
  }

  deleteSubLevel(id: string): boolean {
    const manifest = this.#loadManifest();
    const index = manifest.subLevelIds.indexOf(id);
    if (index >= 0) {
      manifest.subLevelIds.splice(index, 1);
      // The manifest commits the delete first so a partial failure leaves an
      // unreachable record instead of a listed-but-missing one.
      if (this.#manifestStore.saveWithResult(manifest) === "failed") return false;
    }
    const cleared = this.#recordStore(id).clear();
    this.#recordStores.delete(id);
    return cleared;
  }

  #loadManifest(): SubLevelStorageManifest {
    const raw = this.#manifestStore.load<unknown>();
    if (raw === undefined) return { subLevelIds: [] };
    if (!isSubLevelStorageManifest(raw)) {
      throw new Error("The stored sub-level manifest is invalid.");
    }
    return raw;
  }

  #recordStore(id: string): DynamicPropertyJsonStore {
    let store = this.#recordStores.get(id);
    if (!store) {
      store = this.#createStore(`${this.#prefix}_r_${id}`);
      this.#recordStores.set(id, store);
    }
    return store;
  }

  #createStore(prefix: string): DynamicPropertyJsonStore {
    return this.#target
      ? new DynamicPropertyJsonStore(prefix, undefined, this.#target)
      : new DynamicPropertyJsonStore(prefix);
  }
}
