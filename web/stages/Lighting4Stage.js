/** @module Lighting4Stage */

import GameStage from '../common/GameStage.js';

/**
 * TODO: documentation
 */
export default class Lighting4Stage extends GameStage {
    constructor() {
        super('lighting4');
        // Load resources and stage, then start the game loop
        this.load().then(() => this.gameLoop());
    }

    // Override parent's setup to enable level-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);
    }
}