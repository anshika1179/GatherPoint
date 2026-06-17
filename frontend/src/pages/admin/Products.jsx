import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Coffee, Tag } from 'lucide-react';
import ApiService from '../../services/apiService';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-[#0A261C]/50 backdrop-blur-xl border border-[#D4A373]/15 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
    {children}
  </div>
);

const Products = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null); // null for create, object for edit
  const [deleteId, setDeleteId] = useState(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formUom, setFormUom] = useState('pcs');
  const [formTax, setFormTax] = useState('5');
  const [formAvailable, setFormAvailable] = useState(true);

  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch products and categories
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodData, catData] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getCategories()
      ]);
      setProducts(prodData);
      setCategories(catData);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message || 'Failed to load products and categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Open modal for Create
  const handleCreateOpen = () => {
    setActiveProduct(null);
    setFormName('');
    setFormPrice('');
    setFormCategoryId(categories[0]?.id || '');
    setFormDescription('');
    setFormImageUrl('');
    setFormUom('pcs');
    setFormTax('5');
    setFormAvailable(true);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleEditOpen = (product) => {
    setActiveProduct(product);
    setFormName(product.productName);
    setFormPrice(product.price.toString());
    setFormCategoryId(product.category?.id || categories[0]?.id || '');
    setFormDescription(product.description || '');
    setFormImageUrl(product.imageUrl || '');
    setFormUom(product.uom || 'pcs');
    setFormTax(product.tax ? product.tax.toString() : '5');
    setFormAvailable(product.available);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open delete confirmation
  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  // Handle Create or Update submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return setFormError('Product Name is required.');
    if (!formPrice || parseFloat(formPrice) <= 0) return setFormError('Price must be greater than 0.');

    setFormSubmitting(true);
    setFormError('');

    const payload = {
      productName: formName,
      price: parseFloat(formPrice),
      uom: formUom,
      tax: parseFloat(formTax),
      description: formDescription,
      imageUrl: formImageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop',
      available: formAvailable,
      category: formCategoryId ? { id: parseInt(formCategoryId) } : null
    };

    try {
      if (activeProduct) {
        await ApiService.updateProduct(activeProduct.id, payload);
      } else {
        await ApiService.createProduct(payload);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to save product.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Delete confirm
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await ApiService.deleteProduct(deleteId);
      setIsDeleteOpen(false);
      fetchData();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete product.');
    }
  };

  // Filtered products list
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || (p.category && p.category.id.toString() === selectedCategory);
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FAF8F1] tracking-wide font-cinzel">
            Product <span className="text-[#D4A373]">Management</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-sans">
            Add, update, or remove menu items and configure pricing.
          </p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 bg-[#D4A373] text-[#071B14] px-5 py-3 rounded-xl font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(212,163,115,0.25)] cursor-pointer"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Toolbar / Filters */}
      <GlassCard className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] placeholder-gray-500 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <span className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Category:</span>
          <select
            className="bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] cursor-pointer"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all" className="bg-[#0A261C]">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id.toString()} className="bg-[#0A261C]">
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </GlassCard>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A373]" />
        </div>
      ) : (
        <>
          {filteredProducts.length === 0 ? (
            <GlassCard className="text-center py-16">
              <Coffee className="w-12 h-12 text-[#D4A373]/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-300">No products found</h3>
              <p className="text-gray-500 text-sm mt-1">Try modifying your search or filters.</p>
            </GlassCard>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((p) => (
                <div
                  key={p.id}
                  className="bg-[#0A261C]/40 border border-[#D4A373]/15 rounded-2xl overflow-hidden flex flex-col group hover:border-[#D4A373]/40 hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Image Header */}
                  <div className="h-44 relative bg-gray-900/40 overflow-hidden">
                    <img
                      src={p.imageUrl || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop'}
                      alt={p.productName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop';
                      }}
                    />
                    {/* Status tag */}
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-extrabold rounded-full ${
                        p.available 
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20' 
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                        {p.available ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>

                    {/* Category tag */}
                    {p.category && (
                      <div className="absolute bottom-3 left-3">
                        <span
                          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold border"
                          style={{
                            backgroundColor: p.category.color ? `${p.category.color}15` : 'rgba(212,163,115,0.1)',
                            borderColor: p.category.color || '#D4A373',
                            color: p.category.color || '#D4A373'
                          }}
                        >
                          <Tag size={12} /> {p.category.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-[#FAF8F1] line-clamp-1">{p.productName}</h3>
                      <p className="text-gray-400 text-xs mt-2 line-clamp-2 min-h-[2rem]">
                        {p.description || 'No description provided.'}
                      </p>
                    </div>

                    {/* Price and Action Section */}
                    <div className="mt-4 pt-4 border-t border-[#D4A373]/10 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Price</div>
                        <div className="text-[#D4A373] text-lg font-extrabold">
                          ₹{p.price.toFixed(2)}
                          <span className="text-gray-500 text-xs font-medium ml-1">/{p.uom || 'pcs'}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditOpen(p)}
                          className="p-2 rounded-lg bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteOpen(p.id)}
                          className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#071B14] border border-[#D4A373]/25 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40">
              <h3 className="text-xl font-bold font-serif text-[#D4A373]">
                {activeProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#FAF8F1] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[75vh]">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Classic Cappuccino"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {/* Price & UOM */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                    Price ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 4.99"
                    className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                    Unit of Measure
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. pcs, ml, serving"
                    className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                    value={formUom}
                    onChange={(e) => setFormUom(e.target.value)}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Category *
                </label>
                <select
                  required
                  className="w-full bg-[#071B14] border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373] cursor-pointer"
                  value={formCategoryId}
                  onChange={(e) => setFormCategoryId(e.target.value)}
                >
                  <option value="" disabled>Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Description
                </label>
                <textarea
                  placeholder="Describe the product components, allergy notes..."
                  rows="3"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373] resize-none"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Tax & Availability */}
              <div className="grid grid-cols-2 gap-4 items-center pt-2">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                    Tax Rate (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 5"
                    className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                    value={formTax}
                    onChange={(e) => setFormTax(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-3 pt-6 pl-2">
                  <input
                    type="checkbox"
                    id="formAvailable"
                    className="w-5 h-5 accent-[#D4A373] bg-[#071B14] border border-[#D4A373]/15 rounded cursor-pointer"
                    checked={formAvailable}
                    onChange={(e) => setFormAvailable(e.target.checked)}
                  />
                  <label htmlFor="formAvailable" className="text-sm text-gray-300 font-bold cursor-pointer">
                    Available in POS
                  </label>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex gap-3 justify-end pt-4 border-t border-[#D4A373]/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#071B14] border border-red-500/30 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-red-400 font-serif">Delete Product?</h3>
            <p className="text-gray-300 text-sm">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsDeleteOpen(false)}
                className="px-4 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
