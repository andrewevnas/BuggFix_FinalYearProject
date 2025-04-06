import { createContext, useContext, useEffect, useState } from "react";
import { v4 } from "uuid";

export const WorkspaceContext = createContext();

const initialData = [
  {
    id: v4(),
    title: "Spring Boot",
    files: [
      {
        id: v4(),
        title: "index",
        code: 'cout<<"hello world";',
        language: "cpp",
      },
    ],
  },

  {
    id: v4(),
    title: "Frontend",
    files: [
      {
        id: v4(),
        title: "test",
        code: 'console.log("Hello Frontend"',
        language: "javascript",
      },
    ],
  },
];

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
  const [folders, setFolders] = useState(() => {
    const localData = localStorage.getItem("data");
    if (localData) {
      return JSON.parse(localData);
    }
    return initialData;
  });

  const createNewWorkspace = (newWorkspace) => {
    const { fileName, folderName, language } = newWorkspace;
    const newFolders = [...folders];

    newFolders.push({
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
    });

    localStorage.setItem("data", JSON.stringify(newFolders));
    setFolders(newFolders);
  };

  const deleteFolder = (id) => {
    const updatedFoldersList = folders.filter((folderItem) => {
      return folderItem.id !== id;
    });
  
    localStorage.setItem('data', JSON.stringify(updatedFoldersList));
    setFolders(updatedFoldersList);
  };

  const editFolderTitle = (newFolderName, id) => {
    const updatedFoldersList = folders.map((folderItem) => {
      if (folderItem.id === id) {
        folderItem.title = newFolderName;
      }
      return folderItem;
    });
  
    localStorage.setItem('data', JSON.stringify(updatedFoldersList));
    setFolders(updatedFoldersList);
  };

  const editFileTitle = (newFileName, folderId, fileId) => {
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
  
    localStorage.setItem('data', JSON.stringify(copiedFolders));
    setFolders(copiedFolders);
  };

  const deleteFile = (folderId, fileId) => {
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
  
    localStorage.setItem('data', JSON.stringify(copiedFolders));
    setFolders(copiedFolders);
  };

  const createNewCard = (folderId, file) => {
    const copiedFolders = [...folders];
    for (let i = 0; i < copiedFolders.length; i++) {
      if (copiedFolders[i].id === folderId) {
        copiedFolders[i].files.push(file);
        break;
      }
    }
  
    localStorage.setItem('data', JSON.stringify(copiedFolders));
    setFolders(folders);
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

  const updateLanguage = (fileId, folderId, language) => {
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
  
    localStorage.setItem('data', JSON.stringify(newFolders));
    setFolders(newFolders);
  };

  const saveCode = (fileId, folderId, newCode) => {
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
  
    localStorage.setItem('data', JSON.stringify(newFolders));
    setFolders(newFolders);
  };
  
  
  
  
  
  
  
  
  
  

  useEffect(() => {
    if (!localStorage.getItem("data")) {
      localStorage.setItem("data", JSON.stringify(folders));
    }
  }, []);

  const workspaceFeatures = {
    folders,
    createNewWorkspace,
    deleteFolder,
    editFolderTitle,
    editFileTitle,
    deleteFile,
    createNewCard,
    getDefaultCode,
    getLanguage,
    updateLanguage,
    saveCode
    
  };

  return (
    <WorkspaceContext.Provider value={workspaceFeatures}>
      {children}
    </WorkspaceContext.Provider>
  );
};
