// Email validation utilities

/**
 * Validate an email address
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Get domain from email address
 */
export const getEmailDomain = (email: string): string => {
  try {
    return email.split('@')[1];
  } catch (error) {
    console.error('Error extracting email domain:', error);
    return '';
  }
}; 