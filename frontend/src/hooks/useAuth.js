import { useState, useEffect, useRef } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/clerk-react';
import AuthService from '../services/authService';

export default function useAuth() {
  const clerkAuth = useClerkAuth();
  const clerkUserObj = useClerkUser();
  const clerkObj = useClerk();

  // Handle case where Clerk is not loaded yet or unavailable
  const isLoaded = clerkAuth ? clerkAuth.isLoaded : false;
  const isSignedIn = clerkAuth ? clerkAuth.isSignedIn : false;
  const clerkUser = clerkUserObj ? clerkUserObj.user : null;
  const getTokenRef = useRef(clerkAuth ? clerkAuth.getToken : null);
  getTokenRef.current = clerkAuth ? clerkAuth.getToken : null;
  const signOut = clerkObj ? clerkObj.signOut : null;

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Track whether we've already initialised to prevent duplicate calls
  const initRef = useRef(false);

  useEffect(() => {
    // Wait for Clerk to finish loading before making any auth decisions
    if (!isLoaded) return;

    const initAuth = async () => {
      try {
        if (isSignedIn && clerkUser) {
          const email = clerkUser.primaryEmailAddress?.emailAddress;
          const name = clerkUser.fullName || 'Clerk User';

          if (email) {
            try {
              const userData = await AuthService.clerkLogin(email, name);
              AuthService.setUser(userData);
              setUser(userData);
              setToken(userData.token);
              localStorage.setItem('token', userData.token);
            } catch (err) {
              console.error('Failed to sync Clerk with backend:', err);
            }
          }
        } else if (!isSignedIn) {
          // Fallback to local storage (for standard email/password login)
          const currentUser = await AuthService.getCurrentUser();
          if (currentUser) {
            setUser(currentUser);
            setToken(localStorage.getItem('token'));
          } else {
            setUser(null);
            setToken(null);
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
        initRef.current = true;
      }
    };

    initAuth();
  }, [isLoaded, isSignedIn, clerkUser?.id]);

  const login = async (email, password, role) => {
    try {
      setLoading(true);
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
    try {
      setLoading(true);
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
    AuthService.logout();
    setUser(null);
    setToken(null);
    setError(null);
    if (isSignedIn && signOut) {
      await signOut({ redirectUrl: '/staff-pos' });
    }
  };

  return {
    user,
    token,
    loading: !isLoaded || loading,
    error,
    login,
    signup,
    logout,
    getToken: () => token || localStorage.getItem('token'),
    isAuthenticated: !!user,
    isLoading: !isLoaded || loading,
  };
}
