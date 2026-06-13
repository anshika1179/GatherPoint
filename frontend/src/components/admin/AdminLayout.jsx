import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

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

      {/* Sidebar */}
      <div className="z-20">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          setIsCollapsed={setIsSidebarCollapsed} 
        />
      </div>

      {/* Main Content Wrapper */}
      <div 
        className="flex flex-col flex-1 transition-all duration-300 ease-in-out z-10 overflow-hidden"
        style={{ marginLeft: isSidebarCollapsed ? '80px' : '280px' }}
      >
        {/* Top Navbar */}
        <Topbar />

        {/* Main Content Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto px-6 md:px-8 py-6 md:py-8 scrollbar-hide">
          <div className="max-w-[1400px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
