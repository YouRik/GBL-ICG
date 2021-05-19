/** @module TestStage */

import CubeObject from '../common/CubeObject.js';
import Game from '../common/Game.js';

/**
 * TODO: documentation
 */
export default class TestStage extends Game {
    constructor() {
        super('test');
        // Load resources and stage, then start the game loop
        this.load().then(() => this.gameLoop());
    }

    // Override parent's setup to enable level-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);
        this.gameObjects.push(new CubeObject(this.world,
            this.programs['fragmentLighting'], 'lit', {position: [20, 5, 20]}));
    }
}