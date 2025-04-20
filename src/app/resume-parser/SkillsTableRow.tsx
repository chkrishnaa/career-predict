import { useState, useEffect } from "react";
import { PencilIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";

interface SkillsTableRowProps {
  skills: string[];
  onValueChange?: (skills: string[]) => void;
}

export const SkillsTableRow = ({ skills, onValueChange }: SkillsTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState("");
  
  // Add debug log when skills are received
  useEffect(() => {
    console.log("SkillsTableRow received skills:", skills);
  }, [skills]);
  
  const startEditing = () => {
    setIsEditing(true);
  };

  const removeSkill = (skillToRemove: string) => {
    if (onValueChange) {
      console.log("Removing skill:", skillToRemove);
      console.log("Current skills:", skills);
      const updatedSkills = skills.filter(skill => skill !== skillToRemove);
      console.log("Updated skills after removal:", updatedSkills);
      onValueChange(updatedSkills);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && onValueChange) {
      let skillsToAdd = [];
      
      // Check if input contains a category format (with colon)
      if (newSkill.includes(':')) {
        const parts = newSkill.split(':');
        if (parts.length === 2) {
          // Split the skills part by comma
          skillsToAdd = parts[1].split(',').map(s => s.trim()).filter(Boolean);
        } else {
          // If not properly formatted, treat as a single skill
          skillsToAdd = [newSkill.trim()];
        }
      } else {
        // Split by comma if multiple skills are entered without category
        skillsToAdd = newSkill.split(',').map(s => s.trim()).filter(Boolean);
      }
      
      // Check for duplicates
      const newSkills = [...skills];
      skillsToAdd.forEach(skill => {
        if (!newSkills.includes(skill)) {
          newSkills.push(skill);
        }
      });
      
      onValueChange(newSkills);
      setNewSkill("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <tr className="divide-x border-t border-gray-200 dark:border-gray-700">
      <th className="px-4 py-3 font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 w-1/4" scope="row">
        Skills
      </th>
      <td className="w-3/4 px-4 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 relative group">
        {!isEditing ? (
          <div className="flex flex-col">
            <div className="flex items-start justify-between">
              <div className="w-full">
                {skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {skills.map((skill, index) => (
                      <span 
                        key={index}
                        className="bg-blue-violet-100 dark:bg-blue-violet-800/50 text-blue-violet-800 dark:text-blue-violet-200 rounded-full px-3 py-1 text-sm inline-block mr-1 mb-1 inline-flex items-center transition duration-300"
                      >
                        {skill}
                        {onValueChange && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="ml-1 text-blue-violet-600 hover:text-blue-violet-800 dark:text-blue-violet-300 dark:hover:text-blue-violet-100"
                            title="Remove skill"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-400 dark:text-gray-500 italic">No skills found</span>
                )}
              </div>
              {onValueChange && (
                <button 
                  onClick={startEditing}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-600 ml-2 flex-shrink-0"
                  title="Edit skills"
                >
                  <PencilIcon className="h-4 w-4" />
                </button>
              )}
            </div>
            
            {/* Add skill input */}
            {onValueChange && (
              <div className="mt-2 flex">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a skill (separate multiple with commas)"
                  className="flex-1 p-2 border rounded-l-md text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600"
                />
                <button
                  onClick={addSkill}
                  className="bg-blue-violet-600 hover:bg-blue-violet-700 dark:bg-blue-violet-700 dark:hover:bg-blue-violet-600 text-white p-2 rounded-r-md transition duration-200"
                  title="Add skill"
                >
                  <PlusIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex justify-center p-4">
            <div className="text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-2">Use the form view to edit skills</p>
              <button 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-blue-violet-600 hover:bg-blue-violet-700 dark:bg-blue-violet-700 dark:hover:bg-blue-violet-600 text-white rounded-md transition duration-200"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </td>
    </tr>
  );
}; 