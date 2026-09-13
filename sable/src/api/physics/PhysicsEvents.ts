// Physics after-event signals and payloads that sit above the engine: the
// generic subscribe/emit signal, the system-level after-event set, the surface
// particle payload emitted from player contact, and the indexed world-sensor
// hit side channel. Migrated from TreePhysics src/Physics.ts (EventSignal,
// PhysicsWorldAfterEvents, surface particle types) and
// src/physics/world/sensor/Batch.ts.
import type { Dimension, Vector3 } from "@minecraft/server";
import type { SubLevelBlock } from "../../sublevel/SubLevel.js";
import type {
  PhysicsCollisionAfterEvent,
  PhysicsCollisionTag,
  PhysicsLavaEntryAfterEvent,
  PhysicsWaterEntryAfterEvent,
  SubLevelPhysicsStepAfterEvent
} from "./PhysicsTypes.js";

export interface SubLevelSurfaceParticleProfile {
  readonly direction: Vector3;
  readonly directionRandomness: Vector3;
  readonly offsetRadius: Vector3;
  readonly particleCount: number;
  readonly speedMax: number;
  readonly speedMin: number;
}

export interface SubLevelSurfaceParticleAfterEvent {
  readonly subLevelId: number;
  readonly block: SubLevelBlock;
  readonly dimension: Dimension;
  readonly location: Vector3;
  readonly profile: SubLevelSurfaceParticleProfile;
}

type Callback<T> = (event: T) => void;

export class EventSignal<T> {
  readonly #callbacks = new Set<Callback<T>>();

  subscribe(callback: Callback<T>): Callback<T> {
    this.#callbacks.add(callback);
    return callback;
  }

  unsubscribe(callback: Callback<T>): void {
    this.#callbacks.delete(callback);
  }

  emit(event: T): void {
    for (const callback of this.#callbacks) callback(event);
  }
}

export class SubLevelPhysicsAfterEvents {
  readonly collision = new EventSignal<PhysicsCollisionAfterEvent>();
  readonly lavaEntry = new EventSignal<PhysicsLavaEntryAfterEvent>();
  readonly surfaceParticle = new EventSignal<SubLevelSurfaceParticleAfterEvent>();
  readonly step = new EventSignal<SubLevelPhysicsStepAfterEvent>();
  readonly waterEntry = new EventSignal<PhysicsWaterEntryAfterEvent>();
}

export interface IndexedWorldSensorHit {
  readonly collisionTag?: PhysicsCollisionTag;
  readonly impactSpeed: number;
  readonly normal: Vector3;
  readonly point: Vector3;
  readonly worldBlockLocation: Vector3;
}

// Side channel that rides indexed-world-sensor hits alongside a public collision
// event without widening the public event type: the pipeline dispatcher
// (SubLevelPhysicsDimension #emitCollision) attaches the hits keyed by the event
// object it is about to emit, and gameplay code (FragileBlockCallback
// handleCollision) reads them back from that same object. Keying the WeakMap by
// the event lets the hits be garbage-collected together with the event once
// every listener is done.
const hitsByCollisionEvent = new WeakMap<object, readonly IndexedWorldSensorHit[]>();

export function attachIndexedWorldSensorHits(
  event: object,
  hits: readonly IndexedWorldSensorHit[]
): void {
  hitsByCollisionEvent.set(event, hits);
}

export function getIndexedWorldSensorHits(
  event: object
): readonly IndexedWorldSensorHit[] | undefined {
  return hitsByCollisionEvent.get(event);
}
