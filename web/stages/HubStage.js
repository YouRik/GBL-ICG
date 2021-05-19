/** @module HubStage */

import GameStage from '../common/GameStage.js';
import Gate from '../common/Gate.js';
import Pedestal from '../common/Pedestal.js';
import SphereObject from '../common/SphereObject.js';

/**
 * TODO: documentation
 */
export default class HubStage extends GameStage {
    constructor() {
        super('hub');
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
                ka: [0.9, 0.17, 0.31],
                kd: [0.78, 0.91, 0.34],
                ks: [1, 1, 1],
                specExp: 10
            },
            radius: 0.4,
            position: [-3, 0.5, -3],
            portable: true
        }
        );
        this.gameObjects.push(orb1);
        // Orb 2
        const orb2 = new SphereObject(this.world,
            this.programs['fragmentLighting'], 'lit',
            meshes['icoSphere'],
            {
                mass: 5,
                color: [1, 1, 0],
                radius: 0.4,
                position: [3, 0.5, -3],
                portable: true
            }
        );
        this.gameObjects.push(orb2);

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                window.location.replace('lighting1');
            }
        }
        const gate1 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit',
            [
                meshes['gate1'], meshes['gate2'],
                meshes['gate3'], meshes['gate4'],
                meshes['gate5'], meshes['gate6'],
                meshes['gate7'], meshes['gate8'],
                meshes['gate9'], meshes['gate10']
            ], gate1Entered,
            {
                graphicalMesh: meshes['gateG'],
                scale: [1, 1, 1],
                orientation: [0, 90, 0],
                color: [0.2, 0, 0.7],
                position: [0, 0, 5]
            }
        );
        this.gameObjects.push(gate1);

        // Pedestal 1
        const pedestal1Filled = (event) => {
            if (event.body === orb1.physicsBody) {
                gate1.activated = true;
            }
        };
        const pedestal1Emptied = (event) => {
            if (event.bodyA === orb1.physicsBody
                || event.bodyB === orb1.physicsBody) {
                gate1.activated = false;
            }
        };
        const pedestal1 = new Pedestal(this.world,
            this.programs['fragmentLighting'], 'lit',
            [
                meshes['pedestal1'],
                meshes['pedestal2'],
                meshes['pedestal3'],
                meshes['pedestal4']
            ],
            pedestal1Filled,
            {
                graphicalMesh: meshes['pedestalG'],
                position: [0, 0, 0],
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
        })
    }
}