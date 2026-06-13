import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

const HeroSection = ({ onBrowseClick }) => {
  const leftContentRef = useRef(null);
  const rightContentRef = useRef(null);
  const floatingElementsRef = useRef(null);
  
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "Gather Point";

  useEffect(() => {
    // Typing Effect
    let i = 0;
    const typingInterval = setInterval(() => {
      setDisplayedText(fullText.slice(0, i + 1));
      i++;
      if (i > fullText.length) clearInterval(typingInterval);
    }, 150);

    return () => clearInterval(typingInterval);
  }, []);

  useEffect(() => {
    // Fade in left content
    gsap.fromTo(leftContentRef.current.children, 
      { x: -50, opacity: 0 },
      { x: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out", delay: 0.2 }
    );

    // Fade in and slide up right image
    gsap.fromTo(rightContentRef.current,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out", delay: 0.4 }
    );

    // Floating animation for decorative elements
    const floaters = floatingElementsRef.current.children;
    Array.from(floaters).forEach((el, index) => {
      gsap.to(el, {
        y: index % 2 === 0 ? -20 : 20,
        x: index % 2 === 0 ? 10 : -10,
        rotation: index % 2 === 0 ? 15 : -15,
        duration: 3 + index,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
    });
  }, []);

  return (
    <div className="relative w-full min-h-[90vh] bg-customer-bg flex items-center justify-center overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 py-20 w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        
        {/* Left Content */}
        <div ref={leftContentRef} className="flex flex-col items-start z-10">
          <h1 className="text-6xl md:text-8xl font-calligraphy text-customer-accent mb-6 leading-tight min-h-[1.2em]">
            <span className="border-r-4 border-customer-accent pr-1 animate-pulse">{displayedText}</span>
          </h1>
          <button 
            onClick={onBrowseClick}
            className="px-8 py-4 bg-customer-primary text-customer-text font-bold text-lg rounded-full hover:bg-customer-accent hover:text-customer-bg transition-colors duration-300 shadow-[0_4px_20px_rgba(45,106,79,0.4)] hover:shadow-[0_4px_25px_rgba(212,163,115,0.5)] my-4"
          >
            Browse Menu
          </button>
          <p className="text-xl md:text-2xl text-customer-text/80 mt-6 max-w-lg font-light leading-relaxed">
            Connecting tables, people and experience.
          </p>
        </div>

        {/* Right Content */}
        <div className="relative hidden lg:flex items-center justify-center z-10">
          <div ref={rightContentRef} className="relative w-full max-w-md aspect-square rounded-full border-4 border-customer-accent/20 p-4 overflow-hidden shadow-[0_0_50px_rgba(45,106,79,0.2)]">
            <img 
              src="https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop" 
              alt="Premium Coffee" 
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          
          {/* Floating Decorative Elements */}
          <div ref={floatingElementsRef} className="absolute inset-0 pointer-events-none">
            {/* Coffee Bean 1 */}
            <div className="absolute top-10 right-10 w-16 h-16 bg-customer-primary/30 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 shadow-lg text-3xl">☕</div>
            {/* Leaf 1 */}
            <div className="absolute bottom-20 left-0 w-20 h-20 bg-customer-accent/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg text-4xl">🌿</div>
            {/* Star/Sparkle */}
            <div className="absolute top-1/2 -right-8 w-14 h-14 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10 shadow-lg text-2xl">✨</div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default HeroSection;
