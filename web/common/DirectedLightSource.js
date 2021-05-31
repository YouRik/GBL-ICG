/** @module DirectedLightSource */

import LightSource from './LightSource.js';

export default class DirectedLightSource extends LightSource {
    constructor(direction, programs, options = {}) {
        const position = direction;
        position.push(0);
        super(position, programs, options);
    }
}