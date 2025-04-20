// Resume types

export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
}

export interface Experience {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
}

export interface Skill {
  name: string;
  level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Resume {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface ResumeState {
  resume: Resume;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
} 