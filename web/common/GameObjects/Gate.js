/** @module Gate */

import MeshObject from './MeshObject.js';
import * as CANNON from '../lib/cannon/cannon-es.js';

/**
 * A gate that can be activated and used to to trigger a callback
 * @extends MeshObject
 */
export default class Gate extends MeshObject {
    /**
     * @param {CANNON.World} world The physics world to add the gate to
     * @param {WebGLProgram} program The shader program to use
     * @param {string} shaderType Type of used shader. 'colored' or 'lit'
     * @param {Object} resources Resource object that contains the meshes to be
     *  picked out of
     * @param {function} callback The callback to be called when something
     *  passes through the gate while it is activated
     * @param {object} [options={}] Optional options for the object
     *  If none is given, one will be constructed from the physics meshes
     * @param {Array<number>} [options.position] The object's default position
     * @param {Array<number>} [options.orientation] The object's default
     *  orientation
     * @param {Array<number>} [options.scale] The object's default scale
     * @param {Array<number>} [options.color] The object's color
     * @param {Object} [options.lightParams] The object's light coefficients
     * @param {boolean} [options.portable] Whether the object can be picked
     * @param {number} [options.collisionFilterGroup] The object's collision
     *  group
     * @param {number} [options.collisionFilterMask] The object's collision
     *  mask
     */
    constructor(world, program, shaderType, resources, callback, options = {}) {
        const scale = options.scale == undefined ? [1, 1, 1]
            : options.scale;
        const position = options.position == undefined ? [0, 0, 0]
            : options.position;
        options.scale = scale;
        options.position = position;
        options.mass = 0;
        options.color = [0.2, 0, 0.7];
        const meshes = resources.meshes;
        options.graphicalMesh = meshes['gateG'];

        const physMeshes = [
            meshes['gateD1'], meshes['gateD2'],
            meshes['gateD3'], meshes['gateD4'],
            meshes['gateD5'], meshes['gateD6'],
            meshes['gateD7'], meshes['gateD8'],
            meshes['gateD9'], meshes['gateD10']
        ];

        super(world, program, shaderType, physMeshes, options);

        // Activation flag
        this.activated = false;

        // Set up trigger
        const triggerPositionOffset = [
            0 * scale[0], 1.5 * scale[1], 0 * scale[2]];
        this.triggerBody = new CANNON.Body({
            shape: new CANNON.Box(new CANNON.Vec3(
                0.01 * scale[0], 3 * scale[1], 2 * scale[2])),
            isTrigger: true,
            mass: 0,
            quaternion: new CANNON.Quaternion(
                this.quaternion[0], this.quaternion[1],
                this.quaternion[2], this.quaternion[3]),
            position: new CANNON.Vec3(position[0] + triggerPositionOffset[0],
                position[1] + triggerPositionOffset[1],
                position[2] + triggerPositionOffset[2])
        });
        // Trigger callback
        this.triggerBody.addEventListener('collide', (event) => {
            if (this.activated) {
                callback(event);
            }
        });
        // Add trigger to world
        world.addBody(this.triggerBody);
    }

    activate() {
        this.activated = true;
        this.color = [0, 0, 1];
        this.calculateLightParams();
    }

    deactivate() {
        this.activated = false;
        this.color = [0.2, 0, 0.7];
        this.calculateLightParams();
    }
}