/** @module Main */

import HubStage from './stages/HubStage.js';
import Lighting1Stage from './stages/Lighting1Stage.js';
import Lighting2Stage from './stages/Lighting2Stage.js';
import Lighting4Stage from './stages/Lighting4Stage.js';
import TestStage from './stages/TestStage.js';
import TransformationsStage from './stages/TransformationsStage.js';

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
    case 'lighting1':
        stage = new Lighting1Stage();
        break;
    case 'lighting2':
        stage = new Lighting2Stage();
        break;
    case 'lighting4':
        stage = new Lighting4Stage();
        break;
    case 'hub':
        stage = new HubStage();
        break;
    case 'transformations':
        stage = new TransformationsStage();
        break;
}

// TODO: replace colored, lit, textured with bit flag
// TODO: investigate and smoothen physics-graphics-frame-inconsistencies

// TODO: Check coding style (ESLint)
// TODO: DOCUMENTATION
// TODO: Reduce imports to only necessary ones
// TODO: Write and execute tests