import { Link, Outlet, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Logo from './customer/Logo';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/staff-pos');
  };

  const getFilteredNavigation = () => {
    if (user?.role === 'KITCHEN_STAFF') {
      return [{ name: 'Kitchen Display', href: '/kitchen', icon: '🍳' }];
    }
    if (user?.role === 'EMPLOYEE') {
      return [
        { name: 'POS Terminal', href: '/pos', icon: '🛒' },
        { name: 'Orders', href: '/orders', icon: '📋' },
        { name: 'Customers', href: '/customers', icon: '👥' },
        { name: 'Tables', href: '/tables', icon: '🪑' },
        { name: 'Reports', href: '/reports', icon: '📊' },
        { name: 'Session', href: '/session', icon: '🔐' },
      ];
    }
    // ADMIN has access to all links
    return [
      { name: 'POS Terminal', href: '/pos', icon: '🛒' },
      { name: 'Orders', href: '/orders', icon: '📋' },
      { name: 'Customers', href: '/customers', icon: '👥' },
      { name: 'Tables', href: '/tables', icon: '🪑' },
      { name: 'Kitchen Display', href: '/kitchen', icon: '🍳' },
      { name: 'Reports', href: '/reports', icon: '📊' },
      { name: 'Session', href: '/session', icon: '🔐' },
      { name: 'Admin Panel', href: '/admin', icon: '⚙️' },
    ];
  };

  const navigation = getFilteredNavigation();

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-700 flex items-center gap-3">
          <Logo className="w-9 h-9" />
          <h1 className="text-xl font-bold text-green-500 font-cinzel">GatherPoint</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center font-bold">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-sm">{user?.name}</p>
              <p className="text-xs text-gray-500 capitalize">{user?.role?.replace('_', ' ').toLowerCase()}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children || <Outlet />}
      </main>
    </div>
  );
}