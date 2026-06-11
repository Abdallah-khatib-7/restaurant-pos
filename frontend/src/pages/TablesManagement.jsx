import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, X, Check, AlertTriangle,
  Users, Table2, ChefHat, DollarSign, Percent,
   Tag
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { FloatingNav, BottomNav } from './Dashboard';

// ── Confirm Modal ─────────────────────────────────────────────────────────────
const ConfirmModal = ({ title, message, onConfirm, onCancel, warning }) => (
  <div style={{
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
    zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
  }}>
    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      style={{
        background: '#292524', border: `1px solid ${warning ? 'rgba(251,191,36,0.3)' : 'rgba(244,63,94,0.3)'}`,
        borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '400px'
      }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: warning ? 'rgba(251,191,36,0.15)' : 'rgba(244,63,94,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: warning ? '#fbbf24' : '#f43f5e', flexShrink: 0
        }}><AlertTriangle size={20} /></div>
        <h3 style={{ fontSize: '17px', fontWeight: '600', color: '#fef3c7', margin: 0 }}>{title}</h3>
      </div>
      <p style={{ fontSize: '14px', color: '#a8a29e', margin: '0 0 20px', lineHeight: '1.6' }}>{message}</p>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={onConfirm} style={{
          flex: 1, padding: '11px', borderRadius: '10px',
          background: warning ? 'rgba(251,191,36,0.2)' : 'rgba(244,63,94,0.2)',
          border: warning ? '1px solid rgba(251,191,36,0.3)' : '1px solid rgba(244,63,94,0.3)',
          color: warning ? '#fbbf24' : '#f43f5e', fontWeight: '600',
          cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
        }}>Yes, Confirm</button>
        <button onClick={onCancel} style={{
          flex: 1, padding: '11px', borderRadius: '10px',
          background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
          color: '#a8a29e', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
        }}>Cancel</button>
      </div>
    </motion.div>
  </div>
);

const statusConfig = {
  free: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.3)', label: 'Free' },
  occupied: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', label: 'Occupied' },
  bill_requested: { color: '#f43f5e', bg: 'rgba(244,63,94,0.12)', border: 'rgba(244,63,94,0.3)', label: 'Bill' },
};

export default function TablesManagement() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableOrder, setTableOrder] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [form, setForm] = useState({ number: '', capacity: 4 });
  const [discountInput, setDiscountInput] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    fetchTables();
    const r = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', r);
    return () => window.removeEventListener('resize', r);
  }, []);

  const fetchTables = async () => {
    try {
      const res = await api.get('/tables');
      setTables(res.data);
    } catch { toast.error('Failed to load tables'); }
  };

  const fetchTableOrder = async (table) => {
    setSelectedTable(table);
    setDiscountInput('');
    if (table.status === 'free') { setTableOrder(null); return; }
    try {
      const res = await api.get('/orders');
      const active = res.data.find(o =>
        o.table_id === table.id && ['pending', 'preparing', 'ready'].includes(o.status)
      );
      if (active) {
        const detail = await api.get(`/orders/${active.id}`);
        setTableOrder(detail.data);
      } else {
        setTableOrder(null);
      }
    } catch { toast.error('Failed to load order'); }
  };

  const addTable = async () => {
    if (!form.number) return toast.error('Table number is required');
    if (tables.find(t => t.number === parseInt(form.number))) return toast.error('Table number already exists');
    try {
      await api.post('/tables', form);
      toast.success('Table added');
      setShowAddModal(false);
      setForm({ number: '', capacity: 4 });
      fetchTables();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteTable = (table) => {
    if (table.status !== 'free') return toast.error('Cannot delete an occupied table');
    setConfirm({
      title: 'Delete Table',
      message: `Delete Table ${table.number}? This cannot be undone.`,
      warning: false,
      onConfirm: async () => {
        try {
          await api.delete(`/tables/${table.id}`);
          toast.success('Table deleted');
          setConfirm(null);
          if (selectedTable?.id === table.id) setSelectedTable(null);
          fetchTables();
        } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
      }
    });
  };

  const changeStatus = async (table, status) => {
    try {
      await api.put(`/tables/${table.id}/status`, { status });
      toast.success('Status updated');
      fetchTables();
      if (selectedTable?.id === table.id) {
        setSelectedTable({ ...table, status });
        if (status === 'free') setTableOrder(null);
      }
    } catch { toast.error('Failed'); }
  };

  const applyDiscount = (order) => {
    const pct = parseFloat(discountInput);
    if (isNaN(pct) || pct < 0 || pct > 100) return toast.error('Enter a valid discount between 0-100%');

    const doApply = async () => {
      try {
        const res = await api.put(`/orders/${order.id}/discount`, { discount_percent: pct });
        toast.success(`Discount applied — New total: $${res.data.final_total}`);
        setConfirm(null);
        fetchTableOrder(selectedTable);
      } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    };

    if (pct === 100) {
      setConfirm({
        title: '100% Discount',
        message: 'This will make the order completely free. Are you sure?',
        warning: true,
        onConfirm: doApply
      });
    } else if (pct > 40) {
      setConfirm({
        title: 'Large Discount Warning',
        message: `You are applying a ${pct}% discount. This is above 40%. Did you enter this correctly?`,
        warning: true,
        onConfirm: doApply
      });
    } else {
      doApply();
    }
  };

  const free = tables.filter(t => t.status === 'free').length;
  const occupied = tables.filter(t => t.status === 'occupied').length;
  const bill = tables.filter(t => t.status === 'bill_requested').length;

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>
      {!isMobile ? <FloatingNav /> : <BottomNav />}

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '16px 16px 100px' : '24px 24px 40px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '28px', color: '#fef3c7', margin: '0 0 4px', fontWeight: '700' }}>Tables</h1>
            <p style={{ fontSize: '14px', color: '#a8a29e', margin: 0 }}>{tables.length} tables total</p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowAddModal(true)} style={{
              padding: '11px 20px', borderRadius: '10px', border: 'none',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              color: '#1c1917', cursor: 'pointer', fontSize: '14px',
              fontWeight: '600', fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', gap: '6px'
            }}>
            <Plus size={16} /> Add Table
          </motion.button>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '12px', marginBottom: '24px' }}>
          {[
            { label: 'Free', value: free, color: '#22c55e' },
            { label: 'Occupied', value: occupied, color: '#f59e0b' },
            { label: 'Bill Requested', value: bill, color: '#f43f5e' },
            { label: 'Total Tables', value: tables.length, color: '#a78bfa' },
          ].map((s, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              style={{
                background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
                borderRadius: '14px', padding: '16px'
              }}>
              <p style={{ fontSize: '28px', fontWeight: '700', color: s.color, margin: '0 0 4px', fontFamily: 'JetBrains Mono,monospace' }}>{s.value}</p>
              <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main grid */}
        <div style={{ display: 'grid', gridTemplateColumns: selectedTable ? (isMobile ? '1fr' : '1fr 380px') : '1fr', gap: '16px' }}>

          {/* Floor Plan */}
          <div style={{
            background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.12)',
            borderRadius: '20px', padding: '24px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fef3c7', margin: 0 }}>Floor Plan</h3>
              <div style={{ display: 'flex', gap: '16px' }}>
                {Object.entries(statusConfig).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: val.color }} />
                    <span style={{ fontSize: '12px', color: '#a8a29e' }}>{val.label}</span>
                  </div>
                ))}
              </div>
              <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0, marginLeft: 'auto' }}>Click a table to manage it</p>
            </div>

            {tables.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px' }}>
                <Table2 size={48} style={{ color: '#44403c', marginBottom: '16px' }} />
                <p style={{ color: '#a8a29e', fontSize: '15px', margin: 0 }}>No tables added yet</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '10px' }}>
                <AnimatePresence>
                  {tables.map((table, i) => {
                    const cfg = statusConfig[table.status];
                    const isSelected = selectedTable?.id === table.id;
                    return (
                      <motion.div key={table.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ delay: i * 0.03 }}
                        whileHover={{ scale: 1.05 }}
                        onClick={() => fetchTableOrder(table)}
                        style={{
                          background: isSelected ? cfg.color + '25' : cfg.bg,
                          border: `${isSelected ? '2.5px' : '1.5px'} solid ${cfg.border}`,
                          borderRadius: '14px', padding: '16px 12px',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', gap: '6px',
                          cursor: 'pointer', position: 'relative',
                          boxShadow: isSelected ? `0 0 20px ${cfg.color}30` : 'none',
                          transition: 'box-shadow 0.2s'
                        }}>

                        {table.status === 'free' && (
                          <button onClick={e => { e.stopPropagation(); deleteTable(table); }} style={{
                            position: 'absolute', top: '6px', right: '6px',
                            background: 'rgba(244,63,94,0.15)', border: 'none',
                            borderRadius: '6px', padding: '3px', color: '#f43f5e',
                            cursor: 'pointer', display: 'flex', alignItems: 'center'
                          }}><Trash2 size={11} /></button>
                        )}

                        <span style={{ fontSize: '26px', fontWeight: '800', color: cfg.color, fontFamily: 'JetBrains Mono,monospace' }}>{table.number}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Users size={11} style={{ color: cfg.color, opacity: 0.7 }} />
                          <span style={{ fontSize: '11px', color: cfg.color, opacity: 0.7 }}>{table.capacity}</span>
                        </div>
                        <span style={{ fontSize: '10px', color: cfg.color, fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{cfg.label}</span>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Table Detail Panel */}
          <AnimatePresence>
            {selectedTable && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                style={{
                  background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.15)',
                  borderRadius: '20px', padding: '20px', height: 'fit-content',
                  position: 'sticky', top: '24px'
                }}>

                {/* Panel header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: '0 0 2px' }}>
                      Table {selectedTable.number}
                    </h3>
                    <span style={{
                      fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: '600',
                      background: statusConfig[selectedTable.status]?.bg,
                      color: statusConfig[selectedTable.status]?.color
                    }}>{statusConfig[selectedTable.status]?.label}</span>
                  </div>
                  <button onClick={() => setSelectedTable(null)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}>
                    <X size={20} />
                  </button>
                </div>

                {/* Status controls */}
                <div style={{ marginBottom: '16px' }}>
                  <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Change Status</p>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    {Object.entries(statusConfig).map(([key, val]) => (
                      <button key={key} onClick={() => changeStatus(selectedTable, key)}
                        disabled={selectedTable.status === key}
                        style={{
                          padding: '6px 12px', borderRadius: '8px', border: 'none', cursor: selectedTable.status === key ? 'default' : 'pointer',
                          background: selectedTable.status === key ? val.bg : 'rgba(68,64,60,0.4)',
                          color: selectedTable.status === key ? val.color : '#a8a29e',
                          fontSize: '12px', fontWeight: selectedTable.status === key ? '600' : '400',
                          fontFamily: 'Inter, sans-serif', opacity: selectedTable.status === key ? 1 : 0.7
                        }}>{val.label}</button>
                    ))}
                  </div>
                </div>

                <div style={{ height: '1px', background: 'rgba(68,64,60,0.4)', marginBottom: '16px' }} />

                {/* Order details */}
                {tableOrder ? (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <ChefHat size={16} style={{ color: '#f59e0b' }} />
                      <span style={{ fontSize: '13px', color: '#a8a29e' }}>Waiter: </span>
                      <span style={{ fontSize: '13px', color: '#fef3c7', fontWeight: '600' }}>{tableOrder.waiter_name}</span>
                    </div>

                    {/* Items */}
                    <div style={{ marginBottom: '14px' }}>
                      <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Items</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {tableOrder.items?.map(item => (
                          <div key={item.id} style={{
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            padding: '8px 10px', borderRadius: '8px', background: 'rgba(28,25,23,0.6)'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '22px', height: '22px', borderRadius: '6px',
                                background: 'rgba(245,158,11,0.15)', color: '#f59e0b',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '11px', fontWeight: '700', flexShrink: 0
                              }}>{item.quantity}</span>
                              <span style={{ fontSize: '13px', color: '#fef3c7' }}>{item.item_name}</span>
                            </div>
                            <span style={{ fontSize: '13px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace' }}>
                              ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Totals */}
                    <div style={{
                      background: 'rgba(28,25,23,0.6)', borderRadius: '10px', padding: '12px',
                      marginBottom: '14px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ fontSize: '13px', color: '#a8a29e' }}>Subtotal</span>
                        <span style={{ fontSize: '13px', color: '#fef3c7', fontFamily: 'JetBrains Mono,monospace' }}>${parseFloat(tableOrder.total).toFixed(2)}</span>
                      </div>
                      {tableOrder.discount_percent > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '13px', color: '#22c55e' }}>Discount ({tableOrder.discount_percent}%)</span>
                          <span style={{ fontSize: '13px', color: '#22c55e', fontFamily: 'JetBrains Mono,monospace' }}>-${parseFloat(tableOrder.discount_amount).toFixed(2)}</span>
                        </div>
                      )}
                      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid rgba(68,64,60,0.4)' }}>
                        <span style={{ fontSize: '15px', color: '#fef3c7', fontWeight: '600' }}>Total</span>
                        <span style={{ fontSize: '15px', color: '#f59e0b', fontWeight: '700', fontFamily: 'JetBrains Mono,monospace' }}>
                          ${parseFloat(tableOrder.final_total || tableOrder.total).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Discount input */}
                    <div>
                      <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Apply Discount</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                          <input
                            type="number" min="0" max="100"
                            value={discountInput}
                            onChange={e => setDiscountInput(e.target.value)}
                            placeholder="0"
                            style={{
                              width: '100%', padding: '10px 32px 10px 12px',
                              background: 'rgba(28,25,23,0.9)', border: '1px solid #44403c',
                              borderRadius: '10px', color: '#fef3c7', fontSize: '14px',
                              outline: 'none', boxSizing: 'border-box', fontFamily: 'JetBrains Mono,monospace'
                            }}
                            onFocus={e => e.target.style.borderColor = '#f59e0b'}
                            onBlur={e => e.target.style.borderColor = '#44403c'} />
                          <Percent size={14} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', color: '#a8a29e' }} />
                        </div>
                        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => applyDiscount(tableOrder)} style={{
                            padding: '10px 16px', borderRadius: '10px', border: 'none',
                            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                            color: '#1c1917', cursor: 'pointer', fontSize: '13px',
                            fontWeight: '600', fontFamily: 'Inter, sans-serif',
                            display: 'flex', alignItems: 'center', gap: '5px'
                          }}>
                          <Tag size={14} /> Apply
                        </motion.button>
                      </div>
                      {discountInput && parseFloat(discountInput) > 0 && (
                        <p style={{ fontSize: '12px', color: '#a8a29e', margin: '6px 0 0' }}>
                          New total: <span style={{ color: '#22c55e', fontFamily: 'JetBrains Mono,monospace' }}>
                            ${(parseFloat(tableOrder.total) * (1 - parseFloat(discountInput) / 100)).toFixed(2)}
                          </span>
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div style={{ textAlign: 'center', padding: '24px 0' }}>
                    <DollarSign size={32} style={{ color: '#44403c', marginBottom: '8px' }} />
                    <p style={{ color: '#a8a29e', fontSize: '14px', margin: 0 }}>
                      {selectedTable.status === 'free' ? 'This table is free' : 'No active order found'}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Add Table Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div onClick={() => setShowAddModal(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
            zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px'
          }}>
            <motion.div onClick={e => e.stopPropagation()}
              initial={{ scale: 0.93, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.93, opacity: 0 }}
              style={{
                background: '#292524', border: '1px solid rgba(245,158,11,0.2)',
                borderRadius: '20px', padding: '28px', width: '100%', maxWidth: '380px'
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', color: '#fef3c7', margin: 0 }}>Add Table</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: '#a8a29e', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Table Number</label>
                <input type="number" value={form.number} onChange={e => setForm({ ...form, number: e.target.value })} placeholder="e.g. 11"
                  style={{
                    width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
                    border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
                    fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                  }}
                  onFocus={e => e.target.style.borderColor = '#f59e0b'}
                  onBlur={e => e.target.style.borderColor = '#44403c'} />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Capacity</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '8px' }}>
                  {[2, 4, 6, 8].map(cap => (
                    <button key={cap} onClick={() => setForm({ ...form, capacity: cap })} style={{
                      padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer',
                      background: form.capacity === cap ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(68,64,60,0.4)',
                      color: form.capacity === cap ? '#1c1917' : '#a8a29e',
                      fontWeight: form.capacity === cap ? '700' : '400',
                      fontSize: '14px', fontFamily: 'JetBrains Mono, monospace'
                    }}>{cap}</button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} onClick={addTable} style={{
                  flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#1c1917', fontWeight: '600', cursor: 'pointer',
                  fontSize: '14px', fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}><Check size={16} /> Add Table</motion.button>
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

      {confirm && (
        <ConfirmModal
          title={confirm.title}
          message={confirm.message}
          warning={confirm.warning}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
}