/** @module Main */

import { loadStage, loadResources } from './common/LoadResources.js';
import initShaders from './common/InitShaders.js';
import GameObject from './common/GameObject.js';
import BoxObject from './common/BoxObject.js';
import CubeObject from './common/CubeObject.js';
import FirstPersonPlayer from './common/FirstPersonPlayer.js';
import PerformanceLogger from './common/PerformanceLogger.js';
import * as CANNON from './common/lib/cannon/cannon-es.js';
import * as GLMAT from './common/lib/gl-matrix/index.js';
import LightSource from './common/LightSource.js';
import MeshObject from './common/MeshObject.js';
import SphereObject from './common/SphereObject.js';

// Global WebGL rendering context
window.GL = null;
// Global pause flag
let isPaused = true;

if (window.stageFile == undefined) {
    window.stageFile = 'test';
}

// Load stage data
loadStage(`stages/${stageFile}.json`).then(levelData => {
    const resourceFiles = levelData['resources'];
    const shaderPrograms = levelData['shader_programs'];
    const objects = levelData['objects'];
    loadResources(
        resourceFiles['shaders'],
        resourceFiles['textures'],
        resourceFiles['meshes']
    ).then(resources => {
        main(resources, shaderPrograms, objects);
    });
});

/**
 * Entry point of the game
 * @param {Object} resources The resource container object
 * @param {Object} shaderDefs Object containing shader program definitions
 * @param {Array<Object>} objectDefs List of game object definitions
 */
function main(resources, shaderDefs, objectDefs) {
    const canvas = document.getElementById('gl-canvas');
    // Initialize WebGL context and set globally
    window.GL = initWebGL(canvas);

    // Create programs from shaders
    const programs = {};
    for (const program in shaderDefs) {
        programs[program] = initShaders(
            resources['shaders'][shaderDefs[program]['vertex']],
            resources['shaders'][shaderDefs[program]['fragment']]
        );
    }

    // Create performance logger
    const perfLogger = new PerformanceLogger(
        document.getElementById('performance-output'));

    // Create physics world
    const world = new CANNON.World({
        gravity: new CANNON.Vec3(0, -21, 0)
    });

    // Create player
    let player;

    // Array of game objects
    const gameObjects = [];

    // Remember shaders that implement lighting
    const lightPrograms = [];
    for (const programName in programs) {
        if (shaderDefs[programName].type == 'lit') {
            lightPrograms.push(programs[programName]);
        }
    }

    // Create all game objects to update and render
    objectDefs.forEach(objectDef => {
        const objType = objectDef.type;
        if (objType == 'player') {
            player = new FirstPersonPlayer(world, objectDef.position, programs,
                canvas.width / canvas.height, objectDef.yaw, objectDef.pitch);
        } else if (objType == 'lightSource') {
            // Create light source
            const lightSource = new LightSource(
                objectDef.position, lightPrograms, {
                Ia: objectDef.Ia,
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
                    gameObjects.push(
                        new BoxObject(world, programs[program],
                            shaderDefs[program].type, options));
                    break;
                case 'cube':
                    gameObjects.push(
                        new CubeObject(world, programs[program],
                            shaderDefs[program].type, options));
                    break;
                case 'mesh':
                    options['graphicalMesh'] =
                        resources.meshes[objectDef.graphical_mesh];
                    const meshes = [];
                    objectDef.meshes.forEach(mesh => {
                        meshes.push(resources.meshes[mesh]);
                    });
                    gameObjects.push(
                        new MeshObject(world, programs[program],
                            shaderDefs[program].type, meshes, options));
                    break;
                case 'sphere':
                    gameObjects.push(
                        new SphereObject(world, programs[program],
                            shaderDefs[program].type,
                            resources.meshes[objectDef.mesh], options)
                    );
            }
        }
    });

    // Pass number of lights to the relevant shaders
    for (const programIndex in programs) {
        const program = programs[programIndex];
        const lightCountLoc = GL.getUniformLocation(program, 'lightsCount');
        GL.uniform1i(lightCountLoc, LightSource.lightsCount);
    }

    // Input callbacks
    const handleKeyUp = (event) => {
        player.keyUp(event);
    };
    const handleKeyDown = (event) => {
        player.keyDown(event);
    };
    const handlePointerMove = (event) => {
        player.pointerMove(event);
    };
    const lockChangeAlert = () => {
        // Unpause, hook input callbacks when pointer is locked
        if (document.pointerLockElement === canvas) {
            document.addEventListener('mousemove', handlePointerMove);
            document.addEventListener('keyup', handleKeyUp);
            document.addEventListener('keydown', handleKeyDown);
            canvas.classList.add('playing');
            isPaused = false;
        } else {
            // Pause, unhook input callbacks when pointer is locked
            document.removeEventListener('mousemove', handlePointerMove);
            document.removeEventListener('keyup', handleKeyUp);
            document.removeEventListener('keydown', handleKeyDown);
            canvas.classList.remove('playing');
            isPaused = true;
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
        setViewPort(canvas);
        player.setPerspectiveMatrix(canvas.width / canvas.height);
        render(gameObjects);
    });

    // Update physics and render
    gameLoop(player, world, perfLogger, gameObjects);
}

/**
 * The main game loop that updates the player, physics and renders graphics
 * @param {FirstPersonPlayer} player The player
 * @param {CANNON.World} world The physics world
 * @param {PerformanceLogger} perfLogger The performance logger
 * @param {Array<GameObject>} gameObjects List of game objects placed in the
 *  world
 * @param {number} [lastUpdateTime=0] The last time the game loop was called
 */
function gameLoop(player, world, perfLogger, gameObjects, lastUpdateTime = 0) {
    const time = performance.now() / 1000;
    const deltaTime = time - lastUpdateTime;

    // Update and render
    if (!isPaused || lastUpdateTime == 0) {
        perfLogger.update(deltaTime);
        update(player, world, gameObjects, deltaTime);
        render(gameObjects);
    }

    // Call next iteration of game loop
    lastUpdateTime = time;

    requestAnimationFrame(() => {
        gameLoop(player, world, perfLogger, gameObjects, lastUpdateTime);
    });
}

/**
 * Update the player and physics
 * @param {FirstPersonPlayer} player The player
 * @param {CANNON.World} world The physics world
 * @param {Array<GameObject>} gameObjects Game objects placed in the world
 * @param {number} deltaTime Elapsed time since last update
 */
function update(player, world, gameObjects, deltaTime) {
    // Update physics
    world.step(1 / 60, deltaTime);
    // Update objects
    gameObjects.forEach(object => {
        object.update();
    });
    // Update player and camera
    player.update(deltaTime);
}

/**
 * Renders all game object graphics
 * @param {Array<GameObject>} gameObjects Game objects placed in the world
 */
function render(gameObjects) {
    // Clear the frame buffer
    GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    // Render each object
    gameObjects.forEach(object => {
        object.render();
    });
}

/**
 * Initialize WebGL
 * @param {HTMLCanvasElement} canvas The canvas to initialize WebGL in
 * @returns {WebGL2RenderingContext} WebGL context
 */
function initWebGL(canvas) {
    // WebGL context from canvas
    const gl = canvas.getContext('webgl2');

    // Configure viewport
    setViewPort(canvas, gl);
    // Set clear color (background) to UHH blue
    gl.clearColor(0.01, 0.44, 0.73, 1.0);
    gl.enable(gl.DEPTH_TEST);
    // TODO: Make sure all objects have the correct face winding.
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
function setViewPort(canvas, gl = window.GL) {
    const documentAspectRatio = window.innerHeight / window.innerWidth;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientWidth * documentAspectRatio;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

// TODO: Optional player (flash-)light
// TODO: Mesh loading
// TODO: Light source types (spotlight, directional light)
// TODO: replace colored, lit, textured with bit flag

// TODO: Check coding style (ESLint)
// TODO: DOCUMENTATION
// TODO: reduce imports to only necessary ones
// TODO: Write and execute tests