import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { processSkillsFromDescriptions } from "lib/parse-resume-from-pdf/extract-resume-from-sections/extract-skills";

interface SkillsFormProps {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
}

export const SkillsForm = ({ skills, onSkillsChange }: SkillsFormProps) => {
  const [newSkill, setNewSkill] = useState("");
  const [availableSkills, setAvailableSkills] = useState<string[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processedSkills, setProcessedSkills] = useState<string[]>([]);

  // For debugging
  useEffect(() => {
    console.log("SkillsForm received skills:", skills);
  }, [skills]);

  // Load skills from the CSV file and process initial skills
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/assets/skills.csv');
        const text = await response.text();
        
        // Parse CSV and extract skills (skip header)
        const lines = text.split('\n');
        const parsedSkills = lines.slice(1).map(line => line.trim()).filter(Boolean);
        
        setAvailableSkills(parsedSkills);
        
        // No need to reprocess if we already received processed skills
        // Just log the received skills for debugging
        console.log("Working with processed skills:", skills);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading skills data:', error);
        setIsLoading(false);
      }
    };

    fetchSkills();
  }, [skills]);

  // Use the processed skills if they exist
  useEffect(() => {
    if (processedSkills.length > 0 && processedSkills.toString() !== skills.toString()) {
      onSkillsChange(processedSkills);
    }
  }, [processedSkills, skills, onSkillsChange]);

  // Filter skills based on input
  useEffect(() => {
    if (!newSkill.trim()) {
      setFilteredSkills([]);
      return;
    }

    const newSkillLower = newSkill.toLowerCase().trim();
    
    const filtered = availableSkills
      .filter(skill => {
        // Case insensitive check
        const skillLower = skill.toLowerCase();
        
        // Skip if already in selected skills (case insensitive)
        const alreadySelected = skills.some(
          selectedSkill => selectedSkill.toLowerCase() === skillLower
        );
        
        if (alreadySelected) return false;
        
        // Check if skill contains the input text or vice versa
        return skillLower.includes(newSkillLower) || newSkillLower.includes(skillLower);
      })
      .slice(0, 5); // Show only the first 5 matches
    
    setFilteredSkills(filtered);
  }, [newSkill, availableSkills, skills]);

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;
    
    let skillToProcess = skill.trim();
    let skillsToAdd: string[] = [];
    
    // Check if input contains a category format (with colon)
    if (skillToProcess.includes(':')) {
      const parts = skillToProcess.split(':');
      if (parts.length === 2) {
        // Split the skills part by comma
        skillsToAdd = parts[1].split(',').map(s => s.trim()).filter(Boolean);
      } else {
        // If not properly formatted, treat as a single skill
        skillsToAdd = [skillToProcess];
      }
    } else {
      // Handle single skill or comma-separated skills
      skillsToAdd = skillToProcess.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    // Process each skill individually
    const newSkills = [...skills];
    
    skillsToAdd.forEach(skillItem => {
      // Check if the skill is already added (case insensitive)
      const skillLower = skillItem.toLowerCase();
      const isDuplicate = skills.some(existingSkill => 
        existingSkill.toLowerCase().trim() === skillLower
      );
      
      if (!isDuplicate) {
        // If skill is in the availableSkills list, use that exact casing
        const matchedSkill = availableSkills.find(
          availableSkill => availableSkill.toLowerCase() === skillLower
        );
        
        // Use matched skill from CSV if found, otherwise use input as is
        const finalSkill = matchedSkill || skillItem;
        
        newSkills.push(finalSkill);
      }
    });
    
    if (newSkills.length > skills.length) {
      onSkillsChange(newSkills);
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove: string) => {
    onSkillsChange(skills.filter(skill => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newSkill.trim()) {
      e.preventDefault();
      
      // Add the first filtered skill if available, otherwise add the input
      if (filteredSkills.length > 0) {
        addSkill(filteredSkills[0]);
      } else {
        addSkill(newSkill);
      }
    }
  };

  return (
    <div>
      {/* Simple skill chips without categorization */}
      <div className="flex flex-wrap gap-2 mb-4">
        {skills.map((skill, index) => (
          <div 
            key={index} 
            className="bg-blue-violet-100 dark:bg-blue-violet-800/50 text-blue-violet-800 dark:text-blue-violet-200 rounded-full px-3 py-1 text-sm flex items-center shadow-sm transition duration-300"
          >
            <span>{skill}</span>
            <button 
              onClick={() => removeSkill(skill)} 
              className="ml-1 text-blue-violet-600 hover:text-blue-violet-800 dark:text-blue-violet-300 dark:hover:text-blue-violet-100"
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative">
        <input
          type="text"
          value={newSkill}
          onChange={(e) => setNewSkill(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a skill..."
          className="w-full p-2 border rounded-md shadow-sm transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:border-blue-violet-400 dark:focus:border-blue-violet-500 focus:ring-1 focus:ring-blue-violet-400 dark:focus:ring-blue-violet-500"
        />
        
        {filteredSkills.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg">
            {filteredSkills.map((skill, index) => (
              <div 
                key={index} 
                className="p-2 hover:bg-blue-violet-50 dark:hover:bg-blue-violet-900/20 cursor-pointer text-gray-800 dark:text-gray-200"
                onClick={() => {
                  addSkill(skill);
                }}
              >
                {skill}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-2">
        <button 
          type="button"
          onClick={() => {
            if (newSkill.trim()) {
              addSkill(newSkill);
            }
          }}
          className="px-4 py-2 bg-blue-violet-600 hover:bg-blue-violet-700 dark:bg-blue-violet-700 dark:hover:bg-blue-violet-600 text-white rounded-md text-sm shadow-sm transition duration-200"
        >
          Add
        </button>
      </div>
    </div>
  );
};