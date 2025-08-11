import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./WSindex.scss";
import { EditorContainer } from "./editorContainer";
import { makeSubmission } from "./service";
import { parseAIResponse } from "./parseAiResponse";
import { WorkspaceContext, defaultCodes } from "../../providers/workspaceProvider";
import { useContext } from "react";

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

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

/**
 * Enhanced animation that maintains indentation and structure better
 * @param {Object} editor - Monaco editor instance
 * @param {string} code - Target code to be typed
 * @param {number} speed - Typing speed (lower is faster)
 * @returns {Promise} Promise that resolves when animation is complete
 */
export const animateCodeTypingEnhanced = (editor, code, speed = 15) => {
  return new Promise((resolve) => {
    // Split target code into lines
    const targetLines = code.split('\n');
    
    // Clear the editor
    editor.setValue('');
    
    let currentLineIndex = 0;
    
    // Function to type the next line
    const typeNextLine = () => {
      // If we've completed all lines, resolve the promise
      if (currentLineIndex >= targetLines.length) {
        resolve();
        return;
      }
      
      // Get the current line we're working with
      const currentLine = targetLines[currentLineIndex];
      
      // Determine indentation (leading whitespace)
      const indentation = currentLine.match(/^(\s*)/)[0];
      const content = currentLine.substring(indentation.length);
      
      // First add the indentation instantly (no animation)
      const currentContent = editor.getValue();
      editor.setValue(
        currentContent + 
        (currentLineIndex > 0 ? '\n' : '') + 
        indentation
      );
      
      // Then animate typing the content of the line
      let contentIndex = 0;
      
      const typeContent = () => {
        if (contentIndex >= content.length) {
          // Move to next line
          currentLineIndex++;
          setTimeout(typeNextLine, speed * 2); // Pause between lines
          return;
        }
        
        // Add the next character
        editor.setValue(
          editor.getValue() + content[contentIndex]
        );
        
        contentIndex++;
        
        // Schedule the next character
        setTimeout(typeContent, speed);
      };
      
      // Start typing the content
      typeContent();
    };
    
    // Start the typing animation
    typeNextLine();
  });
};

export const WorkspaceScreen = () => {
  const params = useParams();
  const { fileId, folderId } = params;
  const navigate = useNavigate();
  
  // Get workspace context for saving and loading code
  const workspaceContext = useContext(WorkspaceContext);
  const { getDefaultCode, getLanguage } = workspaceContext;

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
  
  // Initialize language from context or default to cpp
  const [language, setLanguage] = useState(() => {
    try {
      if (fileId && folderId) {
        const fileLanguage = getLanguage(fileId, folderId);
        return fileLanguage || "cpp"; // Default to cpp if no language found
      }
    } catch (error) {
      console.error("Error getting language:", error);
    }
    return "cpp"; // Default language if not found
  });
  
  // Get the initial code - prioritize saved code, fall back to language default
  const [code, setCode] = useState(() => {
    try {
      if (fileId && folderId) {
        // First try to get saved code
        const savedCode = getDefaultCode(fileId, folderId);
        
        if (savedCode) {
          console.log("Loading saved code");
          return savedCode;
        }
        
        // If no saved code, use language default
        const fileLanguage = getLanguage(fileId, folderId);
        if (fileLanguage && defaultCodes[fileLanguage]) {
          console.log(`Loading default code for ${fileLanguage}`);
          return defaultCodes[fileLanguage];
        }
      }
    } catch (error) {
      console.error("Error loading code:", error);
    }
    
    // Last resort fallback - use default for current language
    console.log(`Using fallback default code for ${language}`);
    return defaultCodes[language] || "";
  });
  
  // Track original code and AI code versions
  const [originalCode, setOriginalCode] = useState(null);
  const [aiCode, setAiCode] = useState(null);
  
  // Track whether we're currently viewing original or AI code
  const [isViewingOriginalCode, setIsViewingOriginalCode] = useState(true);
  
  // Reference to the current Monaco editor instance
  const [editorInstance, setEditorInstance] = useState(null);
  
  // State to track if animation is in progress
  const [isAnimating, setIsAnimating] = useState(false);

  // Check if file exists, if not navigate to home
  useEffect(() => {
    // Verify that the file exists
    if (fileId && folderId) {
      try {
        const code = getDefaultCode(fileId, folderId);
        const lang = getLanguage(fileId, folderId);
        
        // If both code and language are undefined, file doesn't exist
        if (code === undefined && lang === undefined) {
          console.warn("File not found, navigating to home");
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking file existence:", error);
        navigate("/");
      }
    }
  }, [fileId, folderId, navigate, getDefaultCode, getLanguage]);

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

 
  const runCode = useCallback(
    ({ language }) => {
      
      makeSubmission({ code, language, stdin: input, callback });
    },
    [input, code] // Add code as a dependency so it updates when code changes
  );

  // Function to toggle between original and AI code with animation
  const toggleCodeVersion = async () => {
    // If animation is already in progress, don't allow another toggle
    if (isAnimating || !editorInstance) return;
    
    // Set animating state to block multiple toggles
    setIsAnimating(true);
    
    try {
      if (isViewingOriginalCode) {
        // Switch to AI code
        if (aiCode) {
          // Instead of directly setting the code state, animate it
          // First set an empty string to prepare for animation
          setCode("");
          
          // Show notification
          const notification = document.createElement("div");
          notification.className = "save-notification ai-update";
          notification.textContent = "Displaying AI suggestions...";
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => document.body.removeChild(notification), 500);
          }, 1000);
          
          // Wait a brief moment for the UI to update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Begin animation
          await animateCodeTypingEnhanced(editorInstance, aiCode);
          
          // After animation completes, update the state
          setCode(aiCode);
          setIsViewingOriginalCode(false);
          
          // Show notification that animation is complete
          const completionNotification = document.createElement("div");
          completionNotification.className = "save-notification ai-update";
          completionNotification.textContent = "AI code applied";
          document.body.appendChild(completionNotification);
          
          setTimeout(() => {
            completionNotification.classList.add("fade-out");
            setTimeout(() => document.body.removeChild(completionNotification), 500);
          }, 2000);
        }
      } else {
        // Switch to original code
        if (originalCode) {
          
          // First set an empty string to prepare for animation
          setCode("");
          
          // Show notification
          const notification = document.createElement("div");
          notification.className = "save-notification revert";
          notification.textContent = "Restoring original code...";
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => document.body.removeChild(notification), 500);
          }, 1000);
          
          // Wait a brief moment for the UI to update
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Begin animation
          await animateCodeTypingEnhanced(editorInstance, originalCode);
          
          // After animation completes, update the state
          setCode(originalCode);
          setIsViewingOriginalCode(true);
          
          // Show notification that animation is complete
          const completionNotification = document.createElement("div");
          completionNotification.className = "save-notification revert";
          completionNotification.textContent = "Original code restored";
          document.body.appendChild(completionNotification);
          
          setTimeout(() => {
            completionNotification.classList.add("fade-out");
            setTimeout(() => document.body.removeChild(completionNotification), 500);
          }, 2000);
        }
      }
    } catch (error) {
      console.error("Animation error:", error);
      
      // If animation fails, just update the state directly
      if (isViewingOriginalCode && aiCode) {
        setCode(aiCode);
        setIsViewingOriginalCode(false);
      } else if (!isViewingOriginalCode && originalCode) {
        setCode(originalCode);
        setIsViewingOriginalCode(true);
      }
    } finally {
      // Reset animating state
      setIsAnimating(false);
    }
  };

  // Update code from AI suggestions
  const updateCodeFromAI = (currentCode, newAiCode) => {
    if (newAiCode === null) {
      // saving the original state
      setOriginalCode(currentCode);
      setIsViewingOriginalCode(true);
    } else {
      // Save both versions but don't update code 
      if (originalCode === null) {
        setOriginalCode(currentCode);
      }
      
      // Only store the AI code, but don't apply it yet
      setAiCode(newAiCode);
    }
  };

  // Function to handle the editor instance being mounted
  const handleEditorDidMount = (editor) => {
    setEditorInstance(editor);
  };

  const runAI = async (userCode, language) => {
    try {
      setShowLoader(true);
      const response = await fetch(`${API_URL}/ai/fix-code`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ code: userCode, language }),
});
      const data = await response.json();
      setShowLoader(false);
  
      if (data.suggestions) {
        // Parse the AI response to separate code from feedback
        const { code: extractedCode, feedback } = parseAIResponse(data.suggestions);
        
        // Update the AI suggestions tab with verbal feedback only
        setAiSuggestions(feedback);
        
        // If code was found in the response, animate and update the editor
        if (extractedCode && editorInstance) {
          // Save the original code first if we haven't already
          if (!originalCode) {
            setOriginalCode(userCode);
          }
          
          // Store the AI code for later toggling
          setAiCode(extractedCode);
          
          // Set animation state to true
          setIsAnimating(true);
          
          try {
            // Show notification
            const notification = document.createElement("div");
            notification.className = "save-notification ai-update";
            notification.textContent = "Applying AI suggestions...";
            document.body.appendChild(notification);
            
            setTimeout(() => {
              notification.classList.add("fade-out");
              setTimeout(() => document.body.removeChild(notification), 500);
            }, 1000);
            
            // Set the state 
            setIsViewingOriginalCode(false);
            
            // Wait a brief moment for the UI to update
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Begin the animation
            await animateCodeTypingEnhanced(editorInstance, extractedCode);
            
            // After animation completes, update the state
            setCode(extractedCode);
            
            // Show a notification that animation is complete
            const completionNotification = document.createElement("div");
            completionNotification.className = "save-notification ai-update";
            completionNotification.textContent = "AI code applied";
            document.body.appendChild(completionNotification);
            
            setTimeout(() => {
              completionNotification.classList.add("fade-out");
              setTimeout(() => document.body.removeChild(completionNotification), 500);
            }, 2000);
          } catch (error) {
            console.error("Animation error:", error);
            
            // If animation fails, just update the code directly
            setCode(extractedCode);
          } finally {
            // Reset animation state
            setIsAnimating(false);
          }
        } else {
          // If no code was extracted, just show a notification
          const notification = document.createElement("div");
          notification.className = "save-notification";
          notification.textContent = "AI provided feedback but no code changes";
          document.body.appendChild(notification);
          
          setTimeout(() => {
            notification.classList.add("fade-out");
            setTimeout(() => document.body.removeChild(notification), 500);
          }, 2000);
        }
        
        // Show the AI Suggestions tab for feedback
        setActiveTab("ai");
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
            code={code}
            setCode={setCode}
            originalCode={originalCode}
            resetToOriginalCode={toggleCodeVersion}
            updateCodeFromAI={updateCodeFromAI}
            isViewingOriginalCode={isViewingOriginalCode}
            onEditorDidMount={handleEditorDidMount}
            isAnimating={isAnimating}
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
      
      {/* Animation in progress indicator */}
      {isAnimating && (
        <div className="animation-in-progress">
          <div className="animation-indicator"></div>
        </div>
      )}
    </div>
  );
};