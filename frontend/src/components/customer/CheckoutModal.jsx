import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, CreditCard, Banknote, Smartphone } from 'lucide-react';

const CheckoutModal = ({ isOpen, onClose, onConfirm, total }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    instructions: '',
    payment: 'UPI'
  });

  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'flex' });
      gsap.fromTo(modalRef.current, 
        { scale: 0.8, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.5)" }
      );
    } else if (overlayRef.current) {
      gsap.to(modalRef.current, { scale: 0.8, opacity: 0, y: 50, duration: 0.3, ease: "power2.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, display: 'none', delay: 0.2 });
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(formData);
  };

  return (
    <div ref={overlayRef} className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] hidden items-center justify-center p-4 opacity-0">
      <div 
        ref={modalRef} 
        className="bg-customer-bg border border-customer-accent/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] relative"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-customer-text/70 hover:text-customer-accent z-10 transition-colors">
          <X size={24} />
        </button>
        
        <div className="p-8">
          <h2 className="text-3xl font-cinzel font-bold text-customer-accent mb-6">Checkout</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-customer-text/80 mb-2">Full Name</label>
                <input 
                  required
                  type="text" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-customer-text/80 mb-2">Phone Number</label>
                <input 
                  required
                  type="tel" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-customer-text/80 mb-2">Special Instructions</label>
                <textarea 
                  value={formData.instructions}
                  onChange={e => setFormData({...formData, instructions: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors resize-none h-24"
                  placeholder="Any allergies or special requests?"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-customer-text/80 mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI', icon: Smartphone, label: 'UPI' },
                  { id: 'CARD', icon: CreditCard, label: 'Card' },
                  { id: 'CASH', icon: Banknote, label: 'Cash' }
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setFormData({...formData, payment: method.id})}
                    className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                      formData.payment === method.id 
                        ? 'border-customer-accent bg-customer-accent/10 text-customer-accent shadow-[0_0_15px_rgba(212,163,115,0.2)]' 
                        : 'border-white/10 bg-white/5 text-customer-text/70 hover:border-white/30'
                    }`}
                  >
                    <method.icon size={24} />
                    <span className="text-sm font-semibold">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-6 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm text-customer-text/70">Total to pay</div>
                <div className="text-2xl font-bold text-customer-accent font-sans">₹{total.toFixed(2)}</div>
              </div>
              <button 
                type="submit"
                className="px-8 py-4 bg-customer-primary text-customer-text font-bold rounded-xl hover:bg-customer-accent hover:text-customer-bg transition-colors shadow-lg shadow-customer-primary/20"
              >
                Place Order
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
