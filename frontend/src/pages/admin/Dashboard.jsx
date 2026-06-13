import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { motion } from 'framer-motion';
import { ShoppingBag, DollarSign, Users, Utensils } from 'lucide-react';
import StatsCard from '../../components/admin/StatsCard';
import OrdersTable from '../../components/admin/OrdersTable';
import ProductList from '../../components/admin/ProductList';
import CafeFloorStatus from '../../components/admin/CafeFloorStatus';
import QuickActions from '../../components/admin/QuickActions';

const Dashboard = () => {
  const [time, setTime] = useState(new Date());
  const dashboardRef = useRef(null);

  useEffect(() => {
    // Live Clock
    const timer = setInterval(() => setTime(new Date()), 1000);
    
    // Entrance Animation
    gsap.fromTo(
      dashboardRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out' }
    );

    return () => clearInterval(timer);
  }, []);

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

  // Dummy Data
  const recentOrders = [
    { id: '1042', customer: 'Rahul Sharma', table: '4', amount: 850, status: 'Completed' },
    { id: '1043', customer: 'Priya Patel', table: '2', amount: 420, status: 'Preparing' },
    { id: '1044', customer: 'Amit Singh', table: '7', amount: 1200, status: 'Pending' },
    { id: '1045', customer: 'Sneha Verma', table: '1', amount: 350, status: 'Cancelled' },
    { id: '1046', customer: 'Vikram Mehta', table: '5', amount: 960, status: 'Completed' },
  ];

  const topProducts = [
    { id: 1, name: 'Cappuccino', category: 'Coffee', revenue: 15400, salesCount: 142, image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?w=150&q=80' },
    { id: 2, name: 'Margherita Pizza', category: 'Pizza', revenue: 24500, salesCount: 98, image: 'https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=150&q=80' },
    { id: 3, name: 'Masala Chai', category: 'Tea', revenue: 8600, salesCount: 215, image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=150&q=80' },
    { id: 4, name: 'Fudge Brownie', category: 'Dessert', revenue: 12000, salesCount: 120, image: 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=150&q=80' },
  ];

  const chartData = [40, 70, 45, 90, 65, 85, 120];
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 bg-[#0A261C]/40 backdrop-blur-sm p-6 md:p-8 rounded-[24px] border border-[#D4A373]/10">
        <div>
          <h1 className="text-4xl font-bold text-[#FAF8F1] font-serif tracking-wide">{getGreeting(time)}</h1>
          <p className="text-gray-400 text-base mt-4 tracking-wide">Manage your cafe operations from one central hub.</p>
        </div>
        <div className="text-right">
          <p className="text-[#D4A373] font-semibold tracking-widest uppercase text-sm mb-1">{formatDate(time)}</p>
          <p className="text-xl font-bold font-serif text-[#FAF8F1] tracking-wider">{formatTime(time)}</p>
        </div>
      </div>

      {/* SECTION 2: Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard 
          title="Total Revenue" 
          value={124500} 
          icon={DollarSign} 
          trend="up" 
          trendValue="+12.5%" 
          prefix="₹" 
          delay={0.1}
        />
        <StatsCard 
          title="Total Orders" 
          value={854} 
          icon={ShoppingBag} 
          trend="up" 
          trendValue="+8.2%" 
          delay={0.2}
        />
        <StatsCard 
          title="Active Tables" 
          value={12} 
          icon={Utensils} 
          trend="down" 
          trendValue="-2" 
          suffix="/20" 
          delay={0.3}
        />
        <StatsCard 
          title="Total Customers" 
          value={3240} 
          icon={Users} 
          trend="up" 
          trendValue="+18.4%" 
          delay={0.4}
        />
      </div>

      {/* SECTION 3: Quick Actions */}
      <QuickActions />

      {/* SECTION 4: Revenue Trend + Floor Status Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Sales Analytics Chart (Left, 2 columns) */}
        <div className="xl:col-span-2">
          <div className="bg-[#0A261C]/60 backdrop-blur-md border border-[#D4A373]/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 rounded-[24px] h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#FAF8F1] font-semibold font-serif text-xl tracking-wide">Revenue Trend</h2>
              <div className="flex gap-2 bg-[#071B14] p-1 rounded-lg border border-[#D4A373]/20">
                <button className="px-3 py-1 text-xs font-medium bg-[#2D6A4F]/40 text-[#D4A373] rounded-md">Daily</button>
                <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white">Weekly</button>
                <button className="px-3 py-1 text-xs font-medium text-gray-400 hover:text-white">Monthly</button>
              </div>
            </div>
            
            <div className="relative h-[260px] w-full mt-auto px-4">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight + 40}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#D4A373" stopOpacity="0.4" />
                    <stop offset="100%" stopColor="#D4A373" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                {/* Animated Fill Area */}
                <motion.path
                  d={areaPath}
                  fill="url(#areaGradient)"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5 }}
                />
                
                {/* Animated Line */}
                <motion.path
                  d={linePath}
                  fill="none"
                  stroke="#D4A373"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, ease: 'easeOut' }}
                />

                {/* Points and Tooltips */}
                {chartPoints.map((p, i) => (
                  <g key={i} className="group">
                    <motion.circle
                      cx={p.x}
                      cy={p.y}
                      r="6"
                      fill="#071B14"
                      stroke="#D4A373"
                      strokeWidth="3"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1 + i * 0.1, type: "spring" }}
                      className="cursor-pointer transition-all duration-300 group-hover:r-8"
                    />
                    <text 
                      x={p.x} 
                      y={p.y - 20} 
                      fill="#FAF8F1" 
                      fontSize="14" 
                      fontWeight="bold" 
                      textAnchor="middle"
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-md"
                    >
                      ₹{chartData[i] * 1000}
                    </text>
                    <text 
                      x={p.x} 
                      y={chartHeight + 25} 
                      fill="#9CA3AF" 
                      fontSize="13" 
                      fontWeight="500" 
                      textAnchor="middle"
                    >
                      Day {i+1}
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
          <div className="bg-[#0A261C]/60 backdrop-blur-md border border-[#D4A373]/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[24px] h-full flex flex-col">
            <div className="p-6 border-b border-[#D4A373]/10 flex justify-between items-center">
              <h2 className="text-[#FAF8F1] font-semibold font-serif text-xl tracking-wide">Recent Orders</h2>
              <button className="text-[#D4A373] hover:text-white text-sm font-medium transition-colors hover:underline">
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
          <div className="bg-[#0A261C]/60 backdrop-blur-md border border-[#D4A373]/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-6 rounded-[24px] h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[#FAF8F1] font-semibold font-serif text-xl tracking-wide">Top Products</h2>
            </div>
            <ProductList products={topProducts} />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
