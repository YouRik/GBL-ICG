/** @module Checkpoint */

import SphereObject from './SphereObject.js';

/**
 * Checkpoint object that saves player position to have him reset there
 */
export default class Checkpoint extends SphereObject {
    /**
     * @param {CANNON.World} world The physics world to add the checkpoint to
     * @param {WebGLProgram} shader The shader program to use for rendering
     * @param {Object} mesh The sphere mesh to be used
     * @param {Array<number>} indicatorPosition The position at which to place the checkpoint
     * @param {Array<number>} resetPosition The position to which to reset the player
     * @param {number} resetYaw The yaw the player should have on reset
     * @param {number} resetPitch The pitch the player should have on reset
     * @param {FirstPersonPlayer} player The player object to know for collision
     * @param {function} callback Function to be called when the player enters
     * @param {number} size Size of the checkpoint
     */
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

        // Handle collision with player
        this.physicsBody.addEventListener('collide', (event) => {
            if (event.body == this.playerBody) {
                this.handleActivation();
            }
        });
    }

    /**
     * Handle collision with player. The reset/respawn position, yaw and pitch
     * are saved and a specified callback gets called
     */
    handleActivation() {
        localStorage.setItem('respawn',
            JSON.stringify(
                [this.resetPosition, this.resetYaw, this.resetPitch]));
        if (typeof(this.callback) == 'function') {
            this.callback();
        }
    }
}