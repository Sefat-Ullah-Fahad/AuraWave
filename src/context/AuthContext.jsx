import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch } from '../lib/api.js';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState({ isUsingMongo: false, type: 'Loading...' });
  const { showToast } = useToast();

  // Check persistent session on mount via secure HTTP-Only cookie
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/api/auth/me');
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
      if (data && data.dbStatus) {
        setDbStatus(data.dbStatus);
      }
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const login = async (email, password) => {
    try {
      const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      setUser(data.user);
      showToast(`Welcome back, ${data.user.name}!`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Login failed. Please check your credentials.', 'error');
      throw err;
    }
  };

  const register = async (name, email, password, phone) => {
    try {
      const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, phone }),
      });

      setUser(data.user);
      showToast(`Account created! Welcome, ${data.user.name}.`, 'success');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Registration failed.', 'error');
      throw err;
    }
  };

  const logout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      // Continue client logout even if network request fails
    } finally {
      setUser(null);
      showToast('Logged out successfully.', 'info');
    }
  };

  const updateProfile = async (name, phone) => {
    try {
      const data = await apiFetch('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ name, phone }),
      });
      setUser(data.user);
      showToast('Profile updated successfully.', 'success');
      return data.user;
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
      throw err;
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      await apiFetch('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      showToast('Password updated successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to change password.', 'error');
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        dbStatus,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        checkSession,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
