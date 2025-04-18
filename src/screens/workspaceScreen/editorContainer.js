import { useContext, useEffect, useRef, useState } from "react";
import "./editorContainer.scss";
import "./WSindex.scss";
import Editor from "@monaco-editor/react";
import { WorkspaceContext } from "../../providers/workspaceProvider";

const editorOptions = {
  fontSize: 15,
  wordWrap: "on",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 10 },
  fixedOverflowWidgets: true
};

const fileExtensionMapping = {
  cpp: "cpp",
  javascript: "js",
  python: "py",
  java: "java",
};

export const EditorContainer = ({ 
  fileId, 
  folderId, 
  runCode, 
  runAI, 
  code,  // Prop for code
  setCode,  // Prop to update code
  originalCode,  // Prop to track original code
  resetToOriginalCode,  // For toggling between versions
  updateCodeFromAI,  // Prop to handle AI suggested code updates
  isViewingOriginalCode, // Added to properly reflect UI state
  onEditorDidMount, // Prop to pass editor instance to parent
  isAnimating = false // Flag to indicate if animation is in progress
}) => {
  // Get the saveCode function from WorkspaceContext
  const { getDefaultCode, getLanguage, updateLanguage, saveCode, editFileTitle, getFileTitle } =
    useContext(WorkspaceContext);

  const [language, setLanguage] = useState(() => getLanguage(fileId, folderId));
  const [theme, setTheme] = useState("vs-dark");
  
  // State for file title and editing mode
  const [fileTitle, setFileTitle] = useState(() => getFileTitle(fileId, folderId) || "Untitled");
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const titleInputRef = useRef(null);
  
  // We keep a ref for editor-internal operations
  const editorRef = useRef(null);
  
  // Reference to the original container for fullscreen toggle
  const containerRef = useRef(null);

  // Check if code was saved successfully
  const [isSaved, setIsSaved] = useState(false);

  // Fetch the file title whenever fileId or folderId changes
  useEffect(() => {
    if (fileId && folderId) {
      const title = getFileTitle(fileId, folderId);
      if (title) {
        setFileTitle(title);
      }
    }
  }, [fileId, folderId, getFileTitle]);

  // Handle focus on input when editing title starts
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [isEditingTitle]);

  const onChangeCode = (newCode) => {
    // Don't update code during animation to avoid conflicts
    if (!isAnimating) {
      setCode(newCode);
      // If code changes after save, reset the saved state
      if (isSaved) {
        setIsSaved(false);
      }
    }
  };

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  
  // Store original position and dimensions for fullscreen toggle
  const [originalStyles, setOriginalStyles] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth <= 768;
      setIsMobile(newIsMobile);
      
      // Adjust editor layout on resize
      if (window.monaco && window.monaco.editor) {
        const editors = window.monaco.editor.getEditors();
        if (editors.length) {
          setTimeout(() => {
            editors.forEach(editor => editor.layout());
          }, 100);
        }
      }
      
      // If window is resized while in fullscreen, adjust the fullscreen dimensions
      if (isFullScreen && containerRef.current) {
        containerRef.current.style.width = `${window.innerWidth}px`;
        containerRef.current.style.height = `${window.innerHeight}px`;
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [isFullScreen]);
  
  // Handle editor layout update when fullscreen state changes
  useEffect(() => {
    if (editorRef.current) {
      // Give it a moment to update the DOM
      setTimeout(() => {
        editorRef.current.layout();
      }, 100);
    }
  }, [isFullScreen]);

  // Toggle code version and update the state
  const toggleCodeVersion = () => {
    // Don't allow toggle during animation
    if (!isAnimating) {
      resetToOriginalCode(); // Call the toggle function from parent which now includes animation
    }
  };

  const onUploadCode = (event) => {
    // Don't allow uploading during animation
    if (isAnimating) return;
    
    const file = event.target.files[0];
    const fileType = file.type.includes("text");
    if (fileType) {
      const fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = function (value) {
        const importedCode = value.target.result;
        setCode(importedCode);
        // Reset saved state when new code is uploaded
        setIsSaved(false);
      };
    } else {
      alert("Please choose a program file");
    }
  };

  const onExportCode = () => {
    // Don't allow exporting during animation
    if (isAnimating) return;
    
    // Use the current code state directly, not a ref
    const codeValue = code?.trim();

    if (!codeValue) {
      alert("Please type some code in the editor before exporting");
      return;
    }

    const codeBlob = new Blob([codeValue], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(codeBlob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${fileTitle}.${fileExtensionMapping[language]}`;
    link.click();
  };

  const onChangeLanguage = (e) => {
    // Don't allow language change during animation
    if (isAnimating) return;
    
    const newLanguage = e.target.value;
    updateLanguage(fileId, folderId, newLanguage);
    const defaultCode = getDefaultCode(fileId, folderId);
    setCode(defaultCode);
    setLanguage(newLanguage);
    // Reset saved state when language changes
    setIsSaved(false);
  };

  const onChangeTheme = (e) => {
    setTheme(e.target.value);
  };

  const onSaveCode = () => {
    // Don't allow saving during animation
    if (isAnimating) return;
    
    // Make sure we have valid IDs
    if (!fileId || !folderId) {
      console.error("Missing fileId or folderId for saving code");
      
      const notification = document.createElement("div");
      notification.className = "save-notification error";
      notification.textContent = "Error: Could not save code. Missing file information.";
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 2000);
      
      return;
    }
    
    try {
      // Use the saveCode function from context to save the code
      saveCode(fileId, folderId, code);
      
      // Set saved state to true
      setIsSaved(true);
      
      // Show success notification
      const notification = document.createElement("div");
      notification.className = "save-notification";
      notification.textContent = "Code saved successfully";
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 2000);
    } catch (error) {
      console.error("Error saving code:", error);
      
      // Show error notification
      const errorNotification = document.createElement("div");
      errorNotification.className = "save-notification error";
      errorNotification.textContent = "Error saving code. Please try again.";
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        errorNotification.classList.add("fade-out");
        setTimeout(() => document.body.removeChild(errorNotification), 500);
      }, 2000);
    }
  };

  // Start editing the file title
  const startEditingTitle = () => {
    if (isAnimating) return;
    setIsEditingTitle(true);
  };

  // Handle title input change
  const handleTitleChange = (e) => {
    setFileTitle(e.target.value);
  };

  // Handle title save on Enter or blur
  const saveTitle = () => {
    if (fileTitle.trim() === '') {
      setFileTitle(getFileTitle(fileId, folderId) || 'Untitled');
      setIsEditingTitle(false);
      return;
    }

    try {
      // Save the updated title to context
      editFileTitle(fileTitle, folderId, fileId);
      
      // Show success notification
      const notification = document.createElement("div");
      notification.className = "save-notification";
      notification.textContent = "File name updated";
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.classList.add("fade-out");
        setTimeout(() => document.body.removeChild(notification), 500);
      }, 2000);
    } catch (error) {
      console.error("Error updating file title:", error);
      
      // Show error notification
      const errorNotification = document.createElement("div");
      errorNotification.className = "save-notification error";
      errorNotification.textContent = "Error updating file name";
      document.body.appendChild(errorNotification);
      
      setTimeout(() => {
        errorNotification.classList.add("fade-out");
        setTimeout(() => document.body.removeChild(errorNotification), 500);
      }, 2000);
    }
    
    setIsEditingTitle(false);
  };

  // Handle key press in title input
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveTitle();
    } else if (e.key === 'Escape') {
      setFileTitle(getFileTitle(fileId, folderId) || 'Untitled');
      setIsEditingTitle(false);
    }
  };

  const toggleFullScreen = () => {
    if (!containerRef.current) return;
    
    if (!isFullScreen) {
      // Save original styles before going fullscreen
      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      
      setOriginalStyles({
        position: container.style.position || '',
        top: container.style.top || '',
        left: container.style.left || '',
        right: container.style.right || '',
        bottom: container.style.bottom || '',
        width: container.style.width || '',
        height: container.style.height || '',
        zIndex: container.style.zIndex || '',
        borderRadius: container.style.borderRadius || '',
        transform: container.style.transform || '',
        transition: container.style.transition || '',
      });
      
      // Apply fullscreen styles
      container.style.position = "fixed";
      container.style.top = "0";
      container.style.left = "0";
      container.style.right = "0";
      container.style.bottom = "0";
      container.style.width = "100vw";
      container.style.height = "100vh";
      container.style.zIndex = "1000";
      container.style.borderRadius = "0";
      // Add smooth transition
      container.style.transition = "all 0.3s ease-in-out";
      
      setIsFullScreen(true);
    } else {
      // Restore original styles
      const container = containerRef.current;
      
      if (originalStyles) {
        Object.entries(originalStyles).forEach(([prop, value]) => {
          container.style[prop] = value;
        });
      } else {
        // Reset to default styles if original styles weren't saved
        container.style.position = "";
        container.style.top = "";
        container.style.left = "";
        container.style.right = "";
        container.style.bottom = "";
        container.style.width = "";
        container.style.height = "";
        container.style.zIndex = "";
        container.style.borderRadius = "";
        container.style.transition = "";
      }
      
      setIsFullScreen(false);
    }
    
    // Give the editor a moment to adjust its layout
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.layout();
      }
    }, 300);
  };

  const onRunCode = () => {
    // Don't allow running during animation
    if (isAnimating) return;
    
    
    // The code is now accessed directly from the parent's state
    runCode({ language });
  };

  const onRunAI = () => {
    // Don't allow running AI during animation
    if (isAnimating) return;
    
    // Save the current code as original before AI suggestions
    if (!originalCode) {
      updateCodeFromAI(code, null);
    }
    runAI(code, language);
  };

  // Store reference to the editor instance and pass it to the parent
  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    if (onEditorDidMount) {
      onEditorDidMount(editor);
    }
  };

  return (
    <div
      ref={containerRef}
      className={`root-editor-container ${isAnimating ? 'animating' : ''} ${isFullScreen ? 'fullscreen' : ''}`}
    >
      <div className="editor-header">
        <div className="editor-left-container">
          {isEditingTitle ? (
            <div className="title-edit-container">
              <input
                ref={titleInputRef}
                type="text"
                value={fileTitle}
                onChange={handleTitleChange}
                onBlur={saveTitle}
                onKeyDown={handleKeyDown}
                className="title-input"
                disabled={isAnimating}
              />
              <span className="material-icons save-title-btn" onClick={saveTitle}>check</span>
            </div>
          ) : (
            <div className="title-display" onClick={startEditingTitle}>
              <b className="title">{fileTitle}</b>
              <span className="material-icons edit-title-icon">edit</span>
            </div>
          )}
          <button 
            onClick={onSaveCode} 
            disabled={isAnimating}
            className={isSaved ? "saved-button" : ""}
          >
            <span className="material-icons">{isSaved ? "check_circle" : "save"}</span>
            {isSaved ? "Saved" : "Save Code"}
          </button>
        </div>

        <div className="editor-left-container">
          <button onClick={onRunAI} className="ai-button" disabled={isAnimating}>
            <span className="material-icons">auto_fix_high</span>
            Run AI
          </button>
        </div>

        {/* Toggle button between original and AI code when both versions exist */}
        {originalCode && (
          <div className="editor-left-container">
            <button 
              onClick={toggleCodeVersion} 
              className={isViewingOriginalCode ? "ai-button" : "revert-button"}
              disabled={isAnimating}
            >
              <span className="material-icons">
                {isViewingOriginalCode ? "auto_fix_high" : "restore"}
              </span>
              {isAnimating ? "Typing in progress..." : 
                (isViewingOriginalCode ? "Show AI Code" : "Show Original Code")}
            </button>
          </div>
        )}

        <div className="editor-right-container">
          <select onChange={onChangeLanguage} value={language} disabled={isAnimating}>
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
            <option value="python">Python</option>
          </select>

          <select onChange={onChangeTheme} value={theme}>
            <option value="vs-dark">Dark Theme</option>
            <option value="vs-light">Light Theme</option>
          </select>
        </div>
      </div>

      <div className={`editor-body ${isAnimating ? 'editing-animation' : ''}`}>
        <Editor
          height={"100%"}
          language={language}
          options={{
            ...editorOptions,
            readOnly: isAnimating // Make editor read-only during animation
          }}
          theme={theme}
          onChange={onChangeCode}
          value={code}
          onMount={handleEditorDidMount}
        />
      </div>

      <div className="editor-footer">
        <button className="btn" onClick={toggleFullScreen} disabled={isAnimating}>
          <span className="material-icons">
            {isFullScreen ? "fullscreen_exit" : "fullscreen"}
          </span>
          <span>{isFullScreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </button>

        <label htmlFor="import-code" className={`btn ${isAnimating ? 'disabled' : ''}`}>
          <span className="material-icons">cloud_upload</span>
          <span>Import Code</span>
        </label>
        <input
          type="file"
          id="import-code"
          style={{ display: "none" }}
          onChange={onUploadCode}
          disabled={isAnimating}
        />

        <button className="btn" onClick={onExportCode} disabled={isAnimating}>
          <span className="material-icons">cloud_download</span>
          <span>Export Code</span>
        </button>

        <button className="btn run-btn" onClick={onRunCode} disabled={isAnimating}>
          <span className="material-icons">play_arrow</span>
          <span>Run Code</span>
        </button>
      </div>
    </div>
  );
};