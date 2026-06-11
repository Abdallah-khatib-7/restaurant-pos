import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UtensilsCrossed, Lock, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import useAuth from '../hooks/useAuth';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleRoutes = {
    superadmin: '/superadmin',
    owner: '/dashboard',
    waiter: '/waiter',
    kitchen: '/kitchen',
    delivery_operator: '/delivery',
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate(roleRoutes[res.data.user.role] || '/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#1c1917',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Ambient blobs */}
      <div style={{
        position: 'absolute', top: '-80px', right: '-80px',
        width: '300px', height: '300px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(245,158,11,0.18), transparent)',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute', bottom: '-80px', left: '-80px',
        width: '280px', height: '280px', borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(159,18,57,0.12), transparent)',
        pointerEvents: 'none'
      }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: '400px' }}
      >
        <div style={{
          background: 'rgba(41,37,36,0.85)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(245,158,11,0.18)',
          borderRadius: '24px',
          padding: '36px 32px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
        }}>
          {/* Logo */}
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.4 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}
          >
            <div style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '14px',
              boxShadow: '0 4px 20px rgba(245,158,11,0.3)'
            }}>
              <UtensilsCrossed size={26} color="#1c1917" strokeWidth={2.5} />
            </div>
            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: '26px', fontWeight: '700',
              color: '#fef3c7', margin: '0 0 4px'
            }}>Tawla</h1>
            <p style={{ fontSize: '13px', color: '#a8a29e', margin: 0 }}>
              Sign in to your workspace
            </p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleLogin}>
            {/* Email */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '500',
                color: '#a8a29e', marginBottom: '6px',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{
                  position: 'absolute', left: '12px',
                  top: '50%', transform: 'translateY(-50%)', color: '#a8a29e'
                }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                  required
                  style={{
                    width: '100%', padding: '11px 12px 11px 38px',
                    background: 'rgba(28,25,23,0.9)',
                    border: '1px solid #44403c',
                    borderRadius: '12px', color: '#fef3c7',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#44403c'}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block', fontSize: '12px', fontWeight: '500',
                color: '#a8a29e', marginBottom: '6px',
                letterSpacing: '0.05em', textTransform: 'uppercase'
              }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{
                  position: 'absolute', left: '12px',
                  top: '50%', transform: 'translateY(-50%)', color: '#a8a29e'
                }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%', padding: '11px 38px 11px 38px',
                    background: 'rgba(28,25,23,0.9)',
                    border: '1px solid #44403c',
                    borderRadius: '12px', color: '#fef3c7',
                    fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', fontFamily: 'Inter, sans-serif'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#f59e0b'}
                  onBlur={(e) => e.target.style.borderColor = '#44403c'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    color: '#a8a29e', cursor: 'pointer', padding: 0
                  }}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '13px',
                background: loading ? '#44403c' : 'linear-gradient(135deg, #f59e0b, #d97706)',
                border: 'none', borderRadius: '12px',
                color: '#1c1917', fontSize: '15px',
                fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
                letterSpacing: '0.02em', fontFamily: 'Inter, sans-serif'
              }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p style={{
            textAlign: 'center', fontSize: '13px',
            color: '#a8a29e', margin: '20px 0 0'
          }}>
            Want to use RestoPOS?{' '}
            <a href="/register" style={{
              color: '#f59e0b', fontWeight: '500',
              textDecoration: 'none'
            }}>Apply here</a>
          </p>
        </div>
      </motion.div>
    </div>
  );
}