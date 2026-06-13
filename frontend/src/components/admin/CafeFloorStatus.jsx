import { CheckCircle2, Clock, Ban } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../../services/apiService';

const CafeFloorStatus = () => {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [allTables, activeOrders, allBookings] = await Promise.all([
          ApiService.getTables(),
          ApiService.getOrders(),
          ApiService.getBookings()
        ]);

        const activeOrderTables = new Set(
          activeOrders
            .filter(o => o.status !== 'COMPLETED' && o.status !== 'CANCELLED' && o.table)
            .map(o => o.table.id)
        );

        const today = new Date().toDateString();
        const reservedTables = new Set(
          allBookings
            .filter(b => b.status === 'CONFIRMED' && b.table && new Date(b.bookingTime).toDateString() === today)
            .map(b => b.table.id)
        );

        const mappedTables = allTables
          .filter(t => t.active)
          .map(t => {
            let status = 'Available';
            if (activeOrderTables.has(t.id)) {
              status = 'Occupied';
            } else if (reservedTables.has(t.id)) {
              status = 'Reserved';
            }
            return {
              id: t.tableNumber,
              dbId: t.id,
              status,
              seats: t.seats
            };
          });

        setTables(mappedTables);
      } catch (err) {
        console.error("Failed to fetch floor status", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

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

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 gap-3">
          <div className="w-8 h-8 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400 text-xs">Syncing floor data...</p>
        </div>
      ) : tables.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10">
          <p className="text-gray-500 text-sm">No active tables configured.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
          {tables.map((table) => (
            <div 
              key={table.id}
              onClick={() => navigate('/admin/orders')}
              className={`border rounded-xl p-4 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] cursor-pointer ${getStatusStyle(table.status)}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-bold text-lg">{table.id}</span>
                <span className="opacity-80">{getStatusIcon(table.status)}</span>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider">{table.status}</p>
                <p className="text-[10px] opacity-70 mt-1">{table.seats} Seats</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CafeFloorStatus;
