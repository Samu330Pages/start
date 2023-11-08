const taskInput = document.getElementById('taskInput');
const addTaskButton = document.getElementById('addTaskButton');
const taskList = document.getElementById('taskList');

let taskNumber = 1;

addTaskButton.addEventListener('click', function() {
  const taskText = taskInput.value;
  if (taskText !== '') {
    const taskItem = document.createElement('li');
    const taskButton = document.createElement('button');
    taskButton.innerText = 'Finalizada';
    taskButton.addEventListener('click', function() {
      taskItem.classList.toggle('completed');
      taskButton.disabled = true;
    });

    const taskTextElement = document.createElement('span');
    taskTextElement.innerText = `${taskNumber}. ${taskText}`;

    taskItem.appendChild(taskTextElement);
    taskItem.appendChild(taskButton);

    taskList.insertBefore(taskItem, taskList.firstChild);

    taskInput.value = '';
    taskNumber++;
  }
});
