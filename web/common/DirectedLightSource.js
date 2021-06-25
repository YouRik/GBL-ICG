/** @module DirectedLightSource */

import LightSource from './LightSource.js';

/**
 * A directed light source with no specific position
 * @extends LightSource
 */
export default class DirectedLightSource extends LightSource {
    /**
     * @param {Array<number>} direction The light direction vector
     * @param {Array<WebGLProgram>} programs List of shader programs that
     *  implement lighting
     * @param {Object} [options={}] Options object for further settings
     * @param {Array<number>} options.Id Diffuse intensity factor
     * @param {Array<number>} options.Is Specular intensity factor
     */
    constructor(direction, programs, options = {}) {
        const position = direction;
        position.push(0);
        super(position, programs, options);
    }
}