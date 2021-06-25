/** @module LitPlatform */

import Box from './BoxObject.js';
import LightSource from '../LightSource.js';
/**
 * A platform with a small light above it
 * @extends Box
 */
export default class LitPlatform extends Box {
    /**
     * @param {CANNON.World} world The physics world to add the platform to
     * @param {Object} programs Object containing all shader program to pick the
     *  right one out of
     * @param {Array<WebGLProgram>} lightPrograms List of shader programs that
     * implement lighting
     * @param {object} [options={}] Optional options for the object
     *  If none is given, one will be constructed from the physics meshes
     * @param {Array<number>} [options.position] The object's default position
     * @param {Array<number>} [options.orientation] The object's default
     *  orientation
     * @param {Object} [options.lightParams] The object's light coefficients
     * @param {number} [options.collisionFilterGroup] The object's collision
     *  group
     * @param {boolean} [options.solid] Whether the platform can hold/collide
     *  with the player or not
     */
    constructor(world, programs, lightPrograms, options = {}) {
        options.halfExtents = [1.5, 0.1, 1.5];
        options.mass = 0;
        options.portable = false;
        options.color = [0.65, 0.38, 0.58];
        options.collisionFilterMask = options.solid ? -1 : ~4;
        // TASK3.4 Change vertexLighting to fragmentLighting
        super(world, programs['vertexLighting'], 'lit', options);

        const lightPosition = [
            options.position[0], options.position[1] + 0.5, options.position[2]
        ];

        // Add a light above the platform if it is solid
        if (options.solid) {
            this.light = new LightSource(lightPosition, lightPrograms,
                {
                    Id: [0, 1, 0],
                    Is: [1, 1, 0.5],
                    c: [1, 0, 15]
                });
        }
    }
}