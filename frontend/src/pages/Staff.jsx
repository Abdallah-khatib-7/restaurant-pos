import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, X, Check, AlertTriangle,
  User, Lock, Eye, EyeOff, Car,
  Clock, Calendar, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FloatingNav, BottomNav } from './Dashboard';
import { useSocket } from '../context/SocketContext';
import useAuth from '../hooks/useAuth';

const DAYS = ['monday','tuesday','wednesday','thursday','friday','saturday','sunday'];

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
        }}><AlertTriangle size={20} /></div>
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

const roleConfig = {
  owner: { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'Owner' },
  waiter: { color: '#a78bfa', bg: 'rgba(167,139,250,0.15)', label: 'Waiter' },
  kitchen: { color: '#fb923c', bg: 'rgba(251,146,60,0.15)', label: 'Kitchen' },
  delivery_operator: { color: '#22c55e', bg: 'rgba(34,197,94,0.15)', label: 'Delivery Operator' },
  delivery: { color: '#38bdf8', bg: 'rgba(56,189,248,0.15)', label: 'Driver' },
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

export default function Staff() {
  const [staff, setStaff] = useState([]);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [activeRole, setActiveRole] = useState('all');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showPassword, setShowPassword] = useState(false);
  const { onlineUsers } = useSocket();
  const { user } = useAuth();

  // Get owner email domain
  const emailDomain = user?.email?.split('@')[1] || 'restaurant.com';

  const [form, setForm] = useState({
    username: '', password: '', role: 'waiter',
    car_type: '', car_color: '', plate_number: '', id_number: '', driver_license: ''
  });

  const [passwordForm, setPasswordForm] = useState({ new_password: '', confirm: '' });

  const [scheduleForm, setScheduleForm] = useState(
    DAYS.map(day => ({ day_of_week: day, enabled: false, start_time: '09:00', end_time: '17:00' }))
  );

  useEffect(() => {
    fetchStaff();
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api.get('/users');
      setStaff(res.data);
    } catch { toast.error('Failed to load staff'); }
  };

  const openStaffDetail = async (member) => {
    setSelectedStaff(member);
    try {
      const [sess, sched] = await Promise.all([
        api.get(`/sessions/user/${member.id}`),
        api.get(`/schedules/${member.id}`)
      ]);
      setSessions(sess.data);
      setSchedules(sched.data);

      // Init schedule form
      const schedMap = {};
      sched.data.forEach(s => { schedMap[s.day_of_week] = s; });
      setScheduleForm(DAYS.map(day => ({
        day_of_week: day,
        enabled: !!schedMap[day],
        start_time: schedMap[day]?.start_time?.slice(0,5) || '09:00',
        end_time: schedMap[day]?.end_time?.slice(0,5) || '17:00'
      })));
    } catch { toast.error('Failed to load staff details'); }
  };

  const addStaff = async () => {
    if (!form.username.trim()) return toast.error('Name is required');
if (!form.password || form.password.length < 6) return toast.error('Password must be at least 6 characters');
if (form.role === 'delivery') {
  if (!form.car_type.trim()) return toast.error('Car type is required for delivery staff');
  if (!form.car_color.trim()) return toast.error('Car color is required for delivery staff');
  if (!form.plate_number.trim()) return toast.error('Plate number is required for delivery staff');
  if (!form.id_number.trim()) return toast.error('ID number is required for delivery staff');
  if (!form.driver_license.trim()) return toast.error('Driver license is required for delivery staff');
}
    const email = `${form.username.trim().toLowerCase().replace(/\s+/g, '.')}@${emailDomain}`;
    try {
      await api.post('/users', {
        name: form.username,
        email,
        password: form.password,
        role: form.role,
        car_type: form.car_type || null,
        car_color: form.car_color || null,
        plate_number: form.plate_number || null,
        id_number: form.id_number || null,
        driver_license: form.driver_license || null,
      });
      toast.success(`Staff added — Email: ${email}`);
      setShowAddModal(false);
      setForm({ username: '', password: '', role: 'waiter', car_type: '', car_color: '', plate_number: '', id_number: '', driver_license: '' });
      fetchStaff();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteStaff = (member) => {
    setConfirm({
      title: 'Remove Staff Member',
      message: `Remove ${member.name}? They will no longer be able to log in.`,
      onConfirm: async () => {
        try {
          await api.delete(`/users/${member.id}`);
          toast.success('Staff member removed');
          setConfirm(null);
          if (selectedStaff?.id === member.id) setSelectedStaff(null);
          fetchStaff();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      }
    });
  };

  const resetPassword = async () => {
    if (!passwordForm.new_password || passwordForm.new_password.length < 6) return toast.error('Password must be at least 6 characters');
    if (passwordForm.new_password !== passwordForm.confirm) return toast.error('Passwords do not match');
    try {
      await api.put(`/users/${selectedStaff.id}`, {
        name: selectedStaff.name, email: selectedStaff.email,
        role: selectedStaff.role, car_type: selectedStaff.car_type,
        car_color: selectedStaff.car_color, plate_number: selectedStaff.plate_number,
        id_number: selectedStaff.id_number, driver_license: selectedStaff.driver_license,
      });
      toast.success('Password updated');
      setShowPasswordModal(false);
      setPasswordForm({ new_password: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const saveSchedule = async () => {
    const enabled = scheduleForm.filter(s => s.enabled);
    try {
      await api.post(`/schedules/${selectedStaff.id}`, { schedules: enabled });
      toast.success('Schedule saved');
      setShowScheduleModal(false);
      openStaffDetail(selectedStaff);
    } catch { toast.error('Failed to save schedule'); }
  };

  // Today's session for a user
  const getTodayHours = () => {
    const todaySessions = sessions.filter(s => {
      const d = new Date(s.login_at);
      const today = new Date();
      return d.toDateString() === today.toDateString();
    });
    const total = todaySessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0);
    const hrs = Math.floor(total / 60);
    const mins = total % 60;
    return total > 0 ? `${hrs}h ${mins}m` : '0h 0m';
  };

  const isOnline = (userId) => onlineUsers.some(u => u.user_id === userId);

  const filtered = staff.filter(s => activeRole === 'all' || s.role === activeRole);

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
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#fef3c7', margin: '0 0 4px', fontWeight: '700' }}>Staff</h1>
            <p style={{ fontSize: '14px', color: '#a8a29e', margin: 0 }}>
              {staff.length} members · <span style={{ color: '#22c55e' }}>{onlineUsers.length} online</span>
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)} style={{
              padding: '11px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              color: '#1c1917', cursor: 'pointer', fontSize: '14px',
              fontWeight: '600', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
            <Plus size={16} /> Add Staff
          </motion.button>
        </div>

        {/* Role filter */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {['all', 'owner', 'waiter', 'kitchen', 'delivery_operator', 'delivery'].map(role => (
            <button key={role} onClick={() => setActiveRole(role)} style={{
              padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
              background: activeRole === role ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(41,37,36,0.8)',
              color: activeRole === role ? '#1c1917' : '#a8a29e',
              fontSize: '13px', fontWeight: activeRole === role ? '600' : '400',
              fontFamily: 'Inter, sans-serif',
              border: activeRole === role ? 'none' : '1px solid #44403c'
            }}>
              {role.charAt(0).toUpperCase() + role.slice(1)}
              <span style={{ marginLeft: '6px', fontSize: '11px', opacity: 0.7 }}>
                {role === 'all' ? staff.length : staff.filter(s => s.role === role).length}
              </span>
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedStaff && !isMobile ? '1fr 380px' : '1fr', gap: '16px' }}>

          {/* Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px', alignContent: 'start' }}>
            {filtered.length === 0 ? (
              <div style={{ ...card, padding: '48px', textAlign: 'center', gridColumn: '1/-1' }}>
                <User size={40} style={{ color: '#44403c', marginBottom: '12px' }} />
                <p style={{ color: '#a8a29e', fontSize: '15px', margin: 0 }}>No staff in this role</p>
              </div>
            ) : filtered.map((member, i) => {
              const cfg = roleConfig[member.role];
              const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
              const online = isOnline(member.id);
              const isSelected = selectedStaff?.id === member.id;
              return (
                <motion.div key={member.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openStaffDetail(member)}
                  style={{
                    ...card, padding: '20px', cursor: 'pointer',
                    border: isSelected ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(245,158,11,0.12)',
                    transition: 'border 0.2s'
                  }}>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                    {/* Avatar with online dot */}
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: cfg?.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: '700', color: cfg?.color }}>{initials}</span>
                      </div>
                      <div style={{
                        position: 'absolute', top: '-3px', right: '-3px',
                        width: '12px', height: '12px', borderRadius: '50%',
                        background: online ? '#22c55e' : '#44403c',
                        border: '2px solid #292524',
                        boxShadow: online ? '0 0 6px #22c55e' : 'none'
                      }} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.name}</p>
                      <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.email}</p>
                      <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '20px', background: cfg?.bg, color: cfg?.color, fontWeight: '600' }}>{cfg?.label}</span>
                    </div>
                    <ChevronRight size={16} style={{ color: '#a8a29e', flexShrink: 0 }} />
                  </div>

                  {/* Online status text */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: online ? '#22c55e' : '#44403c' }} />
                    <span style={{ fontSize: '12px', color: online ? '#22c55e' : '#a8a29e' }}>
                      {online ? 'Online now' : 'Offline'}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Detail Panel */}
          <AnimatePresence>
            {selectedStaff && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  ...card, padding: '20px', height: 'fit-content',
                  position: 'sticky', top: '24px', overflowY: 'auto', maxHeight: '85vh'
                }}>

                {/* Panel header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ position: 'relative' }}>
                      <div style={{
                        width: '52px', height: '52px', borderRadius: '14px',
                        background: roleConfig[selectedStaff.role]?.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '18px', fontWeight: '700', color: roleConfig[selectedStaff.role]?.color }}>
                          {selectedStaff.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </span>
                      </div>
                      <div style={{
                        position: 'absolute', top: '-3px', right: '-3px',
                        width: '14px', height: '14px', borderRadius: '50%',
                        background: isOnline(selectedStaff.id) ? '#22c55e' : '#44403c',
                        border: '2px solid #292524',
                        boxShadow: isOnline(selectedStaff.id) ? '0 0 8px #22c55e' : 'none'
                      }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '17px', fontWeight: '600', color: '#fef3c7', margin: '0 0 2px' }}>{selectedStaff.name}</p>
                      <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{selectedStaff.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStaff(null)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Info fields */}
                {[
                  ['Role', roleConfig[selectedStaff.role]?.label],
                  selectedStaff.car_type && ['Vehicle', `${selectedStaff.car_type} · ${selectedStaff.car_color}`],
                  selectedStaff.plate_number && ['Plate', selectedStaff.plate_number],
                  selectedStaff.id_number && ['ID Number', selectedStaff.id_number],
                  selectedStaff.driver_license && ['Driver License', selectedStaff.driver_license],
                ].filter(Boolean).map(([label, value]) => (
                  <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(68,64,60,0.3)' }}>
                    <span style={{ fontSize: '12px', color: '#a8a29e' }}>{label}</span>
                    <span style={{ fontSize: '12px', color: '#fef3c7' }}>{value}</span>
                  </div>
                ))}

                {/* Today's hours */}
                <div style={{ marginTop: '16px', marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Today</p>
                  <div style={{ background: 'rgba(28,25,23,0.6)', borderRadius: '10px', padding: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Clock size={14} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '13px', color: '#fef3c7' }}>Hours worked</span>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: '700', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                        {getTodayHours()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Schedule */}
                {schedules.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Schedule</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {schedules.map(s => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(28,25,23,0.6)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '12px', color: '#fef3c7', textTransform: 'capitalize' }}>{s.day_of_week}</span>
                          <span style={{ fontSize: '12px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                            {s.start_time?.slice(0,5)} — {s.end_time?.slice(0,5)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent sessions */}
                {sessions.length > 0 && (
                  <div style={{ marginBottom: '16px' }}>
                    <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Sessions</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '150px', overflowY: 'auto' }}>
                      {sessions.slice(0, 10).map(s => (
                        <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', background: 'rgba(28,25,23,0.6)', borderRadius: '8px' }}>
                          <span style={{ fontSize: '11px', color: '#a8a29e' }}>
                            {new Date(s.login_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                          <span style={{ fontSize: '11px', color: '#fef3c7', fontFamily: 'JetBrains Mono,monospace' }}>
                            {s.duration_minutes > 0 ? `${Math.floor(s.duration_minutes/60)}h ${s.duration_minutes%60}m` : 'Active'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button onClick={() => setShowScheduleModal(true)} style={{
                    width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer',
                    background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
                    color: '#f59e0b', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}><Calendar size={14} /> Set Schedule</button>
                  <button onClick={() => setShowPasswordModal(true)} style={{
                    width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer',
                    background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)',
                    color: '#a78bfa', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}><Lock size={14} /> Reset Password</button>
                  <button onClick={() => deleteStaff(selectedStaff)} style={{
                    width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer',
                    background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)',
                    color: '#f43f5e', fontSize: '13px', fontFamily: 'Inter, sans-serif',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                  }}><Trash2 size={14} /> Remove Staff</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Staff Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div onClick={() => setShowAddModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 100, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', padding: '16px', overflowY: 'auto'
          }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              style={{
                background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', margin: 'auto'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: 0 }}>Add Staff Member</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              {/* Username with domain preview */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} placeholder="e.g. Ali Hassan"
                  style={{
                    width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
                    border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                  }}
                  onFocus={e => e.target.style.borderColor = '#f59e0b'}
                  onBlur={e => e.target.style.borderColor = '#44403c'} />
                {form.username && (
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: '6px 0 0' }}>
                    Email will be: <span style={{ color: '#f59e0b' }}>{form.username.trim().toLowerCase().replace(/\s+/g, '.')}@{emailDomain}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPassword ? 'text' : 'password'} value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Min 6 characters"
                    style={{
                      width: '100%', padding: '11px 36px 11px 12px', background: 'rgba(28,25,23,0.9)',
                      border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                      fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                    }}
                    onFocus={e => e.target.style.borderColor = '#f59e0b'}
                    onBlur={e => e.target.style.borderColor = '#44403c'} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                    position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer', padding: 0
                  }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
              </div>

              {/* Role */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '8px' }}>
                  {['waiter', 'kitchen', 'delivery_operator', 'delivery', 'owner'].map(role => {
                    const cfg = roleConfig[role];
                    return (
                      <button key={role} onClick={() => setForm({ ...form, role })} style={{
                        padding: '10px', borderRadius: '10px', cursor: 'pointer',
                        background: form.role === role ? cfg.bg : 'rgba(68,64,60,0.3)',
                        color: form.role === role ? cfg.color : '#a8a29e',
                        border: form.role === role ? `1px solid ${cfg.color}40` : '1px solid #44403c',
                        fontSize: '13px', fontWeight: form.role === role ? '600' : '400',
                        fontFamily: 'Inter, sans-serif'
                      }}>{cfg.label}</button>
                    );
                  })}
                </div>
              </div>

              {/* Delivery extra fields — optional */}
              {form.role === 'delivery' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div style={{ height: '1px', background: 'rgba(68,64,60,0.4)', margin: '4px 0 16px' }} />
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Car size={13} /> Vehicle Info <span style={{ color: '#44403c' }}>*Required*</span>
                  </p>
                  <Input label="Car Type" value={form.car_type} onChange={e => setForm({ ...form, car_type: e.target.value })} placeholder="e.g. Toyota Corolla" />
                  <Input label="Car Color" value={form.car_color} onChange={e => setForm({ ...form, car_color: e.target.value })} placeholder="e.g. White" />
                  <Input label="Plate Number" value={form.plate_number} onChange={e => setForm({ ...form, plate_number: e.target.value })} placeholder="e.g. 287643 ب" />
                  <Input label="ID / Passport Number" value={form.id_number} onChange={e => setForm({ ...form, id_number: e.target.value })} placeholder=" 1234567 or RL1234567" />
                  <Input label="Driver License" value={form.driver_license} onChange={e => setForm({ ...form, driver_license: e.target.value })} placeholder="123456/2019 (number/year of issue)" />
                </motion.div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={addStaff} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#1c1917', fontWeight: '600', cursor: 'pointer',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}><Check size={16} /> Add Staff</motion.button>
                <button onClick={() => setShowAddModal(false)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
                  color: '#a8a29e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
                }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Modal */}
      <AnimatePresence>
        {showScheduleModal && selectedStaff && (
          <div onClick={() => setShowScheduleModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 100, display: 'flex', alignItems: 'flex-start',
            justifyContent: 'center', padding: '16px', overflowY: 'auto'
          }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              style={{
                background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '480px', margin: 'auto'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: 0 }}>Set Schedule</h2>
                <button onClick={() => setShowScheduleModal(false)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 20px' }}>{selectedStaff.name}'s working hours</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {scheduleForm.map((s, i) => (
                  <div key={s.day_of_week} style={{
                    background: s.enabled ? 'rgba(245,158,11,0.08)' : 'rgba(28,25,23,0.4)',
                    border: `1px solid ${s.enabled ? 'rgba(245,158,11,0.2)' : '#44403c'}`,
                    borderRadius: '12px', padding: '12px 14px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <button onClick={() => {
                          const updated = [...scheduleForm];
                          updated[i] = { ...updated[i], enabled: !updated[i].enabled };
                          setScheduleForm(updated);
                        }} style={{
                          width: '36px', height: '20px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                          background: s.enabled ? 'rgba(245,158,11,0.3)' : 'rgba(68,64,60,0.5)',
                          position: 'relative', transition: 'all 0.2s', padding: 0, flexShrink: 0
                        }}>
                          <div style={{
                            width: '14px', height: '14px', borderRadius: '50%',
                            background: s.enabled ? '#f59e0b' : '#44403c',
                            position: 'absolute', top: '3px',
                            left: s.enabled ? '19px' : '3px', transition: 'all 0.2s'
                          }} />
                        </button>
                        <span style={{ fontSize: '14px', color: s.enabled ? '#fef3c7' : '#a8a29e', textTransform: 'capitalize', fontWeight: s.enabled ? '600' : '400' }}>
                          {s.day_of_week}
                        </span>
                      </div>
                      {s.enabled && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <input type="time" value={s.start_time} onChange={e => {
                            const updated = [...scheduleForm];
                            updated[i] = { ...updated[i], start_time: e.target.value };
                            setScheduleForm(updated);
                          }} style={{
                            background: 'rgba(28,25,23,0.8)', border: '1px solid #44403c',
                            borderRadius: '6px', color: '#fef3c7', padding: '4px 8px',
                            fontSize: '13px', outline: 'none', fontFamily: 'JetBrains Mono,monospace'
                          }} />
                          <span style={{ color: '#a8a29e', fontSize: '12px' }}>to</span>
                          <input type="time" value={s.end_time} onChange={e => {
                            const updated = [...scheduleForm];
                            updated[i] = { ...updated[i], end_time: e.target.value };
                            setScheduleForm(updated);
                          }} style={{
                            background: 'rgba(28,25,23,0.8)', border: '1px solid #44403c',
                            borderRadius: '6px', color: '#fef3c7', padding: '4px 8px',
                            fontSize: '13px', outline: 'none', fontFamily: 'JetBrains Mono,monospace'
                          }} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={saveSchedule} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#1c1917', fontWeight: '600', cursor: 'pointer',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}><Check size={16} /> Save Schedule</motion.button>
                <button onClick={() => setShowScheduleModal(false)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
                  color: '#a8a29e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
                }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Reset Password Modal */}
      <AnimatePresence>
        {showPasswordModal && selectedStaff && (
          <div onClick={() => setShowPasswordModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              style={{
                background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '380px'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: 0 }}>Reset Password</h2>
                <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><X size={20} /></button>
              </div>
              <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 20px' }}>New password for {selectedStaff.name}</p>

              <Input label="New Password" type="password" value={passwordForm.new_password}
                onChange={e => setPasswordForm({ ...passwordForm, new_password: e.target.value })} placeholder="Min 6 characters" />
              <Input label="Confirm Password" type="password" value={passwordForm.confirm}
                onChange={e => setPasswordForm({ ...passwordForm, confirm: e.target.value })} placeholder="Repeat password" />

              <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={resetPassword} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#1c1917', fontWeight: '600', cursor: 'pointer',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}><Check size={16} /> Update</motion.button>
                <button onClick={() => setShowPasswordModal(false)} style={{
                  flex: 1, padding: '12px', borderRadius: '10px',
                  background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
                  color: '#a8a29e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
                }}>Cancel</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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