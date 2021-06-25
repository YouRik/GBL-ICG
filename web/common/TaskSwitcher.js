/** @module TaskSwitcher */

/**
 * Handles switching between displayed tasks through buttons or triggers in game
 */
export default class TaskSwitcher {
    /**
     * @param {number} numberOfTasks The total number of tasks available in the
     *  current stage
     */
    constructor(numberOfTasks) {
        this.taskCount = numberOfTasks;
        this.taskIndex = 0;
        this.maxUnlockedTask = 0;

        const prevButton = document.getElementById('prevButton');
        const nextButton = document.getElementById('nextButton');
        this.tasks = [];
    
        // Store all tasks from the current stage and hide them
        for (let i = 0; i < this.taskCount; i++) {
            this.tasks.push(document.getElementById(`task${i}`));
            this.tasks[i].style.display = 'none';
        }
    
        // Callbacks for button clicks
        prevButton.addEventListener('click', () => {
            this.switchTask(this.taskIndex - 1);
        });
        nextButton.addEventListener('click', () => {
            this.switchTask(this.taskIndex + 1);
        });

        // Show the current task
        this.switchTask();
    }

    /**
     * Makes new tasks available for switching
     * @param {number} index The index of the task to unlock
     */
    unlockTasks(index) {
        if (index >= this.numberOfTasks) {
            this.maxUnlockedTask = this.numberOfTasks - 1;
        } else {
            this.maxUnlockedTask = Math.max(index, this.maxUnlockedTask);
        }
    }
    
    /**
     * Switch to an unlocked task. If the index is too large, the largest
     * unlocked task will be switched to
     * @param {number} [index=this.taskIndex] The index of the task to switch to
     */
    switchTask(index = this.taskIndex) {
        // Hide the current task
        this.tasks[this.taskIndex].style.display = 'none';
        // Set new task
        this.taskIndex = index;
        this.taskIndex =
            Math.max(0, Math.min(this.taskIndex, this.maxUnlockedTask));
        // Show new current task
        this.tasks[this.taskIndex].style.display = 'block';
    }
}