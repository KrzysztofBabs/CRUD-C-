const todoList = document.querySelector("#todoList");
const todoForm = document.querySelector("#todoForm");
const todoName = document.querySelector("#todoName");
const searchInput = document.querySelector("#searchInput");
const statusMessage = document.querySelector("#statusMessage");
const progressBar = document.querySelector("#progressBar");
const progressLabel = document.querySelector("#progressLabel");
const counters = {
    total: document.querySelector("#totalCount"),
    open: document.querySelector("#openCount"),
    done: document.querySelector("#doneCount")
};

let todos = [];
let activeFilter = "all";

const api = {
    async list() {
        const response = await fetch("/todos");
        if (!response.ok) throw new Error("Nie udało się pobrać zadań.");
        return response.json();
    },
    async create(name) {
        const response = await fetch("/todos", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, isComplete: false })
        });
        if (!response.ok) throw new Error("Nie udało się dodać zadania.");
        return response.json();
    },
    async update(todo) {
        const response = await fetch(`/todos/${todo.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(todo)
        });
        if (!response.ok) throw new Error("Nie udało się zapisać zmiany.");
    },
    async remove(id) {
        const response = await fetch(`/todos/${id}`, { method: "DELETE" });
        if (!response.ok) throw new Error("Nie udało się usunąć zadania.");
    }
};

function setStatus(message = "") {
    statusMessage.textContent = message;
}

function getVisibleTodos() {
    const query = searchInput.value.trim().toLowerCase();

    return todos.filter(todo => {
        const matchesFilter =
            activeFilter === "all" ||
            (activeFilter === "open" && !todo.isComplete) ||
            (activeFilter === "done" && todo.isComplete);
        const matchesSearch = !query || (todo.name || "").toLowerCase().includes(query);

        return matchesFilter && matchesSearch;
    });
}

function renderCounters() {
    const done = todos.filter(todo => todo.isComplete).length;
    const total = todos.length;
    const open = total - done;
    const progress = total === 0 ? 0 : Math.round((done / total) * 100);

    counters.total.textContent = total;
    counters.open.textContent = open;
    counters.done.textContent = done;
    progressLabel.textContent = `${progress}%`;
    progressBar.style.width = `${progress}%`;
}

function renderTodos() {
    renderCounters();
    const visibleTodos = getVisibleTodos();
    todoList.innerHTML = "";

    if (visibleTodos.length === 0) {
        const empty = document.createElement("div");
        empty.className = "empty-state";
        empty.textContent = todos.length === 0
            ? "Brak zadań. Dodaj pierwszą pozycję do listy."
            : "Brak zadań pasujących do aktualnego widoku.";
        todoList.append(empty);
        return;
    }

    visibleTodos.forEach(todo => {
        const item = document.createElement("article");
        item.className = `todo-item${todo.isComplete ? " done" : ""}`;

        const checkbox = document.createElement("input");
        checkbox.className = "todo-check";
        checkbox.type = "checkbox";
        checkbox.checked = todo.isComplete;
        checkbox.ariaLabel = `Zmień status: ${todo.name}`;
        checkbox.addEventListener("change", () => toggleTodo(todo));

        const content = document.createElement("div");
        const title = document.createElement("span");
        title.className = "todo-title";
        title.textContent = todo.name || "Zadanie bez nazwy";

        const meta = document.createElement("span");
        meta.className = "todo-meta";
        meta.textContent = todo.isComplete ? "Zamknięte" : "Do zrobienia";

        content.append(title, meta);

        const actions = document.createElement("div");
        actions.className = "todo-actions";

        const editButton = document.createElement("button");
        editButton.className = "todo-action";
        editButton.type = "button";
        editButton.title = "Edytuj";
        editButton.textContent = "✎";
        editButton.addEventListener("click", () => renameTodo(todo));

        const deleteButton = document.createElement("button");
        deleteButton.className = "todo-action delete";
        deleteButton.type = "button";
        deleteButton.title = "Usuń";
        deleteButton.textContent = "×";
        deleteButton.addEventListener("click", () => deleteTodo(todo.id));

        actions.append(editButton, deleteButton);
        item.append(checkbox, content, actions);
        todoList.append(item);
    });
}

async function loadTodos() {
    try {
        setStatus("Ładowanie zadań...");
        todos = await api.list();
        setStatus("");
        renderTodos();
    } catch (error) {
        setStatus(error.message);
    }
}

async function addTodo(event) {
    event.preventDefault();
    const name = todoName.value.trim();
    if (!name) {
        setStatus("Wpisz treść zadania.");
        return;
    }

    try {
        const created = await api.create(name);
        todos = [created, ...todos];
        todoName.value = "";
        setStatus("Dodano zadanie.");
        renderTodos();
    } catch (error) {
        setStatus(error.message);
    }
}

async function toggleTodo(todo) {
    const updated = { ...todo, isComplete: !todo.isComplete };
    try {
        await api.update(updated);
        todos = todos.map(item => item.id === todo.id ? updated : item);
        setStatus("Zapisano status.");
        renderTodos();
    } catch (error) {
        setStatus(error.message);
    }
}

async function renameTodo(todo) {
    const name = window.prompt("Nowa nazwa zadania", todo.name || "");
    if (name === null) return;

    const trimmedName = name.trim();
    if (!trimmedName) {
        setStatus("Nazwa zadania nie może być pusta.");
        return;
    }

    const updated = { ...todo, name: trimmedName };
    try {
        await api.update(updated);
        todos = todos.map(item => item.id === todo.id ? updated : item);
        setStatus("Zmieniono nazwę.");
        renderTodos();
    } catch (error) {
        setStatus(error.message);
    }
}

async function deleteTodo(id) {
    try {
        await api.remove(id);
        todos = todos.filter(todo => todo.id !== id);
        setStatus("Usunięto zadanie.");
        renderTodos();
    } catch (error) {
        setStatus(error.message);
    }
}

document.querySelectorAll(".filter").forEach(button => {
    button.addEventListener("click", () => {
        activeFilter = button.dataset.filter;
        document.querySelectorAll(".filter").forEach(item => item.classList.remove("active"));
        button.classList.add("active");
        renderTodos();
    });
});

todoForm.addEventListener("submit", addTodo);
searchInput.addEventListener("input", renderTodos);
loadTodos();
