// When page loads, restore saved tasks from browser storage
window.onload = function () {
    let saved = localStorage.getItem("tasks");
    if (saved) {
        // Load previously saved tasks into the list
        document.getElementById("taskList").innerHTML = saved;

        // Setup delete button click handlers for saved tasks
        let buttons = document.querySelectorAll("#taskList button");

        buttons.forEach(function (btn) {
            btn.onclick = function (event) {
                event.stopPropagation();
                btn.parentElement.remove();
                saveTasks();
                updateEmptyState();
            };
        });

        // Setup mark complete click handler for saved tasks
        let items = document.querySelectorAll("#taskList li");

        items.forEach(function (li) {
            li.onclick = function (event) {
                // Only toggle complete if button wasn't clicked
                if (event.target.tagName !== "BUTTON") {
                    li.classList.toggle("completed");
                    saveTasks();
                }
            };
        });
    }
    updateEmptyState();
};

// Add a new task when user clicks "Add" button
function addTask() {
    let input = document.getElementById("taskInput");
    let task = input.value.trim();

    // Don't add empty tasks
    if (task === "") return;

    // Create the task item (li element)
    let li = document.createElement("li");

    // Create a span for the task text
    let taskText = document.createElement("span");
    taskText.textContent = task;
    taskText.className = "task-text";
    li.appendChild(taskText);

    // Click on task to mark it complete
    li.onclick = function (event) {
        // Only toggle complete if button wasn't clicked
        if (event.target.tagName !== "BUTTON") {
            li.classList.toggle("completed");
            saveTasks();
        }
    };

    // Create delete button
    let btn = document.createElement("button");
    btn.textContent = "Delete";

    // When button clicked → remove task
    btn.onclick = function (event) {
        event.stopPropagation();
        li.remove();
        saveTasks();
        updateEmptyState();
    };

    // Add button to task item
    li.appendChild(btn);

    // Add task to the list
    document.getElementById("taskList").appendChild(li);

    // Clear input field and save
    input.value = "";
    saveTasks();
    updateEmptyState();
}

// Delete all tasks when user clicks "Clear All" button
function deleteAll() {
    let list = document.getElementById("taskList");

    // Show warning if no tasks exist
    if (list.children.length === 0) {
        alert("No tasks to delete!");
        return;
    }

    // Remove all tasks from the list
    list.innerHTML = "";
    saveTasks();
    updateEmptyState();
}

// Save all tasks to browser storage so they persist after page reload
function saveTasks() {
    let tasks = document.getElementById("taskList").innerHTML;
    localStorage.setItem("tasks", tasks);
}

// Show "No tasks" message when list is empty, hide it when tasks exist
function updateEmptyState() {
    let list = document.getElementById("taskList");
    let emptyState = document.getElementById("emptyState");

    if (list.children.length === 0) {
        // Show empty state message
        emptyState.classList.add("show");
    } else {
        // Hide empty state message
        emptyState.classList.remove("show");
    }
}
