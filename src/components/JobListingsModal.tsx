import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  url: string;
}

interface JobListingsModalProps {
  onClose: () => void;
}

const JobListingsModal: React.FC<JobListingsModalProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('all');
  const [sortOrder, setSortOrder] = useState('relevance');

  // Mock data for job listings
  const mockJobs: Job[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'Tech Solutions',
      location: 'New York, NY',
      description: 'We are looking for a skilled frontend developer with experience in React and TypeScript.',
      salary: '$80,000 - $110,000',
      url: 'https://example.com/job/1',
    },
    {
      id: '2',
      title: 'Full Stack Engineer',
      company: 'Digital Innovations',
      location: 'San Francisco, CA',
      description: 'Join our team to build scalable and maintainable web applications using modern technologies.',
      salary: '$100,000 - $140,000',
      url: 'https://example.com/job/2',
    },
    {
      id: '3',
      title: 'UX Designer',
      company: 'Creative Labs',
      location: 'Remote',
      description: 'Design intuitive and beautiful interfaces for our clients across various industries.',
      salary: '$75,000 - $95,000',
      url: 'https://example.com/job/3',
    },
    {
      id: '4',
      title: 'DevOps Engineer',
      company: 'Cloud Services Inc',
      location: 'Austin, TX',
      description: 'Manage and improve our cloud infrastructure, CI/CD pipelines, and deployment processes.',
      salary: '$90,000 - $120,000',
      url: 'https://example.com/job/4',
    },
    {
      id: '5',
      title: 'Machine Learning Engineer',
      company: 'AI Solutions',
      location: 'Boston, MA',
      description: 'Develop and deploy machine learning models to solve real-world problems.',
      salary: '$110,000 - $150,000',
      url: 'https://example.com/job/5',
    },
  ];

  // Filter jobs based on search criteria
  const filteredJobs = mockJobs.filter(job => {
    const matchesTerm = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = !location || job.location.toLowerCase().includes(location.toLowerCase());
    
    const matchesType = jobType === 'all' || 
                         (jobType === 'remote' && job.location.toLowerCase().includes('remote'));
    
    return matchesTerm && matchesLocation && matchesType;
  });

  // Sort jobs
  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (sortOrder === 'salary') {
      // Extract min salary for sorting (assuming format "$X - $Y")
      const aMin = parseInt(a.salary.split(' - ')[0].replace(/\$|,/g, ''));
      const bMin = parseInt(b.salary.split(' - ')[0].replace(/\$|,/g, ''));
      return bMin - aMin;
    }
    
    // Default: sort by relevance (based on match with search term)
    if (searchTerm) {
      const aTitle = a.title.toLowerCase().includes(searchTerm.toLowerCase());
      const bTitle = b.title.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (aTitle && !bTitle) return -1;
      if (!aTitle && bTitle) return 1;
    }
    
    return 0;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold">Recommended Job Listings</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium mb-1">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Job title, company, skills..."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="location" className="block text-sm font-medium mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, state, or remote"
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="jobType" className="block text-sm font-medium mb-1">
                Job Type
              </label>
              <select
                id="jobType"
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="all">All Types</option>
                <option value="remote">Remote Only</option>
              </select>
            </div>
          </div>
          
          <div className="mt-4 flex justify-end">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="relevance">Sort by Relevance</option>
              <option value="salary">Sort by Salary</option>
            </select>
          </div>
        </div>

        <div className="overflow-y-auto max-h-[calc(90vh-13rem)]">
          {sortedJobs.length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
              {sortedJobs.map((job) => (
                <div key={job.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400">{job.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{job.company} • {job.location}</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{job.salary}</p>
                      <p className="mt-2 text-gray-700 dark:text-gray-300">{job.description}</p>
                    </div>
                    <a
                      href={job.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                    >
                      Apply
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No jobs found matching your criteria. Try adjusting your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobListingsModal; 