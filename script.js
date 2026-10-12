let tasks = [];

const taskListElement = document.querySelector('#taskList');
const taskFormElement = document.querySelector('#taskForm');
const taskInputElement = document.querySelector('#taskInput');
const priorityInputElement = document.querySelector('#priorityInput');

const API_URL = 'https://task-backend-ja4q.onrender.com/tasks';

const fetchTasks = async () => {
  try {
    taskListElement.innerHTML =
      "<h3 style='text-align: center;'>กำลังโหลดข้อมูล...</h3>";

    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`โหลดงานไม่สำเร็จ (${response.status})`);
    }

    const data = await response.json();

    tasks = data.map(item => {
      return {
        id: item._id,
        title: item.title,
        completed: item.completed,
        priority: item.priority || 'low'
      };
    });

    renderTasks();
  } catch (error) {
    console.error('ดึงข้อมูลไม่สำเร็จ:', error);

    taskListElement.innerHTML =
      "<h3 style='text-align: center; color: red;'>ไม่สามารถเชื่อมต่อ Backend ได้</h3>";
  }
};

const renderTasks = () => {
  if (tasks.length === 0) {
    taskListElement.innerHTML =
      '<p style="text-align: center;">ยังไม่มีรายการงาน</p>';
    return;
  }

  taskListElement.innerHTML = tasks.map(task => `
    <article class="task-item ${task.completed ? 'completed' : ''}">
      <input
        type="checkbox"
        ${task.completed ? 'checked' : ''}
        onchange="handleToggle('${task.id}')"
      >

      <span class="task-title">${task.title}</span>

      <span class="priority">${task.priority}</span>

      <button
        class="delete-button"
        onclick="handleDelete('${task.id}')">
        ลบ
      </button>
    </article>
  `).join('');
};

const addTask = async (title, priority) => {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: title,
      priority: priority
    })
  });

  if (!response.ok) {
    throw new Error(`เพิ่มงานไม่สำเร็จ (${response.status})`);
  }

  await fetchTasks();
};

const toggleTaskStatus = async id => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'PUT'
    });

    if (!response.ok) {
      throw new Error(`เปลี่ยนสถานะไม่สำเร็จ (${response.status})`);
    }

    await fetchTasks();
  } catch (error) {
    console.error('เปลี่ยนสถานะไม่สำเร็จ:', error);
  }
};

const deleteTask = async id => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      throw new Error(`ลบงานไม่สำเร็จ (${response.status})`);
    }

    await fetchTasks();
  } catch (error) {
    console.error('ลบงานไม่สำเร็จ:', error);
  }
};

async function handleToggle(id) {
  await toggleTaskStatus(id);
}

async function handleDelete(id) {
  await deleteTask(id);
}

taskFormElement.addEventListener('submit', async event => {
  event.preventDefault();

  const title = taskInputElement.value.trim();
  const priority = priorityInputElement.value;

  if (!title) {
    return;
  }

  await addTask(title, priority);
});

fetchTasks();
