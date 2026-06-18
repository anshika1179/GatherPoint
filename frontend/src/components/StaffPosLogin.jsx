import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ChevronLeft } from "lucide-react";
import Logo from "./customer/Logo";

import { GOOGLE_OAUTH_URL } from '../config';

export default function StaffPosLogin() {
  const navigate = useNavigate();

  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);

  // Particle background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * canvas.width;
        this.y = canvas.height + Math.random() * 100;
        this.size = Math.random() * 1.5 + 0.3;
        this.speedY = Math.random() * 0.5 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.35 + 0.05;
        this.pulse = Math.random() * 0.012 + 0.004;
        this.dir = 1;
      }
      update() {
        this.y -= this.speedY;
        this.x += this.speedX;
        this.opacity += this.pulse * this.dir;
        if (this.opacity > 0.6) this.dir = -1;
        if (this.opacity < 0.05) this.dir = 1;
        if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212, 175, 55, ${this.opacity})`;
        ctx.shadowBlur = 10;
        ctx.shadowColor = "#D4AF37";
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    const particles = Array.from({ length: 70 }, () => new Particle());
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId); };
  }, []);

  // GSAP entrance
  useEffect(() => {
    if (wrapperRef.current) {
      gsap.fromTo(
        wrapperRef.current,
        { opacity: 0, y: 40, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: "power3.out" }
      );
    }
  }, []);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 60% 40%, #0d1f15 0%, #020403 70%)" }}
    >
      {/* Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />

      {/* Decorative rings */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0"
        style={{ width: 600, height: 600, border: "1px solid rgba(212,175,55,0.07)" }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0"
        style={{ width: 900, height: 900, border: "1px solid rgba(212,175,55,0.04)" }}
      />

      {/* Back button */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-[#D4AF37]/60 hover:text-[#D4AF37] text-xs tracking-[0.15em] uppercase font-semibold transition-colors duration-300 cursor-pointer"
      >
        <ChevronLeft size={16} /> Back
      </button>

      {/* Login Card */}
      <div ref={wrapperRef} className="relative z-10 flex flex-col items-center gap-6">
        {/* Header */}
        <div className="flex flex-col items-center gap-3 mb-2">
          <div
            className="p-3 rounded-full"
            style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}
          >
            <Logo className="w-10 h-10" />
          </div>
          <div className="text-center">
            <div
              className="text-[10px] tracking-[0.4em] uppercase mb-1"
              style={{ color: "rgba(212,175,55,0.6)" }}
            >
              GatherPoint
            </div>
            <h1
              className="text-2xl font-bold tracking-[0.15em] uppercase"
              style={{
                fontFamily: "'Cinzel', serif",
                background: "linear-gradient(135deg, #FFF2B2, #D4AF37, #8A6623)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Admin Login
            </h1>
            <p className="text-xs text-white/40 mt-1 tracking-wide">
              Sign in to access the admin panel
            </p>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="w-full max-w-sm flex flex-col gap-4">
          <a
            href={GOOGLE_OAUTH_URL}
            className="flex items-center justify-center gap-3 px-6 py-3.5 rounded-xl border border-[rgba(212,175,55,0.2)] bg-[rgba(255,255,255,0.04)] hover:bg-[rgba(212,175,55,0.1)] text-white/80 hover:text-white transition-all duration-300 font-medium cursor-pointer no-underline"
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Sign in with Google
          </a>
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
          This terminal is for authorised staff only.
        </p>
      </div>
    </div>
  );
}
