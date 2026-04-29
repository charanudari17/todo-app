// ============================================
// APP.JS - Main Application Logic
// Advanced Todo App with Full Features
// ============================================

class TodoApp {
    constructor() {
        this.tasks = [];
        this.filteredTasks = [];
        this.currentCategory = 'all';
        this.selectedTasks = new Set();
        this.editingTaskId = null;

        this.init();
    }

    // ============================================
    // INITIALIZATION
    // ============================================

    init() {
        this.loadTasks();
        this.setupEventListeners();
        this.applyTheme();
        this.renderCategories();
        this.render();
        console.log('✅ Todo App Initialized');
    }

    loadTasks() {
        this.tasks = taskStorage.getAllTasks();
        this.filteredTasks = [...this.tasks];
    }

    // ============================================
    // EVENT LISTENERS SETUP
    // ============================================

    setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', () => this.toggleTheme());

        // Undo/Redo
        document.getElementById('undoBtn').addEventListener('click', () => this.performUndo());
        document.getElementById('redoBtn').addEventListener('click', () => this.performRedo());

        // Add task button
        document.getElementById('addTaskBtn').addEventListener('click', () => this.openTaskModal());

        // Search functionality
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        document.getElementById('clearSearchBtn').addEventListener('click', () => {
            searchInput.value = '';
            document.getElementById('clearSearchBtn').style.display = 'none';
            this.render();
        });

        // Sort dropdown
        document.getElementById('sortSelect').addEventListener('change', (e) => this.handleSort(e.target.value));

        // Bulk actions
        document.getElementById('bulkActionsToggle').addEventListener('click', () => this.toggleBulkActions());
        document.getElementById('selectAllBtn').addEventListener('click', () => this.selectAll());
        document.getElementById('completeSelectedBtn').addEventListener('click', () => this.completeSelected());
        document.getElementById('deleteSelectedBtn').addEventListener('click', () => this.deleteSelected());
        document.getElementById('clearAllBtn').addEventListener('click', () => this.clearAll());

        // Category buttons
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.closest('.category-btn').dataset.category;
                this.filterByCategory(category);
            });
        });
        document.getElementById('addCategoryBtn').addEventListener('click', () => this.openCategoryModal());

        // Priority filters
        document.querySelectorAll('.priority-filter').forEach(filter => {
            filter.addEventListener('change', () => this.applyFilters());
        });
        document.getElementById('overdueFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('completedFilter').addEventListener('change', () => this.applyFilters());

        // Task form
        document.getElementById('taskForm').addEventListener('submit', (e) => this.handleSaveTask(e));
        document.getElementById('cancelTaskBtn').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('modalCloseBtn').addEventListener('click', () => this.closeTaskModal());
        document.getElementById('addSubtaskBtn').addEventListener('click', () => this.addSubtaskInput());

        // Category form
        document.getElementById('categoryForm').addEventListener('submit', (e) => this.handleSaveCategory(e));
        document.getElementById('cancelCategoryBtn').addEventListener('click', () => this.closeCategoryModal());
        document.getElementById('categoryModalCloseBtn').addEventListener('click', () => this.closeCategoryModal());

        // Details modal
        document.getElementById('closeDetailsBtn').addEventListener('click', () => this.closeDetailsModal());
        document.getElementById('detailsCloseBtn').addEventListener('click', () => this.closeDetailsModal());
        document.getElementById('editTaskDetailsBtn').addEventListener('click', () => this.editFromDetails());

        // Close modals on background click
        ['taskModal', 'categoryModal', 'detailsModal'].forEach(modalId => {
            const modal = document.getElementById(modalId);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    if (modalId === 'taskModal') this.closeTaskModal();
                    if (modalId === 'categoryModal') this.closeCategoryModal();
                    if (modalId === 'detailsModal') this.closeDetailsModal();
                }
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'z') {
                    e.preventDefault();
                    this.performUndo();
                }
                if (e.key === 'y') {
                    e.preventDefault();
                    this.performRedo();
                }
            }
        });
    }

    // ============================================
    // THEME MANAGEMENT
    // ============================================

    toggleTheme() {
        const body = document.body;
        const isDark = body.classList.toggle('dark-theme');
        taskStorage.saveTheme(isDark ? 'dark' : 'light');
        this.updateThemeButton();
    }

    applyTheme() {
        const theme = taskStorage.getTheme();
        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        this.updateThemeButton();
    }

    updateThemeButton() {
        const btn = document.getElementById('themeToggle');
        const isDark = document.body.classList.contains('dark-theme');
        btn.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // ============================================
    // UNDO/REDO
    // ============================================

    saveState() {
        history.addState(this.tasks);
    }

    performUndo() {
        const previousState = history.undo();
        if (previousState) {
            this.tasks = previousState;
            this.loadTasks();
            this.render();
        }
    }

    performRedo() {
        const nextState = history.redo();
        if (nextState) {
            this.tasks = nextState;
            this.loadTasks();
            this.render();
        }
    }

    // ============================================
    // TASK MANAGEMENT
    // ============================================

    openTaskModal(taskId = null) {
        const modal = document.getElementById('taskModal');
        const form = document.getElementById('taskForm');
        const title = document.getElementById('modalTitle');

        form.reset();
        document.getElementById('subtasksList').innerHTML = '';

        if (taskId) {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) {
                this.editingTaskId = taskId;
                title.textContent = 'Edit Task';
                document.getElementById('taskTitle').value = task.title;
                document.getElementById('taskDescription').value = task.description || '';
                document.getElementById('taskCategory').value = task.category;
                document.getElementById('taskPriority').value = task.priority;
                document.getElementById('taskDueDate').value = task.dueDate || '';
                document.getElementById('taskDueTime').value = task.dueTime || '';
                document.getElementById('taskReminder').checked = task.reminder || false;

                // Load subtasks
                if (task.subtasks && task.subtasks.length > 0) {
                    task.subtasks.forEach(subtask => {
                        this.addSubtaskInput(subtask);
                    });
                }
            }
        } else {
            this.editingTaskId = null;
            title.textContent = 'Add New Task';
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('taskDueDate').value = today;
        }

        modal.classList.add('show');
    }

    closeTaskModal() {
        document.getElementById('taskModal').classList.remove('show');
        this.editingTaskId = null;
    }

    handleSaveTask(e) {
        e.preventDefault();

        const taskData = {
            title: document.getElementById('taskTitle').value.trim(),
            description: document.getElementById('taskDescription').value.trim(),
            category: document.getElementById('taskCategory').value,
            priority: document.getElementById('taskPriority').value,
            dueDate: document.getElementById('taskDueDate').value,
            dueTime: document.getElementById('taskDueTime').value,
            reminder: document.getElementById('taskReminder').checked,
            subtasks: this.getSubtasksFromForm(),
            completed: false
        };

        if (!taskData.title) {
            alert('Please enter a task title!');
            return;
        }

        this.saveState();

        if (this.editingTaskId) {
            taskStorage.updateTask(this.editingTaskId, taskData);
            const task = this.tasks.find(t => t.id === this.editingTaskId);
            if (task) Object.assign(task, taskData);
        } else {
            const newTask = taskStorage.addTask(taskData);
            this.tasks.push(newTask);
        }

        this.closeTaskModal();
        this.loadTasks();
        this.render();
    }

    addSubtaskInput(subtask = null) {
        const list = document.getElementById('subtasksList');
        const div = document.createElement('div');
        div.className = 'subtask-input-group';
        div.innerHTML = `
            <input type="text" placeholder="Subtask description" value="${subtask ? subtask.title : ''}" class="subtask-input">
            <button type="button" class="remove-subtask-btn">
                <i class="fas fa-trash"></i>
            </button>
        `;

        div.querySelector('.remove-subtask-btn').addEventListener('click', () => div.remove());
        list.appendChild(div);
    }

    getSubtasksFromForm() {
        const subtasks = [];
        document.querySelectorAll('.subtask-input').forEach((input, idx) => {
            if (input.value.trim()) {
                subtasks.push({
                    id: Date.now() + idx,
                    title: input.value.trim(),
                    completed: false
                });
            }
        });
        return subtasks;
    }

    // ============================================
    // CATEGORY MANAGEMENT
    // ============================================

    openCategoryModal() {
        document.getElementById('categoryModal').classList.add('show');
    }

    closeCategoryModal() {
        document.getElementById('categoryModal').classList.remove('show');
        document.getElementById('categoryForm').reset();
    }

    handleSaveCategory(e) {
        e.preventDefault();
        const name = document.getElementById('categoryName').value.trim();
        const icon = document.getElementById('categoryIcon').value || '📁';

        if (!name) {
            alert('Please enter a category name!');
            return;
        }

        if (taskStorage.addCategory({ name, icon })) {
            this.closeCategoryModal();
            this.renderCategories();
        } else {
            alert('Category already exists!');
        }
    }

    renderCategories() {
        const categories = taskStorage.getCategories();
        const list = document.querySelector('.categories-list');
        const addBtn = list.querySelector('.add-category-btn');

        // Remove old custom categories
        list.querySelectorAll('[data-custom="true"]').forEach(btn => btn.remove());

        // Add new custom categories
        categories.forEach(cat => {
            const btn = document.createElement('button');
            btn.className = 'category-btn';
            btn.dataset.category = cat.name.toLowerCase();
            btn.dataset.custom = 'true';
            btn.innerHTML = `<i class="fas fa-folder"></i> ${cat.name}`;
            btn.addEventListener('click', () => this.filterByCategory(cat.name.toLowerCase()));
            list.insertBefore(btn, addBtn);
        });
    }

    filterByCategory(category) {
        this.currentCategory = category;
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });
        // Reload tasks from storage to ensure we have latest data
        this.loadTasks();
        this.applyFilters();
    }

    // ============================================
    // SEARCH & FILTER
    // ============================================

    handleSearch(query) {
        const clearBtn = document.getElementById('clearSearchBtn');
        clearBtn.style.display = query ? 'flex' : 'none';

        if (!query) {
            this.filteredTasks = [...this.tasks];
        } else {
            this.filteredTasks = this.tasks.filter(task =>
                task.title.toLowerCase().includes(query.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
            );
        }

        this.applyFilters();
    }

    applyFilters() {
        // Start with all tasks or search results
        const searchInput = document.getElementById('searchInput');
        const query = searchInput ? searchInput.value.trim() : '';
        
        let filtered;
        if (query) {
            // If searching, filter from search results
            filtered = this.tasks.filter(task =>
                task.title.toLowerCase().includes(query.toLowerCase()) ||
                (task.description && task.description.toLowerCase().includes(query.toLowerCase()))
            );
        } else {
            // No search, start with all tasks
            filtered = [...this.tasks];
        }

        // Category filter
        if (this.currentCategory !== 'all') {
            filtered = filtered.filter(t => t.category === this.currentCategory);
        }

        // Priority filters
        const selectedPriorities = Array.from(document.querySelectorAll('.priority-filter:checked')).map(f => f.dataset.priority);
        if (selectedPriorities.length > 0) {
            filtered = filtered.filter(t => selectedPriorities.includes(t.priority));
        }

        // Overdue filter
        if (document.getElementById('overdueFilter').checked) {
            filtered = filtered.filter(t => {
                if (!t.dueDate || t.completed) return false;
                return new Date(t.dueDate) < new Date();
            });
        }

        // Completed filter
        if (!document.getElementById('completedFilter').checked) {
            filtered = filtered.filter(t => !t.completed);
        }

        this.filteredTasks = filtered;
        this.render();
    }

    handleSort(sortBy) {
        switch (sortBy) {
            case 'date-asc':
                this.filteredTasks.sort((a, b) => new Date(a.dueDate || '9999-12-31') - new Date(b.dueDate || '9999-12-31'));
                break;
            case 'date-desc':
                this.filteredTasks.sort((a, b) => new Date(b.dueDate || '0000-01-01') - new Date(a.dueDate || '0000-01-01'));
                break;
            case 'priority':
                const priorityOrder = { high: 0, medium: 1, low: 2 };
                this.filteredTasks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
                break;
            case 'created':
                this.filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'alphabetical':
                this.filteredTasks.sort((a, b) => a.title.localeCompare(b.title));
                break;
        }
        this.render();
    }

    // ============================================
    // BULK ACTIONS
    // ============================================

    toggleBulkActions() {
        const actions = document.getElementById('bulkActions');
        actions.style.display = actions.style.display === 'none' ? 'grid' : 'none';
    }

    selectAll() {
        this.selectedTasks.clear();
        this.filteredTasks.forEach(task => this.selectedTasks.add(task.id));
        this.render();
    }

    completeSelected() {
        this.saveState();
        this.selectedTasks.forEach(taskId => {
            const task = this.tasks.find(t => t.id === taskId);
            if (task) task.completed = true;
        });
        taskStorage.saveTasks(this.tasks);
        this.selectedTasks.clear();
        this.loadTasks();
        this.render();
    }

    deleteSelected() {
        if (confirm(`Delete ${this.selectedTasks.size} task(s)?`)) {
            this.saveState();
            this.selectedTasks.forEach(taskId => {
                taskStorage.deleteTask(taskId);
            });
            this.tasks = taskStorage.getAllTasks();
            this.selectedTasks.clear();
            this.loadTasks();
            this.render();
        }
    }

    clearAll() {
        if (confirm('Clear ALL tasks? This cannot be undone!')) {
            this.saveState();
            localStorage.setItem('todoAppTasks', JSON.stringify([]));
            this.tasks = [];
            this.selectedTasks.clear();
            this.loadTasks();
            this.render();
        }
    }

    // ============================================
    // TASK ACTIONS
    // ============================================

    toggleTaskComplete(taskId) {
        this.saveState();
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            taskStorage.updateTask(taskId, { completed: task.completed });
            this.loadTasks();
            this.render();
        }
    }

    toggleTaskSelection(taskId) {
        if (this.selectedTasks.has(taskId)) {
            this.selectedTasks.delete(taskId);
        } else {
            this.selectedTasks.add(taskId);
        }
        this.render();
    }

    toggleSubtask(taskId, subtaskId) {
        this.saveState();
        const task = this.tasks.find(t => t.id === taskId);
        if (task && task.subtasks) {
            const subtask = task.subtasks.find(s => s.id === subtaskId);
            if (subtask) {
                subtask.completed = !subtask.completed;
                taskStorage.updateTask(taskId, { subtasks: task.subtasks });
                this.loadTasks();
                this.render();
            }
        }
    }

    deleteTask(taskId) {
        if (confirm('Delete this task?')) {
            this.saveState();
            taskStorage.deleteTask(taskId);
            this.tasks = taskStorage.getAllTasks();
            this.loadTasks();
            this.render();
        }
    }

    viewTaskDetails(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (task) {
            const content = document.getElementById('detailsContent');
            const subTasksHTML = task.subtasks && task.subtasks.length > 0
                ? task.subtasks.map(st => `
                    <div class="detail-item">
                        <input type="checkbox" ${st.completed ? 'checked' : ''}>
                        <span>${st.title}</span>
                    </div>
                `).join('')
                : '<p style="color: var(--text-secondary);">No subtasks</p>';

            content.innerHTML = `
                <div class="detail-item">
                    <span class="detail-label">Title:</span>
                    <span class="detail-value">${task.title}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Description:</span>
                    <span class="detail-value">${task.description || 'No description'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Category:</span>
                    <span class="detail-value">${task.category}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Priority:</span>
                    <span class="detail-value">${task.priority}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Due Date:</span>
                    <span class="detail-value">${task.dueDate || 'Not set'}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">Subtasks:</span>
                </div>
                ${subTasksHTML}
            `;

            this.detailsTaskId = taskId;
            document.getElementById('detailsModal').classList.add('show');
        }
    }

    editFromDetails() {
        this.closeDetailsModal();
        this.openTaskModal(this.detailsTaskId);
    }

    closeDetailsModal() {
        document.getElementById('detailsModal').classList.remove('show');
    }

    // ============================================
    // RENDERING
    // ============================================

    render() {
        this.updateStats();
        this.renderTasks();
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

        document.getElementById('totalTasks').textContent = total;
        document.getElementById('completedTasks').textContent = completed;
        document.getElementById('pendingTasks').textContent = pending;
        document.getElementById('progressFill').style.width = percentage + '%';
        document.getElementById('progressText').textContent = percentage + '% Complete';
    }

    renderTasks() {
        const taskList = document.getElementById('taskList');
        const emptyState = document.getElementById('emptyState');

        if (this.filteredTasks.length === 0) {
            taskList.innerHTML = '';
            emptyState.style.display = 'flex';
            return;
        }

        emptyState.style.display = 'none';
        taskList.innerHTML = this.filteredTasks.map(task => this.createTaskElement(task)).join('');

        // Add event listeners to task elements
        document.querySelectorAll('.task-item').forEach(element => {
            const taskId = parseInt(element.dataset.taskId);

            // Checkbox
            const checkbox = element.querySelector('.task-checkbox');
            if (checkbox) {
                checkbox.checked = this.tasks.find(t => t.id === taskId)?.completed || false;
                checkbox.addEventListener('change', () => this.toggleTaskComplete(taskId));
            }

            // Task content click for details
            element.querySelector('.task-content').addEventListener('click', () => {
                this.viewTaskDetails(taskId);
            });

            // Subtasks
            element.querySelectorAll('.subtask-item').forEach(subtaskEl => {
                const subtaskId = parseInt(subtaskEl.dataset.subtaskId);
                const subtaskCheckbox = subtaskEl.querySelector('input');
                if (subtaskCheckbox) {
                    subtaskCheckbox.addEventListener('change', () => this.toggleSubtask(taskId, subtaskId));
                }
            });

            // Edit and delete buttons
            const editBtn = element.querySelector('.edit-task-btn');
            const deleteBtn = element.querySelector('.delete-task-btn');
            if (editBtn) editBtn.addEventListener('click', () => this.openTaskModal(taskId));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteTask(taskId));
        });
    }

    createTaskElement(task) {
        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const isOverdue = dueDate && dueDate < today && !task.completed;

        const subtasksHTML = task.subtasks && task.subtasks.length > 0
            ? `<div class="task-subtasks">
                ${task.subtasks.map(st => `
                    <div class="subtask-item ${st.completed ? 'completed' : ''}" data-subtask-id="${st.id}">
                        <input type="checkbox" ${st.completed ? 'checked' : ''}>
                        <span>${st.title}</span>
                    </div>
                `).join('')}
              </div>`
            : '';

        return `
            <li class="task-item ${task.completed ? 'completed' : ''} ${task.priority}-priority ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <div class="task-content">
                    <div class="task-header">
                        <span class="task-title">${task.title}</span>
                        <span class="task-category"><i class="fas fa-tag"></i> ${task.category}</span>
                        <span class="task-priority ${task.priority}"><i class="fas fa-flag"></i> ${task.priority}</span>
                    </div>
                    ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                    <div class="task-meta">
                        ${task.dueDate ? `<span class="task-meta-item task-due-date ${isOverdue ? 'overdue' : ''}">
                            <i class="fas fa-calendar"></i> ${task.dueDate}${task.dueTime ? ` at ${task.dueTime}` : ''}
                            ${isOverdue ? ' (OVERDUE)' : ''}
                        </span>` : ''}
                        ${task.reminder ? `<span class="task-meta-item"><i class="fas fa-bell"></i> Reminder enabled</span>` : ''}
                        ${task.subtasks && task.subtasks.length > 0 ? `
                            <span class="task-meta-item">
                                <i class="fas fa-tasks"></i> ${task.subtasks.filter(s => s.completed).length}/${task.subtasks.length}
                            </span>
                        ` : ''}
                    </div>
                    ${subtasksHTML}
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-task-btn" title="Edit">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="task-btn delete delete-task-btn" title="Delete">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </li>
        `;
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});
