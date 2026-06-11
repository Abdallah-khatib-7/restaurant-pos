import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pencil, Trash2, X, Check,
  Search, UtensilsCrossed, AlertTriangle, LayoutList, Grid3X3
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FloatingNav, BottomNav } from './Dashboard';

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
  }}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      style={{
        background: '#292524', border: '1px solid rgba(244,63,94,0.3)',
        borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px'
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'rgba(244,63,94,0.15)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: '#f43f5e', flexShrink: 0
        }}>
          <AlertTriangle size={20} />
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#fef3c7', margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontSize: '14px', color: '#a8a29e', margin: '0 0 20px', lineHeight: '1.6' }}>{message}</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '11px', borderRadius: '10px',
          background: 'rgba(244,63,94,0.2)', border: '1px solid rgba(244,63,94,0.3)',
          color: '#f43f5e', fontWeight: '600', cursor: 'pointer',
          fontSize: '14px', fontFamily: 'Inter, sans-serif'
        }}>Yes, Delete</button>
        <button onClick={onCancel} style={{
          flex: 1, padding: '11px', borderRadius: '10px',
          background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
          color: '#a8a29e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
        }}>Cancel</button>
      </div>
    </motion.div>
  </div>
);

// ── Modal ─────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div onClick={onClose} style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    zIndex: 100, display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '16px'
  }}>
    <motion.div onClick={e => e.stopPropagation()}
      initial={{ scale: 0.93, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.93, opacity: 0 }}
      style={{
        background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px',
        maxHeight: '90vh', overflowY: 'auto'
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: 0 }}>{title}</h2>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>
          <X size={20} />
        </button>
      </div>
      {children}
    </motion.div>
  </div>
);

// ── Input ─────────────────────────────────────────────────────────────────────
const Input = ({ label, ...props }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <input {...props} style={{
      width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
      border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
      fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
    }}
      onFocus={e => e.target.style.borderColor = '#f59e0b'}
      onBlur={e => e.target.style.borderColor = '#44403c'} />
  </div>
);

const Textarea = ({ label, ...props }) => (
  <div style={{ marginBottom: '14px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
    <textarea {...props} style={{
      width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
      border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
      fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif',
      resize: 'vertical', minHeight: '80px'
    }}
      onFocus={e => e.target.style.borderColor = '#f59e0b'}
      onBlur={e => e.target.style.borderColor = '#44403c'} />
  </div>
);

const Btn = ({ onClick, children, variant = 'primary', disabled }) => (
  <motion.button
    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
    onClick={onClick} disabled={disabled}
    style={{
      padding: '11px 20px', borderRadius: '10px',
      background: variant === 'primary' ? 'linear-gradient(135deg,#f59e0b,#d97706)'
        : variant === 'danger' ? 'rgba(244,63,94,0.15)'
          : 'rgba(68,64,60,0.5)',
      color: variant === 'primary' ? '#1c1917' : variant === 'danger' ? '#f43f5e' : '#a8a29e',
      border: variant === 'danger' ? '1px solid rgba(244,63,94,0.3)' : variant === 'ghost' ? '1px solid #44403c' : 'none',
      cursor: disabled ? 'not-allowed' : 'pointer',
      fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
      display: 'flex', alignItems: 'center', gap: '6px'
    }}>
    {children}
  </motion.button>
);

// ── Item Card ─────────────────────────────────────────────────────────────────
const ItemCard = ({ item, onEdit, onDelete, onToggle, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ delay: index * 0.03 }}
    style={{
      background: 'rgba(41,37,36,0.8)',
      border: '1px solid rgba(245,158,11,0.12)',
      borderRadius: '16px', padding: '16px',
      opacity: item.is_available ? 1 : 0.55,
      transition: 'opacity 0.2s'
    }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
      <div style={{ flex: 1, minWidth: 0, marginRight: '8px' }}>
        <p style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</p>
        <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>{item.category_name}</p>
      </div>
      <p style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
        ${parseFloat(item.price).toFixed(2)}
      </p>
    </div>

    {item.description && (
      <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 10px', lineHeight: '1.5', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.description}
      </p>
    )}

    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(68,64,60,0.4)' }}>
      <button onClick={() => onToggle(item)} style={{
        display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none',
        color: item.is_available ? '#22c55e' : '#a8a29e', cursor: 'pointer', fontSize: '12px',
        fontFamily: 'Inter, sans-serif', padding: 0
      }}>
        <div style={{
          width: '32px', height: '18px', borderRadius: '9px',
          background: item.is_available ? 'rgba(34,197,94,0.2)' : 'rgba(68,64,60,0.5)',
          border: `1px solid ${item.is_available ? '#22c55e' : '#44403c'}`,
          position: 'relative', transition: 'all 0.2s'
        }}>
          <div style={{
            width: '12px', height: '12px', borderRadius: '50%',
            background: item.is_available ? '#22c55e' : '#44403c',
            position: 'absolute', top: '2px',
            left: item.is_available ? '16px' : '2px', transition: 'all 0.2s'
          }} />
        </div>
        {item.is_available ? 'Available' : 'Hidden'}
      </button>
      <div style={{ display: 'flex', gap: '4px' }}>
        <button onClick={() => onEdit(item)} style={{
          background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '8px', padding: '6px 10px', color: '#f59e0b',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
        }}><Pencil size={13} /> Edit</button>
        <button onClick={() => onDelete(item)} style={{
          background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
          borderRadius: '8px', padding: '6px 10px', color: '#f43f5e',
          cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px'
        }}><Trash2 size={13} /></button>
      </div>
    </div>
  </motion.div>
);

// ── Main ──────────────────────────────────────────────────────────────────────
export default function MenuManagement() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'menu'
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [showCatModal, setShowCatModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const [catForm, setCatForm] = useState({ name: '', display_order: '' });
  const [itemForm, setItemForm] = useState({ name: '', description: '', price: '', category_id: '', is_available: true });

  useEffect(() => {
    fetchAll();
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const fetchAll = async () => {
    try {
      const [c, i] = await Promise.all([api.get('/categories'), api.get('/menu')]);
      setCategories(c.data);
      setItems(i.data);
    } catch { toast.error('Failed to load menu'); }
  };

  // ── Categories ──────────────────────────────────────────────────────────────
  const openAddCat = () => { setCatForm({ name: '', display_order: categories.length + 1 }); setEditingCat(null); setShowCatModal(true); };
  const openEditCat = (cat) => { setCatForm({ name: cat.name, display_order: cat.display_order }); setEditingCat(cat); setShowCatModal(true); };

  const saveCat = async () => {
    if (!catForm.name.trim()) return toast.error('Category name is required');
    try {
      if (editingCat) {
        await api.put(`/categories/${editingCat.id}`, catForm);
        toast.success('Category updated');
      } else {
        await api.post('/categories', catForm);
        toast.success('Category added');
      }
      setShowCatModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteCat = (cat) => {
    setConfirm({
      title: 'Delete Category',
      message: `Delete "${cat.name}"? All ${items.filter(i => i.category_id === cat.id).length} items in this category will also be deleted. This cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/categories/${cat.id}`);
          toast.success('Category deleted');
          setActiveCategory('all');
          setConfirm(null);
          fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      }
    });
  };

  // ── Items ───────────────────────────────────────────────────────────────────
  const openAddItem = () => {
    const defaultCat = activeCategory === 'all' ? categories[0]?.id : activeCategory;
    setItemForm({ name: '', description: '', price: '', category_id: defaultCat, is_available: true });
    setEditingItem(null);
    setShowItemModal(true);
  };

  const openEditItem = (item) => {
    setItemForm({ name: item.name, description: item.description || '', price: item.price, category_id: item.category_id, is_available: item.is_available });
    setEditingItem(item);
    setShowItemModal(true);
  };

  const saveItem = async () => {
    if (!itemForm.name.trim()) return toast.error('Item name is required');
    if (!itemForm.price || itemForm.price <= 0) return toast.error('Valid price is required');
    if (!itemForm.category_id) return toast.error('Category is required');
    try {
      if (editingItem) {
        await api.put(`/menu/${editingItem.id}`, itemForm);
        toast.success('Item updated');
      } else {
        await api.post('/menu', itemForm);
        toast.success('Item added');
      }
      setShowItemModal(false);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteItem = (item) => {
    setConfirm({
      title: 'Delete Menu Item',
      message: `Delete "${item.name}"? This action cannot be undone.`,
      onConfirm: async () => {
        try {
          await api.delete(`/menu/${item.id}`);
          toast.success('Item deleted');
          setConfirm(null);
          fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      }
    });
  };

  const toggleAvailable = async (item) => {
    try {
      await api.put(`/menu/${item.id}`, { ...item, is_available: !item.is_available });
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  // ── Filtered ────────────────────────────────────────────────────────────────
  const filtered = items.filter(item => {
    const matchCat = activeCategory === 'all' ? true : item.category_id === activeCategory;
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const card = { background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)', borderRadius: '16px' };

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>
      {!isMobile ? <FloatingNav /> : <BottomNav />}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '24px 24px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#fef3c7', margin: '0 0 4px', fontWeight: '700' }}>Menu Management</h1>
            <p style={{ fontSize: '14px', color: '#a8a29e', margin: 0 }}>{items.length} items across {categories.length} categories</p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {/* View toggle */}
            <div style={{ display: 'flex', background: 'rgba(41,37,36,0.8)', border: '1px solid #44403c', borderRadius: '10px', overflow: 'hidden' }}>
              <button onClick={() => setViewMode('grid')} style={{
                padding: '8px 14px', border: 'none', cursor: 'pointer',
                background: viewMode === 'grid' ? 'rgba(245,158,11,0.2)' : 'transparent',
                color: viewMode === 'grid' ? '#f59e0b' : '#a8a29e',
                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontFamily: 'Inter, sans-serif'
              }}><Grid3X3 size={14} /> Grid</button>
              <button onClick={() => setViewMode('menu')} style={{
                padding: '8px 14px', border: 'none', cursor: 'pointer',
                background: viewMode === 'menu' ? 'rgba(245,158,11,0.2)' : 'transparent',
                color: viewMode === 'menu' ? '#f59e0b' : '#a8a29e',
                display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', fontFamily: 'Inter, sans-serif'
              }}><LayoutList size={14} /> Full Menu</button>
            </div>
            <Btn onClick={openAddCat} variant="ghost"><Plus size={16} /> Category</Btn>
            <Btn onClick={openAddItem}><Plus size={16} /> Add Item</Btn>
          </div>
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: '20px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search menu items..."
            style={{
              width: '100%', padding: '12px 14px 12px 42px', background: 'rgba(41,37,36,0.8)',
              border: '1px solid #44403c', borderRadius: '12px', color: '#fef3c7',
              fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
            }}
            onFocus={e => e.target.style.borderColor = '#f59e0b'}
            onBlur={e => e.target.style.borderColor = '#44403c'} />
        </div>

        {/* ── FULL MENU VIEW ── */}
        {viewMode === 'menu' && (
          <div>
            {categories.map(cat => {
              const catItems = items.filter(i => i.category_id === cat.id && i.name.toLowerCase().includes(search.toLowerCase()));
              if (catItems.length === 0) return null;
              return (
                <div key={cat.id} style={{ marginBottom: '32px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#fef3c7', margin: 0, fontWeight: '700' }}>{cat.name}</h2>
                    <div style={{ flex: 1, height: '1px', background: 'rgba(245,158,11,0.15)' }} />
                    <span style={{ fontSize: '12px', color: '#a8a29e' }}>{catItems.length} items</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                    {catItems.map((item, i) => (
                      <ItemCard key={item.id} item={item} index={i}
                        onEdit={openEditItem} onDelete={deleteItem} onToggle={toggleAvailable} />
                    ))}
                  </div>
                </div>
              );
            })}
            {items.filter(i => i.name.toLowerCase().includes(search.toLowerCase())).length === 0 && (
              <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
                <p style={{ color: '#a8a29e', fontSize: '15px', margin: 0 }}>No items match your search</p>
              </div>
            )}
          </div>
        )}

        {/* ── GRID VIEW ── */}
        {viewMode === 'grid' && (
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '220px 1fr', gap: '16px' }}>

            {/* Categories sidebar */}
            <div style={{ ...card, padding: '12px', height: 'fit-content' }}>
              <span style={{ fontSize: '12px', color: '#a8a29e', textTransform: 'uppercase', letterSpacing: '0.05em', padding: '0 4px', display: 'block', marginBottom: '8px' }}>Categories</span>

              {/* All items option */}
              <div onClick={() => setActiveCategory('all')} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px', borderRadius: '10px', marginBottom: '2px',
                background: activeCategory === 'all' ? 'rgba(245,158,11,0.12)' : 'transparent',
                borderLeft: activeCategory === 'all' ? '3px solid #f59e0b' : '3px solid transparent',
                cursor: 'pointer', transition: 'all 0.15s'
              }}>
                <div>
                  <p style={{ fontSize: '14px', color: activeCategory === 'all' ? '#f59e0b' : '#fef3c7', margin: 0, fontWeight: activeCategory === 'all' ? '600' : '400' }}>All Items</p>
                  <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>{items.length} items</p>
                </div>
              </div>

              {categories.map(cat => {
                const count = items.filter(i => i.category_id === cat.id).length;
                const active = activeCategory === cat.id;
                return (
                  <div key={cat.id} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px', borderRadius: '10px', marginBottom: '2px',
                    background: active ? 'rgba(245,158,11,0.12)' : 'transparent',
                    borderLeft: active ? '3px solid #f59e0b' : '3px solid transparent',
                    cursor: 'pointer', transition: 'all 0.15s'
                  }} onClick={() => setActiveCategory(cat.id)}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', color: active ? '#f59e0b' : '#fef3c7', margin: 0, fontWeight: active ? '600' : '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{cat.name}</p>
                      <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>{count} items</p>
                    </div>
                    <div style={{ display: 'flex', gap: '2px', flexShrink: 0 }}>
                      <button onClick={e => { e.stopPropagation(); openEditCat(cat); }} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: '4px' }}><Pencil size={13} /></button>
                      <button onClick={e => { e.stopPropagation(); deleteCat(cat); }} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: '4px' }}><Trash2 size={13} /></button>
                    </div>
                  </div>
                );
              })}

              <button onClick={openAddCat} style={{
                width: '100%', marginTop: '8px', padding: '10px', borderRadius: '10px',
                background: 'rgba(245,158,11,0.08)', border: '1px dashed rgba(245,158,11,0.3)',
                color: '#f59e0b', cursor: 'pointer', fontSize: '13px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                fontFamily: 'Inter, sans-serif'
              }}>
                <Plus size={14} /> Add Category
              </button>
            </div>

            {/* Items grid */}
            <div>
              {filtered.length === 0 ? (
                <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
                  <UtensilsCrossed size={40} style={{ color: '#44403c', marginBottom: '12px' }} />
                  <p style={{ color: '#a8a29e', fontSize: '15px', margin: '0 0 16px' }}>
                    {search ? 'No items match your search' : 'No items in this category yet'}
                  </p>
                  <Btn onClick={openAddItem}><Plus size={16} /> Add First Item</Btn>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
                  <AnimatePresence>
                    {filtered.map((item, i) => (
                      <ItemCard key={item.id} item={item} index={i}
                        onEdit={openEditItem} onDelete={deleteItem} onToggle={toggleAvailable} />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Category Modal */}
      <AnimatePresence>
        {showCatModal && (
          <Modal title={editingCat ? 'Edit Category' : 'Add Category'} onClose={() => setShowCatModal(false)}>
            <Input label="Category Name" value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} placeholder="e.g. Mezze" />
            <Input label="Display Order" type="number" value={catForm.display_order} onChange={e => setCatForm({ ...catForm, display_order: e.target.value })} placeholder="1" />
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <Btn onClick={saveCat}><Check size={16} /> {editingCat ? 'Update' : 'Add'}</Btn>
              <Btn onClick={() => setShowCatModal(false)} variant="ghost">Cancel</Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Item Modal */}
      <AnimatePresence>
        {showItemModal && (
          <Modal title={editingItem ? 'Edit Menu Item' : 'Add Menu Item'} onClose={() => setShowItemModal(false)}>
            <Input label="Item Name" value={itemForm.name} onChange={e => setItemForm({ ...itemForm, name: e.target.value })} placeholder="e.g. Hummus" />
            <Textarea label="Description" value={itemForm.description} onChange={e => setItemForm({ ...itemForm, description: e.target.value })} placeholder="Short description..." />
            <Input label="Price ($)" type="number" step="0.01" value={itemForm.price} onChange={e => setItemForm({ ...itemForm, price: e.target.value })} placeholder="0.00" />
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</label>
              <select value={itemForm.category_id} onChange={e => setItemForm({ ...itemForm, category_id: parseInt(e.target.value) })}
                style={{
                  width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
                  border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                }}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <button onClick={() => setItemForm({ ...itemForm, is_available: !itemForm.is_available })} style={{
                width: '42px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: itemForm.is_available ? 'rgba(34,197,94,0.3)' : 'rgba(68,64,60,0.5)',
                position: 'relative', transition: 'all 0.2s', padding: 0
              }}>
                <div style={{
                  width: '16px', height: '16px', borderRadius: '50%',
                  background: itemForm.is_available ? '#22c55e' : '#44403c',
                  position: 'absolute', top: '4px',
                  left: itemForm.is_available ? '22px' : '4px', transition: 'all 0.2s'
                }} />
              </button>
              <span style={{ fontSize: '14px', color: '#fef3c7' }}>Available for ordering</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Btn onClick={saveItem}><Check size={16} /> {editingItem ? 'Update' : 'Add Item'}</Btn>
              <Btn onClick={() => setShowItemModal(false)} variant="ghost">Cancel</Btn>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}