import { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Plus, Star, Clock, Flame } from 'lucide-react';

const ProductCard = ({ product, onAdd }) => {
  const cardRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const nameRef = useRef(null);

  const handleMouseEnter = () => {
    gsap.to(overlayRef.current, { opacity: 1, duration: 0.35, ease: 'power2.out' });
    gsap.to(nameRef.current, { opacity: 0, y: -12, duration: 0.25 });
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }
    );
  };

  const handleMouseLeave = () => {
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.3 });
    gsap.to(nameRef.current, { opacity: 1, y: 0, duration: 0.3 });
    gsap.to(contentRef.current, { opacity: 0, y: 16, duration: 0.25 });
  };

  const rating = product.rating || '4.5';
  const prepTime = product.prepTime || '10 mins';
  const calories = product.calories || '300 kcal';

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative mx-auto w-[94%] max-w-[320px] rounded-2xl h-[23rem] overflow-hidden cursor-pointer border border-white/10 hover:border-customer-accent/60 transition-colors duration-500 bg-black/30"
    >
      {/* Background Image */}
      <motion.img
        src={product.imageUrl}
        alt={product.productName}
        onError={(e) => {
          e.currentTarget.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=600&auto=format&fit=crop';
        }}
        whileHover={{ scale: 1.08 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Always-on bottom gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Hover overlay */}
      <div
        ref={overlayRef}
        className="absolute inset-0 bg-gradient-to-t from-customer-bg via-customer-bg/85 to-customer-bg/30 opacity-0"
      />

      {/* Category badge */}
      <motion.span
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="absolute top-4 left-4 bg-customer-accent/90 text-customer-bg text-[11px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider whitespace-nowrap"
      >
        {product.category}
      </motion.span>

      {/* Default name */}
      <div ref={nameRef} className="absolute inset-x-0 bottom-6 px-8 pb-4 pt-4 text-center flex flex-col items-center">
        <h3 className="text-2xl font-bold text-white drop-shadow-lg">{product.productName}</h3>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Star size={13} className="text-yellow-400 fill-yellow-400" />
          <span className="text-white/80 text-sm font-semibold">{rating}</span>
          <span className="text-white/40 text-xs ml-1">· ₹{product.price}</span>
        </div>
      </div>

      {/* Hover content */}
      <div ref={contentRef} className="absolute inset-x-0 top-0 bottom-6 flex flex-col justify-end items-center text-center px-8 pt-4 pb-4 opacity-0">
        <span className="text-customer-accent text-xs font-bold uppercase tracking-widest mb-1">{product.category}</span>
        <h3 className="text-[1.35rem] font-bold text-white mb-1 leading-tight">{product.productName}</h3>

        {/* Stars */}
        <div className="flex items-center justify-center gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={12} className={i < Math.floor(parseFloat(rating)) ? 'text-yellow-400 fill-yellow-400' : 'text-white/20'} />
          ))}
          <span className="text-white/70 text-xs ml-1">{rating}</span>
        </div>

        <p className="text-white/70 text-sm leading-relaxed mb-3 line-clamp-2">{product.description}</p>

        {/* Meta */}
        <div className="flex justify-center gap-4 mb-3">
          <div className="flex items-center gap-1 text-white/60 text-xs">
            <Clock size={12} /><span>{prepTime}</span>
          </div>
          <div className="flex items-center gap-1 text-white/60 text-xs">
            <Flame size={12} /><span>{calories}</span>
          </div>
        </div>

        {/* Price */}
        <div className="mb-2">
          <p className="text-xs text-white/40 uppercase tracking-wider mb-0.5">Price</p>
          <p className="text-2xl font-bold text-customer-accent">₹{product.price}</p>
        </div>

        {/* Add To Cart Button */}
        <div className="flex justify-center w-full mt-1 mb-1">
          <motion.button
            whileTap={{ scale: 0.92 }}
            whileHover={{ scale: 1.05 }}
            onClick={(e) => { e.stopPropagation(); onAdd(product); }}
            className="flex items-center justify-center w-[75%] gap-2 px-4 py-3 bg-customer-accent text-customer-bg font-bold rounded-xl hover:shadow-[0_0_20px_rgba(212,163,115,0.6)] transition-shadow whitespace-nowrap"
          >
            <Plus size={18} /> Add To Cart
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
