import React from 'react';
import ResumeDropzone from './ResumeDropzone';
import ResumeForm from './ResumeForm';
import ResumePreview from './ResumePreview';

const ResumeUpload: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-8">Upload Your Resume</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <ResumeDropzone />
          <ResumeForm />
        </div>
        
        <div>
          <ResumePreview />
        </div>
      </div>
    </div>
  );
};

export default ResumeUpload; 