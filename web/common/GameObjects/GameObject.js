/** @module GameObject */

import * as CANNON from '../lib/cannon/cannon-es.js';
import * as GLMAT from '../lib/gl-matrix/index.js';

/**
 * Abstract class for 3D game objects with a mesh and a physical body
 */
export default class GameObject {
    /**
     * Abstract constructor for game objects
     * @param {WebGLProgram} program The WebGL shader program for this object
     * @param {string} shaderType The type of shader. Can be one of 'colored',
     *  'lit', 'textured', 'textured-lit'
     * @param {object} [options={}] Optional options for the object
     * @param {GLMAT.vec3} [options.position] The object's default position
     * @param {GLMAT.vec3} [options.orientation] The object's default
     *  orientation
     * @param {GLMAT.vec3} [options.scale] The object's default scale
     * @param {number} [options.mass] The object's mass
     * @param {(GLMAT.vec3|GLMAT.vec4)} [options.color] The object's color
     * @param {Object} [options.lightParams] The object's light coefficients
     * @param {boolean} [options.portable] Whether the object can be picked
     * @param {number} [options.collisionFilterGroup] The object's collision
     *  group
     * @param {number} [options.collisionFilterMask] The object's collision
     *  mask
     */
    constructor(program, shaderType, options = {}) {
        const position = options.position == undefined ? [0, 0, 0]
            : options.position;
        const orientation = options.orientation == undefined ? [0, 0, 0]
            : options.orientation;
        const scale = options.scale == undefined ? [1, 1, 1]
            : options.scale;
        const mass = options.mass == undefined ? 1
            : options.mass;
        const lightParams = options.lightParams;
        const portable = options.portable == undefined ? false
            : options.portable;
        this.color = options.color == undefined ? [1, 0, 0]
            : options.color;
        let collisionFilterGroup = options.collisionFilterGroup == undefined
            ? 1 : options.collisionFilterGroup;
        const collisionFilterMask = options.collisionFilterMask == undefined
            ? -1 : options.collisionFilterMask;
        const castsShadow = options.castsShadow == undefined ? true
            : options.castsShadow;

        // Required methods to be implemented
        if (typeof (this.initVBOs) != 'function') {
            throw new TypeError('Extending class is not fully implemented');
        }

        this.program = program;
        this.shaderType = shaderType;
        this.modelMatLoc = GL.getUniformLocation(this.program, 'modelMatrix');
        this.posLoc = GL.getAttribLocation(this.program, 'vPosition');
        this.visible = true;
        this.castsShadow = castsShadow;

        this.calculateLightParams(lightParams);

        // Get uniform and attribute locations depending on used shader
        this.shaderType = shaderType;
        if (this.shaderType == 'colored') {
            this.colLoc = GL.getAttribLocation(this.program, 'vColor');
        } else if (this.shaderType == 'lit') {
            this.normalLoc = GL.getAttribLocation(this.program, 'vNormal');
            this.kaLoc = GL.getUniformLocation(this.program, 'ka');
            // TASK3.3: Get uniform locations of remaining lighting parameters



        } else if (this.shaderType == 'textured') {
            // TODO: get uniform sampler location
            this.texCoordLoc = GL.getAttribLocation(this.program, 'vTexCoord');
        } else if (this.shaderType == 'textured-lit') {
            this.texCoordLoc = GL.getAttribLocation(this.program, 'vTexCoord');
            // TODO: get uniform sampler location
            // TODO: get light parameters uniform location
            this.normalLoc = GL.getAttribLocation(this.program, 'vNormal');
        }

        // Set initial values for position, orientation and scale
        const quaternion = GLMAT.quat.create();
        GLMAT.quat.fromEuler(quaternion,
            orientation[0], orientation[1], orientation[2]);
        this.setModelMatrix(
            GLMAT.vec3.fromValues(position[0], position[1], position[2]),
            quaternion,
            GLMAT.vec3.fromValues(scale[0], scale[1], scale[2]));

        // Set collision filter group for being picked up
        if (portable) {
            collisionFilterGroup = collisionFilterGroup | 2;
        }
        // Initialize basic physics body
        this.physicsBody = new CANNON.Body({
            mass: mass,
            type: mass == 0 ? CANNON.Body.STATIC : CANNON.Body.DYNAMIC,
            material: new CANNON.Material({
                friction: 0.1,
                restitution: 0.1
            }),
            position: new CANNON.Vec3(this.position[0],
                this.position[1], this.position[2]),
            quaternion: new CANNON.Quaternion(this.quaternion[0],
                this.quaternion[1], this.quaternion[2], this.quaternion[3]),
            // if it's portable, additionally add it to collision group 2
            collisionFilterGroup: collisionFilterGroup,
            collisionFilterMask: collisionFilterMask
        });
    }

    /**
     * Calculate lighting parameters if needed and set them
     * @param {Object} lightParams The object containing light coefficients
     */
    calculateLightParams(lightParams) {
        if (this.shaderType == 'lit') {
            // Set light parameters or calculate from color
            if (lightParams != undefined) {
                // Use passed values otherwise
                this.ka = lightParams.ka;
                this.kd = lightParams.kd;
                this.ks = lightParams.ks;
                this.specExp = lightParams.specExp;
            } else {
                // Calculate lighting parameters if needed but not provided
                this.ka = this.color;
                this.kd = [0.4 * this.color[0] + 0.6,
                    0.4 * this.color[1] + 0.6,
                    0.4 * this.color[2] + 0.6];
                this.ks = [1, 1, 1];
                this.specExp = 20;
            }
        }
    }

    /**
     * Update the model matrix based on the object's physical position and
     * orientation
     */
    updateModelMatrix() {
        const posValues = this.physicsBody.position.toArray();
        const quatValues = this.physicsBody.quaternion.toArray();
        const position = GLMAT.vec3.fromValues(
            posValues[0], posValues[1], posValues[2]);
        const quaternion = GLMAT.quat.fromValues(quatValues[0], quatValues[1],
            quatValues[2], quatValues[3]);
        this.setModelMatrix(position, quaternion);
    }

    /**
     * Set the model matrix according to specific values
     * @param {GLMAT.vec3} [position=this.position] 3D vector position
     * @param {GLMAT.quat} [quaternion=this.quaternion] Orientation as
     *  quaternion vector
     * @param {GLMAT.vec3} [scale=this.scale] 3D vector scale
     */
    setModelMatrix(position = this.position, quaternion = this.quaternion,
        scale = this.scale) {
        this.position = position;
        this.quaternion = quaternion;
        this.scale = scale;

        // Calculate model matrix
        this.modelMatrix = GLMAT.mat4.create();
        GLMAT.mat4.fromRotationTranslationScale(
            this.modelMatrix, this.quaternion, this.position, this.scale);
    }

    /**
     * Helper function to initialize VBOs from mesh data
     * @param {object} mesh The mesh data to use for VBO initialization
     */
    initVBOsWithMesh(mesh) {
        this.positionCount = mesh.positions.length;
        this.indexCount = mesh.indices.length;
        let vertices = [];

        if (this.shaderType == 'colored') {
            const colors = [];
            for (let i = 0; i < this.positionCount; i++) {
                this.color.forEach(value => {
                    colors.push(value);
                });
            }
            vertices = mesh.positions.concat(colors);
        } else if (this.shaderType == 'lit') {
            vertices = mesh.positions.concat(mesh.normals);
        }

        this.dataVBO = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, this.dataVBO);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(vertices),
            GL.DYNAMIC_DRAW);

        this.indexVBO = GL.createBuffer();
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexVBO);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(mesh.indices),
            GL.DYNAMIC_DRAW);
    }

    /**
     * Update step
     */
    update() {
        this.updateModelMatrix();
    }

    /**
     * Render step, draw graphics according to shader type
     */
    render() {
        if (this.visible) {
            if (this.shaderType == 'colored') {
                this.renderColored();
            } else if (this.shaderType == 'lit') {
                this.renderLit();
            } else if (this.shaderType == 'textured') {
                // TODO: render textured
            } else if (this.shaderType == 'textured-lit') {
                // TODO: render textured and lit
            }
        }
    }

    /**
     * Draw the object in a solid color
     */
    renderColored() {
        // Bind buffers and shader program
        GL.bindBuffer(GL.ARRAY_BUFFER, this.dataVBO);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexVBO);
        GL.useProgram(this.program);

        // Set model matrix
        GL.uniformMatrix4fv(this.modelMatLoc, false, this.modelMatrix);

        // Set attribute pointer for positions
        GL.enableVertexAttribArray(this.posLoc);
        GL.vertexAttribPointer(this.posLoc, 3, GL.FLOAT, false, 0, 0);

        // Set attribute pointer for colors
        GL.enableVertexAttribArray(this.colLoc);
        GL.vertexAttribPointer(this.colLoc, this.color.length, GL.FLOAT, false,
            0, this.positionCount * 4);

        // Draw all the indices
        GL.drawElements(GL.TRIANGLES, this.indexCount, GL.UNSIGNED_SHORT, 0);
    }

    /**
     * Draw the object with a lighting shader
     */
    renderLit() {
        // Bind buffers and shader program
        GL.bindBuffer(GL.ARRAY_BUFFER, this.dataVBO);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexVBO);
        GL.useProgram(this.program);

        // Set model matrix
        GL.uniformMatrix4fv(this.modelMatLoc, false, this.modelMatrix);

        // Set attribute pointer for positions
        GL.enableVertexAttribArray(this.posLoc);
        GL.vertexAttribPointer(this.posLoc, 3, GL.FLOAT, false, 0, 0);

        // Set attribute pointer for normals
        GL.enableVertexAttribArray(this.normalLoc);
        GL.vertexAttribPointer(this.normalLoc, 3, GL.FLOAT, false, 0,
            this.positionCount * 4);

        // Pass lighting values
        GL.uniform3fv(this.kaLoc, this.ka);
        // TASK3.3: pass remaining lighting parameters to the shader
        

        
        // Draw all the indices
        GL.drawElements(GL.TRIANGLES, this.indexCount, GL.UNSIGNED_SHORT, 0);
    }

    /**
     * Draw the object to a shadow/depth map
     * @param {WebGLProgram} shaderProgram The depth/shadow map shader program
     * @param {WebGLUniformLocation} modelMatLoc The shader's uniform location
     *  for the model matrix
     */
    renderToShadowMap(shaderProgram, modelMatLoc) {
        if (this.visible && this.castsShadow) {
            // Bind buffers and shader program
            GL.bindBuffer(GL.ARRAY_BUFFER, this.dataVBO);
            GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.indexVBO);
            GL.useProgram(shaderProgram);

            // Set model matrix
            GL.uniformMatrix4fv(modelMatLoc, false, this.modelMatrix);

            // Set attribute pointer for positions
            GL.enableVertexAttribArray(this.posLoc);
            GL.vertexAttribPointer(this.posLoc, 3, GL.FLOAT, false, 0, 0);

            // Draw all the indices
            GL.drawElements(GL.TRIANGLES, this.indexCount, GL.UNSIGNED_SHORT,
                0);
        }
    }
}