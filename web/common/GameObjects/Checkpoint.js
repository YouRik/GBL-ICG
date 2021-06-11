/** @module Checkpoint */

import SphereObject from './SphereObject.js';

/**
 * TODO: docs
 */
export default class Checkpoint extends SphereObject {
    constructor(world, shader, mesh, indicatorPosition, resetPosition, player,
        stageName) {
        super(world, shader, 'colored', mesh, {
            position: indicatorPosition,
            radius: 1,
            color: [0, 1, 0, 0.3],
            mass: 0
        });
        this.physicsBody.isTrigger = true;

        this.playerBody = player.physicsBody;
        this.resetPosition = resetPosition;
        this.stageName = stageName;

        this.physicsBody.addEventListener('collide', (event) => {
            if (event.body == this.playerBody) {
                this.handleActivation();
            }
        });
    }

    handleActivation() {
        localStorage.setItem('respawnPosition',
            JSON.stringify(this.resetPosition));
    }
}