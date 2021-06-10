/** @module Main */

import HubStage from './stages/HubStage.js';
import TransformationsStage from './stages/TransformationsStage.js';
import SplinesStage from './stages/SplinesStage.js';
import LightingStage from './stages/LightingStage.js';
import TestStage from './stages/TestStage.js';

// Global WebGL rendering context
window.GL = null;

if (window.stageName == undefined) {
    window.stageName = 'test';
}

let stage = null;

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
}

// TODO: replace colored, lit, textured with bit flag

// TODO: Check coding style (ESLint)
// TODO: DOCUMENTATION
// TODO: Reduce imports to only necessary ones
// TODO: Write and execute tests