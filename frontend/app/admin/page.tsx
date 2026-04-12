'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth';
import api from '@/lib/api';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, MessageSquare, Zap, AlertCircle, Upload, RefreshCw,
  LogOut, Activity, Search, ChevronRight, Clock, CheckCircle,
  XCircle, Database, TrendingUp, Star, Radio, Shield, Filter,
  BarChart2, ArrowUpRight, ArrowDownRight, Wifi, WifiOff,
} from 'lucide-react';

/* ─── types ────────────────────────────────────────────────────── */
interface Metrics {
  total_users: number;
  total_chats: number;
  queries_24h: number;
  avg_confidence: number;
  avg_latency_ms: number;
  total_errors: number;
  total_feedback: number;
  avg_rating: number;
  active_users_7d: number;
  success_rate: number;
}

interface QueryLog {
  id: string;
  user_id: string;
  query: string;
  response: string;
  processing_time_ms: number;
  confidence_score: number | null;
  sources_count: number;
  has_error: boolean;
  error_message: string | null;
  created_at: string | null;
}

interface UserRow {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  query_count: number;
  created_at: string | null;
  last_active: string | null;
}

type Tab = 'overview' | 'queries' | 'users' | 'live';

/* ─── helpers ───────────────────────────────────────────────────── */
function fmtTime(iso: string | null): string {
  if (!iso) return '–';
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return d.toLocaleDateString();
}

function fmtMs(ms: number): string {
  if (!ms) return '–';
  return ms < 1000 ? `${Math.round(ms)}ms` : `${(ms / 1000).toFixed(1)}s`;
}

function ConfBadge({ score }: { score: number | null }) {
  if (score === null) return <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>–</span>;
  const pct = Math.round(score * 100);
  const color = pct >= 70 ? 'var(--neon-green)' : pct >= 40 ? 'var(--neon-amber)' : 'var(--neon-pink)';
  return (
    <span style={{
      color, fontWeight: 600, fontSize: '0.82rem',
      background: `${color}18`, padding: '2px 8px',
      borderRadius: '999px', border: `1px solid ${color}40`,
    }}>
      {pct}%
    </span>
  );
}

/* ─── mini stat card ────────────────────────────────────────────── */
function StatCard({
  label, value, sub, icon: Icon, color, trend,
}: {
  label: string; value: string | number; sub?: string;
  icon: any; color: string; trend?: 'up' | 'down' | null;
}) {
  return (
    <div className="glass-card" style={{ padding: '1.4rem 1.6rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.8px', fontFamily: 'var(--font-mono)' }}>{label}</span>
        <div style={{ width: 36, height: 36, borderRadius: 10, background: `${color}18`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={16} color={color} />
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>{value}</span>
        {trend && (
          trend === 'up'
            ? <ArrowUpRight size={14} color="var(--neon-green)" />
            : <ArrowDownRight size={14} color="var(--neon-pink)" />
        )}
      </div>
      {sub && <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{sub}</span>}
    </div>
  );
}

/* ─── main component ────────────────────────────────────────────── */
export default function AdminDashboard() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [tab, setTab] = useState<Tab>('overview');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [queries, setQueries] = useState<QueryLog[]>([]);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [liveQueries, setLiveQueries] = useState<QueryLog[]>([]);
  const [liveStatus, setLiveStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [loading, setLoading] = useState(true);
  const [ingestionLoading, setIngestionLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterError, setFilterError] = useState<boolean | null>(null);
  const [totalQueries, setTotalQueries] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const esRef = useRef<EventSource | null>(null);
  const liveScrollRef = useRef<HTMLDivElement | null>(null);

  /* chart mock data – replaced by real when available */
  const trendData = [
    { day: 'Mon', queries: 0, errors: 0 },
    { day: 'Tue', queries: 0, errors: 0 },
    { day: 'Wed', queries: 0, errors: 0 },
    { day: 'Thu', queries: 0, errors: 0 },
    { day: 'Fri', queries: 0, errors: 0 },
    { day: 'Sat', queries: 0, errors: 0 },
    { day: 'Sun', queries: metrics?.queries_24h || 0, errors: metrics?.total_errors || 0 },
  ];

  const latencyData = [
    { name: '<500ms', value: 60 },
    { name: '500-1s', value: 25 },
    { name: '1-3s', value: 12 },
    { name: '>3s', value: 3 },
  ];

  /* ── auth guard ────────────────────────────────────────────────── */
  useEffect(() => {
    if (!token || user?.role !== 'admin') {
      router.push('/login');
    }
  }, [token, user, router]);

  /* ── data fetches ──────────────────────────────────────────────── */
  const fetchMetrics = useCallback(async () => {
    try {
      const res = await api.get('/admin/metrics');
      setMetrics(res.data);
    } catch (e) {
      console.error('metrics fetch error', e);
    }
  }, []);

  const fetchQueries = useCallback(async () => {
    try {
      const params: Record<string, any> = { limit: 50 };
      if (searchQuery) params.search = searchQuery;
      if (filterError !== null) params.has_error = filterError;
      const res = await api.get('/admin/queries', { params });
      setQueries(res.data.items || []);
      setTotalQueries(res.data.total || 0);
    } catch (e) {
      console.error('queries fetch error', e);
    }
  }, [searchQuery, filterError]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.items || []);
      setTotalUsers(res.data.total || 0);
    } catch (e) {
      console.error('users fetch error', e);
    }
  }, []);

  /* initial data load */
  useEffect(() => {
    Promise.all([fetchMetrics(), fetchQueries(), fetchUsers()]).finally(() => setLoading(false));
  }, []);

  /* re-fetch queries when filters change */
  useEffect(() => {
    if (!loading) fetchQueries();
  }, [searchQuery, filterError]);

  /* ── SSE live stream ───────────────────────────────────────────── */
  const startLiveStream = useCallback(() => {
    if (esRef.current) return;
    setLiveStatus('connecting');
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';
    // Strip trailing /api/v1 if present to build the SSE URL
    const baseUrl = apiBase.replace(/\/api\/v1\/?$/, '');
    const es = new EventSource(`${baseUrl}/api/v1/admin/queries/live?token=${token}`);
    esRef.current = es;

    es.addEventListener('connected', () => setLiveStatus('connected'));
    es.addEventListener('heartbeat', () => setLiveStatus('connected'));
    es.addEventListener('query', (e) => {
      try {
        const data: QueryLog = JSON.parse(e.data);
        setLiveQueries((prev) => [data, ...prev].slice(0, 100));
        // auto-scroll only if near top
        if (liveScrollRef.current) liveScrollRef.current.scrollTop = 0;
      } catch {}
    });
    es.addEventListener('error', () => {
      setLiveStatus('disconnected');
      es.close();
      esRef.current = null;
    });
  }, [token]);

  const stopLiveStream = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
    setLiveStatus('disconnected');
  }, []);

  /* auto-start live when switching to live tab */
  useEffect(() => {
    if (tab === 'live') {
      startLiveStream();
    } else {
      stopLiveStream();
    }
    return () => stopLiveStream();
  }, [tab]);

  /* ── actions ───────────────────────────────────────────────────── */
  const triggerIngestion = async () => {
    setIngestionLoading(true);
    try {
      await api.post('/admin/ingest');
      await fetchMetrics();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Ingestion failed');
    }
    setIngestionLoading(false);
  };

  const handleSignOut = () => {
    stopLiveStream();
    useAuthStore.getState().logout();
    router.push('/login');
  };

  /* ── loading ────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="page-bg">
        <div className="grid-overlay" />
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem', position: 'relative', zIndex: 1 }}>
          <div style={{ width: 48, height: 48, border: '2px solid var(--neon-blue)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>Loading admin panel...</span>
        </div>
      </div>
    );
  }

  /* ═══════════════════════ RENDER ═══════════════════════ */
  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes liveFlash { 0%,100%{opacity:1;} 50%{opacity:0.3;} }

        .admin-shell { display:flex; min-height:100vh; background:var(--bg-void); position:relative; }
        .admin-sidebar {
          width:220px; flex-shrink:0; background:var(--glass-bg);
          backdrop-filter:var(--glass-blur); border-right:1px solid var(--glass-border);
          display:flex; flex-direction:column; padding:1.5rem 0; position:sticky; top:0; height:100vh; z-index:100;
        }
        .sidebar-brand { padding:0 1.4rem 1.5rem; border-bottom:1px solid var(--glass-border); margin-bottom:1.5rem; }
        .sidebar-brand-name { font-family:var(--font-display); font-size:1.2rem; font-weight:700; background:var(--grad-cyber); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .sidebar-brand-sub { font-size:0.7rem; color:var(--text-muted); font-family:var(--font-mono); letter-spacing:1px; margin-top:2px; }

        .sidebar-nav { flex:1; display:flex; flex-direction:column; gap:4px; padding:0 0.75rem; }
        .nav-item {
          display:flex; align-items:center; gap:10px; padding:0.6rem 0.8rem;
          border-radius:10px; cursor:pointer; transition:all 0.2s ease;
          font-size:0.88rem; font-weight:500; color:var(--text-muted); border:none; background:transparent; width:100%;
        }
        .nav-item:hover { background:rgba(96,150,247,0.08); color:var(--text-primary); }
        .nav-item.active { background:rgba(96,150,247,0.12); color:var(--neon-blue); border:1px solid rgba(96,150,247,0.2); }
        .nav-item .nav-label { flex:1; text-align:left; }
        .nav-item .nav-badge { font-size:0.65rem; background:var(--neon-blue); color:#fff; border-radius:999px; padding:1px 6px; }

        .admin-main { flex:1; display:flex; flex-direction:column; min-width:0; }
        .admin-topbar {
          display:flex; align-items:center; justify-content:space-between;
          padding:1rem 2rem; background:var(--glass-bg); backdrop-filter:var(--glass-blur);
          border-bottom:1px solid var(--glass-border); position:sticky; top:0; z-index:50;
        }
        .admin-topbar-title { font-family:var(--font-display); font-size:1.2rem; font-weight:700; color:var(--text-primary); }
        .topbar-actions { display:flex; align-items:center; gap:0.75rem; }

        .admin-content { flex:1; padding:2rem; max-width:1400px; width:100%; }

        .stats-grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(200px, 1fr)); gap:1rem; margin-bottom:2rem; }
        .charts-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:2rem; }
        .chart-card { padding:1.5rem; }
        .chart-title { font-size:0.9rem; font-weight:600; color:var(--text-primary); margin-bottom:1.2rem; display:flex; align-items:center; gap:8px; }

        .table-wrap { overflow-x:auto; }
        table { width:100%; border-collapse:collapse; font-size:0.85rem; }
        th { padding:0.7rem 1rem; text-align:left; color:var(--text-muted); font-weight:500; font-family:var(--font-mono); font-size:0.72rem; letter-spacing:0.5px; text-transform:uppercase; border-bottom:1px solid var(--glass-border); }
        td { padding:0.75rem 1rem; border-bottom:1px solid rgba(96,150,247,0.06); color:var(--text-secondary); vertical-align:middle; }
        tr:last-child td { border-bottom:none; }
        tr:hover td { background:rgba(96,150,247,0.03); }

        .query-text { max-width:280px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text-primary); font-weight:500; }
        .response-text { max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; color:var(--text-muted); font-size:0.78rem; }
        .error-badge { color:var(--neon-pink); background:rgba(212,87,138,0.1); padding:2px 8px; border-radius:999px; border:1px solid rgba(212,87,138,0.3); font-size:0.75rem; }
        .ok-badge { color:var(--neon-green); background:rgba(52,211,153,0.1); padding:2px 8px; border-radius:999px; border:1px solid rgba(52,211,153,0.3); font-size:0.75rem; }

        .search-row { display:flex; align-items:center; gap:1rem; margin-bottom:1.5rem; flex-wrap:wrap; }
        .search-input-wrap { position:relative; flex:1; min-width:200px; }
        .search-input-wrap svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); }
        .search-input { width:100%; background:var(--glass-bg); border:1px solid var(--glass-border); border-radius:10px; padding:0.6rem 1rem 0.6rem 2.4rem; color:var(--text-primary); font-size:0.88rem; outline:none; transition:border-color 0.2s; }
        .search-input:focus { border-color:var(--glass-border-bright); }
        .search-input::placeholder { color:var(--text-muted); }

        .filter-btn { display:flex; align-items:center; gap:6px; padding:0.55rem 1rem; border-radius:10px; border:1px solid var(--glass-border); background:var(--glass-bg); color:var(--text-muted); font-size:0.82rem; cursor:pointer; transition:all 0.2s; }
        .filter-btn:hover, .filter-btn.active { border-color:var(--glass-border-bright); color:var(--neon-blue); }
        .filter-btn.error-active { color:var(--neon-pink); border-color:rgba(212,87,138,0.4); }

        /* Live feed */
        .live-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:1.5rem; }
        .live-status { display:flex; align-items:center; gap:8px; font-size:0.85rem; font-family:var(--font-mono); }
        .live-dot { width:8px; height:8px; border-radius:50%; }
        .live-dot.connected { background:var(--neon-green); animation:liveFlash 1.5s ease-in-out infinite; }
        .live-dot.disconnected { background:var(--neon-pink); }
        .live-dot.connecting { background:var(--neon-amber); animation:liveFlash 0.8s ease-in-out infinite; }

        .live-feed { display:flex; flex-direction:column; gap:10px; max-height:70vh; overflow-y:auto; }
        .live-entry {
          padding:1rem 1.2rem; border-radius:12px; background:var(--glass-bg);
          border:1px solid var(--glass-border); animation:fadeInUp 0.3s ease;
          display:grid; grid-template-columns:1fr auto; gap:0.5rem 1.5rem;
        }
        .live-entry.error-entry { border-color:rgba(212,87,138,0.3); background:rgba(212,87,138,0.04); }
        .live-query { font-weight:600; color:var(--text-primary); font-size:0.9rem; margin-bottom:4px; }
        .live-response { font-size:0.8rem; color:var(--text-muted); max-height:3em; overflow:hidden; }
        .live-meta { display:flex; align-items:flex-start; gap:8px; flex-direction:column; align-items:flex-end; flex-shrink:0; }

        .empty-state { text-align:center; padding:4rem 2rem; color:var(--text-muted); }
        .empty-icon { margin:0 auto 1rem; opacity:0.3; }

        .action-btn { display:flex; align-items:center; gap:6px; padding:0.55rem 1.1rem; border-radius:10px; font-size:0.85rem; font-weight:500; cursor:pointer; transition:all 0.2s; border:none; }
        .action-btn-primary { background:var(--grad-cyber); color:#fff; }
        .action-btn-primary:hover { opacity:0.85; transform:translateY(-1px); }
        .action-btn-ghost { background:var(--glass-bg); border:1px solid var(--glass-border); color:var(--text-secondary); }
        .action-btn-ghost:hover { border-color:var(--glass-border-bright); color:var(--text-primary); }
        .action-btn-danger { background:rgba(212,87,138,0.1); border:1px solid rgba(212,87,138,0.35); color:var(--neon-pink); }
        .action-btn-danger:hover { background:rgba(212,87,138,0.2); }

        .section-title { font-size:1rem; font-weight:700; color:var(--text-primary); margin-bottom:1.2rem; display:flex; align-items:center; gap:8px; font-family:var(--font-display); }
        .section-divider { height:1px; background:var(--glass-border); margin:2rem 0; }

        @media(max-width:900px) {
          .admin-sidebar { display:none; }
          .charts-grid { grid-template-columns:1fr; }
          .stats-grid { grid-template-columns:repeat(2,1fr); }
        }
      `}</style>

      <div className="admin-shell">
        {/* Sidebar */}
        <aside className="admin-sidebar">
          <div className="sidebar-brand">
            <div className="sidebar-brand-name">AskUni</div>
            <div className="sidebar-brand-sub">ADMIN CONSOLE</div>
          </div>
          <nav className="sidebar-nav">
            {([
              { id: 'overview', label: 'Overview', icon: BarChart2 },
              { id: 'queries', label: 'Query Logs', icon: MessageSquare },
              { id: 'live', label: 'Live Feed', icon: Radio },
              { id: 'users', label: 'Users', icon: Users },
            ] as { id: Tab; label: string; icon: any }[]).map(({ id, label, icon: Icon }) => (
              <button key={id} className={`nav-item ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>
                <Icon size={16} />
                <span className="nav-label">{label}</span>
                {id === 'live' && liveStatus === 'connected' && <span className="nav-badge">LIVE</span>}
              </button>
            ))}
          </nav>
          <div style={{ padding: '1.2rem 0.75rem', borderTop: '1px solid var(--glass-border)', marginTop: '1rem' }}>
            <button className="nav-item" onClick={handleSignOut}>
              <LogOut size={16} />
              <span className="nav-label">Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="admin-main">
          {/* Top bar */}
          <header className="admin-topbar">
            <div>
              <div className="admin-topbar-title">
                {tab === 'overview' && 'Dashboard Overview'}
                {tab === 'queries' && 'Query Logs'}
                {tab === 'live' && 'Live Query Monitor'}
                {tab === 'users' && 'User Management'}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>
                {new Date().toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
            <div className="topbar-actions">
              <button className="action-btn action-btn-ghost" onClick={fetchMetrics}>
                <RefreshCw size={14} />
                Refresh
              </button>
              <button
                className="action-btn action-btn-primary"
                onClick={triggerIngestion}
                disabled={ingestionLoading}
              >
                <Upload size={14} />
                {ingestionLoading ? 'Ingesting…' : 'Re-Ingest Data'}
              </button>
            </div>
          </header>

          {/* Content area */}
          <div className="admin-content">

            {/* ══════════ OVERVIEW TAB ══════════ */}
            {tab === 'overview' && (
              <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                {/* KPI Cards */}
                <div className="stats-grid">
                  <StatCard label="Total Queries" value={metrics?.total_chats ?? 0} sub="All-time" icon={MessageSquare} color="var(--neon-blue)" />
                  <StatCard label="Queries (24h)" value={metrics?.queries_24h ?? 0} icon={TrendingUp} color="var(--neon-cyan)" trend="up" />
                  <StatCard label="Success Rate" value={`${metrics?.success_rate ?? 0}%`} icon={CheckCircle} color="var(--neon-green)" />
                  <StatCard label="Avg Confidence" value={`${Math.round((metrics?.avg_confidence ?? 0) * 100)}%`} icon={Activity} color="var(--neon-violet)" />
                  <StatCard label="Avg Latency" value={fmtMs(metrics?.avg_latency_ms ?? 0)} icon={Clock} color="var(--neon-amber)" />
                  <StatCard label="Total Users" value={metrics?.total_users ?? 0} icon={Users} color="var(--neon-purple)" />
                  <StatCard label="Active (7d)" value={metrics?.active_users_7d ?? 0} icon={Zap} color="var(--neon-green)" />
                  <StatCard label="Avg Rating" value={metrics?.avg_rating ? `${metrics.avg_rating}/5` : '–'} icon={Star} color="var(--neon-amber)" />
                </div>

                {/* Charts row */}
                <div className="charts-grid">
                  <div className="glass-card chart-card">
                    <div className="chart-title"><TrendingUp size={16} color="var(--neon-blue)" />Query Volume (7d)</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6096f7" stopOpacity={0.35} />
                            <stop offset="95%" stopColor="#6096f7" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(96,150,247,0.08)" />
                        <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 10, color: 'var(--text-primary)' }} />
                        <Area type="monotone" dataKey="queries" stroke="#6096f7" strokeWidth={2} fill="url(#qGrad)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="glass-card chart-card">
                    <div className="chart-title"><AlertCircle size={16} color="var(--neon-pink)" />Error Distribution</div>
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={trendData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(96,150,247,0.08)" />
                        <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 10, color: 'var(--text-primary)' }} />
                        <Bar dataKey="errors" fill="#d4578a" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Latency dist (full-width) */}
                <div className="glass-card chart-card" style={{ marginBottom: '2rem' }}>
                  <div className="chart-title"><Clock size={16} color="var(--neon-amber)" />Response Latency Distribution</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={latencyData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(96,150,247,0.08)" horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={60} />
                      <Tooltip contentStyle={{ background: 'var(--bg-elevated)', border: '1px solid var(--glass-border)', borderRadius: 10, color: 'var(--text-primary)' }} />
                      <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} label={{ position: 'right', fill: 'var(--text-muted)', fontSize: 11, formatter: (v: number) => `${v}%` }} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Mini recent queries preview */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem' }}>
                    <div className="chart-title" style={{ margin: 0 }}><Database size={16} color="var(--neon-cyan)" />Recent Queries</div>
                    <button className="action-btn action-btn-ghost" style={{ padding: '4px 10px', fontSize: '0.78rem' }} onClick={() => setTab('queries')}>
                      View All <ChevronRight size={12} />
                    </button>
                  </div>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr><th>Query</th><th>Confidence</th><th>Latency</th><th>Status</th><th>Time</th></tr>
                      </thead>
                      <tbody>
                        {queries.slice(0, 5).map((q) => (
                          <tr key={q.id}>
                            <td><div className="query-text">{q.query}</div></td>
                            <td><ConfBadge score={q.confidence_score} /></td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>{fmtMs(q.processing_time_ms)}</td>
                            <td>{q.has_error ? <span className="error-badge">Error</span> : <span className="ok-badge">OK</span>}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmtTime(q.created_at)}</td>
                          </tr>
                        ))}
                        {queries.length === 0 && (
                          <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No queries yet</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ QUERY LOGS TAB ══════════ */}
            {tab === 'queries' && (
              <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                <div className="search-row">
                  <div className="search-input-wrap">
                    <Search size={14} color="var(--text-muted)" />
                    <input
                      className="search-input"
                      placeholder="Search queries…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <button
                    className={`filter-btn ${filterError === false ? 'active' : ''}`}
                    onClick={() => setFilterError(filterError === false ? null : false)}
                  >
                    <CheckCircle size={13} /> Successful
                  </button>
                  <button
                    className={`filter-btn ${filterError === true ? 'error-active' : ''}`}
                    onClick={() => setFilterError(filterError === true ? null : true)}
                  >
                    <XCircle size={13} /> Errors Only
                  </button>
                  <button className="filter-btn" onClick={() => { setSearchQuery(''); setFilterError(null); }}>
                    <Filter size={13} /> Clear
                  </button>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                    {totalQueries} total
                  </span>
                </div>

                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Query</th><th>Response</th><th>Confidence</th>
                          <th>Latency</th><th>Sources</th><th>Status</th><th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {queries.map((q) => (
                          <tr key={q.id}>
                            <td><div className="query-text" title={q.query}>{q.query}</div></td>
                            <td><div className="response-text" title={q.response}>{q.response}</div></td>
                            <td><ConfBadge score={q.confidence_score} /></td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>{fmtMs(q.processing_time_ms)}</td>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)' }}>{q.sources_count ?? '–'}</td>
                            <td>{q.has_error ? <span className="error-badge">Error</span> : <span className="ok-badge">OK</span>}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmtTime(q.created_at)}</td>
                          </tr>
                        ))}
                        {queries.length === 0 && (
                          <tr><td colSpan={7}>
                            <div className="empty-state">
                              <MessageSquare size={40} className="empty-icon" />
                              <p>No queries found</p>
                            </div>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ LIVE FEED TAB ══════════ */}
            {tab === 'live' && (
              <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                <div className="live-header">
                  <div className="live-status">
                    <div className={`live-dot ${liveStatus}`} />
                    <span style={{ color: liveStatus === 'connected' ? 'var(--neon-green)' : liveStatus === 'connecting' ? 'var(--neon-amber)' : 'var(--text-muted)' }}>
                      {liveStatus === 'connected' ? 'Connected – streaming live' : liveStatus === 'connecting' ? 'Connecting…' : 'Disconnected'}
                    </span>
                    {liveStatus === 'connected' ? <Wifi size={14} color="var(--neon-green)" /> : <WifiOff size={14} color="var(--text-muted)" />}
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {liveStatus !== 'connected' && (
                      <button className="action-btn action-btn-primary" onClick={startLiveStream}>
                        <Radio size={14} /> Start Stream
                      </button>
                    )}
                    {liveStatus === 'connected' && (
                      <button className="action-btn action-btn-danger" onClick={stopLiveStream}>
                        <XCircle size={14} /> Stop
                      </button>
                    )}
                    {liveQueries.length > 0 && (
                      <button className="action-btn action-btn-ghost" onClick={() => setLiveQueries([])}>
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1rem', background: 'rgba(7,9,15,0.6)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={12} /> Real-time query stream — new queries appear automatically
                  </div>
                  <div className="live-feed" ref={liveScrollRef}>
                    {liveQueries.length === 0 && (
                      <div className="empty-state">
                        <Radio size={40} className="empty-icon" style={{ display: 'block' }} />
                        <p style={{ marginTop: '1rem' }}>Waiting for new queries…</p>
                        <p style={{ fontSize: '0.78rem', marginTop: '0.5rem' }}>Ask a question in the chat to see it appear here.</p>
                      </div>
                    )}
                    {liveQueries.map((q, i) => (
                      <div key={q.id ?? i} className={`live-entry ${q.has_error ? 'error-entry' : ''}`}>
                        <div>
                          <div className="live-query">{q.query}</div>
                          <div className="live-response">{q.response}</div>
                        </div>
                        <div className="live-meta">
                          <ConfBadge score={q.confidence_score} />
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{fmtMs(q.processing_time_ms)}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{fmtTime(q.created_at)}</span>
                          {q.has_error && <span className="error-badge" style={{ fontSize: '0.7rem' }}>Error</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ══════════ USERS TAB ══════════ */}
            {tab === 'users' && (
              <div style={{ animation: 'fadeInUp 0.4s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{totalUsers} registered users</span>
                  <button className="action-btn action-btn-ghost" onClick={fetchUsers}>
                    <RefreshCw size={13} /> Refresh
                  </button>
                </div>

                <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Email</th><th>Role</th><th>Queries</th>
                          <th>Last Active</th><th>Joined</th><th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((u) => (
                          <tr key={u.id}>
                            <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{u.email}</td>
                            <td>
                              <span style={{
                                fontSize: '0.75rem', padding: '2px 8px', borderRadius: 999,
                                background: u.role === 'admin' ? 'rgba(157,110,232,0.15)' : 'rgba(96,150,247,0.1)',
                                color: u.role === 'admin' ? 'var(--neon-purple)' : 'var(--neon-blue)',
                                border: `1px solid ${u.role === 'admin' ? 'rgba(157,110,232,0.3)' : 'rgba(96,150,247,0.2)'}`,
                                fontFamily: 'var(--font-mono)',
                              }}>
                                {u.role === 'admin' ? '⬡ admin' : '◇ student'}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center', fontFamily: 'var(--font-mono)' }}>{u.query_count}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmtTime(u.last_active)}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{fmtTime(u.created_at)}</td>
                            <td>
                              {u.is_active
                                ? <span className="ok-badge">Active</span>
                                : <span className="error-badge">Inactive</span>}
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr><td colSpan={6}>
                            <div className="empty-state">
                              <Users size={40} className="empty-icon" />
                              <p>No users found</p>
                            </div>
                          </td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
}
