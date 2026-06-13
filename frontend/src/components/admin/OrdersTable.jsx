

const OrdersTable = ({ orders }) => {
  const getStatusBadge = (status) => {
    switch(status) {
      case 'Completed': return <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-green-500/20">Completed</span>;
      case 'Preparing': return <span className="px-3 py-1 bg-[#D4A373]/10 text-[#D4A373] rounded-full text-xs font-semibold tracking-wider uppercase border border-[#D4A373]/20">Preparing</span>;
      case 'Pending': return <span className="px-3 py-1 bg-yellow-500/10 text-yellow-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-yellow-500/20">Pending</span>;
      case 'Cancelled': return <span className="px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-red-500/20">Cancelled</span>;
      default: return <span className="px-3 py-1 bg-gray-500/10 text-gray-400 rounded-full text-xs font-semibold tracking-wider uppercase border border-gray-500/20">{status}</span>;
    }
  };
  
  const getStatusColor = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'pending': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'preparing': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-[#2D6A4F]/30 text-gray-400 text-sm uppercase tracking-wider">
            <th className="px-6 py-4 font-semibold">Order ID</th>
            <th className="px-6 py-4 font-semibold">Customer</th>
            <th className="px-6 py-4 font-semibold">Table</th>
            <th className="px-6 py-4 font-semibold">Amount</th>
            <th className="px-6 py-4 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {orders.map((order, index) => (
            <tr 
              key={order.id} 
              className="border-b border-[#2D6A4F]/10 hover:bg-[#2D6A4F]/20 transition-colors cursor-pointer"
            >
              <td className="px-6 py-5 text-[#FAF8F1] font-medium">#{order.id}</td>
              <td className="px-6 py-5 text-gray-300">{order.customer}</td>
              <td className="px-6 py-5 text-gray-300">T-{order.table}</td>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-[#FAF8F1]">
                ₹{order.amount}
              </td>
              <td className="px-6 py-5 whitespace-nowrap">
                {getStatusBadge(order.status)}
              </td>
            </tr>
          ))}
          {orders.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                No recent orders found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrdersTable;
