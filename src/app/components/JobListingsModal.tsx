'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Job, fetchJobs } from '../lib/api/jobsApi';
import { Resume } from '../lib/redux/types';
import { XMarkIcon, ArrowTopRightOnSquareIcon, BuildingOfficeIcon, MapPinIcon, CalendarIcon } from '@heroicons/react/24/outline';

interface JobListingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  resume: Resume;
}

export const JobListingsModal: React.FC<JobListingsModalProps> = ({ 
  isOpen, 
  onClose, 
  resume 
}) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Helper function to extract keywords from resume
  const extractKeywordsFromResume = useCallback((resumeData: Resume): string[] => {
    const keywords = new Set<string>();
    
    // Add job titles
    resumeData.workExperiences.forEach(exp => {
      if (exp.jobTitle) keywords.add(exp.jobTitle);
    });
    
    // Add skills (both featured and from descriptions)
    resumeData.skills.featuredSkills.forEach(skill => {
      if (skill.skill) keywords.add(skill.skill);
    });
    
    // Add keywords from skills descriptions
    resumeData.skills.descriptions.forEach(desc => {
      const words = desc.split(/[,;]/);
      words.forEach(word => {
        const trimmed = word.trim();
        if (trimmed) keywords.add(trimmed);
      });
    });
    
    // Add degree fields
    resumeData.educations.forEach(edu => {
      if (edu.degree) keywords.add(edu.degree);
    });
    
    return Array.from(keywords).filter(keyword => 
      keyword.length > 2 && !['and', 'the', 'for', 'with'].includes(keyword.toLowerCase())
    );
  }, []);

  // Function to fetch job listings
  const handleFetchJobListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Extract relevant keywords from resume for job search
      const keywords = extractKeywordsFromResume(resume);
      const response = await fetchJobs(keywords);
      setJobs(response.data);
    } catch (err) {
      setError('Failed to fetch job listings. Please try again later.');
      console.error('Error fetching jobs:', err);
    } finally {
      setLoading(false);
    }
  }, [resume, extractKeywordsFromResume]);

  // Effect to fetch job listings when modal opens
  useEffect(() => {
    if (isOpen) {
      handleFetchJobListings();
    }
  }, [isOpen, handleFetchJobListings]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 backdrop-blur-sm flex justify-center items-center z-50 transition-all duration-300 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 transition-all duration-300 animate-slide-up transform">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-blue-violet-700 dark:text-blue-violet-300">Job Matches Based on Your Resume</h2>
          <button 
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
            aria-label="Close"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6 overflow-auto flex-grow">
          {loading ? (
            <div className="flex flex-col justify-center items-center h-64 animate-pulse">
              <div className="w-16 h-16 border-4 border-blue-violet-500 dark:border-blue-violet-400 border-t-transparent rounded-full animate-spin mb-6"></div>
              <p className="text-lg text-blue-violet-700 dark:text-blue-violet-300">Finding the best job matches for you...</p>
            </div>
          ) : error ? (
            <div className="text-red-500 dark:text-red-400 text-center p-6 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <p className="text-lg font-medium mb-2">Oops! Something went wrong</p>
              <p>{error}</p>
              <button 
                onClick={handleFetchJobListings} 
                className="mt-4 btn-primary"
              >
                Try Again
              </button>
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <p className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                No job listings found matching your profile
              </p>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try updating your resume with more skills or experience, or broadening your search criteria.
              </p>
              <button 
                onClick={onClose} 
                className="btn-secondary"
              >
                Return to Resume
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-blue-violet-700 dark:text-blue-violet-300 font-medium mb-4">
                Found {jobs.length} jobs that match your skills and experience
              </p>
              {jobs.map((job, index) => (
                <div 
                  key={job.id} 
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:shadow-md dark:hover:shadow-blue-violet-900/20 transition-shadow duration-300 bg-white dark:bg-gray-800 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold text-blue-violet-700 dark:text-blue-violet-300 mb-2">{job.title}</h3>
                    <span className={`px-3 py-1 text-xs rounded-full ${job.remote ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'} font-medium`}>
                      {job.remote ? 'Remote' : 'On-site'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 items-center text-gray-600 dark:text-gray-400 text-sm mb-3">
                    <div className="flex items-center">
                      <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                      <span>{job.company_name}</span>
                    </div>
                    
                    {job.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        <span>{job.location}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      <span>Posted {new Date(job.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.tags.slice(0, 5).map((tag, idx) => (
                      <span key={idx} className="badge">
                        {tag}
                      </span>
                    ))}
                    {job.job_types.map((type, idx) => (
                      <span key={`type-${idx}`} className="badge-success">
                        {type}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <a 
                      href={job.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center btn-primary"
                    >
                      View Job 
                      <ArrowTopRightOnSquareIcon className="h-4 w-4 ml-1" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 