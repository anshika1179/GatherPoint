import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Check, Users, Shield, ChefHat } from 'lucide-react';
import ApiService from '../../services/apiService';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-[#0A261C]/50 backdrop-blur-xl border border-[#D4A373]/15 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
    {children}
  </div>
);

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const [activeEmployee, setActiveEmployee] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Forms state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('EMPLOYEE');

  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch employees
  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ApiService.getEmployees();
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to fetch employees.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  // Open Create Dialog
  const handleCreateOpen = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormRole('EMPLOYEE');
    setFormError('');
    setIsCreateOpen(true);
  };

  // Open Edit Dialog
  const handleEditOpen = (emp) => {
    setActiveEmployee(emp);
    setFormName(emp.name);
    setFormEmail(emp.email);
    setFormRole(emp.role);
    setFormError('');
    setIsEditOpen(true);
  };

  // Open Password Dialog
  const handlePasswordOpen = (emp) => {
    setActiveEmployee(emp);
    setFormPassword('');
    setFormError('');
    setIsPasswordOpen(true);
  };

  // Open Delete Dialog
  const handleDeleteOpen = (id) => {
    setDeleteId(id);
    setIsDeleteOpen(true);
  };

  // Create Submit
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return setFormError('Name is required.');
    if (!formEmail.trim()) return setFormError('Email is required.');
    if (!formPassword || formPassword.length < 6) return setFormError('Password must be at least 6 characters.');

    setFormSubmitting(true);
    setFormError('');

    try {
      await ApiService.createEmployee({
        name: formName.trim(),
        email: formEmail.trim(),
        password: formPassword,
        role: formRole
      });
      setIsCreateOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to create employee.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Edit Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) return setFormError('Name is required.');
    if (!formEmail.trim()) return setFormError('Email is required.');

    setFormSubmitting(true);
    setFormError('');

    try {
      await ApiService.updateEmployee(activeEmployee.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole
      });
      setIsEditOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to update employee.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Change Password Submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!formPassword || formPassword.length < 6) return setFormError('Password must be at least 6 characters.');

    setFormSubmitting(true);
    setFormError('');

    try {
      await ApiService.changeEmployeePassword(activeEmployee.id, formPassword);
      setIsPasswordOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Failed to change password.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Toggle Active/Archive
  const handleToggleArchive = async (emp) => {
    try {
      await ApiService.archiveEmployee(emp.id);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to archive employee.');
    }
  };

  // Delete Confirm
  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await ApiService.deleteEmployee(deleteId);
      setIsDeleteOpen(false);
      fetchEmployees();
    } catch (err) {
      console.error(err);
      alert(err.message || 'Failed to delete employee.');
    }
  };

  // Stats computation
  const stats = {
    total: employees.length,
    admins: employees.filter(e => e.role === 'ADMIN').length,
    kitchen: employees.filter(e => e.role === 'KITCHEN_STAFF').length,
    staff: employees.filter(e => e.role === 'EMPLOYEE').length,
  };

  // Search Filter
  const filteredEmployees = employees.filter(e => 
    e.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleIcon = (role) => {
    switch(role) {
      case 'ADMIN': return <Shield size={16} className="text-[#D4A373]" />;
      case 'KITCHEN_STAFF': return <ChefHat size={16} className="text-[#6BCB77]" />;
      default: return <Users size={16} className="text-[#4D96FF]" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FAF8F1] tracking-wide font-cinzel">
            Employee <span className="text-[#D4A373]">Management</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-sans">
            Oversee staff credentials, passwords, active status, and assign permission roles.
          </p>
        </div>
        <button
          onClick={handleCreateOpen}
          className="flex items-center gap-2 bg-[#D4A373] text-[#071B14] px-5 py-3 rounded-xl font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all duration-200 shadow-[0_0_20px_rgba(212,163,115,0.25)] cursor-pointer"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassCard className="flex items-center gap-4 py-4 px-6">
          <div className="p-3 bg-[#D4A373]/10 border border-[#D4A373]/20 rounded-xl text-[#D4A373]">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xl font-extrabold">{stats.total}</div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Total Staff</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 py-4 px-6">
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            <Shield size={24} />
          </div>
          <div>
            <div className="text-xl font-extrabold">{stats.admins}</div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Admins</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 py-4 px-6">
          <div className="p-3 bg-[#6BCB77]/10 border border-[#6BCB77]/20 rounded-xl text-[#6BCB77]">
            <ChefHat size={24} />
          </div>
          <div>
            <div className="text-xl font-extrabold">{stats.kitchen}</div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">Kitchen Staff</div>
          </div>
        </GlassCard>
        <GlassCard className="flex items-center gap-4 py-4 px-6">
          <div className="p-3 bg-[#4D96FF]/10 border border-[#4D96FF]/20 rounded-xl text-[#4D96FF]">
            <Users size={24} />
          </div>
          <div>
            <div className="text-xl font-extrabold">{stats.staff}</div>
            <div className="text-gray-500 text-xs font-semibold uppercase tracking-wider">POS Staff</div>
          </div>
        </GlassCard>
      </div>

      {/* Search Bar */}
      <GlassCard className="flex items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search employees by name or email..."
            className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:border-[#D4A373] placeholder-gray-500 transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </GlassCard>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center font-medium">
          {error}
        </div>
      )}

      {/* Loading & Table */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A373]" />
        </div>
      ) : (
        <>
          {filteredEmployees.length === 0 ? (
            <GlassCard className="text-center py-16">
              <Users className="w-12 h-12 text-[#D4A373]/40 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-300">No employees found</h3>
              <p className="text-gray-500 text-sm mt-1 font-sans">Create or invite a new staff member.</p>
            </GlassCard>
          ) : (
            <GlassCard className="overflow-hidden !p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-[#D4A373]/15 bg-[#0A261C]/80 text-[#D4A373] text-xs font-bold uppercase tracking-widest">
                      <th className="px-6 py-4">Employee</th>
                      <th className="px-6 py-4">Role</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#D4A373]/10">
                    {filteredEmployees.map((emp) => (
                      <tr 
                        key={emp.id} 
                        className="hover:bg-[#2D6A4F]/10 transition-colors text-sm text-[#FAF8F1]"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-bold text-base">{emp.name}</div>
                            <div className="text-gray-400 text-xs mt-0.5">{emp.email}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="flex items-center gap-1.5 text-xs font-semibold">
                            {getRoleIcon(emp.role)}
                            {emp.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleArchive(emp)}
                            className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                              emp.active
                                ? 'bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20'
                            }`}
                            title={emp.active ? 'Click to Archive' : 'Click to Activate'}
                          >
                            {emp.active ? 'Active' : 'Archived'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditOpen(emp)}
                              className="px-3 py-2 rounded-lg bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                              title="Edit Details"
                            >
                              <Edit2 size={13} /> Edit
                            </button>
                            <button
                              onClick={() => handlePasswordOpen(emp)}
                              className="px-3 py-2 rounded-lg bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 transition-all text-xs font-bold cursor-pointer"
                              title="Reset Password"
                            >
                              Password
                            </button>
                            <button
                              onClick={() => handleDeleteOpen(emp.id)}
                              className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all cursor-pointer"
                              title="Delete Account"
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

      {/* ADD EMPLOYEE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#071B14] border border-[#D4A373]/25 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40">
              <h3 className="text-xl font-bold font-serif text-[#D4A373]">Add New Employee</h3>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-[#FAF8F1] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@gatherpoint.com"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">
                  System Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['EMPLOYEE', 'KITCHEN_STAFF', 'ADMIN'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormRole(role)}
                      className={`py-2 text-[10px] tracking-wider font-bold rounded-lg border transition-all cursor-pointer ${
                        formRole === role
                          ? 'bg-[#D4A373] border-[#D4A373] text-[#071B14]'
                          : 'bg-white/5 border-[#D4A373]/15 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {role.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#D4A373]/10">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Creating...' : 'Create Employee'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT EMPLOYEE DETAILS MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#071B14] border border-[#D4A373]/25 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40">
              <h3 className="text-xl font-bold font-serif text-[#D4A373]">Edit Employee Details</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="text-gray-400 hover:text-[#FAF8F1] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center text-xs font-semibold">
                  {formError}
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. john@gatherpoint.com"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-2">
                  System Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['EMPLOYEE', 'KITCHEN_STAFF', 'ADMIN'].map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setFormRole(role)}
                      className={`py-2 text-[10px] tracking-wider font-bold rounded-lg border transition-all cursor-pointer ${
                        formRole === role
                          ? 'bg-[#D4A373] border-[#D4A373] text-[#071B14]'
                          : 'bg-white/5 border-[#D4A373]/15 text-gray-400 hover:bg-white/10 hover:text-white'
                      }`}
                    >
                      {role.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#D4A373]/10">
                <button
                  type="button"
                  onClick={() => setIsEditOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PASSWORD RESET MODAL */}
      {isPasswordOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#071B14] border border-[#D4A373]/25 w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40">
              <h3 className="text-xl font-bold font-serif text-[#D4A373]">Reset Password</h3>
              <button
                onClick={() => setIsPasswordOpen(false)}
                className="text-gray-400 hover:text-[#FAF8F1] transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-center text-xs font-semibold">
                  {formError}
                </div>
              )}

              <p className="text-xs text-gray-400">
                Change password for <strong>{activeEmployee?.name}</strong> ({activeEmployee?.email})
              </p>

              <div>
                <label className="block text-xs uppercase tracking-widest font-bold text-gray-400 mb-1.5">
                  New Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] px-4 py-2.5 rounded-xl focus:outline-none focus:border-[#D4A373]"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-[#D4A373]/10">
                <button
                  type="button"
                  onClick={() => setIsPasswordOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {formSubmitting ? 'Updating...' : 'Update Password'}
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
            <h3 className="text-xl font-bold text-red-400 font-serif">Delete Employee Account?</h3>
            <p className="text-gray-300 text-sm font-sans">
              Are you sure you want to permanently delete this employee account? This user will lose all system access.
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

export default Employees;
