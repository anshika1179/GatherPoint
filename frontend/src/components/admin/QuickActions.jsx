import { useNavigate } from 'react-router-dom';
import { PlusCircle, UtensilsCrossed, UserPlus, Ticket } from 'lucide-react';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    { name: 'Add Product', icon: PlusCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', shadow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.15)]', path: '/admin/products' },
    { name: 'Add Table', icon: UtensilsCrossed, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', shadow: 'hover:shadow-[0_0_20px_rgba(96,165,250,0.15)]', path: '/admin/tables' },
    { name: 'Add Employee', icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', shadow: 'hover:shadow-[0_0_20px_rgba(192,132,252,0.15)]', path: '/admin/employees' },
    { name: 'Create Coupon', icon: Ticket, color: 'text-[#D4AF37]', bg: 'bg-[#D4AF37]/10', border: 'border-[#D4AF37]/20', shadow: 'hover:shadow-[0_0_20px_rgba(212,175,55,0.15)]', path: '/admin/coupons' },
  ];

  return (
    <div className="bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-xl shadow-[#D4AF37]/5 rounded-[24px] p-6">
      <h2 className="text-white font-extrabold text-xl tracking-tight mb-6">Quick Actions</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            onClick={() => navigate(action.path)}
            className={`flex flex-col items-center justify-center gap-4 py-6 px-5 rounded-[20px] border ${action.bg} ${action.border} hover:bg-gray-800/80 transition-all duration-300 hover:-translate-y-1.5 ${action.shadow} group cursor-pointer`}
          >
            <action.icon size={28} className={`${action.color} group-hover:scale-110 transition-transform duration-300`} />
            <span className="text-sm font-bold text-white tracking-wide">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
