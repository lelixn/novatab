import { Router } from 'express';
import { getBookmarks, createBookmark, updateBookmark, deleteBookmark, reorderBookmarks } from '../controllers/bookmarkController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.route('/')
  .get(getBookmarks)
  .post(createBookmark);

router.post('/reorder', reorderBookmarks);

router.route('/:id')
  .put(updateBookmark)
  .delete(deleteBookmark);

export default router;
