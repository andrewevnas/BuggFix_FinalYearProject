import React, { useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom"; // useNavigate for "home" link
import "./WSindex.scss";
import { EditorContainer } from "./editorContainer";
import { makeSubmission } from "./service";

export const WorkspaceScreen = () => {
  const params = useParams();
  const { fileId, folderId } = params;

  const navigate = useNavigate();

  // For the nav menu (burger toggle)
  const [isNavOpen, setIsNavOpen] = useState(false);

  // Input / Output / AI states 
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [activeTab, setActiveTab] = useState("input");
  const [showLoader, setShowLoader] = useState(false);

  const importInput = (e) => {
    // Same as before
    const file = e.target.files[0];
    if (file && file.type.includes("text")) {
      const fileReader = new FileReader();
      fileReader.readAsText(file);
      fileReader.onload = (e) => {
        setInput(e.target.result);
      };
    } else {
      alert("Please choose a valid text file");
    }
  };
  
  const exportOutput = () => {
    // Same as before
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

  // Callback for the code execution
  const callback = ({ apiStatus, data, message }) => {
    if (apiStatus === "loading") {
      setShowLoader(true);
      setOutput("");
    } else if (apiStatus === "error") {
      setShowLoader(false);
      setOutput("Something went wrong");
    } else {
      // success
      setShowLoader(false);
      if (data.status.id === 3) {
        setOutput(atob(data.stdout));
      } else {
        setOutput(atob(data.stderr));
      }
    }
  };

  // This is used by EditorContainer to run code
  const runCode = useCallback(
    ({ code, language }) => {
      makeSubmission({ code, language, stdin: input, callback });
    },
    [input]
  );

  const runAI = async (userCode, language) => {
    try {
      setShowLoader(true);
      const response = await fetch("http://localhost:4000/api/ai/fix-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: userCode, language }),
      });
      const data = await response.json();
      setShowLoader(false);
  
      if (data.suggestions) {
        setAiSuggestions(data.suggestions);
        setActiveTab("ai"); // show the AI Suggestions tab
      } else {
        setAiSuggestions("No suggestions returned from server.");
        setActiveTab("ai");
      }
    } catch (error) {
      setShowLoader(false);
      console.error(error);
      setAiSuggestions("Error calling AI endpoint.");
      setActiveTab("ai");
    }
  };

  // For logo click: navigate to home
  const goHome = () => {
    // This can eventually navigate to "/" or any route you create
    navigate("/"); 
  };
  

  return (
    <div className="workspace-container">
      {/* HEADER / NAVBAR */}
      <header className="main-header">
        <div className="logo-area" onClick={goHome}>
          <img src="./BFlogo.png" className="logo" alt="logo" />
        </div>

        {/* Hamburger icon (shown on small screens) */}
        <div
          className="burger"
          onClick={() => setIsNavOpen((prev) => !prev)}
        >
          <span className="material-icons">menu</span>
        </div>

        {/* Nav Links */}
        <nav className={isNavOpen ? "nav-links open" : "nav-links"}>
          {/* Example links, replace with real routes later */}
          <a href="#page1" onClick={() => setIsNavOpen(false)}>Page1</a>
          <a href="#page2" onClick={() => setIsNavOpen(false)}>Page2</a>
          <a href="#page3" onClick={() => setIsNavOpen(false)}>Page3</a>
        </nav>
      </header>

      {/* Rest of the content */}
      <div className="content-container">
        {/* Editor on the left */}
        <div className="editor-container">
          <EditorContainer
            fileId={fileId}
            folderId={folderId}
            runCode={runCode}
            runAI={runAI}
          />
        </div>

        {/* Right-side tabs */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={activeTab === "input" ? "active" : ""}
              onClick={() => setActiveTab("input")}
            >
              Input
            </button>
            <button
              className={activeTab === "output" ? "active" : ""}
              onClick={() => setActiveTab("output")}
            >
              Output
            </button>
            <button
              className={activeTab === "ai" ? "active" : ""}
              onClick={() => setActiveTab("ai")}
            >
              AI Suggestions
            </button>
          </div>

          <div className="tabs-content">
            {activeTab === "input" && (
              <div className="input-container">
                <div className="input-header">
                  <b>Input:</b>
                  <button className="icon-container">
                    <label htmlFor="inputFile" style={{ cursor: "pointer" }}>
                      <span className="material-icons">cloud_upload</span>
                      <b>Import Input</b>
                    </label>
                  </button>
                  <input
                    type="file"
                    id="inputFile"
                    style={{ display: "none" }}
                    onChange={importInput}
                  />
                </div>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                />
              </div>
            )}

            {activeTab === "output" && (
              <div className="output-container">
                <div className="output-header">
                  <b>Output:</b>
                  <button className="icon-container" onClick={exportOutput}>
                    <span className="material-icons">cloud_download</span>
                    <b>Export Output</b>
                  </button>
                </div>
                <textarea readOnly value={output} />
              </div>
            )}

            {activeTab === "ai" && (
              <div className="ai-suggestions-container">
                <b>AI Suggestions:</b>
                <textarea
                  readOnly
                  value={aiSuggestions}
                  placeholder="No AI suggestions yet."
                />
              </div>
            )}
          </div>
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