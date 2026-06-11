import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, ChevronRight, ChevronLeft,
  Check, Building2, User, 
  Clock, Users, DollarSign
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';

const RESTAURANT_TYPES = [
  'Lebanese', 'Italian', 'French', 'Japanese', 'Chinese', 'Indian',
  'Mexican', 'American', 'Fast Food', 'Cafe', 'Bakery', 'Seafood',
  'Steakhouse', 'Pizza', 'Sushi', 'Shawarma & Sandwiches',
  'Mixed Oriental', 'Rooftop Bar', 'Lounge', 'Other'
];

const CUISINE_TYPES = [
  'Mixed Oriental', 'Lebanese', 'Mediterranean', 'Continental',
  'Asian Fusion', 'Fast Food', 'Healthy', 'Vegan', 'Seafood',
  'Grills & BBQ', 'Pastry & Desserts', 'International', 'Other'
];

const CITIES = [
  'Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Jounieh', 'Batroun',
  'Byblos', 'Zahle', 'Baalbek', 'Nabatieh', 'Aley', 'Broummana', 'Other'
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const DAYS_FULL = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const getPricingTier = (total) => {
  if (total <= 5) return { tier: '1-5 employees', price: 499 };
  if (total <= 15) return { tier: '6-15 employees', price: 999 };
  if (total <= 30) return { tier: '16-30 employees', price: 1499 };
  return { tier: '30+ employees', price: 2499 };
};

const Input = ({ label, required, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label} {required && <span style={{ color: '#f43f5e' }}>*</span>}
    </label>
    <input {...props} style={{
      width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
      border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
      fontSize: '14px', outline: 'none', boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
    }}
      onFocus={e => e.target.style.borderColor = '#f59e0b'}
      onBlur={e => e.target.style.borderColor = '#44403c'} />
  </div>
);

const Select = ({ label, required, children, ...props }) => (
  <div style={{ marginBottom: '16px' }}>
    <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
      {label} {required && <span style={{ color: '#f43f5e' }}>*</span>}
    </label>
    <select {...props} style={{
      width: '100%', padding: '11px 12px', background: 'rgba(28,25,23,0.9)',
      border: '1px solid #44403c', borderRadius: '10px', color: '#fef3c7',
      fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif'
    }}>
      {children}
    </select>
  </div>
);

const Toggle = ({ label, value, onChange }) => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
    <span style={{ fontSize: '14px', color: '#fef3c7' }}>{label}</span>
    <button onClick={() => onChange(!value)} style={{
      width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
      background: value ? 'rgba(245,158,11,0.3)' : 'rgba(68,64,60,0.5)',
      position: 'relative', transition: 'all 0.2s', padding: 0, flexShrink: 0
    }}>
      <div style={{
        width: '16px', height: '16px', borderRadius: '50%',
        background: value ? '#f59e0b' : '#44403c',
        position: 'absolute', top: '4px',
        left: value ? '24px' : '4px', transition: 'all 0.2s'
      }} />
    </button>
  </div>
);

const STEPS = [
  { title: 'Owner Info', icon: User },
  { title: 'Restaurant Info', icon: Building2 },
  { title: 'Operations', icon: Clock },
  { title: 'Staff & Pricing', icon: Users },
];

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quotedPrice, setQuotedPrice] = useState(null);

  const [form, setForm] = useState({
    // Owner
    owner_name: '', owner_email: '', owner_phone: '', owner_national_id: '',
    // Restaurant
    restaurant_name: '', branch_name: '', restaurant_type: '', cuisine_type: '',
    address: '', city: '', region: '', google_maps_link: '', phone: '', whatsapp: '',
    // Operations
    seating_capacity: '', num_tables: '', opening_time: '12:00', closing_time: '00:00',
    days_open: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    has_delivery: false, has_shisha: false, has_outdoor_seating: false,
    // Staff
    num_owners: 1, num_waiters: '', num_kitchen: '', num_delivery: 0,
  });

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }));

  const toggleDay = (day) => {
    const days = form.days_open.includes(day)
      ? form.days_open.filter(d => d !== day)
      : [...form.days_open, day];
    set('days_open', days);
  };

  const totalEmployees = (parseInt(form.num_owners) || 0) +
    (parseInt(form.num_waiters) || 0) +
    (parseInt(form.num_kitchen) || 0) +
    (parseInt(form.num_delivery) || 0);

  const pricing = getPricingTier(totalEmployees);

  const validateStep = () => {
    if (step === 0) {
      if (!form.owner_name.trim()) return toast.error('Owner name is required');
      if (!form.owner_email.trim()) return toast.error('Owner email is required');
      if (!form.owner_phone.trim()) return toast.error('Owner phone is required');
      if (!form.owner_national_id.trim()) return toast.error('National ID is required');
    }
    if (step === 1) {
      if (!form.restaurant_name.trim()) return toast.error('Restaurant name is required');
      if (!form.restaurant_type) return toast.error('Restaurant type is required');
      if (!form.cuisine_type) return toast.error('Cuisine type is required');
      if (!form.address.trim()) return toast.error('Address is required');
      if (!form.city) return toast.error('City is required');
      if (!form.phone.trim()) return toast.error('Phone is required');
    }
    if (step === 2) {
      if (!form.seating_capacity) return toast.error('Seating capacity is required');
      if (!form.num_tables) return toast.error('Number of tables is required');
      if (form.days_open.length === 0) return toast.error('Select at least one day');
    }
    if (step === 3) {
      if (!form.num_waiters) return toast.error('Number of waiters is required');
      if (!form.num_kitchen) return toast.error('Number of kitchen staff is required');
    }
    return true;
  };

  const next = () => {
    if (validateStep() !== true) return;
    setStep(s => s + 1);
  };

  const submit = async () => {
    if (validateStep() !== true) return;
    setLoading(true);
    try {
      const daysString = form.days_open.map(d => DAYS_FULL[DAYS.indexOf(d)]).join(',');
      await api.post('/applications', {
        ...form,
        days_open: daysString,
        seating_capacity: parseInt(form.seating_capacity),
        num_tables: parseInt(form.num_tables),
        num_owners: parseInt(form.num_owners) || 1,
        num_waiters: parseInt(form.num_waiters),
        num_kitchen: parseInt(form.num_kitchen),
        num_delivery: parseInt(form.num_delivery) || 0,
      });
      setQuotedPrice(pricing.price);
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ minHeight: '100vh', background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', fontFamily: 'Inter, sans-serif' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{
            background: 'rgba(41,37,36,0.9)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '24px', padding: '40px', maxWidth: '480px', width: '100%', textAlign: 'center'
          }}>
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: 'rgba(34,197,94,0.15)', border: '2px solid #22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px'
          }}>
            <Check size={32} style={{ color: '#22c55e' }} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '26px', color: '#fef3c7', margin: '0 0 12px', fontWeight: '700' }}>
            Application Submitted!
          </h2>
          <p style={{ fontSize: '15px', color: '#a8a29e', margin: '0 0 20px', lineHeight: '1.6' }}>
            Thank you for applying to Tawla. We will review your application and contact you within 24 hours.
          </p>
          <div style={{
            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)',
            borderRadius: '14px', padding: '16px', marginBottom: '24px'
          }}>
            <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 4px' }}>One-time license fee</p>
            <p style={{ fontSize: '32px', fontWeight: '700', color: '#f59e0b', margin: '0 0 4px', fontFamily: 'JetBrains Mono,monospace' }}>${quotedPrice}</p>
            <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{pricing.tier}</p>
          </div>
          <button onClick={() => navigate('/login')} style={{
            width: '100%', padding: '13px', borderRadius: '12px', border: 'none',
            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
            color: '#1c1917', fontWeight: '600', cursor: 'pointer',
            fontSize: '15px', fontFamily: 'Inter, sans-serif'
          }}>Go to Login</button>
        </motion.div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <div style={{
        background: 'rgba(41,37,36,0.97)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245,158,11,0.15)',
        padding: '0 24px', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '60px'
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
        </div>
        <button onClick={() => navigate('/login')} style={{
          background: 'none', border: '1px solid #44403c', borderRadius: '8px',
          padding: '6px 14px', color: '#a8a29e', cursor: 'pointer', fontSize: '13px',
          fontFamily: 'Inter, sans-serif'
        }}>Login</button>
      </div>

      <div style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 16px 60px' }}>

        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{ fontFamily: "'Playfair Display',serif", fontSize: '32px', color: '#fef3c7', margin: '0 0 8px', fontWeight: '900' }}>
            Apply for Tawla
          </h1>
          <p style={{ fontSize: '15px', color: '#a8a29e', margin: 0 }}>
            Complete the form below and we'll get back to you within 24 hours
          </p>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '32px' }}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: i < step ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                    : i === step ? 'rgba(245,158,11,0.2)' : 'rgba(68,64,60,0.4)',
                  border: i === step ? '2px solid #f59e0b' : '2px solid transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: i <= step ? '#f59e0b' : '#a8a29e', transition: 'all 0.3s'
                }}>
                  {i < step ? <Check size={16} color="#1c1917" /> : <Icon size={16} />}
                </div>
                {i < STEPS.length - 1 && (
                  <div style={{ width: '32px', height: '2px', background: i < step ? '#f59e0b' : '#44403c', borderRadius: '1px' }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(41,37,36,0.8)', border: '1px solid rgba(245,158,11,0.15)',
          borderRadius: '20px', padding: '28px'
        }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', color: '#fef3c7', margin: '0 0 24px', fontWeight: '700' }}>
            {STEPS[step].title}
          </h2>

          <AnimatePresence mode="wait">
            <motion.div key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}>

              {/* Step 0 — Owner Info */}
              {step === 0 && (
                <div>
                  <Input label="Full Name" required value={form.owner_name} onChange={e => set('owner_name', e.target.value)} placeholder="e.g. Georges Habib" />
                  <Input label="Email Address" required type="email" value={form.owner_email} onChange={e => set('owner_email', e.target.value)} placeholder="georges@restaurant.com" />
                  <Input label="Phone Number" required value={form.owner_phone} onChange={e => set('owner_phone', e.target.value)} placeholder="e.g. 70123456" />
                  <Input label="National ID / Passport" required value={form.owner_national_id} onChange={e => set('owner_national_id', e.target.value)} placeholder="e.g. 1234567 or RL1234567" />
                </div>
              )}

              {/* Step 1 — Restaurant Info */}
              {step === 1 && (
                <div>
                  <Input label="Restaurant Name" required value={form.restaurant_name} onChange={e => set('restaurant_name', e.target.value)} placeholder="e.g. Beirut Foods" />
                  <Input label="Branch Name (optional)" value={form.branch_name} onChange={e => set('branch_name', e.target.value)} placeholder="e.g. Hamra Branch" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <Select label="Restaurant Type" required value={form.restaurant_type} onChange={e => set('restaurant_type', e.target.value)}>
                      <option value="">Select type...</option>
                      {RESTAURANT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                    <Select label="Cuisine Type" required value={form.cuisine_type} onChange={e => set('cuisine_type', e.target.value)}>
                      <option value="">Select cuisine...</option>
                      {CUISINE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </Select>
                  </div>
                  <Input label="Address" required value={form.address} onChange={e => set('address', e.target.value)} placeholder="Street, Building" />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <Select label="City" required value={form.city} onChange={e => set('city', e.target.value)}>
                      <option value="">Select city...</option>
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </Select>
                    <Input label="Region" value={form.region} onChange={e => set('region', e.target.value)} placeholder="e.g. Hamra" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <Input label="Phone" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="01123456" />
                    <Input label="WhatsApp" value={form.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="70123456" />
                  </div>
                  <Input label="Google Maps Link" value={form.google_maps_link} onChange={e => set('google_maps_link', e.target.value)} placeholder="https://maps.google.com/..." />
                </div>
              )}

              {/* Step 2 — Operations */}
              {step === 2 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <Input label="Seating Capacity" required type="number" value={form.seating_capacity} onChange={e => set('seating_capacity', e.target.value)} placeholder="e.g. 60" />
                    <Input label="Number of Tables" required type="number" value={form.num_tables} onChange={e => set('num_tables', e.target.value)} placeholder="e.g. 15" />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <Input label="Opening Time" required type="time" value={form.opening_time} onChange={e => set('opening_time', e.target.value)} />
                    <Input label="Closing Time" required type="time" value={form.closing_time} onChange={e => set('closing_time', e.target.value)} />
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '12px', color: '#a8a29e', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Days Open <span style={{ color: '#f43f5e' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {DAYS.map(day => (
                        <button key={day} onClick={() => toggleDay(day)} style={{
                          padding: '7px 12px', borderRadius: '8px', cursor: 'pointer',
                          background: form.days_open.includes(day) ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(68,64,60,0.4)',
                          color: form.days_open.includes(day) ? '#1c1917' : '#a8a29e',
                          border: 'none', fontSize: '13px', fontWeight: form.days_open.includes(day) ? '600' : '400',
                          fontFamily: 'Inter, sans-serif'
                        }}>{day}</button>
                      ))}
                    </div>
                  </div>

                  <div style={{ background: 'rgba(28,25,23,0.5)', borderRadius: '12px', padding: '16px' }}>
                    <Toggle label="Has Delivery" value={form.has_delivery} onChange={v => set('has_delivery', v)} />
                    <Toggle label="Has Shisha" value={form.has_shisha} onChange={v => set('has_shisha', v)} />
                    <Toggle label="Has Outdoor Seating" value={form.has_outdoor_seating} onChange={v => set('has_outdoor_seating', v)} />
                  </div>
                </div>
              )}

              {/* Step 3 — Staff & Pricing */}
              {step === 3 && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
                    <Input label="Owners" type="number" value={form.num_owners} onChange={e => set('num_owners', e.target.value)} placeholder="1" />
                    <Input label="Waiters" required type="number" value={form.num_waiters} onChange={e => set('num_waiters', e.target.value)} placeholder="e.g. 4" />
                    <Input label="Kitchen Staff" required type="number" value={form.num_kitchen} onChange={e => set('num_kitchen', e.target.value)} placeholder="e.g. 3" />
                    <Input label="Delivery Drivers" type="number" value={form.num_delivery} onChange={e => set('num_delivery', e.target.value)} placeholder="e.g. 2" />
                  </div>

                  {totalEmployees > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                        borderRadius: '14px', padding: '20px', marginTop: '8px'
                      }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                        <DollarSign size={20} style={{ color: '#f59e0b' }} />
                        <span style={{ fontSize: '14px', color: '#fef3c7', fontWeight: '600' }}>Pricing Estimate</span>
                      </div>
                      <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 8px' }}>
                        Total employees: <span style={{ color: '#fef3c7', fontWeight: '600' }}>{totalEmployees}</span> · Tier: <span style={{ color: '#fef3c7' }}>{pricing.tier}</span>
                      </p>
                      <p style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>
                        ${pricing.price} <span style={{ fontSize: '14px', color: '#a8a29e', fontFamily: 'Inter, sans-serif', fontWeight: '400' }}>one-time</span>
                      </p>
                    </motion.div>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
            {step > 0 && (
              <button onClick={() => setStep(s => s - 1)} style={{
                padding: '12px 20px', borderRadius: '10px',
                background: 'rgba(68,64,60,0.4)', border: '1px solid #44403c',
                color: '#a8a29e', cursor: 'pointer', fontSize: '14px',
                fontFamily: 'Inter, sans-serif', display: 'flex', alignItems: 'center', gap: '6px'
              }}><ChevronLeft size={16} /> Back</button>
            )}
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
              onClick={step < STEPS.length - 1 ? next : submit}
              disabled={loading}
              style={{
                flex: 1, padding: '12px', borderRadius: '10px', border: 'none',
                background: loading ? '#44403c' : 'linear-gradient(135deg,#f59e0b,#d97706)',
                color: '#1c1917', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px', fontFamily: 'Inter, sans-serif',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
              {step < STEPS.length - 1 ? (
                <>{loading ? 'Loading...' : 'Continue'} <ChevronRight size={16} /></>
              ) : (
                <>{loading ? 'Submitting...' : 'Submit Application'} <Check size={16} /></>
              )}
            </motion.button>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '13px', color: '#a8a29e', marginTop: '20px' }}>
          Already have an account? <a href="/login" style={{ color: '#f59e0b', textDecoration: 'none' }}>Sign in</a>
        </p>
      </div>
    </div>
  );
}