import React, { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Plus, Star, Clock, Flame } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const ProductCard = ({ product, onAdd }) => {
  const cardRef = useRef(null);
  const imageRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const nameDefaultRef = useRef(null);
  
  const tl = useRef(null);

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      // Scroll reveal
      gsap.fromTo(cardRef.current,
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: {
            trigger: cardRef.current,
            start: "top bottom-=100",
            toggleActions: "play none none none"
          }
        }
      );

      // Hover Timeline Setup
      tl.current = gsap.timeline({ paused: true })
        .to(imageRef.current, { scale: 1.1, duration: 0.5, ease: "power2.out" }, 0)
        .to(overlayRef.current, { opacity: 1, duration: 0.5, ease: "power2.out" }, 0)
        .to(nameDefaultRef.current, { opacity: 0, y: -20, duration: 0.3, ease: "power2.out" }, 0)
        .fromTo(contentRef.current, 
          { y: 50, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" },
          0.1
        );
    }, cardRef);
    
    return () => ctx.revert();
  }, []);

  const handleMouseEnter = () => tl.current?.play();
  const handleMouseLeave = () => tl.current?.reverse();

  // Fallbacks
  const rating = product.rating || '4.5';
  const prepTime = product.prepTime || '10 mins';
  const calories = product.calories || '320 kcal';

  return (
    <div 
      ref={cardRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-[24px] h-[30rem] overflow-hidden cursor-pointer border border-[rgba(212,163,115,0.2)] hover:border-[#D4A373] hover:shadow-[0_0_30px_rgba(45,106,79,0.3)] transition-colors duration-500"
    >
      {/* Background Image */}
      <div className="absolute inset-0 bg-customer-primary/20 flex items-center justify-center text-6xl">
        {product.imageUrl && product.imageUrl.length > 5 ? (
          <img ref={imageRef} src={product.imageUrl} alt={product.productName} className="w-full h-full object-cover" />
        ) : (
          <span ref={imageRef} className="drop-shadow-lg">{product.imageUrl || '☕'}</span>
        )}
      </div>

      {/* Dark Overlay (hidden by default) */}
      <div ref={overlayRef} className="absolute inset-0 bg-gradient-to-t from-customer-bg via-customer-bg/80 to-customer-bg/20 opacity-0 backdrop-blur-[2px]" />

      {/* Default Content (Only name) */}
      <div ref={nameDefaultRef} className="absolute inset-x-0 bottom-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="text-3xl font-bold text-customer-text font-sans drop-shadow-lg">{product.productName}</h3>
      </div>

      {/* Hover Content */}
      <div ref={contentRef} className="absolute inset-0 p-8 flex flex-col justify-end opacity-0 pointer-events-none">
        <div className="pointer-events-auto">
          <div className="mb-4">
            <span className="text-customer-accent text-sm font-bold uppercase tracking-widest">{product.category}</span>
            <h3 className="text-3xl font-bold text-customer-text font-sans mt-1 mb-3 leading-tight">{product.productName}</h3>
            
            <div className="flex items-center gap-1 bg-white/10 px-2 py-1 rounded w-max mb-4 backdrop-blur-md">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={14} className={i < Math.floor(rating) ? "text-yellow-400 fill-yellow-400" : "text-white/30"} />
              ))}
              <span className="text-sm font-bold text-white ml-1">{rating}</span>
            </div>
          </div>

          <p className="text-base text-customer-text/80 mb-6 line-clamp-3 leading-relaxed">{product.description}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <div className="text-xs text-customer-text/50 uppercase mb-1 flex items-center gap-1"><Clock size={12}/> Prep Time</div>
              <div className="font-semibold text-customer-text">{prepTime}</div>
            </div>
            <div>
              <div className="text-xs text-customer-text/50 uppercase mb-1 flex items-center gap-1"><Flame size={12}/> Calories</div>
              <div className="font-semibold text-customer-text">{calories}</div>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-white/20">
            <div className="flex flex-col">
              <span className="text-xs text-customer-text/50 uppercase">Price</span>
              <span className="text-3xl font-bold text-customer-accent font-sans">₹{product.price}</span>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAdd(product);
              }}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-customer-primary text-customer-text font-bold hover:bg-white hover:text-customer-bg transition-colors duration-300 shadow-[0_4px_15px_rgba(45,106,79,0.5)]"
            >
              <Plus size={20} />
              Add To Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
