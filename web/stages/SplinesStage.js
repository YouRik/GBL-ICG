/** @module SplinesStage */

import Game from '../common/Game.js';
import SphereObject from '../common/SphereObject.js';

/**
 * TODO: documentation
 */
export default class SplinesStage extends Game {
    constructor() {
        super('splines');
        // Load resources and stage, then start the game loop
        this.load().then(() => this.gameLoop());
    }

    // Override parent's setup to enable level-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);

        const meshes = resources.meshes;

        // Orb 1
        const orb1 = new SphereObject(this.world,
            this.programs['fragmentLighting'], 'lit',
            meshes['icoSphere'], {
            mass: 5,
            lightParams: {
                ka: [0.93, 0.53, 0.18],
                kd: [0, 0.5, 1.0],
                ks: [0.76, 0.13, 0.28],
                specExp: 10
            },
            radius: 0.4,
            position: [2, 1, -2],
            portable: true
        }
        );
        this.gameObjects.push(orb1);
    }
}