/** @module HubStage */

import Game from '../common/Game.js';
import Gate from '../common/Gate.js';
import Pedestal from '../common/Pedestal.js';
import SphereObject from '../common/SphereObject.js';

/**
 * TODO: documentation
 */
export default class HubStage extends Game {
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
            color: [1, 1, 0],
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
                lightParams: {
                    ka: [0.9, 0.17, 0.31],
                    kd: [0.78, 0.91, 0.34],
                    ks: [1, 1, 1],
                    specExp: 10
                },
                radius: 0.4,
                position: [3, 0.5, -3],
                portable: true
            }
        );
        this.gameObjects.push(orb2);

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                window.location.replace('transformations');
            }
        }
        const gate1 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit',
            [
                meshes['gateD1'], meshes['gateD2'],
                meshes['gateD3'], meshes['gateD4'],
                meshes['gateD5'], meshes['gateD6'],
                meshes['gateD7'], meshes['gateD8'],
                meshes['gateD9'], meshes['gateD10']
            ], gate1Entered,
            {
                graphicalMesh: meshes['gateG'],
                scale: [1, 1, 1],
                orientation: [0, 120, 0],
                position: [5, 0, 3.5]
            }
        );
        this.gameObjects.push(gate1);
        // Gate 2
        const gate2Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                window.location.replace('splines');
            }
        }
        const gate2 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit',
            [
                meshes['gateD1'], meshes['gateD2'],
                meshes['gateD3'], meshes['gateD4'],
                meshes['gateD5'], meshes['gateD6'],
                meshes['gateD7'], meshes['gateD8'],
                meshes['gateD9'], meshes['gateD10']
            ], gate2Entered,
            {
                graphicalMesh: meshes['gateG'],
                scale: [1, 1, 1],
                orientation: [0, 90, 0],
                position: [0, 0, 5]
            }
        );
        this.gameObjects.push(gate2);
        // Gate 3
        const gate3Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                window.location.replace('lighting');
            }
        }
        const gate3 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit',
            [
                meshes['gateD1'], meshes['gateD2'],
                meshes['gateD3'], meshes['gateD4'],
                meshes['gateD5'], meshes['gateD6'],
                meshes['gateD7'], meshes['gateD8'],
                meshes['gateD9'], meshes['gateD10']
            ], gate3Entered,
            {
                graphicalMesh: meshes['gateG'],
                scale: [1, 1, 1],
                orientation: [0, 60, 0],
                position: [-5, 0, 3.5]
            }
        );
        this.gameObjects.push(gate3);

        // Pedestal
        const pedestalFilled = (event) => {
            if (event.body === orb1.physicsBody) {
                gate1.activate();
            } else if (event.body === orb2.physicsBody) {
                gate2.activate();
            }
        };
        const pedestalEmptied = (event) => {
            if (event.bodyA === orb1.physicsBody
                || event.bodyB === orb1.physicsBody) {
                    gate1.deactivate();
            } else if (event.bodyA === orb2.physicsBody
                || event.bodyB === orb2.physicsBody) {
                    gate2.deactivate();
            }
        };
        const pedestal = new Pedestal(this.world,
            this.programs['fragmentLighting'], 'lit',
            [
                meshes['pedestalD1'],
                meshes['pedestalD2'],
                meshes['pedestalD3'],
                meshes['pedestalD4']
            ],
            pedestalFilled,
            {
                graphicalMesh: meshes['pedestalG'],
                position: [0, 0, 0],
                color: [0.5, 0.5, 1],
                orientation: [0, 0, 0],
                scale: [1, 1, 1],
            }
        );
        this.gameObjects.push(pedestal);

        // World event listener for contact exits
        this.world.addEventListener('endContact', (event) => {
            if (event.bodyA === pedestal.triggerBody
                || event.bodyB === pedestal.triggerBody) {
                pedestalEmptied(event);
            }
        })
    }
}