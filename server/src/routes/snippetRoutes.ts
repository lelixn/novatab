import { Router } from 'express';
import { getSnippets, createSnippet, updateSnippet, deleteSnippet } from '../controllers/snippetController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getSnippets)
  .post(createSnippet);

router.route('/:id')
  .put(updateSnippet)
  .delete(deleteSnippet);

export default router;
