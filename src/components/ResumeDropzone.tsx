import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { DocumentArrowUpIcon } from '@heroicons/react/24/outline';

interface ResumeDropzoneProps {
  onFileUpload?: (file: File) => void;
}

const ResumeDropzone = ({ onFileUpload }: ResumeDropzoneProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (onFileUpload) {
        onFileUpload(file);
      }
    }
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isDragActive
          ? 'border-primary bg-primary/10'
          : 'border-gray-300 hover:border-primary'
      }`}
      onMouseEnter={() => setIsDragging(true)}
      onMouseLeave={() => setIsDragging(false)}
    >
      <input {...getInputProps()} />
      <DocumentArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
        {isDragActive
          ? 'Drop your resume here'
          : 'Drag and drop your resume here, or click to select'}
      </p>
      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
        Supported formats: PDF, DOC, DOCX
      </p>
    </div>
  );
};

export default ResumeDropzone; 