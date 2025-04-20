import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const ResumePreview: React.FC = () => {
  const resume = useSelector((state: RootState) => state.resume);

  if (!resume.personalInfo.name) {
    return (
      <div className="text-center text-gray-500">
        No resume details available. Please fill out the form.
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Resume Preview</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          <p className="text-gray-600">Name: {resume.personalInfo.name}</p>
          <p className="text-gray-600">Email: {resume.personalInfo.email}</p>
          <p className="text-gray-600">Phone: {resume.personalInfo.phone}</p>
          <p className="text-gray-600">Location: {resume.personalInfo.location}</p>
          {resume.personalInfo.website && (
            <p className="text-gray-600">Website: {resume.personalInfo.website}</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Professional Summary</h3>
          <p className="text-gray-600 whitespace-pre-line">{resume.summary}</p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {resume.skills.map((skill: string, index: number) => (
              <span
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview; 