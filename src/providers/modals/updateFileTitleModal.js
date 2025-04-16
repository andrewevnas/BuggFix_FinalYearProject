import { useContext } from "react";
import { ModalContext } from "../modalProvider";
import "./createWorkspaceModal.scss";
import { WorkspaceContext } from "../workspaceProvider";

export const UpdateFileTitleModal = () => {
  const { closeModal, modalPayload } = useContext(ModalContext);
  const { editFileTitle } = useContext(WorkspaceContext);

  const onSubmitModal = (e) => {
    e.preventDefault();
    const fileName = e.target.fileName.value;
    editFileTitle(fileName, modalPayload.folderId, modalPayload.fileId);
    closeModal();
  };
  
  return (
    <div className="modal-container">
      <form className="modal-body" onSubmit={onSubmitModal}>
        <span onClick={closeModal} className="material-icons close">close</span>
        <h1>Update File Name</h1>
        
        <div className="item">
          <p>New File Name</p>
          <input
            required
            name="fileName"
            placeholder="Enter new file name"
          />
        </div>
        
        <button type="submit">Update File</button>
      </form>
    </div>
  );
};