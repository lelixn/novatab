import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Todo, TodoPriority, TodoCategory } from '@shared/types';
import { generateId } from '@shared/utils';

interface TodoStore {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt' | 'order'>) => void;
  restoreTodo: (todo: Todo) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  toggleTodo: (id: string) => void;
  reorderTodos: (todos: Todo[]) => void;
  clearCompleted: () => void;
  deleteBulk: (ids: string[]) => void;
  completeBulk: (ids: string[], completed: boolean) => void;
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
      restoreTodo: (todo) =>
        set((state) => ({ todos: [...state.todos, todo] })),
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
      deleteBulk: (ids) =>
        set((state) => ({ todos: state.todos.filter((t) => !ids.includes(t.id)) })),
      completeBulk: (ids, completed) =>
        set((state) => ({
          todos: state.todos.map((t) =>
            ids.includes(t.id) ? { ...t, completed, updatedAt: new Date().toISOString() } : t
          ),
        })),
    }),
    {
      name: 'nova-todos',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
