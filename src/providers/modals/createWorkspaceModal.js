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
    });
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
          <p>Workspace Name</p>
          <input 
            name="folderName" 
            placeholder="Enter workspace name" 
            required 
          />
        </div>

        <div className="item">
          <p>File Name</p>
          <input 
            name="fileName" 
            placeholder="Enter file name" 
            required
          />
        </div>

        <div className="item">
          <p>Programming Language</p>
          <select name="language" required>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>

        <button type="submit">Create Workspace</button>
      </form>
    </div>
  );
};