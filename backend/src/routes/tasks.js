import { Router } from 'express';
import { auth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { createTaskSchema, updateTaskSchema, listTasksSchema } from '../validations/tasks.js';
import { listTasks, createTask, updateTask, deleteTask, toggleTask } from '../controllers/tasksController.js';

const router = Router();

router.get('/', auth, validate(listTasksSchema, 'query'), listTasks);
router.post('/', auth, validate(createTaskSchema), createTask);
router.put('/:id', auth, validate(updateTaskSchema), updateTask);
router.delete('/:id', auth, deleteTask);
router.patch('/:id/toggle', auth, toggleTask);

export default router;
