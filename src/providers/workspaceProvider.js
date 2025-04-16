// src/providers/workspaceProvider.js - Modified version
import { createContext, useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { AuthContext } from "./authProvider";
import axios from 'axios';

export const WorkspaceContext = createContext();

const API_URL = 'http://localhost:4000/api'; // Adjust to your API URL

export const defaultCodes = {
  // Your existing default codes
};

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated, currentUser, getAuthHeader } = useContext(AuthContext);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState(null);
  
  // Load workspaces either from API or localStorage
  useEffect(() => {
    const loadWorkspaces = async () => {
      setLoading(true);
      if (isAuthenticated()) {
        // Get workspaces from API
        try {
          const response = await axios.get(`${API_URL}/workspaces`, {
            headers: getAuthHeader()
          });
          setFolders(response.data.folders || []);
          setSyncMessage({
            type: 'success',
            text: `Welcome back, ${currentUser.displayName}! Your workspaces are synced.`
          });
        } catch (error) {
          console.error("Error loading workspaces:", error);
          // Fallback to local storage
          const localData = localStorage.getItem("data");
          if (localData) {
            setFolders(JSON.parse(localData));
            setSyncMessage({
              type: 'warning',
              text: 'Failed to load your saved workspaces. Using local data instead.'
            });
          }
        }
      } else {
        // Load from localStorage for guests
        const localData = localStorage.getItem("data");
        if (localData) {
          setFolders(JSON.parse(localData));
        }
      }
      setLoading(false);
    };

    loadWorkspaces();
  }, [isAuthenticated, currentUser]);

  // Save workspaces to both API and localStorage
  const saveWorkspaces = async (updatedFolders) => {
    setFolders(updatedFolders);
    
    // Always save to localStorage as a backup and for guest mode
    localStorage.setItem("data", JSON.stringify(updatedFolders));
    
    // If authenticated, also save to API
    if (isAuthenticated()) {
      try {
        await axios.put(
          `${API_URL}/workspaces/${currentUser._id}`, 
          { folders: updatedFolders },
          { headers: getAuthHeader() }
        );
      } catch (error) {
        console.error("Error saving workspaces to API:", error);
        setSyncMessage({
          type: 'warning',
          text: 'Your changes are saved locally but not synced to the cloud.'
        });
      }
    }
  };

  // Create new workspace
  const createNewWorkspace = async (newWorkspace) => {
    const { fileName, folderName, language } = newWorkspace;
    const newFolders = [...folders];

    const newFolder = {
      id: v4(),
      title: folderName,
      files: [
        {
          id: v4(),
          title: fileName,
          code: defaultCodes[language],
          language,
        },
      ],
    };
    
    newFolders.push(newFolder);

    // Save to both localStorage and API if authenticated
    await saveWorkspaces(newFolders);
    
    // Show welcome message for guests with a prompt to register
    if (!isAuthenticated()) {
      setSyncMessage({
        type: 'info',
        text: 'Your workspace is saved locally. Create an account to save it to the cloud!'
      });
    }
  };

  // Your other CRUD operations
  const deleteFolder = async (id) => {
    const updatedFoldersList = folders.filter((folderItem) => {
      return folderItem.id !== id;
    });
  
    await saveWorkspaces(updatedFoldersList);
  };

  const editFolderTitle = async (newFolderName, id) => {
    const updatedFoldersList = folders.map((folderItem) => {
      if (folderItem.id === id) {
        folderItem.title = newFolderName;
      }
      return folderItem;
    });
  
    await saveWorkspaces(updatedFoldersList);
  };

  const editFileTitle = async (newFileName, folderId, fileId) => {
    const copiedFolders = [...folders];
    for (let i = 0; i < copiedFolders.length; i++) {
      if (folderId === copiedFolders[i].id) {
        const files = copiedFolders[i].files;
        for (let j = 0; j < files.length; j++) {
          if (files[j].id === fileId) {
            files[j].title = newFileName;
            break;
          }
        }
        break;
      }
    }
  
    await saveWorkspaces(copiedFolders);
  };

  const deleteFile = async (folderId, fileId) => {
    const copiedFolders = [...folders];
    for (let i = 0; i < copiedFolders.length; i++) {
      if (copiedFolders[i].id === folderId) {
        const files = [...copiedFolders[i].files];
        copiedFolders[i].files = files.filter((file) => {
          return file.id !== fileId;
        });
        break;
      }
    }
  
    await saveWorkspaces(copiedFolders);
  };

  const createNewCard = async (folderId, file) => {
    const copiedFolders = [...folders];
    for (let i = 0; i < copiedFolders.length; i++) {
      if (copiedFolders[i].id === folderId) {
        copiedFolders[i].files.push(file);
        break;
      }
    }
  
    await saveWorkspaces(copiedFolders);
  };

  const getDefaultCode = (fileId, folderId) => {
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === folderId) {
        for (let j = 0; j < folders[i].files.length; j++) {
          const currentFile = folders[i].files[j];
          if (fileId === currentFile.id) {
            return currentFile.code;
          }
        }
      }
    }
  };

  const getFileTitle = (fileId, folderId) => {
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === folderId) {
        for (let j = 0; j < folders[i].files.length; j++) {
          const currentFile = folders[i].files[j];
          if (fileId === currentFile.id) {
            return currentFile.title;
          }
        }
      }
    }
    return null; 
  };

  const getLanguage = (fileId, folderId) => {
    for (let i = 0; i < folders.length; i++) {
      if (folders[i].id === folderId) {
        for (let j = 0; j < folders[i].files.length; j++) {
          const currentFile = folders[i].files[j];
          if (fileId === currentFile.id) {
            return currentFile.language;
          }
        }
      }
    }
  };

  const updateLanguage = async (fileId, folderId, language) => {
    const newFolders = [...folders];
    for (let i = 0; i < newFolders.length; i++) {
      if (newFolders[i].id === folderId) {
        for (let j = 0; j < newFolders[i].files.length; j++) {
          const currentFile = newFolders[i].files[j];
          if (fileId === currentFile.id) {
            newFolders[i].files[j].code = defaultCodes[language];
            newFolders[i].files[j].language = language;
          }
        }
      }
    }
  
    await saveWorkspaces(newFolders);
  };

  const saveCode = async (fileId, folderId, newCode) => {
    const newFolders = [...folders];
    for (let i = 0; i < newFolders.length; i++) {
      if (newFolders[i].id === folderId) {
        for (let j = 0; j < newFolders[i].files.length; j++) {
          const currentFile = newFolders[i].files[j];
          if (fileId === currentFile.id) {
            newFolders[i].files[j].code = newCode;
          }
        }
      }
    }
  
    await saveWorkspaces(newFolders);
  };

  const workspaceFeatures = {
    folders,
    loading,
    syncMessage,
    createNewWorkspace,
    deleteFolder,
    editFolderTitle,
    editFileTitle,
    deleteFile,
    createNewCard,
    getDefaultCode,
    getLanguage,
    updateLanguage,
    saveCode,
    getFileTitle, 
    clearSyncMessage: () => setSyncMessage(null)
  };

  return (
    <WorkspaceContext.Provider value={workspaceFeatures}>
      {children}
    </WorkspaceContext.Provider>
  );
};