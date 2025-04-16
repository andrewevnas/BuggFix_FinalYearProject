import { createContext, useContext, useEffect, useState } from "react";
import { v4 } from "uuid";
import { AuthContext } from "./authProvider";
import axios from 'axios';

export const WorkspaceContext = createContext();

const API_URL = 'http://localhost:4000/api';

export const defaultCodes = {
  cpp: `#include <iostream>
using namespace std;
int main(){
  cout<<"Hello World";
  return 0;
}`,
  javascript: `console.log("hello javascript")`,
  python: `print("hello python")`,
  java: `public class Main{
  public static void main(String[] args) {
    System.out.println("Hello World");
  }
}`,
};

export const WorkspaceProvider = ({ children }) => {
  const { isAuthenticated, currentUser, getAuthHeader } = useContext(AuthContext);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncMessage, setSyncMessage] = useState(null);

  useEffect(() => {
    // Listen for logout event
    const handleLogout = () => {
      console.log("Logout detected, clearing workspaces");
      localStorage.removeItem('data');
      setFolders([]);
    };
    
    window.addEventListener('user-logout', handleLogout);
    
    return () => {
      window.removeEventListener('user-logout', handleLogout);
    };
  }, []);

  // Load workspaces when auth state changes
  useEffect(() => {
    loadWorkspaces();
  }, [isAuthenticated]); // Re-run when auth state changes

  // Function to load the appropriate workspaces
  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      if (isAuthenticated()) {
        console.log("Loading workspaces for authenticated user");
        const response = await axios.get(`${API_URL}/workspaces`, {
          headers: getAuthHeader()
        });
        
        console.log("API response:", response.data);
        
        if (response.data && Array.isArray(response.data) && response.data.length > 0) {
          // Access the folders array from the first workspace
          const cloudFolders = response.data[0].folders || [];
          console.log("Setting folders from cloud:", cloudFolders);
          setFolders(cloudFolders);
          
          // Also update localStorage
          localStorage.setItem("data", JSON.stringify(cloudFolders));
          
          setSyncMessage({
            type: 'success',
            text: `Welcome back, ${currentUser.displayName}! Your workspaces are synced.`
          });
        } else {
          console.log("No cloud workspaces found, keeping folders empty");
          setFolders([]);
          localStorage.removeItem("data");
        }
      } else {
        // Load from localStorage for guests
        console.log("Loading local workspaces for guest");
        const localData = localStorage.getItem("data");
        if (localData) {
          const localFolders = JSON.parse(localData);
          setFolders(localFolders);
        } else {
          setFolders([]);
        }
      }
    } catch (error) {
      console.error("Error loading workspaces:", error);
      // For errors, default to empty state
      setFolders([]);
      localStorage.removeItem("data");
    } finally {
      setLoading(false);
    }
  };

  // Create a new workspace
  const createNewWorkspace = async (newWorkspace) => {
    const { fileName, folderName, language } = newWorkspace;
    
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
    
    const newFolders = [...folders, newFolder];
    
    // Always update local state first for responsiveness
    setFolders(newFolders);
    
    // If authenticated, send to API to update the single workspace entry
    if (isAuthenticated()) {
      try {
        console.log("Saving workspace to cloud:", newFolders);
        await axios.post(
          `${API_URL}/workspaces`,
          { folders: newFolders }, // Send ALL folders to replace the entire workspace
          { headers: getAuthHeader() }
        );
        
        // Update localStorage for local persistence
        localStorage.setItem("data", JSON.stringify(newFolders));
        
        setSyncMessage({
          type: 'success',
          text: 'Workspace saved to the cloud'
        });
      } catch (error) {
        console.error("Error saving workspace to cloud:", error);
        setSyncMessage({
          type: 'warning',
          text: 'Your workspace was saved locally but could not be synced to the cloud'
        });
      }
    } else {
      // Guest mode - just save to localStorage
      localStorage.setItem("data", JSON.stringify(newFolders));
      setSyncMessage({
        type: 'info',
        text: 'Workspace saved locally. Log in to save to the cloud.'
      });
    }
  };

  // Sync workspaces to cloud
  const syncWorkspacesToCloud = async (foldersToSync = null) => {
    if (!isAuthenticated()) return;
    
    try {
      // Use provided folders or current state
      const foldersData = foldersToSync || folders;
      
      await axios.put(
        `${API_URL}/workspaces/sync`, 
        { folders: foldersData },
        { headers: getAuthHeader() }
      );
      
      setSyncMessage({
        type: 'success',
        text: 'Your workspaces have been synced to the cloud'
      });
      
      return true;
    } catch (error) {
      console.error("Error syncing workspaces:", error);
      setSyncMessage({
        type: 'error',
        text: 'Failed to sync workspaces to the cloud'
      });
      return false;
    }
  };

  // Update the folders and sync if authenticated
  const updateAndSync = async (updatedFolders) => {
    // Update local state and storage
    setFolders(updatedFolders);
    localStorage.setItem("data", JSON.stringify(updatedFolders));
    
    // Sync to cloud if authenticated
    if (isAuthenticated()) {
      try {
        await axios.put(
          `${API_URL}/workspaces/sync`,
          { folders: updatedFolders },
          { headers: getAuthHeader() }
        );
      } catch (error) {
        console.error("Error syncing to cloud:", error);
        setSyncMessage({
          type: 'warning',
          text: 'Changes saved locally but not synced to cloud'
        });
      }
    }
  };

  // MODIFY ALL EXISTING CRUD OPERATIONS TO USE updateAndSync
  
  const deleteFolder = async (id) => {
    const updatedFoldersList = folders.filter((folderItem) => {
      return folderItem.id !== id;
    });
  
    await updateAndSync(updatedFoldersList);
  };

  const editFolderTitle = async (newFolderName, id) => {
    const updatedFoldersList = folders.map((folderItem) => {
      if (folderItem.id === id) {
        return { ...folderItem, title: newFolderName };
      }
      return folderItem;
    });
  
    await updateAndSync(updatedFoldersList);
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
  
    await updateAndSync(copiedFolders);
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
  
    await updateAndSync(copiedFolders);
  };

  const createNewCard = async (folderId, file) => {
    const copiedFolders = [...folders];
    for (let i = 0; i < copiedFolders.length; i++) {
      if (copiedFolders[i].id === folderId) {
        copiedFolders[i].files.push(file);
        break;
      }
    }
  
    await updateAndSync(copiedFolders);
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
  
    await updateAndSync(newFolders);
  };

  const saveCode = async (fileId, folderId, newCode) => {
    const newFolders = [...folders];
    for (let i = 0; i < newFolders.length; i++) {
      if (newFolders[i].id === folderId) {
        for (let j = 0; j < newFolders[i].files.length; j++) {
          const currentFile = newFolders[i].files[j];
          if (fileId === currentFile.id) {
            newFolders[i].files[j].code = newCode;
            newFolders[i].files[j].lastEdited = new Date();
          }
        }
      }
    }
  
    await updateAndSync(newFolders);
  };

  // Get functions that don't modify data
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
    return null; // Return null if file not found
  };

  // Clear local storage on logout
  const clearLocalWorkspaces = () => {
    console.log("Clearing local workspaces");
    localStorage.removeItem('data');
    setFolders([]); // This ensures the UI is cleared
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
    syncWorkspacesToCloud,
    clearLocalWorkspaces,
    clearSyncMessage: () => setSyncMessage(null)
  };

  return (
    <WorkspaceContext.Provider value={workspaceFeatures}>
      {children}
    </WorkspaceContext.Provider>
  );
};