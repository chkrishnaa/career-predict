import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';
import { 
  updatePersonalInfo, 
  updateSummary, 
  addExperience, 
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  updateSkills
} from '../store/resumeSlice'; 

interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

export interface UseResumeReturnType {
  resume: any;
  updateResumePersonalInfo: (personalInfo: PersonalInfo) => void;
  updateResumeSummary: (summary: string) => void;
  addResumeExperience: (experience: Experience) => void;
  updateResumeExperience: (index: number, experience: Experience) => void;
  removeResumeExperience: (index: number) => void;
  addResumeEducation: (education: Education) => void;
  updateResumeEducation: (index: number, education: Education) => void;
  removeResumeEducation: (index: number) => void;
  updateResumeSkills: (skills: string[]) => void;
}

export const useResume = (): UseResumeReturnType => {
  const dispatch = useDispatch();
  const resume = useSelector((state: RootState) => state.resume);

  const updateResumePersonalInfo = (personalInfo: PersonalInfo) => {
    dispatch(updatePersonalInfo(personalInfo));
  };

  const updateResumeSummary = (summary: string) => {
    dispatch(updateSummary(summary));
  };

  const addResumeExperience = (experience: Experience) => {
    dispatch(addExperience(experience));
  };

  const updateResumeExperience = (index: number, experience: Experience) => {
    dispatch(updateExperience({ index, experience }));
  };

  const removeResumeExperience = (index: number) => {
    dispatch(removeExperience(index));
  };

  const addResumeEducation = (education: Education) => {
    dispatch(addEducation(education));
  };

  const updateResumeEducation = (index: number, education: Education) => {
    dispatch(updateEducation({ index, education }));
  };

  const removeResumeEducation = (index: number) => {
    dispatch(removeEducation(index));
  };

  const updateResumeSkills = (skills: string[]) => {
    dispatch(updateSkills(skills));
  };

  return {
    resume,
    updateResumePersonalInfo,
    updateResumeSummary,
    addResumeExperience,
    updateResumeExperience,
    removeResumeExperience,
    addResumeEducation,
    updateResumeEducation,
    removeResumeEducation,
    updateResumeSkills
  };
}; 