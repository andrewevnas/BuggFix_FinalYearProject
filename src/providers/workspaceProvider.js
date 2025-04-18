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
          { folders: newFolders }, // Send all folders to replace the entire workspace
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
      
      await axios.post(
        `${API_URL}/workspaces`,
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

  // DELETE FOLDER 
  const deleteFolder = async (id) => {
    console.log("Deleting folder with ID:", id);
    
    // Create updated list without the deleted folder
    const updatedFoldersList = folders.filter((folderItem) => {
      return folderItem.id !== id;
    });
    
    // Update local state immediately for responsive UI
    setFolders(updatedFoldersList);
    
    // Update localStorage
    localStorage.setItem("data", JSON.stringify(updatedFoldersList));
    
    // If authenticated, sync to cloud using the same method as createNewWorkspace
    if (isAuthenticated()) {
      try {
        console.log("Syncing folder deletion to cloud");
        await axios.post(
          `${API_URL}/workspaces`,
          { folders: updatedFoldersList },
          { headers: getAuthHeader() }
        );
        
        setSyncMessage({
          type: 'success',
          text: 'Folder deleted and synced to cloud'
        });
      } catch (error) {
        console.error("Error syncing folder deletion:", error);
        setSyncMessage({
          type: 'warning',
          text: 'Folder deleted locally but not synced to cloud'
        });
      }
    } else {
      setSyncMessage({
        type: 'info',
        text: 'Folder deleted locally. Log in to sync changes.'
      });
    }
    
    return true;
  };

  // EDIT FOLDER TITLE 
  const editFolderTitle = async (newFolderName, id) => {
    console.log("Editing folder title:", id, "to", newFolderName);
    
    // Create updated folders list with new title
    const updatedFoldersList = folders.map((folderItem) => {
      if (folderItem.id === id) {
        return { ...folderItem, title: newFolderName };
      }
      return folderItem;
    });
    
    // Update local state immediately
    setFolders(updatedFoldersList);
    
    // Update localStorage
    localStorage.setItem("data", JSON.stringify(updatedFoldersList));
    
    // If authenticated, sync to cloud using the same method as createNewWorkspace
    if (isAuthenticated()) {
      try {
        console.log("Syncing folder title update to cloud");
        await axios.post(
          `${API_URL}/workspaces`,
          { folders: updatedFoldersList },
          { headers: getAuthHeader() }
        );
        
        setSyncMessage({
          type: 'success',
          text: 'Folder title updated and synced to cloud'
        });
      } catch (error) {
        console.error("Error syncing folder title update:", error);
        setSyncMessage({
          type: 'warning',
          text: 'Folder title updated locally but not synced to cloud'
        });
      }
    } else {
      setSyncMessage({
        type: 'info',
        text: 'Folder title updated locally. Log in to sync changes.'
      });
    }
    
    return true;
  };

  // EDIT FILE TITLE 
  const editFileTitle = async (newFileName, folderId, fileId) => {
    console.log("Editing file title:", fileId, "in folder", folderId, "to", newFileName);
    
    // Create deep copy to avoid reference issues
    const updatedFolders = JSON.parse(JSON.stringify(folders));
    
    // Find and update the file title
    for (let i = 0; i < updatedFolders.length; i++) {
      if (folderId === updatedFolders[i].id) {
        const files = updatedFolders[i].files;
        for (let j = 0; j < files.length; j++) {
          if (files[j].id === fileId) {
            files[j].title = newFileName;
            break;
          }
        }
        break;
      }
    }
    
    // Update local state immediately
    setFolders(updatedFolders);
    
    // Update localStorage
    localStorage.setItem("data", JSON.stringify(updatedFolders));
    
    // If authenticated, sync to cloud using the same method as createNewWorkspace
    if (isAuthenticated()) {
      try {
        console.log("Syncing file title update to cloud");
        await axios.post(
          `${API_URL}/workspaces`,
          { folders: updatedFolders },
          { headers: getAuthHeader() }
        );
        
        setSyncMessage({
          type: 'success',
          text: 'File title updated and synced to cloud'
        });
      } catch (error) {
        console.error("Error syncing file title update:", error);
        setSyncMessage({
          type: 'warning',
          text: 'File title updated locally but not synced to cloud'
        });
      }
    } else {
      setSyncMessage({
        type: 'info',
        text: 'File title updated locally. Log in to sync changes.'
      });
    }
    
    return true;
  };

  // DELETE FILE 
  const deleteFile = async (folderId, fileId) => {
    console.log("Deleting file:", fileId, "from folder", folderId);
    
    // Create deep copy to avoid reference issues
    const updatedFolders = JSON.parse(JSON.stringify(folders));
    
    // Find and remove the file
    for (let i = 0; i < updatedFolders.length; i++) {
      if (updatedFolders[i].id === folderId) {
        updatedFolders[i].files = updatedFolders[i].files.filter(file => file.id !== fileId);
        break;
      }
    }
    
    // Update local state immediately
    setFolders(updatedFolders);
    
    // Update localStorage
    localStorage.setItem("data", JSON.stringify(updatedFolders));
    
    // If authenticated, sync to cloud using the same method as createNewWorkspace
    if (isAuthenticated()) {
      try {
        console.log("Syncing file deletion to cloud");
        await axios.post(
          `${API_URL}/workspaces`,
          { folders: updatedFolders },
          { headers: getAuthHeader() }
        );
        
        setSyncMessage({
          type: 'success',
          text: 'File deleted and synced to cloud'
        });
      } catch (error) {
        console.error("Error syncing file deletion:", error);
        setSyncMessage({
          type: 'warning',
          text: 'File deleted locally but not synced to cloud'
        });
      }
    } else {
      setSyncMessage({
        type: 'info',
        text: 'File deleted locally. Log in to sync changes.'
      });
    }
    
    return true;
  };

  // CREATE NEW CARD 
  const createNewCard = async (folderId, file) => {
    console.log("Creating new card in folder:", folderId);
    
    // Create deep copy to avoid reference issues
    const updatedFolders = JSON.parse(JSON.stringify(folders));
    
    // Add the new file
    for (let i = 0; i < updatedFolders.length; i++) {
      if (updatedFolders[i].id === folderId) {
        updatedFolders[i].files.push(file);
        break;
      }
    }
    
    // Update local state immediately
    setFolders(updatedFolders);
    
    // Update localStorage
    localStorage.setItem("data", JSON.stringify(updatedFolders));
    
    // If authenticated, sync to cloud using the same method as createNewWorkspace
    if (isAuthenticated()) {
      try {
        console.log("Syncing new card to cloud");
        await axios.post(
          `${API_URL}/workspaces`,
          { folders: updatedFolders },
          { headers: getAuthHeader() }
        );
        
        setSyncMessage({
          type: 'success',
          text: 'New card created and synced to cloud'
        });
      } catch (error) {
        console.error("Error syncing new card:", error);
        setSyncMessage({
          type: 'warning',
          text: 'New card created locally but not synced to cloud'
        });
      }
    } else {
      setSyncMessage({
        type: 'info',
        text: 'New card created locally. Log in to sync changes.'
      });
    }
    
    return true;
  };

  // UPDATE LANGUAGE 
  const updateLanguage = async (fileId, folderId, language) => {
    console.log("Updating language for file:", fileId, "in folder", folderId, "to", language);
    
    // Create deep copy to avoid reference issues
    const updatedFolders = JSON.parse(JSON.stringify(folders));
    
    // Find and update the file language
    for (let i = 0; i < updatedFolders.length; i++) {
      if (updatedFolders[i].id === folderId) {
        for (let j = 0; j < updatedFolders[i].files.length; j++) {
          const currentFile = updatedFolders[i].files[j];
          if (fileId === currentFile.id) {
            updatedFolders[i].files[j].code = defaultCodes[language];
            updatedFolders[i].files[j].language = language;
          }
        }
      }
    }
    
    // Update local state immediately
    setFolders(updatedFolders);
    
    // Update localStorage
    localStorage.setItem("data", JSON.stringify(updatedFolders));
    
    // If authenticated, sync to cloud using the same method as createNewWorkspace
    if (isAuthenticated()) {
      try {
        console.log("Syncing language update to cloud");
        await axios.post(
          `${API_URL}/workspaces`,
          { folders: updatedFolders },
          { headers: getAuthHeader() }
        );
        
        setSyncMessage({
          type: 'success',
          text: 'Language updated and synced to cloud'
        });
      } catch (error) {
        console.error("Error syncing language update:", error);
        setSyncMessage({
          type: 'warning',
          text: 'Language updated locally but not synced to cloud'
        });
      }
    } else {
      setSyncMessage({
        type: 'info',
        text: 'Language updated locally. Log in to sync changes.'
      });
    }
    
    return true;
  };

  // SAVE CODE 
  const saveCode = async (fileId, folderId, newCode) => {
    console.log("Saving code for file:", fileId, "in folder", folderId);
    
    // Create deep copy to avoid reference issues
    const updatedFolders = JSON.parse(JSON.stringify(folders));
    
    // Find and update the code
    for (let i = 0; i < updatedFolders.length; i++) {
      if (updatedFolders[i].id === folderId) {
        for (let j = 0; j < updatedFolders[i].files.length; j++) {
          const currentFile = updatedFolders[i].files[j];
          if (fileId === currentFile.id) {
            updatedFolders[i].files[j].code = newCode;
            updatedFolders[i].files[j].lastEdited = new Date();
          }
        }
      }
    }
    
    // Update local state immediately
    setFolders(updatedFolders);
    
    // Update localStorage
    localStorage.setItem("data", JSON.stringify(updatedFolders));
    
    // If authenticated, sync to cloud using the same method as createNewWorkspace
    if (isAuthenticated()) {
      try {
        console.log("Syncing code update to cloud");
        await axios.post(
          `${API_URL}/workspaces`,
          { folders: updatedFolders },
          { headers: getAuthHeader() }
        );
        
        setSyncMessage({
          type: 'success',
          text: 'Code saved and synced to cloud'
        });
      } catch (error) {
        console.error("Error syncing code update:", error);
        setSyncMessage({
          type: 'warning',
          text: 'Code saved locally but not synced to cloud'
        });
      }
    } else {
      setSyncMessage({
        type: 'info',
        text: 'Code saved locally. Log in to sync changes.'
      });
    }
    
    return true;
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