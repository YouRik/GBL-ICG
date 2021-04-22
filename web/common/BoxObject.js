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
        const mass = options.mass == undefined ? 1
            : options.mass;
        const color = options.color == undefined ? [1, 0, 0]
            : options.color;
        const lightParams = options.lightParams;

        super(program, shaderType,
            {
                position: options.position,
                orientation: options.orientation
            });

        if (shaderType == 'lit' && lightParams == undefined) {
            // Calculate lighting parameters if needed but not provided
            this.ka = GLMAT.vec3.create();
            GLMAT.vec3.scale(this.ka, color, 0.6);
            this.kd = GLMAT.vec3.create();
            GLMAT.vec3.scale(this.kd, color, 0.9);
            this.ks = GLMAT.vec3.create();
            GLMAT.vec3.scale(this.ks, [1, 1, 1], 0.7);
            this.specExp = 20;
        } else if (shaderType == 'lit') {
            // Use passed values otherwise
            this.ka = lightParams.ka;
            this.kd = lightParams.kd;
            this.ks = lightParams.ks;
            this.specExp = lightParams.specExp;
        }

        const box = new CANNON.Box(new CANNON.Vec3(
            halfExtents[0],
            halfExtents[1],
            halfExtents[2]
        ));

        this.physicsBody = new CANNON.Body({
            shape: box,
            mass: mass,
            type: mass == 0 ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
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
        this.initVBOs(box, color);
    }

    initVBOs(box, color) {
        if (this.shaderType == 'colored') {
            this.initVBOsColored(box, color);
        } else if (this.shaderType == 'lit') {
            this.initVBOsLit(box, color);
        } else if (this.shaderType == 'textured') {
            // TODO: init textured VBOs
        } else if (this.shaderType == 'textured-lit') {
            // TODO: init textured and lit VBOs
        }
    }

    initVBOsColored(box, color) {
        this.vboLayout = 0;

        // TODO: fix winding order of faces

        const positions = [];
        box.convexPolyhedronRepresentation.vertices.forEach(position => {
            positions.push(position.x);
            positions.push(position.y);
            positions.push(position.z);
        });
        this.positionAmount = positions.length;

        const colors = [];
        for (let i = 0; i < positions.length; i++) {
            color.forEach(value => {
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
        this.indexAmount = indices.length;

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

    initVBOsLit(box, color) {
        this.vboLayout = 0;

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

        this.positionAmount = positions.length;
        this.indexAmount = indices.length;

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