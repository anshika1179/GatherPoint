import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

const categories = ['All', 'Coffee', 'Tea', 'Burgers', 'Pizza', 'Desserts', 'Pasta', 'Salads', 'Steaks', 'Appetizers', 'Smoothies'];

const CategoryTabs = ({ selectedCategory, onSelectCategory }) => {
  const tabsRef = useRef(null);

  useEffect(() => {
    gsap.fromTo(tabsRef.current.children,
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.05, ease: "back.out(1.5)", delay: 0.6 }
    );
  }, []);

  return (
    <div className="sticky top-0 z-40 bg-customer-bg/80 backdrop-blur-lg py-4 w-full z-40">
      <div 
        ref={tabsRef} 
        className="flex items-center lg:justify-center overflow-x-auto snap-x snap-mandatory no-scrollbar gap-3 md:gap-4 pb-2 lg:pb-0 w-full"
      >
        {categories.map(category => (
          <button
            key={category}
            onClick={() => onSelectCategory(category)}
            className={`snap-center shrink-0 px-6 py-2 md:px-8 md:py-3 rounded-full text-base md:text-lg font-semibold transition-all duration-300 whitespace-nowrap ${
              selectedCategory === category
                ? 'bg-customer-accent text-customer-bg shadow-[0_0_15px_rgba(212,163,115,0.4)]'
                : 'bg-white/5 text-customer-text/70 border border-white/10 hover:border-customer-accent hover:text-customer-accent hover:bg-white/10'
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryTabs;
