import React, { createContext, useState, useEffect, useRef } from 'react';
import { useAuth as useClerkAuth, useUser as useClerkUser, useClerk } from '@clerk/clerk-react';
import AuthService from '../services/authService';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const { isSignedIn, isLoaded: clerkLoaded } = useClerkAuth();
  const { user: clerkUser } = useClerkUser();
  const { signOut } = useClerk();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Use refs to avoid stale closures in sync callback
  const isSignedInRef = useRef(isSignedIn);
  const clerkUserRef = useRef(clerkUser);
  const signOutRef = useRef(signOut);

  useEffect(() => {
    isSignedInRef.current = isSignedIn;
  }, [isSignedIn]);

  useEffect(() => {
    clerkUserRef.current = clerkUser;
  }, [clerkUser]);

  useEffect(() => {
    signOutRef.current = signOut;
  }, [signOut]);

  // Synchronize Clerk state with backend session
  useEffect(() => {
    if (!clerkLoaded) return;

    const syncAuth = async () => {
      try {
        const signedIn = isSignedInRef.current;
        const cUser = clerkUserRef.current;

        if (signedIn && cUser) {
          const email = cUser.primaryEmailAddress?.emailAddress;
          const name = cUser.fullName || 'Staff User';

          if (email) {
            try {
              const selectedRole = localStorage.getItem('selected_role');
              const userData = await AuthService.clerkLogin(email, name, selectedRole || undefined);
              AuthService.setUser(userData);
              setUser(userData);
              setToken(userData.token);
              localStorage.setItem('token', userData.token);
            } catch (clerkErr) {
              console.warn('Clerk user mismatch in backend, signing out:', clerkErr.message);
              try {
                if (signOutRef.current) {
                  await signOutRef.current();
                }
              } catch (_) {}
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
              setToken(null);
            }
          }
        } else {
          // Fallback to local token if not signing in with Clerk
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
        console.error('Auth sync error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    syncAuth();
  }, [clerkLoaded, isSignedIn, clerkUser]);

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
    setLoading(true);
    try {
      if (isSignedInRef.current && signOutRef.current) {
        await signOutRef.current();
      }
    } catch (_) {}
    AuthService.logout();
    setUser(null);
    setToken(null);
    setError(null);
    setLoading(false);
  };

  const value = {
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
