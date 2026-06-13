import { useState, useEffect, useRef } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/clerk-react';
import AuthService from '../services/authService';

export default function useAuth() {
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep refs to avoid stale-closure issues in the one-shot init effect
  const isSignedInRef = useRef(isSignedIn);
  const clerkUserRef = useRef(clerkUser);
  const signOutRef = useRef(signOut);

  // Sync refs when Clerk reactive values change (does NOT re-run init)
  useEffect(() => { isSignedInRef.current = isSignedIn; }, [isSignedIn]);
  useEffect(() => { clerkUserRef.current = clerkUser; }, [clerkUser]);
  useEffect(() => { signOutRef.current = signOut; }, [signOut]);

  // ΓöÇΓöÇ One-shot init: runs ONCE when Clerk finishes loading ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ
  useEffect(() => {
    if (!clerkLoaded) return;

    const init = async () => {
      try {
        const signedIn = isSignedInRef.current;
        const cUser = clerkUserRef.current;

        if (signedIn && cUser) {
          const email = cUser.primaryEmailAddress?.emailAddress;
          const name = cUser.fullName || 'Staff User';

          if (email) {
            try {
              const userData = await AuthService.clerkLogin(email, name);
              AuthService.setUser(userData);
              setUser(userData);
              setToken(userData.token);
              localStorage.setItem('token', userData.token);
            } catch (clerkErr) {
              // Clerk account not registered in this backend ΓåÆ force sign-out
              console.warn('Clerk user not in backend, signing out:', clerkErr.message);
              try { if (signOutRef.current) await signOutRef.current(); } catch (_) { /* ignore */ }
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setToken(null);
            }
          }
        } else {
          // Standard JWT path
          const storedToken = localStorage.getItem('token');
          if (storedToken) {
            try {
              const currentUser = await AuthService.getCurrentUser();
              if (currentUser) {
                setUser(currentUser);
                setToken(storedToken);
              } else {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setUser(null);
                setToken(null);
              }
            } catch {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setToken(null);
            }
          } else {
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        console.error('Auth init error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clerkLoaded]); // ΓåÉ only clerkLoaded, no other deps ΓåÆ runs once

  // ΓöÇΓöÇ Actions ΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇΓöÇ

  const login = async (email, password, role) => {
    setLoading(true);
    try {
      const userData = await AuthService.login(email, password, role);
      AuthService.setUser(userData);
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('token', userData.token);
      setError(null);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (name, email, password, role) => {
    setLoading(true);
    try {
      const userData = await AuthService.signup(name, email, password, role);
      AuthService.setUser(userData);
      setUser(userData);
      setToken(userData.token);
      localStorage.setItem('token', userData.token);
      setError(null);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try { if (isSignedInRef.current && signOutRef.current) await signOutRef.current(); } catch (_) { /* ignore */ }
    AuthService.logout();
    setUser(null);
    setToken(null);
    setError(null);
  };

  return {
    user,
    token,
    loading,
    error,
    login,
    signup,
    logout,
    getToken: () => token || localStorage.getItem('token'),
    isAuthenticated: !!user,
    isLoading: loading,
  };
}
