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
      className="h-full flex flex-col items-center justify-center gap-6 bg-[#0A261C]/70 backdrop-blur-xl border border-[#D4A373]/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] rounded-[28px] p-8 hover:border-[#D4A373]/50 hover:bg-[#0A261C]/80 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_25px_0_rgba(212,163,115,0.2)] group relative overflow-hidden"
    >
      {/* Percentage Indicator Badge */}
      <div className={`absolute top-6 right-6 flex items-center gap-1 text-[13px] font-bold px-3 py-1.5 rounded-full shadow-sm ${
        isPositive ? 'bg-green-500/15 text-green-400 border border-green-500/20' : 'bg-red-500/15 text-red-400 border border-red-500/20'
      }`}>
        {isPositive ? <TrendingUp size={14} strokeWidth={3} /> : <TrendingDown size={14} strokeWidth={3} />}
        {trendValue}
      </div>

      {/* Icon Area */}
      <div className="h-[68px] w-[68px] mt-2 rounded-[20px] bg-[#2D6A4F]/20 flex items-center justify-center text-[#D4A373] group-hover:scale-110 group-hover:bg-[#2D6A4F]/30 transition-all duration-300">
        <Icon size={32} strokeWidth={2} />
      </div>
      
      {/* Content Area */}
      <div className="text-center flex flex-col items-center">
        <h3 className="text-gray-400 font-semibold text-[13px] mb-2 tracking-widest uppercase">{title}</h3>
        <div className="text-4xl font-bold text-[#FAF8F1] flex items-baseline justify-center gap-1 tracking-tight">
          <span className="text-[#D4A373] text-3xl">{prefix}</span>
          <span ref={numberRef}>0</span>
          <span className="text-gray-400 text-lg ml-1">{suffix}</span>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
