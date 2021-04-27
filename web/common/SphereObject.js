/** @module SphereObject */

import GameObject from './GameObject.js';
import * as CANNON from './lib/cannon/cannon-es.js';

/**
 * TODO: add documentation
 */

export default class Box extends GameObject {
    constructor(world, program, shaderType, sphereMesh, options = {}) {
        const radius = options.radius == undefined ? 1 : options.radius;

        super(program, shaderType, {
            position: options.position,
            orientation: options.orientation,
            scale: [radius, radius, radius],
            mass: options.mass,
            color: options.color,
            lightParams: options.lightParams
        });

        this.physicsBody.addShape(new CANNON.Sphere(radius));
        world.addBody(this.physicsBody);
        this.initVBOs(sphereMesh);
    }

    initVBOs(mesh) {
        this.initVBOsWithMesh(mesh);
    }
}