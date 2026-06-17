import { useState, useEffect } from 'react';
import { CreditCard, Plus, Edit2, Trash2, X, Check, ShieldAlert, ToggleLeft, ToggleRight, Smartphone, Banknote } from 'lucide-react';
import ApiService from '../../services/apiService';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-[#0A261C]/50 backdrop-blur-xl border border-[#D4A373]/15 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
    {children}
  </div>
);

const PaymentMethods = () => {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMethod, setActiveMethod] = useState(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formEnabled, setFormEnabled] = useState(true);
  const [formUpiId, setFormUpiId] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const fetchMethods = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getPaymentMethods();
      setMethods(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch payment methods.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMethods();
  }, []);

  const handleToggleEnable = async (method) => {
    try {
      await ApiService.togglePaymentMethod(method.id);
      fetchMethods();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to toggle status');
    }
  };

  const handleCreateOpen = () => {
    setActiveMethod(null);
    setFormName('');
    setFormEnabled(true);
    setFormUpiId('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleEditOpen = (method) => {
    setActiveMethod(method);
    setFormName(method.name);
    setFormEnabled(method.enabled);
    setFormUpiId(method.upiId || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this payment method?')) return;
    try {
      await ApiService.deletePaymentMethod(id);
      fetchMethods();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete payment method.');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return setFormError('Name is required.');
    
    // UPI QR validation
    if (formName.toUpperCase() === 'UPI' && !formUpiId.trim()) {
      return setFormError('UPI ID (e.g. cafe@ybl) is required for UPI payments to generate QR code.');
    }

    setFormSubmitting(true);
    setFormError('');

    const payload = {
      name: formName.trim(),
      enabled: formEnabled,
      upiId: formName.toUpperCase() === 'UPI' ? formUpiId.trim() : null
    };

    try {
      if (activeMethod) {
        await ApiService.updatePaymentMethod(activeMethod.id, payload);
      } else {
        await ApiService.createPaymentMethod(payload);
      }
      setIsModalOpen(false);
      fetchMethods();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to save payment method.');
    } finally {
      setFormSubmitting(false);
    }
  };

  const getMethodIcon = (name) => {
    const n = name.toUpperCase();
    if (n === 'CASH') return <Banknote size={20} className="text-emerald-400" />;
    if (n === 'UPI') return <Smartphone size={20} className="text-purple-400" />;
    return <CreditCard size={20} className="text-blue-400" />;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FAF8F1] tracking-wide font-cinzel">
            Payment <span className="text-[#D4A373]">Methods</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-sans">
            Configure available payment gateways for POS terminal operations.
          </p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 bg-[#D4A373] text-[#071B14] px-5 py-3 rounded-xl font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(212,163,115,0.25)] cursor-pointer text-sm"
        >
          <Plus size={16} /> Add Method
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A373]" />
        </div>
      ) : methods.length === 0 ? (
        <GlassCard className="text-center py-16">
          <CreditCard className="w-12 h-12 text-[#D4A373]/40 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-gray-300">No payment methods configured</h3>
          <p className="text-gray-500 text-sm mt-1">Add a new payment method to get started.</p>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map((method) => (
            <GlassCard
              key={method.id}
              className="flex flex-col justify-between border border-[#D4A373]/15 hover:border-[#D4A373]/35 transition-all duration-300 gap-4"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#D4A373]/10 border border-[#D4A373]/20 rounded-xl">
                      {getMethodIcon(method.name)}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#FAF8F1] leading-tight">{method.name}</h3>
                      {method.upiId && (
                        <p className="text-xs text-gray-400 font-mono mt-1">UPI ID: {method.upiId}</p>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleEnable(method)}
                    className="cursor-pointer"
                  >
                    {method.enabled ? (
                      <ToggleRight size={28} className="text-emerald-400" />
                    ) : (
                      <ToggleLeft size={28} className="text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-[#D4A373]/10">
                <button
                  onClick={() => handleEditOpen(method)}
                  className="px-3 py-2 bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Edit2 size={13} /> Edit
                </button>
                <button
                  onClick={() => handleDelete(method.id)}
                  className="px-3 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 size={13} /> Delete
                </button>
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#071B14] border border-[#D4A373]/25 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40">
              <h3 className="text-xl font-bold font-serif text-[#D4A373]">
                {activeMethod ? 'Edit Payment Method' : 'Add Payment Method'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#FAF8F1] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Method Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cash, Card, UPI"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {formName.toUpperCase() === 'UPI' && (
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                    UPI ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. cafe@ybl"
                    className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                    value={formUpiId}
                    onChange={(e) => setFormUpiId(e.target.value)}
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setFormEnabled(!formEnabled)}
                  className="cursor-pointer"
                >
                  {formEnabled ? (
                    <ToggleRight size={28} className="text-emerald-400" />
                  ) : (
                    <ToggleLeft size={28} className="text-gray-500" />
                  )}
                </button>
                <span className="text-sm text-gray-300 font-semibold">
                  {formEnabled ? 'Enabled — Gateway is active at checkout' : 'Disabled — Gateway is inactive'}
                </span>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-[#D4A373]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all disabled:opacity-50 cursor-pointer text-xs font-bold"
                >
                  {formSubmitting ? 'Saving...' : 'Save Method'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
