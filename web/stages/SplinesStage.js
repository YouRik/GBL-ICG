/** @module SplinesStage */

import Game from '../common/Game.js';
import SphereObject from '../common/SphereObject.js';
import MeshObject from '../common/MeshObject.js';
import BoxObject from '../common/BoxObject.js';
import * as GLMAT from '../common/lib/gl-matrix/index.js';
import Gate from '../common/Gate.js';
import Pedestal from '../common/Pedestal.js';
import deCasteljau from '../tasks/decasteljau.js';

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
            position: [2, 6, -2],
            // position: [0, 8, 4],
            portable: true
        });
        orb1.physicsBody.angularDamping = 0;
        orb1.physicsBody.material.friction = 0.1;
        this.gameObjects.push(orb1);

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                window.location.replace('hub');
            }
        }
        const gate1 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit', resources, gate1Entered,
            {
                scale: [1, 1, 1],
                orientation: [0, -60, 0],
                color: [0.2, 0, 0.7],
                position: [0, -10, 55]
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
                position: [105, -114, 61],
                color: [0.5, 0.5, 1],
                orientation: [0, 0, 0],
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
            halfExtents: [0.1, 1.5, 3],
            color: [1, 0.5, 0, 0.4],
            orientation: [0, 9, 0],
            position: [5, 6.5, -2],
            mass: 0
        });
        // Don't collide with player
        orangeWall.physicsBody.collisionFilterMask = ~4;
        this.gameObjects.push(orangeWall);

        // Get buttons and input elements
        const btnApply = document.getElementById('btnApply');
        const btnReset = document.getElementById('btnReset');
        const y1Element = document.getElementById('y1');
        const z1Element = document.getElementById('z1');
        const y2Element = document.getElementById('y2');
        const z2Element = document.getElementById('z2');
        const y3Element = document.getElementById('y3');
        const z3Element = document.getElementById('z3');

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
            this.render();
        });
        btnReset.addEventListener('click', () => {
            // TODO: remove correct values
            y1Element.value = -3.5;
            z1Element.value = 9.25;
            y2Element.value = -10.0;
            z2Element.value = 17.0;
            y3Element.value = -11.5;
            z3Element.value = 27.25;
            // y1Element.value = 8;
            // z1Element.value = 4;
            // y2Element.value = -20;
            // z2Element.value = 12;
            // y3Element.value = -8;
            // z3Element.value = 40;
            btnApply.click();
        });

        btnReset.click();

        this.spline2segments = [];
        const bridgePoints = deCasteljau(
            [9, -11], [20, -100], [50, -85], [60, -75],
            0.1
        );

        for (let i = 1; i < bridgePoints.length; i++) {
            this.spline2segments.push(this.placeSplineSegmentXY(meshes,
                bridgePoints[i-1], bridgePoints[i], 61.4));
        }
    }

    // Places spline segment on the YZ plane
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

    // Places spline segment on the XY plane
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

    toDegree(radian) {
        return radian * 180 / Math.PI;
    }
}