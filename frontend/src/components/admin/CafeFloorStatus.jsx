import { CheckCircle2, Clock, Ban } from 'lucide-react';

const CafeFloorStatus = () => {
  const tables = [
    { id: 'T1', status: 'Available', seats: 4 },
    { id: 'T2', status: 'Occupied', seats: 2 },
    { id: 'T3', status: 'Reserved', seats: 6 },
    { id: 'T4', status: 'Available', seats: 4 },
    { id: 'T5', status: 'Occupied', seats: 2 },
    { id: 'T6', status: 'Occupied', seats: 4 },
    { id: 'T7', status: 'Reserved', seats: 8 },
    { id: 'T8', status: 'Available', seats: 2 },
  ];

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Available':
        return 'bg-green-500/10 border-green-500/30 text-green-400';
      case 'Occupied':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'Reserved':
        return 'bg-[#D4A373]/10 border-[#D4A373]/30 text-[#D4A373]';
      default:
        return 'bg-gray-500/10 border-gray-500/30 text-gray-400';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Available':
        return <CheckCircle2 size={14} />;
      case 'Occupied':
        return <Ban size={14} />;
      case 'Reserved':
        return <Clock size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-[#0A261C]/60 backdrop-blur-md border border-[#D4A373]/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[24px] p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-[#FAF8F1] font-semibold font-serif text-xl tracking-wide">Floor Status</h2>
          <p className="text-sm text-gray-400 mt-1">Live table availability tracking</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
        {tables.map((table) => (
          <div 
            key={table.id}
            className={`border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-pointer ${getStatusStyle(table.status)}`}
          >
            <div className="flex justify-between items-start mb-4">
              <span className="font-black text-2xl tracking-tight">{table.id}</span>
              <span className="opacity-80">{getStatusIcon(table.status)}</span>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest">{table.status}</p>
              <p className="text-[11px] font-medium opacity-80 mt-1.5">{table.seats} Seats</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CafeFloorStatus;
