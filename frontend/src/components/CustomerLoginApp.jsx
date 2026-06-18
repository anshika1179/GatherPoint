import { useState, useEffect } from 'react';

import { API_PUBLIC_URL as API_BASE_URL, GOOGLE_OAUTH_URL } from '../config';

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
  logo: {
    width: '64px',
    height: '64px',
    background: 'linear-gradient(135deg, #D4AF37, #8A6623)',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#0a100d',
  },
  h1: {
    color: '#D4AF37',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 4px',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    margin: 0,
  },
  tabs: {
    display: 'flex',
    gap: '8px',
    marginBottom: '24px',
    background: 'rgba(255,255,255,0.03)',
    borderRadius: '12px',
    padding: '4px',
  },
  tab: (active) => ({
    flex: 1,
    padding: '10px 16px',
    borderRadius: '10px',
    border: 'none',
    background: active ? 'rgba(207,173,86,0.15)' : 'transparent',
    color: active ? '#D4AF37' : 'rgba(255,255,255,0.4)',
    fontSize: '14px',
    fontWeight: active ? '600' : '400',
    cursor: 'pointer',
    transition: 'all 0.2s',
  }),
  inputGroup: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    outline: 'none',
    boxSizing: 'border-box',
  },
  button: {
    width: '100%',
    padding: '14px',
    background: 'linear-gradient(135deg, #D4AF37, #b8943f)',
    border: 'none',
    borderRadius: '12px',
    color: '#050505',
    fontSize: '16px',
    fontWeight: '700',
    cursor: 'pointer',
    marginTop: '8px',
  },
  googleButton: {
    width: '100%',
    padding: '14px',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '12px',
    color: '#fff',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '16px',
    textDecoration: 'none',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    margin: '20px 0',
    color: 'rgba(255,255,255,0.2)',
    fontSize: '12px',
  },
  line: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.08)',
  },
  error: {
    padding: '10px 14px',
    background: 'rgba(220,38,38,0.15)',
    border: '1px solid rgba(220,38,38,0.3)',
    borderRadius: '10px',
    color: '#fca5a5',
    fontSize: '13px',
    marginBottom: '16px',
    textAlign: 'center',
  },
};

export default function CustomerLoginApp() {
  const [activeTab, setActiveTab] = useState('login');
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '' });
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      const res = await fetch(`${API_BASE_URL}/customers/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(typeof data === 'string' ? data : 'Login failed');
        return;
      }
      localStorage.setItem('customer', JSON.stringify(data));
      window.location.href = '/customer-order';
    } catch {
      setIsError(true);
      setMessage('Could not connect to server. Make sure the backend is running.');
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);
    try {
      const res = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
      });
      const data = await res.json();
      if (!res.ok) {
        setIsError(true);
        setMessage(typeof data === 'string' ? data : 'Registration failed');
        return;
      }
      localStorage.setItem('customer', JSON.stringify(data));
      window.location.href = '/customer-order';
    } catch {
      setIsError(true);
      setMessage('Could not connect to server. Make sure the backend is running.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.brand}>
          <div style={styles.logo}>G</div>
          <h1 style={styles.h1}>GatherPoint</h1>
          <p style={styles.subtitle}>Sign in to place your order</p>
        </div>

        <div style={styles.tabs}>
          <button style={styles.tab(activeTab === 'login')} onClick={() => setActiveTab('login')}>
            Sign In
          </button>
          <button style={styles.tab(activeTab === 'register')} onClick={() => setActiveTab('register')}>
            Register
          </button>
        </div>

        {message && (
          <div style={styles.error}>
            {message}
          </div>
        )}

        {activeTab === 'login' ? (
          <form onSubmit={handleLogin}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={loginForm.email}
                onChange={e => setLoginForm({ ...loginForm, email: e.target.value })}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="••••••••"
                value={loginForm.password}
                onChange={e => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" style={styles.button}>
              Sign In
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Name</label>
              <input
                style={styles.input}
                type="text"
                placeholder="Your name"
                value={registerForm.name}
                onChange={e => setRegisterForm({ ...registerForm, name: e.target.value })}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Email</label>
              <input
                style={styles.input}
                type="email"
                placeholder="your@email.com"
                value={registerForm.email}
                onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })}
                required
              />
            </div>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Password</label>
              <input
                style={styles.input}
                type="password"
                placeholder="Create a password"
                value={registerForm.password}
                onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" style={styles.button}>
              Create Account
            </button>
          </form>
        )}

        <div style={styles.divider}>
          <div style={styles.line} />
          <span>or</span>
          <div style={styles.line} />
        </div>

        <a href={GOOGLE_OAUTH_URL} style={styles.googleButton}>
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
          </svg>
          Sign in with Google
        </a>
      </div>
    </div>
  );
}
