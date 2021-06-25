/** @module SplinesStage */

import Game from '../common/Game.js';
import Gate from '../common/GameObjects/Gate.js';
import Pedestal from '../common/GameObjects/Pedestal.js';
import BoxObject from '../common/GameObjects/BoxObject.js';
import MeshObject from '../common/GameObjects/MeshObject.js';
import SphereObject from '../common/GameObjects/SphereObject.js';
import deCasteljau from '../tasks/decasteljau.js';
import * as GLMAT from '../common/lib/gl-matrix/index.js';
import TaskSwitcher from '../common/TaskSwitcher.js';

/**
 * The stage designed to teach spline approximation
 * @extends Game
 */
export default class SplinesStage extends Game {
    constructor() {
        super('splines');
    }

    // Override parent's setup to implement stage-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        // Base game setup
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);

        // Shorter name for access to mesh resources
        const meshes = resources.meshes;

        // Handle switching of displayed tasks
        const taskSwitcher = new TaskSwitcher(3);

        // Orb 1
        const orb1 = new SphereObject(this.world,
            this.programs['fragmentLighting'], 'lit',
            meshes['icoSphere'], {
                mass: 5,
                lightParams: {
                    ka: [0.73, 0.43, 0.13],
                    kd: [0.09, 0.5, 1.0],
                    ks: [0.76, 0.13, 0.28],
                    specExp: 10
                },
                radius: 0.4,
                position: [2, 5.6, -2],
                portable: true
            });
        // Specific physical properties to enhance rolling
        orb1.physicsBody.angularDamping = 0;
        orb1.physicsBody.material.friction = 0.1;
        this.gameObjects.push(orb1);

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                localStorage.stagesDone = Math.max(localStorage.stagesDone, 2);
                window.location.replace('hub');
            }
        };
        const gate1 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit', resources, gate1Entered,
            {
                scale: [1, 1, 1],
                orientation: [0, -60, 0],
                color: [0.2, 0, 0.7],
                position: [120, -112, 80]
            }
        );
        this.gameObjects.push(gate1);

        // Pedestal 1
        const pedestal1Filled = (event) => {
            if (event.body === orb1.physicsBody) {
                gate1.activate();
                taskSwitcher.unlockTasks(2);
                taskSwitcher.switchTask(2);
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
                position: [104, -112, 61],
                color: [0.5, 0.5, 1],
                orientation: [0, 45, 0],
                scale: [20, 30, 20],
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

        // Orange glass wall
        const orangeWall = new BoxObject(this.world, this.programs['colored'],
            'colored', {
                halfExtents: [0.1, 2, 3],
                color: [1, 0.5, 0, 0.4],
                orientation: [0, 9, 0],
                position: [5, 7, -2],
                mass: 0
            });
        // Don't collide with player
        orangeWall.physicsBody.collisionFilterMask = ~4;
        this.gameObjects.push(orangeWall);

        // Add thick wall on second island. Use it to change to next task when
        // the orb has collided and thus successfully been rolled to the second
        // island
        const thickWall = new BoxObject(this.world,
            this.programs['fragmentLighting'], 'lit', {
                halfExtents: [6, 1, 0.5],
                color: [0.12, 0.44, 0.44],
                orientation: [0, -45, 0],
                position: [0, -9, 58],
                mass: 0
            });
        thickWall.physicsBody.addEventListener('collide', event => {
            if (event.body === orb1.physicsBody) {
                taskSwitcher.unlockTasks(1);
                taskSwitcher.switchTask(1);
            }
        });
        this.gameObjects.push(thickWall);

        // Get buttons and input elements
        const btnApply = document.getElementById('btnApply');
        const btnReset = document.getElementById('btnReset');
        const y1Element = document.getElementById('y1');
        const z1Element = document.getElementById('z1');
        const y2Element = document.getElementById('y2');
        const z2Element = document.getElementById('z2');
        const y3Element = document.getElementById('y3');
        const z3Element = document.getElementById('z3');

        // First spline for orb
        this.spline1segments = [];

        // Handle button clicks
        btnApply.addEventListener('click', () => {
            this.spline1segments.forEach(segment => {
                this.removeGameObject(segment);
            });
            this.spline1segments.splice(0);
            this.spline1segments.push(this.placeSplineSegmentYZ(meshes,
                [8, 4], [y1Element.value, z1Element.value]));
            this.spline1segments.push(this.placeSplineSegmentYZ(meshes,
                [y1Element.value, z1Element.value],
                [y2Element.value, z2Element.value]));
            this.spline1segments.push(this.placeSplineSegmentYZ(meshes,
                [y2Element.value, z2Element.value],
                [y3Element.value, z3Element.value]));
            this.spline1segments.push(this.placeSplineSegmentYZ(meshes,
                [y3Element.value, z3Element.value], [-8, 40]));

            // Store input field values in local storage
            const spliceValues = [
                y1Element.value, z1Element.value,
                y2Element.value, z2Element.value,
                y3Element.value, z3Element.value
            ];
            localStorage.setItem('spliceValues', JSON.stringify(spliceValues));
            this.render();
        });
        btnReset.addEventListener('click', () => {
            y1Element.value = 8;
            z1Element.value = 4;
            y2Element.value = -20;
            z2Element.value = 12;
            y3Element.value = -8;
            z3Element.value = 40;
            btnApply.click();
        });

        if (localStorage.spliceValues === undefined) {
            // Reset initial splice values if none are stored
            btnReset.click();
        } else {
            // Otherwise load the stored ones
            const spliceValues = JSON.parse(localStorage.spliceValues);
            y1Element.value = spliceValues[0];
            z1Element.value = spliceValues[1];
            y2Element.value = spliceValues[2];
            z2Element.value = spliceValues[3];
            y3Element.value = spliceValues[4];
            z3Element.value = spliceValues[5];
            btnApply.click();
        }

        // Second spline for orb
        let bridgePoints = deCasteljau(
            [9.2, -11], [20, -100], [50, -85], [60, -75],
            0.1
        );
        for (let i = 1; i < bridgePoints.length; i++) {
            this.placeSplineSegmentXY(meshes,
                bridgePoints[i-1], bridgePoints[i], 61.4);
        }

        // First spline for player
        bridgePoints = deCasteljau(
            [9.2, -11], [20, -50], [50, -50], [60, -45],
            0.1
        );
        for (let i = 1; i < bridgePoints.length; i++) {
            this.placeSplineSegmentXY(meshes,
                bridgePoints[i-1], bridgePoints[i], -10);
        }
        // Second spline for player
        bridgePoints = deCasteljau(
            [60, -45], [75, -80], [90, -80], [105, -70],
            0.1
        );
        for (let i = 1; i < bridgePoints.length; i++) {
            this.placeSplineSegmentXY(meshes,
                bridgePoints[i-1], bridgePoints[i], -20);
        }
        // Third spline for player
        bridgePoints = deCasteljau(
            [-70, -10], [-100, 10], [-100, 30], [-90, 50],
            0.1
        );
        for (let i = 1; i < bridgePoints.length; i++) {
            this.placeSplineSegmentYZ(meshes,
                bridgePoints[i-1], bridgePoints[i], 110);
        }
    }

    /**
     * Place spline segment on the YZ plane
     * @param {Object} meshes Object containing mesh resources such that the
     *  correct ones can be used for spline segments
     * @param {Array<number>} point1 2D point (YZ) to start spline segment
     * @param {Array<number>} point2 2D point (YZ) to end spline segment
     * @param {number} x X-depth to place spline segment at
     * @returns {GameObject} The game object representing the spline segment
     */
    placeSplineSegmentYZ(meshes, point1, point2, x = 0) {
        let a = [x, parseFloat(point1[0]), parseFloat(point1[1])];
        let b = [x, parseFloat(point2[0]), parseFloat(point2[1])];

        const ab = GLMAT.vec3.create();
        GLMAT.vec3.subtract(ab, b, a);

        const length = GLMAT.vec3.length(ab);
        const angle = this.toDegree(GLMAT.vec3.angle(ab, [0, 0, 1]));
        const flipX = a[2] > b[2] ? 1 : 0;
        const flipY = a[1] < b[1] ? 1 : 0;
        const position = GLMAT.vec3.create();
        GLMAT.vec3.scaleAndAdd(position, a, ab, 0.5);

        const segment = new MeshObject(this.world,
            this.programs['fragmentLighting'], 'lit', [
                meshes['halfpipeD1'],
                meshes['halfpipeD2'],
                meshes['halfpipeD3'],
                meshes['halfpipeD4'],
                meshes['halfpipeD5'],
            ], {
                position: position,
                scale: [1.5, 1, length + 1],
                orientation: [angle + flipX * 180, flipY * 180, 0],
                color: [0.6, 0.6, 0.6],
                mass: 0
            });
        this.gameObjects.push(segment);
        return segment;
    }

    /**
     * Place spline segment on the XY plane
     * @param {Object} meshes Object containing mesh resources such that the
     *  correct ones can be used for spline segments
     * @param {Array<number>} point1 2D point (XY) to start spline segment
     * @param {Array<number>} point2 2D point (XY) to end spline segment
     * @param {number} z Z-depth to place spline segment at
     * @returns {GameObject} The game object representing the spline segment
     */
    placeSplineSegmentXY(meshes, point1, point2, z = 0) {
        let a = [parseFloat(point1[0]), parseFloat(point1[1]), z];
        let b = [parseFloat(point2[0]), parseFloat(point2[1]), z];

        const ab = GLMAT.vec3.create();
        GLMAT.vec3.subtract(ab, b, a);

        const length = GLMAT.vec3.length(ab);
        const angle = this.toDegree(GLMAT.vec3.angle(ab, [1, 0, 0]));
        const flipY = a[1] < b[1] ? 1 : 0;
        const position = GLMAT.vec3.create();
        GLMAT.vec3.scaleAndAdd(position, a, ab, 0.5);

        const segment = new MeshObject(this.world,
            this.programs['fragmentLighting'], 'lit', [
                meshes['halfpipeD1'],
                meshes['halfpipeD2'],
                meshes['halfpipeD3'],
                meshes['halfpipeD4'],
                meshes['halfpipeD5'],
            ], {
                position: position,
                scale: [1.5, 1, length + 1],
                orientation: [angle, flipY * 180 + 90, 0],
                color: [0.6, 0.6, 0.6],
                mass: 0
            });
        this.gameObjects.push(segment);
        return segment;
    }

    /**
     * Convert radian value to degrees
     * @param {number} radian Radian value to convert
     * @returns {number} Value in degrees
     */
    toDegree(radian) {
        return radian * 180 / Math.PI;
    }
}
