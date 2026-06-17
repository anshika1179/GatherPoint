import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Plus, Minus, Trash2, Search, Tag, Check, X,
  CreditCard, Banknote, Smartphone, UtensilsCrossed, Printer,
  ChevronRight, AlertCircle, Package, Percent
} from 'lucide-react';
import ApiService from '../services/apiService';
import useAuth from '../hooks/useAuth';

const TAX_RATE = 0.05;

export default function PosTerminal() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Data
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [tables, setTables] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // POS state
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedTable, setSelectedTable] = useState(null);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Modals
  const [showTableModal, setShowTableModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [promotions, setPromotions] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);
  const [cashReceived, setCashReceived] = useState('');
  const [cardTxnRef, setCardTxnRef] = useState('');
  const [upiTxnRef, setUpiTxnRef] = useState('');

  // ── Load Data ─────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [cats, prods, tbls, pmts, session, promos] = await Promise.all([
          ApiService.getCategories(),
          ApiService.getProducts(),
          ApiService.getTables(),
          ApiService.getEnabledPaymentMethods().catch(() => []),
          ApiService.getActiveSession().catch(() => null),
          ApiService.getPromotions().catch(() => []),
        ]);
        setCategories(Array.isArray(cats) ? cats : []);
        setProducts(Array.isArray(prods) ? prods : []);
        setTables(Array.isArray(tbls) ? tbls.filter(t => t.active) : []);
        setPaymentMethods(Array.isArray(pmts) ? pmts : [
          { id: 1, name: 'Cash', enabled: true },
          { id: 2, name: 'Card', enabled: true },
          { id: 3, name: 'UPI', enabled: true, upiId: 'cafe@ybl' },
        ]);
        setActiveSession(session);
        setPromotions(Array.isArray(promos) ? promos.filter(p => p.active) : []);
        if (!session) {
          // No active session — warn but don't block (let admin/employee decide)
        }
      } catch (err) {
        console.error(err);
        setErrorMsg('Failed to load POS data. Check backend connection.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ── WebSocket & Toast ──────────────────────────────────────────────────
  useEffect(() => {
    let ws = null;
    const connect = () => {
      const socket = new WebSocket((window.location.protocol === 'https:' ? 'wss://' : 'ws://') + window.location.host + '/ws/websocket');
      
      socket.onopen = () => {
        socket.send('CONNECT\naccept-version:1.2\n\n\x00');
      };
      
      socket.onmessage = (event) => {
        const data = event.data;
        if (data.includes('CONNECTED')) {
          socket.send('SUBSCRIBE\nid:sub-0\ndestination:/topic/kitchen\n\n\x00');
        } else if (data.includes('MESSAGE')) {
          try {
            const parts = data.split('\n\n');
            if (parts.length > 1) {
              const bodyStr = parts[1].replace(/\0/g, '').trim();
              const payload = JSON.parse(bodyStr);
              if (payload.event === 'ORDER_COMPLETED') {
                const ticket = payload.ticket;
                setToastMsg(`Order #${ticket.orderNumber || ticket.id} is ready to serve! 🚀`);
              }
            }
          } catch (e) {
            console.debug('POS: WebSocket message parse error', e);
          }
        }
      };
      
      socket.onclose = () => {
        setTimeout(connect, 5000);
      };
      
      ws = socket;
    };
    
    connect();
    
    return () => {
      if (ws) ws.close();
    };
  }, []);

  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // ── Derived values ─────────────────────────────────────────────────────
  const filteredProducts = products.filter(p => {
    const matchCat = selectedCategory === 'ALL' || p.category?.id === selectedCategory;
    const matchSearch = p.productName?.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch && p.available !== false;
  });

  // Calculate product-level promotions on cart items
  const cartWithPromos = cart.map(item => {
    const promo = promotions.find(p => 
      p.active !== false && 
      p.scope === 'PRODUCT_LEVEL' && 
      p.product?.id === item.id && 
      item.qty >= p.minQuantity
    );

    let itemDiscount = 0;
    if (promo) {
      if (promo.discountType === 'PERCENTAGE') {
        itemDiscount = item.price * item.qty * (promo.discountValue / 100);
      } else if (promo.discountType === 'FIXED_AMOUNT') {
        itemDiscount = Math.min(promo.discountValue, item.price * item.qty);
      }
    }

    return {
      ...item,
      discount: itemDiscount,
      promoName: promo ? promo.name : null
    };
  });

  const subtotal = cart.reduce((s, item) => s + item.price * item.qty, 0);
  const productDiscount = cartWithPromos.reduce((s, item) => s + item.discount, 0);
  const afterProductPromoTotal = subtotal - productDiscount;

  const orderPromo = promotions.find(p => 
    p.active !== false && 
    p.scope === 'ORDER_LEVEL' && 
    afterProductPromoTotal >= p.minOrderAmount
  );

  let orderPromoDiscount = 0;
  if (orderPromo) {
    if (orderPromo.discountType === 'PERCENTAGE') {
      orderPromoDiscount = afterProductPromoTotal * (orderPromo.discountValue / 100);
    } else if (orderPromo.discountType === 'FIXED_AMOUNT') {
      orderPromoDiscount = Math.min(orderPromo.discountValue, afterProductPromoTotal);
    }
  }

  let couponDiscount = 0;
  if (couponData) {
    const amountToApplyOn = afterProductPromoTotal - orderPromoDiscount;
    if (couponData.discountType === 'PERCENTAGE') {
      couponDiscount = amountToApplyOn * (couponData.discountValue / 100);
    } else {
      couponDiscount = Math.min(couponData.discountValue, amountToApplyOn);
    }
  }

  const discount = productDiscount + orderPromoDiscount + couponDiscount;
  const taxableAmount = Math.max(0, subtotal - discount);
  const tax = taxableAmount * TAX_RATE;
  const total = taxableAmount + tax;

  // ── Cart Actions ───────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { id: product.id, name: product.productName, price: product.price, qty: 1, image: product.imageUrl }];
    });
  }, []);

  const updateQty = (id, delta) => {
    setCart(prev => {
      const updated = prev.map(i => i.id === id ? { ...i, qty: Math.max(0, i.qty + delta) } : i);
      return updated.filter(i => i.qty > 0);
    });
  };

  const removeItem = (id) => setCart(prev => prev.filter(i => i.id !== id));

  const clearCart = () => {
    setCart([]);
    setCouponCode('');
    setCouponData(null);
    setCouponError('');
    setSelectedTable(null);
    setCashReceived('');
    setCardTxnRef('');
    setUpiTxnRef('');
  };

  // ── Coupon ─────────────────────────────────────────────────────────────
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      setCouponLoading(true);
      setCouponError('');
      const data = await ApiService.validateCoupon(couponCode.trim(), subtotal);
      setCouponData(data);
    } catch (err) {
      setCouponError(err.message || 'Invalid coupon');
      setCouponData(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const removeCoupon = () => {
    setCouponData(null);
    setCouponCode('');
    setCouponError('');
  };

  // ── Payment ────────────────────────────────────────────────────────────
  const handleCheckout = () => {
    if (cart.length === 0) return;
    setShowPaymentModal(true);
    setErrorMsg('');
  };

  const handleProcessPayment = async () => {
    if (!selectedPaymentMethod) {
      setErrorMsg('Please select a payment method.');
      return;
    }
    try {
      setPaymentLoading(true);
      setErrorMsg('');

      // 1. Create order
      const orderPayload = {
        items: cart.map(item => ({
          product: { id: item.id },
          quantity: item.qty,
          totalPrice: item.price * item.qty,
        })),
        table: selectedTable ? { id: selectedTable.id } : null,
        couponCode: couponData ? couponCode : null,
        subtotal,
        discount,
        tax,
        total,
        status: 'DRAFT',
        employee: { id: user?.id },
      };

      const order = await ApiService.createOrder(orderPayload);

      // 2. Process payment based on method
      const pmName = selectedPaymentMethod.name.toUpperCase();
      if (pmName === 'CASH') {
        const changeDue = Math.max(0, (parseFloat(cashReceived) || 0) - total);
        await ApiService.processPaymentCash(order.id, total, parseFloat(cashReceived), changeDue);
      } else if (pmName === 'CARD') {
        await ApiService.processPaymentCard(order.id, total, cardTxnRef);
      } else if (pmName === 'UPI') {
        await ApiService.processPaymentUpi(order.id, total, upiTxnRef || ('UPI-' + Date.now()));
      } else {
        const paymentPayload = {
          order: { id: order.id },
          paymentMethod: { id: selectedPaymentMethod.id },
          amount: total,
        };
        await ApiService.processPayment(paymentPayload);
      }

      // 3. Send to kitchen
      try {
        await ApiService.sendOrderToKitchen(order.id);
      } catch {
        // kitchen send failure is non-critical
      }

      setLastOrder({ ...order, paymentMethod: selectedPaymentMethod.name });
      setShowPaymentModal(false);
      setShowReceiptModal(true);
      clearCart();
    } catch (err) {
      setErrorMsg(err.message || 'Payment failed. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  // ── Receipt Print ──────────────────────────────────────────────────────
  const handlePrintReceipt = () => {
    if (!lastOrder) return;
    const itemsHtml = cart.map(i => `
      <div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px;">
        <span>${i.qty}x ${i.name}</span>
        <span>₹${(i.price * i.qty).toFixed(2)}</span>
      </div>
    `).join('');
    const w = window.open('', '_blank', 'width=380,height=600');
    w.document.write(`<html><head><title>Receipt</title><style>
      body{font-family:monospace;padding:20px;color:#000}
      .hdr{text-align:center;margin-bottom:20px}
      .div{border-bottom:1px dashed #000;margin:12px 0}
      .row{display:flex;justify-content:space-between;margin-bottom:5px;font-size:13px}
      .bold{font-weight:bold}
    </style></head>
    <body onload="window.print();window.close()">
      <div class="hdr"><h2>GATHERPOINT CAFE</h2><p>123 Dining Street, Cloud City</p><p>+91 98765 43210</p></div>
      <div class="div"></div>
      <p>Order: <b>${lastOrder.orderNumber || lastOrder.id}</b></p>
      <p>Date: ${new Date().toLocaleString()}</p>
      <p>Table: ${selectedTable?.tableNumber || 'Takeaway'}</p>
      <p>Cashier: ${user?.name || 'Staff'}</p>
      <div class="div"></div>
      ${itemsHtml}
      <div class="div"></div>
      <div class="row"><span>Subtotal</span><span>₹${subtotal.toFixed(2)}</span></div>
      ${discount > 0 ? `<div class="row"><span>Discount</span><span>-₹${discount.toFixed(2)}</span></div>` : ''}
      <div class="row"><span>Tax (5%)</span><span>₹${tax.toFixed(2)}</span></div>
      <div class="div"></div>
      <div class="row bold" style="font-size:15px"><span>TOTAL</span><span>₹${total.toFixed(2)}</span></div>
      <div class="row"><span>Payment</span><span>${lastOrder.paymentMethod}</span></div>
      <div class="div"></div>
      <p style="text-align:center;font-size:12px;margin-top:24px">Thank You! Please Visit Again 🙏</p>
    </body></html>`);
    w.document.close();
  };

  // ── Payment Method Icon ────────────────────────────────────────────────
  const PayMethodIcon = ({ type }) => {
    if (type === 'CASH' || type?.toLowerCase() === 'cash') return <Banknote size={20} />;
    if (type === 'UPI' || type?.toLowerCase() === 'upi') return <Smartphone size={20} />;
    return <CreditCard size={20} />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[70vh]">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 text-sm">Loading POS Terminal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-[#020403]">

      {/* ═══ LEFT PANEL — Menu Browser ═══════════════════════════════════════ */}
      <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-800">

        {/* Top Bar */}
        <div className="px-6 py-4 border-b border-gray-800 space-y-3 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF2B2] via-[#D4AF37] to-[#8A6623]">
                POS Terminal
              </h1>
              <p className="text-gray-500 text-xs mt-0.5">
                Cashier: {user?.name} {activeSession ? `· Session #${activeSession.id}` : '· No active session'}
              </p>
            </div>
            {selectedTable && (
              <button
                onClick={() => setShowTableModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] rounded-xl text-xs font-bold hover:bg-[#D4AF37]/20 transition-all cursor-pointer"
              >
                <UtensilsCrossed size={13} />
                {selectedTable.tableNumber}
                <ChevronRight size={12} />
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              placeholder="Search menu items..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-gray-900 border border-gray-800 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50 transition-all"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`shrink-0 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-gradient-to-r from-[#D4AF37] to-[#b8943f] text-black shadow-lg shadow-[#D4AF37]/20'
                  : 'bg-gray-800/40 border border-gray-700/30 text-gray-400 hover:text-white hover:bg-gray-800/80 hover:border-gray-600'
              }`}
            >
              All Items
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`shrink-0 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-[#D4AF37] to-[#b8943f] text-black shadow-lg shadow-[#D4AF37]/20'
                    : 'bg-gray-800/40 border border-gray-700/30 text-gray-400 hover:text-white hover:bg-gray-800/80 hover:border-gray-600'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
              <Package size={40} className="text-gray-700" />
              <p className="text-gray-500 text-sm font-semibold">No items found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {filteredProducts.map(product => {
                const inCart = cart.find(i => i.id === product.id);
                return (
                  <button
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="relative flex flex-col bg-gray-900/40 backdrop-blur-md border border-gray-800/60 hover:border-[#D4AF37]/50 rounded-[1.5rem] overflow-hidden text-left transition-all duration-300 hover:shadow-xl hover:shadow-[#D4AF37]/10 group cursor-pointer active:scale-[0.98]"
                  >
                    {/* Image */}
                    <div className="w-full h-36 bg-gray-800/50 overflow-hidden relative">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.productName}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextElementSibling.style.display = 'flex';
                          }}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : null}
                      <div className="w-full h-full flex items-center justify-center bg-gray-800/50" style={{ display: product.imageUrl ? 'none' : 'flex' }}>
                        <UtensilsCrossed size={32} className="text-gray-600" />
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-80" />
                    </div>
                    {/* Info */}
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-2">
                      <p className="font-bold text-white text-sm leading-snug line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
                        {product.productName}
                      </p>
                      <p className="text-[#D4AF37] font-extrabold text-base">₹{product.price?.toFixed(2)}</p>
                    </div>
                    {/* Add badge */}
                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                      <Plus size={13} className="text-black" />
                    </div>
                    {/* In cart indicator */}
                    {inCart && (
                      <div className="absolute top-2 left-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {inCart.qty} in cart
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ═══ RIGHT PANEL — Cart & Checkout ═══════════════════════════════════ */}
      <div className="w-80 xl:w-96 flex flex-col bg-gray-900/50 border-l border-gray-800 shrink-0">

        <div className="px-5 py-5 border-b border-gray-800 flex items-center justify-between shrink-0 bg-gray-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
              <ShoppingCart size={16} className="text-[#D4AF37]" />
            </div>
            <h2 className="font-extrabold text-white text-base tracking-wide">Current Order</h2>
            {cart.length > 0 && (
              <span className="bg-gradient-to-r from-[#D4AF37] to-[#b8943f] text-black text-xs font-extrabold px-2.5 py-0.5 rounded-full shadow-lg">
                {cart.reduce((s, i) => s + i.qty, 0)}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowTableModal(true)}
              className="text-xs font-bold text-gray-300 hover:text-white px-3 py-1.5 rounded-xl border border-gray-700 hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <UtensilsCrossed size={12} className={selectedTable ? "text-[#D4AF37]" : "text-gray-500"} />
              {selectedTable ? selectedTable.tableNumber : 'Select Table'}
            </button>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 rounded-xl border border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40 transition-all cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto py-3 px-4 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-12">
              <ShoppingCart size={36} className="text-gray-700" />
              <p className="text-gray-500 text-xs font-semibold">Cart is empty</p>
              <p className="text-gray-600 text-[11px]">Tap items on the left to add them</p>
            </div>
          ) : (
            cartWithPromos.map(item => (
              <div key={item.id} className="flex items-center gap-3 bg-gray-800/30 border border-gray-700/30 hover:border-gray-600/50 rounded-2xl p-3 transition-all">
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-bold truncate">{item.name}</p>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <p className="text-[#D4AF37] text-sm font-extrabold">
                      ₹{((item.price * item.qty) - item.discount).toFixed(2)}
                    </p>
                    {item.discount > 0 && (
                      <p className="text-gray-500 text-[11px] line-through font-medium">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </p>
                    )}
                  </div>
                  {item.discount > 0 && (
                    <p className="text-emerald-400 text-[10px] font-bold mt-1 bg-emerald-400/10 inline-block px-1.5 py-0.5 rounded">
                      -{item.promoName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0 bg-gray-900/60 p-1 rounded-xl border border-gray-700/50">
                  <button
                    onClick={() => updateQty(item.id, -1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-6 text-center text-white font-extrabold text-sm">{item.qty}</span>
                  <button
                    onClick={() => updateQty(item.id, 1)}
                    className="w-7 h-7 flex items-center justify-center hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors cursor-pointer"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors cursor-pointer ml-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Bottom: Coupon + Totals + Checkout */}
        {cart.length > 0 && (
          <div className="border-t border-gray-800 p-4 space-y-3 shrink-0">

            {/* Coupon Input */}
            {!couponData ? (
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    placeholder="Coupon code"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                    className="w-full bg-gray-900 border border-gray-700 rounded-xl py-2 pl-8 pr-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-[#D4AF37]/50"
                  />
                </div>
                <button
                  onClick={handleApplyCoupon}
                  disabled={couponLoading}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 text-gray-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer hover:border-[#D4AF37]/40 disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'Apply'}
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3 py-2">
                <div className="flex items-center gap-2">
                  <Percent size={13} className="text-emerald-400" />
                  <span className="text-emerald-400 text-xs font-bold">{couponCode}</span>
                  <span className="text-emerald-400 text-xs">
                    -{couponData.discountType === 'PERCENTAGE' ? `${couponData.discountValue}%` : `₹${couponData.discountValue}`}
                  </span>
                </div>
                <button onClick={removeCoupon} className="text-gray-500 hover:text-rose-400 cursor-pointer">
                  <X size={13} />
                </button>
              </div>
            )}
            {couponError && <p className="text-rose-400 text-[11px] flex items-center gap-1"><AlertCircle size={12} />{couponError}</p>}

            {/* Totals */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span>
              </div>
              {productDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Product Promos</span><span>-₹{productDiscount.toFixed(2)}</span>
                </div>
              )}
              {orderPromoDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Order Promo ({orderPromo.name})</span><span>-₹{orderPromoDiscount.toFixed(2)}</span>
                </div>
              )}
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Coupon ({couponCode})</span><span>-₹{couponDiscount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Tax (5%)</span><span>₹{tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-extrabold text-base text-white border-t border-gray-700 pt-2 mt-2">
                <span>Total</span>
                <span className="text-[#D4AF37]">₹{total.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Button */}
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-[#D4AF37] to-[#b8943f] text-black font-extrabold py-3 rounded-2xl transition-all hover:opacity-90 active:scale-[0.98] shadow-lg shadow-[#D4AF37]/20 cursor-pointer flex items-center justify-center gap-2 text-sm"
            >
              <CreditCard size={16} />
              Charge ₹{total.toFixed(2)}
            </button>
          </div>
        )}
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