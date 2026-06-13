import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ShoppingBag, X, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';

const FloatingCart = ({ cart, updateQuantity, removeItem, onCheckout }) => {
  const [isOpen, setIsOpen] = useState(false);
  const drawerRef = useRef(null);
  const overlayRef = useRef(null);
  
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'block' });
      gsap.to(drawerRef.current, { x: 0, duration: 0.5, ease: "power3.out" });
    } else {
      gsap.to(drawerRef.current, { x: '100%', duration: 0.4, ease: "power3.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, display: 'none', delay: 0.1 });
    }
  }, [isOpen]);

  return (
    <>
      {/* Top Right Floating Button — hidden since navbar has cart, kept as programmatic trigger */}
      <div className="fixed top-20 right-6 z-50 hidden">
        <button
          id="cart-trigger-btn"
          onClick={() => setIsOpen(true)}
          className="relative bg-customer-primary text-customer-text p-4 rounded-full shadow-[0_0_20px_rgba(45,106,79,0.4)] hover:bg-customer-accent hover:text-customer-bg hover:shadow-[0_0_25px_rgba(212,163,115,0.5)] transition-all duration-300 group"
        >
          <ShoppingBag size={24} className="group-hover:scale-110 transition-transform" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-customer-bg">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      {/* Drawer Overlay */}
      <div 
        ref={overlayRef} 
        onClick={() => setIsOpen(false)}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] hidden opacity-0"
      />

      {/* Slide-out Drawer */}
      <div 
        ref={drawerRef}
        className="fixed top-0 right-0 h-full w-full max-w-md bg-customer-bg border-l border-white/10 z-[70] shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col transform translate-x-full"
      >
        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
          <h2 className="text-2xl font-cinzel font-bold text-customer-accent flex items-center gap-3">
            <ShoppingBag size={26} />
            Your Order
          </h2>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-full hover:bg-white/10 text-customer-text/70 hover:text-customer-accent transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-6 no-scrollbar space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-customer-text/50">
              <ShoppingBag size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-sans">Your cart is empty.</p>
              <button onClick={() => setIsOpen(false)} className="mt-4 text-customer-accent hover:underline">Start browsing</button>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex gap-4 bg-white/5 border border-white/10 rounded-2xl p-4 relative group hover:border-customer-accent/30 transition-colors">
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-black/40 flex-shrink-0 border border-white/5">
                  {item.imageUrl && item.imageUrl.length > 5 && item.imageUrl.startsWith('http') ? (
                    <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">☕</div>
                  )}
                </div>
                <div className="flex-grow flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-customer-text font-sans">{item.productName}</h4>
                    <p className="text-sm text-customer-text/60">₹{item.price}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 bg-black/40 rounded-full px-2 py-1">
                      <button onClick={() => updateQuantity(item, -1)} className="p-1 hover:text-customer-accent transition-colors"><Minus size={14} /></button>
                      <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item, 1)} className="p-1 hover:text-customer-accent transition-colors"><Plus size={14} /></button>
                    </div>
                    <p className="font-bold text-customer-accent font-sans">₹{item.price * item.quantity}</p>
                  </div>
                </div>
                <button 
                  onClick={() => removeItem(item)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 shadow-lg"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-white/5 border-t border-white/10">
            <div className="flex justify-between mb-2 text-customer-text/70">
              <span>Subtotal</span>
              <span className="font-sans">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-4 text-customer-text/70">
              <span>Taxes (5%)</span>
              <span className="font-sans">₹{(subtotal * 0.05).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-6 text-xl font-bold border-t border-white/10 pt-4">
              <span>Total</span>
              <span className="text-customer-accent font-sans">₹{(subtotal * 1.05).toFixed(2)}</span>
            </div>
            <button 
              onClick={() => {
                setIsOpen(false);
                onCheckout();
              }}
              className="w-full py-4 bg-customer-primary text-customer-text font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-customer-accent hover:text-customer-bg transition-colors shadow-[0_4px_15px_rgba(45,106,79,0.5)]"
            >
              Proceed to Checkout <ArrowRight size={20} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default FloatingCart;
