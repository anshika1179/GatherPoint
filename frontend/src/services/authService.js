// Auth Service - Authentication related services
import { API_BASE_URL } from '../config';

class AuthService {
  static async login(email, password, role) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, role }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Login failed');
    }
    return response.json();
  }

  static async signup(name, email, password, role) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, role }),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || 'Registration failed');
    }
    return response.json();
  }

  static async getCurrentUser() {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!response.ok) {
      // Token might be expired, try to refresh
      try {
        await this.refreshToken();
        return this.getCurrentUser();
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return null;
      }
    }
    return response.json();
  }

  static async refreshToken() {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token available');
    }
    
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    });
    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }
    const data = await response.json();
    localStorage.setItem('token', data.token);
    return data;
  }

  static async logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  static getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  static setUser(user) {
    localStorage.setItem('user', JSON.stringify(user));
  }

  static getToken() {
    return localStorage.getItem('token');
  }
}

export default AuthService;