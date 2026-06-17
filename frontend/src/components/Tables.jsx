import { useState, useEffect } from 'react';
import ApiService from '../services/apiService';
import { Plus, Edit2, Trash2, Home, Grid, Check, X, ShieldAlert, Users } from 'lucide-react';

const GlassCard = ({ children, className = '' }) => (
  <div className={`bg-[#0A261C]/50 backdrop-blur-xl border border-[#D4A373]/15 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] ${className}`}>
    {children}
  </div>
);

export default function Tables() {
  const [floors, setFloors] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Form states
  const [showFloorModal, setShowFloorModal] = useState(false);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [floorName, setFloorName] = useState('');

  const [showTableModal, setShowTableModal] = useState(false);
  const [selectedTable, setSelectedTable] = useState(null);
  const [tableNumber, setTableNumber] = useState('');
  const [tableSeats, setTableSeats] = useState(4);
  const [tableFloorId, setTableFloorId] = useState('');
  const [tableActive, setTableActive] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const [floorsData, tablesData] = await Promise.all([
        ApiService.getFloors(),
        ApiService.getTables(),
      ]);
      setFloors(Array.isArray(floorsData) ? floorsData : []);
      setTables(Array.isArray(tablesData) ? tablesData : []);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load floors and tables.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Floor handlers
  const handleOpenFloorModal = (floor = null) => {
    setSelectedFloor(floor);
    setFloorName(floor ? floor.name : '');
    setErrorMsg('');
    setShowFloorModal(true);
  };

  const handleSaveFloor = async (e) => {
    e.preventDefault();
    if (!floorName.trim()) return;
    try {
      setErrorMsg('');
      if (selectedFloor) {
        await ApiService.updateFloor(selectedFloor.id, { name: floorName });
      } else {
        await ApiService.createFloor({ name: floorName });
      }
      setShowFloorModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save floor.');
    }
  };

  const handleDeleteFloor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this floor? All tables on it will be unassigned.')) return;
    try {
      setErrorMsg('');
      await ApiService.deleteFloor(id);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete floor.');
    }
  };

  // Table handlers
  const handleOpenTableModal = (table = null) => {
    setSelectedTable(table);
    setTableNumber(table ? table.tableNumber : '');
    setTableSeats(table ? table.seats : 4);
    setTableFloorId(table && table.floor ? table.floor.id : (floors[0]?.id || ''));
    setTableActive(table ? table.active : true);
    setErrorMsg('');
    setShowTableModal(true);
  };

  const handleSaveTable = async (e) => {
    e.preventDefault();
    if (!tableNumber.trim() || !tableFloorId) return;
    try {
      setErrorMsg('');
      const tableData = {
        tableNumber,
        seats: parseInt(tableSeats),
        active: tableActive,
        floor: { id: parseInt(tableFloorId) }
      };

      if (selectedTable) {
        await ApiService.updateTable(selectedTable.id, tableData);
      } else {
        await ApiService.createTable(tableData);
      }
      setShowTableModal(false);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save table.');
    }
  };

  const handleDeleteTable = async (id) => {
    if (!window.confirm('Are you sure you want to delete this table?')) return;
    try {
      setErrorMsg('');
      await ApiService.deleteTable(id);
      fetchData();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to delete table.');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-[#FAF8F1] tracking-wide font-cinzel">
            Floors &amp; <span className="text-[#D4A373]">Tables</span>
          </h1>
          <p className="text-gray-400 text-sm mt-1.5 font-sans">
            Configure POS layouts, floor levels, and seating capacities.
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3 text-sm">
          <ShieldAlert size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#D4A373]" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Floors list (1/3 cols) */}
          <GlassCard className="space-y-4">
            <div className="flex justify-between items-center border-b border-[#D4A373]/15 pb-3">
              <h2 className="text-lg font-bold text-[#FAF8F1] flex items-center gap-2">
                <Home size={18} className="text-[#D4A373]" /> Floors
              </h2>
              <button
                onClick={() => handleOpenFloorModal()}
                className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#071B14] bg-[#D4A373] hover:bg-[#FAF8F1] px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer"
              >
                <Plus size={12} /> Add Floor
              </button>
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {floors.length === 0 ? (
                <p className="text-gray-500 text-xs text-center py-8">No floors configured yet.</p>
              ) : (
                floors.map((floor) => (
                  <div
                    key={floor.id}
                    className="flex justify-between items-center p-3 bg-[#0A261C]/40 border border-[#D4A373]/15 rounded-xl hover:border-[#D4A373]/35 transition-all duration-200"
                  >
                    <div>
                      <p className="font-bold text-white text-sm">{floor.name || 'Unnamed Floor'}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">ID: #{floor.id}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenFloorModal(floor)}
                        className="p-1.5 bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 rounded-lg transition-all cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteFloor(floor.id)}
                        className="p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>

          {/* Tables list (2/3 cols) */}
          <GlassCard className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center border-b border-[#D4A373]/15 pb-3">
              <h2 className="text-lg font-bold text-[#FAF8F1] flex items-center gap-2">
                <Grid size={18} className="text-[#D4A373]" /> Restaurant Tables
              </h2>
              <button
                disabled={floors.length === 0}
                onClick={() => handleOpenTableModal()}
                className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-[#071B14] bg-[#D4A373] hover:bg-[#FAF8F1] px-3 py-1.5 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Plus size={12} /> Add Table
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {tables.length === 0 ? (
                <div className="md:col-span-2 py-12 text-center">
                  <p className="text-gray-500 text-xs">No tables configured yet.</p>
                </div>
              ) : (
                tables.map((table) => (
                  <div
                    key={table.id}
                    className="p-4 bg-[#0A261C]/40 border border-[#D4A373]/15 rounded-2xl flex justify-between items-start hover:border-[#D4A373]/35 transition-all duration-200"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-[#D4A373] text-sm bg-[#2D6A4F]/20 px-2.5 py-1 rounded-xl border border-[#D4A373]/30">
                          {table.tableNumber}
                        </span>
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold rounded-md uppercase tracking-wider ${
                          table.active
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {table.active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 space-y-0.5">
                        <p className="flex items-center gap-1.5 font-medium text-gray-300">
                          <Users size={12} className="text-[#D4A373]" /> {table.seats} Seats
                        </p>
                        <p className="text-[10px]">
                          Floor: <span className="text-[#FAF8F1] font-semibold">{table.floor?.name || 'Unassigned'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleOpenTableModal(table)}
                        className="p-2 bg-[#2D6A4F]/20 text-gray-300 hover:text-[#D4A373] hover:bg-[#2D6A4F]/40 rounded-xl transition-all cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteTable(table.id)}
                        className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl transition-all cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </GlassCard>
        </div>
      )}

      {/* Floor Modal */}
      {showFloorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#071B14] border border-[#D4A373]/25 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40 text-[#D4A373]">
              <h3 className="text-xl font-bold font-serif">
                {selectedFloor ? 'Edit Floor' : 'Create New Floor'}
              </h3>
              <button
                onClick={() => setShowFloorModal(false)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveFloor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  Floor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ground Floor"
                  className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] rounded-xl py-3 px-4 focus:outline-none focus:border-[#D4A373] transition-all text-sm"
                  value={floorName}
                  onChange={(e) => setFloorName(e.target.value)}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-[#D4A373]/10">
                <button
                  type="button"
                  onClick={() => setShowFloorModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <Check size={14} /> Save Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#071B14] border border-[#D4A373]/25 max-w-md w-full rounded-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#D4A373]/15 flex justify-between items-center bg-[#0A261C]/40 text-[#D4A373]">
              <h3 className="text-xl font-bold font-serif">
                {selectedTable ? 'Edit Table' : 'Create New Table'}
              </h3>
              <button
                onClick={() => setShowTableModal(false)}
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveTable} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                    Table Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. T5"
                    className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] rounded-xl py-3 px-4 focus:outline-none focus:border-[#D4A373] transition-all text-sm"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                    Seats Count *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    required
                    className="w-full bg-[#071B14]/40 border border-[#D4A373]/15 text-[#FAF8F1] rounded-xl py-3 px-4 focus:outline-none focus:border-[#D4A373] transition-all text-sm"
                    value={tableSeats}
                    onChange={(e) => setTableSeats(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-2">
                  Select Floor *
                </label>
                <select
                  required
                  className="w-full bg-[#071B14] border border-[#D4A373]/15 text-[#FAF8F1] rounded-xl py-3 px-4 focus:outline-none focus:border-[#D4A373] transition-all text-sm cursor-pointer"
                  value={tableFloorId}
                  onChange={(e) => setTableFloorId(e.target.value)}
                >
                  {floors.length === 0 ? (
                    <option disabled>No floors available</option>
                  ) : (
                    floors.map((f) => (
                      <option key={f.id} value={f.id} className="bg-[#071B14]">
                        {f.name}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="tableActiveCheck"
                  className="w-5 h-5 accent-[#D4A373] bg-[#071B14] border border-[#D4A373]/15 rounded cursor-pointer"
                  checked={tableActive}
                  onChange={(e) => setTableActive(e.target.checked)}
                />
                <label htmlFor="tableActiveCheck" className="text-sm text-gray-300 font-bold select-none cursor-pointer">
                  Table is active and available
                </label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-[#D4A373]/10">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-600 text-gray-300 hover:bg-white/5 active:scale-95 transition-all cursor-pointer text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#D4A373] text-[#071B14] font-bold hover:bg-[#FAF8F1] active:scale-95 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                >
                  <Check size={14} /> Save Table
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}