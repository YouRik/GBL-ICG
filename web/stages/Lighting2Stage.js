/** @module Lighting2Stage */

import Game from '../common/Game.js';

/**
 * TODO: documentation
 */
export default class Lighting2Stage extends Game {
    constructor() {
        super('lighting2');
        // Load resources and stage, then start the game loop
        this.load().then(() => this.gameLoop());
    }

    // Override parent's setup to enable level-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);
    }
}