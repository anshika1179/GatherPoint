import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div 
      className="flex h-screen text-[#FAF8F1] overflow-hidden relative"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Blurred Glass Overlay */}
      <div className="absolute inset-0 bg-[#071B14]/75 backdrop-blur-xl z-0"></div>

      {/* Mobile sidebar backdrop */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-black/60 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className="z-20">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed}
          mobileOpen={mobileSidebarOpen}
          setMobileOpen={setMobileSidebarOpen}
        />
      </div>

      {/* Main Content Wrapper */}
      <div 
        className={`flex flex-col flex-1 transition-all duration-300 ease-in-out z-10 overflow-hidden ${
          isSidebarCollapsed ? 'md:ml-20' : 'md:ml-[280px]'
        }`}
      >
        {/* Top Navbar */}
        <Topbar onMenuToggle={() => setMobileSidebarOpen(true)} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-4 md:px-8 py-4 md:py-8 scrollbar-hide">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
