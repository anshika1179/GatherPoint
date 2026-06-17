import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Users, Utensils } from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard';
import OrdersTable from '../../components/admin/OrdersTable';
import ProductList from '../../components/admin/ProductList';
import CafeFloorStatus from '../../components/admin/CafeFloorStatus';
import QuickActions from '../../components/admin/QuickActions';
import ApiService from '../../services/apiService';

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const dashboardRef = useRef(null);

  const [recentOrders, setRecentOrders] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [activeTablesCount, setActiveTablesCount] = useState(0);
  const [totalCustomersCount, setTotalCustomersCount] = useState(0);
  const [realSalesTrend, setRealSalesTrend] = useState([]);

  const [activeTab, setActiveTab] = useState('Daily');

  useEffect(() => {
    // Live Clock
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Entrance Animation
    if (dashboardRef.current) {
      gsap.fromTo(
        dashboardRef.current.children,
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
      );
    }

    // Fetch reports
    ApiService.getReports().then(data => {
      setTotalRevenue(data.totalRevenue || 0);
      setTotalOrders(data.totalOrders || 0);
      setRealSalesTrend(data.salesTrend || []);
      
      if (data.topProducts) {
        setTopProducts(data.topProducts.slice(0, 4).map((p) => ({
          id: p.name,
          name: p.name,
          category: 'Category',
          revenue: p.revenue || 0,
          salesCount: p.quantity || 0,
          image: null
        })));
      }
    }).catch(console.error);

    // Fetch orders for Recent Orders
    ApiService.getOrders().then(orders => {
      const sorted = [...orders].sort((a, b) =>
        new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setRecentOrders(sorted.slice(0, 5).map(o => ({
        id: o.orderNumber || o.id,
        customer: o.customer?.name || 'Walk-in',
        table: o.table?.tableNumber || '-',
        amount: o.total || 0,
        status: o.status
      })));
    }).catch(console.error);

    // Fetch tables count
    ApiService.getTables().then(tables => {
      const active = tables.filter(t => t.active).length;
      setActiveTablesCount(active);
    }).catch(console.error);

    // Fetch customers count
    ApiService.getCustomers().then(custs => {
      setTotalCustomersCount(custs.length);
    }).catch(console.error);

    return () => clearInterval(timer);
  }, []);

  const [seeding, setSeeding] = useState(false);

  const handleSeedData = async () => {
    if (seeding) return;
    try {
      setSeeding(true);
      const res = await ApiService.seedDemoData();
      alert(res.message || 'Demo data seeded successfully!');
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to seed demo data.');
    } finally {
      setSeeding(false);
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  const getGreeting = (date) => {
    const hour = date.getHours();
    if (hour < 12) return 'Good Morning, Admin';
    if (hour < 17) return 'Good Afternoon, Admin';
    return 'Good Evening, Admin';
  };

  const chartDatasets = {
    Daily: {
      data: realSalesTrend.length > 0 ? realSalesTrend.map(t => t.revenue) : [40000, 70000, 45000, 90000, 65000, 85000, 120000],
      labels: realSalesTrend.length > 0 
        ? realSalesTrend.map(t => new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })) 
        : ['Day 1', 'Day 2', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7']
    },
    Weekly: {
      data: [350000, 420000, 380000, 510000],
      labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4']
    },
    Monthly: {
      data: [1200000, 1500000, 1300000, 1800000, 1600000, 2100000, 2400000, 2200000, 2500000, 2700000, 2600000, 3100000],
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }
  };

  const currentDataset = chartDatasets[activeTab];
  const chartData = currentDataset.data;
  const maxVal = Math.max(...chartData);
  const chartHeight = 220;
  const chartWidth = 800;
  const chartPoints = chartData.map((val, i) => {
    const x = (i / (chartData.length - 1)) * chartWidth;
    const y = chartHeight - (val / maxVal) * chartHeight * 0.85;
    return { x, y };
  });
  const linePath = `M ${chartPoints.map(p => `${p.x},${p.y}`).join(' L ')}`;
  const areaPath = `${linePath} L ${chartWidth},${chartHeight} L 0,${chartHeight} Z`;

  return (
    <div ref={dashboardRef} className="flex flex-col gap-8 pb-12">
      {/* SECTION 1: Header & Clock */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-900/50 backdrop-blur-md p-6 md:p-8 rounded-[24px] border border-gray-800 shadow-xl shadow-[#D4AF37]/5">
        <div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2B2] via-[#D4AF37] to-[#8A6623] tracking-tight">{getGreeting(time)}</h1>
          <p className="text-gray-400 text-sm mt-2 font-medium">Manage your cafe operations from one central hub.</p>
        </div>
        <div className="flex flex-col items-start md:items-end gap-3">
          <div className="md:text-right">
            <p className="text-[#D4AF37] font-bold tracking-widest uppercase text-xs mb-1">{formatDate(time)}</p>
            <p className="text-2xl font-extrabold text-white tracking-wider">{formatTime(time)}</p>
          </div>
          <button
            onClick={handleSeedData}
            disabled={seeding}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D4AF37] to-[#b8943f] text-black px-5 py-2.5 rounded-xl font-extrabold hover:opacity-90 active:scale-95 transition-all duration-200 text-xs shadow-lg shadow-[#D4AF37]/20 cursor-pointer disabled:opacity-50"
          >
            {seeding ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                Seeding Data...
              </>
            ) : (
              'Seed Demo Data'
            )}
          </button>
        </div>
      </div>

      {/* SECTION 2: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={totalRevenue} 
          icon={DollarSign} 
          trend="up" 
          trendValue="+12.5%" 
          prefix="₹" 
          delay={0.1}
        />
        <StatsCard 
          title="Total Orders" 
          value={totalOrders} 
          icon={ShoppingBag} 
          trend="up" 
          trendValue="+8.2%" 
          delay={0.2}
        />
        <StatsCard 
          title="Active Tables" 
          value={activeTablesCount} 
          icon={Utensils} 
          trend="up" 
          trendValue="Live" 
          delay={0.3}
        />
        <StatsCard 
          title="Total Customers" 
          value={totalCustomersCount} 
          icon={Users} 
          trend="up" 
          trendValue="All time" 
          delay={0.4}
        />
      </div>

      {/* SECTION 3: Quick Actions */}
      <QuickActions />

      {/* SECTION 4: Revenue Trend + Floor Status Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Sales Analytics Chart (Left, 2 columns) */}
        <div className="xl:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-xl shadow-[#D4AF37]/5 p-6 rounded-[24px] h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-extrabold text-xl tracking-tight">Revenue Trend</h2>
              <div className="flex gap-2 bg-gray-800/80 p-1.5 rounded-xl border border-gray-700">
                {['Daily', 'Weekly', 'Monthly'].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${
                      activeTab === tab 
                        ? 'bg-[#D4AF37] text-black shadow-sm' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="relative h-[260px] w-full mt-auto px-4">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Animated Fill Area */}
                <motion.path
                  key={`area-${activeTab}`}
                  d={areaPath}
                  fill="url(#areaGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1 }}
                />
                
                {/* Animated Line */}
                <motion.path
                  key={`line-${activeTab}`}
                  d={linePath}
                  fill="none"
                  stroke="#D4AF37"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />

                {/* Points and Tooltips */}
                {chartPoints.map((p, i) => (
                  <g key={`point-${activeTab}-${i}`} className="group">
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r="6"
                      fill="#020403"
                      stroke="#D4AF37"
                      strokeWidth="3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: i * 0.1, type: "spring" }}
                      className="cursor-pointer transition-all duration-300 group-hover:r-8"
                    />
                    <text 
                      x={p.x} 
                      y={p.y - 20} 
                      fill="#FFFFFF" 
                      fontSize="14" 
                      fontWeight="bold" 
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md"
                    >
                      ₹{chartData[i].toLocaleString('en-IN')}
                    </text>
                    <text 
                      x={p.x} 
                      y={chartHeight + 25} 
                      fill="#9CA3AF" 
                      fontSize="13" 
                      fontWeight="500" 
                      textAnchor="middle"
                    >
                      {currentDataset.labels[i]}
                    </text>
                  </g>
                ))}
              </svg>
            </div>
          </div>
        </div>

        {/* Cafe Floor Status (Right, 1 column) */}
        <div className="xl:col-span-1">
          <CafeFloorStatus />
        </div>
      </div>

      {/* SECTION 5: Recent Orders + Top Products Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Recent Orders (Left, 2 columns) */}
        <div className="xl:col-span-2">
          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-xl shadow-[#D4AF37]/5 rounded-[24px] h-full flex flex-col">
            <div className="p-6 border-b border-gray-800 flex justify-between items-center">
              <h2 className="text-white font-extrabold text-xl tracking-tight">Recent Orders</h2>
              <button className="text-[#D4AF37] hover:text-[#b8943f] text-sm font-bold transition-colors hover:underline">
                View All
              </button>
            </div>
            <div className="p-2 flex-1">
              <OrdersTable orders={recentOrders} />
            </div>
          </div>
        </div>

        {/* Top Products (Right, 1 column) */}
        <div className="xl:col-span-1">
          <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-xl shadow-[#D4AF37]/5 p-6 rounded-[24px] h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-white font-extrabold text-xl tracking-tight">Top Products</h2>
            </div>
            <ProductList products={topProducts} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
