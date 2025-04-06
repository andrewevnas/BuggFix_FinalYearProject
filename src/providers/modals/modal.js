import { useContext } from "react";
import { modalConstants, ModalContext } from "../modalProvider";

import { CreateWorkspaceModal } from "./createWorkspaceModal";
import { UpdateFolderTitleModal } from "./updateFolderTitleModal";
import { UpdateFileTitleModal } from "./updateFileTitleModal";
import { CreateNewCardModal } from "./createNewCardModal";
// import { CreateFolderModal } from "./createFolderModal";

export const Modal = () => {
  const modalFeatures = useContext(ModalContext);

  return <>
      {modalFeatures.activeModal === modalConstants.CREATE_WORKSPACE && (<CreateWorkspaceModal />)}
      {modalFeatures.activeModal === modalConstants.UPDATE_FOLDER_TITLE && (<UpdateFolderTitleModal />)}
      {modalFeatures.activeModal === modalConstants.UPDATE_FILE_TITLE && (<UpdateFileTitleModal />)}
      {modalFeatures.activeModal === modalConstants.CREATE_NEW_CARD && (<CreateNewCardModal />)}
      {/* {modalFeatures.activeModal === modalConstants.CREATE_FOLDER && (<CreateFolderModal />)} */}
    </>

    
  
  
}