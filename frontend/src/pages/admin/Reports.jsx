import { useState, useEffect, useMemo } from 'react';
import { DollarSign, ShoppingBag, TrendingUp, Award, Download, BarChart3, Filter, Users, Calendar, Coffee, FileSpreadsheet, FileText } from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard';
import ApiService from '../../services/apiService';

const Reports = () => {
  const [reportData, setReportData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [period, setPeriod] = useState(''); // '', 'today', 'week', 'month'
  const [employeeId, setEmployeeId] = useState('');
  const [productId, setProductId] = useState('');

  // Chart trend toggle
  const [trendType, setTrendType] = useState('revenue'); // 'revenue' or 'orders'

  // Fetch employees and products for the dropdown filters
  useEffect(() => {
    Promise.all([
      ApiService.getEmployees().catch(() => []),
      ApiService.getProducts().catch(() => []),
    ]).then(([emps, prods]) => {
      setEmployees(Array.isArray(emps) ? emps : []);
      setProducts(Array.isArray(prods) ? prods : []);
    });
  }, []);

  // Fetch report when filters change
  const fetchReport = () => {
    setLoading(true);
    const filters = {};
    if (period) filters.period = period;
    if (employeeId) filters.employeeId = employeeId;
    if (productId) filters.productId = productId;

    ApiService.getReports(filters)
      .then(data => {
        setReportData(data);
      })
      .catch(err => {
        console.error('Failed to fetch reports:', err);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchReport();
  }, [period, employeeId, productId]);

  // Extract metrics from backend response
  const totalRevenue = reportData?.totalRevenue || 0;
  const totalOrders = reportData?.totalOrders || 0;
  const avgOrderValue = reportData?.averageOrderValue || 0;
  const topProducts = reportData?.topProducts || [];
  const topCategories = reportData?.topCategories || [];
  const topOrders = reportData?.topOrders || [];
  const salesTrend = reportData?.salesTrend || [];

  // Total category revenue for breakdown percentages
  const totalCategoryRevenue = useMemo(() => {
    return topCategories.reduce((sum, cat) => sum + (cat.revenue || 0), 0);
  }, [topCategories]);

  // Compute trend chart coordinates dynamically
  const { labels, chartData, pts, linePath, areaPath } = useMemo(() => {
    const labels = salesTrend.map(t => {
      const d = new Date(t.date);
      return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    });
    const chartData = salesTrend.map(t => trendType === 'revenue' ? (t.revenue || 0) : (t.orderCount || 0));
    const maxVal = Math.max(...chartData, 1);
    const chartW = 800;
    const chartH = 200;
    const pts = chartData.map((v, i) => ({
      x: chartData.length > 1 ? (i / (chartData.length - 1)) * chartW : chartW / 2,
      y: chartH - (v / maxVal) * chartH * 0.82,
    }));
    const linePath = pts.length > 1 ? `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}` : '';
    const areaPath = pts.length > 1 ? `${linePath} L ${chartW},${chartH} L 0,${chartH} Z` : '';

    return { labels, chartData, pts, linePath, areaPath };
  }, [salesTrend, trendType]);

  const handleExport = (type) => {
    ApiService.exportReports(type);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* ── HEADER AND EXPORTS ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#0A261C]/40 backdrop-blur-sm p-6 rounded-[24px] border border-[#D4A373]/10">
        <div>
          <h1 className="text-3xl font-bold text-[#FAF8F1] font-serif">Analytics &amp; Reporting</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time stats and insights for your cafe session.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handleExport('pdf')}
            className="flex items-center gap-2 bg-[#0A261C] border border-[#D4A373]/30 text-[#D4A373] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-[#D4A373]/10 hover:border-[#D4A373]/70 transition-all cursor-pointer shadow-sm"
          >
            <FileText size={15} /> Export PDF
          </button>
          <button
            onClick={() => handleExport('xls')}
            className="flex items-center gap-2 bg-[#D4A373] text-[#0A261C] px-4 py-2.5 rounded-xl text-xs font-extrabold hover:bg-[#FAF8F1] transition-all cursor-pointer shadow-sm"
          >
            <FileSpreadsheet size={15} /> Export Excel
          </button>
        </div>
      </div>

      {/* ── REAL-TIME FILTER BAR ── */}
      <div className="bg-[#0A261C]/60 backdrop-blur-md border border-[#D4A373]/20 p-5 rounded-[24px] shadow-lg flex flex-col md:flex-row gap-5 items-stretch md:items-center justify-between">
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={16} className="text-[#D4A373]" />
          <span className="text-[#FAF8F1] text-xs font-bold uppercase tracking-wider mr-2">Filters:</span>
          
          {/* Period selector */}
          <div className="flex gap-1.5 bg-[#071B14] p-1 rounded-xl border border-[#D4A373]/15">
            {[
              { label: 'All', value: '' },
              { label: 'Today', value: 'today' },
              { label: 'This Week', value: 'week' },
              { label: 'This Month', value: 'month' }
            ].map(item => (
              <button
                key={item.value}
                onClick={() => setPeriod(item.value)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  period === item.value 
                    ? 'bg-[#D4A373] text-[#071B14]' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 flex-1 md:max-w-md">
          {/* Employee filter dropdown */}
          <div className="relative">
            <select
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              className="w-full bg-[#071B14] text-[#FAF8F1] border border-[#D4A373]/20 rounded-xl px-4 py-2 text-xs font-medium focus:border-[#D4A373] outline-none appearance-none cursor-pointer"
            >
              <option value="">All Employees</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
          </div>

          {/* Product filter dropdown */}
          <div className="relative">
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className="w-full bg-[#071B14] text-[#FAF8F1] border border-[#D4A373]/20 rounded-xl px-4 py-2 text-xs font-medium focus:border-[#D4A373] outline-none appearance-none cursor-pointer"
            >
              <option value="">All Products</option>
              {products.map(prod => (
                <option key={prod.id} value={prod.id}>{prod.productName}</option>
              ))}
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-[10px]">▼</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 gap-3">
          <div className="w-12 h-12 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400 text-xs tracking-wider animate-pulse">Loading report insights...</span>
        </div>
      ) : (
        <>
          {/* ── SUMMARY METRICS ── */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatsCard 
              title="Revenue" 
              value={totalRevenue} 
              icon={DollarSign} 
              prefix="₹" 
              delay={0.1} 
            />
            <StatsCard 
              title="Total Orders" 
              value={totalOrders} 
              icon={ShoppingBag} 
              delay={0.2} 
            />
            <StatsCard 
              title="Average Order Value" 
              value={Math.round(avgOrderValue)} 
              icon={TrendingUp} 
              prefix="₹" 
              delay={0.3} 
            />
          </div>

          {/* ── CHARTS SECTION: TREND AND CATEGORY BREAKDOWN ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Sales Trend Chart (2 columns) */}
            <div className="lg:col-span-2">
              <div className="bg-[#0A261C]/60 backdrop-blur-md border border-[#D4A373]/20 shadow-xl p-6 rounded-[24px] h-full flex flex-col justify-between">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[#FAF8F1] font-semibold font-serif text-lg flex items-center gap-2">
                    <BarChart3 size={18} className="text-[#D4A373]" /> Sales Trend Over Time
                  </h2>
                  <div className="flex gap-1.5 bg-[#071B14] p-1 rounded-lg border border-[#D4A373]/20">
                    <button
                      onClick={() => setTrendType('revenue')}
                      className={`px-3 py-1 text-[10px] uppercase tracking-wide font-bold rounded transition-colors cursor-pointer ${
                        trendType === 'revenue' ? 'bg-[#2D6A4F]/40 text-[#D4A373]' : 'text-gray-400'
                      }`}
                    >
                      Revenue
                    </button>
                    <button
                      onClick={() => setTrendType('orders')}
                      className={`px-3 py-1 text-[10px] uppercase tracking-wide font-bold rounded transition-colors cursor-pointer ${
                        trendType === 'orders' ? 'bg-[#2D6A4F]/40 text-[#D4A373]' : 'text-gray-400'
                      }`}
                    >
                      Order Count
                    </button>
                  </div>
                </div>

                {chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-gray-500 text-xs">No sales data recorded for this selection.</div>
                ) : (
                  <div className="relative h-[250px] w-full px-4 mt-auto">
                    <svg viewBox="0 0 800 240" className="w-full h-full overflow-visible">
                      <defs>
                        <linearGradient id="trendAreaGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4A373" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path d={areaPath} fill="url(#trendAreaGrad)" />
                      <path d={linePath} fill="none" stroke="#D4A373" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                      {pts.map((p, i) => (
                        <g key={i} className="group">
                          <circle cx={p.x} cy={p.y} r="6" fill="#071B14" stroke="#D4A373" strokeWidth="3" className="cursor-pointer" />
                          <text x={p.x} y={p.y - 20} fill="#FAF8F1" fontSize="13" fontWeight="bold" textAnchor="middle" className="opacity-0 group-hover:opacity-100 transition-opacity">
                            {trendType === 'revenue' ? `₹${chartData[i].toLocaleString('en-IN')}` : `${chartData[i]} orders`}
                          </text>
                          <text x={p.x} y={228} fill="#6b7280" fontSize="12" fontWeight="bold" textAnchor="middle">{labels[i]}</text>
                        </g>
                      ))}
                    </svg>
                  </div>
                )}
              </div>
            </div>

            {/* Sales Distribution by Category (1 column) */}
            <div className="lg:col-span-1">
              <div className="bg-[#0A261C]/60 border border-[#D4A373]/20 p-6 rounded-[24px] h-full flex flex-col justify-between">
                <h2 className="text-[#FAF8F1] font-semibold font-serif text-lg mb-6 flex items-center gap-2">
                  <Coffee size={18} className="text-[#D4A373]" /> Sales by Category
                </h2>

                {topCategories.length === 0 ? (
                  <div className="flex items-center justify-center flex-1 text-gray-500 text-xs">No category data recorded.</div>
                ) : (
                  <div className="space-y-5 flex-1 flex flex-col justify-center">
                    {topCategories.map((cat, i) => {
                      const pct = totalCategoryRevenue > 0 ? (cat.revenue / totalCategoryRevenue) * 100 : 0;
                      return (
                        <div key={cat.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-[#FAF8F1]">{cat.name}</span>
                            <span className="text-[#D4A373]">₹{cat.revenue.toLocaleString('en-IN')} ({pct.toFixed(0)}%)</span>
                          </div>
                          <div className="h-2 bg-[#071B14] rounded-full overflow-hidden border border-[#2D6A4F]/20">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#8A6623] to-[#D4A373] transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* ── BOTTOM ROW TABLES: PRODUCTS, CATEGORIES, ORDERS ── */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            
            {/* Top Products Table (1 column) */}
            <div className="xl:col-span-1">
              <div className="bg-[#0A261C]/60 border border-[#D4A373]/20 shadow-lg p-6 rounded-[24px] h-full">
                <h2 className="text-[#FAF8F1] font-semibold font-serif text-lg mb-4 flex items-center gap-2">
                  <Award size={18} className="text-[#D4A373]" /> Top Products
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[#D4A373] border-b border-[#D4A373]/15">
                        <th className="py-2.5 font-bold">Product</th>
                        <th className="py-2.5 font-bold text-center">Qty Sold</th>
                        <th className="py-2.5 font-bold text-right">Revenue</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4A373]/10">
                      {topProducts.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="py-8 text-center text-gray-500">No products sold yet.</td>
                        </tr>
                      ) : (
                        topProducts.map((p) => (
                          <tr key={p.name} className="text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <td className="py-3 font-semibold">{p.name}</td>
                            <td className="py-3 text-center font-bold text-[#FAF8F1]">{p.quantity}</td>
                            <td className="py-3 text-right font-extrabold text-[#D4A373]">₹{p.revenue.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top Orders Table (2 columns) */}
            <div className="xl:col-span-2">
              <div className="bg-[#0A261C]/60 border border-[#D4A373]/20 shadow-lg p-6 rounded-[24px] h-full">
                <h2 className="text-[#FAF8F1] font-semibold font-serif text-lg mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[#D4A373]" /> High-Value Orders
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[#D4A373] border-b border-[#D4A373]/15">
                        <th className="py-2.5 font-bold">Order #</th>
                        <th className="py-2.5 font-bold">Date &amp; Time</th>
                        <th className="py-2.5 font-bold">Served By</th>
                        <th className="py-2.5 font-bold text-right">Order Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#D4A373]/10">
                      {topOrders.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="py-8 text-center text-gray-500">No high-value orders recorded.</td>
                        </tr>
                      ) : (
                        topOrders.map((o) => (
                          <tr key={o.id} className="text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            <td className="py-3 font-bold text-[#FAF8F1]">{o.orderNumber}</td>
                            <td className="py-3 text-gray-400">
                              {new Date(o.createdAt).toLocaleString('en-IN', {
                                dateStyle: 'medium',
                                timeStyle: 'short'
                              })}
                            </td>
                            <td className="py-3 font-medium">{o.employee}</td>
                            <td className="py-3 text-right font-extrabold text-[#D4A373]">₹{o.total.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
  );
};

export default Reports;
