import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: '',
    },
    priority: {
      type: String,
      enum: {
        values: ['low', 'medium', 'high'],
        message: 'Priority must be low, medium, or high',
      },
      default: 'medium',
    },
    status: {
      type: String,
      enum: {
        values: ['todo', 'in_progress', 'done'],
        message: 'Status must be todo, in_progress, or done',
      },
      default: 'todo',
    },
    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // null/undefined is allowed (optional field)
          if (value === null || value === undefined) return true;
          return !isNaN(new Date(value).getTime());
        },
        message: 'Due date must be a valid date',
      },
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

const Task = mongoose.model('Task', taskSchema);

export default Task;
