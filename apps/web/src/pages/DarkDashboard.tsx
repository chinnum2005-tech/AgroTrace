import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Package, TrendingUp, Bell,
  Settings, LogOut, BarChart3, MapPin, ShoppingCart,
  Activity, Leaf, Zap,
} from 'lucide-react';
import MacDock, { DockItem } from '../components/ui/MacDock';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts';

/* ── Data ── */
const platformStats = [
  { month: 'Jan', users: 120, revenue: 45 },
  { month: 'Feb', users: 180, revenue: 67 },
  { month: 'Mar', users: 250, revenue: 92 },
  { month: 'Apr', users: 340, revenue: 125 },
  { month: 'May', users: 450, revenue: 168 },
  { month: 'Jun', users: 580, revenue: 215 },
];

const recentActivity = [
  { id: 1, type: 'Order', user: 'Ravi Kumar', amount: '₹12,500', time: '5m ago', color: '#22c55e' },
  { id: 2, type: 'Verification', user: 'Priya Singh', amount: '—', time: '12m ago', color: '#3b82f6' },
  { id: 3, type: 'Shipment', user: 'Anil Farms', amount: '₹28,000', time: '25m ago', color: '#a855f7' },
  { id: 4, type: 'Registration', user: 'New Farmer', amount: '—', time: '1h ago', color: '#f59e0b' },
];

/* ── Dock Items ── */
const dockItems: DockItem[] = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard', active: true,  gradient: 'linear-gradient(135deg,#22c55e,#16a34a)' },
  { id: 'users',     icon: Users,          label: 'Users',     badge: 3,       gradient: 'linear-gradient(135deg,#3b82f6,#1d4ed8)' },
  { id: 'farms',     icon: Leaf,           label: 'Farms',                     gradient: 'linear-gradient(135deg,#10b981,#047857)' },
  { id: 'products',  icon: Package,        label: 'Products',                  gradient: 'linear-gradient(135deg,#f59e0b,#d97706)' },
  { id: 'analytics', icon: BarChart3,      label: 'Analytics',                 gradient: 'linear-gradient(135deg,#8b5cf6,#6d28d9)' },
  { id: 'orders',    icon: ShoppingCart,   label: 'Orders',    badge: 7,       gradient: 'linear-gradient(135deg,#ec4899,#be185d)' },
  { id: 'settings',  icon: Settings,       label: 'Settings',                  gradient: 'linear-gradient(135deg,#64748b,#334155)' },
  { id: 'logout',    icon: LogOut,         label: 'Logout',                    gradient: 'linear-gradient(135deg,#ef4444,#b91c1c)' },
];

/* ── Stat Card ── */
const statCards = [
  { label: 'Total Users',   value: '1,667', delta: '+12%', icon: Users,       color: '#3b82f6', glow: 'rgba(59,130,246,0.25)' },
  { label: 'Active Farms',  value: '142',   delta: '+8',   icon: MapPin,      color: '#22c55e', glow: 'rgba(34,197,94,0.25)'  },
  { label: 'Products',      value: '950',   delta: '+64',  icon: Package,     color: '#f59e0b', glow: 'rgba(245,158,11,0.25)' },
  { label: 'Revenue',       value: '₹215K', delta: '+18%', icon: TrendingUp,  color: '#a855f7', glow: 'rgba(168,85,247,0.25)' },
  { label: 'Active Orders', value: '48',    delta: '+5',   icon: ShoppingCart,color: '#ec4899', glow: 'rgba(236,72,153,0.25)' },
  { label: 'Uptime',        value: '99.9%', delta: '0ms',  icon: Zap,         color: '#06b6d4', glow: 'rgba(6,182,212,0.25)'  },
];

/* ── Custom Tooltip ── */
const DarkTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(15,15,20,0.92)', border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12, padding: '10px 14px', backdropFilter: 'blur(16px)',
    }}>
      <p style={{ color: '#9ca3af', fontSize: 11, marginBottom: 4 }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color, fontWeight: 700, fontSize: 13 }}>
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

/* ══════════════════════════════════════════ */
export default function DarkDashboard() {
  const [activeSection] = useState('Dashboard');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a0f',
      color: '#f1f5f9',
      fontFamily: "'Inter', sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>

      {/* ── Grid background ── */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
        `,
        backgroundSize: '48px 48px',
      }} />

      {/* ── Ambient glows ── */}
      <div style={{
        position: 'fixed', top: '-20%', left: '-10%', width: '60%', height: '60%',
        background: 'radial-gradient(ellipse, rgba(34,197,94,0.08) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />
      <div style={{
        position: 'fixed', bottom: '10%', right: '-10%', width: '50%', height: '50%',
        background: 'radial-gradient(ellipse, rgba(168,85,247,0.07) 0%, transparent 70%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* ── Top bar ── */}
      <motion.header
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{
          position: 'sticky', top: 0, zIndex: 40,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 32px', height: 64,
          background: 'rgba(10,10,15,0.8)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(34,197,94,0.4)',
          }}>
            <Leaf size={16} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.3px' }}>
            Agro<span style={{ color: '#22c55e' }}>Trace</span>
          </span>
        </div>

        {/* Section title */}
        <span style={{ color: '#6b7280', fontSize: 14 }}>
          {activeSection}
        </span>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            style={{
              position: 'relative', width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
            }}
          >
            <Bell size={16} color="#9ca3af" />
            <span style={{
              position: 'absolute', top: 7, right: 7, width: 6, height: 6,
              borderRadius: '50%', background: '#ef4444',
              boxShadow: '0 0 6px rgba(239,68,68,0.6)',
            }} />
          </motion.button>

          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: 'linear-gradient(135deg,#22c55e,#16a34a)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 13, color: '#fff',
            boxShadow: '0 0 12px rgba(34,197,94,0.3)',
          }}>
            A
          </div>
        </div>
      </motion.header>

      {/* ── Main content ── */}
      <main style={{ position: 'relative', zIndex: 1, padding: '32px 32px 120px' }}>

        {/* Hero greeting */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{ marginBottom: 32 }}
        >
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>
            Good morning, Admin 👋
          </h1>
          <p style={{ color: '#6b7280', marginTop: 4, fontSize: 14 }}>
            Here's what's happening with AgroTrace today.
          </p>
        </motion.div>

        {/* ── Stat cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16, marginBottom: 32,
        }}>
          {statCards.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05 }}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 18, padding: '20px 22px',
                  backdropFilter: 'blur(12px)',
                  cursor: 'default',
                  boxShadow: `0 4px 24px ${s.glow}`,
                  position: 'relative', overflow: 'hidden',
                }}
              >
                {/* glow dot */}
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 80, height: 80, borderRadius: '50%',
                  background: `radial-gradient(circle, ${s.color}33 0%, transparent 70%)`,
                  pointerEvents: 'none',
                }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ color: '#6b7280', fontSize: 12, marginBottom: 6 }}>{s.label}</p>
                    <p style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.5px', margin: 0 }}>{s.value}</p>
                    <p style={{ color: '#22c55e', fontSize: 11, marginTop: 4 }}>{s.delta} this month</p>
                  </div>
                  <div style={{
                    width: 38, height: 38, borderRadius: 10,
                    background: `${s.color}20`,
                    border: `1px solid ${s.color}30`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={18} color={s.color} />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Charts row ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          {/* Area chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <Activity size={16} color="#22c55e" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>User Growth</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={platformStats}>
                <defs>
                  <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Area type="monotone" dataKey="users" stroke="#22c55e" strokeWidth={2.5} fill="url(#userGrad)" name="Users" />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.55 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 20, padding: 24,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <BarChart3 size={16} color="#a855f7" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Revenue (₹K)</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={platformStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip content={<DarkTooltip />} />
                <Bar dataKey="revenue" fill="#a855f7" radius={[6, 6, 0, 0]} name="Revenue (₹K)" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* ── Recent activity ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: 20, padding: 24,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Activity size={16} color="#3b82f6" />
              <span style={{ fontWeight: 700, fontSize: 15 }}>Recent Activity</span>
            </div>
            <button style={{
              background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)',
              color: '#3b82f6', borderRadius: 8, padding: '4px 12px', fontSize: 12,
              fontWeight: 600, cursor: 'pointer',
            }}>
              View All
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentActivity.map((a, i) => (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 + i * 0.05 }}
                whileHover={{ x: 4 }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'default', transition: 'background 0.2s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 8, height: 8, borderRadius: '50%',
                    background: a.color, boxShadow: `0 0 8px ${a.color}80`,
                  }} />
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 13, margin: 0 }}>{a.type}</p>
                    <p style={{ color: '#6b7280', fontSize: 11, margin: 0 }}>{a.user}</p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 700, fontSize: 13, color: a.color, margin: 0 }}>{a.amount}</p>
                  <p style={{ color: '#4b5563', fontSize: 11, margin: 0 }}>{a.time}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>

      {/* ── macOS Dock ── */}
      <MacDock items={dockItems} />
    </div>
  );
}
