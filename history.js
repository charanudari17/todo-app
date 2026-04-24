// ============================================
// HISTORY.JS - Undo/Redo System
// ============================================

class History {
    constructor() {
        this.past = [];
        this.future = [];
        this.maxSize = 50; // Max undo/redo steps
    }

    // Save current state to history
    addState(state) {
        this.past.push(JSON.parse(JSON.stringify(state)));
        this.future = []; // Clear future when new action is performed

        // Limit history size
        if (this.past.length > this.maxSize) {
            this.past.shift();
        }
    }

    // Undo - go back to previous state
    undo() {
        if (this.past.length === 0) return null;

        const currentState = taskStorage.getAllTasks();
        this.future.push(JSON.parse(JSON.stringify(currentState)));

        const previousState = this.past.pop();
        taskStorage.saveTasks(previousState);
        return previousState;
    }

    // Redo - go forward to next state
    redo() {
        if (this.future.length === 0) return null;

        const currentState = taskStorage.getAllTasks();
        this.past.push(JSON.parse(JSON.stringify(currentState)));

        const nextState = this.future.pop();
        taskStorage.saveTasks(nextState);
        return nextState;
    }

    // Check if undo is available
    canUndo() {
        return this.past.length > 0;
    }

    // Check if redo is available
    canRedo() {
        return this.future.length > 0;
    }

    // Clear history
    clear() {
        this.past = [];
        this.future = [];
    }
}

// Create global history instance
const history = new History();
