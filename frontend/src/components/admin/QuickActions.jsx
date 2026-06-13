import { PlusCircle, UtensilsCrossed, UserPlus, Ticket } from 'lucide-react';

const QuickActions = () => {
  const actions = [
    { name: 'Add Product', icon: PlusCircle, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20', shadow: 'hover:shadow-[0_0_20px_rgba(52,211,153,0.2)]' },
    { name: 'Add Table', icon: UtensilsCrossed, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20', shadow: 'hover:shadow-[0_0_20px_rgba(96,165,250,0.2)]' },
    { name: 'Add Employee', icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20', shadow: 'hover:shadow-[0_0_20px_rgba(192,132,252,0.2)]' },
    { name: 'Create Coupon', icon: Ticket, color: 'text-[#D4A373]', bg: 'bg-[#D4A373]/10', border: 'border-[#D4A373]/20', shadow: 'hover:shadow-[0_0_20px_rgba(212,163,115,0.2)]' },
  ];

  return (
    <div className="bg-[#0A261C]/60 backdrop-blur-md border border-[#D4A373]/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[24px] p-6">
      <h2 className="text-[#FAF8F1] font-semibold font-serif text-xl tracking-wide mb-6">Quick Actions</h2>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, idx) => (
          <button 
            key={idx}
            className={`flex flex-col items-center justify-center gap-4 py-6 px-5 rounded-2xl border ${action.bg} ${action.border} hover:bg-[#2D6A4F]/40 transition-all duration-300 hover:-translate-y-1.5 ${action.shadow} group`}
          >
            <action.icon size={28} className={`${action.color} group-hover:scale-110 transition-transform duration-300`} />
            <span className="text-sm font-medium text-[#FAF8F1] tracking-wide">{action.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
