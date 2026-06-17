import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Search, Clock, CheckCircle, ChevronRight } from 'lucide-react';

const API_BASE = '/api';

function KdsApp() {
  const navigate = useNavigate();
  const { user, token: localToken, loading: authLoading } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [categories, setCategories] = useState([]);
  const [wsConnected, setWsConnected] = useState(false);
  const [token, setToken] = useState(null);
  const [now, setNow] = useState(0);
  const wsRef = useRef(null);

  // Periodic time updates for pure time calculations
  useEffect(() => {
    const activeTimeout = setTimeout(() => {
      setNow(Date.now());
    }, 0);
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => {
      clearTimeout(activeTimeout);
      clearInterval(interval);
    };
  }, []);

  const fetchCategories = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setCategories(await res.json());
    } catch (e) { console.debug('KDS: categories fetch failed', e); }
  }, [token]);

  const fetchTickets = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/kitchen/orders`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setTickets(await res.json());
    } catch (e) { console.debug('KDS: tickets fetch failed', e); }
  }, [token]);

  // Handle token load from local auth
  useEffect(() => {
    if (!authLoading && localToken) {
      setToken(localToken);
    } else if (!authLoading && !localToken) {
      setToken(null);
    }
  }, [authLoading, localToken]);

  useEffect(() => {
    if (token) {
      const activeTimeout = setTimeout(() => {
        fetchTickets();
        fetchCategories();
      }, 0);
      return () => clearTimeout(activeTimeout);
    }
  }, [token, fetchTickets, fetchCategories]);

  // WebSocket connection
  useEffect(() => {
    if (!token) return;
    
    const connectWs = () => {
      const socket = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws/websocket');
      
      socket.onopen = () => {
        setWsConnected(true);
        socket.send('CONNECT\naccept-version:1.2\n\n\x00');
      };
      
      socket.onmessage = (event) => {
        const data = event.data;
        if (data.includes('CONNECTED')) {
          socket.send('SUBSCRIBE\nid:sub-0\ndestination:/topic/kitchen\n\n\x00');
        } else if (data.includes('MESSAGE')) {
          fetchTickets();
        }
      };
      
      socket.onclose = () => {
        setWsConnected(false);
        setTimeout(connectWs, 5000);
      };
      
      wsRef.current = socket;
    };
    
    connectWs();
    
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [token, fetchTickets]);

  // Auto-refresh every 10 seconds
  useEffect(() => {
    const interval = setInterval(fetchTickets, 10000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const handlePrepareTicket = async (id) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/kitchen/orders/${id}/prepare`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchTickets();
  };

  const handleCompleteTicket = async (id) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/kitchen/orders/${id}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchTickets();
  };

  const handleCompleteItem = async (ticketId, itemId) => {
    if (!token) return;
    const res = await fetch(`${API_BASE}/kitchen/orders/${ticketId}/items/${itemId}/complete`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) fetchTickets();
  };

  const filteredTickets = tickets
    .filter(t => stageFilter === 'ALL' || t.stage === stageFilter)
    .filter(t => categoryFilter === 'ALL' || t.items?.some(item => item.categoryId == categoryFilter || item.categoryName === categoryFilter))
    .filter(t => t.orderNumber?.toLowerCase().includes(search.toLowerCase()));

  const getTimeElapsed = (createdAt) => {
    if (!createdAt) return '';
    const diff = now - new Date(createdAt).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    return `${Math.floor(mins / 60)}h ${mins % 60}m ago`;
  };

  if (authLoading) {
    return (
      <div className="kds-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading KDS...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="kds-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: '20px' }}>
        <h1 style={{ color: 'var(--primary)', fontFamily: 'var(--font-display)' }}>GatherPoint KDS</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Please sign in to access the Kitchen Display.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/staff-pos')}
          style={{ padding: '12px 24px' }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  const stages = ['TO_COOK', 'PREPARING', 'COMPLETED'];
  const stageColors = { TO_COOK: 'var(--danger)', PREPARING: 'var(--warning)', COMPLETED: 'var(--accent)' };
  const stageLabels = { TO_COOK: 'To Cook', PREPARING: 'Preparing', COMPLETED: 'Ready to Serve' };

  return (
    <div className="kds-bg">
      {/* Header */}
      <div className="kds-header-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Clock size={28} style={{ color: 'var(--primary)' }} />
          <h1 style={{ fontSize: '1.5rem' }}>Kitchen Display System</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <span className={`badge ${wsConnected ? 'badge-success' : 'badge-danger'}`}>
            {wsConnected ? 'Live' : 'Offline'}
          </span>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search order..."
              style={{ paddingLeft: '32px', width: '200px' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="form-control"
            style={{ width: '140px', background: 'var(--bg-surface)' }}
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
          >
            <option value="ALL">All Stages</option>
            {stages.map(s => <option key={s} value={s}>{stageLabels[s]}</option>)}
          </select>
          <select
            className="form-control"
            style={{ width: '140px', background: 'var(--bg-surface)' }}
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="ALL">All Categories</option>
            {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
          </select>
          <button className="btn btn-secondary" onClick={fetchTickets}>
            Refresh
          </button>
        </div>
      </div>

      {/* Three-stage pipeline */}
      <div className="kds-pipeline">
        {stages.map(stage => {
          const stageTickets = filteredTickets.filter(t => t.stage === stage);
          return (
            <div key={stage} className="kds-column" style={{ borderTopColor: stageColors[stage] }}>
              <div className="kds-column-header">
                <h3>{stageLabels[stage]}</h3>
                <span className="badge" style={{ background: stageColors[stage] }}>{stageTickets.length}</span>
              </div>
              <div className="kds-column-body">
                {stageTickets.length === 0 ? (
                  <div className="kds-empty">No orders</div>
                ) : (
                  stageTickets.map(ticket => (
                    <div
                      key={ticket.id}
                      className="glass-panel kds-ticket-card"
                      onClick={() => {
                        if (stage === 'TO_COOK') handlePrepareTicket(ticket.id);
                        else if (stage === 'PREPARING') handleCompleteTicket(ticket.id);
                      }}
                    >
                      <div className="kds-ticket-header">
                        <span className="kds-order-number">{ticket.orderNumber}</span>
                        <div style={{ textAlign: 'right' }}>
                          {ticket.tableNumber && <span style={{ fontSize: '0.75rem', color: 'var(--primary)', display: 'block' }}>Table {ticket.tableNumber}</span>}
                          <span className="kds-time">{getTimeElapsed(ticket.createdAt)}</span>
                        </div>
                      </div>
                      <div className="kds-ticket-items">
                        {ticket.items?.map((item, idx) => (
                          <div
                            key={idx}
                            className={`kds-ticket-item ${item.completed ? 'completed' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!item.completed) handleCompleteItem(ticket.id, item.id);
                            }}
                          >
                            <span className="kds-item-qty">{item.quantity}x</span>
                            <span className="kds-item-name">{item.productName}</span>
                            {item.completed && <CheckCircle size={14} style={{ color: 'var(--accent)', marginLeft: 'auto' }} />}
                          </div>
                        ))}
                      </div>
                      <div className="kds-ticket-footer">
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                          {stage === 'TO_COOK' ? 'Tap to start cooking' : stage === 'PREPARING' ? 'Tap when ready' : ''}
                        </span>
                        {stage !== 'COMPLETED' && <ChevronRight size={16} style={{ color: stageColors[stage] }} />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .kds-bg {
          background: var(--bg-main);
          min-height: 100vh;
          color: var(--text-primary);
          font-family: var(--font-sans);
          padding: 20px;
          padding-top: 0;
        }
        .kds-header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 0;
          border-bottom: 1px solid var(--border-color);
          margin-bottom: 20px;
          position: sticky;
          top: 0;
          background: var(--bg-main);
          z-index: 10;
        }
        .kds-pipeline {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          height: calc(100vh - 100px);
        }
        .kds-column {
          background: var(--bg-surface);
          border-radius: var(--radius-md);
          border-top: 4px solid;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .kds-column-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
        }
        .kds-column-header h3 {
          font-size: 1rem;
          color: var(--text-secondary);
        }
        .kds-column-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .kds-ticket-card {
          padding: 16px;
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .kds-ticket-card:hover {
          border-color: var(--border-highlight);
          transform: translateY(-1px);
        }
        .kds-ticket-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .kds-order-number {
          font-weight: 700;
          font-family: var(--font-display);
          font-size: 1rem;
        }
        .kds-time {
          font-size: 0.75rem;
          color: var(--text-muted);
        }
        .kds-ticket-items {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .kds-ticket-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 8px;
          border-radius: 6px;
          background: rgba(0,0,0,0.15);
          cursor: pointer;
          transition: var(--transition-fast);
        }
        .kds-ticket-item:hover {
          background: rgba(0,0,0,0.3);
        }
        .kds-ticket-item.completed .kds-item-name {
          text-decoration: line-through;
          opacity: 0.5;
        }
        .kds-item-qty {
          font-weight: 700;
          color: var(--primary);
          min-width: 24px;
        }
        .kds-item-name {
          flex: 1;
          font-size: 0.9rem;
        }
        .kds-ticket-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
          padding-top: 10px;
          border-top: 1px solid var(--border-color);
        }
        .kds-empty {
          text-align: center;
          color: var(--text-muted);
          padding: 40px;
        }
      `}</style>
    </div>
  );
}

export default KdsApp;
