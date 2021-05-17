/** @module Gate */

import * as CANNON from './lib/cannon/cannon-es.js';
import MeshObject from './MeshObject.js';

export default class Gate extends MeshObject {
    constructor(world, program, shaderType, meshes, callback, options = {}) {
        const scale = options.scale == undefined ? [1, 1, 1]
            : options.scale;
        const position = options.position == undefined ? [0, 0, 0]
            : options.position;
        options.scale = scale;
        options.position = position;
        options.mass = 0;
        super(world, program, shaderType, meshes, options);

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
}