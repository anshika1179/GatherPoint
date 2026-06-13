// CategoryTabs is now rendered inline in CustomerOrder for precise sticky positioning.
// This file is kept as a standalone component for other uses.
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

const ALL_CATEGORIES = ['All','Coffee','Tea','Burgers','Pizza','Desserts','Pasta','Salads','Steaks','Appetizers','Smoothies'];

const CategoryTabs = ({ selectedCategory, onSelectCategory }) => {
  const tabsRef = useRef(null);

  useEffect(() => {
    if (tabsRef.current) {
      gsap.fromTo(
        tabsRef.current.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.04, ease: 'back.out(1.5)', delay: 0.3 }
      );
    }
  }, []);

  return (
    <div className="w-full bg-customer-bg/90 backdrop-blur-xl border-b border-white/10 py-3">
      <div
        ref={tabsRef}
        className="w-full flex items-center gap-3 overflow-x-auto no-scrollbar px-4 lg:px-8"
      >
        {ALL_CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`shrink-0 px-5 py-2 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-customer-accent text-customer-bg shadow-[0_0_12px_rgba(212,163,115,0.4)]'
                : 'bg-white/5 text-customer-text/60 border border-white/10 hover:border-customer-accent/50 hover:text-customer-accent'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
