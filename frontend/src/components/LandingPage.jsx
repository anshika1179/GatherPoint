import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ChevronRight, Shield, User, Menu, X } from 'lucide-react';
import Logo from './customer/Logo';

export default function LandingPage({ onEnter }) {
  const navigate = useNavigate();
  const [loadingComplete, setLoadingComplete] = useState(false);
  const [progress, setProgress] = useState(0);
  const [navOpen, setNavOpen] = useState(false);

  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const overlayRef = useRef(null);
  const buttonsRef = useRef(null);
  const navbarRef = useRef(null);

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
        // LandingPage component for the animated entrance screen
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
    gsap.set(buttonsRef.current, { opacity: 0, scale: 0.9, y: 10 });

    const tl = gsap.timeline();
    tl.to(overlayRef.current, {
      opacity: 1,
      duration: 1.5,
      ease: 'power2.out',
    });

    const loaderObj = { val: 0 };
    gsap.to(loaderObj, {
      val: 100,
      duration: 2.5,
      ease: 'power1.inOut',
      onUpdate: () => {
        setProgress(Math.floor(loaderObj.val));
      },
      onComplete: () => {
        setLoadingComplete(true);
        // Reveal buttons when load finishes
        gsap.to(buttonsRef.current, {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.0,
          ease: 'back.out(1.2)',
        });
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
      {/* Premium Navbar */}
      <nav ref={navbarRef} className="fixed top-0 left-0 right-0 z-50 px-6 md:px-12 py-4 flex items-center justify-between" style={{ background: 'rgba(2, 4, 3, 0.75)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(207, 173, 86, 0.12)' }}>
        <div className="flex items-center gap-3">
          <Logo className="w-10 h-10" />
          <span className="font-cinzel text-lg tracking-[0.15em] text-[#D4AF37] font-bold" style={{ fontFamily: "'Great Vibes', cursive", fontSize: '1.5rem' }}>GatherPoint</span>
        </div>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          <a href="#" className="text-[#D4AF37] text-xs tracking-[0.15em] uppercase font-semibold hover:text-[#FFF2B2] transition-colors">Home</a>
          <a href="/customer-order" className="text-white/60 text-xs tracking-[0.15em] uppercase font-semibold hover:text-white transition-colors">Menu</a>
          <a href="#" className="text-white/60 text-xs tracking-[0.15em] uppercase font-semibold hover:text-white transition-colors">Book a Table</a>
          <button onClick={onEnter} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4AF37] text-[#020403] text-xs tracking-[0.12em] font-bold uppercase hover:bg-[#FFF2B2] transition-all duration-300 shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]">
            <Shield size={14} /> Staff Login
          </button>
          <button onClick={() => navigate('/customer-order')} className="flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] text-xs tracking-[0.12em] font-bold uppercase hover:bg-[#D4AF37]/10 transition-all duration-300">
            <User size={14} /> Customer
          </button>
        </div>

        {/* Mobile Hamburger */}
        <button className="md:hidden text-white/70 hover:text-[#D4AF37] transition-colors" onClick={() => setNavOpen(!navOpen)}>
          {navOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu */}
        {navOpen && (
          <div className="absolute top-full left-0 right-0 p-6 flex flex-col gap-4" style={{ background: 'rgba(2, 4, 3, 0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(207, 173, 86, 0.12)' }}>
            <a href="#" className="text-[#D4AF37] text-sm tracking-[0.15em] uppercase font-semibold">Home</a>
            <a href="/customer-order" className="text-white/60 text-sm tracking-[0.15em] uppercase font-semibold">Menu</a>
            <a href="#" className="text-white/60 text-sm tracking-[0.15em] uppercase font-semibold">Book a Table</a>
            <div className="flex flex-col gap-3 mt-2 pt-4 border-t border-[#D4AF37]/10">
              <button onClick={onEnter} className="flex items-center justify-center gap-2 py-3 rounded-full bg-[#D4AF37] text-[#020403] text-xs tracking-[0.12em] font-bold uppercase">
                <Shield size={14} /> Staff Login
              </button>
              <button onClick={() => navigate('/customer-order')} className="flex items-center justify-center gap-2 py-3 rounded-full border border-[#D4AF37]/40 text-[#D4AF37] text-xs tracking-[0.12em] font-bold uppercase">
                <User size={14} /> Customer Order
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Interactive Floating Gold Particles Layer */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none z-10"
      />

      {/* Main Content Overlays */}
      <div className="relative z-20 flex flex-col items-center justify-center w-full h-full text-center">
        
        {/* Title / Brand Header */}
        <div className="absolute top-[20%] flex flex-col items-center gap-2">
          <h1 className="font-cinzel text-5xl md:text-7xl font-bold tracking-[0.2em] text-gradient bg-gradient-to-b from-[#FFF2B2] via-[#D4AF37] to-[#8A6623] bg-clip-text text-transparent drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]">
            GATHERPOINT
          </h1>
          <p className="font-cinzel text-[10px] md:text-[12px] tracking-[0.5em] text-[#D4AF37]/70 uppercase">
            Premium Dining Management System
          </p>
        </div>

        <div className="absolute top-[71%] md:top-[74%] left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-8 z-30 w-full max-w-lg px-6">
          
          {/* Dual Login Buttons - revealed after load */}
          <div 
            ref={buttonsRef}
            className={`flex flex-col sm:flex-row gap-[13px] w-full justify-center ${!loadingComplete ? 'pointer-events-none' : ''}`}
          >
            <button
              onClick={onEnter}
              className="flex items-center justify-center gap-3 w-full sm:w-[190px] py-[104px] rounded-full bg-[#080d0a]/95 backdrop-blur-md border border-[#D4AF37]/80 text-[#D4AF37] font-cinzel text-[12px] tracking-[0.2em] font-bold uppercase hover:bg-[#D4AF37] hover:text-[#050505] shadow-[0_0_20px_rgba(212,175,55,0.25)] hover:shadow-[0_0_40px_rgba(212,175,55,0.5)] transition-all duration-500 transform hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <Shield size={16} />
              STAFF POS
              <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </button>

            <button
              onClick={() => navigate('/customer-order')}
              className="flex items-center justify-center gap-3 w-full sm:w-[190px] py-[104px] rounded-full bg-[#080d0a]/95 backdrop-blur-md border border-[#D4AF37]/40 text-[#D4AF37]/80 font-cinzel text-[12px] tracking-[0.2em] font-bold uppercase hover:bg-[#D4AF37]/20 hover:text-[#FFF] hover:border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)] hover:shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-500 transform hover:scale-105 active:scale-95 group cursor-pointer"
            >
              <User size={16} />
              CUSTOMER
              <ChevronRight size={16} className="transform group-hover:translate-x-1 transition-transform duration-300" />
            </button>
          </div>

          {/* Loading bar */}
          {!loadingComplete && (
            <div ref={overlayRef} className="flex flex-col items-center justify-center w-[260px] md:w-[360px]">
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
          )}

        </div>
      </div>
    </div>
  );
}