/**
 * Parses AI response to separate code from verbal feedback
 * @param {string} aiResponse - The full response from the AI API
 * @returns {Object} Object containing extracted code and feedback
 */
export const parseAIResponse = (aiResponse) => {
  if (!aiResponse) {
    return { code: null, feedback: "No AI response received." };
  }

  // Look for code within <AI_CODE> tags
  const codeRegex = /<AI_CODE>([\s\S]*?)<\/AI_CODE>/g;
  const matches = [...aiResponse.matchAll(codeRegex)];
  
  let extractedCode = null;
  let feedback = aiResponse;
  
  if (matches && matches.length > 0) {
    // Take the first code block found (typically there should be just one)
    extractedCode = matches[0][1].trim();
    
    // Remove all code blocks from the original response to get just the feedback
    feedback = aiResponse.replace(codeRegex, '').trim();
  }
  
  // If no code was found with the tags, check if there might be a formatting issue
  // Sometimes the AI might use markdown code blocks despite instructions
  if (!extractedCode) {
    const markdownRegex = /```(?:\w*\n)?([\s\S]*?)```/g;
    const markdownMatches = [...aiResponse.matchAll(markdownRegex)];
    
    if (markdownMatches && markdownMatches.length > 0) {
      extractedCode = markdownMatches[0][1].trim();
      feedback = `Note: AI provided code in markdown format instead of requested tags. 
      
${aiResponse.replace(markdownRegex, '').trim()}`;
    }
  }
  
  return {
    code: extractedCode,
    feedback: feedback
  };
};