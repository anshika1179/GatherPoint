import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { TrendingUp, TrendingDown } from 'lucide-react';

const StatsCard = ({ title, value, icon: Icon, trend, trendValue, prefix = '', suffix = '', delay = 0 }) => {
  const cardRef = useRef(null);
  const numberRef = useRef(null);

  useEffect(() => {
    // Count Up Animation
    const obj = { val: 0 };
    gsap.to(obj, {
      val: value,
      duration: 1.5,
      delay: delay + 0.2,
      ease: 'power3.out',
      onUpdate: () => {
        if (numberRef.current) {
          numberRef.current.innerText = Math.floor(obj.val).toLocaleString('en-IN');
        }
      }
    });
  }, [value, delay]);

  const isPositive = trend === 'up';

  return (
    <div 
      ref={cardRef}
      className="h-full flex flex-col items-center justify-center gap-6 bg-gray-900/50 backdrop-blur-md border border-gray-800 shadow-xl shadow-[#D4AF37]/5 rounded-[28px] p-8 hover:border-[#D4AF37]/50 hover:bg-gray-800/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg group relative overflow-hidden"
    >
      {/* Percentage Indicator Badge */}
      <div className={`absolute top-6 right-6 flex items-center gap-1 text-[13px] font-bold px-3 py-1.5 rounded-full shadow-sm ${
        isPositive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'
      }`}>
        {isPositive ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
        {trendValue}
      </div>

      {/* Icon Area */}
      <div className="h-[68px] w-[68px] mt-2 rounded-[20px] bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37] group-hover:scale-110 group-hover:bg-[#D4AF37]/20 transition-all duration-300">
        <Icon size={32} strokeWidth={2} />
      </div>
      
      {/* Content Area */}
      <div className="text-center flex flex-col items-center">
        <h3 className="text-gray-400 font-semibold text-[13px] mb-2 tracking-widest uppercase">{title}</h3>
        <div className="text-4xl font-extrabold text-white flex items-baseline justify-center gap-1 tracking-tight">
          <span className="text-[#D4AF37] text-3xl">{prefix}</span>
          <span ref={numberRef}>0</span>
          <span className="text-gray-400 text-lg ml-1">{suffix}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
