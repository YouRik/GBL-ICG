/** @module Main */

import HubStage from './stages/HubStage.js';
import TransformationsStage from './stages/TransformationsStage.js';
import SplinesStage from './stages/SplinesStage.js';
import LightingStage from './stages/LightingStage.js';
import ShadowsStage from './stages/ShadowsStage.js';
import TestStage from './stages/TestStage.js';

// Global WebGL rendering context
window.GL = null;

// Default stage
if (window.stageName == undefined) {
    window.stageName = 'test';
}

let stage = null;

// Load and start requested stage
switch (stageName) {
    case 'test':
        stage = new TestStage();
        break;
    case 'hub':
        stage = new HubStage();
        break;
    case 'transformations':
        stage = new TransformationsStage();
        break;
    case 'splines':
        stage = new SplinesStage();
        break;
    case 'lighting':
        stage = new LightingStage();
        break;
    case 'shadows':
        stage = new ShadowsStage();
        break;
}

// Load resources and stage information, then start the game loop
stage.load().then(() => stage.gameLoop());

// TODO: replace colored, lit, textured with bit flag

// TODO: DOCUMENTATION
// TODO: Write and execute tests