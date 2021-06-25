/** @module Cloud */
import * as CANNON from '../lib/cannon/cannon-es.js';
import * as GLMAT from '../lib/gl-matrix/index.js';
import MeshObject from './MeshObject.js';

/**
 * A cloud object that moves from a start to an end position and then resets to
 *  the start position
 */
export default class Cloud extends MeshObject {
    /**
     * 
     * @param {CANNON.World} world The physics world to add the object to
     * @param {Object} programs Object containing named shader programs to pick
     *  the right one out of
     * @param {Array<number>} startPosition The position to start at
     * @param {Array<number>} endPosition The position to end at
     * @param {number} speed The speed at which to move
     * @param {Object} meshes Object containing the meshes to pick the right one
     *  out of
     * @param {object} [options={}] Optional options for the object
     *  If none is given, one will be constructed from the physics meshes
     * @param {Array<number>} [options.orientation] The object's default
     *  orientation
     * @param {Array<number>} [options.scale] The object's default scale
     * @param {Object} [options.lightParams] The object's light coefficients
     * @param {number} [options.collisionFilterGroup] The object's collision
     *  group
     * @param {number} [options.collisionFilterMask] The object's collision
     *  mask
     */
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

        // Calculate velocity to move at
        const velocity = GLMAT.vec3.create();
        GLMAT.vec3.sub(velocity, endPosition, startPosition);
        GLMAT.vec3.normalize(velocity, velocity);
        GLMAT.vec3.scale(velocity, velocity, speed);

        // Set constant velocity for kinematic body, moves the cloud constantly
        this.physicsBody.velocity = new CANNON.Vec3(
            velocity[0], velocity[1], velocity[2]);
    }

    /**
     * Update the cloud to make it reset its position
     */
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