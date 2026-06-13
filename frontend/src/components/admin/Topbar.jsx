import { useState, useEffect } from 'react';
import { Bell, Search, Moon, Sun, User } from 'lucide-react';
import useAuth from '../../hooks/useAuth';

const Topbar = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentDate(now.toLocaleDateString('en-US', options));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="h-20 px-8 flex items-center justify-between sticky top-0 z-10 bg-[#0A261C]/50 backdrop-blur-2xl border-b border-[#D4A373]/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
      
      {/* Date & Search */}
      <div className="flex items-center gap-8 flex-1">
        <div className="text-gray-400 text-sm hidden md:block">
          {currentDate}
        </div>
        <div className="relative max-w-md w-full group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search size={18} className="text-gray-500 group-hover:text-[#D4A373] transition-colors" />
          </div>
          <input 
            type="text" 
            placeholder="Search orders, products, or customers..." 
            className="w-full h-11 bg-[#0A261C]/40 backdrop-blur-xl border border-[#D4A373]/20 text-[#FAF8F1] rounded-xl pl-12 pr-4 hover:border-[#D4A373]/40 focus:outline-none focus:border-[#D4A373] focus:ring-1 focus:ring-[#D4A373] transition-all duration-300 placeholder-gray-400 shadow-[0_4px_16px_rgba(0,0,0,0.2)]"
          />
        </div>
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-6">
        
        {/* Theme Toggle */}
        <button className="text-gray-400 hover:text-[#D4A373] transition-colors p-2 rounded-full hover:bg-[#D4A373]/10">
          <Moon size={22} />
        </button>

        {/* Notification Bell */}
        <button className="relative text-gray-400 hover:text-[#D4A373] transition-colors p-2 rounded-full hover:bg-[#D4A373]/10">
          <Bell size={22} />
          <span className="absolute top-1.5 right-1.5 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-[#0A261C]"></span>
        </button>
        
        <div className="h-8 w-px bg-[#D4A373]/30 mx-2"></div>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block group-hover:opacity-80 transition-opacity">
            <p className="text-sm font-semibold text-[#FAF8F1]">{user?.name || 'Admin User'}</p>
            <p className="text-xs text-[#D4A373]">Super Admin</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#2D6A4F] border-2 border-[#D4A373]/50 flex items-center justify-center text-white font-bold overflow-hidden shadow-lg group-hover:scale-105 transition-transform">
            {user?.name ? user.name.charAt(0).toUpperCase() : <User size={20} />}
          </div>
        </div>
      </div>

    </header>
  );
};

export default Topbar;
