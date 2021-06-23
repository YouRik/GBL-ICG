/** @module Cloud */
import * as CANNON from '../lib/cannon/cannon-es.js';
import * as GLMAT from '../lib/gl-matrix/index.js';
import MeshObject from './MeshObject.js';

/**
 * TODO: docs
 */
export default class Cloud extends MeshObject {
    constructor(world, programs, startPosition, endPosition, speed, meshes,
        options = {}) {
        options.mass = 0;
        options.portable = false;
        options.color = [1, 1, 1, 0.3];
        options.graphicalMesh = meshes['cloudG'];
        options.position = startPosition;
        super(world, programs['colored'], 'colored', [], options);

        this.physicsBody.type = CANNON.Body.KINEMATIC;

        this.startPosition = startPosition;
        this.endPosition = endPosition;
        this.distanceToTravel = GLMAT.vec3.dist(startPosition, endPosition);

        const velocity = GLMAT.vec3.create();
        GLMAT.vec3.sub(velocity, endPosition, startPosition);
        GLMAT.vec3.normalize(velocity, velocity);
        GLMAT.vec3.scale(velocity, velocity, speed);

        // Set constant velocity for kinematic body, moves the cloud constantly
        this.physicsBody.velocity = new CANNON.Vec3(
            velocity[0], velocity[1], velocity[2]);
    }

    update() {
        // If the cloud reaches its endPosition, reset it to its startPosition
        // Because the cloud moves linearly from startPosition to endPosition
        // with no other directions taken, checking for distance to
        // startPosition is sufficient

        if (GLMAT.vec3.dist(this.position, this.startPosition)
            > this.distanceToTravel) {
            this.physicsBody.position = new CANNON.Vec3(this.startPosition[0],
                this.startPosition[1], this.startPosition[2]);
        }
        super.update();
    }
}