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
        <h1>Update Folder title</h1>
        <div style={inputBoxStyles.inputContainer}>
          <input
            required
            name="folderName"
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

export const inputBoxStyles = {
  inputContainer: {
    display: 'flex',
    gap: 10,
  },
  input: {
    flexGrow: 1,
    padding: 10,
  },
  btn: {
    backgroundColor: '#241F21',
    border: 'none',
    borderRadius: 4,
    padding: '0px 10px',
    color: 'white',
  }
}

