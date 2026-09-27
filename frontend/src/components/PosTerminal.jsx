import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Plus, Minus, Trash2, CreditCard, Banknote, Smartphone,
  Search, Users, Clock, TrendingUp, CheckCircle, WifiOff, Wifi, RefreshCw, AlertCircle,
} from 'lucide-react';
import useAuth from '../hooks/useAuth';
import ApiService from '../services/apiService';
import PageHeader, { StatCard, FilterButton, PrimaryButton } from './PageHeader';
import {
  demoProducts, demoCategories, demoTables, demoPosStats, demoSession,
} from '../data/demoData';
import {
  isOnline, getPendingCount, getPendingOfflineOrders, saveOfflineOrder, buildOrderPayload,
  toSyncPayload, clearSyncedOrders,
} from '../services/offlineOrderService';

const TAX_RATE = 0.05;
const CATEGORY_ICONS = { Beverages: '☕', Starters: '🥗', Mains: '🍝', Desserts: '🍰', Specials: '⭐' };

export default function PosTerminal() {
  const { user } = useAuth();
  const canSellOffline = user?.allowOfflineSelling !== false;

  const [activeCategory, setActiveCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);
  const [customerName, setCustomerName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrderTotal, setLastOrderTotal] = useState(0);
  const [statusMsg, setStatusMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [products, setProducts] = useState(demoProducts);
  const [categories, setCategories] = useState(demoCategories);
  const [tables, setTables] = useState(demoTables);
  const [activeSession, setActiveSession] = useState(null);
  const [usingDemo, setUsingDemo] = useState(true);
  const [online, setOnline] = useState(isOnline());
  const [pendingOffline, setPendingOffline] = useState(getPendingCount());
  const [todayStats] = useState(demoPosStats);

  const loadCatalog = useCallback(async () => {
    try {
      const [prodData, catData, tableData, sessionData] = await Promise.all([
        ApiService.getProducts(),
        ApiService.getCategories(),
        ApiService.getTables(),
        ApiService.getActiveSession(),
      ]);
      if (Array.isArray(prodData) && prodData.length) {
        setProducts(prodData.map((p) => ({
          id: p.id,
          productName: p.productName,
          price: Number(p.price),
          categoryId: p.category?.id || p.categoryId,
          image: CATEGORY_ICONS[p.category?.name] || '🍽️',
          available: p.available !== false,
        })));
        setUsingDemo(false);
      }
      if (Array.isArray(catData) && catData.length) {
        setCategories(catData.map((c) => ({ id: c.id, name: c.name, icon: CATEGORY_ICONS[c.name] || '🍽️' })));
      }
      if (Array.isArray(tableData) && tableData.length) {
        setTables(tableData.map((t) => ({
          id: t.id,
          tableNumber: t.tableNumber,
          seats: t.seats,
          status: t.active ? 'available' : 'occupied',
          floor: t.floor?.name || 'Floor',
        })));
      }
      if (sessionData?.id) setActiveSession(sessionData);
    } catch {
      setUsingDemo(true);
    }
  }, []);

  useEffect(() => { loadCatalog(); }, [loadCatalog]);

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const filteredProducts = products.filter((p) => {
    const matchCat = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchSearch = p.productName?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.available;
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) return prev.map((i) => (i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * TAX_RATE;
  const total = subtotal + tax;

  const resetCart = () => {
    setCart([]);
    setSelectedTable(null);
    setCustomerName('');
    setPaymentMethod(null);
  };

  const processPayment = async (orderId) => {
    if (paymentMethod === 'CASH') await ApiService.payCash(orderId, total, total, 0);
    else if (paymentMethod === 'CARD') await ApiService.payCard(orderId, total, `CARD-${Date.now()}`);
    else if (paymentMethod === 'UPI') await ApiService.payUpi(orderId, total, `UPI-${Date.now()}`);
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0 || !paymentMethod) return;

    if (!online && !canSellOffline) {
      setStatusMsg('Offline selling is disabled for your account. Connect to the internet or contact admin.');
      return;
    }

    setIsSubmitting(true);
    setStatusMsg('');

    const orderPayload = {
      subtotal, tax, discount: 0, total,
      status: 'DRAFT',
      offline: !online,
      table: selectedTable ? { id: selectedTable } : null,
      items: cart.map((item) => ({
        quantity: item.qty,
        unitPrice: item.price,
        totalPrice: item.price * item.qty,
        product: { id: item.id },
      })),
    };

    try {
      if (online && !usingDemo) {
        const created = await ApiService.createOrder(orderPayload);
        await processPayment(created.id);
        setStatusMsg(`Order ${created.orderNumber} placed and paid online.`);
      } else if (canSellOffline) {
        const offlinePayload = buildOrderPayload({
          cart, subtotal, tax, total,
          tableId: selectedTable,
          customerName,
          paymentMethod,
          employeeId: user?.id,
        });
        saveOfflineOrder(offlinePayload);
        setPendingOffline(getPendingCount());
        setStatusMsg(online ? 'Order saved locally (demo/API unavailable). Sync when connected.' : 'Order saved offline. Will sync when back online.');
      } else {
        throw new Error('Cannot place order');
      }

      setLastOrderTotal(total);
      setOrderPlaced(true);
      resetCart();
      setTimeout(() => setOrderPlaced(false), 4000);
    } catch (err) {
      if (canSellOffline) {
        const offlinePayload = buildOrderPayload({
          cart, subtotal, tax, total,
          tableId: selectedTable,
          customerName,
          paymentMethod,
          employeeId: user?.id,
        });
        saveOfflineOrder(offlinePayload);
        setPendingOffline(getPendingCount());
        setLastOrderTotal(total);
        setOrderPlaced(true);
        resetCart();
        setStatusMsg('Network error — order saved offline for later sync.');
        setTimeout(() => setOrderPlaced(false), 4000);
      } else {
        setStatusMsg(err.message || 'Failed to place order');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSyncOffline = async () => {
    if (!online) {
      setStatusMsg('Connect to the internet to sync offline orders.');
      return;
    }
    const pending = getPendingCount();
    if (pending === 0) {
      setStatusMsg('No offline orders to sync.');
      return;
    }

    setIsSubmitting(true);
    try {
      const queue = getPendingOfflineOrders();
      const payload = queue.map(toSyncPayload);
      const result = await ApiService.syncOfflineOrders(payload);
      clearSyncedOrders(queue.map((o) => o.localId));
      setPendingOffline(getPendingCount());
      setStatusMsg(`Synced ${result.syncedCount || queue.length} offline order(s) successfully.`);
      loadCatalog();
    } catch (err) {
      setStatusMsg(err.message || 'Sync failed. Try again when server is available.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const tableStatusColor = {
    available: 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400',
    occupied: 'border-rose-500/50 bg-rose-500/10 text-rose-400',
    reserved: 'border-amber-500/50 bg-amber-500/10 text-amber-400',
  };

  return (
    <div className="p-8 max-w-[1800px] mx-auto space-y-7 min-h-full flex flex-col">
      <PageHeader
        title="POS Terminal"
        subtitle={`Welcome, ${user?.name || 'Staff'} — ${online ? 'Online mode' : 'Offline mode'}`}
        actions={
          <div className="flex items-center gap-3 flex-wrap">
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold border ${online ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-amber-500/10 border-amber-500/30 text-amber-400'}`}>
              {online ? <Wifi size={14} /> : <WifiOff size={14} />}
              {online ? 'Online' : 'Offline'}
            </span>
            {pendingOffline > 0 && (
              <button onClick={handleSyncOffline} disabled={isSubmitting} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold cursor-pointer hover:bg-rose-500/20">
                <RefreshCw size={14} className={isSubmitting ? 'animate-spin' : ''} />
                Sync {pendingOffline} offline
              </button>
            )}
            {usingDemo && (
              <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase">Demo Catalog</span>
            )}
          </div>
        }
      />

      {!canSellOffline && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-2xl flex items-center gap-3 text-sm">
          <AlertCircle size={20} />
          Offline selling is disabled for your account. Contact an admin to enable it.
        </div>
      )}

      {statusMsg && (
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-2xl text-sm">{statusMsg}</div>
      )}

      {orderPlaced && (
        <div className="p-5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center gap-4 text-base font-medium">
          <CheckCircle size={24} />
          Sale recorded! Total: ₹{lastOrderTotal.toFixed(2)}
        </div>
      )}

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard label="Today's Sales" value={`₹${todayStats.todaySales.toLocaleString()}`} icon={TrendingUp} color="gold" />
        <StatCard label="Orders Today" value={todayStats.todayOrders} icon={ShoppingCart} color="green" />
        <StatCard label="Active Tables" value={todayStats.activeTables} icon={Users} color="blue" />
        <StatCard
          label="Session Open"
          value={activeSession ? `₹${Number(activeSession.openingAmount).toLocaleString()}` : 'No session'}
          icon={Clock}
          color="rose"
          subtext={activeSession ? `Since ${new Date(activeSession.openedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Open a session in Session tab'}
        />
      </div>

      <div className="flex-1 grid grid-cols-1 xl:grid-cols-5 gap-6 min-h-[640px]">
        <div className="xl:col-span-3 flex flex-col bg-gray-800/30 border border-gray-700/50 rounded-3xl overflow-hidden">
          <div className="p-6 border-b border-gray-700/40 space-y-5">
            <div className="relative">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
              <input type="text" placeholder="Search menu items..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-2xl py-4 pl-12 pr-5 text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]" />
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1">
              <FilterButton active={activeCategory === 'all'} onClick={() => setActiveCategory('all')}>All Items</FilterButton>
              {categories.map((cat) => (
                <FilterButton key={cat.id} active={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)}>
                  {cat.icon} {cat.name}
                </FilterButton>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <button key={product.id} onClick={() => addToCart(product)} className="group bg-gray-900/60 border border-gray-700/50 hover:border-[#D4AF37]/60 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer min-h-[160px] flex flex-col">
                  <div className="text-5xl mb-4">{product.image}</div>
                  <p className="text-white text-base font-semibold group-hover:text-[#D4AF37] transition-colors leading-snug flex-1">{product.productName}</p>
                  <p className="text-[#D4AF37] font-bold text-xl mt-3">₹{product.price}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="xl:col-span-2 flex flex-col bg-gray-800/30 border border-gray-700/50 rounded-3xl overflow-hidden">
          <div className="px-7 py-5 border-b border-gray-700/40 bg-gray-800/20">
            <h2 className="text-xl font-bold text-white flex items-center gap-3">
              <ShoppingCart size={24} className="text-[#D4AF37]" />
              Current Order
              {cart.length > 0 && <span className="ml-auto text-sm font-bold bg-[#D4AF37]/20 text-[#D4AF37] px-3 py-1 rounded-full">{cart.reduce((n, i) => n + i.qty, 0)} items</span>}
            </h2>
          </div>

          <div className="p-6 border-b border-gray-700/40 space-y-4">
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-3">Select Table</p>
              <div className="grid grid-cols-4 gap-3">
                {tables.map((table) => (
                  <button key={table.id} onClick={() => table.status === 'available' && setSelectedTable(table.id)} disabled={table.status !== 'available'} className={`py-3.5 rounded-xl text-sm font-bold border transition-all ${selectedTable === table.id ? 'bg-[#cfad56] text-black border-[#cfad56]' : tableStatusColor[table.status]} ${table.status !== 'available' ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105'}`}>
                    {table.tableNumber}
                  </button>
                ))}
              </div>
            </div>
            <input type="text" placeholder="Customer name (optional)" value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full bg-gray-900 border border-gray-700 rounded-xl py-3.5 px-4 text-white text-base placeholder-gray-500 focus:outline-none focus:border-[#D4AF37]" />
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[180px]">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ShoppingCart size={48} className="mx-auto mb-4 opacity-25" />
                <p className="text-base font-medium">No items yet</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="flex items-center gap-4 bg-gray-900/60 rounded-2xl p-4 border border-gray-700/30">
                  <span className="text-3xl shrink-0">{item.image}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-base font-semibold truncate">{item.productName}</p>
                    <p className="text-[#D4AF37] text-sm mt-0.5">₹{item.price} × {item.qty}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button onClick={() => updateQty(item.id, -1)} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"><Minus size={18} /></button>
                    <span className="text-white font-bold text-lg w-7 text-center">{item.qty}</span>
                    <button onClick={() => updateQty(item.id, 1)} className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 cursor-pointer"><Plus size={18} /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="p-2 text-rose-400 hover:text-rose-300 cursor-pointer shrink-0"><Trash2 size={18} /></button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-gray-700/40 bg-gray-800/20 space-y-5">
            <div className="space-y-2.5 text-base">
              <div className="flex justify-between text-gray-400"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-gray-400"><span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between text-white font-bold text-2xl pt-3 border-t border-gray-700/40"><span>Total</span><span className="text-[#D4AF37]">₹{total.toFixed(2)}</span></div>
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-bold mb-3">Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                {[{ id: 'CASH', icon: Banknote, label: 'Cash' }, { id: 'CARD', icon: CreditCard, label: 'Card' }, { id: 'UPI', icon: Smartphone, label: 'UPI' }].map(({ id, icon: Icon, label }) => (
                  <button key={id} onClick={() => setPaymentMethod(id)} className={`flex flex-col items-center gap-2 py-4 rounded-xl text-sm font-bold border transition-all cursor-pointer ${paymentMethod === id ? 'bg-[#cfad56] text-black border-[#cfad56]' : 'bg-gray-900/60 border-gray-700/50 text-gray-400 hover:text-white'}`}>
                    <Icon size={22} />{label}
                  </button>
                ))}
              </div>
            </div>
            <PrimaryButton onClick={handlePlaceOrder} disabled={cart.length === 0 || !paymentMethod || isSubmitting || (!online && !canSellOffline)} className="w-full">
              {isSubmitting ? 'Processing...' : online ? `Place Order — ₹${total.toFixed(2)}` : `Save Offline Sale — ₹${total.toFixed(2)}`}
            </PrimaryButton>
          </div>
        </div>
      </div>

      {/* ═══ Table Selection Modal ═══════════════════════════════════════════ */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 max-w-lg w-full rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UtensilsCrossed size={18} className="text-[#D4AF37]" />
                Select Table
              </h3>
              <button onClick={() => setShowTableModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <button
              onClick={() => { setSelectedTable(null); setShowTableModal(false); }}
              className={`w-full p-3 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
                !selectedTable
                  ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                  : 'bg-gray-800/40 border-gray-700/40 text-gray-300 hover:border-gray-600'
              }`}
            >
              Takeaway (No Table)
            </button>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-64 overflow-y-auto pr-1">
              {tables.length === 0 ? (
                <p className="col-span-4 text-center text-gray-500 text-sm py-8">No active tables configured.</p>
              ) : (
                tables.map(table => (
                  <button
                    key={table.id}
                    onClick={() => { setSelectedTable(table); setShowTableModal(false); }}
                    className={`p-3 rounded-xl text-center border transition-all cursor-pointer ${
                      selectedTable?.id === table.id
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                        : 'bg-gray-800/40 border-gray-700/40 text-gray-300 hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    <div className="font-extrabold text-lg">{table.tableNumber}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{table.seats} seats</div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══ Payment Modal ═══════════════════════════════════════════════════ */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 max-w-md w-full rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-gray-700/50 pb-3">
              <h3 className="text-lg font-bold text-white">Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-400 hover:text-white p-1 hover:bg-gray-700 rounded-lg transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Order summary */}
            <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-4 space-y-1.5 text-sm">
              <div className="flex justify-between text-gray-400"><span>Items ({cart.reduce((s,i)=>s+i.qty,0)})</span><span>₹{subtotal.toFixed(2)}</span></div>
              {productDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Product Promos</span><span>-₹{productDiscount.toFixed(2)}</span></div>}
              {orderPromoDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Order Promo</span><span>-₹{orderPromoDiscount.toFixed(2)}</span></div>}
              {couponDiscount > 0 && <div className="flex justify-between text-emerald-400"><span>Coupon Discount</span><span>-₹{couponDiscount.toFixed(2)}</span></div>}
              <div className="flex justify-between text-gray-400"><span>Tax</span><span>₹{tax.toFixed(2)}</span></div>
              <div className="flex justify-between font-extrabold text-base text-white border-t border-gray-700/50 pt-2 mt-2">
                <span>Total Due</span>
                <span className="text-[#D4AF37]">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment methods */}
            <div>
              <p className="text-xs font-bold uppercase text-gray-400 tracking-wider mb-3">Select Payment Method</p>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map(pm => (
                  <button
                    key={pm.id}
                    onClick={() => {
                      setSelectedPaymentMethod(pm);
                      setCashReceived('');
                      setCardTxnRef('');
                      setUpiTxnRef('');
                    }}
                    className={`p-3 rounded-2xl border text-center transition-all cursor-pointer flex flex-col items-center gap-2 ${
                      selectedPaymentMethod?.id === pm.id
                        ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50 text-[#D4AF37]'
                        : 'bg-gray-800/40 border-gray-700/40 text-gray-400 hover:border-gray-600 hover:text-white'
                    }`}
                  >
                    <PayMethodIcon type={pm.type || pm.name} />
                    <span className="text-xs font-bold">{pm.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payment inputs based on selection */}
            {selectedPaymentMethod && (
              <div className="space-y-4 pt-2 border-t border-gray-800">
                {selectedPaymentMethod.name.toUpperCase() === 'CASH' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1.5">Cash Received *</label>
                      <input
                        type="number"
                        min={total}
                        step="0.01"
                        required
                        placeholder="Enter cash amount..."
                        value={cashReceived}
                        onChange={e => setCashReceived(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>
                    {parseFloat(cashReceived) >= total && (
                      <div className="flex justify-between items-center bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3">
                        <span className="text-xs text-emerald-400 font-semibold">Change Due:</span>
                        <span className="text-lg text-emerald-400 font-extrabold">₹{((parseFloat(cashReceived) || 0) - total).toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedPaymentMethod.name.toUpperCase() === 'CARD' && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 tracking-wider mb-1.5">Transaction Reference *</label>
                    <input
                      type="text"
                      required
                      placeholder="Enter card transaction ref..."
                      value={cardTxnRef}
                      onChange={e => setCardTxnRef(e.target.value)}
                      className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 px-4 text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
                    />
                  </div>
                )}

                {selectedPaymentMethod.name.toUpperCase() === 'UPI' && (
                  <div className="flex flex-col items-center justify-center space-y-3 p-3 bg-gray-800/20 border border-gray-800 rounded-2xl">
                    <p className="text-xs text-gray-400 font-semibold text-center">
                      Scan QR Code to pay with UPI ID: <span className="text-[#D4AF37] font-mono">{selectedPaymentMethod.upiId || 'cafe@ybl'}</span>
                    </p>
                    <div className="p-3 bg-white rounded-2xl shadow-inner">
                      <img
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                          `upi://pay?pa=${selectedPaymentMethod.upiId || 'cafe@ybl'}&pn=GatherPoint%20Cafe&am=${total.toFixed(2)}&cu=INR`
                        )}`}
                        alt="UPI QR Code"
                        className="w-36 h-36"
                      />
                    </div>
                    <div className="w-full">
                      <label className="block text-[10px] font-bold uppercase text-gray-400 tracking-wider mb-1">Optional Txn Reference</label>
                      <input
                        type="text"
                        placeholder="UPI reference number..."
                        value={upiTxnRef}
                        onChange={e => setUpiTxnRef(e.target.value)}
                        className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2 px-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                <AlertCircle size={14} />{errorMsg}
              </div>
            )}

            <button
              onClick={handleProcessPayment}
              disabled={!selectedPaymentMethod || paymentLoading || (selectedPaymentMethod.name.toUpperCase() === 'CASH' && !(parseFloat(cashReceived) >= total)) || (selectedPaymentMethod.name.toUpperCase() === 'CARD' && !cardTxnRef.trim())}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b8943f] text-black font-extrabold py-3.5 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {paymentLoading ? (
                <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <><Check size={16} /> Confirm Payment — ₹{total.toFixed(2)}</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ═══ Receipt Modal ═══════════════════════════════════════════════════ */}
      {showReceiptModal && lastOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 max-w-sm w-full rounded-3xl p-6 shadow-2xl space-y-5 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto">
              <Check size={28} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-white">Payment Successful!</h3>
              <p className="text-gray-400 text-sm mt-1">Order has been sent to the kitchen</p>
            </div>
            <div className="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-4 text-sm space-y-2">
              <div className="flex justify-between text-gray-400">
                <span>Order #</span>
                <span className="font-mono text-[#D4AF37] font-bold">{lastOrder.orderNumber || lastOrder.id}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Amount</span>
                <span className="text-white font-bold">₹{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Method</span>
                <span className="text-white font-semibold">{lastOrder.paymentMethod}</span>
              </div>
              {selectedTable && (
                <div className="flex justify-between text-gray-400">
                  <span>Table</span>
                  <span className="text-white font-semibold">{selectedTable.tableNumber}</span>
                </div>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handlePrintReceipt}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gray-800 hover:bg-gray-700 text-white text-sm font-bold rounded-xl transition-all cursor-pointer"
              >
                <Printer size={15} /> Print
              </button>
              <button
                onClick={() => setShowReceiptModal(false)}
                className="flex-1 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#b8943f] text-black text-sm font-extrabold rounded-xl transition-all hover:opacity-90 cursor-pointer"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-950/90 border-2 border-emerald-400 text-emerald-100 px-6 py-4 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.3)] animate-bounce flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping shrink-0" />
          <span className="font-extrabold text-sm tracking-wide">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-emerald-400 hover:text-white font-bold ml-2">×</button>
        </div>
      )}
    </div>
  );
}
