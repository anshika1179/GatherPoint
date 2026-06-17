import { useState, useEffect } from 'react';
import ApiService from '../services/apiService';
import { Plus, Edit2, Trash2, Search, User, Mail, Phone, Check, X, ShieldAlert } from 'lucide-react';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-[#0A261C]/50 backdrop-blur-xl border border-[#D4A373]/15 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
    {children}
  </div>
);

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form modals state
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const data = await ApiService.getCustomers();
      setCustomers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load customers directory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenModal = (customer = null) => {
    setSelectedCustomer(customer);
    setName(customer ? customer.name : '');
    setEmail(customer ? customer.email : '');
    setPhone(customer ? customer.phone : '');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleSaveCustomer = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setErrorMsg('');
      const customerData = { name, email, phone };
      if (selectedCustomer) {
        await ApiService.updateCustomer(selectedCustomer.id, customerData);
      } else {
        await ApiService.createCustomer(customerData);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save customer.');
    }
  };

  const handleDeleteCustomer = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      setErrorMsg('');
      await ApiService.deleteCustomer(id);
      fetchCustomers();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete customer.');
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FAF8F1] tracking-wide font-cinzel">
            Customers <span className="text-[#D4A373]">Directory</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-sans">
            Manage customer profiles and contacts for receipt email distribution.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#D4A373] text-[#071B14] px-5 py-3 rounded-xl font-bold hover:bg-[#FAF8F1] hover:text-[#071B14] active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(212,163,115,0.25)] cursor-pointer text-sm"
        >
          <Plus size={16} /> Add Customer
        </button>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 text-sm">
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Filter Bar */}
      <GlassCard className="flex items-center">
        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] placeholder-gray-500 transition-colors text-sm"
            placeholder="Search by Name, Email, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Grid List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A373]" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <GlassCard className="text-center py-16">
          <User className="w-12 h-12 text-[#D4A373]/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-300">No customers found</h3>
          <p className="text-gray-500 text-sm mt-1">Add a new customer profile to get started.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer) => (
            <div
              key={customer.id}
              className="p-5 bg-[#0A261C]/40 border border-[#D4A373]/15 hover:border-[#D4A373]/40 rounded-2xl shadow-lg flex flex-col justify-between hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2D6A4F]/20 flex items-center justify-center font-bold text-[#D4A373] border border-[#D4A373]/30">
                    {customer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#FAF8F1] text-base leading-tight">{customer.name}</h3>
                    <p className="text-[10px] text-gray-500 font-mono mt-0.5">ID: #{customer.id}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-gray-300">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-gray-500" />
                    <span>{customer.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-gray-500" />
                    <span>{customer.phone || 'No phone number'}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 mt-4 border-t border-[#D4A373]/10">
                <button
                  onClick={() => handleOpenModal(customer)}
                  className="px-3 py-2 bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#071B14] border border-[#D4A373]/25 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40 text-[#D4A373]">
              <h3 className="text-xl font-bold font-serif">
                {selectedCustomer ? 'Edit Customer' : 'Add Customer Profile'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] rounded-xl py-3 px-4 focus:outline-none focus:border-[#D4A373] transition-all text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. john@example.com"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] rounded-xl py-3 px-4 focus:outline-none focus:border-[#D4A373] transition-all text-sm"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. +91 98765 43210"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] rounded-xl py-3 px-4 focus:outline-none focus:border-[#D4A373] transition-all text-sm"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-[#D4A373]/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <Check size={14} /> Save Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}