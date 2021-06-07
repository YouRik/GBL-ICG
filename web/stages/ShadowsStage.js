/** @module ShadowsStage */

import DirectedLightSource from '../common/DirectedLightSource.js';
import Game from '../common/Game.js';
import Gate from '../common/GameObjects/Gate.js';
import Pedestal from '../common/GameObjects/Pedestal.js';
import SphereObject from '../common/GameObjects/SphereObject.js';

import * as GLMAT from '../common/lib/gl-matrix/index.js';
import { projection } from '../common/lib/gl-matrix/mat3.js';

/**
 * TODO: documentation
 */
export default class ShadowsStage extends Game {
    constructor() {
        super('shadows');
        // Load resources and stage, then start the game loop
        this.load().then(() => this.gameLoop());
    }

    // Override parent's setup to enable level-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);
        this.canvas = document.getElementById('gl-canvas');

        // Shadow map shader program
        this.shadowMapShader = this.programs['shadowMap'];
        this.shadowedShader = this.programs['shadowedFragmentLighting'];
        this.shadowMapLightSpaceMatLoc = GL.getUniformLocation(
            this.shadowMapShader, 'lightSpaceMatrix');
        this.shadowMapModMatLoc = GL.getUniformLocation(this.shadowMapShader,
            'modelMatrix');
        this.shadowMapLoc = GL.getUniformLocation(this.shadowedShader,
            'shadowMap');

        // Shadow map properties
        this.shadowWidth = 2048;
        this.shadowHeight = 2048;

        // Create shadow casting light source
        this.lightDirection = [100, -150, 200];
        this.dirLightSource = new DirectedLightSource(this.lightDirection,
            this.lightPrograms, {
            Id: [0.7, 0.7, 0.7],
            Is: [0.9, 0.9, 0.9]
        });
        this.updateLightSourceAmount();
        GL.useProgram(this.shadowMapShader);
        this.setLightSourceViewAndPerspective();

        this.testImage = resources.textures['test'];

        // Create framebuffer for shadow map
        this.shadowFramebuffer = GL.createFramebuffer();
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.shadowFramebuffer);
        this.depthMap = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.depthMap);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.DEPTH_COMPONENT32F, this.shadowWidth,
            this.shadowHeight, 0, GL.DEPTH_COMPONENT, GL.FLOAT, null);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.DEPTH_ATTACHMENT,
            GL.TEXTURE_2D, this.depthMap, 0);
        // GL.drawBuffers([GL.NONE]);
        // GL.readBuffer(GL.NONE);
        GL.bindTexture(GL.TEXTURE_2D, null);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        // GL.checkFramebufferStatus(GL.FRAMEBUFFER, this.shadowFramebuffer);
    }

    render() {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.shadowFramebuffer);
        GL.viewport(0, 0, this.shadowWidth, this.shadowHeight);
        GL.clear(GL.DEPTH_BUFFER_BIT);
        GL.cullFace(GL.FRONT);
        this.setLightSourceViewAndPerspective();
        // Render each object to shadow map, pass shadow map shader program
        this.gameObjects.forEach(object => {
            object.renderToShadowMap(this.shadowMapShader,
                this.shadowMapModMatLoc);
        });
        GL.cullFace(GL.BACK);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);

        this.setViewPort(this.canvas);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        // Bind texture and set as uniform for shadow map
        GL.useProgram(this.shadowedShader);
		GL.activeTexture(GL.TEXTURE0);
		GL.bindTexture(GL.TEXTURE_2D, this.depthMap);
		GL.uniform1i(GL.getUniformLocation(this.shadowedShader, 'shadowMap'), 0);
        GL.uniformMatrix4fv(GL.getUniformLocation(this.shadowedShader, 'lightSpaceMatrix'), false, this.lightSpaceMatrix);
        // Render all objects
        this.gameObjects.forEach(object => {
            object.render();
        });

        // TODO: render depth map as texture to quad to test
        // this.renderDepthMapQuad();
    }

    setLightSourceViewAndPerspective() {
        // Set orthographic projection matrix
        const projectionMatrix = GLMAT.mat4.create();
        GLMAT.mat4.ortho(projectionMatrix, -20, 20, -20, 20, 1, 500);

        // Set view matrix
        const viewMatrix = GLMAT.mat4.create();
        // Look at scene center from negative light direction
        GLMAT.mat4.lookAt(viewMatrix,
            [
                -this.lightDirection[0],
                -this.lightDirection[1],
                -this.lightDirection[2],
            ],
            [0, 0, 0], [0, 1, 0]);
        // Pass multiplied to shadow map shader
        this.lightSpaceMatrix = GLMAT.mat4.create();
        GLMAT.mat4.mul(this.lightSpaceMatrix, projectionMatrix, viewMatrix);
        GL.useProgram(this.shadowMapShader);
        GL.uniformMatrix4fv(this.shadowMapLightSpaceMatLoc, false, this.lightSpaceMatrix);
    }

    renderDepthMapQuad() {
        // Init arrays
        const positions = [
            -0.75, -0.75, 		// lower left
            0.75, -0.75,		// lower right
            -0.75, 0.75, 		// upper left
            0.75, 0.75,			// upper right
            -0.75, 0.75, 		// upper left
            0.75, -0.75			// lower right
        ];

        const texCoords = [
            0.0, 1.0,			// lower left
            1.0, 1.0,			// lower right
            0.0, 0.0,			// upper left
            1.0, 0.0,			// upper right
            0.0, 0.0,			// upper left
            1.0, 1.0			// lower right
        ];

        // Init VBOs
        const posVBO = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, posVBO);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(positions),
            GL.DYNAMIC_DRAW);

        const texCoordVBO = GL.createBuffer();
        GL.bindBuffer(GL.ARRAY_BUFFER, texCoordVBO);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(texCoords),
            GL.DYNAMIC_DRAW);

        // Use shader
        const program = this.programs['depthTextured'];
        GL.useProgram(program);

        // const texture = GL.createTexture();
        // GL.activeTexture(GL.TEXTURE1);
		// GL.bindTexture(GL.TEXTURE_2D, texture);
		// GL.texImage2D(GL.TEXTURE_2D, 0, GL.RGB, GL.RGB, GL.UNSIGNED_BYTE, 
        //     this.testImage);
		// GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
		// GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        // Activate texture
		GL.activeTexture(GL.TEXTURE0);
		GL.bindTexture(GL.TEXTURE_2D, this.depthMap);
		GL.uniform1i(GL.getUniformLocation(program, "uSampler"), 0);

        // Bind VBOs
        GL.bindBuffer(GL.ARRAY_BUFFER, posVBO);
        const posLoc = GL.getAttribLocation(program, "vPosition");
        GL.enableVertexAttribArray(posLoc);
        GL.vertexAttribPointer(posLoc, 2, GL.FLOAT, false, 0, 0);
    
        GL.bindBuffer(GL.ARRAY_BUFFER, texCoordVBO);
        const texCoordsLoc = GL.getAttribLocation(program, "vTexCoord");
        GL.enableVertexAttribArray(texCoordsLoc);
        GL.vertexAttribPointer(texCoordsLoc, 2, GL.FLOAT, false, 0, 0);
    
        // Render
        GL.clear(GL.COLOR_BUFFER_BIT);
        GL.drawArrays(GL.TRIANGLES, 0, 6);
    }
}