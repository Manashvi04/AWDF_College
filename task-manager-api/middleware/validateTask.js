function validateTask(req, res, next) {
  const { title } = req.body;

  if (!title || title.trim() === "") {
    return res.status(400).json({
      error: "Task title is required",
    });
  }

  next();
}

module.exports = validateTask;
