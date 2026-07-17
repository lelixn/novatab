import { Response } from 'express';
import Todo from '../models/Todo';
import { AuthenticatedRequest } from '../middleware/auth';

export const getTodos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const todos = await Todo.find({ user: req.userId }).sort({ order: 1 });
    res.status(200).json(todos);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch tasks' });
  }
};

export const createTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { title, description, priority, category, deadline, tags, order } = req.body;
    if (!title) {
      res.status(400).json({ message: 'Task title is required' });
      return;
    }

    const todo = new Todo({
      user: req.userId,
      title,
      description,
      priority,
      category,
      deadline,
      tags,
      order: order ?? 0,
    });

    await todo.save();
    res.status(201).json(todo);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create task' });
  }
};

export const updateTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndUpdate(
      { _id: id, user: req.userId },
      { $set: req.body },
      { new: true }
    );

    if (!todo) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(todo);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update task' });
  }
};

export const deleteTodo = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const todo = await Todo.findOneAndDelete({ _id: id, user: req.userId });

    if (!todo) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json({ message: 'Task deleted successfully', id });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete task' });
  }
};

export const reorderTodos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
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

    await Todo.bulkWrite(bulkOps);
    res.status(200).json({ message: 'Tasks reordered successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reorder tasks' });
  }
};

export const clearCompletedTodos = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await Todo.deleteMany({ user: req.userId, completed: true });
    res.status(200).json({ message: 'Completed tasks cleared successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to clear completed tasks' });
  }
};
