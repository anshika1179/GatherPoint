import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { gsap } from "gsap";
import { ChevronLeft, Shield, UtensilsCrossed, ChefHat, ChevronRight } from "lucide-react";
import Logo from "./customer/Logo";
import useAuth from "../hooks/useAuth";

const ROLES = [
  {
    key: "ADMIN",
    label: "Admin",
    subtitle: "Full system access & management",
    icon: Shield,
    color: "#D4AF37",
    glow: "rgba(212,175,55,0.35)",
    bg: "rgba(212,175,55,0.08)",
    border: "rgba(212,175,55,0.35)",
  },
  {
    key: "EMPLOYEE",
    label: "Employee",
    subtitle: "POS, Orders & Customers",
    icon: UtensilsCrossed,
    color: "#4ade80",
    glow: "rgba(74,222,128,0.35)",
    bg: "rgba(74,222,128,0.07)",
    border: "rgba(74,222,128,0.3)",
  },
  {
    key: "KITCHEN_STAFF",
    label: "Kitchen Staff",
    subtitle: "Kitchen Display & Tickets",
    icon: ChefHat,
    color: "#fb923c",
    glow: "rgba(251,146,60,0.35)",
    bg: "rgba(251,146,60,0.07)",
    border: "rgba(251,146,60,0.3)",
  },
];

export default function StaffPosLogin() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { signIn, isLoaded: signInLoaded, setActive: setSignInActive } = useSignIn();
  const { signUp, isLoaded: signUpLoaded, setActive: setSignUpActive } = useSignUp();
  const isLoaded = signInLoaded && signUpLoaded;

  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [mode, setMode] = useState('signin');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  const wrapperRef = useRef(null);
  const canvasRef = useRef(null);
  const rolesRef = useRef(null);
  const loginRef = useRef(null);

  // Removed auto-redirect. Users explicitly click 'Go to Dashboard' or 'Sign Out'.

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
        { opacity: 0, y: 60, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 1.2, ease: "power4.out" }
      );
      // Floating effect
      gsap.to(wrapperRef.current, {
        y: -10,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: 1.2
      });
    }
  }, []);

  // Resend OTP timer cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // GSAP animations for entering elements when selectedRole changes
  useEffect(() => {
    if (selectedRole) {
      if (loginRef.current) {
        gsap.fromTo(loginRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }
        );
      }
    } else {
      if (rolesRef.current) {
        gsap.fromTo(rolesRef.current,
          { opacity: 0, y: -20 },
          { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" }
        );
      }
    }
  }, [selectedRole]);

  // Animate role → login transition
  const handleSelectRole = (role) => {
    setSelectedRole(role);
    localStorage.setItem('selected_role', role); // Store for syncAuth
    setErrorMsg('');
    setEmail('');
    setOtpCode('');
    setOtpSent(false);
    setMode('signin');
  };

  const handleBack = () => {
    if (loginRef.current) {
      gsap.to(loginRef.current, { opacity: 0, y: 20, duration: 0.3, ease: "power2.in", onComplete: () => {
        setSelectedRole(null);
        localStorage.removeItem('selected_role');
        setErrorMsg('');
        setEmail('');
        setOtpCode('');
        setOtpSent(false);
        setMode('signin');
      }});
    } else {
      setSelectedRole(null);
      localStorage.removeItem('selected_role');
      setErrorMsg('');
      setEmail('');
      setOtpCode('');
      setOtpSent(false);
      setMode('signin');
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setErrorMsg('');
    setVerifying(true);

    try {
      // 1. Try signing in first
      await signIn.create({
        identifier: email,
        strategy: "email_code",
      });
      setMode('signin');
      setOtpSent(true);
      setResendCooldown(60);
    } catch (err) {
      const isUserNotFound = err.errors?.some(e => e.code === "form_identifier_not_found");
      if (isUserNotFound) {
        // 2. User not found, attempt to sign up instead
        try {
          await signUp.create({
            emailAddress: email,
          });
          await signUp.prepareEmailAddressVerification({
            strategy: "email_code",
          });
          setMode('signup');
          setOtpSent(true);
          setResendCooldown(60);
        } catch (signUpErr) {
          setErrorMsg(signUpErr.errors?.[0]?.message || signUpErr.message || "Failed to send OTP for registration.");
        }
      } else {
        setErrorMsg(err.errors?.[0]?.message || err.message || "Failed to send OTP.");
      }
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!isLoaded || resendCooldown > 0) return;
    setErrorMsg('');
    try {
      if (mode === 'signin') {
        await signIn.create({
          identifier: email,
          strategy: "email_code",
        });
      } else {
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });
      }
      setResendCooldown(60);
    } catch (err) {
      setErrorMsg(err.errors?.[0]?.message || err.message || "Failed to resend OTP.");
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    setErrorMsg('');
    setVerifying(true);

    try {
      if (mode === 'signin') {
        const result = await signIn.attemptFirstFactor({
          strategy: "email_code",
          code: otpCode,
        });

        if (result.status === "complete") {
          await setSignInActive({ session: result.createdSessionId });
        } else {
          setErrorMsg("Verification incomplete. Please try again.");
        }
      } else {
        const result = await signUp.attemptEmailAddressVerification({
          code: otpCode,
        });

        if (result.status === "complete") {
          await setSignUpActive({ session: result.createdSessionId });
        } else {
          setErrorMsg("Verification incomplete. Please try again.");
        }
      }
    } catch (err) {
      setErrorMsg(err.errors?.[0]?.message || err.message || "Invalid OTP code. Please try again.");
    } finally {
      setVerifying(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (!isLoaded) return;
    setErrorMsg('');
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/staff-pos',
        redirectUrlComplete: '/staff-pos',
      });
    } catch (err) {
      setErrorMsg(err.errors?.[0]?.message || err.message || 'Google authentication failed.');
    }
  };

  const activeRole = ROLES.find(r => r.key === selectedRole);

  return (
    <div
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Blurred Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center"
        style={{ 
          backgroundImage: 'url(/assets/cafe-bg.png)', 
          filter: 'blur(10px)', 
          transform: 'scale(1.1)' // Prevent blurred edges from showing white
        }} 
      />
      {/* Dark Overlay for Readability */}
      <div className="absolute inset-0 z-0 bg-[#020403]/75" />

      {/* Animated Glowing Mesh behind card */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-tr from-[#D4AF37]/10 to-[#0a261c]/20 rounded-full blur-[120px] animate-pulse pointer-events-none z-0" />
      <div className="absolute left-1/3 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#06142e]/20 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Particles */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0 opacity-80" />

      {/* Decorative rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0"
        style={{ width: 600, height: 600, border: "1px solid rgba(212,175,55,0.08)" }} />
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-0"
        style={{ width: 900, height: 900, border: "1px solid rgba(212,175,55,0.05)" }} />

      {/* Back to Home */}
      <button
        onClick={() => navigate("/")}
        className="fixed top-6 left-6 z-20 flex items-center gap-2 text-[#D4AF37]/80 hover:text-[#D4AF37] text-xs tracking-[0.15em] uppercase font-bold transition-colors duration-300 cursor-pointer bg-[#020403]/40 px-5 py-2.5 rounded-full backdrop-blur-md border border-[#D4AF37]/20 hover:border-[#D4AF37]/50 shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
      >
        <ChevronLeft size={16} /> Back
      </button>

      {/* Main wrapper */}
      <div ref={wrapperRef} className="relative z-10 flex flex-col items-center w-full max-w-[680px] px-[36px] pt-[40px] pb-[40px] mx-4 bg-gradient-to-br from-[#06142e]/80 via-[#0a261c]/80 to-[#020403]/90 backdrop-blur-[20px] border border-[#D4AF37]/40 rounded-[2rem] shadow-[inset_0_0_20px_rgba(212,175,55,0.05),0_16px_64px_rgba(0,0,0,0.8)]">

        {/* Section 1: Header */}
        <div className="flex flex-col items-center">
          <div className="p-3 rounded-full mb-[16px]" style={{ background: "rgba(212,175,55,0.08)", border: "1px solid rgba(212,175,55,0.2)" }}>
            <Logo className="w-10 h-10" />
          </div>
          <div className="text-center w-full">
            <div className="text-[10px] tracking-[0.4em] uppercase mb-[12px]" style={{ color: "rgba(212,175,55,0.6)" }}>
              GatherPoint
            </div>
            <h1 className="text-[42px] leading-tight font-bold tracking-[0.1em] uppercase mb-[12px]"
              style={{
                fontFamily: "'Cinzel', serif",
                background: "linear-gradient(135deg, #FFF2B2, #D4AF37, #8A6623)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              Staff Login
            </h1>
            <p className="text-[16px] text-white/50 tracking-wide font-sans">
              {user ? "You are already signed in" : selectedRole ? `Logging in as ${activeRole?.label}` : "Select your role to continue"}
            </p>
          </div>
        </div>

        {/* ALREADY SIGNED IN UI */}
        {user && (
          <div className="w-full max-w-[420px] mx-auto text-center mt-[28px]">
            <div className="mb-[24px] flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-[#2D6A4F] text-[#D4AF37] flex items-center justify-center text-2xl font-bold mx-auto mb-4 border border-[#D4AF37]/30 shadow-lg">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="text-2xl font-bold text-[#FAF8F1]">{user.name}</h2>
              <p className="text-sm text-[#D4AF37] uppercase tracking-widest mt-1">{user.role?.replace('_', ' ')}</p>
            </div>
            
            <div className="flex flex-col gap-4">
              <button
                onClick={() => {
                  const dest = user.role === "ADMIN" ? "/admin/dashboard" : user.role === "KITCHEN_STAFF" ? "/kitchen" : "/pos";
                  navigate(dest);
                }}
                className="w-full h-13 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8A6623] text-[#050505] font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all duration-300 cursor-pointer"
              >
                Continue to Dashboard
              </button>
              
              <button
                onClick={async () => {
                  const AuthService = await import('../services/authService').then(m => m.default);
                  AuthService.logout();
                  window.location.reload();
                }}
                className="w-full h-13 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:bg-red-900/40 hover:text-red-400 hover:border-red-500/30 transition-all duration-300 font-bold text-sm tracking-wider uppercase cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: Role Selection */}
        {!user && !selectedRole && (
          <div ref={rolesRef} className="w-full max-w-[500px] mx-auto flex flex-col items-center mt-[32px]">
            <div className="w-full flex flex-col items-center gap-[16px]">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.key}
                    onClick={() => handleSelectRole(role.key)}
                    className="w-full min-h-[76px] flex items-center gap-4 px-5 rounded-2xl text-left transition-all duration-300 group cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                    style={{
                      background: role.bg,
                      border: `1px solid ${role.border}`,
                      backdropFilter: "blur(12px)",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.boxShadow = `0 0 24px ${role.glow}`;
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                      style={{ background: `${role.color}18`, border: `1px solid ${role.color}40` }}>
                      <Icon size={22} style={{ color: role.color }} />
                    </div>
                    <div className="flex-1 flex flex-col justify-center min-w-0">
                      <p className="font-bold text-sm tracking-wide leading-tight" style={{ color: role.color }}>
                        {role.label}
                      </p>
                      <p className="text-xs text-white/40 mt-1">{role.subtitle}</p>
                    </div>
                    <ChevronRight size={16} className="text-white/30 group-hover:text-white/60 transition-colors shrink-0" />
                  </button>
                );
              })}
            </div>

            <p className="text-center text-[12px] mt-[24px]" style={{ color: "rgba(255,255,255,0.2)" }}>
              This terminal is for authorised staff only.
            </p>
          </div>
        )}

        {/* STEP 2: Clerk Custom OTP Sign-In */}
        {selectedRole && (
          <div ref={loginRef} className="w-full flex flex-col items-center mt-[28px]" style={{ opacity: 0 }}>
            <div className="w-full max-w-[420px] mx-auto flex flex-col items-center">
              {/* Compact badge */}
              <div className="flex items-center justify-center gap-3 px-5 py-2 rounded-full mb-[32px]"
                style={{ background: `${activeRole.bg}`, border: `1px solid ${activeRole.border}` }}>
                <activeRole.icon size={16} style={{ color: activeRole.color }} />
                <span className="text-[12px] font-bold tracking-widest uppercase" style={{ color: activeRole.color }}>
                  {activeRole.label} PORTAL
                </span>
                <button onClick={handleBack}
                  className="ml-2 text-[12px] text-white/50 hover:text-white/90 underline cursor-pointer transition-colors font-sans font-medium">
                  Change
                </button>
              </div>

              {/* Authentication title -> Replaced with Choose Method */}
              <div className="text-center mb-[24px]">
                <p className="text-white/70 text-[16px] font-sans">
                  {!otpSent 
                    ? "Choose your preferred sign-in method" 
                    : `We've sent a 6-digit code to ${email}`}
                </p>
              </div>

              {errorMsg && (
                <div className="w-full p-3 bg-red-950/80 border border-red-500/30 text-red-400 text-sm font-semibold rounded-xl text-center shadow-lg mb-[24px]">
                  {errorMsg}
                </div>
              )}

              {!otpSent ? (
                <div className="w-full">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={!isLoaded}
                    className="w-full flex items-center justify-center gap-3 h-13 rounded-xl bg-white text-gray-800 hover:bg-gray-50 border-transparent hover:shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 hover:scale-[1.02] transition-all duration-300 font-bold text-sm tracking-wider uppercase cursor-pointer mb-[24px]"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" className="w-5 h-5 shrink-0">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
                    </svg>
                    Sign In with Google
                  </button>

                  {/* Subtle Separator spacing */}
                  <div className="flex items-center justify-center mb-[24px]">
                    <span className="text-[12px] uppercase tracking-[0.2em] text-[#D4AF37]/50 font-bold font-sans">
                      — Or Email OTP —
                    </span>
                  </div>

                  {/* Email OTP form */}
                  <form onSubmit={handleSendOtp} className="w-full">
                    <div className="relative mb-[20px]">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@gatherpoint.com"
                        className="w-full bg-[#020403]/40 border border-[#D4AF37]/20 rounded-xl px-5 h-13 text-base text-[#e2d5b0] placeholder-white/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none transition-all duration-300 shadow-inner font-sans"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={verifying || !isLoaded}
                      className="w-full h-13 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8A6623] text-[#050505] font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
                    >
                      {verifying ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#050505]" />
                      ) : (
                        "Send OTP Code"
                      )}
                    </button>
                  </form>
                </div>
              ) : (
                <form onSubmit={handleVerifyOtp} className="w-full">
                  <div className="flex justify-center mb-[24px]">
                    <input
                      type="text"
                      required
                      maxLength={6}
                      pattern="[0-9]*"
                      inputMode="numeric"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      className="w-56 bg-[#020403]/40 border border-[#D4AF37]/30 rounded-xl px-5 h-14 text-center text-[24px] font-bold tracking-[0.5em] text-white focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/50 outline-none transition-all duration-300 shadow-inner font-sans"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={verifying || !isLoaded || otpCode.length !== 6}
                    className="w-full h-13 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#8A6623] text-[#050505] font-bold text-sm tracking-wider uppercase hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer mb-[16px]"
                  >
                    {verifying ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#050505]" />
                    ) : (
                      "Verify & Login"
                    )}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                      className="text-[14px] text-[#D4AF37] hover:text-[#FFF2B2] disabled:text-white/30 transition-colors font-medium underline decoration-dotted font-sans"
                    >
                      {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
