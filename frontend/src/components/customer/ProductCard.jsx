import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ProductCard = ({ product, onAdd }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    // Scroll reveal
    const ctx = gsap.context(() => {
      gsap.fromTo(cardRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.6, ease: "power2.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top bottom-=50",
            toggleActions: "play none none none"
          }
        }
      );
    }, cardRef);
    
    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, { y: -8, scale: 1.02, duration: 0.3, ease: "power2.out" });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, { y: 0, scale: 1, duration: 0.3, ease: "power2.out" });
  };

  return (
    <div 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-2xl h-64 overflow-hidden group cursor-pointer border border-white/10 hover:border-customer-accent/50 hover:shadow-[0_0_20px_rgba(212,163,115,0.2)] transition-all duration-300"
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-customer-primary/10 flex items-center justify-center text-6xl">
        {product.imageUrl && product.imageUrl.length > 5 && product.imageUrl.startsWith('http') ? (
          <img src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        ) : (
          <span className="drop-shadow-lg transition-transform duration-700 group-hover:scale-110">{product.imageUrl || '☕'}</span>
        )}
      </div>

      {/* Dark Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-80 group-hover:opacity-95 transition-opacity duration-300" />

      {/* Content Container */}
      <div className="absolute inset-0 flex flex-col justify-end p-5">
        {/* Title (Always visible) */}
        <h3 className="text-xl font-bold text-customer-text font-sans transform transition-transform duration-300 group-hover:-translate-y-1">{product.productName}</h3>
        
        {/* Hidden Details that appear on hover */}
        <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-300 ease-out">
          <div className="overflow-hidden">
            <p className="text-sm text-customer-text/80 mb-3 mt-1 line-clamp-2">{product.description}</p>
            
            <div className="flex items-center justify-between pt-3 border-t border-white/20">
              <span className="text-2xl font-bold text-customer-accent font-sans">₹{product.price}</span>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAdd(product);
                }}
                className="w-10 h-10 rounded-full bg-customer-primary flex items-center justify-center text-customer-text hover:bg-customer-accent hover:text-customer-bg transition-colors duration-300 hover:scale-110"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
