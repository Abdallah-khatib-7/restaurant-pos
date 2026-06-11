import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
   LogOut, Clock, CheckCircle,
  ChefHat, Truck, Bell
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { useSocket } from '../context/SocketContext';
import { useNavigate } from 'react-router-dom';

const statusConfig = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Pending', next: 'preparing', nextLabel: 'Start Preparing' },
  preparing: { color: '#a78bfa', bg: 'rgba(167,139,250,0.12)', label: 'Preparing', next: 'ready', nextLabel: 'Mark Ready' },
  ready: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'Ready', next: null, nextLabel: null },
};

const OrderCard = ({ order, onStatusChange, onItemReady, type }) => {
  const cfg = statusConfig[order.status];
  const elapsed = Math.floor((Date.now() - new Date(order.created_at).getTime()) / 60000);// eslint-disable-line
  const isUrgent = elapsed > 15;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        background: cfg.bg,
        border: `2px solid ${isUrgent ? '#f43f5e' : cfg.color}40`,
        borderRadius: '16px', padding: '16px',
        boxShadow: isUrgent ? '0 0 20px rgba(244,63,94,0.2)' : 'none'
      }}>

      {/* Card header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            {type === 'delivery' ? (
              <Truck size={16} style={{ color: '#fb923c' }} />
            ) : (
              <span style={{ fontSize: '18px', fontWeight: '800', color: cfg.color, fontFamily: 'JetBrains Mono,monospace' }}>
                T{order.table_number}
              </span>
            )}
            {type === 'delivery' && (
              <span style={{ fontSize: '13px', color: '#fb923c', fontWeight: '600' }}>
                {order.customer_name}
              </span>
            )}
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
              background: `${cfg.color}20`, color: cfg.color, fontWeight: '600'
            }}>{cfg.label}</span>
            {isUrgent && (
              <span style={{
                fontSize: '11px', padding: '2px 8px', borderRadius: '20px',
                background: 'rgba(244,63,94,0.2)', color: '#f43f5e', fontWeight: '600'
              }}>URGENT</span>
            )}
          </div>
          <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>
            Order #{order.id} · {order.waiter_name || 'Delivery'}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: isUrgent ? '#f43f5e' : '#a8a29e' }}>
          <Clock size={13} />
          <span style={{ fontSize: '13px', fontFamily: 'JetBrains Mono,monospace', fontWeight: isUrgent ? '700' : '400' }}>
            {elapsed}m
          </span>
        </div>
      </div>

      {/* Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
        {order.items?.map(item => (
          <div key={item.id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '8px 10px', borderRadius: '8px',
            background: item.status === 'ready' ? 'rgba(34,197,94,0.1)' : 'rgba(28,25,23,0.5)',
            border: `1px solid ${item.status === 'ready' ? 'rgba(34,197,94,0.2)' : 'rgba(68,64,60,0.3)'}`,
            cursor: item.status !== 'ready' ? 'pointer' : 'default',
            transition: 'all 0.2s'
          }}
            onClick={() => item.status !== 'ready' && onItemReady(order.id, item.id)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                width: '24px', height: '24px', borderRadius: '6px',
                background: item.status === 'ready' ? 'rgba(34,197,94,0.2)' : 'rgba(245,158,11,0.15)',
                color: item.status === 'ready' ? '#22c55e' : '#f59e0b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', flexShrink: 0
              }}>{item.quantity}</span>
              <div>
                <p style={{ fontSize: '14px', color: item.status === 'ready' ? '#a8a29e' : '#fef3c7', margin: 0, fontWeight: '500', textDecoration: item.status === 'ready' ? 'line-through' : 'none' }}>
                  {item.item_name}
                </p>
                {item.notes && <p style={{ fontSize: '11px', color: '#f59e0b', margin: 0 }}>📝 {item.notes}</p>}
              </div>
            </div>
            {item.status === 'ready' ? (
              <CheckCircle size={16} style={{ color: '#22c55e', flexShrink: 0 }} />
            ) : (
              <span style={{ fontSize: '11px', color: '#a8a29e', flexShrink: 0 }}>tap ✓</span>
            )}
          </div>
        ))}
      </div>

      {order.notes && (
        <div style={{
          padding: '8px 10px', background: 'rgba(245,158,11,0.08)',
          borderRadius: '8px', marginBottom: '12px',
          border: '1px solid rgba(245,158,11,0.15)'
        }}>
          <p style={{ fontSize: '12px', color: '#f59e0b', margin: 0 }}>📝 {order.notes}</p>
        </div>
      )}

      {/* Action button */}
      {cfg.next && (
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={() => onStatusChange(order.id, cfg.next)}
          style={{
            width: '100%', padding: '10px', borderRadius: '10px', border: 'none',
            background: cfg.next === 'preparing'
              ? 'linear-gradient(135deg,#a78bfa,#7c3aed)'
              : 'linear-gradient(135deg,#22c55e,#16a34a)',
            color: '#fff', fontWeight: '600', cursor: 'pointer',
            fontSize: '14px', fontFamily: 'Inter, sans-serif',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
          }}>
          {cfg.next === 'preparing' ? <ChefHat size={15} /> : <CheckCircle size={15} />}
          {cfg.nextLabel}
        </motion.button>
      )}
    </motion.div>
  );
};

export default function KitchenDisplay() {
  const {  logout } = useAuth();
  const { socketRef, socketReady } = useSocket();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [deliveryOrders, setDeliveryOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [newOrderAlert, setNewOrderAlert] = useState(false);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    fetchOrders();
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!socketRef.current) return;
    const socket = socketRef.current;

    const handleNewOrder = (order) => {
      setOrders(prev => [order, ...prev]);
      setNewOrderAlert(true);
      setTimeout(() => setNewOrderAlert(false), 3000);
      toast('New order!', { icon: '🔔' });
    };

    const handleNewDelivery = () => {
      fetchDeliveryOrders();
      toast('New delivery order!', { icon: '🚗' });
    };

    const handleStatusChanged = ({ id, status }) => {
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    };

    const handleDeliveryStatusChanged = ({ id, status }) => {
      setDeliveryOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    };

    const handleOrderUpdated = () => fetchOrders();

    socket.on('new_order', handleNewOrder);
    socket.on('new_delivery_order', handleNewDelivery);
    socket.on('order_status_changed', handleStatusChanged);
    socket.on('delivery_status_changed', handleDeliveryStatusChanged);
    socket.on('order_updated', handleOrderUpdated);

    return () => {
      socket.off('new_order', handleNewOrder);
      socket.off('new_delivery_order', handleNewDelivery);
      socket.off('order_status_changed', handleStatusChanged);
      socket.off('delivery_status_changed', handleDeliveryStatusChanged);
      socket.off('order_updated', handleOrderUpdated);
    };
  }, [socketReady]);

  const fetchOrders = async () => {                  
    try {
      const [o, d] = await Promise.all([
        api.get('/orders/kitchen/active'),
        api.get('/delivery'),
      ]);
      setOrders(o.data);
      setDeliveryOrders(d.data.filter(ord => ['pending', 'preparing'].includes(ord.status)));
    } catch (err) { console.error(err); }
  };

  const fetchDeliveryOrders = async () => {
    try {
      const res = await api.get('/delivery');
      setDeliveryOrders(res.data.filter(ord => ['pending', 'preparing'].includes(ord.status)));
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/orders/${id}/status`, { status });
      setOrders(prev => status === 'ready'
        ? prev.map(o => o.id === id ? { ...o, status } : o)
        : prev.map(o => o.id === id ? { ...o, status } : o)
      );
    } catch { toast.error('Failed'); }
  };

  const markItemReady = async (orderId, itemId) => {
    try {
      await api.put(`/orders/${orderId}/items/${itemId}/status`, { status: 'ready' });
      setOrders(prev => prev.map(o => o.id === orderId ? {
        ...o, items: o.items.map(i => i.id === itemId ? { ...i, status: 'ready' } : i)
      } : o));
    } catch  { toast.error('Failed'); }
  };

  const filteredOrders = orders.filter(o => {
    if (filter === 'pending') return o.status === 'pending';
    if (filter === 'preparing') return o.status === 'preparing';
    if (filter === 'ready') return o.status === 'ready';
    return true;
  });

  const allOrders = [...filteredOrders, ...(filter === 'all' || filter === 'delivery' ? deliveryOrders : [])];

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>

      {/* Top bar */}
      <div style={{
        background: 'rgba(28,25,23,0.98)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245,158,11,0.15)',
        padding: '0 20px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <ChefHat size={20} color="#1c1917" />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', fontWeight: '700' }}>Kitchen</span>
          {newOrderAlert && (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
              style={{
                background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)',
                borderRadius: '20px', padding: '4px 12px', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
              <Bell size={14} style={{ color: '#f59e0b' }} />
              <span style={{ fontSize: '13px', color: '#f59e0b', fontWeight: '600' }}>New Order!</span>
            </motion.div>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '16px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace', fontWeight: '600' }}>
            {time.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </span>
          <button onClick={() => { logout(); navigate('/login'); }} style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '8px', padding: '7px 12px', color: '#f43f5e',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
          }}><LogOut size={14} /></button>
        </div>
      </div>

      {/* Stats + filters */}
      <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: `All (${orders.length + deliveryOrders.length})` },
            { key: 'pending', label: `Pending (${orders.filter(o => o.status === 'pending').length})` },
            { key: 'preparing', label: `Preparing (${orders.filter(o => o.status === 'preparing').length})` },
            { key: 'ready', label: `Ready (${orders.filter(o => o.status === 'ready').length})` },
            { key: 'delivery', label: `Delivery (${deliveryOrders.length})` },
          ].map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)} style={{
              padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
              background: filter === f.key ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(41,37,36,0.8)',
              color: filter === f.key ? '#1c1917' : '#a8a29e',
              border: filter === f.key ? 'none' : '1px solid #44403c',
              fontSize: '13px', fontWeight: filter === f.key ? '600' : '400',
              fontFamily: 'Inter, sans-serif'
            }}>{f.label}</button>
          ))}
        </div>
      </div>

      {/* Orders grid */}
      <div style={{ padding: '0 20px 40px' }}>
        {allOrders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px', color: '#a8a29e' }}>
            <ChefHat size={48} style={{ color: '#44403c', marginBottom: '16px' }} />
            <p style={{ fontSize: '18px', margin: 0 }}>No active orders</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            <AnimatePresence>
              {allOrders.map(order => (
                <OrderCard
                  key={`${order.id}-${order.status}`}
                  order={order}
                  type={order.customer_name ? 'delivery' : 'dinein'}
                  onStatusChange={updateStatus}
                  onItemReady={markItemReady}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}