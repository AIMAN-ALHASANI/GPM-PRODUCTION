import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import apiClient from '../api/apiClient';
import { useQueryClient } from '@tanstack/react-query';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  // Helper to normalize roles to standard frontend names
  const normalizeRole = (role) => {
    if (!role) return '';
    const value = String(role).trim();
    // Standardize HeadOfDepartment (supporting legacy 'HOD' if it ever appears)
    if (value === 'HOD') return 'HeadOfDepartment';
    return value;
  };

  // Helper to extract user from token
  const getUserFromToken = (token) => {
    try {
      const decoded = jwtDecode(token);
      
      // Support multiple role claim formats
      const rawRole = 
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
        decoded.role ||
        decoded.Role ||
        '';

      const finalUser = {
        id: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || decoded.sub || decoded.nameid,
        email: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] || decoded.email,
        role: normalizeRole(rawRole),
        fullName: decoded.fullName || decoded.FullName || 'User'
      };

      return finalUser;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Async enrichment: calls GET /auth/me to get the real fullName from backend.
  // Backend returns UserDetailsDto: { UserID, FullName, Email, Role, IsActive, CreatedAt }
  const enrichUserWithProfile = async () => {
    try {
      const meResponse = await apiClient.get('/auth/me');
      const fullName = meResponse.data?.FullName || meResponse.data?.fullName;
      if (fullName) {
        setUser(prev => prev ? { ...prev, fullName } : prev);
      }
    } catch {
      // Silent — token-derived name is already set as fallback
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      // We only care about the token as per the new requirement
      const token = response.data.token || response.data.Token;
      
      if (!token) {
        throw new Error('لم يتم استلام رمز التحقق (JWT) من الخادم');
      }

      localStorage.setItem('token', token);
      const userData = getUserFromToken(token);
      setUser(userData);

      // Enrich with real fullName immediately after login
      enrichUserWithProfile();

      return userData;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    // Clear all authentication-related storage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfile');
    sessionStorage.clear();
    
    try {
      queryClient.clear();
    } catch (e) {
      console.error('Query client clear error:', e);
    }
    
    setUser(null);
    window.location.href = '/';
  };

  const checkAuth = () => {
    const token = localStorage.getItem('token');
    if (token) {
      const userData = getUserFromToken(token);
      if (userData) {
        setUser(userData);
        enrichUserWithProfile(); // silently enrich with real fullName
      } else {
        logout();
      }
    }
    setIsLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      logout, 
      isLoading, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
