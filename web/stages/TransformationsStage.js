/** @module TransformationsStage */

import Game from '../common/Game.js';
import Gate from '../common/GameObjects/Gate.js';
import Pedestal from '../common/GameObjects/Pedestal.js';
import BoxObject from '../common/GameObjects/BoxObject.js';
import MeshObject from '../common/GameObjects/MeshObject.js';
import SphereObject from '../common/GameObjects/SphereObject.js';
import * as GLMAT from '../common/lib/gl-matrix/index.js';
import * as CANNON from '../common/lib/cannon/cannon-es.js'

/**
 * TODO: documentation
 */
export default class TransformationsStage extends Game {
    constructor() {
        super('transformations');
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
            position: [-90, 19.6, 23],
            portable: true
        }
        );
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
                orientation: [0, 90, 0],
                color: [0.2, 0, 0.7],
                position: [-46, 18, -16]
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
                position: [-48, 15, 28],
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

        // Transformable boxes
        const boxCyan = new BoxObject(this.world,
            this.programs['fragmentLighting'], 'lit', {
            halfExtents: [1, 0.2, 3],
            orientation: [170, 260, -35],
            position: [-40, 3.5, 45],
            color: [0, 1, 1],
            mass: 0
        });
        this.gameObjects.push(boxCyan);

        const boxMagenta = new BoxObject(this.world,
            this.programs['fragmentLighting'], 'lit', {
            halfExtents: [1, 0.2, 1],
            orientation: [0, 0, 0],
            position: [-45, 3.5, 40],
            color: [1, 0, 1],
            mass: 0
        });
        this.gameObjects.push(boxMagenta);

        // Key, lock and locking bolt
        const key = new MeshObject(this.world,
            this.programs['fragmentLighting'], 'lit', [meshes['keyC']], {
            graphicalMesh: meshes['key'],
            scale: [3, 3, 3],
            orientation: [0, 0, 0],
            position: [-40, 24, 16],
            color: [1, 1, 0],
            mass: 0
        });
        this.gameObjects.push(key);
        const lock = new MeshObject(this.world,
            this.programs['fragmentLighting'], 'lit', [meshes['lockC']], {
            graphicalMesh: meshes['lock'],
            scale: [3, 3, 3],
            orientation: [0, 0, 0],
            position: [-42, 24, 16],
            color: [0.47, 0.47, 0.47],
            mass: 0
        });
        this.gameObjects.push(lock);
        const lockingBolt = new BoxObject(this.world,
            this.programs['fragmentLighting'], 'lit', {
            halfExtents: [2.5, 0.5, 0.5],
            position: [-45.2, 24, 16],
            color: [0.6, 0.6, 0.6],
            mass: 0
        });
        this.gameObjects.push(lockingBolt);

        const cyanTranslationDefault = boxCyan.position;
        const cyanQuaternionDefault = boxCyan.quaternion;
        const magentaTranslationDefault = boxMagenta.position;
        const magentaQuaternionDefault = boxMagenta.quaternion;
        const yellowTranslationDefault = key.position;
        const yellowQuaternionDefault = key.quaternion;
        const yellowScaleDefault = [3, 3, 3];

        const cyanTransformation = GLMAT.mat4.create();
        const magentaTransformation = GLMAT.mat4.create();
        const yellowTransformation = GLMAT.mat4.create();

        const btnCyanApply = document.getElementById('transCyanApply');
        const btnCyanReset = document.getElementById('transCyanReset');
        const btnMagentaApply = document.getElementById('transMagentaApply');
        const btnMagentaReset = document.getElementById('transMagentaReset');
        const btnYellowApply = document.getElementById('transYellowApply');
        const btnYellowReset = document.getElementById('transYellowReset');


        // Handle transformation matrix inputs
        btnCyanApply.addEventListener('click', () => {
            this.applyMatrixInputs('cyan', boxCyan, cyanTransformation,
                cyanQuaternionDefault, cyanTranslationDefault);
        });
        btnCyanReset.addEventListener('click', () => {
            this.resetMatrixInputs('cyan', btnCyanApply);
        });
        btnMagentaApply.addEventListener('click', () => {
            this.applyMatrixInputs('magenta', boxMagenta, magentaTransformation,
                magentaQuaternionDefault, magentaTranslationDefault);
        });
        btnMagentaReset.addEventListener('click', () => {
            this.resetMatrixInputs('magenta', btnMagentaApply);
        });

        btnYellowApply.addEventListener('click', () => {
            this.applyMatrixInputs('yellow', key, yellowTransformation,
                yellowQuaternionDefault, yellowTranslationDefault,
                yellowScaleDefault);
            if (key.position[0] == -42 && key.position[1] == 24
                && key.position[2] == 16) {
                    const targetQuat = GLMAT.quat.create();
                    GLMAT.quat.fromEuler(targetQuat, 90, 0, 0);
                    if (key.quaternion[0] == targetQuat[0]
                        && key.quaternion[1] == targetQuat[1]
                        && key.quaternion[2] == targetQuat[2]
                        && key.quaternion[3] == targetQuat[3]) {
                            lock.color = [1, 1, 0];
                            lockingBolt.physicsBody.position.x -= 5;
                    } else {
                        lock.color = [0.7, 0.7, 0.3];
                    }
                    lock.calculateLightParams();
            } else {
                lock.color = [0.47, 0.47, 0.47];
                lock.calculateLightParams();
            }
            this.render();
        });
        btnYellowReset.addEventListener('click', () => {
            this.resetMatrixInputs('yellow', btnYellowApply);
        });

        // Initalize matrices with default values or retrieve stored ones
        if (localStorage.cyanMatrixInputs === undefined) {
            btnCyanReset.click();
        } else {
            this.resetMatrixInputs('cyan', btnCyanApply,
                JSON.parse(localStorage.cyanMatrixInputs));
        }
        if (localStorage.magentaMatrixInputs === undefined) {
            btnMagentaReset.click();
        } else {
            this.resetMatrixInputs('magenta', btnMagentaApply,
                JSON.parse(localStorage.magentaMatrixInputs));
        }
        if (localStorage.yellowMatrixInputs === undefined) {
            btnYellowReset.click();
        } else {
            this.resetMatrixInputs('yellow', btnYellowApply,
                JSON.parse(localStorage.yellowMatrixInputs));
        }
    }

    resetMatrixInputs(color, applyButton, defaultMatrix) {
        const mat4Default = defaultMatrix === undefined ? GLMAT.mat4.create()
            : defaultMatrix;
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                document.getElementById(`${color}${j}${i}`).value =
                    mat4Default[i * 4 + j];
            }
        }
        applyButton.click();
    }

    applyMatrixInputs(color, object, transformation,
        defaultQuaternion, defaultTranslation, defaultScale = [1, 1, 1]) {
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                transformation[i * 4 + j] =
                    document.getElementById(`${color}${j}${i}`).value;
            }
        }

        // Store matrix inputs in local storage
        localStorage.setItem(color + 'MatrixInputs',
            JSON.stringify(transformation));

        const rotationQuat = GLMAT.quat.create();
        const scale = GLMAT.vec3.create();
        const translation = GLMAT.vec3.create();
        GLMAT.mat4.getRotation(rotationQuat, transformation);
        GLMAT.quat.multiply(rotationQuat,
            rotationQuat, defaultQuaternion);
        GLMAT.mat4.getScaling(scale, transformation);
        GLMAT.vec3.multiply(scale, scale, defaultScale);
        GLMAT.mat4.getTranslation(translation, transformation);
        GLMAT.vec3.add(translation, translation, defaultTranslation);

        object.scale = scale;
        if (object.scalePhysicsShape !== undefined) {
            object.scalePhysicsShape(scale);
        }
        object.physicsBody.position = new CANNON.Vec3(
            translation[0],
            translation[1],
            translation[2]
        );
        object.physicsBody.quaternion = new CANNON.Quaternion(
            rotationQuat[0],
            rotationQuat[1],
            rotationQuat[2],
            rotationQuat[3]
        );
        this.update(0);
        this.render();
    }
}