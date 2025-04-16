import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../providers/authProvider";
import { WorkspaceContext } from "../../providers/workspaceProvider";
import { ModalContext, modalConstants } from "../../providers/modalProvider";
import "./auth.scss";

const AuthScreen = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { syncWorkspacesToCloud } = useContext(WorkspaceContext);
  const modalFeatures = useContext(ModalContext);
  
  // Get returnTo from location state if available
  const returnTo = location?.state?.returnTo;
  const initialTab = location?.state?.activeTab || 'login';
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);
  
  const { login, register, error: authError, isAuthenticated } = useContext(AuthContext);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [isAuthenticated, navigate]);
  
  // Set error from auth context
  useEffect(() => {
    if (authError) {
      setError(authError);
    }
  }, [authError]);

  // After successful login or registration
  const handleAuthSuccess = async () => {
    // Sync workspaces
    await syncWorkspacesToCloud();
    
    // Navigate based on returnTo
    if (returnTo === 'create-workspace') {
      navigate('/');
      // Open create workspace modal after navigation completes
      setTimeout(() => {
        modalFeatures.openModal(modalConstants.CREATE_WORKSPACE);
      }, 300);
    } else {
      navigate('/');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    
    setIsLoading(true);
    try {
      await login(email, password);
      await handleAuthSuccess();
    } catch (err) {
      // Error is set via authError effect
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!email || !password || !confirmPassword || !displayName) {
      setError("Please fill in all fields");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    setIsLoading(true);
    try {
      await register(email, password, displayName);
      await handleAuthSuccess();
    } catch (err) {
      // Error is set via authError effect
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-container">
        <div className="auth-header">
          <div className="logo-area">
            <span className="logo-text">BUGGFIX</span>
          </div>
        </div>
        
        <div className="auth-tabs">
          <button 
            className={`tab-btn ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button 
            className={`tab-btn ${activeTab === 'register' ? 'active' : ''}`}
            onClick={() => setActiveTab('register')}
          >
            Register
          </button>
        </div>
        
        {error && <div className="auth-error">{error}</div>}
        
        {activeTab === 'login' ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <div className="form-group">
              <label htmlFor="displayName">Display Name</label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Enter your name"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="registerEmail">Email</label>
              <input
                type="email"
                id="registerEmail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="registerPassword">Password</label>
              <input
                type="password"
                id="registerPassword"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                disabled={isLoading}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                disabled={isLoading}
              />
            </div>
            
            <button 
              type="submit" 
              className="auth-button" 
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthScreen;