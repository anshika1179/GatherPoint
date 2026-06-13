import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { X, Star, Clock, Flame, Plus, Minus, ShoppingBag } from 'lucide-react';

const ProductDetailModal = ({ isOpen, onClose, product, onAdd }) => {
  const overlayRef = useRef(null);
  const modalRef = useRef(null);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setQuantity(1); // Reset quantity when modal opens
      gsap.to(overlayRef.current, { opacity: 1, duration: 0.35, display: 'flex' });
      gsap.fromTo(modalRef.current,
        { scale: 0.85, opacity: 0, y: 30 },
        { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }
      );
    } else if (overlayRef.current) {
      gsap.to(modalRef.current, { scale: 0.85, opacity: 0, y: 30, duration: 0.3, ease: "power2.in" });
      gsap.to(overlayRef.current, { opacity: 0, duration: 0.3, display: 'none', delay: 0.15 });
    }
  }, [isOpen]);

  if (!product) return null;

  const rating = product.rating || '4.5';
  const prepTime = product.prepTime || '10 mins';
  const calories = product.calories || '300 kcal';
  const totalPrice = product.price * quantity;

  const handleAddToCart = () => {
    // Add product to cart with the selected quantity
    for (let i = 0; i < quantity; i++) {
      onAdd(product);
    }
    onClose();
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] hidden items-center justify-center p-4 md:p-6 opacity-0"
    >
      <div
        ref={modalRef}
        className="bg-customer-bg border border-customer-accent/20 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.85)] relative flex flex-col md:flex-row min-h-[420px]"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-black/40 hover:bg-customer-accent/20 border border-white/10 hover:border-customer-accent/50 text-white hover:text-customer-accent rounded-full p-2.5 z-50 transition-all duration-300"
        >
          <X size={20} />
        </button>

        {/* Left: Premium Product Image */}
        <div className="w-full md:w-1/2 relative min-h-[220px] md:min-h-full">
          <img
            src={product.imageUrl}
            alt={product.productName}
            onError={(e) => {
              e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';
            }}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-customer-bg md:bg-gradient-to-r md:from-transparent md:to-customer-bg" />
          <div className="absolute inset-0 bg-black/25 md:hidden" /> {/* extra mobile overlay */}
          
          {/* Category Badge on Image */}
          <span className="absolute top-4 left-4 bg-customer-accent text-customer-bg text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
            {product.category}
          </span>
        </div>

        {/* Right: Product Details & Options */}
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between text-left">
          <div className="space-y-4">
            {/* Category tag */}
            <span className="text-customer-accent text-xs font-bold uppercase tracking-widest block">
              {product.category}
            </span>

            {/* Title */}
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
              {product.productName}
            </h2>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                <Star size={14} className="text-yellow-400 fill-yellow-400" />
                <span className="text-white font-medium">{rating}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-white/70">
                <Clock size={14} />
                <span>{prepTime}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 text-white/70">
                <Flame size={14} />
                <span>{calories}</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-white/75 text-sm md:text-base leading-relaxed font-sans pt-1">
              {product.description || 'Indulge in our carefully prepared specialty item, crafted with premium ingredients and curated to perfection.'}
            </p>
          </div>

          <div className="mt-8 space-y-6">
            {/* Quantity Selector & Price */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-white/40 uppercase tracking-widest mb-1.5">Total Price</p>
                <p className="text-3xl font-extrabold text-customer-accent">₹{totalPrice}</p>
              </div>

              {/* Quantity controls */}
              <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center text-base font-bold text-white">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(q => q + 1)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add Button */}
            <button
              onClick={handleAddToCart}
              className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-customer-accent text-customer-bg font-bold text-base rounded-2xl hover:shadow-[0_0_25px_rgba(212,163,115,0.5)] active:scale-[0.98] transition-all duration-300"
            >
              <ShoppingBag size={18} /> Add {quantity} to Cart · ₹{totalPrice}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
