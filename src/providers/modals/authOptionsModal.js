import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { ModalContext, modalConstants } from "../modalProvider";
import "./createWorkspaceModal.scss";

export const AuthOptionsModal = () => {
  const modalFeatures = useContext(ModalContext);
  const navigate = useNavigate();

  const closeModal = () => {
    modalFeatures.closeModal();
  };

  const handleLogin = () => {
    closeModal();
    navigate('/auth', { state: { returnTo: 'create-workspace' } });
  };

  const handleRegister = () => {
    closeModal();
    navigate('/auth', { state: { activeTab: 'register', returnTo: 'create-workspace' } });
  };

  const continueAsGuest = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Continue as guest clicked");
    closeModal();
    
    // Use setTimeout to ensure modal is fully closed
    setTimeout(() => {
      modalFeatures.openModal(modalConstants.CREATE_WORKSPACE);
    }, 100);
  };

  return (
    <div className="modal-container">
      <div className="modal-body">
        <span onClick={closeModal} className="material-icons close">
          close
        </span>
        <h1>Save Your Workspaces</h1>
        
        <p>Creating an account allows you to access your workspaces from anywhere and sync your changes across devices.</p>

        <div className="auth-options">
          <button className="auth-btn" onClick={handleLogin}>
            <span className="material-icons">login</span>
            Login to Your Account
          </button>
          
          <button className="auth-btn" onClick={handleRegister}>
            <span className="material-icons">person_add</span>
            Create New Account
          </button>
          
          <button className="guest-btn" onClick={continueAsGuest}>
            Continue as Guest
            <small>Your workspaces will only be saved locally</small>
          </button>
        </div>
      </div>
    </div>
  );
};