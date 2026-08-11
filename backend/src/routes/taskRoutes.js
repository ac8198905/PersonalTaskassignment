import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
} from '../controllers/taskController.js';
import {
  validateObjectId,
  validateTaskBody,
  validateQueryParams,
} from '../middleware/validationMiddleware.js';

const router = Router();

router
  .route('/')
  .get(validateQueryParams, getTasks)
  .post(validateTaskBody, createTask);

router
  .route('/:id')
  .get(validateObjectId, getTask)
  .put(validateObjectId, validateTaskBody, updateTask)
  .delete(validateObjectId, deleteTask);

export default router;
