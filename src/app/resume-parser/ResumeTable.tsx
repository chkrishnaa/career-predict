import { Fragment, useState, useEffect } from "react";
import type { Resume, ResumeEducation, ResumeWorkExperience, ResumeProject, ResumeCertification } from "lib/redux/types";
import { initialEducation, initialWorkExperience, initialCertification } from "lib/redux/resumeSlice";
import { deepClone } from "lib/deep-clone";
import { cx } from "lib/cx";
import { PencilIcon, CheckIcon, XMarkIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { SkillsTableRow } from "./SkillsTableRow";
import { JobListingsModal } from "../components/JobListingsModal";
import { useJobListings } from "../lib/hooks/useJobListings";

const TableRowHeader = ({ children }: { children: React.ReactNode }) => (
  <tr className="divide-x divide-gray-200 dark:divide-gray-700">
    <th className="px-4 py-3 font-semibold text-left bg-blue-violet-50 dark:bg-blue-violet-900/30 text-blue-violet-800 dark:text-blue-violet-300" scope="colgroup" colSpan={2}>
      {children}
    </th>
  </tr>
);

interface TableRowProps {
  label: string;
  value: string | string[];
  className?: string | false;
  isPercentage?: boolean;
  onValueChange?: (value: string | string[]) => void;
}

const TableRow = ({
  label,
  value,
  className,
  isPercentage = false,
  onValueChange,
}: TableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState<string | string[]>(value);
  
  // When the external value changes and we're not editing,
  // update our internal state to match
  useEffect(() => {
    if (!isEditing) {
      setEditValue(value);
    }
  }, [value, isEditing]);

  const startEditing = () => {
    setIsEditing(true);
    setEditValue(value);
  };

  const saveChanges = () => {
    if (onValueChange) {
      // Make sure we're passing the right type
      if (typeof editValue === "string") {
        let valueToSave = editValue.trim();
        
        // Special case for phone formatting
        if (label === "Phone") {
          // Extract digits
          const digits = valueToSave.replace(/\D/g, '');
          
          // Only apply formatting if we have enough digits
          if (digits.length >= 10) {
            // Format based on digit count (using the specified format)
            if (digits.length === 10) {
              // Format: first 5 digits, then next 5 digits
              valueToSave = `${digits.substring(0, 5)} ${digits.substring(5)}`;
            } else if (digits.length > 10) {
              // Format: country code with plus sign, space, first 5 digits, space, remaining digits
              const countryCode = digits.substring(0, digits.length - 10);
              const remaining = digits.substring(digits.length - 10);
              valueToSave = `+${countryCode} ${remaining.substring(0, 5)} ${remaining.substring(5)}`;
            }
          }
        }
        
        onValueChange(valueToSave);
      } else {
        // Filter out empty lines for array values
        const filteredValues = editValue.filter(line => line.trim() !== '');
        onValueChange(filteredValues);
      }
    }
    setIsEditing(false);
  };

  const cancelEdit = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  // Format the display value for percentages
  const getDisplayValue = () => {
    if (typeof value !== "string") return null;
    if (isPercentage && value && !isNaN(parseFloat(value))) {
      return `${parseFloat(value).toFixed(2)}%`;
    }
    return value || <span className="text-gray-400 dark:text-gray-500 italic">Not found</span>;
  };

  return (
    <tr className={cx("divide-x border-t border-gray-200 dark:border-gray-700", className)}>
      <th className="px-4 py-3 font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 w-1/4" scope="row">
      {label}
    </th>
      <td className="w-3/4 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 relative group">
        {!isEditing ? (
          <>
            {typeof value === "string" ? (
              <div className="flex items-center justify-between">
                <div>{getDisplayValue()}</div>
                {onValueChange && (
                  <button 
                    onClick={startEditing}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                    title="Edit this field"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div className="w-full">
                  {value.length > 0 ? (
                    value.map((x, idx) => (
            <Fragment key={idx}>
                        <span className="inline-flex items-baseline">
                          <span className="text-gray-500 dark:text-gray-400 mr-2">•</span>
                          {x}
                        </span>
              <br />
            </Fragment>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-gray-500 italic">Not found</span>
                  )}
                </div>
                {onValueChange && (
                  <button 
                    onClick={startEditing}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 ml-2 flex-shrink-0"
                    title="Edit this field"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            )}
          </>
        ) : (
          <>
            {typeof editValue === "string" ? (
              <div className="flex items-center">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full border rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                  autoFocus
                />
                <div className="flex ml-2">
                  <button 
                    onClick={saveChanges}
                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                    title="Save changes"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={cancelEdit}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                    title="Cancel edit"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <textarea
                  value={Array.isArray(editValue) ? editValue.join('\n') : ''}
                  onChange={(e) => setEditValue(e.target.value.split('\n'))}
                  className="w-full border rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-700"
                  rows={Math.max(4, (Array.isArray(editValue) ? editValue.length : 0) + 1)}
                  autoFocus
                  placeholder="Enter each item on a new line"
                />
                <div className="flex mt-1 justify-end">
                  <button 
                    onClick={saveChanges}
                    className="p-1 text-green-600 hover:text-green-700 dark:text-green-500 dark:hover:text-green-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 mr-1"
                    title="Save changes"
                  >
                    <CheckIcon className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={cancelEdit}
                    className="p-1 text-red-600 hover:text-red-700 dark:text-red-500 dark:hover:text-red-400 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600"
                    title="Cancel edit"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </td>
    </tr>
  );
};

interface SkillsTableRowProps {
  skills: string[];
  onValueChange?: (skills: string[]) => void;
}

// Custom component for skills display
// const SkillsTableRow = ({ skills, onValueChange }: SkillsTableRowProps) => {
  // ... Remove this entire component ...
// };

interface ResumeTableProps {
  resume: Resume;
  updateResume: (updatedResume: Resume) => void;
}

export const ResumeTable = ({ resume, updateResume }: ResumeTableProps) => {
  const { isModalOpen, openModal, closeModal } = useJobListings();

  // Check if GPA value might be a percentage (>4.5 usually indicates percentage)
  const isPercentageValue = (value: string) => {
    const num = parseFloat(value);
    return !isNaN(num) && num > 4.5;
  };

  const educations =
    resume.educations.length === 0
      ? [deepClone(initialEducation)]
      : resume.educations;
      
  const workExperiences =
    resume.workExperiences.length === 0
      ? [deepClone(initialWorkExperience)]
      : resume.workExperiences;
      
  const certifications =
    resume.certifications.length === 0
      ? [deepClone(initialCertification)]
      : resume.certifications;
      
  // Get skills from resume descriptions
  const skillsFromDescriptions = resume.skills.descriptions.slice();
  
  // Process descriptions that might contain categorized skills
  const processedSkillsFromDescriptions = skillsFromDescriptions.flatMap(description => {
    // Check if this is a categorized list (contains a colon)
    if (description.includes(':')) {
      // Split by colon and extract just the skills part
      const parts = description.split(':');
      if (parts.length === 2) {
        // Split the skills by comma and trim each one
        return parts[1].split(',').map(skill => skill.trim()).filter(Boolean);
      }
    }
    return description; // Return as is if not categorized
  });
  
  // Get featured skills and process them the same way
  const featuredSkills = resume.skills.featuredSkills
    .filter((item) => item.skill.trim())
    .map((item) => item.skill.trim());
    
  // Process featured skills (splitting both by comma and by category if present)
  const featuredSkillsFlat = featuredSkills.flatMap(skill => {
    if (skill.includes(':')) {
      const parts = skill.split(':');
      if (parts.length === 2) {
        return parts[1].split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    return skill.split(',').map(s => s.trim()).filter(Boolean);
  });
  
  // Create a set of all skills to avoid duplicates
  const uniqueSkills = new Set([...featuredSkillsFlat, ...processedSkillsFromDescriptions]);
  
  // Convert back to array for display
  const skills = Array.from(uniqueSkills);
  
  console.log("Final combined skills:", skills);

  // Functions to update different parts of the resume
  const updateProfile = (field: string, value: string) => {
    const updatedResume = deepClone(resume);
    updatedResume.profile[field as keyof typeof updatedResume.profile] = value;
    updateResume(updatedResume);
  };

  const updateEducation = (index: number, field: string, value: string | string[]) => {
    const updatedResume = deepClone(resume);
    updatedResume.educations[index][field as keyof ResumeEducation] = value as any;
    updateResume(updatedResume);
  };

  const updateWorkExperience = (index: number, field: string, value: string | string[]) => {
    const updatedResume = deepClone(resume);
    updatedResume.workExperiences[index][field as keyof ResumeWorkExperience] = value as any;
    updateResume(updatedResume);
  };

  const updateProject = (index: number, field: string, value: string | string[]) => {
    const updatedResume = deepClone(resume);
    updatedResume.projects[index][field as keyof ResumeProject] = value as any;
    updateResume(updatedResume);
  };

  const updateSkills = (values: string[]) => {
    console.log("Table - Updating skills with values:", values);
    
    const updatedResume = deepClone(resume);
    
    // Group skills if they were originally grouped
    const originalHadCategories = resume.skills.descriptions.some(desc => desc.includes(':'));
    
    if (originalHadCategories) {
      // Try to restore original categories if they existed
      const categoryMap = new Map<string, string[]>();
      
      // Extract categories from original descriptions
      resume.skills.descriptions.forEach(desc => {
        if (desc.includes(':')) {
          const [category, skillsList] = desc.split(':').map(part => part.trim());
          const categorySkills = skillsList.split(',').map(s => s.trim()).filter(Boolean);
          categoryMap.set(category, []);
        }
      });
      
      // Add uncategorized array for skills without a category
      if (!categoryMap.has('Other')) {
        categoryMap.set('Other', []);
      }
      
      // Assign each skill to its original category if possible, or to "Other"
      values.forEach(skill => {
        let assigned = false;
        
        // Try to find this skill in original categories
        for (const [category, originalSkills] of Array.from(categoryMap.entries())) {
          const originalDesc = resume.skills.descriptions.find(desc => 
            desc.startsWith(category + ':') && desc.toLowerCase().includes(skill.toLowerCase())
          );
          
          if (originalDesc) {
            categoryMap.get(category)?.push(skill);
            assigned = true;
            break;
          }
        }
        
        // If not found in any category, add to "Other"
        if (!assigned) {
          categoryMap.get('Other')?.push(skill);
        }
      });
      
      // Convert back to descriptions format
      const newDescriptions = [];
      for (const [category, categorySkills] of Array.from(categoryMap.entries())) {
        if (categorySkills.length > 0) {
          newDescriptions.push(`${category}: ${categorySkills.join(', ')}`);
        }
      }
      
      // Update the descriptions
      updatedResume.skills.descriptions = newDescriptions;
    } else {
      // If there were no categories originally, just use the values directly
      updatedResume.skills.descriptions = values;
    }
    
    // Clear any featured skills that have been removed
    updatedResume.skills.featuredSkills = updatedResume.skills.featuredSkills.filter(item => {
      return values.some(skill => item.skill.includes(skill));
    });
    
    updateResume(updatedResume);
  };

  const updateCertification = (index: number, field: string, value: string | string[]) => {
    const updatedResume = deepClone(resume);
    updatedResume.certifications[index][field as keyof ResumeCertification] = value as any;
    updateResume(updatedResume);
  };

  return (
    <div>
      <table className="w-full border-collapse border-hidden text-sm overflow-hidden rounded-lg shadow-sm transition-all duration-300">
      <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-left align-top">
        <TableRowHeader>Profile</TableRowHeader>
        <TableRow 
          label="Name" 
          value={resume.profile.name} 
          onValueChange={(value) => updateProfile('name', value as string)}
        />
        <TableRow 
          label="Email" 
          value={resume.profile.email} 
          onValueChange={(value) => updateProfile('email', value as string)}
        />
        <TableRow 
          label="Phone" 
          value={resume.profile.phone} 
          onValueChange={(value) => updateProfile('phone', value as string)}
        />
        <TableRow 
          label="Location" 
          value={resume.profile.location} 
          onValueChange={(value) => updateProfile('location', value as string)}
        />
        <TableRow 
          label="Link" 
          value={resume.profile.url} 
          onValueChange={(value) => updateProfile('url', value as string)}
        />
        <TableRow 
          label="Summary" 
          value={resume.profile.summary} 
          onValueChange={(value) => updateProfile('summary', value as string)}
        />
        
        <TableRowHeader>Education</TableRowHeader>
        {educations.map((education, idx) => {
          // Get education type label
          const educationLabel = education.educationType === "University" 
            ? "University Education"
            : education.educationType === "12th"
              ? "Higher Secondary Education"
              : education.educationType === "10th"
                ? "Secondary Education"
                : `Education ${idx + 1}`;
                
          // Get appropriate grade label
          const gradeLabel = education.educationType === "University" ? "CGPA" : "Percentage";
          
          // Determine if it's a percentage value
          const isPercentage = education.educationType !== "University";
                
          return (
            <Fragment key={idx}>
              <TableRow 
                label={educationLabel}
                value={education.school} 
                onValueChange={(value) => updateEducation(idx, 'school', value as string)}
              />
              <TableRow 
                label="Degree" 
                value={education.degree} 
                onValueChange={(value) => updateEducation(idx, 'degree', value as string)}
              />
              <TableRow 
                label={gradeLabel} 
                value={education.gpa} 
                isPercentage={isPercentage}
                onValueChange={(value) => updateEducation(idx, 'gpa', value as string)}
              />
              <TableRow 
                label="Date" 
                value={education.date} 
                onValueChange={(value) => updateEducation(idx, 'date', value as string)}
              />
              <TableRow
                label="Descriptions"
                value={education.descriptions}
                onValueChange={(value) => updateEducation(idx, 'descriptions', value as string[])}
                className={
                  educations.length - 1 !== 0 &&
                  idx !== educations.length - 1 &&
                  "!border-b-4 border-b-gray-200 dark:border-b-gray-700"
                }
              />
            </Fragment>
          );
        })}
        
        <TableRowHeader>Work Experience</TableRowHeader>
        {workExperiences.map((workExperience, idx) => (
          <Fragment key={idx}>
            <TableRow 
              label="Company" 
              value={workExperience.company} 
              onValueChange={(value) => updateWorkExperience(idx, 'company', value as string)}
            />
            <TableRow 
              label="Job Title" 
              value={workExperience.jobTitle} 
              onValueChange={(value) => updateWorkExperience(idx, 'jobTitle', value as string)}
            />
            <TableRow 
              label="Date" 
              value={workExperience.date} 
              onValueChange={(value) => updateWorkExperience(idx, 'date', value as string)}
            />
            <TableRow
              label="Descriptions"
              value={workExperience.descriptions}
              onValueChange={(value) => updateWorkExperience(idx, 'descriptions', value as string[])}
              className={
                workExperiences.length - 1 !== 0 &&
                idx !== workExperiences.length - 1 &&
                "!border-b-4 border-b-gray-200 dark:border-b-gray-700"
              }
            />
          </Fragment>
        ))}
        
        <TableRowHeader>Certifications</TableRowHeader>
        {certifications.map((certification, idx) => (
          <Fragment key={idx}>
            <TableRow 
              label="Name" 
              value={certification.name} 
              onValueChange={(value) => updateCertification(idx, 'name', value as string)}
            />
            <TableRow 
              label="Date" 
              value={certification.date} 
              onValueChange={(value) => updateCertification(idx, 'date', value as string)}
            />
            <TableRow
              label="Descriptions"
              value={certification.descriptions}
              onValueChange={(value) => updateCertification(idx, 'descriptions', value as string[])}
              className={
                certifications.length - 1 !== 0 &&
                idx !== certifications.length - 1 &&
                "!border-b-4 border-b-gray-200 dark:border-b-gray-700"
              }
            />
          </Fragment>
        ))}
        
        {resume.projects.length > 0 && (
          <TableRowHeader>Projects</TableRowHeader>
        )}
        {resume.projects.map((project, idx) => (
          <Fragment key={idx}>
            <TableRow 
              label="Project" 
              value={project.project} 
              onValueChange={(value) => updateProject(idx, 'project', value as string)}
            />
            <TableRow 
              label="Date" 
              value={project.date} 
              onValueChange={(value) => updateProject(idx, 'date', value as string)}
            />
            <TableRow
              label="Descriptions"
              value={project.descriptions}
              onValueChange={(value) => updateProject(idx, 'descriptions', value as string[])}
              className={
                resume.projects.length - 1 !== 0 &&
                idx !== resume.projects.length - 1 &&
                "!border-b-4 border-b-gray-200 dark:border-b-gray-700"
              }
            />
          </Fragment>
        ))}
        
        <TableRowHeader>Skills</TableRowHeader>
        <SkillsTableRow 
          skills={skills} 
          onValueChange={(value) => updateSkills(value)}
        />
          
          {/* Add Analyze Placement button row */}
          <tr>
            <td colSpan={2} className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-center">
                <button
                  onClick={openModal}
                  className="btn-primary inline-flex items-center animate-pulse-subtle"
                >
                  <span>Analyze Placement</span>
                  <QuestionMarkCircleIcon className="h-5 w-5 ml-2" />
                </button>
              </div>
            </td>
          </tr>
      </tbody>
    </table>
      
      <JobListingsModal 
        isOpen={isModalOpen} 
        onClose={closeModal} 
        resume={resume} 
      />
    </div>
  );
};
