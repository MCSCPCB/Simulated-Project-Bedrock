function mergeStackableItemDrops(drops) {
  const groups = [];
  const groupsByTypeId = /* @__PURE__ */ new Map();
  for (const drop of drops) {
    const candidates = groupsByTypeId.get(drop.item.typeId);
    const group = candidates?.find((candidate) => canMergeItemStacks(candidate.exemplar, drop.item));
    if (group) {
      group.drops.push(drop);
      group.totalAmount += itemAmount(drop.item);
      continue;
    }
    const created = {
      drops: [drop],
      exemplar: drop.item,
      maximumAmount: itemMaximumAmount(drop.item),
      totalAmount: itemAmount(drop.item)
    };
    groups.push(created);
    if (candidates) candidates.push(created);
    else groupsByTypeId.set(drop.item.typeId, [created]);
  }
  const merged = [];
  for (const group of groups) {
    if (group.drops.length === 1) {
      merged.push(group.drops[0]);
      continue;
    }
    const stackCount = Math.ceil(group.totalAmount / group.maximumAmount);
    const equalAmount = Math.floor(group.totalAmount / stackCount);
    const remainder = group.totalAmount % stackCount;
    for (let index = 0; index < stackCount; index++) {
      merged.push({
        item: cloneItemStackWithAmount(
          group.exemplar,
          equalAmount + Number(index < remainder)
        ),
        location: selectMergedDropLocation(
          group.drops,
          (index + 0.5) / stackCount,
          group.totalAmount
        )
      });
    }
  }
  return merged;
}
function totalItemAmount(drops) {
  let total = 0;
  for (const drop of drops) total += itemAmount(drop.item);
  return total;
}
function canMergeItemStacks(left, right) {
  return isMergeableItemStack(left) && isMergeableItemStack(right) && left.isStackableWith(right);
}
function isMergeableItemStack(item) {
  return item.isStackable && item.maxAmount > 1;
}
function cloneItemStackWithAmount(item, amount) {
  const cloned = item.clone();
  cloned.amount = amount;
  return cloned;
}
function itemAmount(item) {
  return Math.max(1, Math.floor(item.amount));
}
function itemMaximumAmount(item) {
  return Math.max(1, Math.floor(item.maxAmount));
}
function selectMergedDropLocation(drops, fraction, totalAmount) {
  const target = fraction * totalAmount;
  let cumulative = 0;
  for (const drop of drops) {
    cumulative += itemAmount(drop.item);
    if (cumulative >= target) return drop.location;
  }
  return drops[drops.length - 1].location;
}
export {
  mergeStackableItemDrops,
  totalItemAmount
};
