
import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../providers/authProvider";
import "./account.scss";

export const AccountScreen = () => {
  const { currentUser, logout } = useContext(AuthContext);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const navigate = useNavigate();

  // Redirect if not logged in
  if (!currentUser) {
    navigate("/auth");
    return null;
  }

  const handleDeactivate = () => {
    // Here you would call an API to deactivate the account
    // For now, just log out the user
    logout();
    navigate("/");
  };

  return (
    <div className="account-container">
      <header className="main-header">
        <div className="logo-area">
          
          <span className="logo-text">BUGGFIX</span>
        </div>

        <nav className="nav-links">
          <Link to="/" className="active">Home</Link>
        </nav>
      </header>

      <div className="account-content">
        <div className="account-card">
          <div className="account-header">
            <div className="user-avatar large">
              {currentUser.displayName.charAt(0).toUpperCase()}
            </div>
            <h1>Account Details</h1>
          </div>

          <div className="account-details">
            <div className="detail-item">
              <span className="detail-label">Display Name</span>
              <span className="detail-value">{currentUser.displayName}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Email</span>
              <span className="detail-value">{currentUser.email}</span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Account Created</span>
              <span className="detail-value">
                {new Date(currentUser.createdAt).toLocaleDateString()}
              </span>
            </div>
            
            <div className="detail-item">
              <span className="detail-label">Last Login</span>
              <span className="detail-value">
                {new Date(currentUser.lastLogin).toLocaleDateString()}
              </span>
            </div>
          </div>

          <div className="account-actions">
            <Link to="/" className="btn btn-secondary">
              <span className="material-icons">arrow_back</span>
              Return to Home
            </Link>
            
            <button 
              className="btn btn-danger"
              onClick={() => setShowDeactivateModal(true)}
            >
              <span className="material-icons">delete</span>
              Deactivate Account
            </button>
          </div>
        </div>
      </div>

      {/* Deactivate confirmation modal */}
      {showDeactivateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Are you sure?</h2>
            <p>This action will permanently delete your account and all associated workspaces. This cannot be undone.</p>
            
            <div className="modal-actions">
              <button 
                className="btn btn-secondary"
                onClick={() => setShowDeactivateModal(false)}
              >
                Cancel
              </button>
              
              <button 
                className="btn btn-danger"
                onClick={handleDeactivate}
              >
                Yes, Deactivate Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};