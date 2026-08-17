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
        fullName: decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || decoded.name || decoded.fullName || decoded.FullName || ''
      };

      return finalUser;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  // Async enrichment: calls GET /auth/me to get the real fullName from backend if missing.
  // Backend returns UserDetailsDto: { UserID, FullName, Email, Role, IsActive, CreatedAt }
  const enrichUserWithProfile = async () => {
    try {
      const meResponse = await apiClient.get('/auth/me');
      const fullName = meResponse.data?.FullName || meResponse.data?.fullName;
      if (fullName) {
        setUser(prev => {
          if (!prev) return prev;
          const updated = { ...prev, fullName };
          try {
            localStorage.setItem('user', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    } catch {
      // Silent — token-derived name is already set as fallback
    }
  };

  const login = async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      const token = response.data.token || response.data.Token;
      
      if (!token) {
        throw new Error('لم يتم استلام رمز التحقق (JWT) من الخادم');
      }

      localStorage.setItem('token', token);
      const tokenUser = getUserFromToken(token);
      
      const responseUser = response.data.user || response.data.User;
      const finalUser = {
        ...tokenUser,
        id: responseUser?.userID ?? responseUser?.userId ?? responseUser?.id ?? tokenUser?.id,
        email: responseUser?.email ?? responseUser?.Email ?? tokenUser?.email,
        role: normalizeRole(responseUser?.role ?? responseUser?.Role ?? tokenUser?.role),
        fullName: responseUser?.fullName ?? responseUser?.FullName ?? tokenUser?.fullName ?? ''
      };

      try {
        localStorage.setItem('user', JSON.stringify(finalUser));
      } catch {}

      setUser(finalUser);

      // Enrich with real fullName if anything was missing
      if (!finalUser.fullName) {
        enrichUserWithProfile();
      }

      return finalUser;
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
      const tokenUser = getUserFromToken(token);
      if (tokenUser) {
        let savedUser = null;
        try {
          const stored = localStorage.getItem('user');
          if (stored) savedUser = JSON.parse(stored);
        } catch {}

        const finalUser = {
          ...tokenUser,
          fullName: savedUser?.fullName || tokenUser.fullName || ''
        };

        setUser(finalUser);
        if (!finalUser.fullName) {
          enrichUserWithProfile();
        }
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
