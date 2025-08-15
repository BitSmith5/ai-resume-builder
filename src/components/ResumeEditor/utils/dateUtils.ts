// Date formatting utility functions

/**
 * Formats a phone number as (XXX) XXX-XXXX
 */
export const formatPhoneNumber = (value: string): string => {
  // Remove all non-digit characters
  const phoneNumber = value.replace(/\D/g, "");

  // Limit to 10 digits
  const trimmed = phoneNumber.slice(0, 10);

  // Format as (XXX) XXX-XXXX
  if (trimmed.length === 0) return "";
  if (trimmed.length <= 3) return `(${trimmed}`;
  if (trimmed.length <= 6)
    return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
  return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
};

/**
 * Formats a date string for display
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  } catch {
    return dateString;
  }
};

/**
 * Checks if a date is in the future
 */
export const isDateInFuture = (dateString: string): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return false;
    
    return date > new Date();
  } catch {
    return false;
  }
};
