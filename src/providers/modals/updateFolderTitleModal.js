import { useContext } from "react";
import { ModalContext } from "../modalProvider";
import { WorkspaceContext } from "../workspaceProvider";
import "./createWorkspaceModal.scss";

export const UpdateFolderTitleModal = () => {
  const { closeModal, modalPayload } = useContext(ModalContext);
  const { editFolderTitle } = useContext(WorkspaceContext);

  const onSubmitModal = (e) => {
    e.preventDefault();
    const folderName = e.target.folderName.value;
    editFolderTitle(folderName, modalPayload);
    closeModal();
  };
  
  return (
    <div className="modal-container">
      <form className="modal-body" onSubmit={onSubmitModal}>
        <span onClick={closeModal} className="material-icons close">close</span>
        <h1>Update Workspace Name</h1>
        
        <div className="item">
          <p>New Workspace Name</p>
          <input
            required
            name="folderName"
            placeholder="Enter new workspace name"
          />
        </div>
        
        <button type="submit">Update Workspace</button>
      </form>
    </div>
  );
};