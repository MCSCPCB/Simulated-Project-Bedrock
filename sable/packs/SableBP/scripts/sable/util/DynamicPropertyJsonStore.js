import { world } from "@minecraft/server";
const DEFAULT_CHUNK_SIZE = 3e4;
class DynamicPropertyJsonStore {
  constructor(prefix, chunkSize = DEFAULT_CHUNK_SIZE, target = world) {
    this.prefix = prefix;
    this.chunkSize = chunkSize;
    this.target = target;
  }
  prefix;
  chunkSize;
  target;
  #lastJson;
  #nextGeneration = 1;
  load() {
    try {
      const manifest = this.#getActiveManifest();
      if (!manifest) return void 0;
      let json = "";
      for (let index = 0; index < manifest.chunkCount; index++) {
        const chunk = this.target.getDynamicProperty(
          this.#chunkKey(manifest.generation, index)
        );
        if (typeof chunk !== "string") return void 0;
        json += chunk;
      }
      if (json.length !== manifest.byteCount) return void 0;
      const value = JSON.parse(json);
      this.#lastJson = json;
      return value;
    } catch {
      return void 0;
    }
  }
  saveWithResult(value) {
    const json = JSON.stringify(value);
    if (json === this.#lastJson) return "unchanged";
    const chunks = splitIntoChunks(json, this.chunkSize);
    let previous;
    const generation = this.#createGeneration();
    try {
      previous = this.#getActiveManifest();
      for (let index = 0; index < chunks.length; index++) {
        this.target.setDynamicProperty(this.#chunkKey(generation, index), chunks[index]);
      }
      this.target.setDynamicProperty(this.#manifestKey(), serializeManifest({
        byteCount: json.length,
        chunkCount: chunks.length,
        generation
      }));
      this.#lastJson = json;
    } catch {
      return "failed";
    }
    if (previous && previous.generation !== generation) {
      this.#tryDeleteGeneration(previous.generation, previous.chunkCount);
    }
    return "saved";
  }
  clear() {
    let manifest;
    try {
      manifest = this.#getActiveManifest();
      this.target.setDynamicProperty(this.#manifestKey());
      this.#lastJson = void 0;
    } catch {
      return false;
    }
    if (manifest) this.#tryDeleteGeneration(manifest.generation, manifest.chunkCount);
    return true;
  }
  /** Best-effort reclamation of a superseded generation's chunk properties. */
  #tryDeleteGeneration(generation, chunkCount) {
    try {
      for (let index = 0; index < chunkCount; index++) {
        this.target.setDynamicProperty(this.#chunkKey(generation, index));
      }
    } catch {
    }
  }
  #createGeneration() {
    return `${Date.now().toString(36)}_${(this.#nextGeneration++).toString(36)}`;
  }
  #getActiveManifest() {
    const raw = this.target.getDynamicProperty(this.#manifestKey());
    return typeof raw === "string" ? parseManifest(raw) : void 0;
  }
  #manifestKey() {
    return `${this.prefix}_active`;
  }
  #chunkKey(generation, index) {
    return `${this.prefix}_g_${generation}_${index}`;
  }
}
function serializeManifest(manifest) {
  return [
    manifest.generation,
    manifest.chunkCount,
    manifest.byteCount
  ].join("|");
}
function parseManifest(value) {
  const [generation, chunks, bytes, extra] = value.split("|");
  const chunkCount = Number.parseInt(chunks ?? "", 10);
  const byteCount = Number.parseInt(bytes ?? "", 10);
  if (!generation || extra !== void 0 || !Number.isFinite(chunkCount) || !Number.isFinite(byteCount) || chunkCount < 1 || byteCount < 0) return void 0;
  return { byteCount, chunkCount, generation };
}
function splitIntoChunks(value, size) {
  const chunks = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks;
}
export {
  DynamicPropertyJsonStore
};
