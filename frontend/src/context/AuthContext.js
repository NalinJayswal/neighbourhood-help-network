/**
 * Auth Context
 * Provides global authentication state across the React app.
 * Persists user data to localStorage so sessions survive page refresh.
 */

import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Initialise from localStorage if available
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('nhn_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Persist user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('nhn_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('nhn_user');
    }
  }, [user]);

  const login = (userData) => setUser(userData);

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
