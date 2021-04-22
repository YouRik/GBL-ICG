/** @module CubeObject */

import BoxObject from './BoxObject.js';

/**
 * TODO: add documentation
 */
export default class CubeObject extends BoxObject {
    constructor(world, program, shaderType, options = {}) {
        const halfExtent = 'halfExtent' in options ? options.halfExtent : 1;
        const position = options.position;
        const orientation = options.orientation;
        const mass = options.mass;
        const color = options.color;
        const lightParams = options.lightParams;

        super(world, program, shaderType, {
            halfExtents: [halfExtent, halfExtent, halfExtent],
            position: position,
            orientation: orientation,
            color: color,
            lightParams: lightParams,
            mass: mass
        });
    }
}