import { useState, useEffect, useMemo } from 'react';
import { TrendingUp, DollarSign, CreditCard, Banknote, Smartphone, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import ApiService from '../../services/apiService';

const TABS = ['Daily', 'Weekly', 'Monthly'];

function buildRevenueData(orders, tab) {
  const paidOrders = orders.filter(o => o.status === 'PAID');
  const map = {};
  paidOrders.forEach(o => {
    const d = new Date(o.createdAt);
    let key;
    if (tab === 'Daily') key = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    else if (tab === 'Weekly') key = `W${Math.ceil(d.getDate() / 7)} ${d.toLocaleDateString('en-IN', { month: 'short' })}`;
    else key = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    map[key] = (map[key] || 0) + (o.total || o.totalAmount || 0);
  });
  const entries = Object.entries(map).slice(-(tab === 'Daily' ? 14 : tab === 'Weekly' ? 8 : 12));
  return { labels: entries.map(([k]) => k), data: entries.map(([, v]) => v) };
}

function PaymentBreakdown({ orders }) {
  const methodMap = {};
  orders.filter(o => o.status === 'PAID').forEach(o => {
    const method = o.payments?.[0]?.method || o.payment?.paymentMethod?.name || o.paymentMethodName || 'Other';
    methodMap[method] = (methodMap[method] || 0) + (o.total || o.totalAmount || 0);
  });
  const total = Object.values(methodMap).reduce((s, v) => s + v, 0);
  const entries = Object.entries(methodMap).sort((a, b) => b[1] - a[1]);
  const colors = { Cash: '#34d399', Card: '#60a5fa', UPI: '#a78bfa', Other: '#D4A373' };
  const icons = { Cash: Banknote, Card: CreditCard, UPI: Smartphone };

  if (entries.length === 0) return <p className="text-gray-500 text-sm text-center py-8">No payment data yet.</p>;

  return (
    <div className="space-y-4">
      {entries.map(([method, amount]) => {
        const Icon = icons[method] || CreditCard;
        const pct = total > 0 ? (amount / total) * 100 : 0;
        const color = colors[method] || '#D4A373';
        return (
          <div key={method} className="space-y-1.5">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}20` }}>
                  <Icon size={13} style={{ color }} />
                </div>
                <span className="font-semibold text-[#FAF8F1]">{method}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-[#D4A373]">₹{amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                <span className="text-gray-500 text-xs ml-2">{pct.toFixed(0)}%</span>
              </div>
            </div>
            <div className="h-2 bg-[#071B14] rounded-full overflow-hidden border border-[#2D6A4F]/30">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

const Revenue = () => {
  const [orders, setOrders] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Daily');

  useEffect(() => {
    Promise.all([
      ApiService.getOrders().catch(() => []),
      ApiService.getSessionHistory().catch(() => []),
    ]).then(([ords, sess]) => {
      setOrders(Array.isArray(ords) ? ords : []);
      setSessions(Array.isArray(sess) ? sess : []);
    }).finally(() => setLoading(false));
  }, []);

  const paidOrders = orders.filter(o => o.status === 'PAID');
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || o.totalAmount || 0), 0);

  // This week vs last week
  const now = new Date();
  const thisWeekStart = new Date(now); thisWeekStart.setDate(now.getDate() - 7);
  const lastWeekStart = new Date(now); lastWeekStart.setDate(now.getDate() - 14);
  const thisWeekRevenue = paidOrders.filter(o => new Date(o.createdAt) >= thisWeekStart).reduce((s, o) => s + (o.total || o.totalAmount || 0), 0);
  const lastWeekRevenue = paidOrders.filter(o => {
    const d = new Date(o.createdAt);
    return d >= lastWeekStart && d < thisWeekStart;
  }).reduce((s, o) => s + (o.total || o.totalAmount || 0), 0);
  const weekGrowth = lastWeekRevenue > 0 ? ((thisWeekRevenue - lastWeekRevenue) / lastWeekRevenue) * 100 : 0;

  const { labels, data: chartData } = useMemo(() => buildRevenueData(orders, activeTab), [orders, activeTab]);
  const maxVal = Math.max(...chartData, 1);
  const chartW = 800;
  const chartH = 200;
  const pts = chartData.map((v, i) => ({
    x: chartData.length > 1 ? (i / (chartData.length - 1)) * chartW : chartW / 2,
    y: chartH - (v / maxVal) * chartH * 0.85,
  }));
  const linePath = pts.length > 1 ? `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
  const areaPath = pts.length > 1 ? `${linePath} L ${chartW},${chartH} L 0,${chartH} Z` : '';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#FAF8F1] font-serif">Revenue Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">Track earnings, payment methods and session performance.</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: 'Total Revenue', value: `₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: `${paidOrders.length} paid orders`, icon: DollarSign, color: '#D4A373' },
              { label: 'This Week', value: `₹${thisWeekRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, sub: weekGrowth >= 0 ? `↑ ${weekGrowth.toFixed(1)}% vs last week` : `↓ ${Math.abs(weekGrowth).toFixed(1)}% vs last week`, icon: TrendingUp, color: weekGrowth >= 0 ? '#34d399' : '#f87171' },
              { label: 'POS Sessions', value: sessions.length, sub: `${sessions.filter(s => !s.closedAt).length} currently active`, icon: BarChart3, color: '#60a5fa' },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-[#0A261C]/60 border border-[#D4A373]/20 rounded-[20px] p-6 space-y-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}20`, border: `1px solid ${color}30` }}>
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-semibold">{label}</p>
                  <p className="text-2xl font-extrabold text-[#FAF8F1] mt-1">{value}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Revenue Chart */}
          <div className="bg-[#0A261C]/60 backdrop-blur-md border border-[#D4A373]/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 rounded-[24px]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#FAF8F1] font-semibold font-serif text-xl tracking-wide">Revenue Over Time</h2>
              <div className="flex gap-2 bg-[#071B14] p-1 rounded-lg border border-[#D4A373]/20">
                {TABS.map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${activeTab === tab ? 'bg-[#2D6A4F]/40 text-[#D4A373]' : 'text-gray-400 hover:text-white'}`}>
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-48 text-gray-500 text-sm">No data</div>
            ) : (
              <div className="relative h-[260px] w-full px-4">
                <svg viewBox={`0 0 ${chartW} ${chartH + 40}`} className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#D4A373" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <path d={areaPath} fill="url(#revGrad)" />
                  <path d={linePath} fill="none" stroke="#D4A373" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
                  {pts.map((p, i) => (
                    <g key={i} className="group">
                      <circle cx={p.x} cy={p.y} r="6" fill="#071B14" stroke="#D4A373" strokeWidth="2.5" />
                      <text x={p.x} y={p.y - 18} fill="#FAF8F1" fontSize="13" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        ₹{chartData[i].toLocaleString('en-IN')}
                      </text>
                      {i % Math.max(1, Math.floor(labels.length / 7)) === 0 && (
                        <text x={p.x} y={chartH + 28} fill="#6b7280" fontSize="12" textAnchor="middle">{labels[i]}</text>
                      )}
                    </g>
                  ))}
                </svg>
              </div>
            )}
          </div>

          {/* Bottom Row: Payment Methods + Sessions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Payment Methods */}
            <div className="bg-[#0A261C]/60 border border-[#D4A373]/20 p-6 rounded-[24px] space-y-4">
              <h2 className="text-[#FAF8F1] font-semibold font-serif text-lg">Payment Method Breakdown</h2>
              <PaymentBreakdown orders={orders} />
            </div>

            {/* Session History */}
            <div className="bg-[#0A261C]/60 border border-[#D4A373]/20 p-6 rounded-[24px] space-y-4">
              <h2 className="text-[#FAF8F1] font-semibold font-serif text-lg">Recent POS Sessions</h2>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-8">No sessions recorded yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-gray-500 uppercase tracking-wider border-b border-[#2D6A4F]/30">
                        <th className="text-left py-2 pr-4">Employee</th>
                        <th className="text-right py-2 pr-4">Opening</th>
                        <th className="text-right py-2 pr-4">Closing</th>
                        <th className="text-left py-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#2D6A4F]/20">
                      {sessions.slice(0, 8).map(session => (
                        <tr key={session.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-2.5 pr-4 text-[#FAF8F1] font-semibold">{session.employee?.name || 'Staff'}</td>
                          <td className="py-2.5 pr-4 text-right text-gray-400">₹{session.openingAmount?.toFixed(0) || '—'}</td>
                          <td className="py-2.5 pr-4 text-right font-bold text-[#D4A373]">
                            {session.closingAmount ? `₹${session.closingAmount.toFixed(0)}` : '—'}
                          </td>
                          <td className="py-2.5">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                              !session.closedAt
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 animate-pulse'
                                : 'bg-gray-700/50 text-gray-400 border border-gray-600/30'
                            }`}>
                              {session.closedAt ? 'Closed' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Revenue;
