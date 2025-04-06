import { useParams } from "react-router-dom";
import "./WSindex.scss";
import { EditorContainer } from "./editorContainer";
import { useCallback, useState } from "react";
import { makeSubmission } from "./service";

export const WorkspaceScreen = () => {
  const params = useParams();
  const { fileId, folderId } = params;

  const [input, setInput] = useState("");

  const [output, setOutput] = useState("");

  const [showLoader, setShowLoader] = useState(false);

  const importInput = (e) => {
    const file = e.target.files[0];
    const fileType = file.type.includes("text");

    if (fileType) {
      const fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = (e) => {
        setInput(e.target.result);
      };
    } else {
      alert("Please choose a program file");
    }
  };

  const exportOutput = () => {
    // download a txt file with the contents from the output textarea
    const outputValue = output.trim();
    if (!outputValue) {
      alert("Output is Empty");
      return;
    }

    const blob = new Blob([outputValue], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `output.txt`;
    link.click();
  };

  const callback = ({ apiStatus, data, message }) => {
    if (apiStatus === "loading") {
      setShowLoader(true);
    } else if (apiStatus === "error") {
      setOutput("Something went wrong");
    } else {
      // apiStatus === success
      if (data.status.id === 3) {
        setOutput(atob(data.stdout));
      } else {
        setOutput(atob(data.stderr));
      }
    }
  };

  const runCode = useCallback(
    ({ code, language }) => {
      // console.log(code, language, input)
      makeSubmission({ code, language, stdin: input, callback });
    },
    [input]
  );

  return (
    <div className="workspace-container">
      <div className="header-container">
        <img src="./BFlogo.png" className="logo" />
      </div>

      <div className="content-container">
        <div className="editor-container">
          <EditorContainer
            fileId={fileId}
            folderId={folderId}
            runCode={runCode}
          />
        </div>

        <div className="input-output-container">
          <div className="input-header">
            <b>Input:</b>
            <button htmlFor="input" className="icon-container">
              <span className="material-icons">cloud_upload</span>
              <b>Import Input</b>
            </button>

            <input
              type="file"
              id="input"
              style={{ display: "none" }}
              onChange={importInput}
            />
          </div>
          <textarea
            placeholder="Enter desired input BEFORE compiling code:"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
        </div>

        <div className="input-output-container">
          <div className="input-header">
            <b>Output:</b>
            <button className="icon-container" onClick={exportOutput}>
              <span className="material-icons">cloud_download</span>
              <b>Export Output</b>
            </button>
          </div>
          <textarea
            readOnly
            value={output}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
        </div>
      </div>

      {showLoader && (
        <div className="fullpage-loader">
          <div className="loader"></div>
        </div>
      )}
    </div>
  );
};
