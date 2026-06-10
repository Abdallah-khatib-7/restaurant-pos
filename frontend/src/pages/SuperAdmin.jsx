import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UtensilsCrossed, Users, Clock, CheckCircle, XCircle,
  DollarSign, Building2, LogOut, Eye, ToggleLeft, ToggleRight,
  CreditCard, Banknote, Search, AlertTriangle, Lock, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';

// ── tiny reusable components ──────────────────────────────────────────────────

const Badge = ({ label, color, bg }) => (
  <span style={{
    fontSize: '11px', padding: '2px 9px', borderRadius: '20px',
    background: bg, color, fontWeight: '600', whiteSpace: 'nowrap'
  }}>{label}</span>
);

const IconBtn = ({ onClick, icon, label, color, bg, border }) => (
  <button onClick={onClick} style={{
    background: bg, border: `1px solid ${border}`, borderRadius: '8px',
    padding: '7px 13px', color, cursor: 'pointer', fontSize: '13px',
    display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap',
    fontFamily: 'Inter, sans-serif'
  }}>{icon}{label}</button>
);

const Field = ({ label, value }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '9px 0', borderBottom: '1px solid rgba(68,64,60,0.4)'
  }}>
    <span style={{ fontSize: '13px', color: '#a8a29e', flexShrink: 0, marginRight: '12px' }}>{label}</span>
    <span style={{ fontSize: '13px', color: '#fef3c7', textAlign: 'right' }}>{value ?? '—'}</span>
  </div>
);

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel, danger = false, requireReason = false, reasonPlaceholder = '' }) => {
  const [reason, setReason] = useState('');
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{
          background: '#292524', border: `1px solid ${danger ? 'rgba(244,63,94,0.3)' : 'rgba(245,158,11,0.2)'}`,
          borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '420px'
        }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '10px',
            background: danger ? 'rgba(244,63,94,0.15)' : 'rgba(245,158,11,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#f43f5e' : '#f59e0b', flexShrink: 0
          }}>
            <AlertTriangle size={20} />
          </div>
          <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#fef3c7', margin: 0 }}>{title}</h3>
        </div>
        <p style={{ fontSize: '14px', color: '#a8a29e', margin: '0 0 16px', lineHeight: '1.6' }}>{message}</p>
        {requireReason && (
          <textarea value={reason} onChange={e => setReason(e.target.value)}
            placeholder={reasonPlaceholder} rows={3}
            style={{
              width: '100%', background: 'rgba(28,25,23,0.9)', border: '1px solid #44403c',
              borderRadius: '10px', color: '#fef3c7', fontSize: '14px', padding: '10px',
              outline: 'none', resize: 'none', boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif', marginBottom: '16px'
            }} />
        )}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={() => onConfirm(reason)} style={{
            flex: 1, padding: '11px', borderRadius: '10px',
background: danger ? 'rgba(244,63,94,0.2)' : 'linear-gradient(135deg,#f59e0b,#d97706)',
color: danger ? '#f43f5e' : '#1c1917', fontWeight: '600',
cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif',
border: danger ? '1px solid rgba(244,63,94,0.3)' : 'none'
          }}>Confirm</button>
          <button onClick={onCancel} style={{
            flex: 1, padding: '11px', borderRadius: '10px',
            background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
            color: '#a8a29e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
          }}>Cancel</button>
        </div>
      </motion.div>
    </div>
  );
};

// ── Change Password Modal ─────────────────────────────────────────────────────
const ChangePasswordModal = ({ onClose }) => {
  const [form, setForm] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (form.new_password !== form.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.put('/users/change-password', {
        current_password: form.current_password,
        new_password: form.new_password
      });
      toast.success('Password changed successfully');
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
    }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        style={{
          background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
          borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px'
        }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#fef3c7', margin: 0 }}>Change Password</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><X size={20} /></button>
        </div>
        {['current_password', 'new_password', 'confirm'].map(k => (
          <div key={k} style={{ marginBottom: '14px' }}>
            <label style={{ fontSize: '12px', color: '#a8a29e', display: 'block', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {k === 'current_password' ? 'Current Password' : k === 'new_password' ? 'New Password' : 'Confirm New Password'}
            </label>
            <input type="password" value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })}
              style={{
                width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
                border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
              }}
              onFocus={e => e.target.style.borderColor = '#f59e0b'}
              onBlur={e => e.target.style.borderColor = '#44403c'} />
          </div>
        ))}
        <button onClick={handle} disabled={loading} style={{
          width: '100%', padding: '12px', marginTop: '8px',
          background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none',
          borderRadius: '10px', color: '#1c1917', fontWeight: '600',
          cursor: loading ? 'not-allowed' : 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
        }}>{loading ? 'Saving...' : 'Change Password'}</button>
      </motion.div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const TABS = ['Dashboard', 'Applications', 'Restaurants', 'Payments'];

export default function SuperAdmin() {
  const [tab, setTab] = useState('Dashboard');
  const [applications, setApplications] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [selected, setSelected] = useState(null);
  const [selectedType, setSelectedType] = useState(null); // 'application' | 'restaurant'
  const [loading, setLoading] = useState(true); // eslint-disable-line
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [confirm, setConfirm] = useState(null);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [apps, rests] = await Promise.all([
        api.get('/superadmin/applications'),
        api.get('/superadmin/restaurants')
      ]);
      setApplications(apps.data);
      setRestaurants(rests.data);
    } catch { toast.error('Failed to load data'); }
    finally { setLoading(false); }
  };

  const handleApprove = (app) => {
    setConfirm({
      title: 'Approve Application',
      message: `Approve ${app.restaurant_name}? This will create their restaurant and owner account with a temporary password.`,
      danger: false,
      onConfirm: async () => {
        try {
          const res = await api.post(`/superadmin/applications/${app.id}/approve`);
          toast.success(`Approved! Temp password: ${res.data.temp_password}`, { duration: 8000 });
          setSelected(null); setConfirm(null); fetchAll();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      }
    });
  };

  const handleReject = (app) => {
    setConfirm({
      title: 'Reject Application',
      message: `Reject ${app.restaurant_name}? Please provide a reason.`,
      danger: true, requireReason: true,
      reasonPlaceholder: 'Explain why this application is rejected...',
      onConfirm: async (reason) => {
        if (!reason.trim()) return toast.error('Reason is required');
        try {
          await api.post(`/superadmin/applications/${app.id}/reject`, { reason });
          toast.success('Application rejected');
          setSelected(null); setConfirm(null); fetchAll();
        } catch { toast.error('Failed'); }
      }
    });
  };

  const handleToggle = (r) => {
    setConfirm({
      title: r.is_active ? 'Deactivate Restaurant' : 'Activate Restaurant',
      message: r.is_active
        ? `Deactivate ${r.restaurant_name}? Their staff will no longer be able to log in. Please provide a reason.`
        : `Activate ${r.restaurant_name}? Their staff will regain access.`,
      danger: r.is_active,
      requireReason: r.is_active,
      reasonPlaceholder: 'Reason for deactivation...',
      onConfirm: async () => {
        try {
          await api.put(`/superadmin/restaurants/${r.id}/toggle`);
          toast.success(`Restaurant ${r.is_active ? 'deactivated' : 'activated'}`);
          setSelected(null); setConfirm(null); fetchAll();
        } catch { toast.error('Failed'); }
      }
    });
  };

  const handlePayment = (r, method) => {
    setConfirm({
      title: 'Mark Payment Received',
      message: `Mark $${r.quoted_price} payment from ${r.restaurant_name} as received via ${method}?`,
      danger: false,
      onConfirm: async () => {
        try {
          await api.put(`/superadmin/restaurants/${r.id}/payment`, { payment_method: method });
          toast.success('Payment recorded');
          setConfirm(null); fetchAll();
        } catch { toast.error('Failed'); }
      }
    });
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  // ── derived data ────────────────────────────────────────────────────────────
  const pending = applications.filter(a => a.status === 'pending').length;
  const totalRevenue = restaurants.filter(r => r.payment_status === 'paid').reduce((s, r) => s + parseFloat(r.quoted_price || 0), 0);
  const unpaidRevenue = restaurants.filter(r => r.payment_status === 'unpaid').reduce((s, r) => s + parseFloat(r.quoted_price || 0), 0);

  const filteredApps = applications.filter(a => {
    const matchSearch = a.restaurant_name.toLowerCase().includes(search.toLowerCase()) ||
      a.owner_name.toLowerCase().includes(search.toLowerCase()) ||
      a.city.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const filteredRests = restaurants.filter(r =>
    r.restaurant_name.toLowerCase().includes(search.toLowerCase()) ||
    r.owner_name.toLowerCase().includes(search.toLowerCase()) ||
    r.city.toLowerCase().includes(search.toLowerCase())
  );

  const unpaidRests = restaurants.filter(r => r.payment_status === 'unpaid');
  const paidRests = restaurants.filter(r => r.payment_status === 'paid');

  const statusColors = {
    pending: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    approved: { bg: 'rgba(34,197,94,0.15)', color: '#22c55e' },
    rejected: { bg: 'rgba(244,63,94,0.15)', color: '#f43f5e' },
  };

  // ── styles ──────────────────────────────────────────────────────────────────
  const cardStyle = {
  background: 'rgba(41,37,36,0.8)',
  borderRadius: '16px', padding: '20px',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  flexWrap: 'wrap', gap: '12px'
};

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>

      {/* Navbar */}
      <div style={{
        background: 'rgba(41,37,36,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245,158,11,0.15)',
        padding: '0 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px',
        position: 'sticky', top: 0, zIndex: 50
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UtensilsCrossed size={18} color="#1c1917" />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', fontWeight: '700' }}>Tawla</span>
          <span style={{
            fontSize: '11px', background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
            padding: '2px 8px', borderRadius: '20px', fontWeight: '600', letterSpacing: '0.05em'
          }}>SUPER ADMIN</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px', color: '#a8a29e', marginRight: '8px' }}>{user?.name}</span>
          <button onClick={() => setShowChangePassword(true)} style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '8px', padding: '7px 12px', color: '#f59e0b',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
          }}><Lock size={14} /> Password</button>
          <button onClick={handleLogout} style={{
            background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
            borderRadius: '8px', padding: '7px 12px', color: '#f43f5e',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px'
          }}><LogOut size={14} /> Logout</button>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 16px' }}>

        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '4px', marginBottom: '24px',
          background: 'rgba(41,37,36,0.6)', padding: '4px',
          borderRadius: '12px', width: 'fit-content', flexWrap: 'wrap'
        }}>
          {TABS.map(t => (
            <button key={t} onClick={() => { setTab(t); setSearch(''); setFilterStatus('all'); }} style={{
              padding: '8px 18px', borderRadius: '8px', border: 'none',
              background: tab === t ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'transparent',
              color: tab === t ? '#1c1917' : '#a8a29e',
              fontWeight: tab === t ? '600' : '400',
              cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px',
              fontFamily: 'Inter, sans-serif'
            }}>
              {t}
              {t === 'Applications' && pending > 0 && (
                <span style={{
                  background: tab === t ? '#1c1917' : '#f59e0b',
                  color: tab === t ? '#f59e0b' : '#1c1917',
                  borderRadius: '20px', padding: '0 6px', fontSize: '11px', fontWeight: '700'
                }}>{pending}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── DASHBOARD ── */}
        {tab === 'Dashboard' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '28px' }}>
              {[
                { label: 'Total Applications', value: applications.length, icon: <Users size={22} />, color: '#f59e0b' },
                { label: 'Pending Review', value: pending, icon: <Clock size={22} />, color: '#fbbf24' },
                { label: 'Active Restaurants', value: restaurants.filter(r => r.is_active).length, icon: <Building2 size={22} />, color: '#22c55e' },
                { label: 'Inactive Restaurants', value: restaurants.filter(r => !r.is_active).length, icon: <XCircle size={22} />, color: '#f43f5e' },
                { label: 'Revenue Collected', value: `$${totalRevenue.toLocaleString()}`, icon: <DollarSign size={22} />, color: '#a78bfa' },
                { label: 'Pending Payments', value: `$${unpaidRevenue.toLocaleString()}`, icon: <Banknote size={22} />, color: '#fb923c' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                  style={{
                    background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
                    borderRadius: '16px', padding: '20px',
                    display: 'flex', alignItems: 'center', gap: '14px'
                  }}>
                  <div style={{
                    width: '48px', height: '48px', borderRadius: '12px',
                    background: `${s.color}20`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: s.color, flexShrink: 0
                  }}>{s.icon}</div>
                  <div>
                    <p style={{ fontSize: '24px', fontWeight: '700', color: '#fef3c7', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>{s.value}</p>
                    <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{s.label}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Applications */}
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: '0 0 14px' }}>Recent Applications</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {applications.slice(0, 5).map((app) => (
                <div key={app.id} style={cardStyle}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7' }}>{app.restaurant_name}</span>
                      <Badge label={app.status} bg={statusColors[app.status]?.bg} color={statusColors[app.status]?.color} />
                    </div>
                    <span style={{ fontSize: '13px', color: '#a8a29e' }}>{app.owner_name} · {app.city} · ${app.quoted_price}</span>
                  </div>
                  <IconBtn onClick={() => { setSelected(app); setSelectedType('application'); }}
                    icon={<Eye size={14} />} label="View"
                    color="#f59e0b" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.2)" />
                </div>
              ))}
            </div>

            {/* Unpaid Restaurants */}
            {unpaidRests.length > 0 && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: '0 0 14px' }}>
                  Pending Payments <span style={{ color: '#f43f5e', fontSize: '14px' }}>({unpaidRests.length})</span>
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {unpaidRests.map(r => (
                    <div key={r.id} style={{ ...cardStyle, border: '1px solid rgba(244,63,94,0.15)' }}>
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', display: 'block', marginBottom: '4px' }}>{r.restaurant_name}</span>
                        <span style={{ fontSize: '13px', color: '#a8a29e' }}>{r.owner_email} · </span>
                        <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>${r.quoted_price}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <IconBtn onClick={() => handlePayment(r, 'cash')} icon={<Banknote size={14} />} label="Cash"
                          color="#22c55e" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.2)" />
                        <IconBtn onClick={() => handlePayment(r, 'card')} icon={<CreditCard size={14} />} label="Card"
                          color="#a78bfa" bg="rgba(167,139,250,0.1)" border="rgba(167,139,250,0.2)" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ── APPLICATIONS ── */}
        {tab === 'Applications' && (
          <div>
            {/* Search + Filter */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
                <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name, owner, city..."
                  style={{
                    width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(41,37,36,0.8)',
                    border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                  }}
                  onFocus={e => e.target.style.borderColor = '#f59e0b'}
                  onBlur={e => e.target.style.borderColor = '#44403c'} />
              </div>
              {['all', 'pending', 'approved', 'rejected'].map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '10px 16px', borderRadius: '10px', cursor: 'pointer',
background: filterStatus === s ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(41,37,36,0.8)',
color: filterStatus === s ? '#1c1917' : '#a8a29e',
fontSize: '13px', fontWeight: filterStatus === s ? '600' : '400',
fontFamily: 'Inter, sans-serif',
border: filterStatus === s ? 'none' : '1px solid #44403c'
                }}>{s.charAt(0).toUpperCase() + s.slice(1)}</button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredApps.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: '#a8a29e' }}>No applications found</div>}
              {filteredApps.map((app) => (
                <motion.div key={app.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={cardStyle}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7' }}>
                        {app.restaurant_name}{app.branch_name ? ` — ${app.branch_name}` : ''}
                      </span>
                      <Badge label={app.status} bg={statusColors[app.status]?.bg} color={statusColors[app.status]?.color} />
                    </div>
                    <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 3px' }}>{app.owner_name} · {app.owner_email} · {app.city}</p>
                    <p style={{ fontSize: '13px', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>
                      ${app.quoted_price} · {app.pricing_tier} · {app.total_employees} employees
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <IconBtn onClick={() => { setSelected(app); setSelectedType('application'); }}
                      icon={<Eye size={14} />} label="View" color="#f59e0b" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.2)" />
                    {app.status === 'pending' && (
                      <>
                        <IconBtn onClick={() => handleApprove(app)} icon={<CheckCircle size={14} />} label="Approve"
                          color="#22c55e" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.2)" />
                        <IconBtn onClick={() => handleReject(app)} icon={<XCircle size={14} />} label="Reject"
                          color="#f43f5e" bg="rgba(244,63,94,0.1)" border="rgba(244,63,94,0.2)" />
                      </>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── RESTAURANTS ── */}
        {tab === 'Restaurants' && (
          <div>
            <div style={{ position: 'relative', marginBottom: '16px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search restaurants..."
                style={{
                  width: '100%', padding: '10px 12px 10px 36px', background: 'rgba(41,37,36,0.8)',
                  border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                  fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                }}
                onFocus={e => e.target.style.borderColor = '#f59e0b'}
                onBlur={e => e.target.style.borderColor = '#44403c'} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {filteredRests.length === 0 && <div style={{ textAlign: 'center', padding: '48px', color: '#a8a29e' }}>No restaurants found</div>}
              {filteredRests.map((r, i) => (
                <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                  style={{ ...cardStyle, border: `1px solid ${r.is_active ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)'}` }}>
                  <div style={{ flex: 1, minWidth: '200px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7' }}>
                        {r.restaurant_name}{r.branch_name ? ` — ${r.branch_name}` : ''}
                      </span>
                      <Badge label={r.is_active ? 'Active' : 'Inactive'}
                        bg={r.is_active ? 'rgba(34,197,94,0.15)' : 'rgba(244,63,94,0.15)'}
                        color={r.is_active ? '#22c55e' : '#f43f5e'} />
                      <Badge label={r.payment_status === 'paid' ? `Paid · ${r.payment_method}` : 'Unpaid'}
                        bg={r.payment_status === 'paid' ? 'rgba(34,197,94,0.15)' : 'rgba(245,158,11,0.15)'}
                        color={r.payment_status === 'paid' ? '#22c55e' : '#f59e0b'} />
                    </div>
                    <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 3px' }}>{r.owner_name} · {r.owner_email} · {r.city}</p>
                    <p style={{ fontSize: '13px', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>
                      ${r.quoted_price} · {r.total_employees} employees
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <IconBtn onClick={() => { setSelected(r); setSelectedType('restaurant'); }}
                      icon={<Eye size={14} />} label="View" color="#f59e0b" bg="rgba(245,158,11,0.1)" border="rgba(245,158,11,0.2)" />
                    <IconBtn onClick={() => handleToggle(r)}
                      icon={r.is_active ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      label={r.is_active ? 'Deactivate' : 'Activate'}
                      color={r.is_active ? '#f43f5e' : '#22c55e'}
                      bg={r.is_active ? 'rgba(244,63,94,0.1)' : 'rgba(34,197,94,0.1)'}
                      border={r.is_active ? 'rgba(244,63,94,0.2)' : 'rgba(34,197,94,0.2)'} />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ── PAYMENTS ── */}
        {tab === 'Payments' && (
          <div>
            {/* Summary */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '16px', marginBottom: '24px' }}>
              {[
                { label: 'Total Collected', value: `$${totalRevenue.toLocaleString()}`, color: '#22c55e' },
                { label: 'Pending', value: `$${unpaidRevenue.toLocaleString()}`, color: '#f59e0b' },
                { label: 'Paid Restaurants', value: paidRests.length, color: '#a78bfa' },
                { label: 'Unpaid Restaurants', value: unpaidRests.length, color: '#f43f5e' },
              ].map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
                  borderRadius: '16px', padding: '20px'
                }}>
                  <p style={{ fontSize: '26px', fontWeight: '700', color: s.color, margin: '0 0 4px', fontFamily: 'JetBrains Mono,monospace' }}>{s.value}</p>
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Unpaid */}
            {unpaidRests.length > 0 && (
              <>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#f43f5e', margin: '0 0 12px' }}>Awaiting Payment</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
                  {unpaidRests.map(r => (
                    <div key={r.id} style={{ ...cardStyle, border: '1px solid rgba(244,63,94,0.15)' }}>
                      <div>
                        <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', display: 'block', marginBottom: '4px' }}>{r.restaurant_name}</span>
                        <span style={{ fontSize: '13px', color: '#a8a29e' }}>{r.owner_name} · {r.owner_email}</span>
                        <span style={{ fontSize: '15px', fontWeight: '700', color: '#f59e0b', display: 'block', fontFamily: 'JetBrains Mono,monospace', marginTop: '4px' }}>${r.quoted_price}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <IconBtn onClick={() => handlePayment(r, 'cash')} icon={<Banknote size={14} />} label="Cash"
                          color="#22c55e" bg="rgba(34,197,94,0.1)" border="rgba(34,197,94,0.2)" />
                        <IconBtn onClick={() => handlePayment(r, 'card')} icon={<CreditCard size={14} />} label="Card"
                          color="#a78bfa" bg="rgba(167,139,250,0.1)" border="rgba(167,139,250,0.2)" />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Paid history */}
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#22c55e', margin: '0 0 12px' }}>Payment History</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {paidRests.length === 0 && <div style={{ textAlign: 'center', padding: '32px', color: '#a8a29e' }}>No payments yet</div>}
              {paidRests.map(r => (
                <div key={r.id} style={{ ...cardStyle, border: '1px solid rgba(34,197,94,0.12)' }}>
                  <div>
                    <span style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', display: 'block', marginBottom: '4px' }}>{r.restaurant_name}</span>
                    <span style={{ fontSize: '13px', color: '#a8a29e' }}>{r.owner_name} · {r.owner_email}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' }}>
                      <span style={{ fontSize: '15px', fontWeight: '700', color: '#22c55e', fontFamily: 'JetBrains Mono,monospace' }}>${r.quoted_price}</span>
                      <Badge label={r.payment_method === 'cash' ? '💵 Cash' : '💳 Card'}
                        bg="rgba(34,197,94,0.1)" color="#22c55e" />
                      {r.payment_date && (
                        <span style={{ fontSize: '12px', color: '#a8a29e' }}>
                          {new Date(r.payment_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      )}
                    </div>
                  </div>
                  <Badge label="Paid" bg="rgba(34,197,94,0.15)" color="#22c55e" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Detail Modal ── */}
      <AnimatePresence>
        {selected && (
          <div
            onClick={() => setSelected(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
              zIndex: 100, display: 'flex', alignItems: 'flex-start',
              justifyContent: 'center', padding: '16px', overflowY: 'auto'
            }}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              onClick={e => e.stopPropagation()}
              style={{
                background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '580px',
                margin: 'auto'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#fef3c7', margin: 0 }}>
                  {selected.restaurant_name}{selected.branch_name ? ` — ${selected.branch_name}` : ''}
                </h2>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              {selectedType === 'application' && [
                ['Owner Name', selected.owner_name],
                ['Owner Email', selected.owner_email],
                ['Owner Phone', selected.owner_phone],
                ['National ID', selected.owner_national_id],
                ['Restaurant Type', selected.restaurant_type],
                ['Cuisine', selected.cuisine_type],
                ['City', selected.city],
                ['Region', selected.region],
                ['Address', selected.address],
                ['Restaurant Phone', selected.phone],
                ['WhatsApp', selected.whatsapp],
                ['Seating Capacity', selected.seating_capacity],
                ['Number of Tables', selected.num_tables],
                ['Opening Time', selected.opening_time],
                ['Closing Time', selected.closing_time],
                ['Days Open', selected.days_open],
                ['Has Delivery', selected.has_delivery ? 'Yes' : 'No'],
                ['Has Shisha', selected.has_shisha ? 'Yes' : 'No'],
                ['Has Outdoor Seating', selected.has_outdoor_seating ? 'Yes' : 'No'],
                ['Owners', selected.num_owners],
                ['Waiters', selected.num_waiters],
                ['Kitchen Staff', selected.num_kitchen],
                ['Delivery Drivers', selected.num_delivery],
                ['Total Employees', selected.total_employees],
                ['Pricing Tier', selected.pricing_tier],
                ['Quoted Price', `$${selected.quoted_price}`],
                ['Status', selected.status],
                ['Applied At', new Date(selected.applied_at).toLocaleString()],
                selected.rejection_reason && ['Rejection Reason', selected.rejection_reason],
              ].filter(Boolean).map(([l, v]) => <Field key={l} label={l} value={v} />)}

              {selectedType === 'restaurant' && [
                ['Owner Name', selected.owner_name],
                ['Owner Email', selected.owner_email],
                ['Owner Phone', selected.owner_phone],
                ['Restaurant Type', selected.restaurant_type],
                ['Cuisine', selected.cuisine_type],
                ['City', selected.city],
                ['Address', selected.address],
                ['Phone', selected.phone],
                ['Seating Capacity', selected.seating_capacity],
                ['Tables', selected.num_tables],
                ['Has Delivery', selected.has_delivery ? 'Yes' : 'No'],
                ['Has Shisha', selected.has_shisha ? 'Yes' : 'No'],
                ['Has Outdoor', selected.has_outdoor_seating ? 'Yes' : 'No'],
                ['Total Employees', selected.total_employees],
                ['Pricing Tier', selected.pricing_tier],
                ['Quoted Price', `$${selected.quoted_price}`],
                ['Payment Status', selected.payment_status],
                ['Payment Method', selected.payment_method],
                ['Payment Date', selected.payment_date ? new Date(selected.payment_date).toLocaleString() : 'Not paid yet'],
                ['Active', selected.is_active ? 'Yes' : 'No'],
                ['Member Since', new Date(selected.created_at).toLocaleDateString()],
              ].map(([l, v]) => <Field key={l} label={l} value={v} />)}

              {selectedType === 'application' && selected.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                  <button onClick={() => { setSelected(null); handleApprove(selected); }} style={{
                    flex: 1, padding: '12px', background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                    border: 'none', borderRadius: '10px', color: '#1c1917',
                    cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif'
                  }}>Approve</button>
                  <button onClick={() => { setSelected(null); handleReject(selected); }} style={{
                    flex: 1, padding: '12px', background: 'rgba(244,63,94,0.15)',
                    border: '1px solid rgba(244,63,94,0.3)', borderRadius: '10px',
                    color: '#f43f5e', cursor: 'pointer', fontSize: '14px', fontWeight: '600', fontFamily: 'Inter, sans-serif'
                  }}>Reject</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── Confirm Modal ── */}
      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          danger={confirm.danger}
          requireReason={confirm.requireReason}
          reasonPlaceholder={confirm.reasonPlaceholder}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* ── Change Password ── */}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
    </div>
  );
}