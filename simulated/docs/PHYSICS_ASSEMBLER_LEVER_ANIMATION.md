# Physics Assembler Lever Frames

The world block now uses one geometry identifier, `geometry.physics_assembler`,
with 256 pre-rotated lever bones selected through `bone_visibility`.
`lever.geo.json` is retained as the original static lever source and is not the
world block geometry.

## State encoding

The block declares two integer states:

- `simulated:lever_frame_major`: `0..15`
- `simulated:lever_frame_minor`: `0..15`

The frame index is encoded as:

```text
frame = major * 16 + minor
```

Frame `0` is the unraised lever and frame `255` is the fully flicked lever.
The pre-baked angle is:

```text
angle_degrees = 45 * frame / 255
```

This gives 256 discrete positions over the original Java range of 0..45
degrees, or approximately 0.17647 degrees per step. Each frame bone has pivot
`[0, 7, 0]` and an X-axis rotation matching the Java renderer's EAST-axis
rotation. The block's existing face and cardinal-direction transformations are
still applied to the complete geometry.

## Visibility mapping

Every `lever_frame_NNN` bone has one exact Molang condition in the block's
`minecraft:geometry.bone_visibility` map. The condition compares both encoded
states, so exactly one lever bone is visible for every valid frame pair; the
`physics_assembler` body bone remains visible.

The 24 existing placement-orientation combinations plus the 256 frame pairs
produce 6,144 theoretical block permutations, below the 65,536 limit. The
selection box and collision boxes are unchanged; `bone_visibility` only changes
rendered bones and does not create a separate lever hitbox.

## Runtime contract

Changing a block permutation with Script API `BlockPermutation.withState()` and
`Block.setPermutation()` is the future runtime hook for advancing the frame.
No state-writing or input behavior is added in this step. State changes remain
subject to the normal world tick/update rate, while the 256 pre-baked states
control angular precision.
