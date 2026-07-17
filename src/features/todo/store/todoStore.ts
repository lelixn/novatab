import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Todo, TodoPriority, TodoCategory } from '@shared/types';
import { generateId } from '@shared/utils';

interface TodoStore {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
  clearCompleted: () => void;
}

export const useTodoStore = create<TodoStore>()(
  persist(
    (set) => ({
      todos: [],
      addTodo: (todo) =>
        set((state) => {
          const newTodo: Todo = {
            ...todo,
            id: generateId(),
            order: state.todos.length,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          return { todos: [...state.todos, newTodo] };
        }),
      updateTodo: (id, updates) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
          ),
        })),
      deleteTodo: (id) =>
        set((state) => ({ todos: state.todos.filter((t) => t.id !== id) })),
      toggleTodo: (id) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            t.id === id ? { ...t, completed: !t.completed, updatedAt: new Date().toISOString() } : t
          ),
        })),
      reorderTodos: (todos) => set({ todos }),
      clearCompleted: () =>
        set((state) => ({ todos: state.todos.filter((t) => !t.completed) })),
    }),
    {
      name: 'nova-todos',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
