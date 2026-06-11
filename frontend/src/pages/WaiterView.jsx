import { useState, useEffect, } from 'react';
import { motion} from 'framer-motion';
import {
  UtensilsCrossed, LogOut, ShoppingBag,
  Table2, Plus,  X, Check,
   CheckCircle, Send,
  Printer, Split,  Sparkles,
  FileText
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  pending: { color: '#f59e0b', label: 'Pending' },
  preparing: { color: '#a78bfa', label: 'Preparing' },
  ready: { color: '#22c55e', label: 'Ready' },
  served: { color: '#a8a29e', label: 'Served' },
  cancelled: { color: '#f43f5e', label: 'Cancelled' },
};

const tableStatus = {
  free: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)' },
  occupied: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)' },
  bill_requested: { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)' },
};

// ── Receipt component ─────────────────────────────────────────────────────────
const Receipt = ({ order, tip, restaurantName, waiterName, onClose }) => {
  const total = parseFloat(order.final_total || order.total);
  const tipAmount = parseFloat(tip) || 0;
  const grandTotal = total + tipAmount;

  const print = () => window.print();

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', padding: '24px',
        width: '100%', maxWidth: '320px', fontFamily: 'monospace'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', margin: '0 0 4px', color: '#1c1917' }}>{restaurantName}</h2>
          <p style={{ fontSize: '12px', color: '#666', margin: 0 }}>Table {order.table_number} · {waiterName}</p>
          <p style={{ fontSize: '11px', color: '#999', margin: '4px 0 0' }}>
            {new Date().toLocaleString('en-GB')}
          </p>
        </div>

        <div style={{ borderTop: '1px dashed #ddd', borderBottom: '1px dashed #ddd', padding: '12px 0', marginBottom: '12px' }}>
          {order.items?.map(item => (
            <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px', color: '#1c1917' }}>
              <span>{item.quantity}x {item.item_name}</span>
              <span>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '13px', color: '#1c1917' }}>
          {order.discount_percent > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Discount ({order.discount_percent}%)</span>
              <span>-${parseFloat(order.discount_amount).toFixed(2)}</span>
            </div>
          )}
          {tipAmount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Tip</span>
              <span>${tipAmount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', fontSize: '16px', borderTop: '1px dashed #ddd', paddingTop: '8px', marginTop: '4px' }}>
            <span>TOTAL</span>
            <span>${grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '12px', color: '#999', margin: '16px 0 0' }}>Thank you for dining with us!</p>

        <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
          <button onClick={print} style={{
            flex: 1, padding: '10px', background: '#1c1917', border: 'none',
            borderRadius: '8px', color: '#fff', cursor: 'pointer', fontSize: '13px', fontWeight: '600'
          }}>Print</button>
          <button onClick={onClose} style={{
            flex: 1, padding: '10px', background: '#f5f5f5', border: 'none',
            borderRadius: '8px', color: '#666', cursor: 'pointer', fontSize: '13px'
          }}>Close</button>
        </div>
      </div>
    </div>
  );
};

// ── Split Bill Modal ──────────────────────────────────────────────────────────
const SplitBillModal = ({ order, onClose }) => {
  const [mode, setMode] = useState('equal'); // 'equal' | 'byItem'
  const [people, setPeople] = useState(2);
  const [assignments, setAssignments] = useState({});
  const total = parseFloat(order.final_total || order.total);

  const assignItem = (itemId, person) => {
    setAssignments(prev => ({ ...prev, [itemId]: person }));
  };

  const getPersonTotal = (person) => {
    return order.items?.filter(i => assignments[i.id] === person)
      .reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0) || 0;
  };

 

  const assignedTotal = mode === 'byItem'
    ? Object.keys(assignments).reduce((s, id) => {
      const item = order.items?.find(i => i.id === parseInt(id));
      return s + (item ? parseFloat(item.price) * item.quantity : 0);
    }, 0)
    : total;

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 200, display: 'flex', alignItems: 'flex-start',
      justifyContent: 'center', padding: '16px', overflowY: 'auto'
    }}>
      <motion.div onClick={e => e.stopPropagation()}
        initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{
          background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px', margin: 'auto'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: 0 }}>Split Bill</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><X size={20} /></button>
        </div>

        {/* Mode selector */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          {[['equal', 'Equal Split'], ['byItem', 'By Items']].map(([m, l]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '10px', borderRadius: '10px', cursor: 'pointer',
              background: mode === m ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(68,64,60,0.4)',
              color: mode === m ? '#1c1917' : '#a8a29e',
              border: 'none', fontSize: '13px', fontWeight: mode === m ? '600' : '400',
              fontFamily: 'Inter, sans-serif'
            }}>{l}</button>
          ))}
        </div>

        {mode === 'equal' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginBottom: '20px' }}>
              <button onClick={() => setPeople(Math.max(2, people - 1))} style={{
                width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                background: 'rgba(68,64,60,0.5)', color: '#fef3c7', cursor: 'pointer', fontSize: '18px'
              }}>-</button>
              <span style={{ fontSize: '32px', fontWeight: '700', color: '#fef3c7', fontFamily: 'JetBrains Mono,monospace' }}>{people}</span>
              <button onClick={() => setPeople(people + 1)} style={{
                width: '36px', height: '36px', borderRadius: '50%', border: 'none',
                background: 'rgba(68,64,60,0.5)', color: '#fef3c7', cursor: 'pointer', fontSize: '18px'
              }}>+</button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '14px', color: '#a8a29e', marginBottom: '16px' }}>
              Each person pays: <span style={{ color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace', fontSize: '18px', fontWeight: '700' }}>
                ${(total / people).toFixed(2)}
              </span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {Array.from({ length: people }).map((_, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 14px', background: 'rgba(28,25,23,0.6)', borderRadius: '10px'
                }}>
                  <span style={{ fontSize: '13px', color: '#fef3c7' }}>Person {i + 1}</span>
                  <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>${(total / people).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {mode === 'byItem' && (
          <div>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {Array.from({ length: people }).map((_, i) => (
                <span key={i} style={{
                  padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                  background: `hsl(${i * 60}, 70%, 20%)`, color: `hsl(${i * 60}, 70%, 70%)`
                }}>Person {i + 1}: ${getPersonTotal(i + 1).toFixed(2)}</span>
              ))}
              <button onClick={() => setPeople(people + 1)} style={{
                padding: '4px 10px', borderRadius: '20px', fontSize: '12px',
                background: 'rgba(68,64,60,0.4)', color: '#a8a29e', border: 'none', cursor: 'pointer'
              }}>+ Add Person</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '300px', overflowY: 'auto' }}>
              {order.items?.map(item => (
                <div key={item.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 12px', background: 'rgba(28,25,23,0.6)', borderRadius: '10px'
                }}>
                  <div>
                    <p style={{ fontSize: '13px', color: '#fef3c7', margin: '0 0 2px' }}>{item.quantity}x {item.item_name}</p>
                    <p style={{ fontSize: '12px', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {Array.from({ length: people }).map((_, i) => (
                      <button key={i} onClick={() => assignItem(item.id, i + 1)} style={{
                        width: '28px', height: '28px', borderRadius: '50%', border: 'none', cursor: 'pointer',
                        background: assignments[item.id] === i + 1 ? `hsl(${i * 60}, 70%, 40%)` : 'rgba(68,64,60,0.5)',
                        color: assignments[item.id] === i + 1 ? '#fff' : '#a8a29e',
                        fontSize: '12px', fontWeight: '600'
                      }}>{i + 1}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Validation */}
            <div style={{ marginTop: '12px', padding: '10px', background: 'rgba(28,25,23,0.6)', borderRadius: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '12px', color: '#a8a29e' }}>Assigned</span>
                <span style={{ fontSize: '12px', color: assignedTotal === total ? '#22c55e' : '#f43f5e', fontFamily: 'JetBrains Mono,monospace' }}>
                  ${assignedTotal.toFixed(2)} / ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        )}

        <button onClick={onClose} style={{
          width: '100%', marginTop: '16px', padding: '12px', borderRadius: '10px', border: 'none',
          background: 'linear-gradient(135deg,#f59e0b,#d97706)',
          color: '#1c1917', fontWeight: '600', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
        }}>Done</button>
      </motion.div>
    </div>
  );
};

// ── AI Suggestions Modal ──────────────────────────────────────────────────────
const AISuggestionsModal = ({ currentOrder, onAdd, onClose }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.post('/ai/suggest', { current_order: currentOrder });
        setSuggestions(res.data.suggestions);
      } catch { toast.error('AI unavailable'); onClose(); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const toggle = (s) => {
    setSelected(prev => prev.find(p => p.menu_item_id === s.menu_item_id)
      ? prev.filter(p => p.menu_item_id !== s.menu_item_id)
      : [...prev, s]
    );
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <motion.div initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{
          background: '#292524', border: '1px solid rgba(245,158,11,0.3)',
          borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '400px'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} style={{ color: '#f59e0b' }} />
            <h2 style={{ fontSize: '18px', color: '#fef3c7', margin: 0, fontFamily: "'Playfair Display',serif" }}>AI Suggestions</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><X size={18} /></button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '32px', color: '#a8a29e' }}>
            <div style={{ fontSize: '14px' }}>Analyzing order...</div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 16px' }}>Select items to add to the order:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              {suggestions.map(s => {
                const isSelected = selected.find(p => p.menu_item_id === s.menu_item_id);
                return (
                  <motion.div key={s.menu_item_id} whileHover={{ scale: 1.02 }} onClick={() => toggle(s)}
                    style={{
                      padding: '12px 14px', borderRadius: '12px', cursor: 'pointer',
                      background: isSelected ? 'rgba(245,158,11,0.15)' : 'rgba(28,25,23,0.6)',
                      border: `1px solid ${isSelected ? 'rgba(245,158,11,0.4)' : 'rgba(68,64,60,0.4)'}`,
                      transition: 'all 0.15s'
                    }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <p style={{ fontSize: '14px', color: '#fef3c7', margin: '0 0 3px', fontWeight: '600' }}>{s.name}</p>
                        <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{s.reason}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '14px', color: '#f59e0b', margin: '0 0 4px', fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(s.price).toFixed(2)}</p>
                        {isSelected && <Check size={16} style={{ color: '#f59e0b' }} />}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => { onAdd(selected); onClose(); }} disabled={selected.length === 0}
                style={{
                  flex: 1, padding: '11px', borderRadius: '10px', border: 'none',
                  background: selected.length > 0 ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(68,64,60,0.4)',
                  color: selected.length > 0 ? '#1c1917' : '#a8a29e',
                  cursor: selected.length > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif'
                }}>Add {selected.length > 0 ? `(${selected.length})` : ''}</button>
              <button onClick={onClose} style={{
                flex: 1, padding: '11px', borderRadius: '10px',
                background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
                color: '#a8a29e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
              }}>Skip</button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

// ── Main Waiter View ──────────────────────────────────────────────────────────
export default function WaiterView() {
  const { user, logout } = useAuth();
  const { socketRef, socketReady } = useSocket();
  const navigate = useNavigate();

  const [view, setView] = useState('tables'); // 'tables' | 'order' | 'activeOrder'
  const [tables, setTables] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [activeOrder, setActiveOrder] = useState(null);
  const [activeCategory, setActiveCategory] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [orderNotes, setOrderNotes] = useState('');
  const [ setIsMobile] = useState(window.innerWidth < 768);

  // Modals
  const [showAI, setShowAI] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showSplit, setShowSplit] = useState(false);
  const [tip, setTip] = useState('');

  useEffect(() => {
    fetchAll();
    const r = () => setIsMobile(window.innerWidth < 768);
window.addEventListener('resize', r);
return () => window.removeEventListener('resize', r);
  }, []);

  

  const fetchAll = async () => {
    try {
      const [t, c, m, o] = await Promise.all([
        api.get('/tables'),
        api.get('/categories'),
        api.get('/menu'),
        api.get('/orders'),
      ]);
      setTables(t.data);
      setCategories(c.data);
      setMenuItems(m.data);
      setMyOrders(o.data.filter(ord => ord.waiter_id === user.id));
      if (c.data.length > 0) setActiveCategory(c.data[0].id);
    } catch { toast.error('Failed to load data'); }
  };

  const fetchMyOrders = async () => {
    try {
      const res = await api.get('/orders');
      setMyOrders(res.data.filter(ord => ord.waiter_id === user.id));
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;
    socket.on('order_status_changed', fetchMyOrders);
    socket.on('order_updated', fetchMyOrders);
    return () => {
      socket.off('order_status_changed', fetchMyOrders);
      socket.off('order_updated', fetchMyOrders);
    };
  }, [socketReady]);

  const selectTable = async (table) => {
    setSelectedTable(table);
    if (table.status === 'free') {
      setCartItems([]);
      setOrderNotes('');
      setView('order');
    } else {
      // Find active order for this table
      const active = myOrders.find(o => o.table_id === table.id && ['pending', 'preparing', 'ready'].includes(o.status));
      if (active) {
        const res = await api.get(`/orders/${active.id}`);
        setActiveOrder(res.data);
        setView('activeOrder');
      } else {
        setCartItems([]);
        setView('order');
      }
    }
  };

  const addToCart = (item) => {
    const existing = cartItems.find(i => i.menu_item_id === item.id);
    if (existing) {
      setCartItems(cartItems.map(i => i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCartItems([...cartItems, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1, notes: '' }]);
    }
  };

  const removeFromCart = (menu_item_id) => setCartItems(cartItems.filter(i => i.menu_item_id !== menu_item_id));
  const updateCartQty = (menu_item_id, qty) => {
    if (qty < 1) return removeFromCart(menu_item_id);
    setCartItems(cartItems.map(i => i.menu_item_id === menu_item_id ? { ...i, quantity: qty } : i));
  };
  const updateCartNotes = (menu_item_id, notes) => {
    setCartItems(cartItems.map(i => i.menu_item_id === menu_item_id ? { ...i, notes } : i));
  };

  const cartTotal = cartItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);

  const sendOrder = async () => {
    if (cartItems.length === 0) return toast.error('Add items first');
    try {
      await api.post('/orders', {
        table_id: selectedTable.id,
        notes: orderNotes,
        items: cartItems.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity, notes: i.notes }))
      });
      toast.success('Order sent to kitchen!');
      setCartItems([]);
      setOrderNotes('');
      fetchAll();
      setView('tables');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const addMoreItems = async () => {
    if (cartItems.length === 0) return toast.error('Add items first');
    try {
      await api.post(`/orders/${activeOrder.id}/items`, {
        items: cartItems.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity, notes: i.notes }))
      });
      toast.success('Items added to order');
      setCartItems([]);
      const res = await api.get(`/orders/${activeOrder.id}`);
      setActiveOrder(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const cancelItem = async (itemId) => {
    try {
      await api.delete(`/orders/${activeOrder.id}/items/${itemId}`);
      toast.success('Item cancelled');
      const res = await api.get(`/orders/${activeOrder.id}`);
      setActiveOrder(res.data);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const requestBill = async () => {
    try {
      await api.put(`/orders/${activeOrder.id}/request-bill`);
      toast.success('Bill requested');
      const res = await api.get(`/orders/${activeOrder.id}`);
      setActiveOrder(res.data);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const addTip = async () => {
    if (!tip || parseFloat(tip) < 0) return toast.error('Enter a valid tip amount');
    try {
      await api.put(`/orders/${activeOrder.id}/tip`, { tip: parseFloat(tip) });
      toast.success('Tip added');
      const res = await api.get(`/orders/${activeOrder.id}`);
      setActiveOrder(res.data);
    } catch { toast.error('Failed'); }
  };

  const markServed = async () => {
    try {
      await api.put(`/orders/${activeOrder.id}/status`, { status: 'served' });
      toast.success('Table marked as served');
      setView('tables');
      setActiveOrder(null);
      fetchAll();
    } catch { toast.error('Failed'); }
  };

  const addAISuggestions = (suggestions) => {
    suggestions.forEach(s => {
      const existing = cartItems.find(i => i.menu_item_id === s.menu_item_id);
      if (existing) {
        setCartItems(prev => prev.map(i => i.menu_item_id === s.menu_item_id ? { ...i, quantity: i.quantity + 1 } : i));
      } else {
        setCartItems(prev => [...prev, { menu_item_id: s.menu_item_id, name: s.name, price: s.price, quantity: 1, notes: '' }]);
      }
    });
  };

  const catItems = menuItems.filter(i => i.category_id === activeCategory && i.is_available);
  const myActiveOrders = myOrders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status));

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>

      {/* Top bar */}
      <div style={{
        background: 'rgba(41,37,36,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245,158,11,0.15)',
        padding: '0 16px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '56px',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UtensilsCrossed size={16} color="#1c1917" />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '18px', color: '#fef3c7', fontWeight: '700' }}>Tawla</span>
          <span style={{ fontSize: '12px', color: '#a8a29e' }}>· {user?.name}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {myActiveOrders.length > 0 && (
            <span style={{
              background: 'rgba(245,158,11,0.2)', color: '#f59e0b',
              padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'
            }}>{myActiveOrders.length} active</span>
          )}
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '8px', padding: '6px 10px', color: '#f43f5e',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px'
          }}><LogOut size={14} /></button>
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
        background: 'rgba(41,37,36,0.97)', backdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(245,158,11,0.15)',
        display: 'flex', justifyContent: 'space-around',
        padding: '8px 0 max(8px, env(safe-area-inset-bottom))'
      }}>
        {[
          { label: 'Tables', icon: Table2, v: 'tables' },
          { label: 'My Orders', icon: ShoppingBag, v: 'myOrders' },
        ].map(item => {
          const Icon = item.icon;
          const active = view === item.v;
          return (
            <button key={item.v} onClick={() => setView(item.v)} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '3px', background: 'none', border: 'none',
              color: active ? '#f59e0b' : '#a8a29e', cursor: 'pointer', padding: '4px 24px'
            }}>
              <Icon size={22} />
              <span style={{ fontSize: '10px' }}>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '16px 16px 100px' }}>

        {/* ── TABLES VIEW ── */}
        {view === 'tables' && (
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '24px', color: '#fef3c7', margin: '0 0 16px', fontWeight: '700' }}>Tables</h1>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
              {tables.map(table => {
                const cfg = tableStatus[table.status];
                const myOrder = myOrders.find(o => o.table_id === table.id && ['pending', 'preparing', 'ready'].includes(o.status));
                return (
                  <motion.div key={table.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                    onClick={() => selectTable(table)}
                    style={{
                      background: cfg.bg, border: `2px solid ${myOrder ? '#f59e0b' : cfg.border}`,
                      borderRadius: '14px', padding: '16px 8px',
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
                      cursor: 'pointer',
                      boxShadow: myOrder ? '0 0 16px rgba(245,158,11,0.3)' : 'none'
                    }}>
                    <span style={{ fontSize: '24px', fontWeight: '800', color: cfg.color, fontFamily: 'JetBrains Mono,monospace' }}>{table.number}</span>
                    <span style={{ fontSize: '10px', color: cfg.color, fontWeight: '600', textTransform: 'uppercase' }}>
                      {table.status === 'bill_requested' ? 'Bill' : table.status}
                    </span>
                    {myOrder && <span style={{ fontSize: '9px', color: '#f59e0b', fontWeight: '700' }}>MY ORDER</span>}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── MY ORDERS VIEW ── */}
        {view === 'myOrders' && (
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '24px', color: '#fef3c7', margin: '0 0 16px', fontWeight: '700' }}>My Orders</h1>
            {myOrders.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px', color: '#a8a29e' }}>No orders yet today</div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {myOrders.map(order => {
                  const cfg = statusConfig[order.status];
                  return (
                    <motion.div key={order.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
                        borderRadius: '14px', padding: '14px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                      }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7' }}>Table {order.table_number}</span>
                          <span style={{
                            fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                            background: `${cfg?.color}20`, color: cfg?.color, fontWeight: '600'
                          }}>{cfg?.label}</span>
                        </div>
                        <span style={{ fontSize: '12px', color: '#a8a29e' }}>
                          {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                        ${parseFloat(order.final_total || order.total).toFixed(2)}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── NEW ORDER VIEW ── */}
        {view === 'order' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button onClick={() => setView('tables')} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: 0 }}>
                ← Back
              </button>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#fef3c7', margin: 0, fontWeight: '700' }}>
                Table {selectedTable?.number}
              </h1>
            </div>

            {/* Categories */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '14px', overflowX: 'auto', paddingBottom: '4px' }}>
              {categories.map(c => (
                <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
                  padding: '7px 14px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
                  background: activeCategory === c.id ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(41,37,36,0.8)',
                  color: activeCategory === c.id ? '#1c1917' : '#a8a29e',
                  border: activeCategory === c.id ? 'none' : '1px solid #44403c',
                  fontSize: '13px', fontWeight: activeCategory === c.id ? '600' : '400',
                  fontFamily: 'Inter, sans-serif', flexShrink: 0
                }}>{c.name}</button>
              ))}
            </div>

            {/* Menu items */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))', gap: '8px', marginBottom: '16px' }}>
              {catItems.map(item => (
                <motion.button key={item.id} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => addToCart(item)} style={{
                    padding: '12px', borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                    background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                  <p style={{ fontSize: '13px', color: '#fef3c7', margin: '0 0 4px', fontWeight: '500' }}>{item.name}</p>
                  <p style={{ fontSize: '13px', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(item.price).toFixed(2)}</p>
                </motion.button>
              ))}
            </div>

            {/* Cart */}
            {cartItems.length > 0 && (
              <div style={{
                background: 'rgba(41,37,36,0.9)', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '16px', padding: '16px', marginBottom: '12px'
              }}>
                <h3 style={{ fontSize: '14px', color: '#fef3c7', margin: '0 0 12px', fontWeight: '600' }}>Order Summary</h3>
                {cartItems.map(item => (
                  <div key={item.menu_item_id} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <button onClick={() => updateCartQty(item.menu_item_id, item.quantity - 1)} style={{ background: 'rgba(68,64,60,0.5)', border: 'none', borderRadius: '4px', color: '#fef3c7', cursor: 'pointer', width: '24px', height: '24px' }}>-</button>
                      <span style={{ fontSize: '13px', color: '#fef3c7', flex: 1 }}>{item.name}</span>
                      <span style={{ fontSize: '13px', color: '#a8a29e', fontFamily: 'JetBrains Mono,monospace' }}>x{item.quantity}</span>
                      <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      <button onClick={() => updateCartQty(item.menu_item_id, item.quantity + 1)} style={{ background: 'rgba(68,64,60,0.5)', border: 'none', borderRadius: '4px', color: '#fef3c7', cursor: 'pointer', width: '24px', height: '24px' }}>+</button>
                      <button onClick={() => removeFromCart(item.menu_item_id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }}><X size={14} /></button>
                    </div>
                    <input value={item.notes} onChange={e => updateCartNotes(item.menu_item_id, e.target.value)}
                      placeholder="Note for kitchen (e.g. no onions)..."
                      style={{
                        width: '100%', padding: '6px 10px', background: 'rgba(28,25,23,0.8)',
                        border: '1px solid #44403c', borderRadius: '8px', color: '#fef3c7',
                        fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                      }} />
                  </div>
                ))}

                <div style={{ borderTop: '1px solid rgba(68,64,60,0.4)', paddingTop: '10px', marginTop: '10px' }}>
                  <input value={orderNotes} onChange={e => setOrderNotes(e.target.value)}
                    placeholder="General order notes..."
                    style={{
                      width: '100%', padding: '8px 10px', background: 'rgba(28,25,23,0.8)',
                      border: '1px solid #44403c', borderRadius: '8px', color: '#fef3c7',
                      fontSize: '12px', outline: 'none', boxSizing: 'border-box',
                      fontFamily: 'Inter, sans-serif', marginBottom: '10px'
                    }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <span style={{ fontSize: '15px', color: '#fef3c7', fontWeight: '600' }}>Total</span>
                    <span style={{ fontSize: '18px', color: '#f59e0b', fontWeight: '700', fontFamily: 'JetBrains Mono,monospace' }}>${cartTotal.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setShowAI(true)} style={{
                      padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)',
                      background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                      cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px',
                      fontFamily: 'Inter, sans-serif'
                    }}><Sparkles size={14} /> AI</button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={sendOrder}
                      style={{
                        flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                        background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                        color: '#1c1917', fontWeight: '600', cursor: 'pointer',
                        fontSize: '14px', fontFamily: 'Inter, sans-serif',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                      }}><Send size={15} /> Send to Kitchen</motion.button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIVE ORDER VIEW ── */}
        {view === 'activeOrder' && activeOrder && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button onClick={() => setView('tables')} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: 0 }}>
                ← Back
              </button>
              <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#fef3c7', margin: 0, fontWeight: '700' }}>
                Table {activeOrder.table_number}
              </h1>
              <span style={{
                fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
                background: `${statusConfig[activeOrder.status]?.color}20`,
                color: statusConfig[activeOrder.status]?.color, fontWeight: '600'
              }}>{statusConfig[activeOrder.status]?.label}</span>
            </div>

            {/* Order items */}
            <div style={{
              background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
              borderRadius: '16px', padding: '16px', marginBottom: '12px'
            }}>
              <h3 style={{ fontSize: '14px', color: '#fef3c7', margin: '0 0 12px', fontWeight: '600' }}>Current Order</h3>
              {activeOrder.items?.map(item => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(68,64,60,0.3)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      width: '22px', height: '22px', borderRadius: '6px',
                      background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: '700', flexShrink: 0
                    }}>{item.quantity}</span>
                    <div>
                      <p style={{ fontSize: '13px', color: '#fef3c7', margin: 0 }}>{item.item_name}</p>
                      {item.notes && <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>{item.notes}</p>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                    <span style={{
                      fontSize: '10px', padding: '2px 6px', borderRadius: '10px',
                      background: `${statusConfig[item.status]?.color}20`,
                      color: statusConfig[item.status]?.color
                    }}>{statusConfig[item.status]?.label}</span>
                    {item.status === 'pending' && (
                      <button onClick={() => cancelItem(item.id)} style={{
                        background: 'rgba(244,63,94,0.1)', border: 'none', borderRadius: '6px',
                        padding: '4px', color: '#f43f5e', cursor: 'pointer'
                      }}><X size={12} /></button>
                    )}
                  </div>
                </div>
              ))}

              {/* Totals */}
              <div style={{ paddingTop: '10px', marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span style={{ fontSize: '13px', color: '#a8a29e' }}>Subtotal</span>
                  <span style={{ fontSize: '13px', color: '#fef3c7', fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(activeOrder.total).toFixed(2)}</span>
                </div>
                {activeOrder.discount_percent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#22c55e' }}>Discount ({activeOrder.discount_percent}%)</span>
                    <span style={{ fontSize: '13px', color: '#22c55e', fontFamily: 'JetBrains Mono,monospace' }}>-${parseFloat(activeOrder.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                {activeOrder.tip > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ fontSize: '13px', color: '#a8a29e' }}>Tip</span>
                    <span style={{ fontSize: '13px', color: '#fef3c7', fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(activeOrder.tip).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(68,64,60,0.4)' }}>
                  <span style={{ fontSize: '16px', color: '#fef3c7', fontWeight: '700' }}>Total</span>
                  <span style={{ fontSize: '18px', color: '#f59e0b', fontWeight: '700', fontFamily: 'JetBrains Mono,monospace' }}>
                    ${(parseFloat(activeOrder.final_total || activeOrder.total) + parseFloat(activeOrder.tip || 0)).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Add tip */}
            <div style={{
              background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
              borderRadius: '16px', padding: '16px', marginBottom: '12px'
            }}>
              <h3 style={{ fontSize: '14px', color: '#fef3c7', margin: '0 0 10px', fontWeight: '600' }}>Add Tip</h3>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                {[5, 10, 15, 20].map(pct => {
                  const amount = (parseFloat(activeOrder.final_total || activeOrder.total) * pct / 100).toFixed(2);
                  return (
                    <button key={pct} onClick={() => setTip(amount)} style={{
                      flex: 1, padding: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                      background: tip === amount ? 'rgba(245,158,11,0.2)' : 'rgba(68,64,60,0.4)',
                      color: tip === amount ? '#f59e0b' : '#a8a29e',
                      fontSize: '12px', fontFamily: 'Inter, sans-serif'
                    }}>{pct}%<br /><span style={{ fontFamily: 'JetBrains Mono,monospace' }}>${amount}</span></button>
                  );
                })}
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input type="number" value={tip} onChange={e => setTip(e.target.value)} placeholder="Custom amount ($)"
                  style={{
                    flex: 1, padding: '10px 12px', background: 'rgba(28,25,23,0.9)',
                    border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                    fontSize: '14px', outline: 'none', fontFamily: 'JetBrains Mono,monospace'
                  }}
                  onFocus={e => e.target.style.borderColor = '#f59e0b'}
                  onBlur={e => e.target.style.borderColor = '#44403c'} />
                <button onClick={addTip} style={{
                  padding: '10px 16px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#1c1917', cursor: 'pointer', fontSize: '13px',
                  fontWeight: '600', fontFamily: 'Inter, sans-serif'
                }}>Add</button>
              </div>
            </div>

            {/* Add more items */}
            <div style={{
              background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
              borderRadius: '16px', padding: '16px', marginBottom: '12px'
            }}>
              <h3 style={{ fontSize: '14px', color: '#fef3c7', margin: '0 0 12px', fontWeight: '600' }}>Add More Items</h3>
              <div style={{ display: 'flex', gap: '6px', marginBottom: '10px', overflowX: 'auto', paddingBottom: '4px' }}>
                {categories.map(c => (
                  <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
                    padding: '6px 12px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
                    background: activeCategory === c.id ? 'rgba(245,158,11,0.2)' : 'rgba(68,64,60,0.4)',
                    color: activeCategory === c.id ? '#f59e0b' : '#a8a29e',
                    border: activeCategory === c.id ? '1px solid rgba(245,158,11,0.3)' : '1px solid #44403c',
                    fontSize: '12px', fontFamily: 'Inter, sans-serif', flexShrink: 0
                  }}>{c.name}</button>
                ))}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px,1fr))', gap: '6px', marginBottom: '10px' }}>
                {catItems.map(item => (
                  <button key={item.id} onClick={() => addToCart(item)} style={{
                    padding: '10px', borderRadius: '10px', cursor: 'pointer', textAlign: 'left',
                    background: 'rgba(28,25,23,0.8)', border: '1px solid #44403c',
                    fontFamily: 'Inter, sans-serif'
                  }}>
                    <p style={{ fontSize: '12px', color: '#fef3c7', margin: '0 0 2px', fontWeight: '500' }}>{item.name}</p>
                    <p style={{ fontSize: '12px', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(item.price).toFixed(2)}</p>
                  </button>
                ))}
              </div>
              {cartItems.length > 0 && (
                <div>
                  {cartItems.map(item => (
                    <div key={item.menu_item_id} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', color: '#fef3c7', flex: 1 }}>{item.name} x{item.quantity}</span>
                      <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
                      <button onClick={() => removeFromCart(item.menu_item_id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer' }}><X size={14} /></button>
                    </div>
                  ))}
                  <button onClick={addMoreItems} style={{
                    width: '100%', padding: '10px', borderRadius: '10px', border: 'none', marginTop: '8px',
                    background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                    color: '#1c1917', fontWeight: '600', cursor: 'pointer',
                    fontSize: '13px', fontFamily: 'Inter, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}><Plus size={14} /> Add to Order</button>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button onClick={requestBill} style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}><FileText size={16} /> Request Bill</button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setShowSplit(true)} style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(167,139,250,0.3)',
                  background: 'rgba(167,139,250,0.1)', color: '#a78bfa',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}><Split size={16} /> Split Bill</button>
                <button onClick={() => setShowReceipt(true)} style={{
                  flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.3)',
                  background: 'rgba(34,197,94,0.1)', color: '#22c55e',
                  fontSize: '14px', fontWeight: '600', cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}><Printer size={16} /> Print Receipt</button>
              </div>

              <button onClick={markServed} style={{
                width: '100%', padding: '12px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#22c55e,#16a34a)',
                color: '#fff', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
              }}><CheckCircle size={16} /> Mark as Served</button>
            </div>
          </div>
        )}
      </div>

      {/* AI Modal */}
      {showAI && (
        <AISuggestionsModal
          currentOrder={cartItems.map(i => ({ menu_item_id: i.menu_item_id, name: i.name, quantity: i.quantity, price: i.price }))}
          onAdd={addAISuggestions}
          onClose={() => setShowAI(false)}
        />
      )}

      {/* Receipt Modal */}
      {showReceipt && activeOrder && (
        <Receipt
          order={activeOrder}
          tip={tip}
          restaurantName={user?.restaurant_name}
          waiterName={user?.name}
          onClose={() => setShowReceipt(false)}
        />
      )}

      {/* Split Bill Modal */}
      {showSplit && activeOrder && (
        <SplitBillModal
          order={activeOrder}
          onClose={() => setShowSplit(false)}
        />
      )}
    </div>
  );
}