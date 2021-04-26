/** @module GameObject */

import * as GLMAT from './lib/gl-matrix/index.js';

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
     */
    constructor(program, shaderType, options = {}) {
        const position = options.position == undefined ? [0, 0, 0]
            : options.position;
        const orientation = options.orientation == undefined ? [0, 0, 0]
            : options.orientation;
        const scale = options.scale == undefined ? [1, 1, 1]
            : options.scale;
        this.mass = options.mass == undefined ? 1
            : options.mass;
        this.color = options.color == undefined ? [1, 0, 0]
            : options.color;
        const lightParams = options.lightParams;

        // Required methods to be implemented
        if (typeof (this.initVBOs) != 'function') {
            throw new TypeError('Extending class is not fully implemented');
        }

        this.program = program;
        this.modelMatLoc = GL.getUniformLocation(this.program, 'modelMatrix');
        this.posLoc = GL.getAttribLocation(this.program, 'vPosition');

        if (shaderType == 'lit') {
            // Set light parameters or calculate from color
            if (lightParams != undefined) {
                // Use passed values otherwise
                this.ka = lightParams.ka;
                this.kd = lightParams.kd;
                this.ks = lightParams.ks;
                this.specExp = lightParams.specExp;
            } else {
                // Calculate lighting parameters if needed but not provided
                this.ka = GLMAT.vec3.create();
                GLMAT.vec3.scale(this.ka, this.color, 0.6);
                this.kd = GLMAT.vec3.create();
                GLMAT.vec3.scale(this.kd, this.color, 0.9);
                this.ks = GLMAT.vec3.create();
                GLMAT.vec3.scale(this.ks, [1, 1, 1], 0.7);
                this.specExp = 20;
            }
        }

        // Get uniform and attribute locations depending on used shader
        this.shaderType = shaderType;
        if (this.shaderType == 'colored') {
            this.colLoc = GL.getAttribLocation(this.program, 'vColor');
        } else if (this.shaderType == 'lit') {
            this.normalLoc = GL.getAttribLocation(this.program, 'vNormal');
            // TASK: Get the shader locations for the lighting uniforms
            this.kaLoc = GL.getUniformLocation(this.program, 'ka');
            this.kdLoc = GL.getUniformLocation(this.program, 'kd');
            this.ksLoc = GL.getUniformLocation(this.program, 'ks');
            this.specExpLoc = GL.getUniformLocation(this.program, 'specExp');
        } else if (this.shaderType == 'textured') {
            // TODO: get uniform sampler location
            this.texCoordLoc = GL.getAttribLocation(this.program, 'vTexCoord');
        } else if (this.shaderType == 'textured-lit') {
            this.texCoordLoc = GL.getAttribLocation(this.program, 'vTexCoord');
            // TODO: get uniform sampler location
            this.normalLoc = GL.getAttribLocation(this.program, 'vNormal');
            this.kaLoc = GL.getUniformLocation(this.program, 'ka');
            this.kdLoc = GL.getUniformLocation(this.program, 'kd');
            this.ksLoc = GL.getUniformLocation(this.program, 'ks');
            this.specExpLoc = GL.getUniformLocation(this.program, 'specExp');
        }

        // Set initial values for position, orientation and scale
        const quaternion = GLMAT.quat.create();
        GLMAT.quat.fromEuler(quaternion,
            orientation[0], orientation[1], orientation[2]);
        this.setModelMatrix(
            GLMAT.vec3.fromValues(position[0], position[1], position[2]),
            quaternion,
            GLMAT.vec3.fromValues(scale[0], scale[1], scale[2]));
    }

    /**
     * Update the model matrix based on the object's physical positon and
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
        // TODO: scale physics objects?
        this.scale = scale;

        // Calculate model matrix
        this.modelMatrix = GLMAT.mat4.create();
        GLMAT.mat4.fromRotationTranslationScale(
            this.modelMatrix, this.quaternion, this.position, this.scale);
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
        GL.vertexAttribPointer(this.colLoc, 3, GL.FLOAT, false, 0,
            this.positionCount * 4);

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
        // TASK: Pass the lighting uniforms to the shader
        GL.uniform3fv(this.kaLoc, this.ka);
        GL.uniform3fv(this.kdLoc, this.kd);
        GL.uniform3fv(this.ksLoc, this.ks);
        GL.uniform1f(this.specExpLoc, this.specExp);

        // Draw all the indices
        GL.drawElements(GL.TRIANGLES, this.indexCount, GL.UNSIGNED_SHORT, 0);
    }
}