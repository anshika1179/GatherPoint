import { useState, useEffect } from 'react';
import {
  Plus, Edit2, Trash2, X, Check, Tag, Percent,
  Calendar, ShieldAlert, Search, ToggleLeft, ToggleRight, Sparkles
} from 'lucide-react';
import ApiService from '../../services/apiService';

const DISCOUNT_TYPES = ['PERCENTAGE', 'FIXED_AMOUNT'];
const PROMOTION_SCOPES = ['PRODUCT_LEVEL', 'ORDER_LEVEL'];

const emptyForm = {
  name: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  scope: 'PRODUCT_LEVEL',
  minQuantity: '1',
  minOrderAmount: '0',
  productId: '',
  active: true,
};

function PromotionBadge({ type, value }) {
  return (
    <span className="flex items-center gap-1 px-2 py-0.5 bg-[#D4A373]/10 border border-[#D4A373]/30 text-[#D4A373] text-xs font-bold rounded-full w-max">
      {type === 'PERCENTAGE' ? <Percent size={10} /> : <span className="text-[10px] font-bold">₹</span>}
      {type === 'PERCENTAGE' ? `${value}% off` : `₹${value} off`}
    </span>
  );
}

const Promotions = () => {
  const [promotions, setPromotions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [promosData, prodsData] = await Promise.all([
        ApiService.getPromotions(),
        ApiService.getProducts().catch(() => [])
      ]);
      setPromotions(Array.isArray(promosData) ? promosData : []);
      setProducts(Array.isArray(prodsData) ? prodsData : []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load promotions or products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const openCreate = () => {
    setEditTarget(null);
    setForm({
      ...emptyForm,
      productId: products[0]?.id || ''
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const openEdit = (promo) => {
    setEditTarget(promo);
    setForm({
      name: promo.name || '',
      discountType: promo.discountType || 'PERCENTAGE',
      discountValue: promo.discountValue ?? '',
      scope: promo.scope || 'PRODUCT_LEVEL',
      minQuantity: promo.minQuantity ?? '1',
      minOrderAmount: promo.minOrderAmount ?? '0',
      productId: promo.product?.id || products[0]?.id || '',
      active: promo.active !== false,
    });
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this automated promotion? This action cannot be undone.')) return;
    try {
      await ApiService.deletePromotion(id);
      setSuccessMsg('Promotion deleted.');
      setTimeout(() => setSuccessMsg(''), 3000);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete promotion.');
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.discountValue) {
      setErrorMsg('Name and discount value are required.');
      return;
    }
    if (form.scope === 'PRODUCT_LEVEL' && !form.productId) {
      setErrorMsg('Product selection is required for product-level promotion.');
      return;
    }

    try {
      setSaving(true);
      setErrorMsg('');

      const payload = {
        name: form.name.trim(),
        discountType: form.discountType,
        discountValue: parseFloat(form.discountValue),
        scope: form.scope,
        minQuantity: form.scope === 'PRODUCT_LEVEL' ? parseInt(form.minQuantity) : null,
        minOrderAmount: form.scope === 'ORDER_LEVEL' ? parseFloat(form.minOrderAmount) : null,
        product: form.scope === 'PRODUCT_LEVEL' ? { id: parseInt(form.productId) } : null,
        active: form.active,
      };

      if (editTarget) {
        await ApiService.updatePromotion(editTarget.id, payload);
        setSuccessMsg('Promotion updated successfully!');
      } else {
        await ApiService.createPromotion(payload);
        setSuccessMsg('Promotion created successfully!');
      }
      setTimeout(() => setSuccessMsg(''), 3000);
      setShowModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save promotion.');
    } finally {
      setSaving(false);
    }
  };

  const filteredPromotions = promotions.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[#FAF8F1] font-serif">Automated Promotions</h1>
          <p className="text-gray-400 text-sm mt-1">Configure automated order-level and product-level discount campaigns.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-[#D4A373] text-[#071B14] px-4 py-2 rounded-xl font-bold hover:bg-[#E5B887] transition-colors cursor-pointer text-sm"
        >
          <Plus size={16} /> New Promotion
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
          placeholder="Search promotions..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-[#0A261C]/60 border border-[#2D6A4F]/30 rounded-xl py-2.5 pl-9 pr-4 text-sm text-[#FAF8F1] placeholder-gray-500 focus:outline-none focus:border-[#D4A373]/50 transition-all"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#D4A373] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filteredPromotions.length === 0 ? (
        <div className="text-center py-20 bg-[#0A261C]/40 border border-[#2D6A4F]/20 rounded-[20px]">
          <Sparkles size={40} className="mx-auto text-gray-600 mb-3" />
          <p className="text-gray-400 font-semibold">No promotions configured</p>
          <p className="text-gray-600 text-sm mt-1">Click "New Promotion" to configure automated discounts.</p>
        </div>
      ) : (
        <div className="bg-[#0A261C]/60 border border-[#D4A373]/20 rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2D6A4F]/30 text-gray-400 text-[10px] uppercase tracking-wider">
                  <th className="text-left py-4 px-5">Name</th>
                  <th className="text-left py-4 px-4">Scope</th>
                  <th className="text-left py-4 px-4">Target Condition</th>
                  <th className="text-left py-4 px-4">Discount</th>
                  <th className="text-left py-4 px-4">Status</th>
                  <th className="text-center py-4 px-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D6A4F]/15">
                {filteredPromotions.map(promo => (
                  <tr key={promo.id} className="hover:bg-white/5 transition-colors">
                    <td className="py-4 px-5">
                      <span className="font-semibold text-white">{promo.name}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-mono text-gray-300">
                      {promo.scope}
                    </td>
                    <td className="py-4 px-4 text-xs text-gray-400">
                      {promo.scope === 'PRODUCT_LEVEL' ? (
                        <>
                          Min Qty: <span className="text-emerald-400 font-bold">{promo.minQuantity}</span> of{' '}
                          <span className="text-[#D4A373]">{promo.product?.productName || 'Unknown Product'}</span>
                        </>
                      ) : (
                        <>
                          Min Order: <span className="text-emerald-400 font-bold">₹{promo.minOrderAmount}</span>
                        </>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <PromotionBadge type={promo.discountType} value={promo.discountValue} />
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${
                        promo.active !== false
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-gray-700/50 text-gray-500 border border-gray-600/30'
                      }`}>
                        {promo.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => openEdit(promo)}
                          className="p-1.5 bg-[#0A261C] hover:bg-[#2D6A4F]/30 text-gray-400 hover:text-[#D4A373] border border-[#2D6A4F]/30 rounded-lg transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id)}
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
              <h3 className="text-xl font-bold text-[#FAF8F1] flex items-center gap-2 font-serif">
                <Sparkles size={18} className="text-[#D4A373]" />
                {editTarget ? 'Edit Promotion' : 'Create Promotion'}
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
              {/* Name */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Campaign Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cappuccino Special"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] placeholder-gray-600 focus:outline-none focus:border-[#D4A373]/50 transition-all"
                />
              </div>

              {/* Scope */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Scope *</label>
                  <select
                    value={form.scope}
                    onChange={e => setForm(f => ({ ...f, scope: e.target.value }))}
                    className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] focus:outline-none focus:border-[#D4A373]/50 transition-all cursor-pointer"
                  >
                    {PROMOTION_SCOPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  {form.scope === 'PRODUCT_LEVEL' ? (
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Product *</label>
                      <select
                        value={form.productId}
                        onChange={e => setForm(f => ({ ...f, productId: e.target.value }))}
                        className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] focus:outline-none focus:border-[#D4A373]/50 transition-all cursor-pointer"
                      >
                        {products.map(p => <option key={p.id} value={p.id}>{p.productName}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Min Order (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={form.minOrderAmount}
                        onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                        className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] focus:outline-none focus:border-[#D4A373]/50 transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Min Qty (Product Level Only) */}
              {form.scope === 'PRODUCT_LEVEL' && (
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Minimum Quantity *</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={form.minQuantity}
                    onChange={e => setForm(f => ({ ...f, minQuantity: e.target.value }))}
                    className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] focus:outline-none focus:border-[#D4A373]/50 transition-all"
                  />
                </div>
              )}

              {/* Discount Type + Value */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">Discount Type *</label>
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
                    placeholder={form.discountType === 'PERCENTAGE' ? 'e.g. 15' : 'e.g. 100'}
                    value={form.discountValue}
                    onChange={e => setForm(f => ({ ...f, discountValue: e.target.value }))}
                    className="w-full bg-[#0A261C]/80 border border-[#2D6A4F]/40 rounded-xl py-3 px-4 text-[#FAF8F1] focus:outline-none focus:border-[#D4A373]/50 transition-all"
                  />
                </div>
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
                  {form.active ? 'Active — Promotion is currently running' : 'Inactive — Promotion is disabled'}
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
                  {saving ? <div className="w-4 h-4 border-2 border-[#071B14] border-t-transparent rounded-full animate-spin" /> : <><Check size={15} />{editTarget ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Promotions;
