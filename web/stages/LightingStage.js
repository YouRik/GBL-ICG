/** @module LightingStage */

import Game from '../common/Game.js';
import SphereObject from '../common/GameObjects/SphereObject.js';
import Pedestal from '../common/GameObjects/Pedestal.js';
import Gate from '../common/GameObjects/Gate.js';
import LightSource from '../common/LightSource.js';
import Checkpoint from '../common/GameObjects/Checkpoint.js';

/**
 * TODO: documentation
 */
export default class LightingStage extends Game {
    constructor() {
        super('lighting');
        // Load resources and stage, then start the game loop
        this.load().then(() => this.gameLoop());
    }

    // Override parent's setup to enable level-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);

        const meshes = resources.meshes;

        // Add checkpoints
        this.gameObjects.push(
            new Checkpoint(this.world, this.programs['colored'],
            meshes['icoSphere'], [-2.8, 5.7, 0], [-2.8, 5.6, 0], 90, 0,
            this.player));
        this.gameObjects.push(
            new Checkpoint(this.world, this.programs['colored'],
            meshes['icoSphere'], [0, 10.5, 0], [0, 10.4, 0], -90, 0,
            this.player));

        // Orb 1
        const orb1 = new SphereObject(this.world,
            this.programs['vertexLighting'], 'lit',
            meshes['icoSphere'], {
            mass: 5,
            lightParams: {
                ka: [0.03, 0.53, 0.41],
                kd: [0.24, 0.82, 0.05],
                ks: [0.77, 0.21, 0.95],
                specExp: 10
            },
            radius: 0.4,
            position: [5, 10.5, -8],
            portable: true
        }
        );
        this.gameObjects.push(orb1);

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                localStorage.setItem('stage3Done', 'true');
                window.location.replace('hub');
            }
        }
        const gate1 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit', resources, gate1Entered,
            {
                scale: [1, 1, 1],
                orientation: [0, 45, 0],
                color: [0.2, 0, 0.7],
                position: [-90, 8, -20]
            }
        );
        this.gameObjects.push(gate1);

        // Pedestal 1
        const pedestal1Filled = (event) => {
            if (event.body === orb1.physicsBody) {
                gate1.activate();
            }
        };
        const pedestal1Emptied = (event) => {
            if (event.bodyA === orb1.physicsBody
                || event.bodyB === orb1.physicsBody) {
                    gate1.deactivate();
            }
        };
        const pedestal1 = new Pedestal(this.world,
            this.programs['fragmentLighting'], 'lit', resources,
            pedestal1Filled,
            {
                position: [-100, 8, 0],
                color: [0.5, 0.5, 1],
                orientation: [0, 0, 0],
                scale: [1, 1, 1],
            }
        );
        this.gameObjects.push(pedestal1);

        // World event listener for contact exits
        this.world.addEventListener('endContact', (event) => {
            if (event.bodyA === pedestal1.triggerBody
                || event.bodyB === pedestal1.triggerBody) {
                pedestal1Emptied(event);
            }
        });
    }
}