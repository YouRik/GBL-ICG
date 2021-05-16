/** @module Lighting2Stage */

import GameStage from '../common/GameStage.js';

/**
 * TODO: documentation
 */
export default class Lighting2Stage extends GameStage {
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