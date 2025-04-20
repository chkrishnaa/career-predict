import type { ResumeCertification } from "lib/redux/types";
import type { ResumeSectionToLines } from "lib/parse-resume-from-pdf/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

/**
 * Extract certifications from resume
 */
export const extractCertifications = (
  sections: ResumeSectionToLines
): { certifications: ResumeCertification[] } => {
  const lines = getSectionLinesByKeywords(sections, ["certification", "certifications", "credential", "credentials"]);
  
  if (!lines.length) {
    return { certifications: [] };
  }
  
  const certifications: ResumeCertification[] = [];
  const descriptionsLineIdx = getDescriptionsLineIdx(lines) ?? 0;
  
  // Process each certification
  if (descriptionsLineIdx !== 0) {
    const certificationLines = lines.slice(0, descriptionsLineIdx);
    
    // Simple parsing: treat each line as a certification name
    certificationLines.forEach(line => {
      const lineText = line.map(item => item.text).join(' ').trim();
      
      if (lineText) {
        // Extract date if present (common formats: YYYY, MM/YYYY, Month YYYY)
        const dateRegex = /(?:\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* )?(\d{4})\b|(\d{1,2}\/\d{4})/i;
        const dateMatch = lineText.match(dateRegex);
        
        let name = lineText;
        let date = "";
        
        if (dateMatch) {
          // Extract the matched date
          date = dateMatch[0];
          
          // Remove the date from the name
          name = lineText.replace(dateMatch[0], '').trim();
          
          // Clean up any separators left after removing the date
          name = name.replace(/[-–—|,]+$/g, '').trim();
        }
        
        certifications.push({
          name,
          date,
          descriptions: [],
        });
      }
    });
  }
  
  // Add descriptions if available
  if (certifications.length > 0 && descriptionsLineIdx < lines.length) {
    const descriptionsLines = lines.slice(descriptionsLineIdx);
    const descriptions = getBulletPointsFromLines(descriptionsLines);
    
    // Assign all descriptions to the first certification
    if (descriptions.length > 0 && certifications.length > 0) {
      certifications[0].descriptions = descriptions;
    }
  }
  
  return { certifications };
}; 