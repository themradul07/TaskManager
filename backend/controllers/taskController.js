const Task = require('../models/Task');

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, dueDate, tags } = req.body;

    if (!title) {
      res.status(400);
      throw new Error('Task title is required');
    }

    const task = await Task.create({
      title,
      description,
      priority,
      dueDate: dueDate || null,
      tags: Array.isArray(tags) ? tags : [],
      userId: req.user._id,
    });

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all user tasks (with search, filter, sort, and pagination)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Build query object
    const query = { userId };

    // Search query (matches title or description case-insensitively)
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by completion status
    if (req.query.status && req.query.status !== 'all') {
      query.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority && req.query.priority !== 'all') {
      query.priority = req.query.priority;
    }

    // Filter by specific tag
    if (req.query.tag && req.query.tag !== 'all') {
      query.tags = req.query.tag;
    }

    // Sorting parameters
    const sortBy = req.query.sortBy || 'createdAt';
    const order = req.query.order === 'asc' ? 1 : -1;
    const sortOptions = {};
    sortOptions[sortBy] = order;

    // Pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 6;
    const skip = (page - 1) * limit;

    // Fetch total matching tasks count
    const totalTasks = await Task.countDocuments(query);

    // Fetch paginated, sorted tasks
    const tasks = await Task.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);

    // Get list of all unique tags for this user (for dashboard tag filters)
    const allUserTasks = await Task.find({ userId }).select('tags');
    const uniqueTags = [...new Set(allUserTasks.flatMap(t => t.tags || []))];

    // Get basic stats for the dashboard info cards
    const statsTasks = await Task.find({ userId }).select('status priority');
    const stats = {
      total: statsTasks.length,
      completed: statsTasks.filter(t => t.status === 'completed').length,
      pending: statsTasks.filter(t => t.status === 'pending').length,
      highPriority: statsTasks.filter(t => t.priority === 'high' && t.status === 'pending').length
    };

    res.json({
      tasks,
      page,
      pages: Math.ceil(totalTasks / limit) || 1,
      totalTasks,
      uniqueTags,
      stats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single task by ID
// @route   GET /api/tasks/:id
// @access  Private
const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Make sure task belongs to user
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to access this task');
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags } = req.body;

    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Make sure task belongs to user
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to update this task');
    }

    // Update fields
    task.title = title !== undefined ? title : task.title;
    task.description = description !== undefined ? description : task.description;
    task.status = status !== undefined ? status : task.status;
    task.priority = priority !== undefined ? priority : task.priority;
    task.dueDate = dueDate !== undefined ? dueDate : task.dueDate;
    task.tags = Array.isArray(tags) ? tags : task.tags;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle task status (pending/completed)
// @route   PATCH /api/tasks/:id/toggle
// @access  Private
const toggleTaskStatus = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Check ownership
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to modify this task');
    }

    // Toggle status
    task.status = task.status === 'completed' ? 'pending' : 'completed';

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error('Task not found');
    }

    // Make sure task belongs to user
    if (task.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this task');
    }

    await Task.deleteOne({ _id: req.params.id });

    res.json({ message: 'Task removed successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  toggleTaskStatus,
  deleteTask,
};
