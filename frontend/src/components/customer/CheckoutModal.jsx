import { useEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { X, CreditCard, Banknote, Smartphone, Loader2, ShieldCheck } from 'lucide-react';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_We2TfD6XCCwnVb';

/** Dynamically loads the Razorpay JS checkout script once */
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const CheckoutModal = ({ isOpen, onClose, onConfirm, total }) => {
  const overlayRef = useRef(null);
  const modalRef  = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    instructions: '',
    payment: 'UPI',
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState('');

  /* ── GSAP animation ──────────────────────────────── */
  useEffect(() => {
    if (isOpen) {
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.3, display: 'flex' });
      gsap.fromTo(modalRef.current,
        { scale: 0.85, opacity: 0, y: 50 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'back.out(1.5)' }
      );
      setError('');
    } else if (overlayRef.current) {
      gsap.to(modalRef.current, { scale: 0.85, opacity: 0, y: 50, duration: 0.3, ease: 'power2.in' });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, display: 'none', delay: 0.2 });
    }
  }, [isOpen]);

  /* ── Cash path ───────────────────────────────────── */
  const handleCash = (e) => {
    e.preventDefault();
    onConfirm({ ...formData, payment: 'CASH', transactionRef: 'CASH-' + Date.now() });
  };

  /* ── Razorpay (UPI / Card) path ──────────────────── */
  const handleRazorpay = useCallback(async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Load Razorpay checkout script
      const loaded = await loadRazorpayScript();
      if (!loaded) throw new Error('Failed to load Razorpay SDK. Check your internet connection.');

      // 2. Create a Razorpay order on our backend
      const res = await fetch('/api/public/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || 'Could not initiate payment. Please try again.');
      }

      const orderData = await res.json();

      // 3. Open Razorpay checkout widget
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'GatherPoint',
        description: 'Food & Beverage Order',
        image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=100&auto=format&fit=crop',
        order_id: orderData.id,
        prefill: {
          name: formData.name,
          contact: formData.phone,
        },
        theme: { color: '#c9a96e' },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setError('Payment cancelled. Please try again.');
          },
        },
        handler: async (response) => {
          // 4. Verify signature on backend
          try {
            const verifyRes = await fetch('/api/public/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id:   response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature:  response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (verifyData.verified) {
              onConfirm({
                ...formData,
                payment: formData.payment,
                transactionRef: response.razorpay_payment_id,
                razorpayOrderId: response.razorpay_order_id,
              });
            } else {
              setError('Payment verification failed. Contact support with ID: ' + response.razorpay_payment_id);
            }
          } catch {
            setError('Could not verify payment. Contact support with ID: ' + response.razorpay_payment_id);
          } finally {
            setLoading(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (resp) => {
        setLoading(false);
        setError('Payment failed: ' + (resp.error?.description || 'Unknown error'));
      });
      rzp.open();
    } catch (err) {
      setLoading(false);
      setError(err.message || 'Something went wrong. Please try again.');
    }
  }, [total, formData, onConfirm]);

  /* ── Submit router ───────────────────────────────── */
  const handleSubmit = formData.payment === 'CASH' ? handleCash : handleRazorpay;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] hidden items-center justify-center p-4 opacity-0"
    >
      <div
        ref={modalRef}
        className="bg-customer-bg border border-customer-accent/30 rounded-3xl w-full max-w-lg overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] relative"
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-customer-text/70 hover:text-customer-accent z-10 transition-colors"
          disabled={loading}
        >
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-cinzel font-bold text-customer-accent mb-1">Checkout</h2>
          <p className="text-customer-text/50 text-sm mb-6">Powered by Razorpay · 100% secure</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-customer-text/80 mb-2">Full Name</label>
              <input
                required
                type="text"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors"
                placeholder="John Doe"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-semibold text-customer-text/80 mb-2">Phone Number</label>
              <input
                required
                type="tel"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors"
                placeholder="+91 98765 43210"
              />
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-semibold text-customer-text/80 mb-2">Special Instructions</label>
              <textarea
                value={formData.instructions}
                onChange={e => setFormData({ ...formData, instructions: e.target.value })}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-customer-text focus:outline-none focus:border-customer-accent transition-colors resize-none h-20"
                placeholder="Allergies or special requests?"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-semibold text-customer-text/80 mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'UPI',  icon: Smartphone, label: 'UPI',  badge: 'Online' },
                  { id: 'CARD', icon: CreditCard,  label: 'Card', badge: 'Online' },
                  { id: 'CASH', icon: Banknote,    label: 'Cash', badge: null },
                ].map(method => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment: method.id })}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-300 ${
                      formData.payment === method.id
                        ? 'border-customer-accent bg-customer-accent/10 text-customer-accent shadow-[0_0_18px_rgba(212,163,115,0.25)]'
                        : 'border-white/10 bg-white/5 text-customer-text/70 hover:border-white/30'
                    }`}
                  >
                    {method.badge && (
                      <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                        {method.badge}
                      </span>
                    )}
                    <method.icon size={22} />
                    <span className="text-sm font-semibold">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Razorpay badge */}
              {formData.payment !== 'CASH' && (
                <div className="mt-3 flex items-center gap-2 text-customer-text/40 text-xs">
                  <ShieldCheck size={14} className="text-green-400" />
                  <span>Payments processed securely via Razorpay</span>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Total + CTA */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm text-customer-text/60">Total to pay</div>
                <div className="text-2xl font-bold text-customer-accent font-sans">₹{total.toFixed(2)}</div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`flex items-center gap-2 px-7 py-4 font-bold rounded-xl transition-all duration-200 shadow-lg ${
                  loading
                    ? 'bg-customer-primary/50 text-customer-text/50 cursor-not-allowed'
                    : 'bg-customer-primary text-customer-text hover:bg-customer-accent hover:text-customer-bg shadow-customer-primary/20'
                }`}
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    Processing…
                  </>
                ) : formData.payment === 'CASH' ? (
                  'Place Order'
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    Pay ₹{total.toFixed(2)}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;
