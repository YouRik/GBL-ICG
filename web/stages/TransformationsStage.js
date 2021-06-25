/** @module TransformationsStage */

import Game from '../common/Game.js';
import GameObject from '../common/GameObjects/GameObject.js';
import Gate from '../common/GameObjects/Gate.js';
import Pedestal from '../common/GameObjects/Pedestal.js';
import BoxObject from '../common/GameObjects/BoxObject.js';
import MeshObject from '../common/GameObjects/MeshObject.js';
import SphereObject from '../common/GameObjects/SphereObject.js';
import Checkpoint from '../common/GameObjects/Checkpoint.js';
import * as GLMAT from '../common/lib/gl-matrix/index.js';
import * as CANNON from '../common/lib/cannon/cannon-es.js';
import TaskSwitcher from '../common/TaskSwitcher.js';

/**
 * Stage designed to teach transformations
 * @extends Game
 */
export default class TransformationsStage extends Game {
    constructor() {
        super('transformations');
    }

    // Override parent's setup to implement stage-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        // Base game setup
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);

        // Shorter name for access to mesh resources
        const meshes = resources.meshes;

        // Handle switching of displayed tasks
        const taskSwitcher = new TaskSwitcher(6);

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
                position: [-90, 19.5, 23],
                portable: true
            }
        );
        this.gameObjects.push(orb1);

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                localStorage.stagesDone = Math.max(localStorage.stagesDone, 1);
                window.location.replace('hub');
            }
        };
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
                taskSwitcher.unlockTasks(5);
                taskSwitcher.switchTask(5);
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

        // Transformable cyan box
        const boxCyan = new BoxObject(this.world,
            this.programs['fragmentLighting'], 'lit', {
                halfExtents: [1, 0.2, 3],
                orientation: [170, 260, -35],
                position: [-40, 3.5, 45],
                color: [0, 1, 1],
                mass: 0
            });
        this.gameObjects.push(boxCyan);
        // Transformable magenta box
        const boxMagenta = new BoxObject(this.world,
            this.programs['fragmentLighting'], 'lit', {
                halfExtents: [1, 0.2, 1],
                orientation: [0, 0, 0],
                position: [-45, 3.5, 40],
                color: [1, 0, 1],
                mass: 0
            });
        this.gameObjects.push(boxMagenta);

        // Transformable key
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
        // Lock where key needs to be placed
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
        // Locking bolt that moves aside after key is placed
        const lockingBolt = new BoxObject(this.world,
            this.programs['fragmentLighting'], 'lit', {
                halfExtents: [2.5, 0.5, 0.5],
                position: [-45.2, 24, 16],
                color: [0.6, 0.6, 0.6],
                mass: 0
            });
        this.gameObjects.push(lockingBolt);

        // Add checkpoints
        this.gameObjects.push(
            new Checkpoint(this.world, this.programs['colored'],
                meshes['icoSphere'], [-10, 1, -10], [-10, 0.9, -10], 25, 5,
                this.player, () => {
                    taskSwitcher.unlockTasks(1);
                    taskSwitcher.switchTask(1);
                }));
        this.gameObjects.push(
            new Checkpoint(this.world, this.programs['colored'],
                meshes['icoSphere'], [-12, 6.5, 38], [-12, 6.4, 38], -82, 12,
                this.player, () => {
                    taskSwitcher.unlockTasks(2);
                    taskSwitcher.switchTask(3);
                }));
        this.gameObjects.push(
            new Checkpoint(this.world, this.programs['colored'],
                meshes['icoSphere'], [-50, 16, 34], [-50, 15.9, 34], 208, 12,
                this.player, () => {
                    taskSwitcher.unlockTasks(4);
                    taskSwitcher.switchTask(4);
                }));

        // Default values and transformations to store
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
        // Buttons to apply and reset transformations
        const btnCyanApply = document.getElementById('transCyanApply');
        const btnCyanReset = document.getElementById('transCyanReset');
        const btnMagentaApply = document.getElementById('transMagentaApply');
        const btnMagentaReset = document.getElementById('transMagentaReset');
        const btnYellowApply = document.getElementById('transYellowApply');
        const btnYellowReset = document.getElementById('transYellowReset');

        // Handle transformation matrix inputs for the boxes
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

        // Handle transformation matrix inputs for the key
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
                    // If the key is correctly positioned, unlock the bolt
                    lock.color = [1, 1, 0];
                    lockingBolt.physicsBody.position.x = -50.2;
                    taskSwitcher.unlockTasks(3);
                } else {
                    // Otherwise, reset it
                    lock.color = [0.7, 0.7, 0.3];
                    lockingBolt.physicsBody.position.x = -45.2;
                }
                lock.calculateLightParams();
            } else {
                // Otherwise, reset it
                lock.color = [0.47, 0.47, 0.47];
                lockingBolt.physicsBody.position.x = -45.2;
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
            btnYellowApply.click();
        }
    }

    /**
     * Reset the transformation of one of the transformable objects
     * @param {string} color Color of the object to transform, to select correct
     *  input fields
     * @param {HTMLButtonElement} applyButton The corresponding button to apply the
     *  transformation after resetting
     * @param {Array<number>} defaultMatrix The default matrix to reset to
     */
    resetMatrixInputs(color, applyButton, defaultMatrix) {
        const mat4Default = defaultMatrix === undefined ? GLMAT.mat4.create()
            : defaultMatrix;
        // Reset all the input values
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                document.getElementById(`${color}${j}${i}`).value =
                    mat4Default[i * 4 + j];
            }
        }
        // Apply the reset transformation
        applyButton.click();
    }

    /**
     * Apply the input field's transformation matrix to one of the transformable
     * objects
     * @param {string} color Color of the object to transform, to select correct
     *  input fields
     * @param {GameObject} object The transformable object to apply
     *  tranformations to
     * @param {Array<number>} transformation The transformation matrix to apply
     * @param {Array<number>} defaultQuaternion The object's default orientation
     *  as quaternion
     * @param {Array<number>} defaultTranslation The object's default position
     *  vector
     * @param {Array<number>} defaultScale The object's default scale vector
     */
    applyMatrixInputs(color, object, transformation,
        defaultQuaternion, defaultTranslation, defaultScale = [1, 1, 1]) {
        // Read all the input fields' transformation matrix inputs
        for (let i = 0; i < 4; i++) {
            for (let j = 0; j < 4; j++) {
                transformation[i * 4 + j] =
                    document.getElementById(`${color}${j}${i}`).value;
            }
        }

        // Store matrix inputs in local storage
        localStorage.setItem(color + 'MatrixInputs',
            JSON.stringify(transformation));

        // Read transformations from the matrix and compose with default
        // transformations
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

        // Set object's scale
        object.scale = scale;
        if (object.scalePhysicsShape !== undefined) {
            object.scalePhysicsShape(scale);
        }
        // Set object's position
        object.physicsBody.position = new CANNON.Vec3(
            translation[0],
            translation[1],
            translation[2]
        );
        // Set object's orientation
        object.physicsBody.quaternion = new CANNON.Quaternion(
            rotationQuat[0],
            rotationQuat[1],
            rotationQuat[2],
            rotationQuat[3]
        );
        // Update and render to make changes visual
        this.update(0);
        this.render();
    }
}