import type { ResumeSkills } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import { deepClone } from "lib/deep-clone";
import { initialFeaturedSkills } from "lib/redux/resumeSlice";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

/**
 * Extract skills from resume
 */
export const extractSkills = (sections: ResumeSectionToLines) => {
  const lines = getSectionLinesByKeywords(sections, ["skill"]);
  const descriptionsLineIdx = getDescriptionsLineIdx(lines) ?? 0;
  const descriptionsLines = lines.slice(descriptionsLineIdx);
  const descriptions = getBulletPointsFromLines(descriptionsLines);

  const featuredSkills = deepClone(initialFeaturedSkills);
  if (descriptionsLineIdx !== 0) {
    const featuredSkillsLines = lines.slice(0, descriptionsLineIdx);
    const featuredSkillsTextItems = featuredSkillsLines
      .flat()
      .filter((item) => item.text.trim())
      .slice(0, 6);
    for (let i = 0; i < featuredSkillsTextItems.length; i++) {
      featuredSkills[i].skill = featuredSkillsTextItems[i].text;
    }
  }

  const skills: ResumeSkills = {
    featuredSkills,
    descriptions,
  };

  return { skills };
};

/**
 * Process skills lines to match against skills.csv
 * This function will be called from the client side
 */
export const processSkillsFromDescriptions = async (
  skillsDescriptions: string[]
): Promise<string[]> => {
  // Load skills from CSV file
  try {
    const response = await fetch('/assets/skills.csv');
    const text = await response.text();
    
    // Parse CSV and extract skills (skip header)
    const lines = text.split('\n');
    const knownSkills = lines.slice(1).map(line => line.trim()).filter(Boolean);
    
    // Extract skills from descriptions
    const foundSkills = new Set<string>();
    
    // Join all descriptions into one string and convert to lowercase for matching
    const fullText = skillsDescriptions.join(' ').toLowerCase();
    
    // Check each skill against the full text with word boundary checks
    knownSkills.forEach(skill => {
      // Skip very short skills to avoid false positives
      if (skill.length <= 2) return;
      
      try {
        // Convert skill to lowercase for matching
        const skillLower = skill.toLowerCase();
        
        // Escape special regex characters in the skill name
        const escapedSkill = skillLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Simple word boundary check to avoid partial matches
        // Look for the skill surrounded by non-word characters or at the start/end of text
        const skillRegex = new RegExp(`(^|[^a-zA-Z0-9])${escapedSkill}($|[^a-zA-Z0-9])`, 'i');
        
        // Add skill if found in text
        if (skillRegex.test(fullText) || fullText.includes(skillLower)) {
          // Use the original casing from the CSV
          foundSkills.add(skill);
        }
      } catch (error) {
        console.warn(`Error processing skill "${skill}":`, error);
        // Skip this skill and continue with others
      }
    });
    
    // Convert Set back to array and sort alphabetically
    return Array.from(foundSkills).sort();
  } catch (error) {
    console.error('Error processing skills:', error);
    return [];
  }
};
