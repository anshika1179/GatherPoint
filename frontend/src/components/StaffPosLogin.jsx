import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SignIn } from "@clerk/clerk-react";
import { gsap } from "gsap";
import { ChevronLeft } from "lucide-react";
import Logo from "./customer/Logo";

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

      {/* Clerk SignIn Card */}
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

        {/* Clerk Sign-In Component */}
        <div className="clerk-staff-login">
          <SignIn
            routing="virtual"
            signUpUrl="/login"
            forceRedirectUrl="/staff-pos"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-transparent shadow-none border-0 !bg-[rgba(8,15,10,0.88)] rounded-2xl overflow-hidden",
                cardBox: "shadow-none border border-[rgba(212,175,55,0.2)] rounded-2xl overflow-hidden",
                headerTitle: "text-[#D4AF37] font-bold",
                headerSubtitle: "text-white/50",
                socialButtonsBlockButton: "border-[rgba(212,175,55,0.2)] text-white/80 hover:bg-[rgba(212,175,55,0.1)] bg-[rgba(255,255,255,0.04)]",
                socialButtonsBlockButtonText: "text-white/80",
                dividerLine: "bg-[rgba(212,175,55,0.15)]",
                dividerText: "text-[rgba(212,175,55,0.5)]",
                formFieldLabel: "text-[rgba(212,175,55,0.6)]",
                formFieldInput: "bg-[rgba(255,255,255,0.04)] border-[rgba(212,175,55,0.15)] text-[#e2d5b0] focus:border-[rgba(212,175,55,0.5)] focus:ring-[rgba(212,175,55,0.2)]",
                formButtonPrimary: "bg-gradient-to-r from-[#D4AF37] to-[#b8943f] text-[#050505] font-bold hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]",
                footerActionLink: "text-[#D4AF37] hover:text-[#FFF2B2]",
                footerActionText: "text-white/40",
                identityPreviewText: "text-white/70",
                identityPreviewEditButton: "text-[#D4AF37]",
                formFieldAction: "text-[#D4AF37]",
                alertText: "text-red-400",
                footer: "!bg-transparent",
              },
              layout: {
                socialButtonsPlacement: "top",
              },
            }}
          />
        </div>

        {/* Footer note */}
        <p className="text-center text-[11px] mt-2" style={{ color: "rgba(255,255,255,0.2)" }}>
          This terminal is for authorised staff only.
        </p>
      </div>
    </div>
  );
}
