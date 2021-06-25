/** @module Main */

import HubStage from './stages/HubStage.js';
import TransformationsStage from './stages/TransformationsStage.js';
import SplinesStage from './stages/SplinesStage.js';
import LightingStage from './stages/LightingStage.js';
import ShadowsStage from './stages/ShadowsStage.js';
import TestStage from './stages/TestStage.js';

// Global WebGL rendering context
window.GL = null;

if (window.stageName == undefined) {
    window.stageName = 'test';
}

switch (stageName) {
case 'test':
    new TestStage();
    break;
case 'hub':
    new HubStage();
    break;
case 'transformations':
    new TransformationsStage();
    break;
case 'splines':
    new SplinesStage();
    break;
case 'lighting':
    LightingStage();
    break;
case 'shadows':
    new ShadowsStage();
    break;
}

// TODO: replace colored, lit, textured with bit flag

// TODO: DOCUMENTATION
// TODO: Write and execute tests