import { useContext } from "react";
import { modalConstants, ModalContext } from "../../providers/modalProvider";
import "./index.scss";
import { RightComponent } from "./RightComponent";
import { Modal } from "../../providers/modals/modal";

export const HomeScreen = () => {
  const modalFeatures = useContext(ModalContext);

  const openCreateWorkspaceModal = () => {
      modalFeatures.openModal(modalConstants.CREATE_WORKSPACE);
  }

  return (
    <div className="home-container">
      <div className="left-container">
        <div className="items-container">
          <img src="BFlogo.png" alt="BuggFix logo" />
          <h1>BuggFix</h1>
          <h2>Code. Compile. Debug</h2>
          <button onClick={openCreateWorkspaceModal}>Create Workspace</button>
        </div>
      </div>

      <RightComponent />
      <Modal />
    </div>
  );
};
