import { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Logo from './customer/Logo';

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigation = [
    { name: 'POS Terminal', href: '/pos', icon: '🛒' },
    { name: 'Orders', href: '/orders', icon: '📋' },
    { name: 'Customers', href: '/customers', icon: '👥' },
    { name: 'Tables', href: '/tables', icon: '🪑' },
    { name: 'Kitchen', href: '/kitchen', icon: '🍳' },
    { name: 'Reports', href: '/reports', icon: '📊' },
    { name: 'Session', href: '/session', icon: '🔐' },
    { name: 'Admin', href: '/admin', icon: '⚙️', admin: true },
  ];

  const sidebarContent = (
    <>
      <div className="px-7 py-6 border-b border-gray-700 flex items-center gap-4">
        <Logo className="w-12 h-12" />
        <h1 className="text-2xl font-bold text-[#D4AF37] font-cinzel">GatherPoint</h1>
      </div>

      <nav className="flex-1 px-5 py-6 space-y-2">
        {navigation.map((item) => {
          if (item.admin && user?.role !== 'ADMIN') return null;
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                isActive
                  ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold shadow-lg shadow-[#D4AF37]/5'
                  : 'text-gray-300 hover:text-white hover:bg-gray-700/60 border border-transparent'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-medium text-base">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-5 py-6 border-t border-gray-700">
        <div className="flex items-center gap-4 mb-5 px-2">
          <div className="w-12 h-12 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-bold text-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-base">{user?.name}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role?.toLowerCase()?.replace('_', ' ')}</p>
          </div>
        </div>
        <button
          onClick={async () => { await logout(); navigate('/staff-pos'); }}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3.5 px-4 rounded-xl transition-colors text-base cursor-pointer"
        >
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex text-base">
      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 text-gray-300 hover:text-white"
          aria-label="Open sidebar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <Logo className="w-8 h-8" />
          <span className="text-lg font-bold text-[#D4AF37] font-cinzel">GatherPoint</span>
        </div>
        <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-bold text-sm">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-800 border-r border-gray-700 flex flex-col transition-transform duration-300 md:relative md:translate-x-0 md:z-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-7 py-6 border-b border-gray-700 md:hidden">
          <div className="flex items-center gap-4">
            <Logo className="w-10 h-10" />
            <h1 className="text-xl font-bold text-[#D4AF37] font-cinzel">GatherPoint</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Hide duplicate header on desktop */}
        <div className="hidden md:block">
          {sidebarContent}
        </div>
        {/* Show content without header on mobile (header already rendered above) */}
        <div className="flex-1 flex flex-col md:hidden">
          <nav className="flex-1 px-5 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              if (item.admin && user?.role !== 'ADMIN') return null;
              const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl transition-all ${
                    isActive
                      ? 'bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 font-semibold shadow-lg shadow-[#D4AF37]/5'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/60 border border-transparent'
                  }`}
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="font-medium text-base">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="px-5 py-6 border-t border-gray-700">
            <div className="flex items-center gap-4 mb-5 px-2">
              <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-sm">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.toLowerCase()?.replace('_', ' ')}</p>
              </div>
            </div>
            <button
              onClick={async () => { await logout(); navigate('/staff-pos'); }}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors text-sm cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-72 shrink-0 bg-gray-800 border-r border-gray-700 flex-col">
        {sidebarContent}
      </aside>

      <main className="flex-1 overflow-auto bg-gray-900/50 pt-14 md:pt-0">
        {children || <Outlet />}
      </main>
    </div>
  );
}
