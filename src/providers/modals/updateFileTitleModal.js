import { useContext } from "react";
import { ModalContext } from "../modalProvider";
import {inputBoxStyles} from "./updateFolderTitleModal";
import "./createWorkspaceModal.scss";
import { WorkspaceContext } from "../workspaceProvider";

export const UpdateFileTitleModal = () => {
  const { closeModal, modalPayload } = useContext(ModalContext);
  const {editFileTitle} = useContext(WorkspaceContext)

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
        <h1>Update Card title</h1>
        <div style={inputBoxStyles.inputContainer}>
          <input
            required
            name="fileName"
            style={inputBoxStyles.input}
            placeholder="Enter Folder Name"
          />
          <button style={inputBoxStyles.btn} type="submit">
            Create Folder
          </button>
        </div>
      </form>
    </div>
  );
  
};
