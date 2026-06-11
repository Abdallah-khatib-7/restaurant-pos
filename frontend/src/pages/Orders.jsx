import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag, Clock, ChefHat, CheckCircle,
  XCircle, Eye, X, Search
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FloatingNav, BottomNav } from './Dashboard';

const statusConfig = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Pending', icon: Clock },
  preparing: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', label: 'Preparing', icon: ChefHat },
  ready: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Ready', icon: CheckCircle },
  served: { color: '#a8a29e', bg: 'rgba(168,162,158,0.15)', label: 'Served', icon: CheckCircle },
  cancelled: { color: '#f43f5e', bg: 'rgba(244,63,94,0.15)', label: 'Cancelled', icon: XCircle },
};

const Badge = ({ status }) => {
  const cfg = statusConfig[status];
  const Icon = cfg?.icon;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      fontSize: '11px', padding: '3px 8px', borderRadius: '20px',
      background: cfg?.bg, color: cfg?.color, fontWeight: '600'
    }}>
      {Icon && <Icon size={11} />} {cfg?.label}
    </span>
  );
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchOrders();
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get('/orders');
      setOrders(res.data);
    } catch { toast.error('Failed to load orders'); }
  };

  const fetchOrderDetail = async (order) => {
    try {
      const res = await api.get(`/orders/${order.id}`);
      setSelected(res.data);
    } catch { toast.error('Failed to load order details'); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      toast.success('Order status updated');
      fetchOrders();
      if (selected?.id === id) {
        setSelected(prev => ({ ...prev, status }));
      }
    } catch { toast.error('Failed to update status'); }
  };

  const filtered = orders.filter(o => {
    const matchSearch = o.waiter_name?.toLowerCase().includes(search.toLowerCase()) ||
      String(o.table_number).includes(search) ||
      String(o.id).includes(search);
    const matchStatus = filterStatus === 'all' || o.status === filterStatus;
    return matchSearch && matchStatus;
  });

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
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#fef3c7', margin: '0 0 4px', fontWeight: '700' }}>Orders</h1>
          <p style={{ fontSize: '14px', color: '#a8a29e', margin: 0 }}>{orders.length} total orders</p>
        </div>

        {/* Search + Filter */}
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by waiter, table, order ID..."
              style={{
                width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(41,37,36,0.8)',
                border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
              }}
              onFocus={e => e.target.style.borderColor = '#f59e0b'}
              onBlur={e => e.target.style.borderColor = '#44403c'} />
          </div>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {['all', ...Object.keys(statusConfig)].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '10px 14px', borderRadius: '10px', cursor: 'pointer',
                background: filterStatus === s ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(41,37,36,0.8)',
                color: filterStatus === s ? '#1c1917' : '#a8a29e',
                fontSize: '12px', fontWeight: filterStatus === s ? '600' : '400',
                fontFamily: 'Inter, sans-serif',
                border: filterStatus === s ? 'none' : '1px solid #44403c'
              }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
            ))}
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(120px,1fr))', gap: '10px', marginBottom: '20px' }}>
          {Object.entries(statusConfig).map(([key, val]) => {
            const count = orders.filter(o => o.status === key).length;
            return (
              <div key={key} style={{ ...card, padding: '14px', cursor: 'pointer' }} onClick={() => setFilterStatus(key)}>
                <p style={{ fontSize: '22px', fontWeight: '700', color: val.color, margin: '0 0 2px', fontFamily: 'JetBrains Mono,monospace' }}>{count}</p>
                <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>{val.label}</p>
              </div>
            );
          })}
        </div>

        {/* Orders list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 && (
            <div style={{ ...card, padding: '48px', textAlign: 'center' }}>
              <ShoppingBag size={40} style={{ color: '#44403c', marginBottom: '12px' }} />
              <p style={{ color: '#a8a29e', fontSize: '15px', margin: 0 }}>No orders found</p>
            </div>
          )}
          {filtered.map((order, i) => (
            <motion.div key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              style={{ ...card, padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>

              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: 'rgba(245,158,11,0.12)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0
                }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>T{order.table_number}</span>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7' }}>Order #{order.id}</span>
                    <Badge status={order.status} />
                  </div>
                  <p style={{ fontSize: '13px', color: '#a8a29e', margin: 0 }}>
                    {order.waiter_name} · {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })} · {new Date(order.created_at).toLocaleDateString('en-GB')}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ textAlign: 'right' }}>
                  {order.discount_percent > 0 && (
                    <p style={{ fontSize: '11px', color: '#22c55e', margin: '0 0 2px' }}>-{order.discount_percent}% off</p>
                  )}
                  <p style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>
                    ${parseFloat(order.final_total || order.total).toFixed(2)}
                  </p>
                </div>
                <button onClick={() => fetchOrderDetail(order)} style={{
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

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#fef3c7', margin: '0 0 4px' }}>
                    Order #{selected.id}
                  </h2>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Badge status={selected.status} />
                    <span style={{ fontSize: '13px', color: '#a8a29e' }}>Table {selected.table_number} · {selected.waiter_name}</span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {/* Items */}
              <div style={{ marginBottom: '16px' }}>
                {selected.items?.map(item => (
                  <div key={item.id} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 0', borderBottom: '1px solid rgba(68,64,60,0.3)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{
                        width: '24px', height: '24px', borderRadius: '6px',
                        background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '12px', fontWeight: '700', flexShrink: 0
                      }}>{item.quantity}</span>
                      <span style={{ fontSize: '14px', color: '#fef3c7' }}>{item.item_name}</span>
                    </div>
                    <span style={{ fontSize: '14px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                      ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div style={{ background: 'rgba(28,25,23,0.6)', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '13px', color: '#a8a29e' }}>Subtotal</span>
                  <span style={{ fontSize: '13px', color: '#fef3c7', fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(selected.total).toFixed(2)}</span>
                </div>
                {selected.discount_percent > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#22c55e' }}>Discount ({selected.discount_percent}%)</span>
                    <span style={{ fontSize: '13px', color: '#22c55e', fontFamily: 'JetBrains Mono,monospace' }}>-${parseFloat(selected.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(68,64,60,0.4)' }}>
                  <span style={{ fontSize: '15px', color: '#fef3c7', fontWeight: '600' }}>Total</span>
                  <span style={{ fontSize: '15px', color: '#f59e0b', fontWeight: '700', fontFamily: 'JetBrains Mono,monospace' }}>
                    ${parseFloat(selected.final_total || selected.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Status update */}
              {!['served', 'cancelled'].includes(selected.status) && (
                <div>
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Update Status</p>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {Object.entries(statusConfig).filter(([k]) => k !== selected.status).map(([key, val]) => (
                      <button key={key} onClick={() => updateStatus(selected.id, key)} style={{
                        padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                        background: val.bg, color: val.color,
                        border: `1px solid ${val.color}40`,
                        fontSize: '12px', fontWeight: '600', fontFamily: 'Inter, sans-serif',
                        display: 'flex', alignItems: 'center', gap: '4px'
                      }}>{val.label}</button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}