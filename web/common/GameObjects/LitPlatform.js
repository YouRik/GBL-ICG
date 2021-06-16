/** @module LitPlatform */

import GameObject from './GameObject.js';
import Box from './BoxObject.js';
import LightSource from '../LightSource.js';
/**
 * TODO: add documentation
 */
export default class LitPlatform extends Box {
    constructor(world, programs, lightPrograms, options = {}) {
        options.halfExtents = [1.5, 0.1, 1.5];
        options.mass = 0;
        options.portable = false;
        options.color = [0.65, 0.38, 0.58];
        options.collisionFilterMask = options.solid ? -1 : ~4;
        super(world, programs['vertexLighting'], 'lit', options);

        const lightPosition = [
            options.position[0], options.position[1] + 0.5, options.position[2]
        ];

        if (options.solid) {
            const light = new LightSource(lightPosition, lightPrograms,
                {
                    Id: [0, 1, 0],
                    Is: [1, 1, 0.5],
                    c: [1, 0, 15]
                });
        }
    }
}