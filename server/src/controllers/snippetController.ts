import { Response } from 'express';
import Snippet from '../models/Snippet';
import { AuthenticatedRequest } from '../middleware/auth';

export const getSnippets = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const snippets = await Snippet.find({ user: req.userId }).sort({ isFavorite: -1, updatedAt: -1 });
    res.status(200).json(snippets);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch snippets' });
  }
};

export const createSnippet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, command, description, category, tags, isFavorite } = req.body;
    if (!title || !command) {
      res.status(400).json({ message: 'Title and Command are required' });
      return;
    }

    const snippet = new Snippet({
      user: req.userId,
      title,
      command,
      description,
      category: category || 'other',
      tags: tags || [],
      isFavorite: isFavorite || false,
    });

    await snippet.save();
    res.status(201).json(snippet);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create snippet' });
  }
};

export const updateSnippet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const snippet = await Snippet.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!snippet) {
      res.status(404).json({ message: 'Snippet not found' });
      return;
    }

    res.status(200).json(snippet);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update snippet' });
  }
};

export const deleteSnippet = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const snippet = await Snippet.findOneAndDelete({ _id: id, user: req.userId });

    if (!snippet) {
      res.status(404).json({ message: 'Snippet not found' });
      return;
    }

    res.status(200).json({ message: 'Snippet deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete snippet' });
  }
};
