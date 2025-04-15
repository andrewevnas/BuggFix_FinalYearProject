import { useContext } from "react";
import { modalConstants, ModalContext } from "../../providers/modalProvider";
import "./index.scss";
import { RightComponent } from "./RightComponent";
import { Modal } from "../../providers/modals/modal";
import { WelcomeSection } from "./welcomeSection";

export const HomeScreen = () => {
  const modalFeatures = useContext(ModalContext);

  const openCreateWorkspaceModal = () => {
    modalFeatures.openModal(modalConstants.CREATE_WORKSPACE);
  };

  // Function to scroll to workspaces section
  const scrollToWorkspaces = (e) => {
    e.preventDefault();
    document.getElementById('workspaces-section').scrollIntoView({
      behavior: 'smooth'
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
          <a href="#dashboard" className="active">Dashboard</a>
          <a href="#workspaces" onClick={scrollToWorkspaces}>Workspaces</a>
          <a href="#settings">Settings</a>
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