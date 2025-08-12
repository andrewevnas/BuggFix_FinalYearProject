import { useContext } from "react";
import { modalConstants, ModalContext } from "../../providers/modalProvider";
import "./index.scss";
import { RightComponent } from "./RightComponent";
import { Modal } from "../../providers/modals/modal";
import { WelcomeSection } from "./welcomeSection";
import { AuthContext } from "../../providers/authProvider";
import { Link } from "react-router-dom";

export const HomeScreen = () => {
  const modalFeatures = useContext(ModalContext);
  const { isAuthenticated, currentUser, logout } = useContext(AuthContext);

  
  const openCreateWorkspaceModal = () => {
    console.log("Create workspace clicked, authenticated:", isAuthenticated());
    if (isAuthenticated()) {
      // If logged in, directly open the workspace creation modal
      modalFeatures.openModal(modalConstants.CREATE_WORKSPACE);
    } else {
      // If not logged in, show the auth options modal
      modalFeatures.openModal(modalConstants.AUTH_OPTIONS);
    }
  };

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
          
          <span className="logo-text">BUGGFIX</span>
        </div>

        <nav className="nav-links">
          <a href="#workspaces" onClick={scrollToWorkspaces}>
            Workspaces
          </a>
          
          <div className="auth-buttons">
            {isAuthenticated() ? (
              <>
                <Link to="/account" className="user-greeting">
                  <div className="user-avatar">
                    {currentUser.displayName.charAt(0).toUpperCase()}
                  </div>
                  <span>Hi, {currentUser.displayName}</span>
                </Link>
                <button onClick={logout} className="logout-btn">
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
