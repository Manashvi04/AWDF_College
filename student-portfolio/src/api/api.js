const BASE_URL = "http://localhost:5000";

// Get JWT from browser
function getToken() {
  return localStorage.getItem("token");
}

// Common response handling
async function handleResponse(response) {
  // Token missing, invalid or expired
  if (response.status === 401) {
    localStorage.removeItem("token");

    window.location.href = "/login";

    throw new Error("Session expired. Please login again.");
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Something went wrong");
  }

  return data;
}

// GET ALL TASKS
export async function getTasks() {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return handleResponse(response);
}

// CREATE TASK
export async function createTask(task) {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },

    body: JSON.stringify(task),
  });

  return handleResponse(response);
}

// UPDATE TASK
export async function updateTask(id, task) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },

    body: JSON.stringify(task),
  });

  return handleResponse(response);
}

// DELETE TASK
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return handleResponse(response);
}
