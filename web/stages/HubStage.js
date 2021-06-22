/** @module HubStage */

import Game from '../common/Game.js';
import Gate from '../common/GameObjects/Gate.js';
import Pedestal from '../common/GameObjects/Pedestal.js';
import SphereObject from '../common/GameObjects/SphereObject.js';

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
        // Reset player respawn position
        localStorage.removeItem('respawn');
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);

        const meshes = resources.meshes;

        // Orb 1
        const orb1 = new SphereObject(this.world,
            this.programs['fragmentLighting'], 'lit',
            meshes['icoSphere'], {
            mass: 5,
            color: [1, 1, 0],
            radius: 0.4,
            position: [11, 0.8, -4],
            portable: true
        }
        );
        this.gameObjects.push(orb1);

        let orb2 = null;

        if (localStorage.stage1Done == 'true') {
            // Orb 2
            orb2 = new SphereObject(this.world,
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
                    position: [12, 0.8, -3],
                    portable: true
                }
            );
            this.gameObjects.push(orb2);
        }


        let orb3 = null;

        if (localStorage.stage2Done == 'true') {
            // Orb 3
            orb3 = new SphereObject(this.world,
                this.programs['fragmentLighting'], 'lit',
                meshes['icoSphere'],
                {
                    mass: 5,
                    lightParams: {
                        ka: [0.73, 0.43, 0.13],
                        kd: [0.09, 0.5, 1.0],
                        ks: [0.76, 0.13, 0.28],
                        specExp: 10
                    },
                    radius: 0.4,
                    position: [13, 0.8, -4],
                    portable: true
                }
            );
            this.gameObjects.push(orb3);
        }

        let orb4 = null;

        if (localStorage.stage3Done == 'true') {
            orb4 = new SphereObject(this.world,
                this.programs['fragmentLighting'], 'lit',
                meshes['icoSphere'],
                {
                    mass: 5,
                    lightParams: {
                        ka: [0.03, 0.53, 0.41],
                        kd: [0.24, 0.82, 0.05],
                        ks: [0.77, 0.21, 0.95],
                        specExp: 10
                    },
                    radius: 0.4,
                    position: [12, 0.8, -5],
                    portable: true
                });
            this.gameObjects.push(orb4);
        }

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                window.location.replace('transformations');
            }
        }
        const gate1 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit', resources, gate1Entered,
            {
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
            'lit', resources, gate2Entered,
            {
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
            'lit', resources, gate3Entered,
            {
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
            } else if (localStorage.stage1Done == 'true' &&
                event.body === orb2.physicsBody) {
                gate2.activate();
            } else if (localStorage.stage2Done == 'true' &&
                event.body === orb3.physicsBody) {
                gate3.activate();
            }
        };
        const pedestalEmptied = (event) => {
            if (event.bodyA === orb1.physicsBody
                || event.bodyB === orb1.physicsBody) {
                gate1.deactivate();
            } else if (localStorage.stage1Done == 'true' &&
                (event.bodyA === orb2.physicsBody
                    || event.bodyB === orb2.physicsBody)) {
                gate2.deactivate();
            } else if (localStorage.stage2Done == 'true' &&
                (event.bodyA === orb3.physicsBody
                    || event.bodyB === orb3.physicsBody)) {
                gate3.deactivate();
            }
        };
        const pedestal = new Pedestal(this.world,
            this.programs['fragmentLighting'], 'lit', resources,
            pedestalFilled,
            {
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
