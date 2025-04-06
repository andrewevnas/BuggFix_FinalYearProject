import { useContext } from "react";
import "./createWorkspaceModal.scss";
import { ModalContext } from "../modalProvider";
import { WorkspaceContext } from "../workspaceProvider";

export const CreateWorkspaceModal = () => {
  const modalFeatures = useContext(ModalContext);

  const workspaceFeatures = useContext(WorkspaceContext);

  const closeModal = () => {
    modalFeatures.closeModal();
  };

  const onSubmitModal = (e) => {
    e.preventDefault();
    const folderName = e.target.folderName.value;
    const fileName = e.target.fileName.value;
    const language = e.target.language.value;
    workspaceFeatures.createNewWorkspace({
        folderName,
        fileName,
        language
    })
    closeModal();
        
  };
  

  return (
    <div className="modal-container">
      <form className="modal-body" onSubmit={onSubmitModal}>
        <span onClick={closeModal} className="material-icons close">
          close
        </span>
        <h1>Create New Workspace</h1>

        <div className="item">
          <p>Enter folder Name</p>
          <input name="folderName" required />
        </div>

        <div className="item">
          <p>Enter card name</p>
          <input name="fileName" required/>
        </div>

        <div className="item">
          <select name="language" required>
            <option value="cpp">CPP</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>

          <button type="submit">Create Workspace</button>
        </div>

        
      </form>
    </div>
  );
};
