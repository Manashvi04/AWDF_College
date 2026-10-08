function TaskAnalytics({ tasks }) {
  const total = tasks.length;

  const completed = tasks.filter((task) => task.completed).length;

  const pending = total - completed;

  const highPriority = tasks.filter((task) => task.priority === "high").length;

  return (
    <div className="analytics-card">
      <h2>Task Analytics</h2>

      <p>
        <strong>Total Tasks:</strong> {total}
      </p>

      <p>
        <strong>Completed:</strong> {completed}
      </p>

      <p>
        <strong>Pending:</strong> {pending}
      </p>

      <p>
        <strong>High Priority:</strong> {highPriority}
      </p>
    </div>
  );
}

export default TaskAnalytics;
