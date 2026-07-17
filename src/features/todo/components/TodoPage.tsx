import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Check,
  Trash2,
  GripVertical,
  Flag,
  Calendar,
  Tag,
  Filter,
  ChevronDown,
  X,
  AlertCircle,
} from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Todo, TodoPriority, TodoCategory } from '@shared/types';
import { getPriorityColor, cn } from '@shared/utils';

// ============================================
// Schema
// ============================================
const todoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
  category: z.enum(['work', 'personal', 'learning', 'health', 'other']),
  deadline: z.string().optional(),
});

type TodoFormData = z.infer<typeof todoSchema>;

// ============================================
// Constants
// ============================================
const PRIORITIES: { value: TodoPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'var(--nova-green)' },
  { value: 'medium', label: 'Medium', color: 'var(--nova-yellow)' },
  { value: 'high', label: 'High', color: 'var(--nova-red)' },
];

const CATEGORIES: { value: TodoCategory; label: string; emoji: string }[] = [
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'personal', label: 'Personal', emoji: '🧘' },
  { value: 'learning', label: 'Learning', emoji: '📚' },
  { value: 'health', label: 'Health', emoji: '💪' },
  { value: 'other', label: 'Other', emoji: '📌' },
];

// ============================================
// Todo Feature Page
// ============================================
export const TodoPage: React.FC = () => {
  const { todos, addTodo, toggleTodo, deleteTodo, reorderTodos, clearCompleted } = useTodoStore();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TodoCategory | 'all'>('all');

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: { priority: 'medium', category: 'work' },
  });

  const onSubmit = (data: TodoFormData) => {
    addTodo({
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      deadline: data.deadline,
      completed: false,
    });
    reset();
    setShowForm(false);
  };

  const filteredTodos = todos
    .filter((t) => {
      if (filter === 'active') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    })
    .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
    .filter((t) => categoryFilter === 'all' || t.category === categoryFilter);

  const completedCount = todos.filter((t) => t.completed).length;
  const progressPct = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 className="font-pixel" style={{ fontSize: '1.2rem', color: 'var(--nova-purple)', marginBottom: 4 }}>
            TASK MATRIX
          </h2>
          <div className="font-mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            {completedCount}/{todos.length} completed · {todos.filter((t) => !t.completed).length} remaining
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {completedCount > 0 && (
            <motion.button
              className="nova-btn nova-btn-ghost"
              onClick={clearCompleted}
              style={{ fontSize: '0.78rem', padding: '6px 12px' }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Clear Done
            </motion.button>
          )}
          <motion.button
            className="nova-btn nova-btn-primary"
            onClick={() => setShowForm(!showForm)}
            style={{ gap: 6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={15} />
            Add Task
          </motion.button>
        </div>
      </div>

      {/* Progress */}
      <div className="nova-card" style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overall Progress</span>
          <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--nova-purple)' }}>
            {Math.round(progressPct)}%
          </span>
        </div>
        <div className="nova-progress">
          <motion.div
            className="nova-progress-fill"
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Add Task Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="nova-card-glow"
            style={{ overflow: 'hidden' }}
          >
            <form onSubmit={handleSubmit(onSubmit)} style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 className="font-pixel" style={{ fontSize: '0.85rem', color: 'var(--nova-cyan)' }}>
                  NEW TASK
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={16} />
                </button>
              </div>

              {/* Title */}
              <div style={{ marginBottom: 14 }}>
                <input
                  {...register('title')}
                  placeholder="// Task title..."
                  className="nova-input"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
                {errors.title && (
                  <div style={{ fontSize: '0.72rem', color: 'var(--nova-red)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <AlertCircle size={11} />
                    {errors.title.message}
                  </div>
                )}
              </div>

              {/* Description */}
              <div style={{ marginBottom: 14 }}>
                <textarea
                  {...register('description')}
                  placeholder="// Description (optional)..."
                  className="nova-input"
                  rows={2}
                  style={{ resize: 'vertical', fontFamily: 'JetBrains Mono, monospace', minHeight: 60 }}
                />
              </div>

              {/* Priority + Category + Deadline */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 16 }}>
                {/* Priority */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
                    PRIORITY
                  </label>
                  <select
                    {...register('priority')}
                    className="nova-input"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {PRIORITIES.map((p) => (
                      <option key={p.value} value={p.value} style={{ background: 'var(--bg-dark)' }}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
                    CATEGORY
                  </label>
                  <select
                    {...register('category')}
                    className="nova-input"
                    style={{ fontFamily: 'JetBrains Mono, monospace' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value} style={{ background: 'var(--bg-dark)' }}>
                        {c.emoji} {c.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Deadline */}
                <div>
                  <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
                    DEADLINE
                  </label>
                  <input
                    {...register('deadline')}
                    type="date"
                    className="nova-input"
                    style={{ fontFamily: 'JetBrains Mono, monospace', colorScheme: 'dark' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { reset(); setShowForm(false); }}
                  className="nova-btn nova-btn-ghost"
                >
                  Cancel
                </button>
                <motion.button
                  type="submit"
                  className="nova-btn nova-btn-primary"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Plus size={14} />
                  Create Task
                </motion.button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="nova-chip"
            style={{
              cursor: 'pointer',
              background: filter === f ? 'rgba(168,85,247,0.15)' : 'transparent',
              borderColor: filter === f ? 'var(--border-glow)' : 'var(--border-subtle)',
              color: filter === f ? 'var(--nova-purple)' : 'var(--text-muted)',
              fontFamily: 'JetBrains Mono',
              fontSize: '0.72rem',
            }}
          >
            {f}
          </button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TodoPriority | 'all')}
            style={{
              background: 'var(--bg-glass)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 20,
              padding: '3px 10px',
              color: 'var(--text-muted)',
              fontSize: '0.72rem',
              fontFamily: 'JetBrains Mono',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="all">All Priority</option>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      {/* Todo List */}
      {filteredTodos.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="nova-card"
          style={{ padding: 40, textAlign: 'center' }}
        >
          <div style={{ fontSize: '2rem', marginBottom: 12 }}>✅</div>
          <div className="font-pixel" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            {filter === 'completed' ? 'No completed tasks yet' : 'No tasks found'}
          </div>
          <div className="font-mono" style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: 6 }}>
            {filter === 'all' && 'Add your first task to get started'}
          </div>
        </motion.div>
      ) : (
        <Reorder.Group
          axis="y"
          values={filteredTodos}
          onReorder={reorderTodos}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo(todo.id)}
                onDelete={() => deleteTodo(todo.id)}
              />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </div>
  );
};

// ============================================
// Todo Item
// ============================================
interface TodoItemProps {
  todo: Todo;
  onToggle: () => void;
  onDelete: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, onToggle, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const priorityColor = getPriorityColor(todo.priority);

  const catEmoji = CATEGORIES.find((c) => c.value === todo.category)?.emoji ?? '📌';

  return (
    <Reorder.Item
      value={todo}
      id={todo.id}
      as="div"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      whileDrag={{ scale: 1.02, boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 16px',
        background: hovered ? 'var(--bg-card-hover)' : 'var(--bg-glass)',
        border: '1px solid var(--border-subtle)',
        borderLeft: `3px solid ${todo.completed ? 'var(--text-muted)' : priorityColor}`,
        borderRadius: 10,
        cursor: 'default',
        transition: 'background 150ms',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Drag Handle */}
      <div style={{ color: 'var(--text-muted)', cursor: 'grab', flexShrink: 0, opacity: hovered ? 1 : 0, transition: 'opacity 150ms' }}>
        <GripVertical size={14} />
      </div>

      {/* Checkbox */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        style={{
          width: 22,
          height: 22,
          borderRadius: 6,
          border: `2px solid ${todo.completed ? priorityColor : 'var(--border-glow)'}`,
          background: todo.completed ? `${priorityColor}20` : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 150ms',
        }}
      >
        <AnimatePresence>
          {todo.completed && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check size={12} color={priorityColor} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              fontSize: '0.88rem',
              color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: todo.completed ? 'line-through' : 'none',
              fontWeight: todo.completed ? 400 : 500,
              transition: 'all 200ms',
            }}
          >
            {todo.title}
          </span>
          <span style={{ fontSize: '0.75rem' }}>{catEmoji}</span>
        </div>
        {todo.description && (
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'JetBrains Mono' }}>
            {todo.description}
          </div>
        )}
        {/* Meta */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
          <span
            className="nova-badge"
            style={{
              fontSize: '0.62rem',
              padding: '1px 6px',
              background: `${priorityColor}15`,
              color: priorityColor,
              border: `1px solid ${priorityColor}30`,
            }}
          >
            {todo.priority}
          </span>
          {todo.deadline && (
            <span className="nova-chip" style={{ fontSize: '0.62rem', padding: '1px 6px', gap: 3 }}>
              <Calendar size={10} />
              {new Date(todo.deadline).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Delete */}
      <AnimatePresence>
        {hovered && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={onDelete}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: 4,
              display: 'flex',
            }}
            whileHover={{ color: 'var(--nova-red)' }}
          >
            <Trash2 size={14} />
          </motion.button>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
};
