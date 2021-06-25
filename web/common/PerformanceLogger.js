/** @module PerformanceLogger */

// TODO: documentation
export default class PerformanceLogger {
    constructor(htmlElement, timer = 1) {
        this.htmlElement = htmlElement;

        this.timer = timer;
        this.lastUpdate = 0;
        this.accTime = 0;
        this.numUpdates = 0;
    }

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