import { useContext, useEffect, useRef, useState } from "react";
import "./editorContainer.scss";
import "./WSindex.scss";
import Editor from "@monaco-editor/react";
import { WorkspaceContext } from "../../providers/workspaceProvider";

// Update the editorOptions object:
const editorOptions = {
  fontSize: 15,
  wordWrap: "on",
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  automaticLayout: true, // This helps with resize issues
  padding: { top: 10 },
  fixedOverflowWidgets: true // This helps prevent overflow issues
};

const fileExtensionMapping = {
  cpp: "cpp",
  javascript: "js",
  python: "py",
  java: "java",
};



export const EditorContainer = ({ fileId, folderId, runCode, runAI }) => {
  const { getDefaultCode, getLanguage, updateLanguage, saveCode } =
    useContext(WorkspaceContext);

  const [code, setCode] = useState(() => {
    return getDefaultCode(fileId, folderId);
  });

  const [language, setLanguage] = useState(() => getLanguage(fileId, folderId));
  const [theme, setTheme] = useState("vs-dark");
  const codeRef = useRef(code);
  const onChangeCode = (newCode) => {
    codeRef.current = newCode;
  };

  const [isFullScreen, setIsFullScreen] = useState(false);
  // Add this useEffect to properly handle Monaco Editor resizing
useEffect(() => {
  // Force relayout of Monaco editor when container size changes
  const handleResize = () => {
    if (window.monaco && window.monaco.editor) {
      const editors = window.monaco.editor.getEditors();
      if (editors.length) {
        editors.forEach(editor => {
          editor.layout();
        });
      }
    }
  };

  // Add a small delay to ensure the layout has settled
  const resizeWithDelay = () => {
    setTimeout(handleResize, 100);
  };

  window.addEventListener('resize', resizeWithDelay);
  
  return () => {
    window.removeEventListener('resize', resizeWithDelay);
  };
}, []);

  const onUploadCode = (event) => {
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
    const codeValue = codeRef.current?.trim();

    if (!codeValue) {
      alert("Please type some code in the editor before exporting");
      return;
    }

    // 1. create a blob / instant file in the memory
    const codeBlob = new Blob([codeValue], { type: "text/plain" });

    // 2. create the downloadable link with blob data
    const downloadUrl = URL.createObjectURL(codeBlob);

    // 3. create a clickable link to download the blob/file
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `code.${fileExtensionMapping[language]}`;
    link.click();
  };

  const onChangeLanguage = (e) => {
    updateLanguage(fileId, folderId, e.target.value);
    setCode(getDefaultCode(fileId, folderId));
    setLanguage(e.target.value);
  };

  const onChangeTheme = (e) => {
    setTheme(e.target.value);
  };

  const onSaveCode = () => {
    saveCode(fileId, folderId, codeRef.current);
    // Use a more subtle notification instead of alert
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
    runCode({ code: codeRef.current, language });
  };

  const onRunAI = () => {
    // We pass the current codeRef + the language to the parent's function
    runAI(codeRef.current, language);
  };

  

  return (
    <div
      className="root-editor-container"
      style={isFullScreen ? styles.fullScreen : {}}
    >
      <div className="editor-header">
        <div className="editor-left-container">
          <b className="title">Code Editor</b>
          <span className="material-icons">edit</span>
          <button onClick={onSaveCode}>
            <span className="material-icons">save</span>
            Save Code
          </button>
        </div>

        <div className="editor-left-container">
          <button onClick={onRunAI} className="ai-button">
            <span className="material-icons">auto_fix_high</span>
            Run AI
          </button>
        </div>

        <div className="editor-right-container">
          <select onChange={onChangeLanguage} value={language}>
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

      <div className="editor-body">
        <Editor
          height={"100%"}
          language={language}
          options={editorOptions}
          theme={theme}
          onChange={onChangeCode}
          value={code}
        />
      </div>

      <div className="editor-footer">
        <button className="btn" onClick={fullScreen}>
          <span className="material-icons">
            {isFullScreen ? "fullscreen_exit" : "fullscreen"}
          </span>
          <span>{isFullScreen ? "Exit Fullscreen" : "Fullscreen"}</span>
        </button>

        <label htmlFor="import-code" className="btn">
          <span className="material-icons">cloud_upload</span>
          <span>Import Code</span>
        </label>
        <input
          type="file"
          id="import-code"
          style={{ display: "none" }}
          onChange={onUploadCode}
        />

        <button className="btn" onClick={onExportCode}>
          <span className="material-icons">cloud_download</span>
          <span>Export Code</span>
        </button>

        <button className="btn" onClick={onRunCode}>
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