/** @module Lighting1Stage */

import Game from '../common/Game.js';

/**
 * TODO: documentation
 */
export default class Lighting1Stage extends Game {
    constructor() {
        super('lighting1');
        // Load resources and stage, then start the game loop
        this.load().then(() => this.gameLoop());
    }

    // Override parent's setup to enable level-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);
    }
}