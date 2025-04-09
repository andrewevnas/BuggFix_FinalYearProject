/**
 * Utility function to animate typing of code into the editor
 * @param {Object} editor - Monaco editor instance
 * @param {string} code - Target code to be typed
 * @param {number} speed - Typing speed (lower is faster)
 * @returns {Promise} Promise that resolves when animation is complete
 */
export const animateCodeTyping = (editor, code, speed = 30) => {
    return new Promise((resolve) => {
      // First get the current code to determine what needs to change
      const currentCode = editor.getValue();
      
      // Split both current and target code into lines
      const currentLines = currentCode.split('\n');
      const targetLines = code.split('\n');
      
      // Start with an empty editor if requested
      editor.setValue('');
      
      let linesAdded = 0;
      let currentLineIndex = 0;
      let currentCharIndex = 0;
      
      // Function to add the next character
      const typeNextChar = () => {
        // If we've completed all lines, resolve the promise
        if (currentLineIndex >= targetLines.length) {
          resolve();
          return;
        }
        
        // Get the current line we're working with
        const currentLine = targetLines[currentLineIndex];
        
        // If we've finished the current line
        if (currentCharIndex >= currentLine.length) {
          // Move to next line
          currentLineIndex++;
          currentCharIndex = 0;
          
          // Add a newline if we're not at the end
          if (currentLineIndex < targetLines.length) {
            editor.setValue(editor.getValue() + '\n');
          }
          
          // Continue typing
          setTimeout(typeNextChar, speed);
          return;
        }
        
        // Add the next character
        editor.setValue(editor.getValue() + currentLine[currentCharIndex]);
        currentCharIndex++;
        
        // Schedule the next character
        setTimeout(typeNextChar, speed);
      };
      
      // Start the typing animation
      typeNextChar();
    });
  };
  
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