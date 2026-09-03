import { isFancySubLevelOriginEncodable } from "./FancySubLevelModelCodec.js";
const FANCY_MODEL_DENSE_WIDTH = 7;
const FANCY_MODEL_DENSE_HEIGHT = 5;
const FANCY_MODEL_DENSE_DEPTH = 7;
const FANCY_MODEL_DENSE_SLOT_COUNT = FANCY_MODEL_DENSE_WIDTH * FANCY_MODEL_DENSE_HEIGHT * FANCY_MODEL_DENSE_DEPTH;
const FANCY_MODEL_SPARSE_SIZE = 64;
const FANCY_MODEL_SPARSE_SLOT_COUNT = 26;
const FANCY_MODEL_PROPERTY_BITS = 24;
const FANCY_MODEL_SPARSE_STATE_SPAN = 64;
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
  const models = [];
  for (const group of groups.values()) {
    const dense = packDense(group);
    const sparse = packSparse(group);
    const validDense = dense.every((model) => isFancySubLevelOriginEncodable(model.anchorLocalLocation));
    const validSparse = sparse.every((model) => isFancySubLevelOriginEncodable(model.anchorLocalLocation));
    if (!validDense && !validSparse) {
      unsupported.push(...group);
      continue;
    }
    if (!validDense) models.push(...sparse);
    else if (!validSparse) models.push(...dense);
    else models.push(...preferDense(dense, sparse) ? dense : sparse);
  }
  models.sort(comparePackedModels);
  return { models, unsupported };
}
function packDense(blocks) {
  const stateBits = storedStateBits(blocks[0].model);
  const slotsPerWord = Math.floor(FANCY_MODEL_PROPERTY_BITS / stateBits);
  const wordCount = Math.ceil(FANCY_MODEL_DENSE_SLOT_COUNT / slotsPerWord);
  const origin = {
    x: chooseAxisOrigin(blocks, "x", FANCY_MODEL_DENSE_WIDTH),
    y: chooseAxisOrigin(blocks, "y", FANCY_MODEL_DENSE_HEIGHT),
    z: chooseAxisOrigin(blocks, "z", FANCY_MODEL_DENSE_DEPTH)
  };
  const result = [];
  for (const [anchorLocalLocation, bucket] of bucketBlocks(
    blocks,
    origin,
    FANCY_MODEL_DENSE_WIDTH,
    FANCY_MODEL_DENSE_HEIGHT,
    FANCY_MODEL_DENSE_DEPTH
  )) {
    const words = new Array(wordCount).fill(0);
    const assignments = [];
    for (const entry of bucket) {
      const x = entry.block.localLocation.x - anchorLocalLocation.x;
      const y = entry.block.localLocation.y - anchorLocalLocation.y;
      const z = entry.block.localLocation.z - anchorLocalLocation.z;
      const slot = y * FANCY_MODEL_DENSE_WIDTH * FANCY_MODEL_DENSE_DEPTH + z * FANCY_MODEL_DENSE_WIDTH + x;
      const word = Math.floor(slot / slotsPerWord);
      const shift = slot % slotsPerWord * stateBits;
      const storedState = entry.state + 1;
      words[word] = (words[word] ?? 0) | storedState * 2 ** shift;
      assignments.push({
        bitCount: stateBits,
        blockKey: fancySubLevelBlockKey(entry.block.localLocation),
        shift,
        slot,
        word
      });
    }
    assignments.sort((left, right) => left.slot - right.slot);
    result.push({
      anchorLocalLocation,
      assignments,
      blockCount: bucket.length,
      depth: FANCY_MODEL_DENSE_DEPTH,
      entityTypeId: blocks[0].model.denseEntityTypeId,
      format: "dense",
      height: FANCY_MODEL_DENSE_HEIGHT,
      model: blocks[0].model,
      stateBits,
      width: FANCY_MODEL_DENSE_WIDTH,
      words
    });
  }
  return result;
}
function packSparse(blocks) {
  const origin = {
    x: chooseCenteredAxisOrigin(blocks, "x", FANCY_MODEL_SPARSE_SIZE),
    y: chooseCenteredAxisOrigin(blocks, "y", FANCY_MODEL_SPARSE_SIZE),
    z: chooseCenteredAxisOrigin(blocks, "z", FANCY_MODEL_SPARSE_SIZE)
  };
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
        const storedState = entry.state + 1;
        words[slot] = storedState + x * 64 + y * 4096 + z * 262144;
        assignments.push({
          bitCount: 6,
          blockKey: fancySubLevelBlockKey(entry.block.localLocation),
          shift: 0,
          slot,
          word: slot
        });
      }
      result.push({
        anchorLocalLocation,
        assignments,
        blockCount: chunk.length,
        depth: FANCY_MODEL_SPARSE_SIZE,
        entityTypeId: blocks[0].model.sparseEntityTypeId,
        format: "sparse",
        height: FANCY_MODEL_SPARSE_SIZE,
        model: blocks[0].model,
        stateBits: 6,
        width: FANCY_MODEL_SPARSE_SIZE,
        words
      });
    }
  }
  return result;
}
function preferDense(dense, sparse) {
  if (dense.length !== sparse.length) return dense.length < sparse.length;
  const denseCapacity = dense.length * FANCY_MODEL_DENSE_SLOT_COUNT;
  const sparseCapacity = sparse.length * FANCY_MODEL_SPARSE_SLOT_COUNT;
  if (denseCapacity !== sparseCapacity) return denseCapacity < sparseCapacity;
  return true;
}
function storedStateBits(model) {
  return (model.state?.bits ?? 0) + 1;
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
function comparePackedModels(left, right) {
  return left.entityTypeId.localeCompare(right.entityTypeId) || left.anchorLocalLocation.y - right.anchorLocalLocation.y || left.anchorLocalLocation.z - right.anchorLocalLocation.z || left.anchorLocalLocation.x - right.anchorLocalLocation.x;
}
function fancySubLevelBlockKey(location) {
  return `${location.x},${location.y},${location.z}`;
}
export {
  FANCY_MODEL_DENSE_DEPTH,
  FANCY_MODEL_DENSE_HEIGHT,
  FANCY_MODEL_DENSE_SLOT_COUNT,
  FANCY_MODEL_DENSE_WIDTH,
  FANCY_MODEL_PROPERTY_BITS,
  FANCY_MODEL_SPARSE_SIZE,
  FANCY_MODEL_SPARSE_SLOT_COUNT,
  FANCY_MODEL_SPARSE_STATE_SPAN,
  fancySubLevelBlockKey,
  packFancySubLevelModels
};
