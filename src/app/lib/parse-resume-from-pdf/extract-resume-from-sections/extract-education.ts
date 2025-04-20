import type {
  TextItem,
  FeatureSet,
  ResumeSectionToLines,
} from "lib/parse-resume-from-pdf/types";
import type { ResumeEducation } from "lib/redux/types";
import { getSectionLinesByKeywords } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/get-section-lines";
import { divideSectionIntoSubsections } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/subsections";
import {
  DATE_FEATURE_SETS,
  hasComma,
  hasLetter,
  hasNumber,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/common-features";
import { getTextWithHighestFeatureScore } from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/feature-scoring-system";
import {
  getBulletPointsFromLines,
  getDescriptionsLineIdx,
} from "lib/parse-resume-from-pdf/extract-resume-from-sections/lib/bullet-points";

/**
 *              Unique Attribute
 * School       Has school
 * Degree       Has degree
 * GPA          Has number
 * EducationType University, 12th, 10th
 */

// prettier-ignore
const SCHOOLS = ['College', 'University', 'Institute', 'School', 'Academy', 'BASIS', 'Magnet', 'Vidyalaya', 'Center', 'Centre']
const hasSchool = (item: TextItem) =>
  SCHOOLS.some((school) => item.text.includes(school));
// prettier-ignore
const DEGREES = ["Associate", "Bachelor", "Master", "PhD", "Ph.", "B.Tech", "M.Tech", "B.Sc", "M.Sc", "B.A", "M.A", "B.E", "M.E", "B.Com", "M.Com", "B.B.A", "M.B.A"];
const hasDegree = (item: TextItem) =>
  DEGREES.some((degree) => item.text.includes(degree)) ||
  /[ABM][A-Z\.]/.test(item.text);

// Improved GPA matching that catches both CGPA and percentage
const matchGPA = (item: TextItem) => {
  // Match CGPA format (0.00-4.00 or 0.00-10.00)
  const cgpaMatch = item.text.match(/(?:CGPA|GPA|SGPA)[:\s]*([0-9]\.\d{1,2})/i) || 
                   item.text.match(/([0-9]\.\d{1,2})(?:\/(?:4|10))?(?:\s*CGPA|GPA)?/i);
  
  if (cgpaMatch) return [cgpaMatch[1]] as RegExpMatchArray;
  return null;
};

// More comprehensive grade/percentage matcher
const matchGrade = (item: TextItem) => {
  // Match percentage format
  const percentMatch = item.text.match(/(\d{2,3}(?:\.\d{1,2})?)(?:%|\s*percent)/i);
  if (percentMatch) return [percentMatch[1]] as RegExpMatchArray;
  
  // Just a number that could be a percentage (45-100 range)
  const numberMatch = item.text.match(/^(\d{2,3}(?:\.\d{1,2})?)$/);
  if (numberMatch) {
    const value = parseFloat(numberMatch[1]);
    if (value >= 45 && value <= 100) {
      return [numberMatch[1]] as RegExpMatchArray;
    }
  }
  
  return null;
};

// Education type identifiers (expanded with more patterns)
const isUniversity = (item: TextItem) => 
  item.text.match(/university|college|institute|b\.?tech|m\.?tech|bachelor|master|phd|undergraduate|graduate|post\s*graduate|engineering|polytechnic|degree/i) !== null;

const is12th = (item: TextItem) => 
  item.text.match(/12th|xii|higher\s*secondary|senior\s*secondary|intermediate|hsc|(?:\+2)|plus\s*two|junior\s*college/i) !== null;

const is10th = (item: TextItem) => 
  item.text.match(/10th|x|secondary|matric|ssc|high\s*school/i) !== null;

const SCHOOL_FEATURE_SETS: FeatureSet[] = [
  [hasSchool, 4],
  [hasDegree, -4],
  [hasNumber, -4],
];

const DEGREE_FEATURE_SETS: FeatureSet[] = [
  [hasDegree, 4],
  [hasSchool, -4],
  [hasNumber, -3],
];

const GPA_FEATURE_SETS: FeatureSet[] = [
  [matchGPA, 4, true],
  [matchGrade, 3, true],
  [hasComma, -3],
  [hasLetter, -4],
];

// Feature sets for education types
const UNIVERSITY_FEATURE_SETS: FeatureSet[] = [
  [isUniversity, 4],
  [is12th, -4],
  [is10th, -4],
];

const CLASS_12_FEATURE_SETS: FeatureSet[] = [
  [is12th, 4],
  [isUniversity, -4],
  [is10th, -4],
];

const CLASS_10_FEATURE_SETS: FeatureSet[] = [
  [is10th, 4],
  [isUniversity, -4],
  [is12th, -4],
];

const determineEducationType = (textItems: TextItem[]): "University" | "12th" | "10th" | "Other" => {
  const [_, universityScores] = getTextWithHighestFeatureScore(textItems, UNIVERSITY_FEATURE_SETS);
  const [__, class12Scores] = getTextWithHighestFeatureScore(textItems, CLASS_12_FEATURE_SETS);
  const [___, class10Scores] = getTextWithHighestFeatureScore(textItems, CLASS_10_FEATURE_SETS);
  
  // Find max scores for each type
  let universityMaxScore = 0;
  let class12MaxScore = 0; 
  let class10MaxScore = 0;
  
  universityScores.forEach(score => {
    if (score.score > universityMaxScore) universityMaxScore = score.score;
  });
  
  class12Scores.forEach(score => {
    if (score.score > class12MaxScore) class12MaxScore = score.score;
  });
  
  class10Scores.forEach(score => {
    if (score.score > class10MaxScore) class10MaxScore = score.score;
  });
  
  const maxScore = Math.max(universityMaxScore, class12MaxScore, class10MaxScore);
  
  if (maxScore <= 0) return "Other";
  
  if (universityMaxScore === maxScore) return "University";
  if (class12MaxScore === maxScore) return "12th";
  if (class10MaxScore === maxScore) return "10th";
  
  return "Other";
};

export const extractEducation = (sections: ResumeSectionToLines) => {
  const allEducations: ResumeEducation[] = [];
  const educationsScores = [];
  const lines = getSectionLinesByKeywords(sections, ["education"]);
  const subsections = divideSectionIntoSubsections(lines);
  
  for (const subsectionLines of subsections) {
    const textItems = subsectionLines.flat();
    const [school, schoolScores] = getTextWithHighestFeatureScore(
      textItems,
      SCHOOL_FEATURE_SETS
    );
    const [degree, degreeScores] = getTextWithHighestFeatureScore(
      textItems,
      DEGREE_FEATURE_SETS
    );
    const [gpa, gpaScores] = getTextWithHighestFeatureScore(
      textItems,
      GPA_FEATURE_SETS
    );
    const [date, dateScores] = getTextWithHighestFeatureScore(
      textItems,
      DATE_FEATURE_SETS
    );

    let descriptions: string[] = [];
    const descriptionsLineIdx = getDescriptionsLineIdx(subsectionLines);
    if (descriptionsLineIdx !== undefined) {
      const descriptionsLines = subsectionLines.slice(descriptionsLineIdx);
      descriptions = getBulletPointsFromLines(descriptionsLines);
    }
    
    // Determine education type
    const educationType = determineEducationType(textItems);
    
    // Find school if it wasn't detected properly
    let finalSchool = school;
    if (!school) {
      // For each education type, look for specific patterns
      const fullText = textItems.map(item => item.text).join(' ');
      
      if (educationType === "University") {
        // Look for college/university names
        const collegeMatch = fullText.match(/([A-Z][A-Za-z\s\.]+(?:College|University|Institute|Engineering|Technology))/);
        if (collegeMatch) finalSchool = collegeMatch[1];
      } else if (educationType === "12th") {
        // Look for common 12th institutions
        const hscMatch = fullText.match(/([A-Z][A-Za-z\s\.]+(?:College|School|Academy|HSC|Board|Education))/);
        if (hscMatch) finalSchool = hscMatch[1];
      } else if (educationType === "10th") {
        // Look for common 10th institutions
        const sscMatch = fullText.match(/([A-Z][A-Za-z\s\.]+(?:School|Vidyalaya|Academy|SSC|Board|Education))/);
        if (sscMatch) finalSchool = sscMatch[1];
      }
    }
    
    // If degree wasn't detected for university, add a placeholder
    let finalDegree = degree;
    if (!degree && educationType === "University") {
      const fullText = textItems.map(item => item.text).join(' ');
      
      // Try to detect common degree patterns
      if (fullText.match(/B\.?Tech|Bachelor.+Technology|Engineering/i)) {
        finalDegree = "Bachelor of Technology";
      } else if (fullText.match(/M\.?Tech|Master.+Technology/i)) {
        finalDegree = "Master of Technology";
      } else if (fullText.match(/B\.?Sc|Bachelor.+Science/i)) {
        finalDegree = "Bachelor of Science";
      } else if (fullText.match(/M\.?Sc|Master.+Science/i)) {
        finalDegree = "Master of Science";
      } else if (fullText.match(/B\.?A|Bachelor.+Arts/i)) {
        finalDegree = "Bachelor of Arts";
      } else if (fullText.match(/M\.?A|Master.+Arts/i)) {
        finalDegree = "Master of Arts";
      } else if (fullText.match(/MBA|Master.+Business/i)) {
        finalDegree = "Master of Business Administration";
      } else if (fullText.match(/B\.?Com|Bachelor.+Commerce/i)) {
        finalDegree = "Bachelor of Commerce";
      } else {
        // Default degree for university if no specific match
        finalDegree = "Bachelor's Degree";
      }
    } else if (educationType === "12th" && !finalDegree) {
      finalDegree = "Higher Secondary Education";
    } else if (educationType === "10th" && !finalDegree) {
      finalDegree = "Secondary Education";
    }

    // Format GPA/percentage based on education type
    let finalGPA = gpa || "";
    if (educationType === "University") {
      // For university, keep GPA as is (likely on a 4.0 or 10.0 scale)
      // Just ensure it's formatted nicely
      if (finalGPA && !isNaN(parseFloat(finalGPA))) {
        const gpaValue = parseFloat(finalGPA);
        if (gpaValue <= 10) {
          finalGPA = gpaValue.toFixed(2);
        }
      }
    } else {
      // For 12th and 10th, ensure it looks like a percentage
      if (finalGPA && !isNaN(parseFloat(finalGPA))) {
        const percentValue = parseFloat(finalGPA);
        if (percentValue <= 100) {
          finalGPA = percentValue.toFixed(2);
        }
      }
    }
    
    allEducations.push({ 
      school: finalSchool, 
      degree: finalDegree, 
      gpa: finalGPA, 
      date, 
      descriptions,
      educationType
    });
    
    educationsScores.push({
      schoolScores,
      degreeScores,
      gpaScores,
      dateScores,
    });
  }

  // Add courses as descriptions to the university entry if any
  if (allEducations.length !== 0) {
    const coursesLines = getSectionLinesByKeywords(sections, ["course"]);
    if (coursesLines.length !== 0) {
      // Find university entry or use the first one
      const universityIndex = allEducations.findIndex(edu => edu.educationType === "University");
      const targetIndex = universityIndex >= 0 ? universityIndex : 0;
      
      allEducations[targetIndex].descriptions.push(
        "Courses: " +
          coursesLines
            .flat()
            .map((item) => item.text)
            .join(" ")
      );
    }
  }

  // Sort educations by type: University first, then 12th, then 10th
  const sortOrder = { "University": 0, "12th": 1, "10th": 2, "Other": 3 };
  
  // Make sure we only have one of each type by first finding the best matches
  // Group educations by type
  const educationsByType: Record<string, ResumeEducation[]> = {
    "University": [],
    "12th": [],
    "10th": [],
    "Other": []
  };
  
  // Add each education to its type array
  allEducations.forEach(education => {
    educationsByType[education.educationType].push(education);
  });
  
  // For each type, if there are multiple entries, only keep the best one
  // or merge information from multiple entries
  const finalEducations: ResumeEducation[] = [];
  
  // Find the best University entry if multiple exist
  if (educationsByType["University"].length > 1) {
    // Sort by degree name - ones with specific degrees are better than default
    const sortedUniversities = [...educationsByType["University"]].sort((a, b) => {
      // If one has a school name and the other doesn't, prefer the one with a school
      if (a.school && !b.school) return -1;
      if (!a.school && b.school) return 1;
      
      // If one has a specific degree and the other has a generic "Bachelor's Degree"
      const aIsGeneric = a.degree === "Bachelor's Degree";
      const bIsGeneric = b.degree === "Bachelor's Degree";
      if (aIsGeneric && !bIsGeneric) return 1;
      if (!aIsGeneric && bIsGeneric) return -1;
      
      // If one has a GPA and the other doesn't, prefer the one with a GPA
      if (a.gpa && !b.gpa) return -1;
      if (!a.gpa && b.gpa) return 1;
      
      return 0;
    });
    
    // Take the best university entry
    finalEducations.push(sortedUniversities[0]);
  } else if (educationsByType["University"].length === 1) {
    finalEducations.push(educationsByType["University"][0]);
  }
  
  // Same for 12th
  if (educationsByType["12th"].length > 1) {
    const sorted12th = [...educationsByType["12th"]].sort((a, b) => {
      if (a.school && !b.school) return -1;
      if (!a.school && b.school) return 1;
      if (a.gpa && !b.gpa) return -1;
      if (!a.gpa && b.gpa) return 1;
      return 0;
    });
    finalEducations.push(sorted12th[0]);
  } else if (educationsByType["12th"].length === 1) {
    finalEducations.push(educationsByType["12th"][0]);
  }
  
  // Same for 10th
  if (educationsByType["10th"].length > 1) {
    const sorted10th = [...educationsByType["10th"]].sort((a, b) => {
      if (a.school && !b.school) return -1;
      if (!a.school && b.school) return 1;
      if (a.gpa && !b.gpa) return -1;
      if (!a.gpa && b.gpa) return 1;
      return 0;
    });
    finalEducations.push(sorted10th[0]);
  } else if (educationsByType["10th"].length === 1) {
    finalEducations.push(educationsByType["10th"][0]);
  }
  
  // Add any "Other" type educations if we have space
  if (finalEducations.length < 3) {
    const remainingCount = 3 - finalEducations.length;
    const otherEducations = educationsByType["Other"].slice(0, remainingCount);
    finalEducations.push(...otherEducations);
  }
  
  // Sort the final educations array by type
  finalEducations.sort((a, b) => sortOrder[a.educationType] - sortOrder[b.educationType]);
  
  // Set default names for each type if needed
  finalEducations.forEach(education => {
    if (education.educationType === "University" && !education.degree) {
      education.degree = "Bachelor's Degree";
    } else if (education.educationType === "12th" && !education.degree) {
      education.degree = "Higher Secondary Education";
    } else if (education.educationType === "10th" && !education.degree) {
      education.degree = "Secondary Education";
    }
  });
  
  // Ensure we don't have more than 3 total
  const educations = finalEducations.slice(0, 3);

  return {
    educations,
    educationsScores,
  };
};
