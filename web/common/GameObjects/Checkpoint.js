/** @module Checkpoint */

import SphereObject from './SphereObject.js';

/**
 * TODO: docs
 */
export default class Checkpoint extends SphereObject {
    constructor(world, shader, mesh, indicatorPosition, resetPosition, resetYaw,
        resetPitch, player, callback, size = 1) {
        super(world, shader, 'colored', mesh, {
            position: indicatorPosition,
            radius: size,
            color: [0, 1, 0, 0.3],
            mass: 0,
            castsShadow: false
        });
        this.physicsBody.isTrigger = true;

        this.playerBody = player.physicsBody;
        this.resetPosition = resetPosition;
        this.resetYaw = resetYaw;
        this.resetPitch = resetPitch;
        this.callback = callback;

        this.physicsBody.addEventListener('collide', (event) => {
            if (event.body == this.playerBody) {
                this.handleActivation();
            }
        });
    }

    handleActivation() {
        localStorage.setItem('respawn',
            JSON.stringify(
                [this.resetPosition, this.resetYaw, this.resetPitch]));
        if (typeof(this.callback) == 'function') {
            this.callback();
        }
    }
}