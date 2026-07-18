import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import {
  Plus,
  Check,
  Trash2,
  GripVertical,
  Calendar,
  Tag as TagIcon,
  Search,
  X,
  AlertCircle,
  Undo2,
  CheckSquare,
  Square,
  ChevronDown,
  Filter,
} from 'lucide-react';
import { useTodoStore } from '../store/todoStore';
import { useNotificationStore } from '@store/index';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Todo, TodoPriority, TodoCategory } from '@shared/types';
import { getPriorityColor, cn } from '@shared/utils';
import { Widget, WidgetHeader, WidgetBody, WidgetFooter } from '@shared/components/Widget';

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
  const {
    todos,
    addTodo,
    restoreTodo,
    toggleTodo,
    deleteTodo,
    reorderTodos,
    clearCompleted,
    deleteBulk,
    completeBulk,
  } = useTodoStore();

  const { addNotification } = useNotificationStore();

  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<TodoPriority | 'all'>('all');
  const [categoryFilter, setCategoryFilter] = useState<TodoCategory | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Form tag input state
  const [tagsInput, setTagsInput] = useState('');
  const [tagsList, setTagsList] = useState<string[]>([]);

  // Bulk selections
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Title input ref for keyboard shortcuts
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<TodoFormData>({
    resolver: zodResolver(todoSchema),
    defaultValues: { priority: 'medium', category: 'work' },
  });

  // Keyboard shortcut listener: 'n' key to focus task input
  useEffect(() => {
    const handleShortcut = (e: KeyboardEvent) => {
      // Don't trigger if user is focusing an input or textarea
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setShowForm(true);
        setTimeout(() => titleInputRef.current?.focus(), 50);
      }
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagsInput.trim().toLowerCase().replace(/[^a-z0-9_-]/g, '');
      if (val && !tagsList.includes(val)) {
        setTagsList([...tagsList, val]);
      }
      setTagsInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTagsList(tagsList.filter((t) => t !== tagToRemove));
  };

  const onSubmit = (data: TodoFormData) => {
    addTodo({
      title: data.title,
      description: data.description,
      priority: data.priority,
      category: data.category,
      deadline: data.deadline,
      tags: tagsList,
      completed: false,
    });
    reset();
    setTagsList([]);
    setShowForm(false);
    addNotification({
      title: 'Task Created',
      message: `"${data.title}" successfully added to matrix.`,
      type: 'success',
    });
  };

  // Safe delete with undo notification
  const handleDeleteTodo = (todo: Todo) => {
    deleteTodo(todo.id);
    addNotification({
      title: 'Task Deleted',
      message: `Removed task "${todo.title}"`,
      type: 'info',
      duration: 6000,
      action: {
        label: 'Undo',
        onClick: () => {
          restoreTodo(todo);
        },
      },
    });
  };

  // Collect all unique tags dynamically
  const allTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    todos.forEach((t) => {
      if (t.tags) {
        t.tags.forEach((tag) => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet);
  }, [todos]);

  // Filters logic
  const filteredTodos = useMemo(() => {
    return todos
      .filter((t) => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
      })
      .filter((t) => priorityFilter === 'all' || t.priority === priorityFilter)
      .filter((t) => categoryFilter === 'all' || t.category === categoryFilter)
      .filter((t) => !selectedTag || (t.tags && t.tags.includes(selectedTag)))
      .filter((t) => {
        if (!search.trim()) return true;
        const normalized = search.toLowerCase().trim();
        return (
          t.title.toLowerCase().includes(normalized) ||
          (t.description ?? '').toLowerCase().includes(normalized) ||
          (t.tags ?? []).some((tag) => tag.toLowerCase().includes(normalized))
        );
      });
  }, [todos, filter, priorityFilter, categoryFilter, selectedTag, search]);

  const completedCount = todos.filter((t) => t.completed).length;
  const progressPct = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  // Bulk actions handling
  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredTodos.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredTodos.map((t) => t.id));
    }
  };

  const handleBulkComplete = (completed: boolean) => {
    completeBulk(selectedIds, completed);
    setSelectedIds([]);
    addNotification({
      title: 'Bulk Update',
      message: `Completed status updated for selected tasks.`,
      type: 'success',
    });
  };

  const handleBulkDelete = () => {
    const selectedTodos = todos.filter((t) => selectedIds.includes(t.id));
    deleteBulk(selectedIds);
    setSelectedIds([]);
    addNotification({
      title: 'Bulk Delete',
      message: `Deleted ${selectedTodos.length} tasks.`,
      type: 'info',
      duration: 6000,
      action: {
        label: 'Undo All',
        onClick: () => {
          selectedTodos.forEach((t) => restoreTodo(t));
        },
      },
    });
  };

  return (
    <div style={{ maxWidth: 780, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top Header stats */}
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
              className="nova-btn nova-btn-ghost nova-btn-sm"
              onClick={clearCompleted}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Clear Done
            </motion.button>
          )}
          <motion.button
            className="nova-btn nova-btn-primary nova-btn-sm"
            onClick={() => {
              setShowForm(!showForm);
              if (!showForm) {
                setTimeout(() => titleInputRef.current?.focus(), 50);
              }
            }}
            style={{ gap: 6 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={14} />
            Add Task <span className="font-mono" style={{ opacity: 0.5, fontSize: '0.62rem', background: 'rgba(255,255,255,0.15)', borderRadius: 3, padding: '1px 3px', marginLeft: 2 }}>N</span>
          </motion.button>
        </div>
      </div>

      {/* Progress Ring / Dashboard Progress Bar */}
      <Widget>
        <WidgetBody style={{ padding: '14px 20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Overall Progress</span>
            <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--nova-purple)', fontWeight: 600 }}>
              {Math.round(progressPct)}%
            </span>
          </div>
          <div className="nova-progress">
            <motion.div
              className="nova-progress-fill"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </WidgetBody>
      </Widget>

      {/* New Task Form */}
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

              {/* Title input */}
              <div style={{ marginBottom: 14 }}>
                <input
                  {...register('title')}
                  ref={(e) => {
                    register('title').ref(e);
                    titleInputRef.current = e;
                  }}
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
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

                <div>
                  <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
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

              {/* Tag System */}
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', marginBottom: 4 }}>
                  TAGS
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 6 }}>
                  {tagsList.map((tag) => (
                    <span key={tag} className="nova-chip nova-chip-active" style={{ gap: 4, padding: '2px 8px', fontSize: '0.68rem' }}>
                      #{tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', padding: 0 }}>
                        <X size={10} color="var(--accent)" />
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="Type tag name and press Enter..."
                  className="nova-input"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => { reset(); setTagsList([]); setShowForm(false); }}
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

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Search */}
        <div style={{ position: 'relative' }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks, descriptions, or tags..."
            className="nova-input"
            style={{ paddingLeft: 36 }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Filter Badges Row */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          {(['all', 'active', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn('nova-chip', filter === f && 'nova-chip-active')}
              style={{ cursor: 'pointer', fontSize: '0.72rem', textTransform: 'capitalize' }}
            >
              {f} Tasks
            </button>
          ))}

          <div style={{ width: 1, height: 16, background: 'var(--border-subtle)' }} />

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as TodoPriority | 'all')}
            className="nova-input"
            style={{ width: 'auto', padding: '3px 10px', fontSize: '0.72rem', height: 26, fontFamily: 'JetBrains Mono', cursor: 'pointer', background: 'var(--bg-glass)' }}
          >
            <option value="all">All Priorities</option>
            {PRIORITIES.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as TodoCategory | 'all')}
            className="nova-input"
            style={{ width: 'auto', padding: '3px 10px', fontSize: '0.72rem', height: 26, fontFamily: 'JetBrains Mono', cursor: 'pointer', background: 'var(--bg-glass)' }}
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.emoji} {c.label}</option>)}
          </select>
        </div>

        {/* Dynamic Tags Row */}
        {allTags.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'JetBrains Mono', display: 'flex', alignItems: 'center', gap: 4 }}>
              <TagIcon size={10} /> TAGS:
            </span>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={cn('nova-chip', selectedTag === tag && 'nova-chip-active')}
                style={{ cursor: 'pointer', fontSize: '0.65rem', padding: '2px 8px' }}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bulk actions bar if selected */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 15 }}
            className="nova-card-glow"
            style={{
              padding: '10px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--bg-elevated)',
              borderColor: 'var(--accent)',
              borderRadius: 'var(--radius-lg)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="font-mono" style={{ fontSize: '0.75rem', color: 'var(--accent)', fontWeight: 600 }}>
                {selectedIds.length} tasks selected
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => handleBulkComplete(true)}
                className="nova-btn nova-btn-success nova-btn-xs"
              >
                Complete
              </button>
              <button
                onClick={() => handleBulkComplete(false)}
                className="nova-btn nova-btn-ghost nova-btn-xs"
              >
                Pending
              </button>
              <button
                onClick={handleBulkDelete}
                className="nova-btn nova-btn-danger nova-btn-xs"
                style={{ gap: 4 }}
              >
                <Trash2 size={11} /> Delete
              </button>
              <button
                onClick={() => setSelectedIds([])}
                className="nova-btn nova-btn-ghost nova-btn-xs"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task List Widget */}
      <Widget>
        <WidgetHeader
          title="Task Matrix Grid"
          icon={<CheckSquare size={13} />}
          iconColor="var(--nova-purple)"
          actions={
            filteredTodos.length > 0 && (
              <button
                onClick={handleToggleSelectAll}
                className="nova-btn nova-btn-ghost nova-btn-xs"
              >
                {selectedIds.length === filteredTodos.length ? 'Deselect All' : 'Select All'}
              </button>
            )
          }
        />
        <WidgetBody style={{ padding: '10px' }}>
          {filteredTodos.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center' }}>
              <span style={{ fontSize: '2rem', display: 'block', marginBottom: 12 }}>🧘</span>
              <div className="font-pixel" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                All clear! No tasks match constraints.
              </div>
            </div>
          ) : (
            <Reorder.Group
              axis="y"
              values={filteredTodos}
              onReorder={reorderTodos}
              style={{ display: 'flex', flexDirection: 'column', gap: 6, listStyle: 'none' }}
            >
              <AnimatePresence mode="popLayout">
                {filteredTodos.map((todo) => {
                  const isSelected = selectedIds.includes(todo.id);
                  return (
                    <TodoItem
                      key={todo.id}
                      todo={todo}
                      isSelected={isSelected}
                      onToggleSelect={() => {
                        setSelectedIds((prev) =>
                          prev.includes(todo.id) ? prev.filter((id) => id !== todo.id) : [...prev, todo.id]
                        );
                      }}
                      onToggle={() => toggleTodo(todo.id)}
                      onDelete={() => handleDeleteTodo(todo)}
                    />
                  );
                })}
              </AnimatePresence>
            </Reorder.Group>
          )}
        </WidgetBody>
      </Widget>
    </div>
  );
};

// ============================================
// Todo Item Component
// ============================================
interface TodoItemProps {
  todo: Todo;
  isSelected: boolean;
  onToggleSelect: () => void;
  onToggle: () => void;
  onDelete: () => void;
}

const TodoItem: React.FC<TodoItemProps> = ({ todo, isSelected, onToggleSelect, onToggle, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const priorityColor = getPriorityColor(todo.priority);
  const catEmoji = CATEGORIES.find((c) => c.value === todo.category)?.emoji ?? '📌';

  return (
    <Reorder.Item
      value={todo}
      id={todo.id}
      as="div"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -30 }}
      whileDrag={{ scale: 1.01, boxShadow: 'var(--shadow-xl)', backgroundColor: 'var(--bg-card-hover)' }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '10px 14px',
        background: isSelected ? 'var(--accent-subtle)' : hovered ? 'var(--bg-card-hover)' : 'var(--bg-glass)',
        border: `1px solid ${isSelected ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        borderLeft: `3px solid ${todo.completed ? 'var(--text-muted)' : priorityColor}`,
        borderRadius: 8,
        cursor: 'default',
        transition: 'background 120ms ease, border-color 120ms ease',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Bulk Select Box */}
      <div
        onClick={(e) => { e.stopPropagation(); onToggleSelect(); }}
        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: isSelected ? 'var(--accent)' : 'var(--text-muted)' }}
      >
        {isSelected ? <CheckSquare size={14} /> : <Square size={14} style={{ opacity: hovered ? 0.8 : 0.4 }} />}
      </div>

      {/* Drag Grip */}
      <div style={{ color: 'var(--text-muted)', cursor: 'grab', display: 'flex', opacity: hovered ? 0.8 : 0.2, transition: 'opacity 120ms ease' }}>
        <GripVertical size={13} />
      </div>

      {/* Toggle Complete Checkbox */}
      <motion.button
        onClick={onToggle}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.92 }}
        style={{
          width: 20,
          height: 20,
          borderRadius: 5,
          border: `2px solid ${todo.completed ? 'var(--text-muted)' : priorityColor}`,
          background: todo.completed ? 'rgba(71,85,105,0.15)' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'all 120ms ease',
        }}
      >
        {todo.completed && <Check size={11} color="var(--text-muted)" />}
      </motion.button>

      {/* Task Details */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              fontSize: '0.85rem',
              color: todo.completed ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: todo.completed ? 'line-through' : 'none',
              fontWeight: todo.completed ? 400 : 500,
              transition: 'all 150ms ease',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {todo.title}
          </span>
          <span style={{ fontSize: '0.72rem' }} title={todo.category}>{catEmoji}</span>
        </div>
        {todo.description && (
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'JetBrains Mono', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {todo.description}
          </div>
        )}

        {/* Metadata display */}
        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
          <span
            className="nova-badge"
            style={{
              fontSize: '0.58rem',
              padding: '1px 5px',
              background: `${priorityColor}15`,
              color: priorityColor,
              border: `1px solid ${priorityColor}25`,
            }}
          >
            {todo.priority}
          </span>
          {todo.deadline && (
            <span className="nova-chip" style={{ fontSize: '0.58rem', padding: '1px 6px', gap: 3, background: 'rgba(255,255,255,0.03)', border: 'none' }}>
              <Calendar size={9} />
              {new Date(todo.deadline).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          )}
          {/* Display Tags */}
          {todo.tags && todo.tags.map((tag) => (
            <span key={tag} className="font-mono" style={{ fontSize: '0.62rem', color: 'var(--accent)', opacity: 0.8 }}>
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Delete button */}
      <div style={{ width: 24, display: 'flex', justifyContent: 'flex-end', flexShrink: 0 }}>
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
              <Trash2 size={13} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </Reorder.Item>
  );
};
