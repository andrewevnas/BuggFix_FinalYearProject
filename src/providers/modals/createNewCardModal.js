import { useContext } from "react";
import { ModalContext } from "../modalProvider";
import "./createWorkspaceModal.scss";
import { defaultCodes, WorkspaceContext } from "../workspaceProvider";
import { v4 } from 'uuid';

export const CreateNewCardModal = () => {
  const { closeModal, modalPayload } = useContext(ModalContext);
  const { createNewCard } = useContext(WorkspaceContext);

  const onSubmitModal = (e) => {
    e.preventDefault();
    const fileName = e.target.fileName.value;
    const language = e.target.language.value;

    const file = {
      id: v4(),
      title: fileName,
      language,
      code: defaultCodes[language],
    };

    createNewCard(modalPayload, file);
    closeModal();
  };

  return (
    <div className="modal-container">
      <form className="modal-body" onSubmit={onSubmitModal}>
        <span onClick={closeModal} className="material-icons close">
          close
        </span>
        <h1>Create New File</h1>
        
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
        
        <button type="submit">Create File</button>
      </form>
    </div>
  );
};