import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { WorkspaceContext } from './workspaceProvider';

export const AuthContext = createContext();

const API_URL = 'http://localhost:4000/api'; 

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  
  let workspaceContextValue = null;

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
    
    // Dispatch a custom event for workspace clearing
    window.dispatchEvent(new Event('user-logout'));
  };

  // When WorkspaceContext is connected, expose the function globally
useEffect(() => {
  if (WorkspaceContext && WorkspaceContext.clearLocalWorkspaces) {
    window.clearWorkspaces = WorkspaceContext.clearLocalWorkspaces;
  }
  
  return () => {
    delete window.clearWorkspaces;
  };
}, [WorkspaceContext]);

  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!currentUser;
  };

  // Get authentication header for API requests
  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // Forward ref-like pattern to get workspaceContext
  const setWorkspaceContext = (context) => {
    workspaceContextValue = context;
  };

  const authContext = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated,
    getAuthHeader,
    setWorkspaceContext
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

// Wrapper component to connect AuthProvider with WorkspaceProvider
export const AuthProviderWithWorkspace = ({ children }) => {
  return (
    <AuthProvider>
      <WorkspaceContextConnector>
        {children}
      </WorkspaceContextConnector>
    </AuthProvider>
  );
};

// Component to connect WorkspaceContext to AuthContext
const WorkspaceContextConnector = ({ children }) => {
  const workspaceContext = useContext(WorkspaceContext);
  const authContext = useContext(AuthContext);
  
  useEffect(() => {
    if (authContext.setWorkspaceContext && workspaceContext) {
      authContext.setWorkspaceContext(workspaceContext);
    }
  }, [authContext, workspaceContext]);
  
  return <>{children}</>;
};