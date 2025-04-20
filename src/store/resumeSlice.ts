import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface ResumeState {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
  };
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

const initialState: ResumeState = {
  personalInfo: {
    name: '',
    email: '',
    phone: '',
    location: '',
    website: '',
  },
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

const resumeSlice = createSlice({
  name: 'resume',
  initialState,
  reducers: {
    updatePersonalInfo: (state, action: PayloadAction<ResumeState['personalInfo']>) => {
      state.personalInfo = action.payload;
    },
    updateSummary: (state, action: PayloadAction<string>) => {
      state.summary = action.payload;
    },
    addExperience: (state, action: PayloadAction<Experience>) => {
      state.experience.push(action.payload);
    },
    updateExperience: (state, action: PayloadAction<{ index: number; experience: Experience }>) => {
      state.experience[action.payload.index] = action.payload.experience;
    },
    removeExperience: (state, action: PayloadAction<number>) => {
      state.experience.splice(action.payload, 1);
    },
    addEducation: (state, action: PayloadAction<Education>) => {
      state.education.push(action.payload);
    },
    updateEducation: (state, action: PayloadAction<{ index: number; education: Education }>) => {
      state.education[action.payload.index] = action.payload.education;
    },
    removeEducation: (state, action: PayloadAction<number>) => {
      state.education.splice(action.payload, 1);
    },
    updateSkills: (state, action: PayloadAction<string[]>) => {
      state.skills = action.payload;
    },
  },
});

export const {
  updatePersonalInfo,
  updateSummary,
  addExperience,
  updateExperience,
  removeExperience,
  addEducation,
  updateEducation,
  removeEducation,
  updateSkills,
} = resumeSlice.actions;

export default resumeSlice.reducer; 