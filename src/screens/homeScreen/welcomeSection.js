// src/screens/homeScreen/welcomeSection.js
import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../../providers/authProvider";

export const WelcomeSection = ({ openCreateWorkspaceModal }) => {
  const { isAuthenticated, currentUser } = useContext(AuthContext);
  
  return (
    <section className="welcome-section">
      <div className="welcome-text">
        <h1>
          Welcome{isAuthenticated() ? `, ${currentUser.displayName}` : ''} to <span>BuggFix</span>
        </h1>
        <p>
          Your modern, integrated development environment for coding, compiling, and debugging.
          Create workspaces to organize your projects and start coding with advanced AI suggestions.
        </p>
        <div className="welcome-buttons">
          <button className="btn btn-primary" onClick={openCreateWorkspaceModal}>
            <span className="material-icons">add</span>
            Create Workspace
          </button>
          <button className="btn btn-outline">
            <span className="material-icons">info</span>
            Quick Tutorial
          </button>
          
          {!isAuthenticated() && (
            <Link to="/auth" className="btn btn-secondary">
              <span className="material-icons">login</span>
              Login / Register
            </Link>
          )}
        </div>
      </div>
      <div className="welcome-image">
        <img src="/BFlogo.png" alt="BuggFix Logo" />
      </div>
    </section>
  );
};