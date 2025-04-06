import { useContext } from "react";
import { ModalContext } from "../modalProvider";
import "./createWorkspaceModal.scss";
import { defaultCodes, WorkspaceContext, WorkspaceProvider } from "../workspaceProvider";
import {v4} from 'uuid';

export const CreateNewCardModal = () => {
  const { closeModal, modalPayload } = useContext(ModalContext);
  const { createNewCard} = useContext(WorkspaceContext);

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
        <h1>Create New Playground</h1>
        <div className="item">
          <input name="fileName" placeholder="Enter card title" required />
        </div>
        <div className="item">
          <select name="language" required>
            <option value="cpp">CPP</option>
            <option value="java">Java</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>
        <button type="submit">Create Playground</button>
      </form>
    </div>
  );
};
