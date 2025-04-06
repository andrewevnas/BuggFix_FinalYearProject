import { createContext, useState } from "react";


export const ModalContext = createContext();

export const modalConstants = 
{
  CREATE_WORKSPACE: 'CREATE_WORKSPACE',
  UPDATE_FOLDER_TITLE: 'UPDATE_FOLDER_TITLE',
  // CREATE_FOLDER: 'CREATE_FOLDER'
  UPDATE_FILE_TITLE: 'UPDATE_FILE_TITLE',
  CREATE_NEW_CARD: 'CREATE_NEW_CARD'
}

export const ModalProvider = ({ children }) => {
  const [modalType, setModalType] = useState(null);

  const [modalPayload, setModalPayload] = useState();

const closeModal = () => {
  setModalType(null);
};

const modalFeatures = {
  openModal: setModalType,
  closeModal,
  activeModal: modalType,
  modalPayload,
  setModalPayload
};


  return (
    <ModalContext.Provider value={modalFeatures}>
      {children}
    </ModalContext.Provider>
  );
};
