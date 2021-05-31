/** @module CubeObject */

import BoxObject from './BoxObject.js';

/**
 * TODO: add documentation
 */
export default class CubeObject extends BoxObject {
    constructor(world, program, shaderType, options = {}) {
        const halfExtent = options.halfExtent == undefined ? 1
            : options.halfExtent;

        const opts = options;
        opts.halfExtents = [halfExtent, halfExtent, halfExtent];
        super(world, program, shaderType, opts);
    }
}