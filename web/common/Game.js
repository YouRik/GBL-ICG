/** @module Game */

import { loadStage, loadResources } from './LoadResources.js';
import initShaders from './InitShaders.js';
import BoxObject from './BoxObject.js';
import CubeObject from './CubeObject.js';
import FirstPersonPlayer from './FirstPersonPlayer.js';
import PerformanceLogger from './PerformanceLogger.js';
import * as CANNON from './lib/cannon/cannon-es.js';
import LightSource from './LightSource.js';
import MeshObject from './MeshObject.js';
import SphereObject from './SphereObject.js';

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
        return loadStage(`stages/${this.stageName}.json`).then(levelData => {
            const resourceFiles = levelData['resources'];
            const shaderPrograms = levelData['shader_programs'];
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
        const lightPrograms = [];
        for (const programName in this.programs) {
            if (shaderDefs[programName].type == 'lit') {
                lightPrograms.push(this.programs[programName]);
            }
        }

        // Set up scene settings
        for (const setting in sceneDefs) {
            if (setting == 'player') {
                const startPos = sceneDefs['player']['start_position'];
                const yaw = sceneDefs['player']['yaw'];
                const pitch = sceneDefs['player']['pitch'];
                this.player = new FirstPersonPlayer(this.world, startPos,
                    this.programs, canvas.width / canvas.height, yaw, pitch);
            } else if (setting == 'ambient_light') {
                const Ia = sceneDefs['ambient_light'];
                for (const programIndex in lightPrograms) {
                    const program = lightPrograms[programIndex];
                    GL.useProgram(program);

                    const IaLocV = GL.getUniformLocation(program, 'Ia');
                    GL.uniform3fv(IaLocV, Ia);
                }
            }
        }

        // Create all game objects to update and render
        objectDefs.forEach(objectDef => {
            const objType = objectDef.type;
            if (objType == 'lightSource') {
                // Create light source
                const lightSource = new LightSource(
                    objectDef.position, lightPrograms, {
                    Id: objectDef.Id,
                    Is: objectDef.Is,
                    c: objectDef.c
                });
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
                }
            }
        });

        // Pass number of lights to the relevant shaders
        for (const programIndex in this.programs) {
            const program = this.programs[programIndex];
            const lightCountLoc = GL.getUniformLocation(program, 'lightsCount');
            GL.uniform1i(lightCountLoc, LightSource.lightsCount);
        }

        // Input callbacks
        const handleKeyUp = (event) => {
            event.preventDefault();
            this.player.keyUp(event);
        };
        const handleKeyDown = (event) => {
            event.preventDefault();
            this.player.keyDown(event);
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
        this.world.step(1 / 60, deltaTime);
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
        // Clear the frame buffer
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
        // Render each object
        this.gameObjects.forEach(object => {
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
        // Set clear color (background) to UHH blue
        gl.clearColor(0.01, 0.44, 0.73, 1.0);
        // Enable depth test
        gl.enable(gl.DEPTH_TEST);
        // Enable back face culling
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);
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
}