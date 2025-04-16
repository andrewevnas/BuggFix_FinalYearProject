// src/providers/authProvider.js
import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = 'http://localhost:4000/api'; // Adjust to your API URL

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  // Get user profile with token
  const getUserProfile = async (token) => {
    try {
      const response = await axios.get(`${API_URL}/users/profile`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCurrentUser(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to get user profile:', err);
      localStorage.removeItem('token');
      setLoading(false);
    }
  };

  // Register new user
  const register = async (email, password, displayName) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/users/register`, {
        email,
        password,
        displayName
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Set user data
      setCurrentUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    }
  };

  // Login user
  const login = async (email, password) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/users/login`, {
        email,
        password
      });
      
      const { token } = response.data;
      localStorage.setItem('token', token);
      
      // Set user data
      setCurrentUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    }
  };

  // Logout user
  const logout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
  };

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Get authentication header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        register,
        login,
        logout,
        isAuthenticated,
        getAuthHeader
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};