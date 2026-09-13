// After-event payloads and signals the cannon physics pipeline emits: step,
// collision (including the indexed world-sensor hit side channel), and the
// water/lava entry events. Migrated from TreePhysics
// src/physics/simulation/CannonKernelEvents.ts.
import type { Vector3 } from "@minecraft/server";
import type { PhysicsCollisionTag } from "../../../api/physics/PhysicsTypes.js";
import type { CannonPhysicsBody, CannonPhysicsPipeline } from "./CannonPhysicsPipeline.js";

export interface CannonPipelineStepAfterEvent {
  currentTick: number;
  fixedTimeStep: number;
  pipeline: CannonPhysicsPipeline;
}

export interface CannonPipelineCollisionAfterEvent {
  body: CannonPhysicsBody;
  collisionTag?: PhysicsCollisionTag;
  currentTick: number;
  impactSpeed: number;
  indexedWorldSensorHits?: readonly CannonPipelineIndexedWorldSensorHit[];
  normal: Vector3;
  otherBody?: CannonPhysicsBody;
  otherCollisionTag?: PhysicsCollisionTag;
  point: Vector3;
}

export interface CannonPipelineIndexedWorldSensorHit {
  readonly collisionTag?: PhysicsCollisionTag;
  readonly impactSpeed: number;
  readonly normal: Vector3;
  readonly point: Vector3;
  readonly worldBlockLocation: Vector3;
}

export interface CannonPipelineWaterEntryAfterEvent {
  body: CannonPhysicsBody;
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

export interface CannonPipelineLavaEntryAfterEvent extends CannonPipelineWaterEntryAfterEvent {}

type CannonPipelineEventCallback<T> = (event: T) => void;

class CannonPipelineAfterEventSignal<T> {
  readonly #callbacks = new Set<CannonPipelineEventCallback<T>>();

  subscribe(callback: CannonPipelineEventCallback<T>): CannonPipelineEventCallback<T> {
    this.#callbacks.add(callback);
    return callback;
  }

  unsubscribe(callback: CannonPipelineEventCallback<T>): void {
    this.#callbacks.delete(callback);
  }

  emit(event: T): void {
    for (const callback of this.#callbacks) callback(event);
  }
}

export class CannonPhysicsPipelineAfterEvents {
  readonly collision = new CannonPipelineAfterEventSignal<CannonPipelineCollisionAfterEvent>();
  readonly lavaEntry = new CannonPipelineAfterEventSignal<CannonPipelineLavaEntryAfterEvent>();
  readonly step = new CannonPipelineAfterEventSignal<CannonPipelineStepAfterEvent>();
  readonly waterEntry = new CannonPipelineAfterEventSignal<CannonPipelineWaterEntryAfterEvent>();
}
