/** @module CubeObject */

import BoxObject from './BoxObject.js';

/**
 * TODO: add documentation
 */
export default class CubeObject extends BoxObject {
    constructor(world, program, shaderType, options = {}) {
        const halfExtent = options.halfExtent == undefined ? 1
            : options.halfExtent;

        super(world, program, shaderType, {
            halfExtents: [halfExtent, halfExtent, halfExtent],
            position: options.position,
            orientation: options.orientation,
            color: options.color,
            lightParams: options.lightParams,
            mass: options.mass
        });
    }
}