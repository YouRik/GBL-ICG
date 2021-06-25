/** @module TestStage */

import Game from '../common/Game.js';
import CubeObject from '../common/GameObjects/CubeObject.js';

/**
 * TODO: documentation
 */
export default class TestStage extends Game {
    constructor() {
        super('test');
    }

    // Override parent's setup to enable level-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);
        this.gameObjects.push(new CubeObject(this.world,
            this.programs['fragmentLighting'], 'lit', {position: [20, 5, 20]}));
    }
}