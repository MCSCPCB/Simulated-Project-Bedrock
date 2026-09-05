import { isFancySubLevelOriginEncodable } from "./FancySubLevelModelCodec.js";
const FANCY_MODEL_DENSE_SLOT_BUDGET = 245;
const FANCY_MODEL_DENSE_MAX_AXIS = 32;
const FANCY_MODEL_SPARSE_SIZE = 64;
const FANCY_MODEL_SPARSE_SLOT_COUNT = 26;
const FANCY_MODEL_POOL_SLOT_COUNT = 26;
const FANCY_MODEL_PROPERTY_BITS = 24;
const FANCY_MODEL_SPARSE_STATE_SPAN = 64;
const FOLIAGE_DENSE_CANDIDATE = { depth: 7, height: 5, width: 7 };
const DENSE_CANDIDATES = createDenseCandidates();
function createDenseCandidates() {
  const all = [];
  for (let width = 1; width <= FANCY_MODEL_DENSE_MAX_AXIS; width++) {
    for (let depth = 1; depth <= FANCY_MODEL_DENSE_MAX_AXIS; depth++) {
      if (width * depth > FANCY_MODEL_DENSE_SLOT_BUDGET) continue;
      all.push({
        depth,
        height: Math.floor(FANCY_MODEL_DENSE_SLOT_BUDGET / (width * depth)),
        width
      });
    }
  }
  return all.filter((candidate) => !all.some((other) => other !== candidate && other.width >= candidate.width && other.height >= candidate.height && other.depth >= candidate.depth && (other.width > candidate.width || other.height > candidate.height || other.depth > candidate.depth)));
}
function packFancySubLevelModels(blocks) {
  const groups = /* @__PURE__ */ new Map();
  const unsupported = [];
  for (const block of blocks) {
    if (!isPackableBlock(block)) {
      unsupported.push(block);
      continue;
    }
    const group = groups.get(block.model.key);
    if (group) group.push(block);
    else groups.set(block.model.key, [block]);
  }
  const packedGroups = [];
  for (const group of groups.values()) {
    const packs = packModelGroup(group);
    if (!packs) {
      unsupported.push(...group);
      continue;
    }
    packedGroups.push({ blocks: group, packs });
  }
  const models = applyPoolPacking(packedGroups);
  models.sort(comparePackedModels);
  return { models, unsupported };
}
function packModelGroup(group) {
  const model = group[0].model;
  const foliage = model.tint?.method === "foliage";
  const candidates = foliage ? [FOLIAGE_DENSE_CANDIDATE] : DENSE_CANDIDATES;
  const sparseOrigin = {
    x: chooseCenteredAxisOrigin(group, "x", FANCY_MODEL_SPARSE_SIZE),
    y: chooseCenteredAxisOrigin(group, "y", FANCY_MODEL_SPARSE_SIZE),
    z: chooseCenteredAxisOrigin(group, "z", FANCY_MODEL_SPARSE_SIZE)
  };
  const sparseBoxes = bucketBlocks(
    group,
    sparseOrigin,
    FANCY_MODEL_SPARSE_SIZE,
    FANCY_MODEL_SPARSE_SIZE,
    FANCY_MODEL_SPARSE_SIZE
  );
  const sparseValid = sparseBoxes.every(([anchor]) => isFancySubLevelOriginEncodable(anchor));
  const sparseBoxKey = /* @__PURE__ */ new Map();
  for (const [anchor, bucket] of sparseBoxes) {
    const key = fancySubLevelBlockKey(anchor);
    for (const entry of bucket) sparseBoxKey.set(entry, key);
  }
  let best;
  for (const candidate of candidates) {
    const origin = {
      x: chooseAxisOrigin(group, "x", candidate.width),
      y: chooseAxisOrigin(group, "y", candidate.height),
      z: chooseAxisOrigin(group, "z", candidate.depth)
    };
    const buckets = [...bucketBlocks(group, origin, candidate.width, candidate.height, candidate.depth)];
    if (buckets.some(([anchor]) => !isFancySubLevelOriginEncodable(anchor))) continue;
    buckets.sort((left, right) => left[1].length - right[1].length || compareAnchors(left[0], right[0]));
    const boxCounts = /* @__PURE__ */ new Map();
    let sparseEntities = 0;
    const maximumEvictions = sparseValid && !foliage ? buckets.length : 0;
    for (let evicted = 0; evicted <= maximumEvictions; evicted++) {
      const entities = buckets.length - evicted + sparseEntities;
      const capacity = (buckets.length - evicted) * candidate.width * candidate.height * candidate.depth + sparseEntities * FANCY_MODEL_SPARSE_SLOT_COUNT;
      if (!best || entities < best.entities || entities === best.entities && capacity < best.capacity || entities === best.entities && capacity === best.capacity && sparseEntities < best.sparseEntities) {
        best = {
          candidate,
          capacity,
          entities,
          evicted: buckets.slice(0, evicted).flatMap(([, bucket2]) => bucket2),
          kept: buckets.slice(evicted),
          sparseEntities
        };
      }
      const bucket = buckets[evicted];
      if (!bucket) break;
      for (const entry of bucket[1]) {
        const key = sparseBoxKey.get(entry);
        const count = boxCounts.get(key) ?? 0;
        boxCounts.set(key, count + 1);
        sparseEntities += Math.ceil((count + 1) / FANCY_MODEL_SPARSE_SLOT_COUNT) - Math.ceil(count / FANCY_MODEL_SPARSE_SLOT_COUNT);
      }
    }
  }
  if (!best) return void 0;
  const result = [];
  for (const [anchor, bucket] of best.kept) {
    result.push(packDenseBucket(model, best.candidate, anchor, bucket));
  }
  result.push(...packSparseBlocks(model, sparseOrigin, best.evicted));
  return result;
}
function packDenseBucket(model, candidate, anchorLocalLocation, bucket) {
  const storedBits = (model.state?.bits ?? 0) + 1;
  const slotsPerWord = Math.floor(FANCY_MODEL_PROPERTY_BITS / storedBits);
  const slotCount = candidate.width * candidate.height * candidate.depth;
  const words = new Array(Math.ceil(slotCount / slotsPerWord)).fill(0);
  const assignments = [];
  for (const entry of bucket) {
    const x = entry.block.localLocation.x - anchorLocalLocation.x;
    const y = entry.block.localLocation.y - anchorLocalLocation.y;
    const z = entry.block.localLocation.z - anchorLocalLocation.z;
    const slot = y * candidate.width * candidate.depth + z * candidate.width + x;
    const word = Math.floor(slot / slotsPerWord);
    const shift = slot % slotsPerWord * storedBits;
    words[word] = (words[word] ?? 0) | (entry.state + 1) * 2 ** shift;
    assignments.push({
      bitCount: storedBits,
      blockKey: fancySubLevelBlockKey(entry.block.localLocation),
      shift,
      slot,
      state: model.state,
      word
    });
  }
  assignments.sort((left, right) => left.slot - right.slot);
  return {
    anchorLocalLocation: { ...anchorLocalLocation },
    assignments,
    blockCount: bucket.length,
    depth: candidate.depth,
    entityTypeId: model.denseEntityTypeId,
    format: "dense",
    height: candidate.height,
    ...model.tint ? { tint: model.tint } : {},
    width: candidate.width,
    words
  };
}
function packSparseBlocks(model, origin, blocks) {
  const result = [];
  for (const [anchorLocalLocation, bucket] of bucketBlocks(
    blocks,
    origin,
    FANCY_MODEL_SPARSE_SIZE,
    FANCY_MODEL_SPARSE_SIZE,
    FANCY_MODEL_SPARSE_SIZE
  )) {
    bucket.sort(compareBlocks);
    for (let start = 0; start < bucket.length; start += FANCY_MODEL_SPARSE_SLOT_COUNT) {
      const chunk = bucket.slice(start, start + FANCY_MODEL_SPARSE_SLOT_COUNT);
      const words = new Array(FANCY_MODEL_SPARSE_SLOT_COUNT).fill(0);
      const assignments = [];
      for (let slot = 0; slot < chunk.length; slot++) {
        const entry = chunk[slot];
        const x = entry.block.localLocation.x - anchorLocalLocation.x;
        const y = entry.block.localLocation.y - anchorLocalLocation.y;
        const z = entry.block.localLocation.z - anchorLocalLocation.z;
        words[slot] = entry.state + 1 + x * 64 + y * 4096 + z * 262144;
        assignments.push({
          bitCount: 6,
          blockKey: fancySubLevelBlockKey(entry.block.localLocation),
          shift: 0,
          slot,
          state: model.state,
          word: slot
        });
      }
      result.push({
        anchorLocalLocation,
        assignments,
        blockCount: chunk.length,
        depth: FANCY_MODEL_SPARSE_SIZE,
        entityTypeId: model.sparseEntityTypeId,
        format: "sparse",
        height: FANCY_MODEL_SPARSE_SIZE,
        ...model.tint ? { tint: model.tint } : {},
        width: FANCY_MODEL_SPARSE_SIZE,
        words
      });
    }
  }
  return result;
}
function applyPoolPacking(packedGroups) {
  const byPool = /* @__PURE__ */ new Map();
  for (const group of packedGroups) {
    const model = group.blocks[0].model;
    const pool = model.pool;
    if (!pool || model.tint?.method === "foliage") continue;
    const members = byPool.get(pool.entityTypeId);
    if (members) members.push(group);
    else byPool.set(pool.entityTypeId, [group]);
  }
  for (const members of byPool.values()) {
    if (members.length < 2 && members[0].packs.length < 2) continue;
    members.sort((left, right) => left.packs.length - right.packs.length || left.blocks.length - right.blocks.length || left.blocks[0].model.key.localeCompare(right.blocks[0].model.key));
    const pool = members[0].blocks[0].model.pool;
    let bestPrefix = 0;
    let bestPool = [];
    let bestTotal = members.reduce((sum, member) => sum + member.packs.length, 0);
    const prefixBlocks = [];
    let remainder = bestTotal;
    for (let prefix = 1; prefix <= members.length; prefix++) {
      const member = members[prefix - 1];
      prefixBlocks.push(...member.blocks);
      remainder -= member.packs.length;
      const pooled = packPoolBlocks(pool, prefixBlocks);
      if (!pooled) break;
      const total = pooled.length + remainder;
      if (total < bestTotal) {
        bestPrefix = prefix;
        bestPool = pooled;
        bestTotal = total;
      }
    }
    for (let index = 0; index < bestPrefix; index++) members[index].packs = [];
    if (bestPrefix > 0) members[0].packs = bestPool;
  }
  return packedGroups.flatMap((group) => group.packs);
}
function packPoolBlocks(pool, blocks) {
  const width = 2 ** pool.xBits;
  const height = 2 ** pool.yBits;
  const depth = 2 ** pool.zBits;
  const familyPlace = 2 ** (pool.xBits + pool.yBits + pool.zBits);
  const statePlace = familyPlace * 2 ** pool.familyBits;
  const stateShift = pool.xBits + pool.yBits + pool.zBits + pool.familyBits;
  const occupiedPlace = statePlace * 2 ** pool.stateBits;
  const origin = {
    x: chooseCenteredAxisOrigin(blocks, "x", width),
    y: chooseCenteredAxisOrigin(blocks, "y", height),
    z: chooseCenteredAxisOrigin(blocks, "z", depth)
  };
  const result = [];
  for (const [anchorLocalLocation, bucket] of bucketBlocks(blocks, origin, width, height, depth)) {
    if (!isFancySubLevelOriginEncodable(anchorLocalLocation)) return void 0;
    bucket.sort(compareBlocks);
    for (let start = 0; start < bucket.length; start += FANCY_MODEL_POOL_SLOT_COUNT) {
      const chunk = bucket.slice(start, start + FANCY_MODEL_POOL_SLOT_COUNT);
      const words = new Array(FANCY_MODEL_POOL_SLOT_COUNT).fill(0);
      const assignments = [];
      let foliage = false;
      for (let slot = 0; slot < chunk.length; slot++) {
        const entry = chunk[slot];
        const x = entry.block.localLocation.x - anchorLocalLocation.x;
        const y = entry.block.localLocation.y - anchorLocalLocation.y;
        const z = entry.block.localLocation.z - anchorLocalLocation.z;
        words[slot] = x + y * 2 ** pool.xBits + z * 2 ** (pool.xBits + pool.yBits) + entry.model.pool.family * familyPlace + entry.state * statePlace + occupiedPlace;
        assignments.push({
          bitCount: pool.stateBits,
          blockKey: fancySubLevelBlockKey(entry.block.localLocation),
          shift: stateShift,
          slot,
          state: entry.model.state,
          word: slot
        });
        if (entry.model.tint?.method === "foliage") foliage = true;
      }
      result.push({
        anchorLocalLocation,
        assignments,
        blockCount: chunk.length,
        depth,
        entityTypeId: pool.entityTypeId,
        format: "pool",
        height,
        ...foliage ? { tint: { method: "foliage" } } : {},
        width,
        words
      });
    }
  }
  return result;
}
function isPackableBlock(entry) {
  const { x, y, z } = entry.block.localLocation;
  const maximumState = 2 ** (entry.model.state?.bits ?? 0) - 1;
  return Number.isInteger(x) && Number.isInteger(y) && Number.isInteger(z) && Number.isInteger(entry.state) && entry.state >= 0 && entry.state <= Math.max(0, maximumState) && entry.state + 1 < FANCY_MODEL_SPARSE_STATE_SPAN;
}
function chooseAxisOrigin(blocks, axis, size) {
  const minimum = Math.min(...blocks.map((entry) => entry.block.localLocation[axis]));
  let bestOrigin = minimum;
  let bestCount = Number.POSITIVE_INFINITY;
  for (let shift = 0; shift < size; shift++) {
    const origin = minimum - shift;
    const buckets = /* @__PURE__ */ new Set();
    for (const entry of blocks) {
      buckets.add(Math.floor((entry.block.localLocation[axis] - origin) / size));
    }
    if (buckets.size < bestCount) {
      bestOrigin = origin;
      bestCount = buckets.size;
    }
  }
  return bestOrigin;
}
function chooseCenteredAxisOrigin(blocks, axis, size) {
  const minimum = Math.min(...blocks.map((entry) => entry.block.localLocation[axis]));
  const center = (size - 1) / 2;
  let bestOrigin = minimum;
  let bestCount = Number.POSITIVE_INFINITY;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let shift = 0; shift < size; shift++) {
    const origin = minimum - shift;
    const buckets = /* @__PURE__ */ new Set();
    let distance = 0;
    for (const entry of blocks) {
      const relative = entry.block.localLocation[axis] - origin;
      const bucket = Math.floor(relative / size);
      buckets.add(bucket);
      distance += (relative - bucket * size - center) ** 2;
    }
    if (buckets.size < bestCount || buckets.size === bestCount && distance < bestDistance) {
      bestOrigin = origin;
      bestCount = buckets.size;
      bestDistance = distance;
    }
  }
  return bestOrigin;
}
function bucketBlocks(blocks, origin, width, height, depth) {
  const buckets = /* @__PURE__ */ new Map();
  for (const entry of blocks) {
    const x = Math.floor((entry.block.localLocation.x - origin.x) / width);
    const y = Math.floor((entry.block.localLocation.y - origin.y) / height);
    const z = Math.floor((entry.block.localLocation.z - origin.z) / depth);
    const key = `${x},${y},${z}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(entry);
    else buckets.set(key, [entry]);
  }
  return [...buckets].map(([key, bucket]) => {
    const [x, y, z] = key.split(",").map(Number);
    return [{
      x: origin.x + x * width,
      y: origin.y + y * height,
      z: origin.z + z * depth
    }, bucket];
  });
}
function compareBlocks(left, right) {
  return left.block.localLocation.y - right.block.localLocation.y || left.block.localLocation.z - right.block.localLocation.z || left.block.localLocation.x - right.block.localLocation.x;
}
function compareAnchors(left, right) {
  return left.y - right.y || left.z - right.z || left.x - right.x;
}
function comparePackedModels(left, right) {
  return left.entityTypeId.localeCompare(right.entityTypeId) || left.anchorLocalLocation.y - right.anchorLocalLocation.y || left.anchorLocalLocation.z - right.anchorLocalLocation.z || left.anchorLocalLocation.x - right.anchorLocalLocation.x;
}
function fancySubLevelBlockKey(location) {
  return `${location.x},${location.y},${location.z}`;
}
export {
  FANCY_MODEL_DENSE_MAX_AXIS,
  FANCY_MODEL_DENSE_SLOT_BUDGET,
  FANCY_MODEL_POOL_SLOT_COUNT,
  FANCY_MODEL_PROPERTY_BITS,
  FANCY_MODEL_SPARSE_SIZE,
  FANCY_MODEL_SPARSE_SLOT_COUNT,
  FANCY_MODEL_SPARSE_STATE_SPAN,
  fancySubLevelBlockKey,
  packFancySubLevelModels
};
