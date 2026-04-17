window.onload = function () {
    let saved = localStorage.getItem("tasks");
    if (saved) {
        document.getElementById("taskList").innerHTML = saved;

        // reattach delete button events
        let buttons = document.querySelectorAll("#taskList button");

        buttons.forEach(function (btn) {
            btn.onclick = function (event) {
                event.stopPropagation();
                btn.parentElement.remove();
                saveTasks();
            };
        });

        // reattach li click (complete toggle)
        let items = document.querySelectorAll("#taskList li");

        items.forEach(function (li) {
            li.onclick = function () {
                if (li.style.textDecoration === "line-through") {
                    li.style.textDecoration = "none";
                } else {
                    li.style.textDecoration = "line-through";
                }
                saveTasks();
            };
        });
    }
};
function addTask() {
    let input = document.getElementById("taskInput");
    let task = input.value;

    if (task === "") return;

    let li = document.createElement("li");
    li.textContent = task;
li.onclick = function () {
    if (li.style.textDecoration === "line-through") {
        li.style.textDecoration = "none";
    } else {
        li.style.textDecoration = "line-through";
    }
};
    // Create delete button
    let btn = document.createElement("button");
    btn.textContent = "Remove Task";
btn.style.backgroundColor = "orange";
btn.style.color = "white";
    // When button clicked → remove task
    btn.onclick = function (event) {
    event.stopPropagation();
    li.remove();
    saveTasks();  
};

    li.appendChild(btn);

    document.getElementById("taskList").appendChild(li);

    input.value = "";
    saveTasks();
}


function deleteAll() {
    let list = document.getElementById("taskList");

    if (list.children.length === 0) {
        alert("No tasks to delete!");
        return;
    }

    list.innerHTML = "";
    saveTasks();
}
function saveTasks() {
    let tasks = document.getElementById("taskList").innerHTML;
    localStorage.setItem("tasks", tasks);
}