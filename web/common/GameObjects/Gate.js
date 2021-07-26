/** @module Gate */

import MeshObject from './MeshObject.js';
import BoxObject from './BoxObject.js';
import * as CANNON from '../lib/cannon/cannon-es.js';

/**
 * A gate that can be activated and used to to trigger a callback
 * @extends MeshObject
 */
export default class Gate extends MeshObject {
    /**
     * @param {CANNON.World} world The physics world to add the gate to
     * @param {WebGLProgram} program The shader program to use
     * @param {WebGLProgram} portalProgram The shader program to use for the
     *  inner portal of the gate
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
    constructor(world, program, portalProgram, shaderType, resources, callback, options = {}) {
        const scale = options.scale == undefined ? [1, 1, 1]
            : options.scale;
        const position = options.position == undefined ? [0, 0, 0]
            : options.position;
        const orientation = options.orientation == undefined ? [0, 0, 0]
            : options.orientation;
        options.scale = scale;
        options.position = position;
        options.orientation = orientation;
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
        this.triggerObject = new BoxObject(world, portalProgram, 'colored', {
            position: [position[0], position[1] + 1.6 * scale[1], position[2]],
            halfExtents: [0.1 * scale[0], 1.6 * scale[1], 1.1 * scale[2]],
            mass: 0,
            orientation: orientation,
            color: [1, 0.5, 0, 0.5]
        });
        this.triggerObject.visible = false;
        this.triggerObject.physicsBody.isTrigger = true;

        // Trigger callback
        this.triggerObject.physicsBody.addEventListener('collide', (event) => {
            if (this.activated) {
                callback(event);
            }
        });

    }

    activate() {
        this.activated = true;
        this.triggerObject.visible = true;
        this.color = [1, 0.5, 0.0];
        this.calculateLightParams();
    }

    deactivate() {
        this.activated = false;
        this.triggerObject.visible = false;
        this.color = [0.2, 0, 0.7];
        this.calculateLightParams();
    }

    render() {
        super.render();
        this.triggerObject.render();
    }
}