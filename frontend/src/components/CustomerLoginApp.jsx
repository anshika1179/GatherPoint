import { useState, useEffect } from 'react';
import { useSignIn, useAuth, useUser } from '@clerk/clerk-react';

const API_BASE_URL = '/api/public';

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0a100d 0%, #1a2e23 50%, #0d1f16 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    fontFamily: '"Outfit", sans-serif',
  },
  card: {
    maxWidth: '420px',
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(12px)',
    borderRadius: '24px',
    padding: '40px',
    border: '1px solid rgba(207,173,86,0.2)',
    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
  },
  brand: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  brandName: {
    fontSize: '2rem',
    fontWeight: 800,
    color: '#cfad56',
    fontFamily: '"Plus Jakarta Sans", sans-serif',
    letterSpacing: '0.02em',
  },
  tagline: {
    color: '#8b9691',
    fontSize: '0.9rem',
    marginTop: '4px',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: 600,
    color: '#a0aba6',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'rgba(0,0,0,0.3)',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  btn: {
    width: '100%',
    padding: '20px 24px',
    borderRadius: '16px',
    border: 'none',
    background: 'linear-gradient(135deg, #cfad56, #b8943f)',
    color: '#0a100d',
    fontWeight: 800,
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'opacity 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    margin: '24px 0',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    padding: '0 16px',
    color: '#8b9691',
    fontSize: '0.85rem',
  },
  socialBtn: {
    width: '100%',
    padding: '20px 24px',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.15)',
    background: 'rgba(255,255,255,0.05)',
    color: '#fff',
    fontSize: '0.95rem',
    fontWeight: 800,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'background 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
  },
  tabContainer: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
  },
  tab: {
    flex: 1,
    padding: '14px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    background: 'transparent',
    color: '#8b9691',
    fontSize: '0.9rem',
    fontWeight: 800,
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  activeTab: {
    background: 'rgba(207,173,86,0.15)',
    borderColor: '#cfad56',
    color: '#cfad56',
  },
  successBox: {
    textAlign: 'center',
    padding: '40px 20px',
  },
  successIcon: {
    fontSize: '4rem',
    marginBottom: '16px',
  },
};

export default function CustomerLoginApp() {
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { isLoaded: authLoaded, isSignedIn, getToken } = useAuth();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();

  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('customer');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  useEffect(() => {
    const loginWithClerkToken = async () => {
      if (authLoaded && isSignedIn && userLoaded && clerkUser) {
        setLoading(true);
        try {
          const token = await getToken();
          const email = clerkUser.primaryEmailAddress?.emailAddress || '';
          const name = clerkUser.fullName || clerkUser.firstName || 'Clerk Customer';
          const phone = clerkUser.primaryPhoneNumber?.phoneNumber || '';

          const res = await fetch(`${API_BASE_URL}/auth/clerk-login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, email, name, phone }),
          });
          if (res.ok) {
            const userData = await res.json();
            setUser(userData);
            localStorage.setItem('customer', JSON.stringify(userData));
          } else {
            const err = await res.text();
            setMessage(err || 'Failed to authenticate via Google');
          }
        } catch (e) {
          setMessage('Error connecting to authentication server');
        } finally {
          setLoading(false);
        }
      }
    };
    loginWithClerkToken();
  }, [authLoaded, isSignedIn, userLoaded, clerkUser, getToken]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setMessage('Email and password are required');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('customer', JSON.stringify(userData));
        setMessage(`Welcome back, ${userData.name}!`);
      } else {
        const err = await res.text();
        setMessage(err || 'Login failed');
      }
    } catch {
      setMessage('Could not connect to server');
    }
    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.password) {
      setMessage('Name, email, and password are required');
      return;
    }
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(signupForm),
      });
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        localStorage.setItem('customer', JSON.stringify(userData));
        setMessage(`Welcome, ${userData.name}! Your account has been created.`);
      } else {
        const err = await res.text();
        setMessage(err || 'Registration failed');
      }
    } catch {
      setMessage('Could not connect to server');
    }
    setLoading(false);
  };

  const handleGoogleAuth = async () => {
    if (!signInLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: window.location.href,
        redirectUrlComplete: window.location.href,
      });
    } catch (err) {
      setMessage(err.message || 'Google Auth failed');
    }
  };

  if (user) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.successBox}>
            <div style={styles.successIcon}>👋</div>
            <h2 style={{ color: '#fff', marginBottom: '8px' }}>Welcome Back!</h2>
            <p style={{ color: '#8b9691', marginBottom: '24px' }}>
              You're now logged in as {user.name}
            </p>
            <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '12px', padding: '16px', marginBottom: '24px', textAlign: 'left' }}>
              <div style={{ color: '#cfad56', marginBottom: '4px' }}>{user.name}</div>
              <div style={{ color: '#8b9691', fontSize: '0.85rem' }}>{user.email}</div>
              {user.phone && <div style={{ color: '#8b9691', fontSize: '0.85rem' }}>{user.phone}</div>}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button style={{ ...styles.btn, flex: 1 }} onClick={() => window.location.href = '/customer-order'}>
                Dashboard
              </button>
              <button 
                style={{ 
                  ...styles.btn, 
                  flex: 1, 
                  background: 'transparent', 
                  border: '1px solid #cfad56', 
                  color: '#cfad56' 
                }} 
                onClick={() => window.location.href = '/booking.html'}
              >
                Book Table
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.brandName}>GatherPoint</div>
          <div style={styles.tagline}>Customer Login & Registration</div>
        </div>

        <div style={styles.tabContainer}>
          <button
            style={{ ...styles.tab, ...(activeTab === 'login' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            style={{ ...styles.tab, ...(activeTab === 'signup' ? styles.activeTab : {}) }}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Enter your password"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>

            {message && (
              <div
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}
              >
                {message}
              </div>
            )}

            <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignup}>
            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Full Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="John Doe"
                value={signupForm.name}
                onChange={e => setSignupForm({ ...signupForm, name: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Email Address</label>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={signupForm.email}
                onChange={e => setSignupForm({ ...signupForm, email: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={styles.label}>Phone Number</label>
              <input
                style={styles.input}
                type="tel"
                placeholder="+1 234 567 8900"
                value={signupForm.phone}
                onChange={e => setSignupForm({ ...signupForm, phone: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Create a password"
                value={signupForm.password}
                onChange={e => setSignupForm({ ...signupForm, password: e.target.value })}
                required
              />
            </div>

            {message && (
              <div
                style={{ padding: '12px', borderRadius: '8px', background: 'rgba(239,68,68,0.1)', color: '#ef4444', marginBottom: '16px', fontSize: '0.85rem', textAlign: 'center' }}
              >
                {message}
              </div>
            )}

            <button type="submit" style={{ ...styles.btn, opacity: loading ? 0.6 : 1 }} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        )}

        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <div style={styles.dividerText}>OR</div>
          <div style={styles.dividerLine} />
        </div>

        <button
          style={styles.socialBtn}
          onClick={handleGoogleAuth}
          disabled={loading}
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
          Sign In with Google
        </button>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.85rem', color: '#8b9691' }}>
          Already have an account?{' '}
          <span
            onClick={() => setActiveTab('login')}
            style={{ color: '#cfad56', cursor: 'pointer', fontWeight: 600 }}
          >
            Sign In
          </span>{' '}
          |{' '}
          <span
            onClick={() => setActiveTab('signup')}
            style={{ color: '#cfad56', cursor: 'pointer', fontWeight: 600 }}
          >
            Create Account
          </span>
        </div>
      </div>
    </div>
  );
}
