const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const authMiddleware = require("./middleware/auth");
const validateTask = require("./middleware/validateTask");
require("dotenv").config();

const Task = require("./models/task");
const User = require("./models/user");
const cache = require("./utils/cache");

const app = express();
const PORT = 5000;

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

app.use(cors());
app.use(express.json());

//Middleware to log requests
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);

  next();
});

// Content-Type Middleware
app.use((req, res, next) => {
  if (req.method === "POST" || req.method === "PUT") {
    const contentType = req.headers["content-type"];

    if (!contentType || !contentType.includes("application/json")) {
      return res.status(400).json({
        error: "Content-Type must be application/json",
      });
    }
  }

  next();
});

// REGISTER USER
app.post("/register", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user._id,
        email: user.email,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET CURRENT LOGGED-IN USER
app.get("/me", authMiddleware, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.status(200).json({
      user,
    });
  } catch (err) {
    next(err);
  }
});

// LOGIN USER
app.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({
      message: "Login successful",
      token,
    });
  } catch (err) {
    next(err);
  }
});

//Get all tasks(GET API)
app.get("/tasks", authMiddleware, async (req, res, next) => {
  try {
    // Check cache first
    const cachedTasks = cache.get("all_tasks");

    if (cachedTasks) {
      console.log("CACHE HIT");

      return res.status(200).json(cachedTasks);
    }

    // Cache did not contain tasks
    console.log("CACHE MISS");

    const tasks = await Task.find();

    // Store result for future requests
    cache.set("all_tasks", tasks);

    res.status(200).json(tasks);
  } catch (err) {
    next(err);
  }
});

// GET SINGLE TASK BY ID
app.get("/tasks/:id", authMiddleware, async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    res.status(200).json(task);
  } catch (err) {
    next(err);
  }
});

// CREATE NEW TASK(POST API)
app.post("/tasks", authMiddleware, validateTask, async (req, res, next) => {
  try {
    const newTask = await Task.create({
      title: req.body.title,
      description: req.body.description,
      completed: req.body.completed,
      priority: req.body.priority,
    });
    cache.del("all_tasks");
    res.status(201).json(newTask);
  } catch (err) {
    next(err);
  }
});

// UPDATE TASK(PUT API)
app.put("/tasks/:id", authMiddleware, async (req, res, next) => {
  try {
    const updatedTask = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        completed: req.body.completed,
        priority: req.body.priority,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!updatedTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    cache.del("all_tasks");
    res.status(200).json(updatedTask);
  } catch (err) {
    next(err);
  }
});

// DELETE TASK - MongoDB
app.delete("/tasks/:id", authMiddleware, async (req, res, next) => {
  try {
    const deletedTask = await Task.findByIdAndDelete(req.params.id);

    if (!deletedTask) {
      return res.status(404).json({
        error: "Task not found",
      });
    }

    cache.del("all_tasks");
    res.status(200).json({
      message: "Task deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const errors = Object.values(err.errors).map((error) => error.message);

    return res.status(400).json({
      error: "Validation failed",
      details: errors,
    });
  }

  res.status(500).json({
    error: "Something went wrong",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
