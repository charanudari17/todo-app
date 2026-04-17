function addTask() {
    let input = document.getElementById("taskInput");
    let task = input.value;

    if (task === "") return;

    let li = document.createElement("li");
    li.textContent = task;
li.onclick = function () {
    li.style.textDecoration = "line-through";
};
    // Create delete button
    let btn = document.createElement("button");
    btn.textContent = "Remove Task";

    // When button clicked → remove task
    btn.onclick = function (event) {
    event.stopPropagation(); // prevents li click
    li.remove();
};

    li.appendChild(btn);

    document.getElementById("taskList").appendChild(li);

    input.value = "";
}


function deleteAll() {
    let list = document.getElementById("taskList");

    if (list.children.length === 0) {
        alert("No tasks to delete!");
        return;
    }

    list.innerHTML = "";
}
