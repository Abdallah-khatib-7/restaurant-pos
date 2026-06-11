import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  UtensilsCrossed, Zap, BarChart2, Truck,
  Users, Smartphone, ChefHat, CheckCircle,
  ArrowRight, Star, Sparkles, Table2,
  ShoppingBag, Clock, Shield
} from 'lucide-react';

const pricing = [
  { tier: '1–5 employees', price: 499, ideal: 'Small cafes & bistros' },
  { tier: '6–15 employees', price: 999, ideal: 'Mid-size restaurants', popular: true },
  { tier: '16–30 employees', price: 1499, ideal: 'Large restaurants' },
  { tier: '30+ employees', price: 2499, ideal: 'Restaurant chains' },
];

const roles = [
  {
    icon: Star, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)',
    role: 'Owner', desc: 'Full control. Live revenue, analytics, staff management, discounts, and reports — all from one dashboard.'
  },
  {
    icon: ShoppingBag, color: '#a78bfa', bg: 'rgba(167,139,250,0.1)',
    role: 'Waiter', desc: 'Takes orders on tablet, gets AI suggestions, splits bills, adds tips, and prints receipts.'
  },
  {
    icon: ChefHat, color: '#fb923c', bg: 'rgba(251,146,60,0.1)',
    role: 'Kitchen', desc: 'Sees every order live — dine-in and delivery. Marks items ready, tracks urgent orders.'
  },
  {
    icon: Truck, color: '#22c55e', bg: 'rgba(34,197,94,0.1)',
    role: 'Delivery Operator', desc: 'Creates delivery orders, assigns drivers, tracks status, and manages the full delivery flow.'
  },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#1c1917', fontFamily: 'Inter, sans-serif', color: '#fef3c7' }}>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(28,25,23,0.95)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(245,158,11,0.12)',
        padding: '0 24px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '36px', height: '36px', borderRadius: '10px',
            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UtensilsCrossed size={18} color="#1c1917" />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: '700', color: '#fef3c7' }}>Tawla</span>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => navigate('/login')} style={{
            padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
            background: 'transparent', border: '1px solid #44403c',
            color: '#a8a29e', fontSize: '14px', fontFamily: 'Inter, sans-serif'
          }}>Login</button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/register')} style={{
              padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
              background: 'linear-gradient(135deg,#f59e0b,#d97706)',
              border: 'none', color: '#1c1917', fontSize: '14px',
              fontWeight: '600', fontFamily: 'Inter, sans-serif'
            }}>Apply Now</motion.button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: '1200px', margin: '0 auto', padding: '80px 24px 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
            <span style={{
              display: 'inline-block', fontSize: '12px', fontWeight: '600',
              color: '#f59e0b', background: 'rgba(245,158,11,0.1)',
              border: '1px solid rgba(245,158,11,0.2)', borderRadius: '20px',
              padding: '5px 14px', marginBottom: '20px', letterSpacing: '0.08em'
            }}>🇱🇧 BUILT FOR LEBANESE RESTAURANTS</span>

            <h1 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(32px, 5vw, 58px)',
              fontWeight: '900', color: '#fef3c7',
              margin: '0 0 20px', lineHeight: 1.1
            }}>
              The POS That Thinks Like a<br />
              <span style={{ color: '#f59e0b' }}>Lebanese Restaurant</span>
            </h1>

            <p style={{ fontSize: '17px', color: '#a8a29e', margin: '0 0 32px', lineHeight: '1.7' }}>
              Real-time orders. AI-powered suggestions. Delivery management. Live analytics. One system for your entire operation — no subscriptions, ever.
            </p>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')} style={{
                  padding: '14px 28px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#1c1917', fontSize: '16px', fontWeight: '700',
                  fontFamily: 'Inter, sans-serif',
                  display: 'flex', alignItems: 'center', gap: '8px'
                }}>
                Apply Now — Free <ArrowRight size={18} />
              </motion.button>
              <button onClick={() => navigate('/login')} style={{
                padding: '14px 28px', borderRadius: '12px', cursor: 'pointer',
                background: 'transparent', border: '1px solid #44403c',
                color: '#fef3c7', fontSize: '16px', fontFamily: 'Inter, sans-serif'
              }}>Sign In</button>
            </div>

            <div style={{ display: 'flex', gap: '24px', marginTop: '36px' }}>
              {[['$0', 'Monthly Fee'], ['Live', 'Real-time'], ['4', 'Roles'], ['∞', 'Orders']].map((s, i) => (
                <div key={i}>
                  <p style={{ fontSize: '22px', fontWeight: '800', color: '#f59e0b', margin: '0 0 2px', fontFamily: 'JetBrains Mono,monospace' }}>{s[0]}</p>
                  <p style={{ fontSize: '11px', color: '#a8a29e', margin: 0 }}>{s[1]}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Hero image */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            style={{ position: 'relative' }}>
            <div style={{
              borderRadius: '20px', overflow: 'hidden',
              border: '1px solid rgba(245,158,11,0.15)',
              boxShadow: '0 24px 80px rgba(0,0,0,0.5)'
            }}>
              <img
                src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=700&q=80"
                alt="Lebanese restaurant food spread"
                style={{ width: '100%', height: '400px', objectFit: 'cover', display: 'block', filter: 'brightness(0.85)' }}
              />
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '20px',
                background: 'linear-gradient(to top, rgba(28,25,23,0.6) 0%, transparent 50%)'
              }} />
            </div>
            {/* Floating card */}
            <motion.div
              animate={{ y: [0, -8, 0] }} transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{
                position: 'absolute', bottom: '-20px', left: '-20px',
                background: 'rgba(41,37,36,0.95)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px',
                padding: '14px 18px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)'
              }}>
              <p style={{ fontSize: '11px', color: '#a8a29e', margin: '0 0 4px' }}>Today's Revenue</p>
              <p style={{ fontSize: '22px', fontWeight: '700', color: '#f59e0b', margin: 0, fontFamily: 'JetBrains Mono,monospace' }}>$1,284.00</p>
            </motion.div>
            <motion.div
              animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: '-16px', right: '-16px',
                background: 'rgba(41,37,36,0.95)', backdropFilter: 'blur(12px)',
                border: '1px solid rgba(34,197,94,0.2)', borderRadius: '12px',
                padding: '10px 14px', boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                display: 'flex', alignItems: 'center', gap: '8px'
              }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 8px #22c55e' }} />
              <span style={{ fontSize: '12px', color: '#22c55e', fontWeight: '600' }}>12 tables live</span>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Tawla AI Section */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{
          background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(41,37,36,0.8) 100%)',
          border: '1px solid rgba(245,158,11,0.2)', borderRadius: '24px',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            <div style={{ padding: '48px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <Sparkles size={20} color="#1c1917" />
                </div>
                <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: '700', color: '#f59e0b' }}>Tawla AI</span>
              </div>

              <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(24px,4vw,38px)', fontWeight: '700', margin: '0 0 16px', lineHeight: 1.2 }}>
                Your Smartest Team Member
              </h2>
              <p style={{ fontSize: '16px', color: '#a8a29e', margin: '0 0 24px', lineHeight: '1.7' }}>
                Before a waiter sends an order, Tawla AI analyzes what's been ordered and suggests the perfect additions — drinks, desserts, complementary mezze.
              </p>

              {[
                'Knows your exact menu and prices',
                'Suggests food pairings that make sense',
                'Nudges toward free delivery threshold',
                'Waiter picks 0, 1, 2, or all 3 suggestions',
                'One tap to add — no typing needed',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <CheckCircle size={16} style={{ color: '#f59e0b', flexShrink: 0 }} />
                  <span style={{ fontSize: '14px', color: '#fef3c7' }}>{f}</span>
                </div>
              ))}
            </div>

            {/* AI visual */}
            <div style={{ position: 'relative', minHeight: '400px', overflow: 'hidden' }}>
              <img
                src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80"
                alt="Restaurant fine dining"
                style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.4)' }}
              />
              {/* AI suggestion cards overlay */}
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '32px', gap: '12px' }}>
                <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 8px' }}>Tawla AI suggests:</p>
                {[
                  { name: 'Jallab', reason: 'Perfect with Mixed Grill', price: '$4.00' },
                  { name: 'Baklava', reason: 'Add dessert to complete meal', price: '$6.00' },
                  { name: 'Fattoush', reason: '$8 away from free delivery', price: '$7.00' },
                ].map((s, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 }}
                    style={{
                      background: 'rgba(41,37,36,0.9)', backdropFilter: 'blur(8px)',
                      border: '1px solid rgba(245,158,11,0.2)', borderRadius: '12px',
                      padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                    <div>
                      <p style={{ fontSize: '14px', color: '#fef3c7', margin: '0 0 2px', fontWeight: '600' }}>{s.name}</p>
                      <p style={{ fontSize: '12px', color: '#a8a29e', margin: 0 }}>{s.reason}</p>
                    </div>
                    <span style={{ fontSize: '14px', color: '#f59e0b', fontFamily: 'JetBrains Mono,monospace', fontWeight: '700' }}>{s.price}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: '700', margin: '0 0 12px' }}>
            Every Role. One System.
          </h2>
          <p style={{ fontSize: '16px', color: '#a8a29e', margin: 0 }}>
            Each team member sees exactly what they need — nothing more, nothing less
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(250px,1fr))', gap: '16px', marginBottom: '40px' }}>
          {roles.map((r, i) => {
            const Icon = r.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{
                  background: 'rgba(41,37,36,0.8)',
                  border: `1px solid ${r.color}20`,
                  borderRadius: '16px', padding: '24px'
                }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px',
                  background: r.bg, display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '14px'
                }}>
                  <Icon size={22} style={{ color: r.color }} />
                </div>
                <h3 style={{ fontSize: '17px', fontWeight: '700', color: '#fef3c7', margin: '0 0 8px', fontFamily: "'Playfair Display',serif" }}>{r.role}</h3>
                <p style={{ fontSize: '14px', color: '#a8a29e', margin: 0, lineHeight: '1.6' }}>{r.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Roles image */}
        <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.12)', position: 'relative' }}>
          <img
            src="https://images.unsplash.com/photo-1559339352-11d035aa65de?w=1200&q=80"
            alt="Restaurant team working"
            style={{ width: '100%', height: '320px', objectFit: 'cover', display: 'block', filter: 'brightness(0.5)' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '24px'
          }}>
            <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(20px,4vw,32px)', fontWeight: '700', color: '#fef3c7', margin: '0 0 12px' }}>
              Every screen. Every role. Every shift.
            </h3>
            <p style={{ fontSize: '16px', color: '#a8a29e', margin: 0, maxWidth: '500px' }}>
              Waiters on tablets. Kitchen on a big screen. Delivery manager on desktop. All connected, all live.
            </p>
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: '700', margin: '0 0 12px' }}>
            Built for Real Restaurants
          </h2>
          <p style={{ fontSize: '16px', color: '#a8a29e', margin: 0 }}>Not a generic POS adapted for food — purpose-built for Lebanese restaurant workflow</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(280px,1fr))', gap: '16px' }}>
          {[
            { icon: Zap, title: 'Real-Time Kitchen Display', desc: 'Orders hit the kitchen screen the moment the waiter taps Send. No delays, no paper tickets.' },
            { icon: BarChart2, title: 'Live Revenue Dashboard', desc: 'Today\'s revenue, active orders, occupied tables — all updating live as your restaurant moves.' },
            { icon: Truck, title: 'Full Delivery Loop', desc: 'Create delivery orders, assign drivers, track status. Auto-calculates $3 fee or free above $60.' },
            { icon: Table2, title: 'Visual Floor Plan', desc: 'See every table\'s status at a glance. Green, amber, red — you always know what\'s happening.' },
            { icon: Shield, title: 'Discount Control', desc: 'Only the owner can apply discounts. System warns above 40%. Every discount logged in reports.' },
            { icon: Clock, title: 'Staff Scheduling', desc: 'Set weekly schedules, track login sessions, see who\'s online in real time.' },
            { icon: Smartphone, title: 'Works on Any Screen', desc: 'No app to install. Open a browser on any device — tablet, phone, desktop, or smart TV.' },
            { icon: Sparkles, title: 'Tawla AI Suggestions', desc: 'AI analyzes each order and suggests complementary items. More items per table, every service.' },
            { icon: Users, title: 'Split Bill & Tip', desc: 'Split equally or by item. Customers add tips. Receipts print cleanly from any browser.' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 3) * 0.1 }}
                style={{
                  background: 'rgba(41,37,36,0.8)',
                  border: '1px solid rgba(245,158,11,0.1)',
                  borderRadius: '16px', padding: '24px',
                  transition: 'border 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(245,158,11,0.1)'}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(245,158,11,0.1)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', marginBottom: '12px'
                }}>
                  <Icon size={20} style={{ color: '#f59e0b' }} />
                </div>
                <h3 style={{ fontSize: '15px', fontWeight: '600', color: '#fef3c7', margin: '0 0 8px' }}>{f.title}</h3>
                <p style={{ fontSize: '13px', color: '#a8a29e', margin: 0, lineHeight: '1.6' }}>{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* How it works */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: '700', margin: '0 0 32px' }}>
              Up and Running in 24 Hours
            </h2>
            {[
              { step: '01', title: 'Apply Online', desc: 'Fill out the 4-step form. Takes 5 minutes. We review and respond within 24 hours.' },
              { step: '02', title: 'One-Time Payment', desc: 'Pay once. Own it forever. No subscriptions, no renewal, no surprises.' },
              { step: '03', title: 'Add Your Menu & Staff', desc: 'Add categories, items, tables, and create accounts for your team.' },
              { step: '04', title: 'Go Live', desc: 'Your team logs in, you open your doors. Tawla runs your restaurant from day one.' },
            ].map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                <span style={{
                  fontSize: '24px', fontWeight: '800', color: 'rgba(245,158,11,0.3)',
                  fontFamily: 'JetBrains Mono,monospace', flexShrink: 0, minWidth: '36px'
                }}>{s.step}</span>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#fef3c7', margin: '0 0 6px' }}>{s.title}</h3>
                  <p style={{ fontSize: '14px', color: '#a8a29e', margin: 0, lineHeight: '1.6' }}>{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div style={{ borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(245,158,11,0.12)' }}>
            <img
              src="https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?w=600&q=80"
              alt="Restaurant interior"
              style={{ width: '100%', height: '480px', objectFit: 'cover', display: 'block', filter: 'brightness(0.7)' }}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ maxWidth: '1200px', margin: '80px auto 0', padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(28px,5vw,42px)', fontWeight: '700', margin: '0 0 12px' }}>
            Simple, One-Time Pricing
          </h2>
          <p style={{ fontSize: '16px', color: '#a8a29e', margin: 0 }}>Pay once. Own it forever. No monthly fees, ever.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: '16px' }}>
          {pricing.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              style={{
                background: p.popular ? 'rgba(245,158,11,0.08)' : 'rgba(41,37,36,0.8)',
                border: p.popular ? '2px solid rgba(245,158,11,0.4)' : '1px solid rgba(245,158,11,0.1)',
                borderRadius: '16px', padding: '24px', position: 'relative'
              }}>
              {p.popular && (
                <span style={{
                  position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                  color: '#1c1917', fontSize: '11px', fontWeight: '700',
                  padding: '3px 12px', borderRadius: '20px', whiteSpace: 'nowrap'
                }}>MOST POPULAR</span>
              )}
              <p style={{ fontSize: '13px', color: '#a8a29e', margin: '0 0 4px' }}>{p.tier}</p>
              <p style={{ fontSize: '36px', fontWeight: '800', color: '#f59e0b', margin: '0 0 4px', fontFamily: 'JetBrains Mono,monospace' }}>${p.price}</p>
              <p style={{ fontSize: '12px', color: '#a8a29e', margin: '0 0 16px' }}>one-time payment</p>
              <p style={{ fontSize: '13px', color: '#fef3c7', margin: '0 0 16px' }}>{p.ideal}</p>
              {['Unlimited orders', 'All features included', 'All user roles', 'Real-time updates', 'Tawla AI included', 'Lifetime access'].map((f, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <CheckCircle size={13} style={{ color: '#22c55e', flexShrink: 0 }} />
                  <span style={{ fontSize: '13px', color: '#a8a29e' }}>{f}</span>
                </div>
              ))}
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/register')} style={{
                  width: '100%', marginTop: '20px', padding: '11px', borderRadius: '10px', border: 'none',
                  background: p.popular ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'rgba(245,158,11,0.1)',
                  color: p.popular ? '#1c1917' : '#f59e0b',
                  fontWeight: '600', cursor: 'pointer', fontSize: '14px', fontFamily: 'Inter, sans-serif'
                }}>Apply Now</motion.button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ maxWidth: '800px', margin: '80px auto 0', padding: '0 24px 80px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          style={{
            position: 'relative', borderRadius: '24px', overflow: 'hidden',
            border: '1px solid rgba(245,158,11,0.2)'
          }}>
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1000&q=80"
            alt="Restaurant atmosphere"
            style={{ width: '100%', height: '340px', objectFit: 'cover', display: 'block', filter: 'brightness(0.3)' }}
          />
          <div style={{
            position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '32px'
          }}>
            <Star size={28} style={{ color: '#f59e0b', marginBottom: '14px' }} />
            <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 'clamp(22px,5vw,36px)', fontWeight: '700', margin: '0 0 12px', color: '#fef3c7' }}>
              Ready to Transform Your Restaurant?
            </h2>
            <p style={{ fontSize: '15px', color: '#a8a29e', margin: '0 0 24px', lineHeight: '1.7', maxWidth: '500px' }}>
              Built in Lebanon. Designed for Lebanese hospitality. One payment, zero monthly fees, full ownership.
            </p>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')} style={{
                padding: '15px 36px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg,#f59e0b,#d97706)',
                color: '#1c1917', fontSize: '17px', fontWeight: '700',
                fontFamily: 'Inter, sans-serif',
                display: 'inline-flex', alignItems: 'center', gap: '8px'
              }}>
              Apply Now — Free to Apply <ArrowRight size={18} />
            </motion.button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid rgba(245,158,11,0.1)', padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{
            width: '28px', height: '28px', borderRadius: '8px',
            background: 'linear-gradient(135deg,#f59e0b,#d97706)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <UtensilsCrossed size={14} color="#1c1917" />
          </div>
          <span style={{ fontFamily: "'Playfair Display',serif", fontSize: '16px', color: '#fef3c7', fontWeight: '700' }}>Tawla</span>
        </div>
        <p style={{ fontSize: '13px', color: '#44403c', margin: '0 0 4px' }}>
          Built by Abdallah Khatib · Lebanon 🇱🇧
        </p>
        <p style={{ fontSize: '12px', color: '#44403c', margin: 0 }}>
          © 2026 Tawla. All rights reserved.
        </p>
      </footer>
    </div>
  );
}