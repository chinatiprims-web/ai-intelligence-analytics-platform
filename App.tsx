import { useEffect, useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowDownToLine, ArrowUpRight, Bell, Boxes, BrainCircuit, ChevronDown, CircleHelp, Command, Cpu, Database, Gauge, LayoutDashboard, LogOut, Menu, Radio, RefreshCw, Search, Settings2, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, BarChart, Bar } from 'recharts'
import api from './api'
import type { EventRow, Point, Source, Summary, User } from './types'

const fmt = (n: number) => new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(n)
function App() {
  const [token, setToken] = useState(localStorage.getItem('sentra_token') || '')
  const [user, setUser] = useState<User | null>(null)
  const [email, setEmail] = useState('demo@aianalytics.local')
  const [password, setPassword] = useState('DemoPass123!')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [series, setSeries] = useState<Point[]>([])
  const [sources, setSources] = useState<Source[]>([])
  const [events, setEvents] = useState<EventRow[]>([])
  const [range, setRange] = useState(14)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [live, setLive] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const [search, setSearch] = useState('')

  async function login(e: React.FormEvent) {
    e.preventDefault(); setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      localStorage.setItem('sentra_token', data.access_token); setToken(data.access_token); setUser(data.user)
    } catch { setError('Unable to sign in. Check your credentials and API status.') }
  }
  function logout() { localStorage.removeItem('sentra_token'); setToken(''); setUser(null) }

  async function load() {
    if (!token) return
    setLoading(true)
    try {
      const [me, s, t, so, ev] = await Promise.all([
        api.get('/auth/me'), api.get('/analytics/summary'),
        api.get(`/analytics/timeseries?days=${range}`), api.get('/analytics/sources'), api.get('/events?limit=12')
      ])
      setUser(me.data); setSummary(s.data); setSeries(t.data); setSources(so.data); setEvents(ev.data)
      setError('')
    } catch { setError('Session expired or API unavailable. Please sign in again.'); logout() }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [token, range])
  useEffect(() => {
    if (!token) return
    const scheme = location.protocol === 'https:' ? 'wss' : 'ws'
    const ws = new WebSocket(`${scheme}://${location.host}/ws/live`)
    ws.onopen = () => setLive(true); ws.onclose = () => setLive(false)
    return () => ws.close()
  }, [token])
  const filtered = useMemo(() => events.filter(e => `${e.source} ${e.event_type}`.toLowerCase().includes(search.toLowerCase())), [events, search])

  if (!token || !user) return <div className="login-shell"><div className="login-card"><div className="brand"><div className="brand-mark"><BrainCircuit size={22}/></div><div><b>SENTRA</b><small>INTELLIGENCE PLATFORM</small></div></div><div className="login-copy"><span className="eyebrow">ANALYTICS CLOUD / 01</span><h1>See the signal.<br/><em>Understand everything.</em></h1><p>A unified intelligence layer for your operational data, events and emerging patterns.</p></div><form onSubmit={login}><label>WORK EMAIL</label><input value={email} onChange={e=>setEmail(e.target.value)} type="email" required/><label>PASSWORD</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required/><button className="primary full">Access workspace <ArrowUpRight size={16}/></button>{error && <div className="error">{error}</div>}</form><div className="login-foot"><ShieldCheck size={14}/> SECURE WORKSPACE AUTHENTICATION <span>DEMO ACCESS ENABLED</span></div></div><div className="login-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="orb-core"><BrainCircuit size={54}/></div><div className="float-tag tag-a"><Activity size={14}/> LIVE SIGNALS <b>+18.6%</b></div><div className="float-tag tag-b"><Cpu size={14}/> MODEL STATUS <b>OPTIMAL</b></div><div className="art-caption">INTELLIGENCE, IN MOTION <span>FIG 01 — SENTRA CORE</span></div></div></div>

  return <div className="app-shell">
    <aside className={`sidebar ${navOpen?'open':''}`}><div className="brand"><div className="brand-mark"><BrainCircuit size={21}/></div><div><b>SENTRA</b><small>INTELLIGENCE PLATFORM</small></div></div><div className="workspace"><div className="workspace-icon">N</div><div><b>Northstar Labs</b><small>Enterprise workspace</small></div><ChevronDown size={14}/></div><div className="nav-label">WORKSPACE</div><nav><a className="active"><LayoutDashboard size={17}/> Overview <span/></a><a><Activity size={17}/> Event explorer</a><a><Database size={17}/> Data sources</a><a><BrainCircuit size={17}/> AI insights <span className="new">NEW</span></a><a><Gauge size={17}/> Performance</a></nav><div className="nav-label">MANAGEMENT</div><nav><a><Boxes size={17}/> Integrations</a><a><ShieldCheck size={17}/> Access control</a><a><Settings2 size={17}/> Settings</a></nav><div className="sidebar-bottom"><div className="plan"><div className="plan-top"><Sparkles size={15}/> <b>Intelligence Pro</b><span>82%</span></div><div className="progress"><i/></div><small>Workspace data capacity</small></div><div className="profile"><div className="avatar">{user.full_name.slice(0,1).toUpperCase()}</div><div><b>{user.full_name}</b><small>{user.email}</small></div><button className="icon-btn" onClick={logout} title="Sign out"><LogOut size={16}/></button></div></div></aside>
    <main className="main"><header className="topbar"><button className="icon-btn mobile-menu" onClick={()=>setNavOpen(!navOpen)}><Menu size={19}/></button><div className="crumb">Workspace <span>/</span> <b>Overview</b></div><div className="top-actions"><div className="system-status"><i className={live?'pulse':''}/>{live?'SYSTEM LIVE':'CONNECTING'}</div><button className="icon-btn"><Search size={17}/></button><button className="icon-btn notification"><Bell size={17}/><i/></button><div className="top-avatar">{user.full_name.slice(0,1).toUpperCase()}</div></div></header>
    <div className="content"><div className="page-heading"><div><div className="eyebrow">MONDAY, 31 OCTOBER 2026 <span>•</span> SYSTEM OVERVIEW</div><h1>Good morning, {user.full_name.split(' ')[0]} <span>✳</span></h1><p>Here's what's happening across your intelligence ecosystem.</p></div><div className="heading-actions"><button className="secondary" onClick={()=>window.open('/api/events/export','_blank')}><ArrowDownToLine size={15}/> Export data</button><button className="primary" onClick={load}><RefreshCw size={15}/> Refresh</button></div></div>
      {error && <div className="error banner">{error}</div>}
      <div className="section-line"><span>PERFORMANCE SNAPSHOT</span><div/><span className="muted">LAST 30 DAYS <i className="green-dot"/></span></div>
      <div className="kpi-grid">{[
        {label:'Total events processed',value:summary?.total_events??'—',delta:`${summary?.events_delta??0}%`,icon:Activity,desc:'vs. previous 30 days'},
        {label:'Active data sources',value:summary?.active_sources??'—',delta:'Connected',icon:Radio,desc:'Across your workspace'},
        {label:'Aggregate signal value',value:summary?fmt(summary.total_value):'—',delta:'+12.4%',icon:Zap,desc:'Normalized event units'},
        {label:'Anomalies detected',value:summary?.anomaly_count??'—',delta:'Needs review',icon:AlertTriangle,desc:'Statistical outliers'}
      ].map((k,i)=><div className="kpi card" key={k.label}><div className="kpi-top"><span>{k.label}</span><div className={`kpi-icon ki-${i}`}><k.icon size={17}/></div></div><div className="kpi-value">{typeof k.value==='number'?fmt(k.value):k.value}</div><div className="kpi-foot"><b className={i===3?'amber':''}>{k.delta}</b><span>{k.desc}</span></div></div>)}</div>
      <div className="analytics-grid"><section className="card chart-card"><div className="card-heading"><div><span className="eyebrow">SIGNAL INTELLIGENCE</span><h2>Event volume over time</h2><p>Daily event activity across all connected sources</p></div><select value={range} onChange={e=>setRange(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={14}>Last 14 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select></div><div className="chart-legend"><i/> Event volume <span>•</span> <b>{fmt(summary?.total_events||0)} total events</b></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><AreaChart data={series}><defs><linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#56d6b0" stopOpacity={.28}/><stop offset="100%" stopColor="#56d6b0" stopOpacity={0}/></linearGradient></defs><CartesianGrid stroke="#273142" vertical={false}/><XAxis dataKey="date" tick={{fill:'#8490a3',fontSize:10}} tickLine={false} axisLine={false}/><YAxis tick={{fill:'#8490a3',fontSize:10}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:'#151e2d',border:'1px solid #2a394c',borderRadius:10,color:'#fff'}}/><Area type="monotone" dataKey="events" stroke="#56d6b0" strokeWidth={2.5} fill="url(#fillEvents)"/></AreaChart></ResponsiveContainer></div></section>
      <section className="card source-card"><div className="card-heading"><div><span className="eyebrow">ECOSYSTEM</span><h2>Source distribution</h2><p>Events by origin</p></div><button className="icon-btn"><CircleHelp size={16}/></button></div><div className="source-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={sources} layout="vertical" margin={{left:0,right:12}}><XAxis type="number" hide/><YAxis type="category" dataKey="source" width={88} tick={{fill:'#9aa6b7',fontSize:10}} tickLine={false} axisLine={false}/><Tooltip contentStyle={{background:'#151e2d',border:'1px solid #2a394c',borderRadius:10}}/><Bar dataKey="count" fill="#7895e8" radius={[0,5,5,0]} barSize={13}/></BarChart></ResponsiveContainer></div><div className="source-total"><span>Connected sources</span><b>{sources.length.toString().padStart(2,'0')} <small>/ 08</small></b></div></section></div>
      <section className="card events-card"><div className="card-heading events-heading"><div><span className="eyebrow">STREAM MONITOR</span><h2>Recent events</h2><p>Latest signals received by the platform</p></div><div className="event-tools"><div className="searchbox"><Search size={14}/><input placeholder="Filter events..." value={search} onChange={e=>setSearch(e.target.value)}/></div><button className="secondary compact" onClick={()=>load()}><RefreshCw size={14}/> Sync</button></div></div><div className="table-wrap"><table><thead><tr><th>EVENT ID</th><th>SOURCE</th><th>EVENT TYPE</th><th>VALUE</th><th>TIMESTAMP</th><th>STATUS</th></tr></thead><tbody>{filtered.map(e=><tr key={e.id}><td className="id">EV-{String(e.id).padStart(5,'0')}</td><td><span className="source-name"><i/>{e.source}</span></td><td>{e.event_type.replaceAll('_',' ')}</td><td className="value">{e.value.toFixed(2)}</td><td>{new Date(e.created_at).toLocaleString()}</td><td><span className="status"><i/> Processed</span></td></tr>)}</tbody></table>{filtered.length===0&&<div className="empty">No events match your filter.</div>}</div><div className="table-footer">Showing {filtered.length} of latest {events.length} events <button onClick={()=>window.open('/api/events/export','_blank')}>Download CSV <ArrowUpRight size={13}/></button></div></section>
      <footer><span>© 2026 SENTRA INTELLIGENCE SYSTEMS</span><span><i className="green-dot"/> ALL SYSTEMS OPERATIONAL</span><span>API V1.0.0 <b>•</b> <a href="http://localhost:8000/docs" target="_blank">DEVELOPER DOCS ↗</a></span></footer>
    </div></main>
  </div>
}
export default App
