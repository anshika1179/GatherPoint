import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';
import { gsap } from 'gsap';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';
import useAuth from '../hooks/useAuth';
import { validators } from '../utils/validators';
import Logo from './customer/Logo';

export default function CustomerLoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const clerk = useClerk();

  const [activeTab, setActiveTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('EMPLOYEE');
  const [showPassword, setShowPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const cardRef = useRef(null);

  // GSAP intro animation on load
  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, scale: 0.95, y: 30 },
        { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: 'power3.out' }
      );
    }
  }, []);

  // GSAP slide transition when switching tabs
  const handleTabChange = (tab) => {
    setErrorMsg('');
    setSuccessMsg('');
    setActiveTab(tab);
    
    // Animate form side fade-in
    gsap.fromTo(
      '.auth-form-content',
      { opacity: 0, x: tab === 'login' ? -15 : 15 },
      { opacity: 1, x: 0, duration: 0.4, ease: 'power2.out' }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // Run validations
    const emailErr = validators.required(email) || validators.email(email);
    const passwordErr = validators.required(password) || validators.minLength(6)(password);

    if (emailErr) {
      setErrorMsg(emailErr);
      return;
    }

    if (passwordErr) {
      setErrorMsg(`Password: ${passwordErr}`);
      return;
    }

    if (activeTab === 'signup') {
      const nameErr = validators.required(name);
      if (nameErr) {
        setErrorMsg(`Name: ${nameErr}`);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (activeTab === 'login') {
        const userData = await login(email, password);
        setSuccessMsg(`Welcome back, ${userData.name}! Redirecting...`);
        setTimeout(() => {
          if (userData.role === 'ADMIN') {
            navigate('/admin');
          } else if (userData.role === 'EMPLOYEE') {
            navigate('/pos');
          } else if (userData.role === 'KITCHEN_STAFF') {
            navigate('/kitchen');
          } else {
            navigate('/');
          }
        }, 1200);
      } else {
        const userData = await signup(name, email, password, role);
        setSuccessMsg(`Account created successfully! Welcome, ${userData.name}.`);
        setTimeout(() => {
          if (userData.role === 'ADMIN') {
            navigate('/admin');
          } else if (userData.role === 'EMPLOYEE') {
            navigate('/pos');
          } else if (userData.role === 'KITCHEN_STAFF') {
            navigate('/kitchen');
          } else {
            navigate('/');
          }
        }, 1200);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Authentication failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (clerk && clerk.openSignIn) {
      clerk.openSignIn({
        redirectUrl: '/'
      });
    } else {
      setErrorMsg('Google login via Clerk is currently initializing. Please try again.');
    }
  };

  return (
    <div className="auth-bg">
      <div ref={cardRef} className="auth-split-card-wrapper max-w-[900px] w-full mx-4">
        <div className="auth-split-card">
          {/* Left Brand Image Side */}
          <div className="auth-image-side">
            <div className="auth-image-overlay flex flex-col items-center justify-center gap-4">
              <Logo className="w-24 h-24 drop-shadow-[0_0_20px_rgba(212,175,55,0.4)] animate-pulse" />
              <div className="auth-brand-text font-cinzel">GatherPoint</div>
            </div>
          </div>

          {/* Right Form Side */}
          <div className="auth-form-side">
            <div className="auth-form-content">
              <h2>{activeTab === 'login' ? 'Welcome Back' : 'Join GatherPoint'}</h2>
              <p>
                {activeTab === 'login'
                  ? 'Sign in to access your dining and POS dashboard'
                  : 'Register a new staff account to get started'}
              </p>

              {/* Custom Tabs */}
              <div className="flex border border-gray-300/60 rounded-2xl p-1.5 mb-6 bg-white/40 backdrop-blur-sm">
                <button
                  type="button"
                  onClick={() => handleTabChange('login')}
                  className={`flex-1 premium-auth-tab-btn text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === 'login'
                      ? 'bg-[#1b2e23] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange('signup')}
                  className={`flex-1 premium-auth-tab-btn text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                    activeTab === 'signup'
                      ? 'bg-[#1b2e23] text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  Register
                </button>
              </div>

              {/* Alerts */}
              {errorMsg && (
                <div className="mb-4 p-3.5 bg-red-100/90 border border-red-200 text-red-700 text-xs font-semibold rounded-xl text-center shadow-sm">
                  {errorMsg}
                </div>
              )}
              {successMsg && (
                <div className="mb-4 p-3.5 bg-green-100/90 border border-green-200 text-green-700 text-xs font-semibold rounded-xl text-center shadow-sm">
                  {successMsg}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {activeTab === 'signup' && (
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      className="auth-input pl-11 mb-0"
                      placeholder="Full Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type="email"
                    className="auth-input pl-11 mb-0"
                    placeholder="Email Address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="auth-input pl-11 pr-11 mb-0"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-800"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>

                {activeTab === 'signup' && (
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-500 tracking-wider mb-2">
                      System Role
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {['EMPLOYEE', 'KITCHEN_STAFF', 'ADMIN'].map((r) => (
                        <button
                          key={r}
                          type="button"
                          onClick={() => setRole(r)}
                          className={`py-2 text-[10px] tracking-wider font-bold rounded-lg border transition-all ${
                            role === r
                              ? 'bg-[#cfad56] border-[#cfad56] text-black'
                              : 'bg-white/40 border-gray-300 text-gray-600 hover:bg-white/60'
                          }`}
                        >
                          {r.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full premium-auth-btn-primary text-base font-extrabold uppercase tracking-widest bg-[#1b2e23] hover:bg-[#2a3b30] hover:scale-[1.01] active:scale-[0.99] text-white transition-all duration-200 mt-6 shadow-md flex items-center justify-center gap-2 group cursor-pointer"
                >
                  {isLoading ? (
                    <span className="auth-spinner" />
                  ) : (
                    <>
                      {activeTab === 'login' ? 'Sign In' : 'Create Account'}
                      <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>

              {/* Social Divider */}
              <div className="flex items-center my-6">
                <div className="flex-1 h-px bg-gray-300" />
                <div className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Or
                </div>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Google Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full premium-auth-btn-google border border-gray-300 text-sm font-extrabold uppercase tracking-widest bg-white/70 hover:bg-white hover:border-gray-400 hover:scale-[1.01] active:scale-[0.99] text-[#1b2e23] transition-all duration-200 shadow-sm flex items-center justify-center gap-3 cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" className="w-5 h-5">
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
                Sign In with Google
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}