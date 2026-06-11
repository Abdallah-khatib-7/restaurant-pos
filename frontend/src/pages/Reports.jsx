import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, DollarSign, ShoppingBag,
  Truck, Tag, Calendar, BarChart2
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip,
  ResponsiveContainer, BarChart, Bar,
  PieChart, Pie, Cell
} from 'recharts';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FloatingNav, BottomNav } from './Dashboard';

const COLORS = ['#f59e0b', '#a78bfa', '#22c55e', '#fb923c', '#f43f5e', '#38bdf8', '#e879f9'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
      borderRadius: '10px', padding: '10px 14px'
    }}>
      <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 4px' }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ fontSize: '13px', color: p.color, margin: '2px 0', fontFamily: 'JetBrains Mono,monospace' }}>
          {p.name}: ${parseFloat(p.value).toFixed(2)}
        </p>
      ))}
    </div>
  );
};

const card = {
  background: 'rgba(41,37,36,0.8)',
  border: '1px solid rgba(245,158,11,0.12)',
  borderRadius: '20px', padding: '20px'
};

export default function Reports() {
  const [summary, setSummary] = useState(null);
  const [weekly, setWeekly] = useState(null);
  const [bestSellers, setBestSellers] = useState([]);
  const [byCategory, setByCategory] = useState([]);
  const [discounts, setDiscounts] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchAll();
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const fetchAll = async () => {
    try {
      const [s, w, b, c, o] = await Promise.all([
        api.get('/reports/summary'),
        api.get('/reports/weekly'),
        api.get('/reports/best-sellers'),
        api.get('/reports/by-category'),
        api.get('/orders'),
      ]);
      setSummary(s.data);
      setWeekly(w.data);
      setBestSellers(b.data);
      setByCategory(c.data);
      // Extract discounted orders
      setDiscounts(o.data.filter(ord => ord.discount_percent > 0));
    } catch { toast.error('Failed to load reports'); }
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

  const totalDiscount = discounts.reduce((s, o) => s + parseFloat(o.discount_amount || 0), 0);

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>
      {!isMobile ? <FloatingNav /> : <BottomNav />}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '24px 24px 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#fef3c7', margin: '0 0 4px', fontWeight: '700' }}>Reports</h1>
          <p style={{ fontSize: '14px', color: '#a8a29e', margin: 0 }}>Revenue analytics and performance overview</p>
        </div>

        {/* Summary stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: "Today's Revenue", value: `$${summary?.today_revenue?.toFixed(2) || '0.00'}`, icon: DollarSign, color: '#f59e0b' },
            { label: "Today's Orders", value: summary?.today_orders || 0, icon: ShoppingBag, color: '#22c55e' },
            { label: 'Active Deliveries', value: summary?.active_deliveries || 0, icon: Truck, color: '#fb923c' },
            { label: 'Total Discounts Given', value: `$${totalDiscount.toFixed(2)}`, icon: Tag, color: '#f43f5e' },
          ].map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                style={{ ...card, display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: `${s.color}20`, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0
                }}><Icon size={20} /></div>
                <div>
                  <p style={{ fontSize: '22px', fontWeight: '700', color: '#fef3c7', margin: '0 0 2px', fontFamily: 'JetBrains Mono,monospace' }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{s.label}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Weekly revenue chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ ...card, marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fef3c7', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={16} style={{ color: '#f59e0b' }} /> Weekly Revenue
          </h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
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
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e' }}>
              No revenue data yet this week
            </div>
          )}
          <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
            {[['#f59e0b', 'Dine-in'], ['#a78bfa', 'Delivery']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '24px', height: '3px', borderRadius: '2px', background: c }} />
                <span style={{ fontSize: '12px', color: '#a8a29e' }}>{l}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Charts grid */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '16px', marginBottom: '16px' }}>

          {/* Revenue by category - Pie */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={card}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fef3c7', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={16} style={{ color: '#f59e0b' }} /> Revenue by Category
            </h3>
            {byCategory.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={byCategory} dataKey="revenue" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}>
                    {byCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(val) => `$${parseFloat(val).toFixed(2)}`} contentStyle={{ background: '#292524', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', color: '#fef3c7' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e' }}>No data yet</div>
            )}
          </motion.div>

          {/* Best sellers bar chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={card}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fef3c7', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={16} style={{ color: '#f59e0b' }} /> Top Sellers
            </h3>
            {bestSellers.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={bestSellers.slice(0, 6)} layout="vertical">
                  <XAxis type="number" tick={{ fill: '#a8a29e', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#a8a29e', fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip contentStyle={{ background: '#292524', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '10px', color: '#fef3c7' }} />
                  <Bar dataKey="total_sold" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Sold" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a8a29e' }}>No data yet</div>
            )}
          </motion.div>
        </div>

        {/* Best sellers list */}
        {bestSellers.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ ...card, marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fef3c7', margin: '0 0 16px' }}>Top 10 Items — Full Detail</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              {bestSellers.map((item, i) => {
                const max = parseFloat(bestSellers[0]?.total_sold || 1);
                const pct = (parseFloat(item.total_sold) / max) * 100;
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid rgba(68,64,60,0.3)' }}>
                    <span style={{
                      width: '24px', fontSize: '12px', fontWeight: '700',
                      color: i < 3 ? '#f59e0b' : '#a8a29e',
                      fontFamily: 'JetBrains Mono,monospace', flexShrink: 0, textAlign: 'center'
                    }}>{i + 1}</span>
                    <span style={{ fontSize: '13px', color: '#fef3c7', minWidth: '120px', flexShrink: 0 }}>{item.name}</span>
                    <div style={{ flex: 1, height: '4px', background: 'rgba(68,64,60,0.5)', borderRadius: '2px', overflow: 'hidden' }}>
                      <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.6 + i * 0.05, duration: 0.6 }}
                        style={{ height: '100%', background: i < 3 ? '#f59e0b' : '#44403c', borderRadius: '2px' }} />
                    </div>
                    <span style={{ fontSize: '12px', color: '#a8a29e', flexShrink: 0, fontFamily: 'JetBrains Mono,monospace' }}>{item.total_sold}x</span>
                    <span style={{ fontSize: '12px', color: '#f59e0b', flexShrink: 0, fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(item.revenue).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Discounts log */}
        {discounts.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            style={card}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fef3c7', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Tag size={16} style={{ color: '#f43f5e' }} /> Discount Log
            </h3>
            <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 16px' }}>
              Total discounts given: <span style={{ color: '#f43f5e', fontFamily: 'JetBrains Mono,monospace' }}>${totalDiscount.toFixed(2)}</span>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {discounts.map(order => (
                <div key={order.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', background: 'rgba(28,25,23,0.6)', borderRadius: '10px',
                  flexWrap: 'wrap', gap: '8px'
                }}>
                  <div>
                    <span style={{ fontSize: '13px', color: '#fef3c7', fontWeight: '600' }}>Order #{order.id} · Table {order.table_number}</span>
                    <p style={{ fontSize: '12px', color: '#a8a29e', margin: '2px 0 0' }}>
                      {order.waiter_name} · {new Date(order.created_at).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '13px', color: '#f43f5e', margin: '0 0 2px', fontFamily: 'JetBrains Mono,monospace' }}>
                      -{order.discount_percent}% (${parseFloat(order.discount_amount).toFixed(2)})
                    </p>
                    <p style={{ fontSize: '13px', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>
                      Final: ${parseFloat(order.final_total).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}