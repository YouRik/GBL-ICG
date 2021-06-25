/** @module TestStage */

import Game from '../common/Game.js';
import CubeObject from '../common/GameObjects/CubeObject.js';

/**
 * Stage to test stuff
 */
export default class TestStage extends Game {
    constructor() {
        super('test');
    }

    // Override parent's setup to implement stage-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        // Base game setup
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);
        // Add cube
        this.gameObjects.push(new CubeObject(this.world,
            this.programs['fragmentLighting'], 'lit', {position: [20, 5, 20]}));
    }
}