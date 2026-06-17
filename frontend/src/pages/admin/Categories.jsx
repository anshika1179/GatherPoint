import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, ListTree } from 'lucide-react';
import ApiService from '../../services/apiService';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-[#0A261C]/50 backdrop-blur-xl border border-[#D4A373]/15 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
    {children}
  </div>
);

const PRESET_COLORS = [
  '#D4A373', '#FF6B6B', '#4D96FF', '#6BCB77', 
  '#FFD93D', '#E28743', '#8A5CF5', '#EC4899'
];

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formColor, setFormColor] = useState(PRESET_COLORS[0]);
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getCategories();
      setCategories(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch categories.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Open for Create
  const handleCreateOpen = () => {
    setActiveCategory(null);
    setFormName('');
    setFormColor(PRESET_COLORS[0]);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open for Edit
  const handleEditOpen = (category) => {
    setActiveCategory(category);
    setFormName(category.name);
    setFormColor(category.color || PRESET_COLORS[0]);
    setFormError('');
    setIsModalOpen(true);
  };

  // Open for Delete
  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  // Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return setFormError('Category name is required.');

    setFormSubmitting(true);
    setFormError('');

    const payload = {
      name: formName.trim(),
      color: formColor
    };

    try {
      if (activeCategory) {
        await ApiService.updateCategory(activeCategory.id, payload);
      } else {
        await ApiService.createCategory(payload);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to save category.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await ApiService.deleteCategory(deleteId);
      setIsDeleteOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete category.');
    }
  };

  // Filter categories
  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FAF8F1] tracking-wide font-cinzel">
            Category <span className="text-[#D4A373]">Management</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-sans">
            Group your menu products into categories for easy POS and customer access.
          </p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 bg-[#D4A373] text-[#071B14] px-5 py-3 rounded-xl font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(212,163,115,0.25)] cursor-pointer"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Search Bar */}
      <GlassCard className="flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories..."
            className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] placeholder-gray-500 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {/* Loading & Grid */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A373]" />
        </div>
      ) : (
        <>
          {filteredCategories.length === 0 ? (
            <GlassCard className="text-center py-16">
              <ListTree className="w-12 h-12 text-[#D4A373]/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-300">No categories found</h3>
              <p className="text-gray-500 text-sm mt-1 font-sans">Create a category to get started.</p>
            </GlassCard>
          ) : (
            <GlassCard className="overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D4A373]/15 bg-[#0A261C]/80 text-[#D4A373] text-xs font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">ID</th>
                      <th className="px-6 py-4">Category Name</th>
                      <th className="px-6 py-4">Badge Preview</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4A373]/10">
                    {filteredCategories.map((cat) => (
                      <tr 
                        key={cat.id} 
                        className="hover:bg-[#2D6A4F]/10 transition-colors text-sm text-[#FAF8F1]"
                      >
                        <td className="px-6 py-4 font-mono text-[#D4A373]/70">{cat.id}</td>
                        <td className="px-6 py-4 font-bold">{cat.name}</td>
                        <td className="px-6 py-4">
                          <span 
                            className="px-3 py-1.5 rounded-xl text-xs font-bold border"
                            style={{ 
                              backgroundColor: `${cat.color || '#D4A373'}15`, 
                              borderColor: cat.color || '#D4A373', 
                              color: cat.color || '#D4A373' 
                            }}
                          >
                            {cat.name}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditOpen(cat)}
                              className="p-2 rounded-lg bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 transition-all cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => handleDeleteOpen(cat.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                              title="Delete Category"
                            >
                              <Trash2 size={15} />
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
        </>
      )}

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#071B14] border border-[#D4A373]/25 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40">
              <h3 className="text-xl font-bold font-serif text-[#D4A373]">
                {activeCategory ? 'Edit Category' : 'Create Category'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-[#FAF8F1] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center text-xs font-semibold">
                  {formError}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Beverages, Desserts"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              {/* Color Preset Picker */}
              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">
                  Badge Color Accent
                </label>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormColor(color)}
                      className={`h-10 rounded-xl border-2 flex items-center justify-center transition-all duration-200 cursor-pointer`}
                      style={{ 
                        backgroundColor: color, 
                        borderColor: formColor === color ? '#FAF8F1' : 'transparent',
                        boxShadow: formColor === color ? `0 0 12px ${color}` : 'none'
                      }}
                    >
                      {formColor === color && <Check size={18} className="text-black font-extrabold" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
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
                  {formSubmitting ? 'Saving...' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {isDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#071B14] border border-red-500/30 w-full max-w-sm rounded-2xl p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-red-400 font-serif">Delete Category?</h3>
            <p className="text-gray-300 text-sm font-sans">
              Are you sure you want to delete this category? Any products in this category will lose their group tags.
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

export default Categories;
