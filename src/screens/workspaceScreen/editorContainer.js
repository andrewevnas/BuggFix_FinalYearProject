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
  resetToOriginalCode,  // This will now toggle between versions with animation
  updateCodeFromAI,  // Prop to handle AI suggested code updates
  isViewingOriginalCode, // Added to properly reflect UI state
  onEditorDidMount, // New prop to pass editor instance to parent
  isAnimating = false // Flag to indicate if animation is in progress
}) => {
  const { getDefaultCode, getLanguage, updateLanguage, saveCode } =
    useContext(WorkspaceContext);

  const [language, setLanguage] = useState(() => getLanguage(fileId, folderId));
  const [theme, setTheme] = useState("vs-dark");
  
  // We still keep a ref for editor-internal operations
  const editorRef = useRef(null);

  const onChangeCode = (newCode) => {
    // Don't update code during animation to avoid conflicts
    if (!isAnimating) {
      setCode(newCode);
    }
  };

  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      };
    } else {
      alert("Please choose a program file");
    }
  };

  const onExportCode = () => {
    // Don't allow exporting during animation
    if (isAnimating) return;
    
    // Use the current code state directly, not the ref
    const codeValue = code?.trim();

    if (!codeValue) {
      alert("Please type some code in the editor before exporting");
      return;
    }

    const codeBlob = new Blob([codeValue], { type: "text/plain" });
    const downloadUrl = URL.createObjectURL(codeBlob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `code.${fileExtensionMapping[language]}`;
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
  };

  const onChangeTheme = (e) => {
    setTheme(e.target.value);
  };

  const onSaveCode = () => {
    // Don't allow saving during animation
    if (isAnimating) return;
    
    // Use the current code state directly, not the ref
    saveCode(fileId, folderId, code);
    
    const notification = document.createElement("div");
    notification.className = "save-notification";
    notification.textContent = "Code saved successfully";
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.classList.add("fade-out");
      setTimeout(() => document.body.removeChild(notification), 500);
    }, 2000);
  };

  const fullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const onRunCode = () => {
    // Don't allow running during animation
    if (isAnimating) return;
    
    // Important: We're now calling runCode with only the language
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
      className={`root-editor-container ${isAnimating ? 'animating' : ''}`}
      style={isFullScreen ? styles.fullScreen : {}}
    >
      <div className="editor-header">
        <div className="editor-left-container">
          <b className="title">Code Editor</b>
          <span className="material-icons">edit</span>
          <button onClick={onSaveCode} disabled={isAnimating}>
            <span className="material-icons">save</span>
            Save Code
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
        <button className="btn" onClick={fullScreen} disabled={isAnimating}>
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

const styles = {
  fullScreen: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 0,
  },
};