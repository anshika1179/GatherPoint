import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronRight } from 'lucide-react';

export default function LandingPage({ onEnter }) {
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [progress, setProgress] = useState(0);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const enterBtnRef = useRef(null);

  // Background Particle System (Canvas)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 1.5 + 0.5;
        this.speedY = Math.random() * 0.4 + 0.15;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.4 + 0.1;
        this.pulseSpeed = Math.random() * 0.015 + 0.005;
        this.pulseDir = 1;
      }

      update() {
        this.y -= this.speedY;
        this.x += this.speedX;

        this.opacity += this.pulseSpeed * this.pulseDir;
        if (this.opacity > 0.7) this.pulseDir = -1;
        if (this.opacity < 0.1) this.pulseDir = 1;

        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
          this.reset();
        }
      }

      draw() {
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#D4AF37';
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const particles = Array.from({ length: 60 }, () => new Particle());

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach((p) => {
        p.update();
        p.draw();
      });
      animationFrameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // GSAP Loading simulation
  useEffect(() => {
    // Initial states
    gsap.set(overlayRef.current, { opacity: 0 });
    gsap.set(enterBtnRef.current, { opacity: 0, scale: 0.9, y: 10 });

    const tl = gsap.timeline();
    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
    });

    // Reveal button independently
    gsap.to(enterBtnRef.current, {
      opacity: 1, 
      scale: 1, 
      y: 0, 
      duration: 1.2, 
      ease: 'back.out(1.5)',
      delay: 0.8
    });

    const loaderObj = { val: 0 };
    gsap.to(loaderObj, {
      val: 100,
      duration: 4.0,
      ease: 'power1.inOut',
      onUpdate: () => {
        setProgress(Math.floor(loaderObj.val));
      },
      onComplete: () => {
        setLoadingComplete(true);
        // Loader remains visible alongside the button
      }
    });
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden flex flex-col justify-center items-center select-none"
      style={{ 
        backgroundImage: 'url(/landing-bg.jpg)',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundSize: 'cover',
        backgroundColor: '#020403'
      }}
    >
      {/* Interactive Floating Gold Particles Layer */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Main Interactive Content Overlays */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-center">
        
        {/* Mask to cover the static mockup "ENTER TERMINAL" button in the center of the table */}
        <div className="absolute top-[55%] md:top-[60%] w-[180px] md:w-[220px] h-[36px] md:h-[44px] bg-[#0c1510] rounded-full blur-[2px] pointer-events-none" />

        {/* Container positioned exactly over the mockup loading text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 mt-[180px] md:mt-[240px] flex flex-col items-center justify-center z-30">
          
          {/* Real interactive "ENTER SYSTEM" button designed to hide the mockup text beneath */}
          <button
            ref={enterBtnRef}
            onClick={onEnter}
            className="flex items-center justify-center gap-4 w-[310px] md:w-[430px] py-[18px] md:py-[22px] rounded-full bg-[#080d0a]/95 backdrop-blur-md border border-[#D4AF37]/80 text-[#D4AF37] font-cinzel text-[14px] md:text-[16px] tracking-[0.25em] font-bold uppercase hover:bg-[#D4AF37] hover:text-[#050505] shadow-[0_0_30px_rgba(212,175,55,0.25)] hover:shadow-[0_0_50px_rgba(212,175,55,0.6)] transition-all duration-500 transform hover:scale-105 active:scale-95 group cursor-pointer"
          >
            ENTER TERMINAL
            <ChevronRight size={20} className="transform group-hover:translate-x-2 transition-transform duration-300" />
          </button>

          {/* Real Loading bar placed directly below the button */}
          <div ref={overlayRef} className="absolute top-[100%] mt-8 md:mt-12 flex flex-col items-center justify-center w-[260px] md:w-[360px]">
            <div className="w-full h-[2px] bg-[#D4AF37]/15 rounded-full overflow-hidden relative mb-4">
              <div 
                className="h-full bg-gradient-to-r from-[#8A6623] via-[#D4AF37] to-[#FFF2B2] shadow-[0_0_8px_#D4AF37] transition-all duration-100 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="font-cinzel text-[11px] md:text-[12px] tracking-[0.35em] text-[#D4AF37]/90 uppercase animate-pulse">
              LOADING {progress}%
            </span>
          </div>

        </div>

      </div>
    </div>
  );
}
