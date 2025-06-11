document.addEventListener("DOMContentLoaded", function () {
    const taskForm = document.getElementById("task-form");
    const taskInput = document.getElementById("task-input");
    const taskDate = document.getElementById("task-date");
    const taskPriority = document.getElementById("task-priority");
    const taskLabel = document.getElementById("task-label");
    const taskList = document.getElementById("task-list");
    const taskStatsTotal = document.getElementById("total-tasks");
    const priorityStats = document.getElementById("priority-stats");
    const labelStats = document.getElementById("label-stats");
    const calendarEl = document.getElementById("calendar");

    let calendar;
    let editandoId = null; // Guardar ID si estamos editando una tarea

    // Inicializar el calendario
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        locale: "es",
        editable: false,
        events: []
    });
    calendar.render();

    cargarTareas();

    // agregar o Editar Tarea
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nuevaTarea = {
            descripcion: taskInput.value.trim(),
            fecha: taskDate.value,
            prioridad: taskPriority.value,
            etiqueta: taskLabel.value,
        };

        if (!nuevaTarea.descripcion || !nuevaTarea.fecha) {
            alert("Todos los campos son obligatorios.");
            return;
        }

        if (editandoId) {
            // Modo edición
            nuevaTarea.id = editandoId;

            await fetch("./php/api.php", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaTarea)
            });

            editandoId = null;
        } else {
            // Modo agregar
            await fetch("./php/api.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(nuevaTarea)
            });
        }

        taskForm.reset();
        cargarTareas();
    });

    // Cargar tareas
    async function cargarTareas() {
        const res = await fetch("./php/api.php");
        const tareas = await res.json();

        taskList.innerHTML = "";
        calendar.removeAllEvents();

        if (tareas.length === 0) {
            taskList.innerHTML = '<p class="text-gray-500">No hay tareas registradas.</p>';
            updateStats([]);
            return;
        }

        tareas.forEach(t => {
            // Lista
            const taskItem = document.createElement("div");
            taskItem.className = "flex justify-between items-center border p-2 rounded";

            const content = document.createElement("div");
            content.innerHTML = `
                <p><strong>${t.descripcion}</strong> (${t.prioridad})</p>
                <p class="text-sm text-gray-500">Etiqueta: ${t.etiqueta}</p>
                <p class="text-sm text-gray-500">Fecha: ${t.fecha}</p>
            `;

            const buttons = document.createElement("div");
            buttons.className = "flex gap-2";

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Eliminar";
            deleteBtn.className = "px-3 py-1 bg-red-600 text-white rounded";
            deleteBtn.onclick = () => eliminarTarea(t.id);

            const editBtn = document.createElement("button");
            editBtn.textContent = "Modificar";
            editBtn.className = "px-3 py-1 bg-yellow-500 text-white rounded";
            editBtn.onclick = () => editarTarea(t);

            buttons.appendChild(deleteBtn);
            buttons.appendChild(editBtn);

            taskItem.appendChild(content);
            taskItem.appendChild(buttons);
            taskList.appendChild(taskItem);

            // Calendario
            calendar.addEvent({
                id: String(t.id),
                title: t.descripcion,
                start: t.fecha
            });
        });

        updateStats(tareas);
    }

    // Eliminar tarea
    async function eliminarTarea(id) {
        await fetch("./php/api.php", {
            method: "DELETE",
            body: new URLSearchParams({ id })
        });
        cargarTareas();
    }

    // Editar tarea
    function editarTarea(tarea) {
        taskInput.value = tarea.descripcion;
        taskDate.value = tarea.fecha;
        taskPriority.value = tarea.prioridad;
        taskLabel.value = tarea.etiqueta;

        editandoId = tarea.id;

        // Scroll automático al formulario
        taskInput.focus();
    }

    // Estadísticas
    function updateStats(tareas) {
        taskStatsTotal.textContent = tareas.length;

        const priorityCount = { alta: 0, media: 0, baja: 0 };
        const labelCount = { personal: 0, trabajo: 0, estudiante: 0 };

        tareas.forEach(t => {
            priorityCount[t.prioridad]++;
            labelCount[t.etiqueta]++;
        });

        priorityStats.innerHTML = "";
        for (let p in priorityCount) {
            const li = document.createElement("li");
            li.textContent = `${p.charAt(0).toUpperCase() + p.slice(1)}: ${priorityCount[p]}`;
            priorityStats.appendChild(li);
        }

        labelStats.innerHTML = "";
        for (let l in labelCount) {
            const li = document.createElement("li");
            li.textContent = `${l.charAt(0).toUpperCase() + l.slice(1)}: ${labelCount[l]}`;
            labelStats.appendChild(li);
        }
    }
});