// Utility functions for resume rendering

export function formatDate(dateString: string): string {
  if (!dateString) return '';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString; // Return original if invalid date
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${year}`;
  } catch {
    return dateString; // Return original if parsing fails
  }
}

export function formatUrl(url: string): string {
  if (!url) return '';
  return url.replace(/^https?:\/\//, '').replace(/^www\./, '');
} 