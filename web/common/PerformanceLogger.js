/** @module PerformanceLogger */

/**
 * Log the game's FPS and frametime in an HTML element
 */
export default class PerformanceLogger {
    /**
     * @param {HTMLElement} htmlElement
     *  The element to display the performance information
     * @param {number} [timer=1] The increment in seconds at which to update the
     *  performance output in seconds
     */
    constructor(htmlElement, timer = 1) {
        this.htmlElement = htmlElement;

        this.timer = timer;
        this.lastUpdate = 0;
        this.accTime = 0;
        this.numUpdates = 0;
    }

    /**
     * Update the current FPS and frametime values and display them
     * @param {number} deltaTime The elapsed time since the last update in
     *  seconds
     */
    update(deltaTime) {
        this.accTime += deltaTime;
        this.numUpdates++;
        if (this.accTime > this.timer) {
            const avgFrametime = (this.accTime / this.numUpdates).toFixed(5);
            const avgFPS = (1 / avgFrametime).toFixed(3);
            this.htmlElement.innerHTML = avgFrametime + ' / ' + avgFPS;
            this.accTime = 0;
            this.numUpdates = 0;
        }
    }
}