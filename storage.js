// ============================================
// STORAGE.JS - Local Storage Management
// ============================================

class TaskStorage {
    constructor() {
        this.storageKey = 'todoAppTasks';
        this.categoriesKey = 'todoAppCategories';
        this.themeKey = 'todoAppTheme';
    }

    // Get all tasks from localStorage
    getAllTasks() {
        const tasks = localStorage.getItem(this.storageKey);
        return tasks ? JSON.parse(tasks) : [];
    }

    // Save all tasks to localStorage
    saveTasks(tasks) {
        localStorage.setItem(this.storageKey, JSON.stringify(tasks));
    }

    // Add a new task
    addTask(task) {
        const tasks = this.getAllTasks();
        task.id = Date.now(); // Use timestamp as unique ID
        task.createdAt = new Date().toISOString();
        tasks.push(task);
        this.saveTasks(tasks);
        return task;
    }

    // Update a task
    updateTask(taskId, updatedData) {
        const tasks = this.getAllTasks();
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = { ...tasks[index], ...updatedData };
            this.saveTasks(tasks);
            return tasks[index];
        }
        return null;
    }

    // Delete a task
    deleteTask(taskId) {
        const tasks = this.getAllTasks();
        const filtered = tasks.filter(t => t.id !== taskId);
        this.saveTasks(filtered);
    }

    // Get tasks by category
    getTasksByCategory(category) {
        const tasks = this.getAllTasks();
        if (category === 'all') return tasks;
        return tasks.filter(t => t.category === category);
    }

    // Get custom categories
    getCategories() {
        const categories = localStorage.getItem(this.categoriesKey);
        return categories ? JSON.parse(categories) : [];
    }

    // Save custom categories
    saveCategories(categories) {
        localStorage.setItem(this.categoriesKey, JSON.stringify(categories));
    }

    // Add custom category
    addCategory(category) {
        const categories = this.getCategories();
        if (!categories.find(c => c.name.toLowerCase() === category.name.toLowerCase())) {
            categories.push(category);
            this.saveCategories(categories);
            return true;
        }
        return false;
    }

    // Get theme preference
    getTheme() {
        return localStorage.getItem(this.themeKey) || 'light';
    }

    // Save theme preference
    saveTheme(theme) {
        localStorage.setItem(this.themeKey, theme);
    }

    // Clear all data (for testing)
    clearAll() {
        localStorage.removeItem(this.storageKey);
        localStorage.removeItem(this.categoriesKey);
    }
}

// Create global storage instance
const taskStorage = new TaskStorage();
