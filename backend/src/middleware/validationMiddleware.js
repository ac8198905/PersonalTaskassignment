import mongoose from 'mongoose';

/**
 * Allowed query parameters for GET /api/tasks.
 * Anything not in this set triggers a 400 response.
 */
const ALLOWED_QUERY_PARAMS = new Set([
  'status',
  'sortBy',
  'order',
]);

const VALID_STATUSES = ['todo', 'in_progress', 'done'];
const VALID_PRIORITIES = ['low', 'medium', 'high'];
const VALID_SORT_FIELDS = ['dueDate', 'priority', 'createdAt'];
const VALID_ORDERS = ['asc', 'desc'];

/**
 * Validate that a string is a valid MongoDB ObjectId.
 */
export const validateObjectId = (req, res, next) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: `Invalid task ID: "${id}"`,
    });
  }
  next();
};

/**
 * Validate the request body when creating or updating a task.
 * Runs before the controller so the controller can trust the data shape.
 */
export const validateTaskBody = (req, res, next) => {
  const { title, description, priority, status, dueDate } = req.body;
  const errors = [];

  // On create (POST), title is required
  if (req.method === 'POST') {
    if (title === undefined || title === null || String(title).trim() === '') {
      errors.push('Title is required');
    }
  }

  // If title is provided (create or update), validate it
  if (title !== undefined && title !== null) {
    if (typeof title !== 'string') {
      errors.push('Title must be a string');
    } else if (title.trim() === '') {
      errors.push('Title cannot be empty');
    } else if (title.trim().length > 200) {
      errors.push('Title cannot exceed 200 characters');
    }
  }

  // Validate description if provided
  if (description !== undefined && description !== null) {
    if (typeof description !== 'string') {
      errors.push('Description must be a string');
    } else if (description.trim().length > 2000) {
      errors.push('Description cannot exceed 2000 characters');
    }
  }

  // Validate priority if provided
  if (priority !== undefined && priority !== null) {
    if (!VALID_PRIORITIES.includes(priority)) {
      errors.push(`Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }
  }

  // Validate status if provided
  if (status !== undefined && status !== null) {
    if (!VALID_STATUSES.includes(status)) {
      errors.push(`Status must be one of: ${VALID_STATUSES.join(', ')}`);
    }
  }

  // Validate dueDate if provided
  if (dueDate !== undefined && dueDate !== null && dueDate !== '') {
    const parsed = new Date(dueDate);
    if (isNaN(parsed.getTime())) {
      errors.push('Due date must be a valid date');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors.length === 1 ? errors[0] : 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate query parameters for GET /api/tasks.
 * Rejects any unknown query keys and invalid filter/sort values.
 */
export const validateQueryParams = (req, res, next) => {
  const queryKeys = Object.keys(req.query);

  // Check for unknown query parameters
  const unknownParams = queryKeys.filter((key) => !ALLOWED_QUERY_PARAMS.has(key));
  if (unknownParams.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Invalid query parameter(s): ${unknownParams.join(', ')}. Allowed: ${[...ALLOWED_QUERY_PARAMS].join(', ')}`,
    });
  }

  // Validate status filter
  if (req.query.status && !VALID_STATUSES.includes(req.query.status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status filter: "${req.query.status}". Must be one of: ${VALID_STATUSES.join(', ')}`,
    });
  }

  // Validate sortBy
  if (req.query.sortBy && !VALID_SORT_FIELDS.includes(req.query.sortBy)) {
    return res.status(400).json({
      success: false,
      message: `Invalid sortBy value: "${req.query.sortBy}". Must be one of: ${VALID_SORT_FIELDS.join(', ')}`,
    });
  }

  // Validate order
  if (req.query.order && !VALID_ORDERS.includes(req.query.order)) {
    return res.status(400).json({
      success: false,
      message: `Invalid order value: "${req.query.order}". Must be one of: ${VALID_ORDERS.join(', ')}`,
    });
  }

  // If order is given without sortBy, reject
  if (req.query.order && !req.query.sortBy) {
    return res.status(400).json({
      success: false,
      message: 'Cannot use "order" without "sortBy"',
    });
  }

  next();
};
