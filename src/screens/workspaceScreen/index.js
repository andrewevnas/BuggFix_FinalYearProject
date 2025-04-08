import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./WSindex.scss";
import { EditorContainer } from "./editorContainer";
import { makeSubmission } from "./service";

// ResizeObserver error prevention
const debounce = (fn, delay) => {
  let timeoutId;
  return (...args) => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
    timeoutId = setTimeout(() => {
      fn(...args);
    }, delay);
  };
};

// Add this to your index.js file or wherever you initialize your React app

// Prevent ResizeObserver loop limit exceeded error
const resizeObserverError = error => {
  if (error.message.includes('ResizeObserver loop limit exceeded') || 
      error.message.includes('ResizeObserver loop completed with undelivered notifications')) {
    // Just returning prevents the error from being logged to the console
    return;
  }
  // For all other errors, log as normal
  console.error(error);
};

// Add the error handler
window.addEventListener('error', event => {
  resizeObserverError(event.error);
});

// Handle promise rejection errors too
window.addEventListener('unhandledrejection', event => {
  if (event.reason instanceof Error) {
    resizeObserverError(event.reason);
  }
});
export const WorkspaceScreen = () => {

  
  const params = useParams();
  const { fileId, folderId } = params;
  const navigate = useNavigate();

  // For the nav menu (burger toggle)
  const [isNavOpen, setIsNavOpen] = useState(false);
  
  // State for responsive layout
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  // Input / Output / AI states 
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState("");
  const [activeTab, setActiveTab] = useState("input");
  const [showLoader, setShowLoader] = useState(false);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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

  const callback = ({ apiStatus, data, message }) => {
    if (apiStatus === "loading") {
      setShowLoader(true);
      setOutput("");
    } else if (apiStatus === "error") {
      setShowLoader(false);
      setOutput("Something went wrong");
      // After it fails, maybe you still want to show output tab:
      setActiveTab("output");
    } else {
      // success
      setShowLoader(false);
      if (data.status.id === 3) {
        setOutput(atob(data.stdout));
      } else {
        setOutput(atob(data.stderr));
      }
      // Switch to Output after data is ready
      setActiveTab("output");
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
    navigate("/"); 
  };
  
  useEffect(() => {
    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth <= 768);
    }, 100); // 100ms debounce
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="workspace-container">
      {/* HEADER / NAVBAR */}
      <header className="main-header">
        <div className="logo-area" onClick={goHome}>
          <img src="/BFlogo.png" className="logo" alt="logo" />
          <span className="logo-text">BUGGFIX</span>
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
          <a href="#dashboard" onClick={() => setIsNavOpen(false)}>Dashboard</a>
          <a href="#projects" onClick={() => setIsNavOpen(false)}>Projects</a>
          <a href="#settings" onClick={() => setIsNavOpen(false)}>Settings</a>
        </nav>
      </header>

      {/* Rest of the content */}
      <div className="content-container">
        {/* Editor on the left (or top on mobile) */}
        <div className="editor-container">
          <EditorContainer
            fileId={fileId}
            folderId={folderId}
            runCode={runCode}
            runAI={runAI}
          />
        </div>

        {/* Right-side tabs (or bottom on mobile) */}
        <div className="tabs-container">
          <div className="tabs-header">
            <button
              className={activeTab === "input" ? "active" : ""}
              onClick={() => setActiveTab("input")}
            >
              <span className="material-icons">input</span>
              {!isMobile && "Input"}
            </button>
            <button
              className={activeTab === "output" ? "active" : ""}
              onClick={() => setActiveTab("output")}
            >
              <span className="material-icons">output</span>
              {!isMobile && "Output"}
            </button>
            <button
              className={activeTab === "ai" ? "active" : ""}
              onClick={() => setActiveTab("ai")}
            >
              <span className="material-icons">psychology</span>
              {!isMobile && "AI Suggestions"}
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
                      <b>Import</b>
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
                  placeholder="Enter your input here..."
                />
              </div>
            )}

            {activeTab === "output" && (
              <div className="output-container">
                <div className="output-header">
                  <b>Output:</b>
                  <button className="icon-container" onClick={exportOutput}>
                    <span className="material-icons">cloud_download</span>
                    <b>Export</b>
                  </button>
                </div>
                <textarea 
                  readOnly 
                  value={output} 
                  placeholder="Output will appear here after running your code..."
                />
              </div>
            )}

            {activeTab === "ai" && (
              <div className="ai-suggestions-container">
                <div className="output-header">
                  <b>AI Suggestions:</b>
                </div>
                <textarea
                  readOnly
                  value={aiSuggestions}
                  placeholder="AI suggestions will appear here when you use the 'Run AI' button..."
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