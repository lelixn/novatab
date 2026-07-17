import { Router } from 'express';
import { getTodos, createTodo, updateTodo, deleteTodo, reorderTodos, clearCompletedTodos } from '../controllers/todoController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getTodos)
  .post(createTodo);

router.post('/reorder', reorderTodos);
router.post('/clear-completed', clearCompletedTodos);

router.route('/:id')
  .put(updateTodo)
  .delete(deleteTodo);

export default router;
