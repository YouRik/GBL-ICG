/** @module HubStage */

import Game from '../common/Game.js';
import Gate from '../common/GameObjects/Gate.js';
import MeshObject from '../common/GameObjects/MeshObject.js';
import Pedestal from '../common/GameObjects/Pedestal.js';
import SphereObject from '../common/GameObjects/SphereObject.js';
import TaskSwitcher from '../common/TaskSwitcher.js';
import { Body, Sphere } from '../common/lib/cannon/cannon-es.js';
import deCasteljau from '../tasks/decasteljau.js';

/**
 * The hub stage used as a means of moving between stages
 * @extends Game
 */
export default class HubStage extends Game {
    constructor() {
        super('hub');
    }

    // Override parent's setup to implement stage-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        // Reset all saved progress except completed stages
        const stagesDone = localStorage.stagesDone == undefined ? 0
            : localStorage.stagesDone;
        localStorage.clear();
        localStorage.stagesDone = stagesDone;

        // General game setup
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);

        // Shorter name for access to mesh resources
        const meshes = resources.meshes;

        // Handle switching of tasks
        const taskSwitcher = new TaskSwitcher(3);

        // Create Orb 1
        const orb1 = new SphereObject(this.world,
            this.programs['fragmentLighting'], 'lit',
            meshes['icoSphere'], {
                mass: 5,
                color: [1, 1, 0],
                radius: 0.4,
                position: [13, 0.8, -4],
                portable: true
            }
        );
        this.gameObjects.push(orb1);

        // Create Orb 2 if first stage is completed
        let orb2 = null;
        if (localStorage.stagesDone >= 1) {
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
                    position: [14, 0.8, -3],
                    portable: true
                }
            );
            this.gameObjects.push(orb2);
        }

        // Create Orb 3 if stage 2 is completed
        let orb3 = null;
        if (localStorage.stagesDone >= 2) {
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
                    position: [15, 0.8, -4],
                    portable: true
                }
            );
            this.gameObjects.push(orb3);
        }

        // Create Orb 4 if stage 3 is completed
        let orb4 = null;
        if (localStorage.stagesDone >= 3) {
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
                    position: [14, 0.8, -5],
                    portable: true
                });
            this.gameObjects.push(orb4);
        }

        // Create Orb 5 if stage 4 is completed
        let orb5 = null;
        if (localStorage.stagesDone >= 4) {
            orb5 = new SphereObject(this.world,
                this.programs['fragmentLighting'], 'lit',
                meshes['icoSphere'],
                {
                    mass: 5,
                    lightParams: {
                        ka: [0.57, 0.36, 0.51],
                        kd: [0.31, 0.83, 0.63],
                        ks: [0.93, 0.85, 0.2],
                        specExp: 10
                    },
                    radius: 0.6,
                    position: [14, 0.8, -4],
                    portable: true
                });
            this.gameObjects.push(orb5);

            // Create Deviloper if stage 4 is completed
            this.gameObjects.push(
                new MeshObject(this.world, this.programs['fragmentLighting'],
                    'lit', [
                        meshes['deviloperP1'],
                        meshes['deviloperP2'],
                        meshes['deviloperP3'],
                        meshes['deviloperP4'],
                        meshes['deviloperP5'],
                        meshes['deviloperP6'],
                        meshes['deviloperP7'],
                    ], {
                        graphicalMesh: meshes['deviloperG'],
                        scale: [1.5, 1.5, 1.5],
                        position: [-7, 0, -6],
                        orientation: [0, -20, 0],
                        mass: 0,
                        lightParams: {
                            ka: [0, 0, 0],
                            kd: [0.3, 0.3, 0.3],
                            ks: [0.6, 0.6, 0.6],
                            specExp: 5
                        }
                    })
            );
            // Create collision sphere for Deviloper's hands
            const devTrigger = new SphereObject(this.world,
                this.programs['fragmentLighting'], 'lit', meshes['icoSphere'], {
                    radius: 0.3,
                    position: [-6, 1.5, -5.6],
                    mass: 0
                });
            devTrigger.physicsBody.isTrigger = true;
            devTrigger.physicsBody.addEventListener('collide', (event) => {
                if (event.body === orb5.physicsBody) {
                    taskSwitcher.unlockTasks(2);
                    taskSwitcher.switchTask(2);
                }
            });
            devTrigger.visible = false;
            this.gameObjects.push(devTrigger);

            // Unlock next part of the story, change triangle image
            taskSwitcher.unlockTasks(1);
            taskSwitcher.switchTask(2);
            const img = document.getElementById('triangle_img');
            console.log(img);
            img.src = './images/deviloper.png';
        }

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                window.location.replace('transformations');
            }
        };
        const gate1 = new Gate(this.world, this.programs['fragmentLighting'],
            this.programs['colored'], 'lit', resources, gate1Entered,
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
        };
        const gate2 = new Gate(this.world, this.programs['fragmentLighting'],
            this.programs['colored'], 'lit', resources, gate2Entered,
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
        };
        const gate3 = new Gate(this.world, this.programs['fragmentLighting'],
            this.programs['colored'], 'lit', resources, gate3Entered,
            {
                scale: [1, 1, 1],
                orientation: [0, 60, 0],
                position: [-5, 0, 3.5]
            }
        );
        this.gameObjects.push(gate3);
        // Gate 4
        const gate4Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                window.location.replace('shadows');
            }
        };
        const gate4 = new Gate(this.world, this.programs['fragmentLighting'],
            this.programs['colored'], 'lit', resources, gate4Entered,
            {
                scale: [1, 1, 1],
                orientation: [0, 20, -0.5],
                position: [-8, 0, 0]
            }
        );
        this.gameObjects.push(gate4);

        // Pedestal where orbs are to be placed to open the gates
        // Open respective gate if orb is placed
        const pedestalFilled = (event) => {
            if (event.body === orb1.physicsBody) {
                gate1.activate();
            } else if (localStorage.stagesDone >= 1 &&
                event.body === orb2.physicsBody) {
                gate2.activate();
            } else if (localStorage.stagesDone >= 2 &&
                event.body === orb3.physicsBody) {
                gate3.activate();
            } else if (localStorage.stagesDone >= 3 &&
                event.body === orb4.physicsBody) {
                gate4.activate();
            }
        };
        // Close respective gate if orb is removed
        const pedestalEmptied = (event) => {
            if (event.bodyA === orb1.physicsBody
                || event.bodyB === orb1.physicsBody) {
                gate1.deactivate();
            } else if (localStorage.stagesDone >= 1 &&
                (event.bodyA === orb2.physicsBody
                    || event.bodyB === orb2.physicsBody)) {
                gate2.deactivate();
            } else if (localStorage.stagesDone >= 2 &&
                (event.bodyA === orb3.physicsBody
                    || event.bodyB === orb3.physicsBody)) {
                gate3.deactivate();
            } else if (localStorage.stagesDone >= 3 &&
                (event.bodyA === orb4.physicsBody
                    || event.bodyB === orb4.physicsBody)) {
                gate4.deactivate();
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
        });

        // Add river
        this.gameObjects.push(this.getRiver(this.world,
            this.programs['fragmentLighting'], [0, 0.001, 0], meshes['river']));
    }

    /**
     * Generate river geometry and initialize a mesh object with it. The river
     *  geometry will be interpolated using DeCasteljau's algorithm
     * @param {CANNON.World} world The game's physics world
     * @param {WebGLProgram} program The shader program to be used
     * @param {Array<number>} position The position to offset the river
     * @returns {MeshObject} River mesh object
     */
    getRiver(world, program, position) {
        // Define spline curve points
        let leftSideSpline = [
            [19.9333, -0.240965],
            [12.4769, 0.642908],
            [9.64548, -1.50411],
            [10.21269, -4.78538],
            [11.8236, -8.22445],
            [9.1854, -10.7944],
            [4.26666, -12.5904]
        ];
        let rightSideSpline = [
            [9, 6.14458],
            [5.73489, 3.30336],
            [4.81963, -0.821107],
            [5.85268, -4.79127],
            [7.31993, -7.83071],
            [5.86601, -10.097],
            [1.60572, -11.6733]
        ];

        // Interpolate spline curves
        const leftSpline1 = deCasteljau(leftSideSpline[0], leftSideSpline[1],
            leftSideSpline[2], leftSideSpline[3], 0.1);
        const leftSpline2 = deCasteljau(leftSideSpline[3], leftSideSpline[4],
            leftSideSpline[5], leftSideSpline[6], 0.1);

        const rightSpline1 = deCasteljau(rightSideSpline[0], rightSideSpline[1],
            rightSideSpline[2], rightSideSpline[3], 0.1);
        const rightSpline2 = deCasteljau(rightSideSpline[3], rightSideSpline[4],
            rightSideSpline[5], rightSideSpline[6], 0.1);

        // Collect splines
        const splines = [leftSpline1, rightSpline1, leftSpline2, rightSpline2];
        // Declare mesh object
        const riverMesh = {
            positions: [],
            normals: [],
            indices: [],
            faceIndexCounts: []
        };

        // Add positions to mesh
        splines.forEach(spline => {
            spline.forEach(point => {
                riverMesh.positions.push(point[0]);
                riverMesh.positions.push(0);
                riverMesh.positions.push(point[1]);
            });
        });
        // Add normals to mesh
        for (let i = 0; i < riverMesh.positions.length / 3; i++) {
            riverMesh.normals.push(0);
            riverMesh.normals.push(1);
            riverMesh.normals.push(0);
        }

        // Add indices to mesh
        for (let i = 0; i < leftSpline1.length - 1; i++) {
            riverMesh.indices.push(i);
            riverMesh.indices.push(i + 1);
            riverMesh.indices.push(i + leftSpline1.length);
        }
        for (let i = 0; i < leftSpline1.length - 1; i++) {
            riverMesh.indices.push(i + 1);
            riverMesh.indices.push(i + 1 + leftSpline1.length);
            riverMesh.indices.push(i + leftSpline1.length);
        }
        for (let i = leftSpline1.length + rightSpline1.length;
            i < (leftSpline1.length + rightSpline1.length
                + leftSpline2.length - 1); i++) {
            riverMesh.indices.push(i);
            riverMesh.indices.push(i + 1);
            riverMesh.indices.push(i + leftSpline2.length);
        }
        for (let i = leftSpline1.length + rightSpline1.length;
            i < (leftSpline1.length + rightSpline1.length
                + leftSpline2.length - 1); i++) {
            riverMesh.indices.push(i + 1);
            riverMesh.indices.push(i + 1 + leftSpline2.length);
            riverMesh.indices.push(i + leftSpline2.length);
        }

        // Add face counts to mesh
        for (let i = 0; i < riverMesh.indices.length / 3; i++ ) {
            riverMesh.faceIndexCounts.push(3);
        }

        // Create game object
        const river = new MeshObject(world, program, 'lit', [], {
            graphicalMesh: riverMesh,
            position: position,
            color: [0.1, 0.3, 1],
            mass: 0
        });
        
        return river;
    }
}
