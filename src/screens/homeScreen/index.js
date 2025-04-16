import { useContext } from "react";
import { modalConstants, ModalContext } from "../../providers/modalProvider";
import "./index.scss";
import { RightComponent } from "./RightComponent";
import { Modal } from "../../providers/modals/modal";
import { WelcomeSection } from "./welcomeSection";

import { AuthContext } from "../../providers/authProvider";

export const HomeScreen = () => {
  const modalFeatures = useContext(ModalContext);

  const openCreateWorkspaceModal = () => {
    modalFeatures.openModal(modalConstants.CREATE_WORKSPACE);
  };

  // Inside your component
  const { isAuthenticated, logout, currentUser } = useContext(AuthContext);

  // Function to scroll to workspaces section
  const scrollToWorkspaces = (e) => {
    e.preventDefault();
    document.getElementById("workspaces-section").scrollIntoView({
      behavior: "smooth",
    });
  };

  return (
    <div className="home-container">
      {/* Header */}

      <header className="main-header">
        <div className="logo-area">
          <img src="/BFlogo.png" alt="BuggFix logo" className="logo" />
          <span className="logo-text">BUGGFIX</span>
        </div>

        <nav className="nav-links">
          <a href="#dashboard" className="active">
            Dashboard
          </a>
          <a href="#workspaces" onClick={scrollToWorkspaces}>
            Workspaces
          </a>
          <a href="#settings">Settings</a>

          <div className="nav-links">
            {isAuthenticated() ? (
              <>
                <span className="user-greeting">
                  Hi, {currentUser.displayName}
                </span>
                <button onClick={logout} className="auth-btn logout-btn">
                  <span className="material-icons">logout</span>
                  Logout
                </button>
              </>
            ) : (
              <a href="/auth" className="auth-btn login-btn">
                Login / Register
              </a>
            )}
          </div>
        </nav>
      </header>
      {/* Main content container */}
      <div className="content-container">
        {/* Welcome section */}
        <WelcomeSection openCreateWorkspaceModal={openCreateWorkspaceModal} />

        {/* Workspaces section (below welcome section) */}
        <div id="workspaces-section">
          <RightComponent />
        </div>
      </div>
      <Modal />
    </div>
  );
};
