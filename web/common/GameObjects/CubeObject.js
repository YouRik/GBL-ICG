/** @module CubeObject */

import BoxObject from './BoxObject.js';

/**
 * A game object in the shape of a cube
 * @extends BoxObject
 */
export default class CubeObject extends BoxObject {
    /**
     * @param {CANNON.World} world The physics world to add the cube to 
     * @param {WebGLProgram} program The shader program to use for rendering
     * @param {string} shaderType Type of shader used. 'colored' or 'lit'
     * @param {object} [options={}] Optional options for the object
     *  If none is given, one will be constructed from the physics meshes
     * @param {Array<number>} [options.position] The object's default position
     * @param {Array<number>} [options.orientation] The object's default
     *  orientation
     * @param {number} [options.halfExtent] The cube's half extent
     * @param {Array<number>} [options.mass] The object's mass
     * @param {Array<number>} [options.color] The object's color
     * @param {Object} [options.lightParams] The object's light coefficients
     * @param {boolean} [options.portable] Whether the object can be picked
     * @param {number} [options.collisionFilterGroup] The object's collision
     *  group
     * @param {number} [options.collisionFilterMask] The object's collision
     *  mask
    */
    constructor(world, program, shaderType, options = {}) {
        const halfExtent = options.halfExtent == undefined ? 1
            : options.halfExtent;

        const opts = options;
        opts.halfExtents = [halfExtent, halfExtent, halfExtent];
        super(world, program, shaderType, opts);
    }
}