const getStatusBadge = (status) => {
  const base = 'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase';
  switch (status) {
    case 'Completed': case 'COMPLETED':
      return <span className={`${base} bg-green-500/10 text-green-400 border-green-500/20`}>{status}</span>;
    case 'Preparing': case 'PREPARING': case 'TO_COOK':
      return <span className={`${base} bg-blue-500/10 text-blue-400 border-blue-500/20`}>{status}</span>;
    case 'Pending': case 'PENDING':
      return <span className={`${base} bg-yellow-500/10 text-yellow-400 border-yellow-500/20`}>{status}</span>;
    case 'Cancelled': case 'CANCELLED':
      return <span className={`${base} bg-red-500/10 text-red-400 border-red-500/20`}>{status}</span>;
    default:
      return <span className={`${base} bg-gray-500/10 text-gray-400 border-gray-500/20`}>{status}</span>;
  }
};

const OrdersTable = ({ orders = [] }) => {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-gray-800 text-gray-400 text-sm uppercase tracking-wider">
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
              key={order.id || index} 
              className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors cursor-pointer"
            >
              <td className="px-6 py-5 text-white font-bold">#{order.id}</td>
              <td className="px-6 py-5 text-gray-300 font-medium">{order.customer}</td>
              <td className="px-6 py-5 text-gray-300 font-medium">T-{order.table}</td>
              <td className="px-6 py-5 whitespace-nowrap text-sm font-extrabold text-[#D4AF37]">
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
