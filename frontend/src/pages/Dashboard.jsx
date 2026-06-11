import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed,  ShoppingBag,
  Users, Truck, TrendingUp, LogOut,
  ChefHat, Menu, Table2, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis,
  Tooltip, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';

// ── Nav items ─────────────────────────────────────────────────────────────────
const NAV = [
  { label: 'Dashboard', path: '/dashboard', icon: TrendingUp },
  { label: 'Orders', path: '/orders', icon: ShoppingBag },
  { label: 'Tables', path: '/tables', icon: Table2 },
  { label: 'Menu', path: '/menu', icon: Menu },
  { label: 'Delivery', path: '/delivery', icon: Truck },
  { label: 'Staff', path: '/staff', icon: Users },
  { label: 'Reports', path: '/reports', icon: BarChart2 },
];

// ── Animated counter ──────────────────────────────────────────────────────────
function Counter({ value, prefix = '', suffix = '', decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const target = parseFloat(value) || 0;
    const duration = 1000;
    const steps = 40;
    const increment = target / steps;
    let current = 0;
    let step = 0;
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) { current = target; clearInterval(ref.current); }
      setDisplay(current);
    }, duration / steps);
    return () => clearInterval(ref.current);
  }, [value]);

  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace' }}>
      {prefix}{decimals > 0 ? display.toFixed(decimals) : Math.round(display)}{suffix}
    </span>
  );
}

// ── Floating Pill Navbar (desktop) ────────────────────────────────────────────
function FloatingNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();

  const getNav = () => {
    if (user?.role === 'delivery_operator') {
      return [{ label: 'Delivery', path: '/delivery', icon: Truck }];
    }
    return NAV;
  };

  return (
    <motion.div
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      style={{
        position: 'relative', width: 'fit-content', margin: '0 auto',
        zIndex: 10, display: 'flex', alignItems: 'center', gap: '4px',
        background: 'rgba(41,37,36,0.92)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(245,158,11,0.2)', borderRadius: '50px',
        padding: '6px 8px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(245,158,11,0.05)'
      }}>
      <div style={{
        width: '32px', height: '32px', borderRadius: '50%',
        background: 'linear-gradient(135deg,#f59e0b,#d97706)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginRight: '4px', flexShrink: 0
      }}>
        <UtensilsCrossed size={16} color="#1c1917" />
      </div>

      {getNav().map(item => {
        const active = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <motion.button
  key={item.path}
  onClick={() => navigate(item.path)}
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  title={item.label}
  style={{
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: active ? '7px 14px' : '7px 10px',
    borderRadius: '50px', border: 'none',
    background: active ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'transparent',
    color: active ? '#1c1917' : '#a8a29e',
    cursor: 'pointer', fontSize: '13px',
    fontWeight: active ? '600' : '400',
    fontFamily: 'Inter, sans-serif', whiteSpace: 'nowrap',
    position: 'relative'
  }}>
  <Icon size={15} />
  {active && <span>{item.label}</span>}
</motion.button>
        );
      })}

      <motion.button onClick={() => { logout(); navigate('/login'); }}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '7px 12px', borderRadius: '50px', border: 'none',
          background: 'rgba(244,63,94,0.1)', color: '#f43f5e',
          cursor: 'pointer', fontSize: '13px',
          fontFamily: 'Inter, sans-serif', marginLeft: '4px'
        }}>
        <LogOut size={15} />
      </motion.button>
    </motion.div>
  );
}

// ── Bottom Nav (mobile) ───────────────────────────────────────────────────────
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 100,
      background: 'rgba(41,37,36,0.97)',
      backdropFilter: 'blur(20px)',
      borderTop: '1px solid rgba(245,158,11,0.15)',
      display: 'flex', justifyContent: 'space-around',
      padding: '8px 0 max(8px, env(safe-area-inset-bottom))'
    }}>
      {NAV.map(item => {
        const active = location.pathname === item.path;
        const Icon = item.icon;
        return (
          <button key={item.path} onClick={() => navigate(item.path)} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: '3px', background: 'none', border: 'none',
            color: active ? '#f59e0b' : '#a8a29e',
            cursor: 'pointer', padding: '4px 8px', minWidth: '48px'
          }}>
            <Icon size={20} />
            <span style={{ fontSize: '10px', fontFamily: 'Inter, sans-serif' }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ── Mini Floor Plan ───────────────────────────────────────────────────────────
function FloorPlan({ tables }) {
  const statusColor = {
    free: '#22c55e',
    occupied: '#f59e0b',
    bill_requested: '#f43f5e'
  };

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(52px, 1fr))',
      gap: '8px'
    }}>
      {tables.map(table => (
        <motion.div
          key={table.id}
          whileHover={{ scale: 1.08 }}
          style={{
            aspectRatio: '1',
            borderRadius: '10px',
            background: `${statusColor[table.status]}18`,
            border: `1.5px solid ${statusColor[table.status]}`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            cursor: 'default'
          }}>
          <span style={{ fontSize: '14px', fontWeight: '700', color: statusColor[table.status], fontFamily: 'JetBrains Mono, monospace' }}>
            {table.number}
          </span>
          <span style={{ fontSize: '8px', color: statusColor[table.status], opacity: 0.8, textTransform: 'capitalize' }}>
            {table.status === 'bill_requested' ? 'Bill' : table.status}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

// ── Live Order Ticker ─────────────────────────────────────────────────────────
function OrderTicker({ orders }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '280px', overflowY: 'auto' }}>
      <AnimatePresence>
        {orders.slice(0, 8).map((order, i) => (
          <motion.div
            key={order.id}
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: i * 0.05, type: 'spring', stiffness: 200, damping: 20 }}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px', borderRadius: '10px',
              background: 'rgba(28,25,23,0.6)',
              border: '1px solid rgba(68,64,60,0.4)'
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '8px',
                background: 'rgba(245,158,11,0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#f59e0b', fontSize: '12px', fontWeight: '700',
                fontFamily: 'JetBrains Mono, monospace', flexShrink: 0
              }}>T{order.table_number}</div>
              <div>
                <p style={{ fontSize: '13px', color: '#fef3c7', margin: 0, fontWeight: '500' }}>
                  {order.waiter_name}
                </p>
                <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>
                  {new Date(order.created_at).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono, monospace', fontWeight: '600' }}>
                ${parseFloat(order.total).toFixed(2)}
              </p>
              <span style={{
                fontSize: '10px', padding: '2px 6px', borderRadius: '20px', fontWeight: '600',
                background: order.status === 'pending' ? 'rgba(245,158,11,0.15)' :
                  order.status === 'preparing' ? 'rgba(167,139,250,0.15)' : 'rgba(34,197,94,0.15)',
                color: order.status === 'pending' ? '#f59e0b' :
                  order.status === 'preparing' ? '#a78bfa' : '#22c55e'
              }}>{order.status}</span>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {orders.length === 0 && (
        <div style={{ textAlign: 'center', padding: '32px', color: '#a8a29e', fontSize: '14px' }}>
          No active orders right now
        </div>
      )}
    </div>
  );
}

// ── Custom Tooltip ────────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: '10px', padding: '10px 14px'
    }}>
      <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '13px', color: p.color, margin: '2px 0', fontFamily: 'JetBrains Mono, monospace' }}>
          {p.name}: ${parseFloat(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user } = useAuth();

  useEffect(() => {
    fetchData();
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchData = async () => {
    try {
      const [s, w, b, o, t] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/weekly'),
        api.get('/reports/best-sellers'),
        api.get('/orders'),
        api.get('/tables'),
      ]);
      setSummary(s.data);
      setWeekly(w.data);
      setBestSellers(b.data);
      setOrders(o.data);
      setTables(t.data);
    } catch {
      toast.error('Failed to load dashboard');
    }
  };

  const chartData = (() => {
    if (!weekly) return [];
    const map = {};
    weekly.dine_in?.forEach(d => { map[d.date] = { date: d.date, 'Dine-in': parseFloat(d.revenue), Delivery: 0 }; });
    weekly.delivery?.forEach(d => {
      if (map[d.date]) map[d.date].Delivery = parseFloat(d.revenue);
      else map[d.date] = { date: d.date, 'Dine-in': 0, Delivery: parseFloat(d.revenue) };
    });
    return Object.values(map).sort((a, b) => new Date(a.date) - new Date(b.date)).map(d => ({
      ...d,
      date: new Date(d.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    }));
  })();

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const card = {
    background: 'rgba(41,37,36,0.8)',
    border: '1px solid rgba(245,158,11,0.12)',
    borderRadius: '20px', padding: '20px'
  };

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>

      {/* Floating nav — desktop */}
      {!isMobile && <FloatingNav />}

      {/* Bottom nav — mobile */}
      {isMobile && <BottomNav />}

      {/* Watermark */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        fontFamily: "'Playfair Display', serif",
        fontSize: 'clamp(60px, 15vw, 160px)',
        fontWeight: '900', color: 'rgba(245,158,11,0.03)',
        whiteSpace: 'nowrap', pointerEvents: 'none',
        userSelect: 'none', zIndex: 0
      }}>
        {user?.restaurant_name}
      </div>

      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: isMobile ? '80px 16px 100px' : '24px 24px 40px',
        position: 'relative', zIndex: 1
      }}>

        {/* Hero greeting + live revenue */}
        <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: '14px', color: '#a8a29e', margin: '0 0 4px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              {greeting}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 'clamp(28px, 5vw, 48px)',
                color: '#fef3c7', margin: 0, fontWeight: '900',
                lineHeight: 1.1
              }}>
              {user?.name?.split(' ')[0]}
            </motion.h1>
          </div>

          {/* Live revenue hero number */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(217,119,6,0.08))',
              border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '20px', padding: '16px 24px', textAlign: 'right'
            }}>
            <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Today's Revenue</p>
            <p style={{ fontSize: 'clamp(28px, 5vw, 44px)', fontWeight: '900', color: '#f59e0b', margin: 0 }}>
              <Counter value={summary?.today_revenue || 0} prefix="$" decimals={2} />
            </p>
          </motion.div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: "Orders Today", value: summary?.today_orders || 0, icon: ShoppingBag, color: '#22c55e' },
            { label: "Active Orders", value: summary?.active_orders || 0, icon: ChefHat, color: '#fbbf24' },
            { label: "Occupied Tables", value: summary?.active_tables || 0, icon: Table2, color: '#a78bfa' },
            { label: "Active Deliveries", value: summary?.active_deliveries || 0, icon: Truck, color: '#fb923c' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07 }}
                style={{ ...card, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: `${s.color}20`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: s.color
                }}><Icon size={18} /></div>
                <div>
                  <p style={{ fontSize: '26px', fontWeight: '700', color: '#fef3c7', margin: '0 0 2px' }}>
                    <Counter value={s.value} />
                  </p>
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Floor Plan */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', margin: 0 }}>Floor Plan</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[['#22c55e', 'Free'], ['#f59e0b', 'Occupied'], ['#f43f5e', 'Bill']].map(([c, l]) => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: c }} />
                    <span style={{ fontSize: '11px', color: '#a8a29e' }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
            <FloorPlan tables={tables} />
            {tables.length === 0 && (
              <p style={{ textAlign: 'center', color: '#a8a29e', fontSize: '14px', padding: '24px 0' }}>No tables added yet</p>
            )}
          </motion.div>

          {/* Live Orders */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={card}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', margin: 0 }}>Live Orders</h3>
              {summary?.active_orders > 0 && (
                <span style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#f59e0b', display: 'inline-block',
                  boxShadow: '0 0 8px #f59e0b', animation: 'pulse 2s infinite'
                }} />
              )}
            </div>
            <OrderTicker orders={orders.filter(o => ['pending', 'preparing'].includes(o.status))} />
          </motion.div>
        </div>

        {/* Weekly chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', margin: '0 0 16px' }}>Weekly Revenue</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fill: '#a8a29e', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#a8a29e', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="Dine-in" stroke="#f59e0b" fill="url(#g1)" strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="Delivery" stroke="#a78bfa" fill="url(#g2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e', fontSize: '14px' }}>
              No revenue data yet this week
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
            {[['#f59e0b', 'Dine-in'], ['#a78bfa', 'Delivery']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '3px', borderRadius: '2px', background: c }} />
                <span style={{ fontSize: '12px', color: '#a8a29e' }}>{l}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Best sellers */}
        {bestSellers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            style={card}>
            <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', margin: '0 0 14px' }}>Top Sellers</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {bestSellers.slice(0, 8).map((item, i) => {
                const max = parseFloat(bestSellers[0]?.total_sold || 1);
                const pct = (parseFloat(item.total_sold) / max) * 100;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0' }}>
                    <span style={{
                      width: '20px', fontSize: '12px', fontWeight: '700',
                      color: i < 3 ? '#f59e0b' : '#a8a29e',
                      fontFamily: 'JetBrains Mono, monospace', flexShrink: 0, textAlign: 'center'
                    }}>{i + 1}</span>
                    <span style={{ fontSize: '13px', color: '#fef3c7', minWidth: '120px', flexShrink: 0 }}>{item.name}</span>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(68,64,60,0.5)', borderRadius: '2px', overflow: 'hidden' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.6 + i * 0.05, duration: 0.6 }}
                        style={{ height: '100%', background: i < 3 ? '#f59e0b' : '#44403c', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#a8a29e', flexShrink: 0, fontFamily: 'JetBrains Mono, monospace' }}>
                      {item.total_sold}x
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}

export { FloatingNav, BottomNav };