/** @module BoxObject */

import GameObject from './GameObject.js';
import * as CANNON from './lib/cannon/cannon-es.js';
import * as GLMAT from './lib/gl-matrix/index.js';

/**
 * TODO: add documentation
 */
export default class Box extends GameObject {
    constructor(world, program, shaderType, options = {}) {
        const halfExtents = options.halfExtents == undefined ? [1, 1, 1]
            : options.halfExtents;

        super(program, shaderType, {
            position: options.position,
            orientation: options.orientation,
            mass: options.mass,
            color: options.color,
            lightParams: options.lightParams
        });

        const box = new CANNON.Box(new CANNON.Vec3(
            halfExtents[0],
            halfExtents[1],
            halfExtents[2]
        ));

        this.physicsBody = new CANNON.Body({
            shape: box,
            mass: this.mass,
            type: this.mass == 0 ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
            material: new CANNON.Material({
                friction: 1,
                restitution: 0.2
            })
        });
        this.physicsBody.position.set(
            this.position[0], this.position[1], this.position[2]);
        this.physicsBody.quaternion.set(this.quaternion[0], this.quaternion[1],
            this.quaternion[2], this.quaternion[3]);

        world.addBody(this.physicsBody);
        this.initVBOs(box);
    }

    initVBOs(box) {
        if (this.shaderType == 'colored') {
            this.initVBOsColored(box);
        } else if (this.shaderType == 'lit') {
            this.initVBOsLit(box);
        } else if (this.shaderType == 'textured') {
            // TODO: init textured VBOs
        } else if (this.shaderType == 'textured-lit') {
            // TODO: init textured and lit VBOs
        }
    }

    initVBOsColored(box) {
        // TODO: fix winding order of faces

        const positions = [];
        box.convexPolyhedronRepresentation.vertices.forEach(position => {
            positions.push(position.x);
            positions.push(position.y);
            positions.push(position.z);
        });
        this.positionCount = positions.length;

        const colors = [];
        for (let i = 0; i < positions.length; i++) {
            this.color.forEach(value => {
                colors.push(value);
            });
        }

        const indices = [];
        // Two triangles per face
        box.convexPolyhedronRepresentation.faces.forEach(face => {
            indices.push(face[0]);
            indices.push(face[1]);
            indices.push(face[2]);

            indices.push(face[0]);
            indices.push(face[2]);
            indices.push(face[3]);
        });
        this.indexCount = indices.length;

        const vertices = positions.concat(colors);

        this.dataVBO = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.dataVBO);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices),
            GL.DYNAMIC_DRAW);

        this.indexVBO = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexVBO);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
            GL.DYNAMIC_DRAW);
    }

    initVBOsLit(box) {
        const hE = box.halfExtents;
        // Per face normal
        const positions = [
            -hE.x, -hE.y, -hE.z,
            -hE.x, -hE.y, -hE.z,
            -hE.x, -hE.y, -hE.z,

            +hE.x, -hE.y, -hE.z,
            +hE.x, -hE.y, -hE.z,
            +hE.x, -hE.y, -hE.z,

            +hE.x, +hE.y, -hE.z,
            +hE.x, +hE.y, -hE.z,
            +hE.x, +hE.y, -hE.z,

            -hE.x, +hE.y, -hE.z,
            -hE.x, +hE.y, -hE.z,
            -hE.x, +hE.y, -hE.z,

            -hE.x, -hE.y, +hE.z,
            -hE.x, -hE.y, +hE.z,
            -hE.x, -hE.y, +hE.z,

            +hE.x, -hE.y, +hE.z,
            +hE.x, -hE.y, +hE.z,
            +hE.x, -hE.y, +hE.z,

            +hE.x, +hE.y, +hE.z,
            +hE.x, +hE.y, +hE.z,
            +hE.x, +hE.y, +hE.z,

            -hE.x, +hE.y, +hE.z,
            -hE.x, +hE.y, +hE.z,
            -hE.x, +hE.y, +hE.z,
        ];
        const normals = [
            -1, 0, 0,
            0, 0, -1,
            0, -1, 0,

            0, 0, -1,
            0, -1, 0,
            1, 0, 0,

            0, 0, -1,
            1, 0, 0,
            0, 1, 0,

            0, 1, 0,
            -1, 0, 0,
            0, 0, -1,

            -1, 0, 0,
            0, -1, 0,
            0, 0, 1,

            0, -1, 0,
            1, 0, 0,
            0, 0, 1,

            1, 0, 0,
            0, 0, 1,
            0, 1, 0,

            0, 0, 1,
            0, 1, 0,
            -1, 0, 0
        ];
        const indices = [
            1, 3, 6,
            1, 6, 11,

            0, 10, 12,
            10, 23, 12,

            21, 17, 14,
            21, 19, 17,

            13, 4, 2,
            13, 15, 4,

            5, 16, 7,
            7, 16, 18,

            8, 22, 9,
            8, 20, 22
        ];

        // Per vertex normal
        // const positions = [
        //     -hE.x, -hE.y, -hE.z,
        //     +hE.x, -hE.y, -hE.z,
        //     +hE.x, +hE.y, -hE.z,
        //     -hE.x, +hE.y, -hE.z,
        //     -hE.x, -hE.y, +hE.z,
        //     +hE.x, -hE.y, +hE.z,
        //     +hE.x, +hE.y, +hE.z,
        //     -hE.x, +hE.y, +hE.z,
        // ];
        // const normals = [
        //     -1, -1, -1,
        //     +1, -1, -1,
        //     +1, +1, -1,
        //     -1, +1, -1,
        //     -1, -1, +1,
        //     +1, -1, +1,
        //     +1, +1, +1,
        //     -1, +1, +1
        // ];
        // // Triangles with correct winding order
        // // (counter clockwise is front facing)
        // const indices = [
        //     0, 1, 3,
        //     1, 2, 3,
        //     0, 3, 4,
        //     3, 7, 4,
        //     4, 7, 5,
        //     7, 6, 5,
        //     0, 4, 1,
        //     1, 4, 5,
        //     1, 5, 2,
        //     5, 6, 2,
        //     2, 7, 3,
        //     2, 6, 7
        // ];

        this.positionCount = positions.length;
        this.indexCount = indices.length;

        const vertices = positions.concat(normals);

        this.dataVBO = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.dataVBO);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices),
            GL.DYNAMIC_DRAW);

        this.indexVBO = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexVBO);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(indices),
            GL.DYNAMIC_DRAW);
    }
}