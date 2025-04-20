'use client';

import { useState, useCallback, useEffect } from "react";
import { LockClosedIcon, DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { cx } from "lib/cx";

const defaultFileState = {
  name: "",
  size: 0,
  fileUrl: "",
};

interface ResumeDropzoneProps {
  onFileUpload?: (file: File) => void;
  onFileUrlChange?: (fileUrl: string) => void;
  isLoading?: boolean;
  className?: string;
  playgroundView?: boolean;
}

export const ResumeDropzone = ({ 
  onFileUpload, 
  onFileUrlChange, 
  isLoading = false, 
  className, 
  playgroundView = false 
}: ResumeDropzoneProps) => {
  const [file, setFile] = useState(defaultFileState);
  const [isDragActive, setIsDragActive] = useState(false);
  const [hasNonPdfFile, setHasNonPdfFile] = useState(false);

  const hasFile = Boolean(file.name);

  const handleFiles = useCallback((files: FileList) => {
    if (files.length) {
      const file = files[0];
      if (file.type === "application/pdf") {
        setHasNonPdfFile(false);
        setNewFile(file);
      } else {
        setHasNonPdfFile(true);
      }
    }
  }, []);

  const setNewFile = useCallback((newFile: File) => {
    if (file.fileUrl) {
      URL.revokeObjectURL(file.fileUrl);
    }

    const { name, size } = newFile;
    const fileUrl = URL.createObjectURL(newFile);
    setFile({ name, size, fileUrl });
    
    // Call the appropriate callback based on what was provided
    if (onFileUpload) {
      onFileUpload(newFile);
    }
    
    if (onFileUrlChange) {
      onFileUrlChange(fileUrl);
    }
  }, [file.fileUrl, onFileUpload, onFileUrlChange]);

  // Update handleFiles to use setNewFile
  useEffect(() => {
    // This creates a new reference to handleFiles when setNewFile changes
    handleFiles.current = (files: FileList) => {
      if (files.length) {
        const file = files[0];
        if (file.type === "application/pdf") {
          setHasNonPdfFile(false);
          setNewFile(file);
        } else {
          setHasNonPdfFile(true);
        }
      }
    };
  }, [setNewFile]);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragActive(false);

      const files = e.dataTransfer.files;
      handleFiles(files);
    },
    [handleFiles]
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files) {
        handleFiles(files);
      }
    },
    [handleFiles]
  );

  const onRemove = () => {
    if (file.fileUrl) {
      URL.revokeObjectURL(file.fileUrl);
    }
    
    setFile(defaultFileState);
    
    if (onFileUpload) {
      onFileUpload(new File([], ""));
    }
    
    if (onFileUrlChange) {
    onFileUrlChange("");
    }
  };

  return (
    <div className="w-full">
      {!hasFile ? (
    <div
      className={cx(
            "relative border-2 border-dashed rounded-lg p-8 transition-all duration-300 ease-in-out",
            "flex flex-col items-center justify-center text-center",
            isDragActive
              ? "border-blue-violet-500 bg-blue-violet-50 dark:bg-blue-violet-900/20"
              : "border-gray-300 dark:border-gray-700 hover:border-blue-violet-400 dark:hover:border-blue-violet-600",
            "dark:text-gray-300 cursor-pointer group animate-fade-in",
        className
      )}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("file-upload")?.click()}
        >
          <input
            id="file-upload"
            type="file"
            className="sr-only"
            accept=".pdf"
            onChange={handleFileInputChange}
            disabled={isLoading}
          />

          {isLoading ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 border-4 border-blue-violet-500 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-lg font-medium text-blue-violet-700 dark:text-blue-violet-300">Processing resume...</p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">This may take a few seconds</p>
            </div>
          ) : (
            <>
              <div className="mb-4 p-4 bg-blue-violet-100 dark:bg-blue-violet-900/30 rounded-full transition-all duration-300 group-hover:scale-110">
                <DocumentArrowUpIcon className="h-10 w-10 text-blue-violet-600 dark:text-blue-violet-400" />
              </div>
              <p className="text-lg font-medium mb-2 text-blue-violet-700 dark:text-blue-violet-300">
                Drag & drop your resume
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                or click to browse files (PDF only)
              </p>
              <button className="btn-primary mt-2 scale-100 hover:scale-105 transition-transform">
                Select PDF File
              </button>
              
              {hasNonPdfFile && (
                <p className="mt-4 text-red-500 dark:text-red-400 text-sm">
                  Please upload a PDF file only
                </p>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="relative border-2 rounded-lg p-4 transition-all duration-300 ease-in-out bg-blue-violet-50 dark:bg-blue-violet-900/20 border-blue-violet-200 dark:border-blue-violet-800 animate-fade-in">
          <div className="flex items-center">
            <div className="p-3 bg-blue-violet-100 dark:bg-blue-violet-900/50 rounded-full mr-4">
              <DocumentArrowUpIcon className="h-8 w-8 text-blue-violet-600 dark:text-blue-violet-400" />
              </div>
            <div className="flex-1">
              <p className="font-medium text-blue-violet-700 dark:text-blue-violet-300">{file.name}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(file.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-2 text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400 focus:outline-none"
              aria-label="Remove file"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {isLoading && (
            <div className="absolute inset-0 bg-white/70 dark:bg-gray-800/70 flex items-center justify-center rounded-lg">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 border-4 border-blue-violet-500 border-t-transparent rounded-full animate-spin mb-2"></div>
                <p className="text-sm font-medium text-blue-violet-700 dark:text-blue-violet-300">Processing...</p>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 bg-blue-violet-50 dark:bg-blue-violet-900/20 rounded-lg p-4 animate-slide-up">
        <h3 className="text-sm font-medium text-blue-violet-700 dark:text-blue-violet-300 mb-2">
          For best parsing results:
        </h3>
        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc ml-5">
          <li>Use a well-formatted PDF resume</li>
          <li>Ensure text is selectable (not an image)</li>
          <li>Include clear section headings (Education, Experience, Skills, etc.)</li>
          <li>Use standard formatting without complex layouts</li>
        </ul>
      </div>
    </div>
  );
};

const getFileSizeString = (fileSizeB: number) => {
  const fileSizeKB = fileSizeB / 1024;
  const fileSizeMB = fileSizeKB / 1024;
  if (fileSizeKB < 1000) {
    return fileSizeKB.toPrecision(3) + " KB";
  } else {
    return fileSizeMB.toPrecision(3) + " MB";
  }
};
