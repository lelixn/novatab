import { Response } from 'express';
import Bookmark from '../models/Bookmark';
import { AuthenticatedRequest } from '../middleware/auth';

export const getBookmarks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const bookmarks = await Bookmark.find({ user: req.userId }).sort({ order: 1 });
    res.status(200).json(bookmarks);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch bookmarks' });
  }
};

export const createBookmark = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, url, favicon, order } = req.body;
    if (!title || !url) {
      res.status(400).json({ message: 'Title and URL are required' });
      return;
    }

    const bookmark = new Bookmark({
      user: req.userId,
      title,
      url,
      favicon,
      order: order ?? 0,
    });

    await bookmark.save();
    res.status(201).json(bookmark);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create bookmark' });
  }
};

export const deleteBookmark = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findOneAndDelete({ _id: id, user: req.userId });

    if (!bookmark) {
      res.status(404).json({ message: 'Bookmark not found' });
      return;
    }

    res.status(200).json({ message: 'Bookmark deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete bookmark' });
  }
};

export const reorderBookmarks = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { orders } = req.body; // Array of { id, order }
    if (!orders || !Array.isArray(orders)) {
      res.status(400).json({ message: 'Orders array is required' });
      return;
    }

    const bulkOps = orders.map((item: { id: string; order: number }) => ({
      updateOne: {
        filter: { _id: item.id, user: req.userId },
        update: { $set: { order: item.order } },
      },
    }));

    await Bookmark.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Bookmarks reordered successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reorder bookmarks' });
  }
};
export const updateBookmark = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const bookmark = await Bookmark.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!bookmark) {
      res.status(404).json({ message: 'Bookmark not found' });
      return;
    }

    res.status(200).json(bookmark);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update bookmark' });
  }
};
