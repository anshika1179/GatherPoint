import { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp, ShoppingBag, DollarSign, BarChart3, Download,
  Calendar, Filter, ChevronDown, Clock, Award, ArrowUp, ArrowDown
} from 'lucide-react';
import ApiService from '../services/apiService';

const DATE_RANGES = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'All Time', value: 'all' },
];

function getDateBounds(range) {
  const now = new Date();
  const start = new Date(now);
  if (range === 'today') { start.setHours(0, 0, 0, 0); }
  else if (range === 'week') { start.setDate(now.getDate() - 7); }
  else if (range === 'month') { start.setDate(1); start.setHours(0, 0, 0, 0); }
  else { return { start: null, end: null }; }
  return { start, end: now };
}

function KpiCard({ icon: Icon, title, value, sub, trend, color = '#D4AF37' }) {
  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-5 space-y-3 hover:border-gray-600/60 transition-all">
      <div className="flex items-center justify-between">
        <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-bold px-2 py-0.5 rounded-full ${
            trend >= 0
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}>
            {trend >= 0 ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div>
        <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-extrabold text-white mt-1">{value}</p>
        {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

export default function Reports() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await ApiService.getOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load report data.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    const { start, end } = getDateBounds(dateRange);
    if (!start) return orders;
    return orders.filter(o => {
      const d = new Date(o.createdAt);
      return d >= start && d <= end;
    });
  }, [orders, dateRange]);

  // KPIs
  const paidOrders = filteredOrders.filter(o => o.status === 'PAID');
  const totalRevenue = paidOrders.reduce((s, o) => s + (o.total || o.totalAmount || 0), 0);
  const totalOrders = filteredOrders.length;
  const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0;
  const cancelledCount = filteredOrders.filter(o => o.status === 'CANCELLED').length;

  // Revenue by day (last 7 or 30 days based on range)
  const chartDays = dateRange === 'today' ? 24 : dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 30;
  const revenueByDay = useMemo(() => {
    const map = {};
    paidOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const key = dateRange === 'today'
        ? `${d.getHours()}:00`
        : d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
      map[key] = (map[key] || 0) + (o.total || o.totalAmount || 0);
    });
    return map;
  }, [paidOrders, dateRange]);

  const chartKeys = Object.keys(revenueByDay).slice(-chartDays);
  const chartValues = chartKeys.map(k => revenueByDay[k] || 0);
  const maxVal = Math.max(...chartValues, 1);
  const chartW = 800;
  const chartH = 180;
  const pts = chartValues.map((v, i) => ({
    x: chartValues.length > 1 ? (i / (chartValues.length - 1)) * chartW : chartW / 2,
    y: chartH - (v / maxVal) * chartH * 0.85,
  }));
  const linePath = pts.length > 1 ? `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
  const areaPath = pts.length > 1 ? `${linePath} L ${chartW},${chartH} L 0,${chartH} Z` : '';

  // Status breakdown
  const statusCounts = {
    PAID: paidOrders.length,
    DRAFT: filteredOrders.filter(o => o.status === 'DRAFT').length,
    CANCELLED: cancelledCount,
  };

  // Top products
  const productMap = {};
  filteredOrders.forEach(order => {
    (order.items || []).forEach(item => {
      const name = item.product?.productName || item.productName || 'Unknown';
      if (!productMap[name]) productMap[name] = { revenue: 0, qty: 0 };
      productMap[name].revenue += item.totalPrice || 0;
      productMap[name].qty += item.quantity || 0;
    });
  });
  const topProducts = Object.entries(productMap)
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2B2] via-[#D4AF37] to-[#8A6623]">
            Reports & Analytics
          </h1>
          <p className="text-gray-400 text-sm mt-1">Business insights, revenue breakdown and order trends</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Date Range Selector */}
          <div className="flex bg-gray-800/60 border border-gray-700/50 rounded-2xl p-1 gap-1">
            {DATE_RANGES.map(r => (
              <button
                key={r.value}
                onClick={() => setDateRange(r.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dateRange === r.value
                    ? 'bg-[#D4AF37] text-black shadow'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          <button
            onClick={() => ApiService.exportReports('csv')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800/60 border border-gray-700/50 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer hover:border-gray-600"
          >
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-sm">
          {errorMsg}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <div className="w-10 h-10 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard icon={DollarSign} title="Total Revenue" value={`₹${totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} sub={`${paidOrders.length} paid orders`} />
            <KpiCard icon={ShoppingBag} title="Total Orders" value={totalOrders} sub={`${cancelledCount} cancelled`} color="#60a5fa" />
            <KpiCard icon={TrendingUp} title="Avg Order Value" value={`₹${avgOrderValue.toFixed(0)}`} sub="per paid order" color="#34d399" />
            <KpiCard icon={Award} title="Completion Rate" value={totalOrders > 0 ? `${Math.round((paidOrders.length / totalOrders) * 100)}%` : '—'} sub="paid vs total" color="#a78bfa" />
          </div>

          {/* Revenue Chart + Status Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Revenue Chart */}
            <div className="lg:col-span-2 bg-gray-800/40 border border-gray-700/50 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-white font-bold text-base flex items-center gap-2">
                  <BarChart3 size={18} className="text-[#D4AF37]" /> Revenue Trend
                </h2>
                <span className="text-xs text-gray-500">{DATE_RANGES.find(r => r.value === dateRange)?.label}</span>
              </div>
              {chartValues.length === 0 || maxVal === 1 ? (
                <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
                  No revenue data for this period
                </div>
              ) : (
                <div className="relative h-52 w-full">
                  <svg viewBox={`0 0 ${chartW} ${chartH + 30}`} className="w-full h-full overflow-visible">
                    <defs>
                      <linearGradient id="rptGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.35" />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#rptGrad)" />
                    <path d={linePath} fill="none" stroke="#D4AF37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {pts.map((p, i) => (
                      <g key={i} className="group">
                        <circle cx={p.x} cy={p.y} r="5" fill="#020403" stroke="#D4AF37" strokeWidth="2.5" className="cursor-pointer" />
                        <text x={p.x} y={p.y - 14} fill="#FAF8F1" fontSize="12" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          ₹{chartValues[i].toLocaleString('en-IN')}
                        </text>
                        {i % Math.max(1, Math.floor(chartKeys.length / 6)) === 0 && (
                          <text x={p.x} y={chartH + 22} fill="#6b7280" fontSize="11" textAnchor="middle">
                            {chartKeys[i]}
                          </text>
                        )}
                      </g>
                    ))}
                  </svg>
                </div>
              )}
            </div>

            {/* Status Breakdown */}
            <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-6 space-y-4">
              <h2 className="text-white font-bold text-base flex items-center gap-2">
                <Filter size={18} className="text-[#D4AF37]" /> Order Status
              </h2>
              <div className="space-y-3">
                {Object.entries(statusCounts).map(([status, count]) => {
                  const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
                  const colors = { PAID: 'emerald', DRAFT: 'yellow', CANCELLED: 'rose' };
                  const c = colors[status] || 'gray';
                  return (
                    <div key={status} className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className={`font-bold text-${c}-400`}>{status}</span>
                        <span className="text-gray-400">{count} ({pct.toFixed(0)}%)</span>
                      </div>
                      <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${c}-400 rounded-full transition-all duration-700`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-700/50 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Total Orders</span><span className="text-white font-bold">{totalOrders}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Revenue Collected</span><span className="text-[#D4AF37] font-bold">₹{totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-6 space-y-4">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Award size={18} className="text-[#D4AF37]" /> Top Products by Revenue
            </h2>
            {topProducts.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-8">No product data for this period.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-gray-700/50">
                      <th className="text-left py-3 pr-4">#</th>
                      <th className="text-left py-3 pr-4">Product</th>
                      <th className="text-right py-3 pr-4">Qty Sold</th>
                      <th className="text-right py-3">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700/20">
                    {topProducts.map(([name, data], i) => (
                      <tr key={name} className="hover:bg-white/5 transition-colors">
                        <td className="py-3 pr-4 text-gray-600 font-mono text-xs">{i + 1}</td>
                        <td className="py-3 pr-4 font-semibold text-white">{name}</td>
                        <td className="py-3 pr-4 text-right text-gray-400">{data.qty}</td>
                        <td className="py-3 text-right font-bold text-[#D4AF37]">₹{data.revenue.toFixed(0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Recent Orders Table */}
          <div className="bg-gray-800/40 border border-gray-700/50 rounded-3xl p-6 space-y-4">
            <h2 className="text-white font-bold text-base flex items-center gap-2">
              <Clock size={18} className="text-[#D4AF37]" /> Recent Orders
              <span className="text-xs text-gray-500 font-normal">({filteredOrders.length} total)</span>
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-[10px] uppercase tracking-wider border-b border-gray-700/50">
                    <th className="text-left py-3 px-2">Order #</th>
                    <th className="text-left py-3 px-2">Date</th>
                    <th className="text-left py-3 px-2">Table</th>
                    <th className="text-left py-3 px-2">Customer</th>
                    <th className="text-right py-3 px-2">Amount</th>
                    <th className="text-left py-3 px-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/20">
                  {filteredOrders.slice(0, 10).map(order => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-2 font-mono text-[11px] text-[#D4AF37]">{order.orderNumber}</td>
                      <td className="py-3 px-2 text-xs text-gray-400">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="py-3 px-2 text-xs text-white font-semibold">
                        {order.table?.tableNumber || <span className="text-gray-500">Takeaway</span>}
                      </td>
                      <td className="py-3 px-2 text-xs text-gray-300">
                        {order.customer?.name || <span className="text-gray-600">Walk-in</span>}
                      </td>
                      <td className="py-3 px-2 text-right font-bold text-white">
                        ₹{(order.total || order.totalAmount || 0).toFixed(2)}
                      </td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                          order.status === 'PAID'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : order.status === 'CANCELLED'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <p className="text-center text-gray-600 text-sm py-10">No orders for this period.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}