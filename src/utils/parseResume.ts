// Resume parsing utilities

/**
 * Extract skills from resume text
 */
export const extractSkills = (resumeText: string, skillsList: string[]): string[] => {
  try {
    const foundSkills: string[] = [];
    
    // Convert resume text to lowercase for case-insensitive matching
    const lowerText = resumeText.toLowerCase();
    
    // Check for each skill in the skills list
    skillsList.forEach(skill => {
      const lowerSkill = skill.toLowerCase();
      if (lowerText.includes(lowerSkill)) {
        foundSkills.push(skill);
      }
    });
    
    return foundSkills;
  } catch (error) {
    console.error('Error extracting skills:', error);
    return [];
  }
};

/**
 * Extract education from resume text
 */
export const extractEducation = (resumeText: string): any[] => {
  // This is a simplified placeholder. In a real implementation,
  // you would use NLP or complex regex patterns to identify education sections.
  try {
    // Very basic pattern matching - not reliable in real-world scenarios
    const educationRegex = /(?:education|university|college|school)(?:[\s\S]*?)(?:bachelor|master|phd|associate|degree|diploma)/gi;
    const matches = resumeText.match(educationRegex);
    
    if (!matches) return [];
    
    // This is just a placeholder returning the raw matches
    return matches.map(match => ({ rawText: match }));
  } catch (error) {
    console.error('Error extracting education:', error);
    return [];
  }
};

/**
 * Extract work experience from resume text
 */
export const extractExperience = (resumeText: string): any[] => {
  // This is a simplified placeholder. In a real implementation,
  // you would use NLP or complex regex patterns to identify experience sections.
  try {
    // Very basic pattern matching - not reliable in real-world scenarios
    const experienceRegex = /(?:experience|work|employment)(?:[\s\S]*?)(?:company|position|role|title|job)/gi;
    const matches = resumeText.match(experienceRegex);
    
    if (!matches) return [];
    
    // This is just a placeholder returning the raw matches
    return matches.map(match => ({ rawText: match }));
  } catch (error) {
    console.error('Error extracting experience:', error);
    return [];
  }
}; 