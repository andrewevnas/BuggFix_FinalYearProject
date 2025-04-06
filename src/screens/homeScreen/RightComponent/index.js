import { useContext } from "react";
import { WorkspaceContext } from "../../../providers/workspaceProvider";
import "./index.scss";
import { modalConstants, ModalContext } from "../../../providers/modalProvider";
import { useNavigate } from "react-router-dom";

const Folder = ({ folderTitle, cards, folderId }) => {
  const { deleteFolder, deleteFile } = useContext(WorkspaceContext);
  const { openModal, setModalPayload } = useContext(ModalContext);
  const navigate = useNavigate();

  const onDeleteFolder = () => {
    deleteFolder(folderId);
  };

  const onUpdateFolderTitle = () => {
    setModalPayload(folderId);
    openModal(modalConstants.UPDATE_FOLDER_TITLE);
  };

  const openNewCardModal = () => {
    setModalPayload(folderId);
    openModal(modalConstants.CREATE_NEW_CARD);
  };
  

  return (
    <div className="folder-container">
      <div className="folder-header">
        <div className="folder-header-item">
          <span className="material-icons" style={{ color: "#FFCA29" }}>
            folder
          </span>
          <span>{folderTitle}</span>
        </div>

        <div className="folder-header-item">
          <span className="material-icons" onClick={onDeleteFolder}>
            delete
          </span>
          <span className="material-icons" onClick={onUpdateFolderTitle}>
            edit
          </span>

          <span className="material-icons" onClick={openNewCardModal}>
            add
          </span>
        </div>
      </div>

      <div className="cards-container">
        {cards?.map((file, index) => {

          const onEditFile = () => {
            setModalPayload({ fileId: file.id, folderId: folderId });
            openModal(modalConstants.UPDATE_FILE_TITLE);
          };

          const onDeleteFile = () => {
            deleteFile(folderId, file.id);
          }

          const navigateToWorkspaceScreen = () => {
            // TODO: navigate to next screen by passing the fileId and folderId
            navigate(`/workspace/${file.id}/${folderId}`);
          };
          
          

          return (
            <div className="card" key={index} onClick = {navigateToWorkspaceScreen}>
              <img src="BFlogo.png" />
              <div className="title-container">
                <span>{file?.title}</span>
                <span>Language: {file?.language}</span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <span className="material-icons" onClick = {onDeleteFile}>
                  delete
                </span>
                <span className="material-icons" onClick={onEditFile}>
                  edit
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const RightComponent = () => {
  const { folders } = useContext(WorkspaceContext);
  const modalFeatures = useContext(ModalContext);

  // const openCreateNewFolderModal = () => {
  //   modalFeatures.openModal(modalFeatures.CREATE_FOLDER);
  // }

  return (
    <div className="right-container">
      <div className="header">
        <div className="title">
          <span>My</span> Workspace
        </div>
      </div>
      {folders?.map((folder, index) => {
        return (
          <Folder
            folderTitle={folder?.title}
            cards={folder?.files}
            key={folder.id}
            folderId={folder.id}
          />
        );
      })}
    </div>
  );
};
