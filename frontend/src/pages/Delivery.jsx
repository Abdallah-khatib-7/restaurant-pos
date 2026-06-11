import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, Check,  Eye,
  Truck, MapPin, Phone, User, Clock,
  CheckCircle, XCircle
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FloatingNav, BottomNav } from './Dashboard';

const statusConfig = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Pending' },
  preparing: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', label: 'Preparing' },
  out_for_delivery: { color: '#fb923c', bg: 'rgba(251,146,60,0.15)', label: 'Out for Delivery' },
  delivered: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Delivered' },
  cancelled: { color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', label: 'Cancelled' },
};

const Badge = ({ status }) => {
  const cfg = statusConfig[status];
  return (
    <span style={{
      fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
      background: cfg?.bg, color: cfg?.color, fontWeight: '600'
    }}>{cfg?.label}</span>
  );
};

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

export default function Delivery() {
  const [orders, setOrders] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeCategory, setActiveCategory] = useState(null);
  const [orderItems, setOrderItems] = useState([]);

  const [form, setForm] = useState({
    customer_name: '', customer_phone: '', delivery_address: '', notes: '', driver_id: ''
  });

  useEffect(() => {
    fetchAll();
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const fetchAll = async () => {
    try {
      const [o, d, c, m] = await Promise.all([
        api.get('/delivery'),
        api.get('/delivery/drivers'),
        api.get('/categories'),
        api.get('/menu'),
      ]);
      setOrders(o.data);
      setDrivers(d.data);
      setCategories(c.data);
      setMenuItems(m.data);
      if (c.data.length > 0) setActiveCategory(c.data[0].id);
    } catch { toast.error('Failed to load delivery data'); }
  };

  const addItem = (item) => {
    const existing = orderItems.find(i => i.menu_item_id === item.id);
    if (existing) {
      setOrderItems(orderItems.map(i => i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setOrderItems([...orderItems, { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 }]);
    }
  };

  const removeItem = (menu_item_id) => {
    setOrderItems(orderItems.filter(i => i.menu_item_id !== menu_item_id));
  };

  const updateQty = (menu_item_id, qty) => {
    if (qty < 1) return removeItem(menu_item_id);
    setOrderItems(orderItems.map(i => i.menu_item_id === menu_item_id ? { ...i, quantity: qty } : i));
  };

  const foodTotal = orderItems.reduce((s, i) => s + parseFloat(i.price) * i.quantity, 0);
  const deliveryFee = foodTotal >= 60 ? 0 : 3;
  const total = foodTotal + deliveryFee;

  const createOrder = async () => {
    if (!form.customer_name.trim()) return toast.error('Customer name is required');
    if (!form.customer_phone.trim()) return toast.error('Customer phone is required');
    if (!form.delivery_address.trim()) return toast.error('Delivery address is required');
    if (orderItems.length === 0) return toast.error('Add at least one item');
    try {
      await api.post('/delivery', {
        ...form,
        driver_id: form.driver_id || null,
        items: orderItems.map(i => ({ menu_item_id: i.menu_item_id, quantity: i.quantity }))
      });
      toast.success('Delivery order created');
      setShowCreateModal(false);
      setForm({ customer_name: '', customer_phone: '', delivery_address: '', notes: '', driver_id: '' });
      setOrderItems([]);
      fetchAll();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const assignDriver = async (orderId, driverId) => {
    try {
      await api.put(`/delivery/${orderId}/assign`, { driver_id: driverId });
      toast.success('Driver assigned');
      setShowAssignModal(false);
      fetchAll();
    } catch { toast.error('Failed to assign driver'); }
  };

  const updateStatus = async (orderId, status) => {
    try {
      await api.put(`/delivery/${orderId}/status`, { status });
      toast.success('Status updated');
      fetchAll();
      if (selected?.id === orderId) setSelected(prev => ({ ...prev, status }));
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = orders.filter(o => filterStatus === 'all' || o.status === filterStatus);
  const catItems = menuItems.filter(i => i.category_id === activeCategory && i.is_available);

  const card = {
    background: 'rgba(41,37,36,0.8)',
    border: '1px solid rgba(245,158,11,0.12)',
    borderRadius: '16px'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>
      {!isMobile ? <FloatingNav /> : <BottomNav />}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '24px 24px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#fef3c7', margin: '0 0 4px', fontWeight: '700' }}>Delivery</h1>
            <p style={{ fontSize: '14px', color: '#a8a29e', margin: 0 }}>{orders.length} total orders · {drivers.length} drivers</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowCreateModal(true)} style={{
              padding: '11px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              color: '#1c1917', cursor: 'pointer', fontSize: '14px',
              fontWeight: '600', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
            <Plus size={16} /> New Delivery Order
          </motion.button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(130px,1fr))', gap: '10px', marginBottom: '20px' }}>
          {Object.entries(statusConfig).map(([key, val]) => (
            <div key={key} onClick={() => setFilterStatus(key)} style={{
              ...card, padding: '14px', cursor: 'pointer',
              border: filterStatus === key ? `1px solid ${val.color}40` : '1px solid rgba(245,158,11,0.12)'
            }}>
              <p style={{ fontSize: '22px', fontWeight: '700', color: val.color, margin: '0 0 2px', fontFamily: 'JetBrains Mono,monospace' }}>
                {orders.filter(o => o.status === key).length}
              </p>
              <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>{val.label}</p>
            </div>
          ))}
        </div>

        {/* Filter */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['all', ...Object.keys(statusConfig)].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} style={{
              padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
              background: filterStatus === s ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(41,37,36,0.8)',
              color: filterStatus === s ? '#1c1917' : '#a8a29e',
              fontSize: '12px', fontWeight: filterStatus === s ? '600' : '400',
              fontFamily: 'Inter, sans-serif',
              border: filterStatus === s ? 'none' : '1px solid #44403c'
            }}>{s === 'all' ? 'All' : statusConfig[s]?.label}</button>
          ))}
        </div>

        {/* Orders list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 && (
            <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
              <Truck size={40} style={{ color: '#44403c', marginBottom: '12px' }} />
              <p style={{ color: '#a8a29e', fontSize: '15px', margin: 0 }}>No delivery orders</p>
            </div>
          )}
          {filtered.map((order, i) => (
            <motion.div key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{ ...card, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '200px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(251,146,60,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <Truck size={20} style={{ color: '#fb923c' }} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7' }}>#{order.id} · {order.customer_name}</span>
                    <Badge status={order.status} />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '12px', color: '#a8a29e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <MapPin size={11} /> {order.delivery_address}
                    </span>
                    {order.driver_name && (
                      <span style={{ fontSize: '12px', color: '#22c55e', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Truck size={11} /> {order.driver_name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ textAlign: 'right' }}>
                  {order.delivery_fee === 0 && (
                    <p style={{ fontSize: '11px', color: '#22c55e', margin: '0 0 2px' }}>Free delivery</p>
                  )}
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>
                    ${parseFloat(order.total).toFixed(2)}
                  </p>
                </div>
                <button onClick={() => setSelected(order)} style={{
                  background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '8px', padding: '8px 14px', color: '#f59e0b',
                  cursor: 'pointer', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '5px',
                  fontFamily: 'Inter, sans-serif'
                }}><Eye size={14} /> View</button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selected && (
          <div onClick={() => setSelected(null)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 100, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', padding: '16px', overflowY: 'auto'
          }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
              style={{
                background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '520px', margin: 'auto'
              }}>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#fef3c7', margin: '0 0 4px' }}>
                    Order #{selected.id}
                  </h2>
                  <Badge status={selected.status} />
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Customer info */}
              {[
                [<User size={13} />, selected.customer_name],
                [<Phone size={13} />, selected.customer_phone],
                [<MapPin size={13} />, selected.delivery_address],
                selected.driver_name && [<Truck size={13} />, `${selected.driver_name} · ${selected.car_type || ''} ${selected.car_color || ''} · ${selected.plate_number || ''}`],
                [<Clock size={13} />, new Date(selected.created_at).toLocaleString('en-GB')],
              ].filter(Boolean).map(([icon, value], i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', padding: '8px 0', borderBottom: '1px solid rgba(68,64,60,0.3)' }}>
                  <span style={{ color: '#a8a29e', flexShrink: 0, marginTop: '1px' }}>{icon}</span>
                  <span style={{ fontSize: '13px', color: '#fef3c7' }}>{value}</span>
                </div>
              ))}

              {/* Items */}
              <div style={{ margin: '16px 0' }}>
                {selected.items?.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(68,64,60,0.2)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '22px', height: '22px', borderRadius: '6px',
                        background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '11px', fontWeight: '700'
                      }}>{item.quantity}</span>
                      <span style={{ fontSize: '13px', color: '#fef3c7' }}>{item.item_name}</span>
                    </div>
                    <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ background: 'rgba(28,25,23,0.6)', borderRadius: '10px', padding: '12px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#a8a29e' }}>Food total</span>
                  <span style={{ fontSize: '13px', color: '#fef3c7', fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(selected.food_total).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: selected.delivery_fee == 0 ? '#22c55e' : '#a8a29e' }}>
                    Delivery fee {selected.delivery_fee == 0 ? '(free!)' : ''}
                  </span>
                  <span style={{ fontSize: '13px', color: '#fef3c7', fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(selected.delivery_fee).toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(68,64,60,0.4)' }}>
                  <span style={{ fontSize: '15px', color: '#fef3c7', fontWeight: '600' }}>Total</span>
                  <span style={{ fontSize: '15px', color: '#f59e0b', fontWeight: '700', fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(selected.total).toFixed(2)}</span>
                </div>
              </div>

              {/* Assign driver */}
              {!['delivered', 'cancelled'].includes(selected.status) && (
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign Driver</p>
                  <select value={selected.driver_id || ''} onChange={e => assignDriver(selected.id, e.target.value)}
                    style={{
                      width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
                      border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                      fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif'
                    }}>
                    <option value="">— Select Driver —</option>
                    {drivers.map(d => (
                      <option key={d.id} value={d.id}>{d.name} · {d.car_type} {d.plate_number}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Status update */}
              {!['delivered', 'cancelled'].includes(selected.status) && (
                <div>
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(statusConfig).filter(([k]) => k !== selected.status).map(([key, val]) => (
                      <button key={key} onClick={() => updateStatus(selected.id, key)} style={{
                        padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                        background: val.bg, color: val.color,
                        border: `1px solid ${val.color}40`,
                        fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif'
                      }}>{val.label}</button>
                    ))}
                  </div>
                </div>
              )}

              {selected.delivered_at && (
                <p style={{ fontSize: '13px', color: '#22c55e', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={14} /> Delivered at {new Date(selected.delivered_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
              {selected.cancelled_at && (
                <p style={{ fontSize: '13px', color: '#f43f5e', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <XCircle size={14} /> Cancelled at {new Date(selected.cancelled_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Create Delivery Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <div onClick={() => setShowCreateModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 100, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', padding: '16px', overflowY: 'auto'
          }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              style={{
                background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '640px', margin: 'auto'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: 0 }}>New Delivery Order</h2>
                <button onClick={() => setShowCreateModal(false)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '0 16px' }}>
                <Input label="Customer Name" value={form.customer_name} onChange={e => setForm({ ...form, customer_name: e.target.value })} placeholder="e.g. Mohammad Ali" />
                <Input label="Phone Number" value={form.customer_phone} onChange={e => setForm({ ...form, customer_phone: e.target.value })} placeholder="e.g. 71234567" />
              </div>
              <Input label="Delivery Address" value={form.delivery_address} onChange={e => setForm({ ...form, delivery_address: e.target.value })} placeholder="Street, Building, Floor, Apartment" />

              {/* Driver selection */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Assign Driver (optional)</label>
                <select value={form.driver_id} onChange={e => setForm({ ...form, driver_id: e.target.value })}
                  style={{
                    width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
                    border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                    fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif'
                  }}>
                  <option value="">— Assign later —</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name} · {d.car_type}</option>)}
                </select>
              </div>

              {/* Menu */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Add Items</label>

                {/* Category tabs */}
                <div style={{ display: 'flex', gap: '4px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  {categories.map(c => (
                    <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
                      padding: '5px 12px', borderRadius: '20px', cursor: 'pointer', fontSize: '12px',
                      background: activeCategory === c.id ? 'rgba(245,158,11,0.2)' : 'rgba(68,64,60,0.4)',
                      color: activeCategory === c.id ? '#f59e0b' : '#a8a29e',
                      border: activeCategory === c.id ? '1px solid rgba(245,158,11,0.3)' : '1px solid #44403c',
                      fontFamily: 'Inter, sans-serif'
                    }}>{c.name}</button>
                  ))}
                </div>

                {/* Items grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px,1fr))', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
                  {catItems.map(item => (
                    <button key={item.id} onClick={() => addItem(item)} style={{
                      padding: '8px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                      background: 'rgba(28,25,23,0.8)', border: '1px solid #44403c',
                      fontFamily: 'Inter, sans-serif', transition: 'border 0.15s'
                    }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#f59e0b'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#44403c'}>
                      <p style={{ fontSize: '12px', color: '#fef3c7', margin: '0 0 2px', fontWeight: '500' }}>{item.name}</p>
                      <p style={{ fontSize: '12px', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(item.price).toFixed(2)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected items */}
              {orderItems.length > 0 && (
                <div style={{ background: 'rgba(28,25,23,0.6)', borderRadius: '10px', padding: '12px', marginBottom: '14px' }}>
                  {orderItems.map(item => (
                    <div key={item.menu_item_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
                      <span style={{ fontSize: '13px', color: '#fef3c7', flex: 1 }}>{item.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button onClick={() => updateQty(item.menu_item_id, item.quantity - 1)} style={{ background: 'rgba(68,64,60,0.5)', border: 'none', borderRadius: '4px', color: '#fef3c7', cursor: 'pointer', width: '22px', height: '22px' }}>-</button>
                        <span style={{ fontSize: '13px', color: '#fef3c7', minWidth: '20px', textAlign: 'center', fontFamily: 'JetBrains Mono,monospace' }}>{item.quantity}</span>
                        <button onClick={() => updateQty(item.menu_item_id, item.quantity + 1)} style={{ background: 'rgba(68,64,60,0.5)', border: 'none', borderRadius: '4px', color: '#fef3c7', cursor: 'pointer', width: '22px', height: '22px' }}>+</button>
                        <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace', minWidth: '50px', textAlign: 'right' }}>
                          ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </span>
                        <button onClick={() => removeItem(item.menu_item_id)} style={{ background: 'none', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: 0 }}>
                          <X size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                  <div style={{ borderTop: '1px solid rgba(68,64,60,0.4)', marginTop: '8px', paddingTop: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '13px', color: '#a8a29e' }}>
                      Delivery fee: <span style={{ color: deliveryFee === 0 ? '#22c55e' : '#fef3c7' }}>{deliveryFee === 0 ? 'Free!' : '$3.00'}</span>
                    </span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                      Total: ${total.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              <Input label="Notes (optional)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Special instructions..." />

              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={createOrder} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#1c1917', fontWeight: '600', cursor: 'pointer',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}><Check size={16} /> Create Order</motion.button>
                <button onClick={() => setShowCreateModal(false)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
                  color: '#a8a29e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
                }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}