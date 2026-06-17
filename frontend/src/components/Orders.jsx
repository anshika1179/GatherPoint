import { useState, useEffect } from 'react';
import ApiService from '../services/apiService';
import { Calendar, User, DollarSign, Clock, Search, Eye, Mail, Printer, Check, X, ShieldAlert } from 'lucide-react';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-[#0A261C]/50 backdrop-blur-xl border border-[#D4A373]/15 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
    {children}
  </div>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [errorMsg, setErrorMsg] = useState('');

  // Selected order details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  
  // Email receipt modal
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [emailSuccess, setEmailSuccess] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await ApiService.getOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load orders history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleOpenDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailModal(true);
  };

  const handleOpenEmailModal = (order) => {
    setSelectedOrder(order);
    setEmailInput(order.customer?.email || '');
    setEmailSuccess('');
    setShowEmailModal(true);
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!emailInput.trim()) return;
    try {
      setEmailLoading(true);
      setEmailSuccess('');
      await ApiService.sendReceipt(selectedOrder.id, emailInput);
      setEmailSuccess(`Receipt successfully emailed to ${emailInput}!`);
    } catch (err) {
      setErrorMsg('Failed to email receipt.');
    } finally {
      setEmailLoading(false);
    }
  };

  const handlePrintReceipt = (order) => {
    const printWindow = window.open('', '_blank', 'width=400,height=600');
    const itemsHtml = order.items?.map(item => `
      <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 5px;">
        <span>${item.quantity}x ${item.product?.productName || item.productName || 'Item'}</span>
        <span>₹${item.totalPrice?.toFixed(2)}</span>
      </div>
    `).join('') || '';

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt ${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; color: #000; }
            .header { text-align: center; margin-bottom: 20px; }
            .divider { border-bottom: 1px dashed #000; margin: 15px 0; }
            .flex-between { display: flex; justify-content: space-between; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h2>GATHERPOINT CAFE</h2>
            <p>123 Dining Street, Cloud City</p>
            <p>Phone: +91 98765 43210</p>
          </div>
          <div class="divider"></div>
          <p>Order: <b>${order.orderNumber}</b></p>
          <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
          <p>Table: ${order.table?.tableNumber || 'Takeaway'}</p>
          <p>Cashier: ${order.employee?.name || 'Staff'}</p>
          <div class="divider"></div>
          ${itemsHtml}
          <div class="divider"></div>
          <div class="flex-between"><span>Subtotal:</span><span>₹${order.subtotal?.toFixed(2)}</span></div>
          <div class="flex-between"><span>Tax (5%):</span><span>₹${order.tax?.toFixed(2)}</span></div>
          ${order.discount > 0 ? `<div class="flex-between"><span>Discount:</span><span>-₹${order.discount?.toFixed(2)}</span></div>` : ''}
          <div class="divider"></div>
          <div class="flex-between bold" style="font-size: 16px;"><span>TOTAL:</span><span>₹${order.total?.toFixed(2)}</span></div>
          <div class="divider"></div>
          <p style="text-align: center; font-size: 12px; margin-top: 30px;">Thank You! Please Visit Again.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleToggleComplete = async (order) => {
    try {
      let newStatus = 'PAID';
      if (order.status === 'PAID') newStatus = 'PENDING';
      else if (order.status === 'PENDING') newStatus = 'COOKING_COMPLETED';
      else if (order.status === 'COOKING_COMPLETED') newStatus = 'COMPLETED';
      else if (order.status === 'COMPLETED') newStatus = 'PAID';
      
      await ApiService.updateOrderStatus(order.id, newStatus);
      fetchOrders();
    } catch (err) {
      setErrorMsg('Failed to update order status.');
    }
  };

  const filteredOrders = orders
    .filter(o => statusFilter === 'ALL' || o.status === statusFilter)
    .filter(o => 
      o.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.table?.tableNumber?.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase())
    );

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-IN');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FAF8F1] tracking-wide font-cinzel">
            Orders <span className="text-[#D4A373]">History</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-sans">
            Search past order receipts, verify payments, and reprint bills.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 text-sm">
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <GlassCard className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] placeholder-gray-500 transition-colors text-sm"
            placeholder="Search by Order #, Table, Customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          {['ALL', 'DRAFT', 'PAID', 'PENDING', 'COOKING_COMPLETED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#D4A373] text-[#071B14]'
                  : 'bg-white/5 border border-[#D4A373]/15 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Orders Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A373]" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <GlassCard className="text-center py-16">
          <Clock className="w-12 h-12 text-[#D4A373]/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-300">No orders found</h3>
          <p className="text-gray-500 text-sm mt-1">Try modifying your search or filters.</p>
        </GlassCard>
      ) : (
        <GlassCard className="overflow-hidden !p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#D4A373]/15 bg-[#0A261C]/80 text-[#D4A373] text-xs font-bold uppercase tracking-widest">
                  <th className="py-4 px-6">Order Number</th>
                  <th className="py-4 px-4">Date & Time</th>
                  <th className="py-4 px-4">Table</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">Cashier</th>
                  <th className="py-4 px-4 text-right">Amount</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D4A373]/10">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-[#2D6A4F]/10 transition-colors text-sm text-[#FAF8F1]">
                    <td className="py-4 px-6 font-mono text-xs text-[#D4A373] font-bold">
                      {order.orderNumber}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="py-4 px-4 font-bold text-[#FAF8F1]">
                      {order.table?.tableNumber || <span className="text-gray-500 font-normal">Takeaway</span>}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-300 font-medium">
                      {order.customer?.name || <span className="text-gray-500">Walk-in</span>}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400">
                      {order.employee?.name || 'System'}
                    </td>
                    <td className="py-4 px-4 text-right font-extrabold text-[#FAF8F1]">
                      ₹{order.total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-full uppercase tracking-wider ${
                        order.status === 'PAID'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : order.status === 'COMPLETED'
                          ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                          : order.status === 'PENDING'
                          ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                          : order.status === 'COOKING_COMPLETED'
                          ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleToggleComplete(order)}
                          className={`p-2 rounded-xl transition-all cursor-pointer ${
                            ['COMPLETED', 'COOKING_COMPLETED', 'PENDING'].includes(order.status)
                              ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                              : 'bg-[#2D6A4F]/20 text-gray-300 hover:text-emerald-400 hover:bg-[#2D6A4F]/40'
                          }`}
                          title={
                            order.status === 'PAID' ? "Mark as Pending" :
                            order.status === 'PENDING' ? "Mark as Cooking Completed" :
                            order.status === 'COOKING_COMPLETED' ? "Mark as Completed" :
                            "Mark as Paid"
                          }
                        >
                          <Check size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenDetails(order)}
                          className="p-2 bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 rounded-xl transition-all cursor-pointer"
                          title="View Invoice"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(order)}
                          className="p-2 bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 rounded-xl transition-all cursor-pointer"
                          title="Print Receipt"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => handleOpenEmailModal(order)}
                          className="p-2 bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 rounded-xl transition-all cursor-pointer"
                          title="Email Receipt"
                        >
                          <Mail size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}

      {/* Invoice Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#071B14] border border-[#D4A373]/25 max-w-lg w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40">
              <div>
                <h3 className="text-xl font-bold font-serif text-[#D4A373]">Invoice Details</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedOrder.orderNumber}</p>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Meta information */}
              <div className="grid grid-cols-2 gap-4 text-xs bg-[#0A261C]/40 p-4 rounded-2xl border border-[#D4A373]/15">
                <div className="space-y-1">
                  <p className="text-gray-500 uppercase font-bold tracking-wider">Date</p>
                  <p className="font-semibold text-white">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 uppercase font-bold tracking-wider">Status</p>
                  <p className="font-bold text-[#D4A373] uppercase">{selectedOrder.status}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 uppercase font-bold tracking-wider">Table</p>
                  <p className="font-semibold text-white">{selectedOrder.table?.tableNumber || 'Takeaway'}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-gray-500 uppercase font-bold tracking-wider">Cashier</p>
                  <p className="font-semibold text-white">{selectedOrder.employee?.name || 'Staff'}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Items Summary</h4>
                <div className="max-h-[160px] overflow-y-auto space-y-1.5 pr-1">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm py-2 border-b border-[#D4A373]/10">
                      <div>
                        <p className="font-bold text-white">
                          {item.product?.productName || item.productName || 'Item'}
                        </p>
                        <p className="text-xs text-gray-400">
                          {item.quantity} x ₹{item.product?.price || item.productPrice || 0}
                        </p>
                      </div>
                      <span className="font-extrabold text-[#FAF8F1]">₹{item.totalPrice?.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Totals */}
              <div className="space-y-2 border-t border-[#D4A373]/15 pt-4 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span>
                  <span>₹{selectedOrder.subtotal?.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Tax (5%)</span>
                  <span>₹{selectedOrder.tax?.toFixed(2)}</span>
                </div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-rose-400 font-semibold">
                    <span>Discount</span>
                    <span>-₹{selectedOrder.discount?.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-extrabold text-base text-white border-t border-[#D4A373]/15 pt-3">
                  <span>Total Amount</span>
                  <span className="text-[#D4A373]">₹{selectedOrder.total?.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Receipt actions */}
            <div className="flex gap-3 px-6 py-4 border-t border-[#D4A373]/15 bg-[#0A261C]/20 justify-end">
              <button
                onClick={() => handlePrintReceipt(selectedOrder)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-[#071B14] bg-[#D4A373] hover:bg-[#FAF8F1] rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Printer size={14} /> Print
              </button>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  handleOpenEmailModal(selectedOrder);
                }}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-300 border border-gray-600 hover:bg-white/5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Mail size={14} /> Email
              </button>
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-5 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 hover:text-white bg-transparent border border-gray-700 rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {showEmailModal && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#071B14] border border-[#D4A373]/25 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40 text-[#D4A373]">
              <h3 className="text-lg font-bold font-serif">Email Receipt</h3>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {emailSuccess ? (
              <div className="space-y-4 text-center p-8">
                <Check className="mx-auto text-emerald-400" size={40} />
                <p className="text-emerald-400 font-bold text-sm">{emailSuccess}</p>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-6 py-2.5 text-xs font-bold uppercase bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSendEmail} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                    Customer Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. customer@example.com"
                    className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] rounded-xl py-3 px-4 focus:outline-none focus:border-[#D4A373] transition-all text-sm"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                  />
                </div>

                <div className="flex gap-2 justify-end pt-4 border-t border-[#D4A373]/10">
                  <button
                    type="button"
                    onClick={() => setShowEmailModal(false)}
                    className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer text-xs font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={emailLoading}
                    className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all disabled:opacity-50 cursor-pointer text-xs font-bold"
                  >
                    {emailLoading ? 'Sending...' : 'Send Receipt'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}