import { useEffect, useState, lazy, Suspense } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../api/api";

// Practical 8: Lazy-loaded analytics component
// const TaskAnalytics = lazy(() => import("../components/taskAnalytics"));

//practical-8 : supplementary component for task analytics
const TaskAnalytics = lazy(() =>
  Promise.all([
    import("../components/taskAnalytics"),
    new Promise((resolve) => setTimeout(resolve, 300)),
  ]).then(([module]) => module),
);

function Projects() {
  // ==============================
  // STATES
  // ==============================

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");

  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Practical 8
  const [showAnalytics, setShowAnalytics] = useState(false);

  // ==============================
  // LOAD TASKS
  // ==============================

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    try {
      setLoading(true);
      setError("");

      const data = await getTasks();

      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // ==============================
  // TOAST
  // ==============================

  function showToast(message) {
    setToast(message);

    setTimeout(() => {
      setToast("");
    }, 3000);
  }

  // ==============================
  // CREATE TASK
  // Optimistic UI Update
  // ==============================

  async function handleSubmit(e) {
    e.preventDefault();

    const tempId = `temp-${Date.now()}`;

    const optimisticTask = {
      _id: tempId,
      title,
      description,
      priority,
      completed: false,
    };

    // Immediately display temporary task
    setTasks((prevTasks) => [...prevTasks, optimisticTask]);

    // Store values before clearing form
    const taskData = {
      title,
      description,
      priority,
    };

    // Clear form immediately
    setTitle("");
    setDescription("");
    setPriority("medium");

    try {
      setActionLoading(true);
      setError("");

      const savedTask = await createTask(taskData);

      // Replace temporary task with real MongoDB task
      setTasks((prevTasks) =>
        prevTasks.map((task) => (task._id === tempId ? savedTask : task)),
      );

      showToast("✅ Task created successfully");
    } catch (err) {
      // Rollback optimistic task
      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== tempId));

      setError(err.message);

      showToast("❌ Failed to create task");
    } finally {
      setActionLoading(false);
    }
  }

  // ==============================
  // UPDATE TASK
  // ==============================

  async function handleToggleComplete(task) {
    try {
      setError("");

      const updatedTask = await updateTask(task._id, {
        title: task.title,
        description: task.description,
        priority: task.priority,
        completed: !task.completed,
      });

      setTasks((prevTasks) =>
        prevTasks.map((t) => (t._id === updatedTask._id ? updatedTask : t)),
      );

      showToast("✅ Task updated successfully");
    } catch (err) {
      setError(err.message);

      showToast("❌ Failed to update task");
    }
  }

  // ==============================
  // DELETE TASK
  // ==============================

  async function handleDelete(id) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this task?",
    );

    if (!confirmDelete) {
      return;
    }

    try {
      setError("");

      await deleteTask(id);

      setTasks((prevTasks) => prevTasks.filter((task) => task._id !== id));

      showToast("✅ Task deleted successfully");
    } catch (err) {
      setError(err.message);

      showToast("❌ Failed to delete task");
    }
  }

  // ==============================
  // INITIAL LOADING
  // ==============================

  if (loading) {
    return (
      <div className="container">
        <h2>Loading tasks...</h2>
      </div>
    );
  }

  // ==============================
  // UI
  // ==============================

  return (
    <div className="container">
      {/* TOAST */}
      {toast && <div className="toast">{toast}</div>}

      <h1>Task Manager</h1>

      <p>Full Stack Task Manager using React, Node.js, Express and MongoDB</p>

      {/* ERROR */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {/* ==========================
          CREATE TASK FORM
      ========================== */}

      <form className="task-form" onSubmit={handleSubmit}>
        <h2>Create New Task</h2>

        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          placeholder="Task description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low Priority</option>

          <option value="medium">Medium Priority</option>

          <option value="high">High Priority</option>
        </select>

        <button type="submit" disabled={actionLoading}>
          {actionLoading ? "Creating..." : "Add Task"}
        </button>
      </form>

      {/* ==========================
          PRACTICAL 8
          LAZY-LOADED ANALYTICS
      ========================== */}

      <div className="analytics-section">
        <button onClick={() => setShowAnalytics((previous) => !previous)}>
          {showAnalytics ? "Hide Analytics" : "Show Analytics"}
        </button>

        {showAnalytics && (
          <Suspense
            fallback={
              <div className="analytics-loading">
                <p>Loading analytics...</p>
              </div>
            }
          >
            <TaskAnalytics tasks={tasks} />
          </Suspense>
        )}
      </div>

      {/* ==========================
          TASK LIST
      ========================== */}

      <h2 className="task-heading">Your Tasks</h2>

      {tasks.length === 0 ? (
        <p>No tasks available. Create your first task!</p>
      ) : (
        <div className="repo-list">
          {tasks.map((task) => (
            <div className="repo-card" key={task._id}>
              <h2>{task.title}</h2>

              <p>{task.description || "No description"}</p>

              <p>
                <strong>Priority:</strong> {task.priority}
              </p>

              <p>
                <strong>Status:</strong>{" "}
                {task.completed ? "Completed ✅" : "Pending ⏳"}
              </p>

              <div className="task-actions">
                <button
                  className="complete-btn"
                  onClick={() => handleToggleComplete(task)}
                >
                  {task.completed ? "Mark Pending" : "Mark Completed"}
                </button>

                <button
                  className="delete-btn"
                  onClick={() => handleDelete(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Projects;
