import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function AccessDenied() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/staff-pos');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#020403] text-[#FAF8F1] p-6">
      <div className="text-center max-w-md bg-[#0A261C]/60 p-8 rounded-3xl border border-[#D4A373]/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)]">
        <div className="text-6xl mb-6">🚫</div>
        <h1 className="text-3xl font-bold mb-4 font-cinzel text-[#D4A373]">Access Denied</h1>
        <p className="text-lg mb-6 text-gray-300">
          You don't have permission to access this page.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Your current role does not have access to this section. Please sign out and log in with an authorized role if you need access.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="bg-[#2D6A4F]/40 hover:bg-[#2D6A4F]/60 text-[#D4A373] border border-[#D4A373]/30 font-semibold py-2.5 px-6 rounded-xl transition-all duration-300"
          >
            Go Home
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-900/40 hover:bg-red-800/60 text-red-400 border border-red-500/30 font-semibold py-2.5 px-6 rounded-xl transition-all duration-300 cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}