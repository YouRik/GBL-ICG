/** @module Game */

import { loadStage, loadResources } from './LoadResources.js';
import initShaders from './InitShaders.js';
import LightSource from './LightSource.js';
import DirectedLightSource from './DirectedLightSource.js';
import FirstPersonPlayer from './FirstPersonPlayer.js';
import PerformanceLogger from './PerformanceLogger.js';
import Pedestal from './GameObjects/Pedestal.js';
import BoxObject from './GameObjects/BoxObject.js';
import MeshObject from './GameObjects/MeshObject.js';
import CubeObject from './GameObjects/CubeObject.js';
import SphereObject from './GameObjects/SphereObject.js';
import LitPlatform from './GameObjects/LitPlatform.js';
import Cloud from './GameObjects/Cloud.js';
import * as CANNON from './lib/cannon/cannon-es.js';
import * as GLMAT from './lib/gl-matrix/index.js';

/**
 * TODO: documentation
 */
export default class Game {
    constructor(stageName) {
        this.isPaused = true;
        this.stageName = stageName;
    }

    /**
     * Load stage data
     */
    load() {
        // Resources required to be loaded in any stage
        const baseResources = {
            shaders: [
                ["fragLightingV", "shaders/tasks/fragment_lighting.vs"],
                ["fragLightingF", "shaders/tasks/fragment_lighting.fs"],
                ["defaultV", "shaders/default.vs"],
                ["defaultF", "shaders/default.fs"],
                ["depthV", "shaders/tasks/depth.vs"],
                ["depthF", "shaders/tasks/depth.fs"]
            ],
            textures: [],
            meshes: [
                ["icoSphere", "meshes/icosphere.ply"],
                ["icoSphereSoft", "meshes/icosphere_soft.ply"],
                ["island", "meshes/island.ply"],
                ["islandC", "meshes/island_collider.ply"],
                ["pedestalD1", "meshes/pedestal_convdecomp1.ply"],
                ["pedestalD2", "meshes/pedestal_convdecomp2.ply"],
                ["pedestalD3", "meshes/pedestal_convdecomp3.ply"],
                ["pedestalD4", "meshes/pedestal_convdecomp4.ply"],
                ["pedestalD5", "meshes/pedestal_convdecomp5.ply"],
                ["pedestalD6", "meshes/pedestal_convdecomp6.ply"],
                ["pedestalD7", "meshes/pedestal_convdecomp7.ply"],
                ["pedestalD8", "meshes/pedestal_convdecomp8.ply"],
                ["pedestalD9", "meshes/pedestal_convdecomp9.ply"],
                ["pedestalD10", "meshes/pedestal_convdecomp10.ply"],
                ["pedestalD11", "meshes/pedestal_convdecomp11.ply"],
                ["pedestalG", "meshes/pedestal.ply"],
                ["gateD1", "meshes/gate_convdecomp1.ply"],
                ["gateD2", "meshes/gate_convdecomp2.ply"],
                ["gateD3", "meshes/gate_convdecomp3.ply"],
                ["gateD4", "meshes/gate_convdecomp4.ply"],
                ["gateD5", "meshes/gate_convdecomp5.ply"],
                ["gateD6", "meshes/gate_convdecomp6.ply"],
                ["gateD7", "meshes/gate_convdecomp7.ply"],
                ["gateD8", "meshes/gate_convdecomp8.ply"],
                ["gateD9", "meshes/gate_convdecomp9.ply"],
                ["gateD10", "meshes/gate_convdecomp10.ply"],
                ["gateG", "meshes/gate.ply"]
            ],
            programs: {
                fragmentLighting: {
                    type: "lit",
                    vertex: "fragLightingV",
                    fragment: "fragLightingF"
                },
                colored: {
                    type: "colored",
                    vertex: "defaultV",
                    fragment: "defaultF"
                },
                shadowMap: {
                    type: "shadowMap",
                    vertex: "depthV",
                    fragment: "depthF"
                }
            }
        };

        return loadStage(`stages/${this.stageName}.json`).then(levelData => {
            const resourceFiles = levelData['resources'];

            // Combine stage resource lists with game base resource lists
            resourceFiles.shaders =
                baseResources.shaders.concat(resourceFiles.shaders);
            resourceFiles.textures =
                baseResources.textures.concat(resourceFiles.textures);
            resourceFiles.meshes =
                baseResources.meshes.concat(resourceFiles.meshes);
            const shaderPrograms = {
                ...levelData['shader_programs'],
                ...baseResources.programs
            }

            const scene = levelData['scene'];
            const objects = levelData['objects'];
            return loadResources(
                resourceFiles['shaders'],
                resourceFiles['textures'],
                resourceFiles['meshes']
            ).then(resources => {
                return this.setup(resources, shaderPrograms, scene, objects);
            });
        });
    }

    /**
     * Set up game and stage
     * @param {Object} resources The resource container object
     * @param {Object} shaderDefs Object containing shader program definitions
     * @param {Object} sceneDefs Object containing settings for the scene
     * @param {Array<Object>} objectDefs List of game object definitions
     */
    setup(resources, shaderDefs, sceneDefs, objectDefs) {
        const canvas = document.getElementById('gl-canvas');
        // Initialize WebGL context and set globally
        window.GL = this.initWebGL(canvas);

        // Create programs from shaders
        this.programs = {};
        for (const program in shaderDefs) {
            this.programs[program] = initShaders(
                resources['shaders'][shaderDefs[program]['vertex']],
                resources['shaders'][shaderDefs[program]['fragment']]
            );
        }

        // Create performance logger
        this.perfLogger = new PerformanceLogger(
            document.getElementById('performance-output'));

        // Create physics world
        this.world = new CANNON.World({
            gravity: new CANNON.Vec3(0, -21, 0)
        });

        // Create player
        this.player = null;

        // Array of game objects
        this.gameObjects = [];

        // Remember shaders that implement lighting
        this.lightPrograms = [];
        for (const programName in this.programs) {
            if (shaderDefs[programName].type == 'lit') {
                this.lightPrograms.push(this.programs[programName]);
            }
        }

        // Set up scene settings
        for (const setting in sceneDefs) {
            if (setting == 'player') {
                let startPos = sceneDefs['player']['start_position'];
                let yaw = sceneDefs['player']['yaw'];
                let pitch = sceneDefs['player']['pitch'];

                // Retrieve stored respawn position if exists
                if (localStorage.respawn !== undefined) {
                    const respawnPosition = JSON.parse(localStorage.respawn);
                    startPos = respawnPosition[0];
                    yaw = respawnPosition[1];
                    pitch = respawnPosition[2];
                }

                this.player = new FirstPersonPlayer(this.world, startPos,
                    this.programs, resources.meshes['icoSphere'],
                    canvas.width / canvas.height, yaw, pitch);
                this.gameObjects.push(this.player.jointSphere);
            } else if (setting == 'ambient_light') {
                const Ia = sceneDefs['ambient_light'];
                for (const programIndex in this.lightPrograms) {
                    const program = this.lightPrograms[programIndex];
                    GL.useProgram(program);

                    const IaLocV = GL.getUniformLocation(program, 'Ia');
                    GL.uniform3fv(IaLocV, Ia);
                }
            } else if (setting == 'directed_light') {
                // Create shadow casting light source
                const globalLightDirection =
                    sceneDefs['directed_light']['direction'];
                this.dirLightSource = new DirectedLightSource(
                    globalLightDirection,
                    this.lightPrograms, {
                    Id: sceneDefs['directed_light']['Id'],
                    Is: sceneDefs['directed_light']['Is']
                });
            }
        }

        // Create all game objects to update and render
        objectDefs.forEach(objectDef => {
            const objType = objectDef.type;
            if (objType == 'lightSource') {
                // Create light source
                if (objectDef.directed) {
                    const lightSource = new DirectedLightSource(
                        objectDef.direction, this.lightPrograms, {
                        Id: objectDef.Id,
                        Is: objectDef.Is
                    });
                } else {
                    const lightSource = new LightSource(
                        objectDef.position, this.lightPrograms, {
                        Id: objectDef.Id,
                        Is: objectDef.Is,
                        c: objectDef.c
                    });
                }
            } else {
                // Get object options
                const options = {};
                for (const option in objectDef) {
                    if (option != 'type' && option != 'shader_program'
                        && option != 'meshes' && option != 'graphical_mesh'
                        && options != 'sphereMesh') {
                        options[option] = objectDef[option];
                    }
                }
                const program = objectDef.shader_program;
                // Create object based on type
                switch (objType) {
                    case 'box':
                        this.gameObjects.push(
                            new BoxObject(this.world, this.programs[program],
                                shaderDefs[program].type, options));
                        break;
                    case 'cube':
                        this.gameObjects.push(
                            new CubeObject(this.world, this.programs[program],
                                shaderDefs[program].type, options));
                        break;
                    case 'mesh':
                        options['graphicalMesh'] =
                            resources.meshes[objectDef.graphical_mesh];
                        const meshes = [];
                        objectDef.meshes.forEach(mesh => {
                            meshes.push(resources.meshes[mesh]);
                        });
                        this.gameObjects.push(
                            new MeshObject(this.world, this.programs[program],
                                shaderDefs[program].type, meshes, options));
                        break;
                    case 'sphere':
                        this.gameObjects.push(
                            new SphereObject(this.world, this.programs[program],
                                shaderDefs[program].type,
                                resources.meshes[objectDef.mesh], options)
                        );
                        break;
                    case 'pedestal':
                        this.gameObjects.push(new Pedestal(this.world,
                            this.programs[program], shaderDefs[program].type,
                            resources, null, options));
                        break;
                    case 'lit_platform':
                        this.gameObjects.push(new LitPlatform(this.world,
                            this.programs, this.lightPrograms,
                            options));
                        break;
                    case 'cloud':
                        this.gameObjects.push(new Cloud(this.world,
                            this.programs, options.startPosition,
                            options.endPosition, options.speed,
                            resources.meshes, options));
                }
            }
        });

        // Initialize everything shadow related
        this.canvas = document.getElementById('gl-canvas');

        // Shadow map shader program
        this.shadowMapShader = this.programs['shadowMap'];
        this.shadowedShader = this.programs['fragmentLighting'];
        this.shadowMapLightSpaceMatLoc = GL.getUniformLocation(
            this.shadowMapShader, 'lightSpaceMatrix');
        this.shadowMapModMatLoc = GL.getUniformLocation(this.shadowMapShader,
            'modelMatrix');
        this.shadowMapLoc = GL.getUniformLocation(this.shadowedShader,
            'shadowMap');
        this.shadowedLightSpaceMatLoc =
            GL.getUniformLocation(this.shadowedShader, 'lightSpaceMatrix');

        // Shadow map properties
        this.shadowWidth = 2048;
        this.shadowHeight = 2048;

        GL.useProgram(this.shadowMapShader);
        this.setLightSourceViewAndPerspective();

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
        // TASK4.1: Set this.depthMap texture as depth attachment on the
        // framebuffer


        // Create depth map in color attachment to read from on CPU
        this.depthMapColor = GL.createTexture();
        GL.bindTexture(GL.TEXTURE_2D, this.depthMapColor);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MIN_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_MAG_FILTER, GL.NEAREST);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_S, GL.CLAMP_TO_EDGE);
        GL.texParameteri(GL.TEXTURE_2D, GL.TEXTURE_WRAP_T, GL.CLAMP_TO_EDGE);
        GL.texImage2D(GL.TEXTURE_2D, 0, GL.R8, this.shadowWidth,
            this.shadowHeight, 0, GL.RED, GL.UNSIGNED_BYTE, null);
        GL.framebufferTexture2D(GL.FRAMEBUFFER, GL.COLOR_ATTACHMENT0,
            GL.TEXTURE_2D, this.depthMapColor, 0);
        GL.bindTexture(GL.TEXTURE_2D, null);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        // GL.checkFramebufferStatus(GL.FRAMEBUFFER, this.shadowFramebuffer);

        // Pass number of lights to the relevant shaders
        this.updateLightSourceAmount();

        // Input callbacks
        const handleKeyUp = (event) => {
            event.preventDefault();
            this.player.keyUp(event);
        };
        const handleKeyDown = (event) => {
            event.preventDefault();
            if (event.key.toLowerCase() == 'r') {
                location.reload();
            } else {
                this.player.keyDown(event);
            }
        };
        const handlePointerDown = (event) => {
            this.player.pointerDown(event);
        };
        const handlePointerUp = (event) => {
            this.player.pointerUp(event);
        };
        const handlePointerMove = (event) => {
            this.player.pointerMove(event);
        };
        const handleWheel = (event) => {
            event.preventDefault();
            this.player.wheel(event);
        };
        const lockChangeAlert = () => {
            // Unpause, hook input callbacks when pointer is locked
            if (document.pointerLockElement === canvas) {
                document.addEventListener('mousemove', handlePointerMove);
                document.addEventListener('keyup', handleKeyUp);
                document.addEventListener('keydown', handleKeyDown);
                document.addEventListener('pointerdown', handlePointerDown);
                document.addEventListener('pointerup', handlePointerUp);
                document.addEventListener('wheel', handleWheel, {
                    capture: true,
                    passive: false
                });
                canvas.classList.add('playing');
                this.isPaused = false;
            } else {
                // Pause, unhook input callbacks when pointer is locked
                document.removeEventListener('mousemove', handlePointerMove);
                document.removeEventListener('keyup', handleKeyUp);
                document.removeEventListener('keydown', handleKeyDown);
                document.removeEventListener('pointerdown', handlePointerDown);
                document.removeEventListener('pointerup', handlePointerUp);
                document.removeEventListener('wheel', handleWheel,
                    { capture: true });
                canvas.classList.remove('playing');
                this.isPaused = true;
            }
        };
        // Hook pointer lock callback
        document.addEventListener('pointerlockchange', lockChangeAlert);
        canvas.addEventListener('click', () => {
            if (document.pointerLockElement !== canvas) {
                canvas.requestPointerLock();
            }
        });

        // Update resolution and perspective matrix on window resize
        window.addEventListener('resize', () => {
            this.setViewPort(canvas);
            this.player.setPerspectiveMatrix(canvas.width / canvas.height);
            this.render();
        });
    }

    updateLightSourceAmount() {
        for (const programIndex in this.programs) {
            const program = this.programs[programIndex];
            const lightCountLoc = GL.getUniformLocation(program, 'lightsCount');
            GL.useProgram(program);
            GL.uniform1i(lightCountLoc, LightSource.lightsCount);
        }
    }

    /**
     * The main game loop that updates the player, physics and renders graphics
     * @param {number} [lastUpdateTime=0] The last time the game loop was called
     */
    gameLoop(lastUpdateTime = 0) {
        const time = performance.now() / 1000;
        const deltaTime = time - lastUpdateTime;

        // Update and render
        if (!this.isPaused || lastUpdateTime == 0) {
            this.perfLogger.update(deltaTime);
            this.update(deltaTime);
            this.render();
        }

        // Call next iteration of game loop
        lastUpdateTime = time;

        requestAnimationFrame(() => {
            this.gameLoop(lastUpdateTime);
        });
    }

    /**
     * Update the player and physics
     * @param {number} deltaTime Elapsed time since last update
     */
    update(deltaTime) {
        // Update physics
        this.world.step(1 / 90, deltaTime);
        // Update objects
        this.gameObjects.forEach(object => {
            object.update();
        });
        // Update player and camera
        this.player.update(deltaTime);
    }

    /**
     * Renders all game object graphics
     */
    render() {
        // Set up depth/shadow map settings
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
        // Revert settings to normal
        GL.cullFace(GL.BACK);
        GL.bindFramebuffer(GL.FRAMEBUFFER, null);
        // Reset viewport to default
        this.setViewPort(this.canvas);

        // Bind texture and set as uniform for shadow map
        GL.useProgram(this.shadowedShader);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, this.depthMap);
        GL.uniform1i(this.shadowMapLoc, 0);
        GL.uniformMatrix4fv(this.shadowedLightSpaceMatLoc, false,
            this.lightSpaceMatrix);

        // Clear the frame buffer
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        // Render each object as usual
        const deferred = [];
        this.gameObjects.forEach(object => {
            // Simple workaround for transparency
            if (object.color.length > 3 && object.color[3] != 1) {
                deferred.push(object);
            } else {
                object.render();
            }
        });
        // Render transparent objects afterwards
        deferred.forEach(object => {
            object.render();
        });
    }

    /**
     * Initialize WebGL
     * @param {HTMLCanvasElement} canvas The canvas to initialize WebGL in
     * @returns {WebGL2RenderingContext} WebGL context
     */
    initWebGL(canvas) {
        // WebGL context from canvas
        const gl = canvas.getContext('webgl2');

        // Configure viewport
        this.setViewPort(canvas, gl);
        // Set clear color (background) to a bright blue
        gl.clearColor(0.53, 0.78, 0.92, 1.0);
        // Enable depth test
        gl.enable(gl.DEPTH_TEST);
        // Enable back face culling
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
        // Enable blending/transparency
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        return gl;
    }

    /**
     * Sets the WebGL viewport to the correct canvas size
     * @param {HTMLCanvasElement} canvas The canvas used as viewport
     * @param {WebGL2RenderingContext} [gl=window.GL] WebGL context 
     */
    setViewPort(canvas, gl = window.GL) {
        const documentAspectRatio = window.innerHeight / window.innerWidth;
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientWidth * documentAspectRatio;
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    setLightSourceViewAndPerspective() {
        // Set orthographic projection matrix
        const projectionMatrix = GLMAT.mat4.create();
        GLMAT.mat4.ortho(projectionMatrix, -40, 40, -25, 25, 1, 200);

        // Set view matrix
        const viewMatrix = GLMAT.mat4.create();
        // Look at player from player position minus light direction
        const lightPos = [
            this.player.position[0] - this.dirLightSource.position[0],
            this.player.position[1] - this.dirLightSource.position[1],
            this.player.position[2] - this.dirLightSource.position[2]
        ];
        GLMAT.mat4.lookAt(viewMatrix, lightPos, this.player.position,
            [0, 1, 0]);
        // Pass multiplied to shadow map shader
        this.lightSpaceMatrix = GLMAT.mat4.create();
        GLMAT.mat4.mul(this.lightSpaceMatrix, projectionMatrix, viewMatrix);
        GL.useProgram(this.shadowMapShader);
        GL.uniformMatrix4fv(this.shadowMapLightSpaceMatLoc,
            false, this.lightSpaceMatrix);
    }

    removeGameObject(object) {
        this.world.removeBody(object.physicsBody);
        const index = this.gameObjects.indexOf(object);
        this.gameObjects.splice(index, 1);
    }
}