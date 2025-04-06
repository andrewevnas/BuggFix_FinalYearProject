import { use, useContext, useRef, useState } from "react";
import "./editorContainer.scss";
import "./WSindex.scss";
import Editor from "@monaco-editor/react";
import { WorkspaceContext } from "../../providers/workspaceProvider";

const editorOptions = {
  fontSize: 15,
  wordWrap: "on",
};

const fileExtensionMapping = {
    cpp: 'cpp',
    javascript: 'js',
    python: 'py',
    java: 'java'
  };
  

export const EditorContainer = ({fileId, folderId, runCode}) => {
  const {getDefaultCode, getLanguage, updateLanguage, saveCode} = useContext(WorkspaceContext);
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
      alert("Please Type Some code in the editor before exporting");
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
    alert("Code Saved Successfully");
  };
  
  const fullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const onRunCode = () => {
    runCode({ code: codeRef.current, language });
  };
  
  
  
  

  return (
    <div className="root-editor-container" style = {isFullScreen ? styles.fullScreen : {}}>
        <div className="editor-header">
          <div className="editor-left-container">
            <b className="title">"title of the card"</b>
            <span className="material-icons">edit</span>
            <button onClick= {onSaveCode}>Save Code</button>
          </div>

          <div className="editor-left-container">
            <button onClick= {onSaveCode}>RUN AI</button>
          </div>

          <div className="editor-right-container">
            <select onChange = {onChangeLanguage} value = {language}>
              <option value="cpp">cpp</option>
              <option value="javascript">javascript</option>
              <option value="java">java</option>
              <option value="python">python</option>
            </select>

            <select onChange = {onChangeTheme} value = {theme}>
              <option value="vs-dark">vs-dark</option>
              <option value="vs-light">vs-light</option>
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
            <span className="material-icons">fullscreen</span>
            <span>{isFullScreen ? "Minimize" : "Full Screen"}</span>
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

          <button className="btn" onClick = {onExportCode}>
            <span className="material-icons">cloud_download</span>
            <span>Export Code</span>
          </button>

          <button className="btn" onClick = {onRunCode}>
            <span className="material-icons">play_arrow</span>
            <span>Run Code</span>
          </button>
        </div>
    </div>
  );

  
};

const styles = {
  fullScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10
  }
};

