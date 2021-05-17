/** @module Pedestal */

import * as CANNON from './lib/cannon/cannon-es.js';
import MeshObject from './MeshObject.js';

export default class Pedestal extends MeshObject {
    constructor(world, program, shaderType, meshes, callback, options = {}) {
        const scale = options.scale == undefined ? [1, 1, 1]
            : options.scale;
        const position = options.position == undefined ? [0, 0, 0]
            : options.position;
        options.scale = scale;
        options.position = position;
        options.mass = 0;
        super(world, program, shaderType, meshes, options);

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
        this.triggerBody.addEventListener('collide', (event) => {
            callback(event);
        });
        // Add trigger to world
        world.addBody(this.triggerBody);
    }
}