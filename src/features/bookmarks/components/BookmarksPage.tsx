import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Plus, Trash2, GripVertical, ExternalLink, Search, Globe } from 'lucide-react';
import type { Bookmark } from '@shared/types';
import { getFaviconUrl } from '@shared/utils';
import { useBookmarkStore } from '../store/bookmarkStore';

// ============================================
// Bookmarks Page
// ============================================
export const BookmarksPage: React.FC = () => {
  const { bookmarks, addBookmark, deleteBookmark, reorder } = useBookmarkStore();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newTitle, setNewTitle] = useState('');

  const filteredBookmarks = bookmarks.filter(
    (b) => !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.url.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith('http')) url = `https://${url}`;
    const title = newTitle.trim() || new URL(url).hostname.replace('www.', '');
    addBookmark({ title, url, favicon: getFaviconUrl(url) });
    setNewUrl('');
    setNewTitle('');
    setShowForm(false);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 className="font-pixel" style={{ fontSize: '1.2rem', color: 'var(--nova-pink)' }}>
          BOOKMARKS
        </h2>
        <motion.button
          onClick={() => setShowForm(!showForm)}
          className="nova-btn nova-btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={15} />
          Add Bookmark
        </motion.button>
      </div>

      {/* Add Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="nova-card-glow"
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <h4 className="font-pixel" style={{ fontSize: '0.75rem', color: 'var(--nova-cyan)' }}>NEW BOOKMARK</h4>
              <input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                placeholder="// https://example.com"
                className="nova-input"
                style={{ fontFamily: 'JetBrains Mono' }}
              />
              <input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="// Title (optional)"
                className="nova-input"
              />
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                <button onClick={() => setShowForm(false)} className="nova-btn nova-btn-ghost">Cancel</button>
                <button onClick={handleAdd} className="nova-btn nova-btn-primary"><Plus size={14} />Save</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search bookmarks..."
          className="nova-input"
          style={{ paddingLeft: 34 }}
        />
      </div>

      {/* Bookmark Grid (Drag + Drop) */}
      {filteredBookmarks.length === 0 ? (
        <div className="nova-card" style={{ padding: 40, textAlign: 'center' }}>
          <Globe size={36} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div className="font-pixel" style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            No bookmarks yet
          </div>
        </div>
      ) : (
        <Reorder.Group
          axis="y"
          values={filteredBookmarks}
          onReorder={reorder}
          style={{ display: 'flex', flexDirection: 'column', gap: 8, listStyle: 'none' }}
        >
          <AnimatePresence mode="popLayout">
            {filteredBookmarks.map((bookmark) => (
              <BookmarkItem key={bookmark.id} bookmark={bookmark} onDelete={() => deleteBookmark(bookmark.id)} />
            ))}
          </AnimatePresence>
        </Reorder.Group>
      )}
    </div>
  );
};

// ============================================
// Bookmark Item
// ============================================
const BookmarkItem: React.FC<{ bookmark: Bookmark; onDelete: () => void }> = ({ bookmark, onDelete }) => {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(false);

  const faviconSrc = bookmark.favicon ?? getFaviconUrl(bookmark.url);

  return (
    <Reorder.Item
      value={bookmark}
      id={bookmark.id}
      as="div"
      initial={{ opacity: 0, y: 8 }}
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
        borderRadius: 10,
        backdropFilter: 'blur(10px)',
        transition: 'background 150ms',
        cursor: 'default',
      }}
    >
      {/* Drag Handle */}
      <div style={{ color: 'var(--text-muted)', cursor: 'grab', opacity: hovered ? 1 : 0, transition: 'opacity 150ms' }}>
        <GripVertical size={14} />
      </div>

      {/* Favicon */}
      <div style={{ width: 24, height: 24, borderRadius: 6, overflow: 'hidden', flexShrink: 0, background: 'var(--bg-card-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {!imgError ? (
          <img src={faviconSrc} alt="" width={16} height={16} onError={() => setImgError(true)} />
        ) : (
          <Globe size={12} color="var(--text-muted)" />
        )}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '0.88rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
          {bookmark.title}
        </div>
        <div className="font-mono" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {bookmark.url}
        </div>
      </div>

      {/* Actions */}
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: 6 }}
          >
            <motion.a
              href={bookmark.url}
              target="_blank"
              rel="noreferrer"
              style={{ display: 'flex', padding: 4, color: 'var(--text-muted)', textDecoration: 'none' }}
              whileHover={{ color: 'var(--nova-cyan)' }}
            >
              <ExternalLink size={14} />
            </motion.a>
            <motion.button
              onClick={onDelete}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', color: 'var(--text-muted)' }}
              whileHover={{ color: 'var(--nova-red)' }}
            >
              <Trash2 size={14} />
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
};
