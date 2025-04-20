'use client';

import { useState, useEffect } from 'react';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export const ThemeToggle = () => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check for dark mode preference in local storage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDarkMode);
    
    // Apply the theme class to the document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    // Store preference in local storage
    localStorage.setItem('darkMode', newDarkMode.toString());
    
    // Update the document class
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="p-2 rounded-full transition-colors duration-200 ease-in-out bg-blue-violet-100 dark:bg-blue-violet-900 hover:bg-blue-violet-200 dark:hover:bg-blue-violet-800 focus:outline-none focus:ring-2 focus:ring-blue-violet-500"
      aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {darkMode ? (
        <SunIcon className="h-5 w-5 text-blue-violet-100 animate-pulse-subtle" />
      ) : (
        <MoonIcon className="h-5 w-5 text-blue-violet-800 animate-pulse-subtle" />
      )}
    </button>
  );
}; 