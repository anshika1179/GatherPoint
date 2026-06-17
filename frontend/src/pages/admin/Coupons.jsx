import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, X, Check, Tag, Percent, DollarSign,
  Calendar, ShieldAlert, Search, ToggleLeft, ToggleRight, Ticket
} from 'lucide-react';
import ApiService from '../../services/apiService';

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];

const emptyForm = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  expiryDate: '',
  maxUsage: '',
  active: true,
};

function CouponBadge({ type, value }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#D4A373] text-xs font-bold rounded-full">
      {type === 'PERCENTAGE' ? <Percent size={10} /> : <DollarSign size={10} />}
      {type === 'PERCENTAGE' ? `${value}% off` : `₹${value} off`}
    </span>
  );
}

const Coupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch {
      setErrorMsg('Failed to load coupons.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setErrorMsg('');
    setShowModal(true);
  };

  const openEdit = (coupon) => {
    setEditTarget(coupon);
    setForm({
      code: coupon.code || '',
      discountType: coupon.discountType || 'PERCENTAGE',
      discountValue: coupon.discountValue ?? '',
      minOrderAmount: coupon.minOrderAmount ?? '',
      expiryDate: coupon.expiryDate ? coupon.expiryDate.slice(0, 10) : '',
      maxUsage: coupon.maxUsage ?? '',
      active: coupon.active !== false,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon? This action cannot be undone.')) return;
    try {
      await ApiService.deleteCoupon(id);
      setSuccessMsg('Coupon deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchCoupons();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete coupon.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.code.trim() || !form.discountValue) {
      setErrorMsg('Code and discount value are required.');
      return;
    }
    try {
      setSaving(true);
      setErrorMsg('');
      const payload = {
        ...form,
        code: form.code.trim().toUpperCase(),
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : null,
        maxUsage: form.maxUsage ? parseInt(form.maxUsage) : null,
        expiryDate: form.expiryDate || null,
      };
      if (editTarget) {
        await ApiService.updateCoupon(editTarget.id, payload);
        setSuccessMsg('Coupon updated successfully!');
      } else {
        await ApiService.createCoupon(payload);
        setSuccessMsg('Coupon created successfully!');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowModal(false);
      fetchCoupons();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save coupon.');
    } finally {
      setSaving(false);
    }
  };

  const filteredCoupons = coupons.filter(c =>
    c.code?.toLowerCase().includes(search.toLowerCase())
  );

  const isExpired = (expiry) => expiry && new Date(expiry) < new Date();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#FAF8F1] font-serif">Coupon Management</h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage discount codes for customers.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#D4A373] text-[#071B14] px-4 py-2 rounded-xl font-bold hover:bg-[#E5B887] transition-colors cursor-pointer text-sm"
        >
          <Plus size={16} /> New Coupon
        </button>
      </div>

      {/* Messages */}
      {errorMsg && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 text-sm">
          <ShieldAlert size={16} />{errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center gap-3 text-sm">
          <Check size={16} />{successMsg}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search coupon code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#0A261C]/60 border border-[#2D6A4F]/30 rounded-xl py-2.5 pl-9 pr-4 text-sm text-[#FAF8F1] placeholder-gray-500 focus:outline-none focus:border-[#D4A373]/50 transition-all"
        />
      </div>

      {/* Coupons Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredCoupons.length === 0 ? (
        <div className="text-center py-20 bg-[#0A261C]/40 border border-[#2D6A4F]/20 rounded-[20px]">
          <Ticket size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 font-semibold">No coupons found</p>
          <p className="text-gray-600 text-sm mt-1">Click "New Coupon" to create your first discount code.</p>
        </div>
      ) : (
        <div className="bg-[#0A261C]/60 border border-[#D4A373]/20 rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D6A4F]/30 text-gray-400 text-[10px] uppercase tracking-wider">
                  <th className="text-left py-4 px-5">Code</th>
                  <th className="text-left py-4 px-4">Discount</th>
                  <th className="text-right py-4 px-4">Min Order</th>
                  <th className="text-left py-4 px-4">Expiry</th>
                  <th className="text-right py-4 px-4">Usage</th>
                  <th className="text-left py-4 px-4">Status</th>
                  <th className="text-center py-4 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D6A4F]/15">
                {filteredCoupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-mono font-bold text-[#D4A373] tracking-wider">{coupon.code}</span>
                    </td>
                    <td className="py-4 px-4">
                      <CouponBadge type={coupon.discountType} value={coupon.discountValue} />
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400 text-xs">
                      {coupon.minOrderAmount ? `₹${coupon.minOrderAmount}` : '—'}
                    </td>
                    <td className="py-4 px-4 text-xs">
                      {coupon.expiryDate ? (
                        <span className={isExpired(coupon.expiryDate) ? 'text-rose-400 font-semibold' : 'text-gray-300'}>
                          {new Date(coupon.expiryDate).toLocaleDateString('en-IN')}
                          {isExpired(coupon.expiryDate) && ' (Expired)'}
                        </span>
                      ) : (
                        <span className="text-gray-500">No expiry</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right text-gray-400 text-xs">
                      {coupon.usageCount ?? 0}{coupon.maxUsage ? `/${coupon.maxUsage}` : ''}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                        coupon.active !== false && !isExpired(coupon.expiryDate)
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                      }`}>
                        {coupon.active !== false && !isExpired(coupon.expiryDate) ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEdit(coupon)}
                          className="p-1.5 bg-[#0A261C] hover:bg-[#2D6A4F]/30 text-gray-400 hover:text-[#D4A373] border border-[#2D6A4F]/30 rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon.id)}
                          className="p-1.5 bg-[#0A261C] hover:bg-rose-950/40 text-gray-400 hover:text-rose-400 border border-[#2D6A4F]/30 rounded-lg transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#071B14] border border-[#D4A373]/30 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-[#2D6A4F]/30 pb-4">
              <h3 className="text-xl font-bold text-[#FAF8F1] flex items-center gap-2">
                <Tag size={18} className="text-[#D4A373]" />
                {editTarget ? 'Edit Coupon' : 'Create Coupon'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-[#2D6A4F]/20 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-sm flex items-center gap-2">
                <ShieldAlert size={14} />{errorMsg}
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              {/* Code */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SAVE20"
                  value={form.code}
                  onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] font-mono font-bold tracking-widest placeholder-gray-600 focus:outline-none focus:border-[#D4A373]/50 transition-all"
                />
              </div>

              {/* Discount Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Type *</label>
                  <select
                    value={form.discountType}
                    onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                    className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] focus:outline-none focus:border-[#D4A373]/50 transition-all cursor-pointer"
                  >
                    {DISCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                    Value ({form.discountType === 'PERCENTAGE' ? '%' : '₹'}) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={form.discountType === 'PERCENTAGE' ? 100 : undefined}
                    step="0.01"
                    placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 20' : 'e.g. 50'}
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] placeholder-gray-600 focus:outline-none focus:border-[#D4A373]/50 transition-all"
                  />
                </div>
              </div>

              {/* Min Order + Max Usage */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Min Order (₹)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="e.g. 200"
                    value={form.minOrderAmount}
                    onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                    className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] placeholder-gray-600 focus:outline-none focus:border-[#D4A373]/50 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Max Usage</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={form.maxUsage}
                    onChange={e => setForm(f => ({ ...f, maxUsage: e.target.value }))}
                    className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] placeholder-gray-600 focus:outline-none focus:border-[#D4A373]/50 transition-all"
                  />
                </div>
              </div>

              {/* Expiry Date */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  <Calendar size={11} className="inline mr-1" />Expiry Date
                </label>
                <input
                  type="date"
                  value={form.expiryDate}
                  onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                  className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] focus:outline-none focus:border-[#D4A373]/50 transition-all cursor-pointer"
                />
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  className="cursor-pointer"
                >
                  {form.active
                    ? <ToggleRight size={28} className="text-emerald-400" />
                    : <ToggleLeft size={28} className="text-gray-500" />
                  }
                </button>
                <span className="text-sm text-gray-300 font-semibold">
                  {form.active ? 'Active — Coupon is available for use' : 'Inactive — Coupon is disabled'}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2 border-t border-[#2D6A4F]/30">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 text-sm font-bold text-gray-400 hover:text-white bg-transparent hover:bg-[#2D6A4F]/20 border border-[#2D6A4F]/30 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-2.5 text-sm font-bold text-[#071B14] bg-[#D4A373] hover:bg-[#E5B887] rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? <div className="w-4 h-4 border-2 border-[#071B14] border-t-transparent rounded-full animate-spin" /> : <><Check size={15} />{editTarget ? 'Update Coupon' : 'Create Coupon'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Coupons;
