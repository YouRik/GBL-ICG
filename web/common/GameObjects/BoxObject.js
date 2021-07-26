/** @module BoxObject */

import GameObject from './GameObject.js';
import * as CANNON from '../lib/cannon/cannon-es.js';

/**
 * A game object in the shape of a box
 * @extends GameObject
 */
export default class Box extends GameObject {
    /**
        * @param {CANNON.World} world The physics world to add the box to 
        * @param {WebGLProgram} program The shader program to use for rendering
        * @param {string} shaderType Type of shader used. 'colored' or 'lit'
        * @param {object} [options={}] Optional options for the object
        *  If none is given, one will be constructed from the physics meshes
        * @param {Array<number>} [options.position] The object's default position
        * @param {Array<number>} [options.orientation] The object's default
        *  orientation
        * @param {number} [options.halfExtents] The box's half extents
        * @param {number} [options.mass] The object's mass
        * @param {Array<number>} [options.color] The object's color
        * @param {Object} [options.lightParams] The object's light coefficients
        * @param {boolean} [options.portable] Whether the object can be picked
        * @param {number} [options.collisionFilterGroup] The object's collision
        *  group
        * @param {number} [options.collisionFilterMask] The object's collision
        *  mask
    */
    constructor(world, program, shaderType, options = {}) {
        const halfExtents = options.halfExtents == undefined ? [1, 1, 1]
            : options.halfExtents;

        super(program, shaderType, options);

        const box = new CANNON.Box(new CANNON.Vec3(
            halfExtents[0],
            halfExtents[1],
            halfExtents[2]
        ));

        this.physicsBody.addShape(box);

        world.addBody(this.physicsBody);
        this.initVBOs(box);
    }

    /**
     * Initialize the VBOs
     * @param {CANNON.Box} box The box defining this game object's shape
     */
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
    /**
     * Initialize the VBOs with colors included when a 'colored' shader is used
     * @param {CANNON.Box} box The box defining this game object's shape
     */
    initVBOsColored(box) {
        const hE = box.halfExtents;
        const positions = [
            -hE.x, -hE.y, -hE.z,
            +hE.x, -hE.y, -hE.z,
            +hE.x, +hE.y, -hE.z,
            -hE.x, +hE.y, -hE.z,
            -hE.x, -hE.y, +hE.z,
            +hE.x, -hE.y, +hE.z,
            +hE.x, +hE.y, +hE.z,
            -hE.x, +hE.y, +hE.z
        ];
        this.positionCount = positions.length;

        const colors = [];
        for (let i = 0; i < this.positionCount; i++) {
            this.color.forEach(value => {
                colors.push(value);
            });
        }

        // Two triangles per face
        const indices = [
            4, 6, 7,
            4, 5, 6,

            1, 6, 5,
            1, 2, 6,

            7, 2, 3,
            7, 6, 2,

            0, 5, 4,
            0, 1, 5,

            7, 3, 4,
            3, 0, 4,

            3, 2, 0,
            2, 1, 0
        ];
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

    /**
     * Initialize the VBOs when a lit shader is used
     * @param {CANNON.Box} box The box that defines this object's shape
     */
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
            6, 3, 1,
            11, 6, 1,

            12, 10, 0,
            12, 23, 10,

            14, 17, 21,
            17, 19, 21,

            2, 4, 13,
            4, 15, 13,

            7, 16, 5,
            18, 16, 7,

            9, 22, 8,
            22, 20, 8
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
        //     3, 1, 0,
        //     3, 2, 1,
        //     4, 3, 0,
        //     4, 7, 3,
        //     5, 7, 4,
        //     5, 6, 7,
        //     1, 4, 0,
        //     5, 4, 1,
        //     2, 5, 1,
        //     2, 6, 5,
        //     3, 7, 2,
        //     7, 6, 2
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

    /**
     * Modify the box's physical scale
     * @param {Array<number>} scale Scale to use
     */
    scalePhysicsShape(scale) {
        const oldShape = this.physicsBody.shapes[0];
        this.physicsBody.removeShape(oldShape);
        
        if (this.halfExtentsOrig === undefined) {
            this.halfExtentsOrig = oldShape.halfExtents;
        }
        const newHalfExtents = new CANNON.Vec3(
            scale[0] * this.halfExtentsOrig.x,
            scale[1] * this.halfExtentsOrig.y,
            scale[2] * this.halfExtentsOrig.z,
        );
        const newShape = new CANNON.Box(newHalfExtents);
        this.physicsBody.addShape(newShape);
    }
}