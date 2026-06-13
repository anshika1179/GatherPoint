import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import confetti from 'canvas-confetti';
import { CheckCircle, Clock } from 'lucide-react';

const OrderSuccess = ({ orderId, onTrackOrder }) => {
  const containerRef = useRef(null);
  const checkRef = useRef(null);

  useEffect(() => {
    // Confetti explosion
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#2D6A4F', '#D4A373', '#FAF8F1']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#2D6A4F', '#D4A373', '#FAF8F1']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();

    // GSAP animations
    gsap.fromTo(containerRef.current.children,
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.2, ease: "back.out(1.5)", delay: 0.2 }
    );

    gsap.fromTo(checkRef.current,
      { scale: 0, rotation: -180 },
      { scale: 1, rotation: 0, duration: 1, ease: "elastic.out(1, 0.5)" }
    );
  }, []);

  return (
    <div className="fixed inset-0 bg-customer-bg z-[200] flex items-center justify-center p-4">
      <div ref={containerRef} className="flex flex-col items-center text-center max-w-md w-full">
        <div 
          ref={checkRef}
          className="w-32 h-32 bg-customer-primary/20 rounded-full flex items-center justify-center mb-8 border border-customer-accent/30 shadow-[0_0_30px_rgba(212,163,115,0.3)]"
        >
          <CheckCircle size={64} className="text-customer-accent" />
        </div>
        
        <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-customer-text mb-4">
          Order Confirmed
        </h1>
        
        <p className="text-lg text-customer-text/80 mb-8 font-sans">
          Your order <span className="font-bold text-customer-accent">{orderId}</span> has been received and is being prepared with care.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full mb-8 flex items-center justify-center gap-4">
          <Clock size={28} className="text-customer-accent" />
          <div className="text-left">
            <div className="text-sm text-customer-text/70">Estimated Time</div>
            <div className="text-xl font-bold text-customer-text font-sans">15 - 20 Minutes</div>
          </div>
        </div>

        <button 
          onClick={onTrackOrder}
          className="w-full py-4 bg-customer-primary text-customer-text font-bold rounded-xl hover:bg-customer-accent hover:text-customer-bg transition-colors shadow-lg shadow-customer-primary/20"
        >
          Track Order
        </button>
      </div>
    </div>
  );
};

export default OrderSuccess;
