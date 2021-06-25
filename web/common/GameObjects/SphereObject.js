/** @module SphereObject */

import GameObject from './GameObject.js';
import * as CANNON from '../lib/cannon/cannon-es.js';

/**
 * A game object with the shape of a sphere
 */
export default class SphereObject extends GameObject {
    /**
     * @param {CANNON.World} world The physics world to add the object to
     * @param {WebGLProgram} program The shader program to use for rendering
     * @param {string} shaderType The type of shader used. 'colored' or 'lit'
     * @param {Object} sphereMesh The object representing the graphical mesh to
     * be used for the sphere
     * @param {Object} [options={}] Optional options for the object
     * @param {Array<number>} [options.position] The sphere's default position
     * @param {Array<number>} [options.orientation] The sphere's default
     *  orientation
     * @param {number} [options.radius] The sphere's radius
     * @param {Array<number>} [options.mass] The sphere's mass
     * @param {Array<number>} [options.color] The sphere's color
     * @param {Object} [options.lightParams] Object containing the sphere's
     *  light coefficients
     * @param {Array<number>} [options.portable] Whether the sphere can be
     *  picked up
     * @param {Array<number>} [options.collisionFilterGroup] The sphere's
     *  collision group
     * @param {Array<number>} [options.collisionFilterMask] The sphere's
     * collision mask
     */
    constructor(world, program, shaderType, sphereMesh, options = {}) {
        const radius = options.radius == undefined ? 1 : options.radius;

        const opts = options;
        opts.scale = [radius, radius, radius];
        super(program, shaderType, opts);

        this.physicsBody.addShape(new CANNON.Sphere(radius));
        this.physicsBody.angularDamping = 0.3;
        world.addBody(this.physicsBody);
        this.initVBOs(sphereMesh);
    }

    /**
     * Initialize the game object's VBOs
     * @param {Object} mesh Object representing the graphical mesh 
     */
    initVBOs(mesh) {
        this.initVBOsWithMesh(mesh);
    }
}