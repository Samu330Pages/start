var tasks = [];

function addTask() {
  var taskText = document.getElementById('input-task').value;

  var task = {
    text: taskText,
    buttons: []
  };

  tasks.push(task);

  renderTasks();
}

function renderTasks() {
  var tasksContainer = document.getElementById('tasks-container');
  tasksContainer.innerHTML = '';

  tasks.forEach(function(task, index) {
    var taskEl = document.createElement('div');
    taskEl.className = 'task';

    var taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';

    var textEl = document.createElement('span');
    textEl.textContent = task.text;

    var timeEl = document.createElement('span');
    timeEl.textContent = 'Hace ' + index + ' segundos'; // Cambiar esto por la lógica para calcular el tiempo

    taskInfo.appendChild(textEl);
    taskInfo.appendChild(timeEl);

    var actionsEl = document.createElement('div');
    actionsEl.className = 'task-actions';

    var addButtons = [
      {text: '1', value: 1},
      {text: '2', value: 2},
      {text: '3', value: 3},
      {text: '4', value: 4},
    ];

    var updateButtons = [
      {text: '1', value: 1},
      {text: '2', value: 2},
      {text: '3', value: 3},
      {text: '4', value: 4},
      {text: 'Eliminar', value: 'delete'},
    ];

    addButtons.forEach(function(button) {
      var btnEl = document.createElement('button');
      btnEl.textContent = button.text;
      btnEl.addEventListener('click', function() {
        task.buttons.push(button.value);
        renderTasks();
      });
      actionsEl.appendChild(btnEl);
    });

    task.buttons.forEach(function(button) {
      var btnEl = document.createElement('button');
      btnEl.textContent = button;
      btnEl.addEventListener('click', function() {
        if (button === 'delete') {
          tasks.splice(index, 1);
        } else {
          // Lógica para actualizar la tarea con el botón seleccionado
        }
        renderTasks();
      });
      actionsEl.appendChild(btnEl);
    });

    taskEl.appendChild(taskInfo);
    taskEl.appendChild(actionsEl);

    tasksContainer.appendChild(taskEl);
  });
}

document.getElementById('add-task-btn').addEventListener('click', addTask);
