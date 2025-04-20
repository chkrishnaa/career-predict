// Phone number formatting utilities

/**
 * Format a phone number to (XXX) XXX-XXXX format
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  try {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Check if the input is of correct length
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
    
    if (match) {
      return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    
    return phoneNumber;
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phoneNumber;
  }
};

/**
 * Validate a phone number
 */
export const validatePhoneNumber = (phoneNumber: string): boolean => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Check if the cleaned number is a valid US phone number (10 digits)
  return cleaned.length === 10;
}; 