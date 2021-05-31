/** @module Pedestal */

import * as CANNON from './lib/cannon/cannon-es.js';
import MeshObject from './MeshObject.js';

export default class Pedestal extends MeshObject {
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
        // Trigger callback
        if (callback) {
            this.triggerBody.addEventListener('collide', (event) => {
                callback(event);
            });
        }
        // Add trigger to world
        world.addBody(this.triggerBody);
    }
}