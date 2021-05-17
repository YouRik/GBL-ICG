/** @module SphereObject */

import GameObject from './GameObject.js';
import * as CANNON from './lib/cannon/cannon-es.js';

/**
 * TODO: add documentation
 */

export default class SphereObject extends GameObject {
    constructor(world, program, shaderType, sphereMesh, options = {}) {
        const radius = options.radius == undefined ? 1 : options.radius;

        const opts = options;
        opts.scale = [radius, radius, radius];
        super(program, shaderType, opts);

        this.physicsBody.addShape(new CANNON.Sphere(radius));
        this.physicsBody.angularDamping = 0.3;
        world.addBody(this.physicsBody);
        this.initVBOs(sphereMesh);
    }

    initVBOs(mesh) {
        this.initVBOsWithMesh(mesh);
    }
}