import Task from '../models/Task.js';

/**
 * Priority ordering map for logical (not alphabetical) sorting.
 * Maps each priority to a numeric weight so high > medium > low.
 */
const PRIORITY_WEIGHT = { low: 1, medium: 2, high: 3 };

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 */
export const createTask = async (req, res, next) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    const task = await Task.create({
      title: title?.trim(),
      description: description?.trim() || '',
      priority: priority || 'medium',
      status: status || 'todo',
      dueDate: dueDate || null,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all tasks with optional filtering and sorting
 * @route   GET /api/tasks
 */
export const getTasks = async (req, res, next) => {
  try {
    const { status, sortBy, order } = req.query;

    // Build the filter object
    const filter = {};
    if (status) {
      filter.status = status;
    }

    // Build the sort object
    let sort = { createdAt: -1 }; // default: newest first

    if (sortBy) {
      const sortOrder = order === 'asc' ? 1 : -1;

      if (sortBy === 'priority') {
        // Priority needs custom sorting via aggregation
        const pipeline = [
          { $match: filter },
          {
            $addFields: {
              priorityWeight: {
                $switch: {
                  branches: [
                    { case: { $eq: ['$priority', 'high'] }, then: PRIORITY_WEIGHT.high },
                    { case: { $eq: ['$priority', 'medium'] }, then: PRIORITY_WEIGHT.medium },
                    { case: { $eq: ['$priority', 'low'] }, then: PRIORITY_WEIGHT.low },
                  ],
                  default: 0,
                },
              },
            },
          },
          { $sort: { priorityWeight: sortOrder } },
          { $project: { priorityWeight: 0 } }, // remove the helper field
        ];

        const tasks = await Task.aggregate(pipeline);
        return res.status(200).json({
          success: true,
          count: tasks.length,
          data: tasks,
        });
      }

      // Standard field sorting (dueDate, createdAt)
      sort = { [sortBy]: sortOrder };
    }

    const tasks = await Task.find(filter).sort(sort);

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get a single task by ID
 * @route   GET /api/tasks/:id
 */
export const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error(`Task not found with ID: ${req.params.id}`);
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update a task
 * @route   PUT /api/tasks/:id
 */
export const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error(`Task not found with ID: ${req.params.id}`);
    }

    // Trim string fields before updating
    const updates = { ...req.body };
    if (updates.title !== undefined) updates.title = updates.title?.trim();
    if (updates.description !== undefined) updates.description = updates.description?.trim();

    // Allow clearing dueDate by sending null or empty string
    if (updates.dueDate === '' || updates.dueDate === null) {
      updates.dueDate = null;
    }

    const updatedTask = await Task.findByIdAndUpdate(req.params.id, updates, {
      new: true,           // return the modified document
      runValidators: true,  // run schema validators on update
    });

    res.status(200).json({
      success: true,
      data: updatedTask,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 */
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      res.status(404);
      throw new Error(`Task not found with ID: ${req.params.id}`);
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      data: { id: req.params.id },
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
