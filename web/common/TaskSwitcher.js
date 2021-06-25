/** @module TaskSwitcher */

/**
 * TODO: docs
 */
export default class TaskSwitcher {
    constructor(numberOfTasks) {
        this.taskCount = numberOfTasks;
        this.taskIndex = 0;
        this.maxUnlockedTask = 0;
        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        this.tasks = [];
    
        for (let i = 0; i < this.taskCount; i++) {
            this.tasks.push(document.getElementById(`task${i}`));
            this.tasks[i].style.display = 'none';
        }
        this.tasks[this.taskIndex].style.display = 'block';
    
        prevButton.addEventListener('click', () => {
            this.switchTask(this.taskIndex - 1);
        });
    
        nextButton.addEventListener('click', () => {
            this.switchTask(this.taskIndex + 1);
        });

        this.switchTask();
    }

    unlockTasks(index) {
        if (index >= this.numberOfTasks) {
            this.maxUnlockedTask = this.numberOfTasks - 1;
        } else {
            this.maxUnlockedTask = Math.max(index, this.maxUnlockedTask);
        }
    }
    
    switchTask(index = this.taskIndex) {
        this.tasks[this.taskIndex].style.display = 'none';
        this.taskIndex = index;
        this.taskIndex =
            Math.max(0, Math.min(this.taskIndex, this.maxUnlockedTask));
        this.tasks[this.taskIndex].style.display = 'block';
    }
}