/** @module ShadowsStage */

import Game from '../common/Game.js';
import GameObject from '../common/GameObjects/GameObject.js';
import Box from '../common/GameObjects/BoxObject.js';
import Checkpoint from '../common/GameObjects/Checkpoint.js';
import Gate from '../common/GameObjects/Gate.js';
import Pedestal from '../common/GameObjects/Pedestal.js';
import SphereObject from '../common/GameObjects/SphereObject.js';

import * as GLMAT from '../common/lib/gl-matrix/index.js';
import TaskSwitcher from '../common/TaskSwitcher.js';

/**
 * The stage designed to teach shadow mapping
 */
export default class ShadowsStage extends Game {
    constructor() {
        super('shadows');
    }

    // Override parent's setup to implement stage-specific logic
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        // General game setup
        super.setup(resources, shaderDefs, sceneDefs, objectDefs);

        // Shorter name for access to mesh resources
        const meshes = resources.meshes;

        // Handle switching between tasks
        this.taskSwitcher = new TaskSwitcher(2);

        // Add checkpoints
        this.gameObjects.push(new Checkpoint(this.world,
            this.programs['colored'], meshes['icoSphere'], [-51, 3, -1],
            [-51, 2.9, -1], 115, -5, this.player, null, 4));
        this.gameObjects.push(new Checkpoint(this.world,
            this.programs['colored'], meshes['icoSphere'], [15, 1, -33],
            [15, 0.9, -33], 160, 0, this.player, null, 1));

        // Get sliders for display of orb heat
        this.heatSlider1 = document.getElementById('heatslider1');
        this.heatSlider2 = document.getElementById('heatslider2');
        // And set their initial values
        this.heatValue1 = 0;
        this.heatValue2 = 0;

        // Glass wall that blocks access to the second orb
        this.glassWall = new Box(this.world, this.programs['colored'],
            'colored', {
                halfExtents: [0.1, 2, 1.5],
                position: [21, 2, -18.5],
                color: [0.4, 0.3, 0.2, 0.3],
                mass: 0
            });
        this.gameObjects.push(this.glassWall);

        // Orbs in this stage have to be slightly bigger than the normal ones
        // to be correctly seen as in-shadow when they are directly behind a
        // wall due to low shadow precision
        // Orb 1
        this.orb1 = new SphereObject(this.world,
            this.programs['fragmentLighting'], 'lit',
            meshes['icoSphere'], {
                mass: 5,
                lightParams: {
                    ka: [0.57, 0.36, 0.51],
                    kd: [0.31, 0.83, 0.63],
                    ks: [1, 1, 1],
                    specExp: 10
                },
                radius: 0.6,
                position: localStorage.orb1Placed == 'true' ? [-68, 3.8, 0]
                    : [22, 0.6, -21.5],
                portable: true
            });
        this.gameObjects.push(this.orb1);

        // Orb 2
        this.orb2 = new SphereObject(this.world,
            this.programs['fragmentLighting'], 'lit',
            meshes['icoSphere'], {
                mass: 5,
                lightParams: {
                    ka: [0.45, 0.15, 0.20],
                    kd: [0.31, 0.83, 0.73],
                    ks: [0.93, 0.85, 0.2],
                    specExp: 10
                },
                radius: 0.6,
                position: [22, 0.6, -18.5],
                portable: true
            });
        this.gameObjects.push(this.orb2);

        // Pedestal 1
        const pedestal1Filled = () => {
            // Move the glass wall to allow access to the second orb
            localStorage.setItem('orb1Placed', 'true');
            this.glassWall.physicsBody.position.y = 4;
            this.taskSwitcher.unlockTasks(1);
            this.taskSwitcher.switchTask(1);
        };
        const pedestal1Emptied = (event) => {
            if (event.bodyA === this.orb1.physicsBody
                || event.bodyB === this.orb1.physicsBody) {
                // Move the glass wall back to block the second orb
                localStorage.removeItem('orb1Placed');
                this.glassWall.physicsBody.position.y = 2;
            }
        };
        const pedestal1 = new Pedestal(this.world,
            this.programs['fragmentLighting'], 'lit', resources,
            pedestal1Filled, {
                position: [-68, 2, 0],
                color: [0, 0, 1],
                scale: [2, 1, 2]
            });
        this.gameObjects.push(pedestal1);

        // Gate 1
        const gate1Entered = (event) => {
            if (event.body === this.player.physicsBody) {
                localStorage.stagesDone = Math.max(localStorage.stagesDone, 4);
                window.location.replace('hub');
            }
        };
        const gate1 = new Gate(this.world, this.programs['fragmentLighting'],
            'lit', resources, gate1Entered,
            {
                scale: [1, 1, 1],
                orientation: [0, 90, 0],
                color: [0.2, 0, 0.7],
                position: [50, 0, -200]
            }
        );
        this.gameObjects.push(gate1);

        // Pedestal 2
        const pedestal2Filled = () => {
            gate1.activate();
        };
        const pedestal2Emptied = (event) => {
            if (event.bodyA === this.orb2.physicsBody
                || event.bodyB === this.orb2.physicsBody) {
                gate1.deactivate();
            }
        };
        const pedestal2 = new Pedestal(this.world,
            this.programs['fragmentLighting'], 'lit', resources,
            pedestal2Filled, {
                position: [40, 0, -210],
                color: [0.5, 0.5, 1],
                scale: [2, 1, 2]
            });
        this.gameObjects.push(pedestal2);

        // World event listener for contact exits
        this.world.addEventListener('endContact', (event) => {
            if (event.bodyA === pedestal1.triggerBody
                || event.bodyB === pedestal1.triggerBody) {
                pedestal1Emptied(event);
            }
            if (event.bodyA === pedestal2.triggerBody
                || event.bodyB === pedestal2.triggerBody) {
                pedestal2Emptied(event);
            }
        });
    }

    // Extend update to check if the two orbs are in shadow or not
    update(deltaTime) {
        // Set heat slider value for orb1 if it is not placed on its pedestal
        if (localStorage.orb1Placed != 'true') {
            if (this.isInShadow(this.orb1)) {
                this.heatValue1 -= deltaTime * 50;
            } else {
                this.heatValue1 += deltaTime * 50;
            }
            this.heatValue1 = Math.max(this.heatSlider1.min, this.heatValue1);
        } else {
            this.heatValue1 = -1000;
        }
        this.heatSlider1.value = this.heatValue1;

        // Set heat slider value for orb2
        if (this.isInShadow(this.orb2)) {
            this.heatValue2 -= deltaTime * 50;
        } else {
            this.heatValue2 += deltaTime * 50;
        }
        this.heatSlider2.value = this.heatValue2;

        // Restart if one of the orbs got too hot or too cold
        if (this.heatValue1 > this.heatSlider1.max
            || this.heatValue2 > this.heatSlider2.max
            || this.heatValue2 < this.heatSlider2.min) {
            this.isPaused = true;
            location.reload();
        }

        // Do usual update
        super.update(deltaTime);
    }

    /**
     * Check whether an object's center point is in shadow according to the
     * depth/shadow map
     * @param {GameObject} object The object to check
     * @returns {boolean} True if the object's center point is in shadow,
     *  false otherwise
     */
    isInShadow(object) {
        GL.bindFramebuffer(GL.FRAMEBUFFER, this.shadowFramebuffer);
        // Calculate object's depth in light space
        const objPosLightSpace = GLMAT.vec3.create();
        GLMAT.vec3.transformMat4(objPosLightSpace,
            object.position, this.lightSpaceMatrix);
        const objDepth = Math.round((objPosLightSpace[2] + 1) / 2 * 255);

        // Read pixel value from depth texture at object's position
        GL.readBuffer(GL.COLOR_ATTACHMENT0);
        const pixelArr = new Uint8Array(4);
        const xCoord = Math.round(
            (objPosLightSpace[0] + 1) / 2 * this.shadowWidth);
        const yCoord = Math.round(
            (objPosLightSpace[1] + 1) / 2 * this.shadowHeight);
        GL.readPixels(xCoord, yCoord, 1, 1,
            GL.getParameter(GL.IMPLEMENTATION_COLOR_READ_FORMAT),
            GL.UNSIGNED_BYTE, pixelArr);

        // Pixel not in shadow if outside of shadow map
        if (xCoord < 0 || xCoord >= this.shadowWidth
            || yCoord < 0 || yCoord >= this.shadowHeight) {
            pixelArr[0] = 255;
        }
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);

        // Check if the object is in shadow or not
        if (pixelArr[0] >= objDepth) {
            return false;
        } else {
            return true;
        }
    }

    // Extend render if depth map quad is to be rendered for testing purposes
    render() {
        // Render as usual
        super.render();

        // render depth map as texture to quad for testing
        // this.renderDepthMapQuad();
    }

    /**
     * Create and render a quad showing the depth map.
     * This is not optimized in any way.
     */
    renderDepthMapQuad() {
        // Init arrays for vertex positions and texture coordinates
        const positions = [
            -0.75, -0.75, 		// lower left
            0.75, -0.75,		// lower right
            -0.75, 0.75, 		// upper left
            0.75, 0.75,			// upper right
            -0.75, 0.75, 		// upper left
            0.75, -0.75			// lower right
        ];
        const texCoords = [
            0.0, 0.0,			// lower left
            1.0, 0.0,			// lower right
            0.0, 1.0,			// upper left
            1.0, 1.0,			// upper right
            0.0, 1.0,			// upper left
            1.0, 0.0			// lower right
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

        // Activate texture
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, this.depthMap);
        GL.uniform1i(GL.getUniformLocation(program, 'uSampler'), 0);

        // Bind VBOs
        GL.bindBuffer(GL.ARRAY_BUFFER, posVBO);
        const posLoc = GL.getAttribLocation(program, 'vPosition');
        GL.enableVertexAttribArray(posLoc);
        GL.vertexAttribPointer(posLoc, 2, GL.FLOAT, false, 0, 0);

        GL.bindBuffer(GL.ARRAY_BUFFER, texCoordVBO);
        const texCoordsLoc = GL.getAttribLocation(program, 'vTexCoord');
        GL.enableVertexAttribArray(texCoordsLoc);
        GL.vertexAttribPointer(texCoordsLoc, 2, GL.FLOAT, false, 0, 0);

        // Render
        GL.drawArrays(GL.TRIANGLES, 0, 6);
    }
}