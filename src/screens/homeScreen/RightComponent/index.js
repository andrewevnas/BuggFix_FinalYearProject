import { useContext } from "react";
import { WorkspaceContext } from "../../../providers/workspaceProvider";
import "./index.scss";
import { modalConstants, ModalContext } from "../../../providers/modalProvider";
import { useNavigate } from "react-router-dom";

const FileItem = ({ file, folderId, onEditFile, onDeleteFile, onClick }) => {
  return (
    <div className="file-item" onClick={onClick}>
      <div className="file-icon">
        <span className="material-icons">code</span>
      </div>
      <div className="file-info">
        <div className="file-name">{file.title}</div>
        <div className="file-language">Language: {file.language}</div>
      </div>
      <div className="file-actions">
        <span className="material-icons" onClick={(e) => {
          e.stopPropagation();
          onEditFile();
        }}>
          edit
        </span>
        <span className="material-icons" onClick={(e) => {
          e.stopPropagation();
          onDeleteFile();
        }}>
          delete
        </span>
      </div>
    </div>
  );
};

const WorkspaceCard = ({ folder, folderId }) => {
  const { deleteFolder, deleteFile } = useContext(WorkspaceContext);
  const { openModal, setModalPayload } = useContext(ModalContext);
  const navigate = useNavigate();

  const onDeleteFolder = (e) => {
    e.stopPropagation();
    deleteFolder(folderId);
  };

  const onUpdateFolderTitle = (e) => {
    e.stopPropagation();
    setModalPayload(folderId);
    openModal(modalConstants.UPDATE_FOLDER_TITLE);
  };

  const openNewCardModal = (e) => {
    e.stopPropagation();
    setModalPayload(folderId);
    openModal(modalConstants.CREATE_NEW_CARD);
  };

  return (
    <div className="workspace-card">
      <div className="workspace-header">
        <span className="material-icons folder-icon">folder</span>
        <span className="workspace-title">{folder.title}</span>
      </div>
      <div className="workspace-files">
        {folder.files?.map((file) => {
          const onEditFile = () => {
            setModalPayload({ fileId: file.id, folderId: folderId });
            openModal(modalConstants.UPDATE_FILE_TITLE);
          };

          const onDeleteFile = () => {
            deleteFile(folderId, file.id);
          };

          const navigateToWorkspaceScreen = () => {
            navigate(`/workspace/${file.id}/${folderId}`);
          };

          return (
            <FileItem
              key={file.id}
              file={file}
              folderId={folderId}
              onEditFile={onEditFile}
              onDeleteFile={onDeleteFile}
              onClick={navigateToWorkspaceScreen}
            />
          );
        })}
      </div>
      <div className="card-actions">
        <button onClick={onUpdateFolderTitle}>
          <span className="material-icons">edit</span>
        </button>
        <button onClick={onDeleteFolder}>
          <span className="material-icons">delete</span>
        </button>
        <button onClick={openNewCardModal}>
          <span className="material-icons">add</span>
        </button>
      </div>
    </div>
  );
};

export const RightComponent = () => {
  const { folders } = useContext(WorkspaceContext);
  const modalFeatures = useContext(ModalContext);

  const openCreateWorkspaceModal = () => {
    modalFeatures.openModal(modalConstants.CREATE_WORKSPACE);
  };

  return (
    <section className="workspace-section">
      <div className="section-header">
        <h2 className="section-title">
          <span className="highlight">My</span> Workspaces
        </h2>
        <button 
          className="create-workspace-btn" 
          onClick={openCreateWorkspaceModal}
        >
          <span className="material-icons">add</span>
          Create Workspace
        </button>
      </div>
      <div className="workspace-grid">
        {folders?.map((folder) => (
          <WorkspaceCard
            key={folder.id}
            folder={folder}
            folderId={folder.id}
          />
        ))}
      </div>
    </section>
  );
};