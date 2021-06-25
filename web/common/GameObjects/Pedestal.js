/** @module Pedestal */

import MeshObject from './MeshObject.js';
import * as CANNON from '../lib/cannon/cannon-es.js';

/**
 * Pedestal game object that triggers a callback
 * @extends MeshObject
 */
export default class Pedestal extends MeshObject {
    /**
     * @param {CANNON.World} world Physics world to add the pedestal to
     * @param {WebGLProgram} program The shader program to use for rendering
     * @param {string} shaderType The type of shader used. 'colored' or 'lit'
     * @param {Object} resources Resources object to pick the correct meshes
     *  from
     * @param {function} [callback] Function called when something is placed on
     *  the pedestal
     * @param {object} [options={}] Optional options for the object
     * @param {Array<number>} [options.position] The object's default position
     * @param {Array<number>} [options.orientation] The object's default
     *  orientation
     * @param {Array<number>} [options.scale] The object's default scale
     * @param {Array<number>} [options.color] The object's color
     * @param {Object} [options.lightParams] The object's light coefficients
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
        const meshes = resources.meshes;
        options.graphicalMesh = meshes['pedestalG'];

        const physMeshes = [
            meshes['pedestalD1'],
            meshes['pedestalD2'],
            meshes['pedestalD3'],
            meshes['pedestalD4'],
            meshes['pedestalD5'],
            meshes['pedestalD6'],
            meshes['pedestalD7'],
            meshes['pedestalD8'],
            meshes['pedestalD9'],
            meshes['pedestalD10'],
            meshes['pedestalD11']
        ];

        super(world, program, shaderType, physMeshes, options);

        // Set up trigger
        const minScale = Math.min(scale[0], scale[1], scale[2]);
        const triggerPositionOffset = [
            0 * scale[0], 1.2 * scale[1], 0 * scale [2]];
        this.triggerBody = new CANNON.Body({
            shape: new CANNON.Sphere(0.15 * minScale),
            isTrigger: true,
            mass: 0,
            position: new CANNON.Vec3(position[0] + triggerPositionOffset[0],
                position[1] + triggerPositionOffset[1],
                position[2] + triggerPositionOffset[2])
        });
        // Set up callback to trigger callback
        if (callback) {
            this.triggerBody.addEventListener('collide', (event) => {
                callback(event);
            });
        }
        // Add trigger to world
        world.addBody(this.triggerBody);
    }
}