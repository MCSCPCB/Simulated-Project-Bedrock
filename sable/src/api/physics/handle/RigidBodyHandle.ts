// Engine-facing rigid body handle a sub-level owns: velocity, mass, collider
// and force operations forwarded to the cannon pipeline body, with spatial
// index notifications on bounds changes. Migrated from TreePhysics
// src/Physics.ts (PhysicsBody); getVisualRotation is exposed as
// getRenderRotation, the name sable's render bodies use.
import type { Vector3 } from "@minecraft/server";
import type { CannonPhysicsBody } from "../../../physics/impl/cannon/CannonPhysicsPipeline.js";
import type { SubLevelPhysicsDimension } from "../../../sublevel/system/SubLevelPhysicsDimension.js";
import type {
  PhysicsBodyAabb,
  PhysicsBodyBuoyancyPoint,
  PhysicsBodyCollider,
  PhysicsBodyForceOptions,
  PhysicsBodyTeleportOptions,
  PhysicsInertiaTensor
} from "../PhysicsTypes.js";

export class RigidBodyHandle {
  readonly id: number;
  readonly dimension: SubLevelPhysicsDimension;
  readonly name?: string;
  readonly #pipelineBody: CannonPhysicsBody;
  readonly #onBoundsChanged: () => void;
  readonly #onRemoved: () => void;

  constructor(
    dimension: SubLevelPhysicsDimension,
    pipelineBody: CannonPhysicsBody,
    name?: string,
    onBoundsChanged: () => void = () => undefined,
    onRemoved: () => void = () => undefined
  ) {
    this.dimension = dimension;
    this.#pipelineBody = pipelineBody;
    this.id = pipelineBody.id;
    this.name = name;
    this.#onBoundsChanged = onBoundsChanged;
    this.#onRemoved = onRemoved;
  }

  get isActive(): boolean { return this.#pipelineBody.isActive; }
  get isInNativeFlowingFluid(): boolean { return this.#pipelineBody.isInNativeFlowingFluid; }
  get isSleeping(): boolean { return this.#pipelineBody.isSleeping; }
  get isValid(): boolean { return this.#pipelineBody.isValid; }
  get lavaSubmersionRatio(): number { return this.#pipelineBody.lavaSubmersionRatio; }
  get location(): Vector3 { return this.#pipelineBody.location; }
  get velocity(): Vector3 { return this.#pipelineBody.velocity; }
  get angularVelocity(): Vector3 { return this.#pipelineBody.angularVelocity; }

  getAabb(): PhysicsBodyAabb { return this.#pipelineBody.getAabb(); }
  getAngularVelocity(): Vector3 { return this.#pipelineBody.getAngularVelocity(); }
  getCenterOfMass(): Vector3 { return this.#pipelineBody.getCenterOfMass(); }
  getEffectiveInertia(direction: Vector3): number {
    return this.#pipelineBody.getEffectiveInertia(direction);
  }
  getInertia(): Vector3 { return this.#pipelineBody.getInertia(); }
  getInertiaTensor(): PhysicsInertiaTensor { return this.#pipelineBody.getInertiaTensor(); }
  getEffectiveMassAt(location: Vector3, direction: Vector3): number {
    return this.#pipelineBody.getEffectiveMassAt(location, direction);
  }
  getMass(): number { return this.#pipelineBody.getMass(); }
  getShapeCount(): number { return this.#pipelineBody.getShapeCount(); }
  getRotation(): Vector3 { return this.#pipelineBody.getRotation(); }
  getRenderRotation(reference?: Vector3): Vector3 {
    return this.#pipelineBody.getRenderRotation(reference);
  }
  getVelocity(): Vector3 { return this.#pipelineBody.getVelocity(); }
  getVelocityAt(location: Vector3): Vector3 { return this.#pipelineBody.getVelocityAt(location); }
  localPointToWorld(location: Vector3): Vector3 {
    return this.#pipelineBody.localPointToWorld(location);
  }
  worldPointToLocal(location: Vector3): Vector3 {
    return this.#pipelineBody.worldPointToLocal(location);
  }

  clearVelocity(): void {
    this.setVelocity({ x: 0, y: 0, z: 0 });
    this.setAngularVelocity({ x: 0, y: 0, z: 0 });
  }

  setAngularVelocity(velocity: Vector3): void { this.#pipelineBody.setAngularVelocity(velocity); }
  setCenterOfMass(centerOfMass: Vector3): void {
    this.#pipelineBody.setCenterOfMass(centerOfMass);
    this.#onBoundsChanged();
  }
  setInertia(inertia: Vector3): void { this.#pipelineBody.setInertia(inertia); }
  setInertiaTensor(inertia: PhysicsInertiaTensor): void { this.#pipelineBody.setInertiaTensor(inertia); }
  setMass(mass: number): void { this.#pipelineBody.setMass(mass); }
  setBuoyancyPoints(points: readonly PhysicsBodyBuoyancyPoint[]): void {
    this.#pipelineBody.setBuoyancyPoints(points);
  }
  setCollider(collider: PhysicsBodyCollider): void {
    this.#pipelineBody.setCollider(collider);
    this.#onBoundsChanged();
  }
  setColliderIncrementally(collider: PhysicsBodyCollider): void {
    this.#pipelineBody.setColliderIncrementally(collider);
    this.#onBoundsChanged();
  }
  setEnvironmentCollider(collider: PhysicsBodyCollider): void {
    this.#pipelineBody.setEnvironmentCollider(collider);
  }
  setRotation(rotation: Vector3): void {
    this.#pipelineBody.setRotation(rotation);
    this.#onBoundsChanged();
  }
  setVelocity(velocity: Vector3): void { this.#pipelineBody.setVelocity(velocity); }
  sleep(): void { this.#pipelineBody.sleep(); }
  wakeUp(): void { this.#pipelineBody.wakeUp(); }

  applyForce(force: Vector3, options?: PhysicsBodyForceOptions): void {
    this.#pipelineBody.applyForce(force, options?.coordinateSpace ?? "world");
  }

  applyForceAt(location: Vector3, force: Vector3, options?: PhysicsBodyForceOptions): void {
    this.#pipelineBody.applyForceAt(location, force, options?.coordinateSpace ?? "world");
  }

  applyImpulse(impulse: Vector3): void { this.#pipelineBody.applyImpulse(impulse); }
  applyImpulseAt(location: Vector3, impulse: Vector3): void {
    this.#pipelineBody.applyImpulseAt(location, impulse);
  }
  applyTorque(torque: Vector3, options?: PhysicsBodyForceOptions): void {
    this.#pipelineBody.applyTorque(torque, options?.coordinateSpace ?? "world");
  }
  applyTorqueImpulse(torque: Vector3): void { this.#pipelineBody.applyTorqueImpulse(torque); }
  teleport(location: Vector3, options?: PhysicsBodyTeleportOptions): void {
    this.#pipelineBody.teleport(location, options);
    this.#onBoundsChanged();
  }
  remove(): void {
    this.#onRemoved();
    this.#pipelineBody.remove();
  }
}
