import { useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { 
  LayoutDashboard, 
  Coffee, 
  ListTree, 
  UtensilsCrossed, 
  Users, 
  Receipt, 
  UserCircle, 
  Ticket, 
  LineChart, 
  PieChart, 
  Settings, 
  LogOut,
  ChevronLeft
} from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const sidebarRef = useRef(null);
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isCollapsed) {
      gsap.to(sidebarRef.current, { width: 80, duration: 0.3, ease: 'power2.inOut' });
    } else {
      gsap.to(sidebarRef.current, { width: 280, duration: 0.3, ease: 'power2.inOut' });
    }
  }, [isCollapsed]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const menuSections = [
    {
      title: 'DASHBOARD',
      items: [
        { name: 'Overview', icon: LayoutDashboard, path: '/admin/dashboard' }
      ]
    },
    {
      title: 'MANAGEMENT',
      items: [
        { name: 'Products', icon: Coffee, path: '/admin/products' },
        { name: 'Categories', icon: ListTree, path: '/admin/categories' },
        { name: 'Tables', icon: UtensilsCrossed, path: '/admin/tables' },
        { name: 'Employees', icon: Users, path: '/admin/employees' }
      ]
    },
    {
      title: 'OPERATIONS',
      items: [
        { name: 'Orders', icon: Receipt, path: '/admin/orders' },
        { name: 'Customers', icon: UserCircle, path: '/admin/customers' },
        { name: 'Coupons', icon: Ticket, path: '/admin/coupons' }
      ]
    },
    {
      title: 'ANALYTICS',
      items: [
        { name: 'Reports', icon: LineChart, path: '/admin/reports' },
        { name: 'Revenue', icon: PieChart, path: '/admin/revenue' }
      ]
    }
  ];

  return (
    <aside 
      ref={sidebarRef}
      className="fixed left-0 top-0 h-screen bg-[#0A261C]/60 backdrop-blur-2xl border-r border-[#D4A373]/20 flex flex-col z-20 overflow-y-auto overflow-x-hidden shadow-[4px_0_24px_0_rgba(0,0,0,0.4)]"
      style={{ width: '280px' }}
    >
      {/* Logo Area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#D4A373]/20 shrink-0">
        {!isCollapsed && (
          <h1 className="text-[#D4A373] text-2xl font-bold font-cinzel tracking-wide whitespace-nowrap">
            GatherPoint <span className="text-sm font-sans tracking-normal font-medium text-gray-400 block -mt-1">Admin Panel</span>
          </h1>
        )}
        {isCollapsed && (
          <div className="text-[#D4A373] text-2xl font-bold font-cinzel mx-auto">GP</div>
        )}
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`text-gray-400 hover:text-[#D4A373] transition-colors ${isCollapsed ? 'hidden' : 'block'}`}
        >
          <ChevronLeft size={20} />
        </button>
      </div>

      {isCollapsed && (
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="w-full py-4 text-gray-400 hover:text-[#D4A373] flex justify-center transition-colors"
        >
          <ChevronLeft size={20} className="rotate-180" />
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 py-8 px-5 space-y-16">
        {menuSections.map((section, idx) => (
          <div key={idx}>
            {!isCollapsed && (
              <h3 className="text-xs font-bold text-[#D4A373]/70 uppercase tracking-[0.2em] mb-8 px-2">
                {section.title}
              </h3>
            )}
            <div className="space-y-6">
              {section.items.map((item, itemIdx) => (
                <NavLink
                  key={itemIdx}
                  to={item.path}
                  title={isCollapsed ? item.name : ''}
                  className={({ isActive }) =>
                    `flex items-center gap-4 px-5 py-[1.125rem] rounded-xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-[#2D6A4F]/30 text-[#D4A373] shadow-inner border border-[#D4A373]/10' 
                        : 'text-gray-400 hover:bg-[#2D6A4F]/15 hover:text-[#FAF8F1]'
                    }`
                  }
                >
                  <item.icon size={22} className="shrink-0" />
                  {!isCollapsed && <span className="font-semibold tracking-wide text-[15px]">{item.name}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer / Settings */}
      <div className="p-4 border-t border-[#D4A373]/20 space-y-1 shrink-0">
        <NavLink
          to="/admin/settings"
          title={isCollapsed ? 'Settings' : ''}
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              isActive 
                ? 'bg-[#2D6A4F]/20 text-[#D4A373]' 
                : 'text-gray-400 hover:bg-[#2D6A4F]/10 hover:text-white'
            }`
          }
        >
          <Settings size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </NavLink>
        
        <button
          onClick={handleLogout}
          title={isCollapsed ? 'Logout' : ''}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut size={20} className="shrink-0" />
          {!isCollapsed && <span className="font-medium">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
