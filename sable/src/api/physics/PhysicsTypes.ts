// Engine-agnostic physics API types: collider definitions, rigid-body options,
// block physics properties, sub-level options with the runtime-representation
// hooks, and the after-event payloads. Migrated from TreePhysics
// src/physics/core/Types.ts; the render-entity body options and the raycast
// types are dropped (sable renders through SubLevelRenderer and the
// interaction handle already provides raycasts).
import type { Vector3 } from "@minecraft/server";
import type { SubLevelBlock, SubLevelFoliageTint } from "../../sublevel/SubLevel.js";
import type { RigidBodyHandle } from "./handle/RigidBodyHandle.js";

export const MAX_SUB_LEVEL_BLOCKS = 6144;

export interface PhysicsBodyBoxCollider {
  halfExtents?: Vector3;
  size?: Vector3;
  type: "box";
}

export interface PhysicsBodySphereCollider {
  radius: number;
  type: "sphere";
}

export interface PhysicsBodyCylinderCollider {
  height: number;
  radius?: number;
  radiusBottom?: number;
  radiusTop?: number;
  type: "cylinder";
}

export interface PhysicsBodyConvexCollider {
  faces: readonly (readonly number[])[];
  type: "convex";
  vertices: readonly Vector3[];
}

export type PhysicsBodyCompoundChildCollider =
  | PhysicsBodyBoxCollider
  | PhysicsBodySphereCollider
  | PhysicsBodyCylinderCollider
  | PhysicsBodyConvexCollider;

export interface PhysicsBodyCompoundColliderChild {
  collider: PhysicsBodyCompoundChildCollider;
  collisionTag?: PhysicsCollisionTag;
  collisionResponse?: boolean;
  location?: Vector3;
  rotation?: Vector3;
}

export type PhysicsCollisionTag = number | string;

export interface PhysicsBodyCompoundCollider {
  children: readonly PhysicsBodyCompoundColliderChild[];
  type: "compound";
}

export type PhysicsBodySolidCollider =
  | PhysicsBodyCompoundChildCollider
  | PhysicsBodyCompoundCollider;

export interface PhysicsBodySensorCollider {
  collider: PhysicsBodySolidCollider;
  type: "sensor";
}

export type PhysicsBodyCollider = PhysicsBodySolidCollider | PhysicsBodySensorCollider;
export type PhysicsBodyMotionType = "dynamic" | "kinematic" | "static";

export interface PhysicsBodyOptions {
  allowSleep?: boolean;
  angularDamping?: number;
  angularVelocity?: Vector3;
  buoyancyPoints?: readonly PhysicsBodyBuoyancyPoint[];
  collider?: PhysicsBodyCollider;
  environmentCollider?: PhysicsBodyCollider;
  gravityScale?: number;
  linearDamping?: number;
  location: Vector3;
  mass?: number;
  material?: string;
  motionType?: PhysicsBodyMotionType;
  name?: string;
  rotation?: Vector3;
  size?: Vector3;
  velocity?: Vector3;
}

export interface PhysicsBodyBuoyancyPoint {
  localLocation: Vector3;
  volume: number;
}

export interface PhysicsBodyForceOptions {
  coordinateSpace?: "world" | "local";
}

export interface PhysicsBodyTeleportOptions {
  angularVelocity?: Vector3;
  rotation?: Vector3;
  velocity?: Vector3;
}

export interface PhysicsInertiaTensor {
  m00: number;
  m01: number;
  m02: number;
  m10: number;
  m11: number;
  m12: number;
  m20: number;
  m21: number;
  m22: number;
}

export interface PhysicsContactMaterialProperties {
  friction?: number;
  restitution?: number;
}

export interface PhysicsBlockCollisionBox {
  max: Vector3;
  min: Vector3;
}

export interface PhysicsBlockProperties {
  /** Displaced fluid volume of one block of this type, in whole-block units. */
  buoyancyVolume?: number;
  collisionShape?: "full" | "none" | readonly PhysicsBlockCollisionBox[];
  fragileImpactSpeed?: number;
  friction?: number;
  /** Rigid-body mass of one block of this type. */
  mass?: number;
  restitution?: number;
}

export interface PhysicsBodyAabb {
  max: Vector3;
  min: Vector3;
}

export interface SubLevelPhysicsOptions {
  angularDamping?: number;
  fixedTimeStep?: number;
  gravity?: Vector3;
  linearDamping?: number;
}

export interface SubLevelPhysicsStats {
  activeBodyCount: number;
  bodyCount: number;
  fixedTimeStep: number;
  running: boolean;
  sleepingBodyCount: number;
  stepCount: number;
}

export interface SubLevelPhysicsStepAfterEvent {
  currentTick: number;
  fixedTimeStep: number;
}

export interface ServerSubLevelOptions {
  allowSleep?: boolean;
  angularVelocity?: Vector3;
  blocks: readonly SubLevelBlock[];
  foliageTint?: SubLevelFoliageTint;
  /** Fragile-block contact probes issued for this sub-level per tick. */
  fragileProbeBudget?: number;
  linearDamping?: number;
  angularDamping?: number;
  location: Vector3;
  name?: string;
  rotation?: Vector3;
  runtimeRepresentation?: SubLevelRuntimeRepresentationFactory;
  velocity?: Vector3;
  renderEntityTags?: readonly string[];
}

export interface SubLevelRuntimeRepresentation {
  readonly buoyancyPoints: readonly PhysicsBodyBuoyancyPoint[];
  readonly collider: PhysicsBodyCollider;
}

export interface SubLevelRuntimeRepresentationState {
  readonly representation: SubLevelRuntimeRepresentation;
  addBlocks?(blocks: readonly SubLevelBlock[]): SubLevelRuntimeRepresentation;
  removeBlocks(blocks: readonly SubLevelBlock[]): SubLevelRuntimeRepresentation;
}

export interface SubLevelRuntimeRepresentationFactory {
  (blocks: readonly SubLevelBlock[]): SubLevelRuntimeRepresentation;
  createIncrementalState?: (
    blocks: readonly SubLevelBlock[]
  ) => SubLevelRuntimeRepresentationState;
}

export interface PhysicsCollisionAfterEvent {
  body: RigidBodyHandle;
  collisionTag?: PhysicsCollisionTag;
  currentTick: number;
  impactSpeed: number;
  normal: Vector3;
  otherBody?: RigidBodyHandle;
  otherCollisionTag?: PhysicsCollisionTag;
  point: Vector3;
}

export interface PhysicsWaterEntryAfterEvent {
  body: RigidBodyHandle;
  fastestContactVelocityY: number;
  maxContactX: number;
  maxContactZ: number;
  minContactX: number;
  minContactZ: number;
  point: Vector3;
  timeStep: number;
  bodyAabbSizeX: number;
  bodyAabbSizeZ: number;
}

export interface PhysicsLavaEntryAfterEvent extends PhysicsWaterEntryAfterEvent {}
