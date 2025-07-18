// Utility functions for storing and retrieving profile pictures in localStorage

export interface StoredImage {
  id: string;
  dataUrl: string;
  timestamp: number;
  size: number;
}

/**
 * Store an image in localStorage
 */
export const storeImage = (imageId: string, file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      try {
        const dataUrl = reader.result as string;
        const storedImage: StoredImage = {
          id: imageId,
          dataUrl,
          timestamp: Date.now(),
          size: file.size
        };
        
        // Store in localStorage
        localStorage.setItem(`profile_image_${imageId}`, JSON.stringify(storedImage));
        
        // Also store a reference to the latest image for this user
        const userId = imageId.split('_')[1]; // Extract user ID from imageId
        localStorage.setItem(`user_${userId}_latest_image`, imageId);
        
        resolve();
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

/**
 * Retrieve an image from localStorage
 */
export const getImage = (imageId: string): string | null => {
  try {
    const stored = localStorage.getItem(`profile_image_${imageId}`);
    if (!stored) return null;
    
    const imageData: StoredImage = JSON.parse(stored);
    return imageData.dataUrl;
  } catch (error) {
    console.error('Error retrieving image from localStorage:', error);
    return null;
  }
};

/**
 * Get the latest image for a user
 */
export const getLatestUserImage = (userId: string): string | null => {
  try {
    const latestImageId = localStorage.getItem(`user_${userId}_latest_image`);
    if (!latestImageId) return null;
    
    return getImage(latestImageId);
  } catch (error) {
    console.error('Error retrieving latest user image:', error);
    return null;
  }
};

/**
 * Delete an image from localStorage
 */
export const deleteImage = (imageId: string): void => {
  try {
    localStorage.removeItem(`profile_image_${imageId}`);
    
    // If this was the latest image for a user, clear that reference too
    const userId = imageId.split('_')[1];
    const latestImageId = localStorage.getItem(`user_${userId}_latest_image`);
    if (latestImageId === imageId) {
      localStorage.removeItem(`user_${userId}_latest_image`);
    }
  } catch (error) {
    console.error('Error deleting image from localStorage:', error);
  }
};

/**
 * Clear all images for a user
 */
export const clearUserImages = (userId: string): void => {
  try {
    // Get all keys that start with profile_image_ and contain the user ID
    const keys = Object.keys(localStorage);
    const userImageKeys = keys.filter(key => 
      key.startsWith('profile_image_') && key.includes(`_${userId}_`)
    );
    
    // Delete all user images
    userImageKeys.forEach(key => localStorage.removeItem(key));
    
    // Clear the latest image reference
    localStorage.removeItem(`user_${userId}_latest_image`);
  } catch (error) {
    console.error('Error clearing user images:', error);
  }
};

/**
 * Get storage usage for images
 */
export const getImageStorageUsage = (): { totalSize: number; imageCount: number } => {
  try {
    const keys = Object.keys(localStorage);
    const imageKeys = keys.filter(key => key.startsWith('profile_image_'));
    
    let totalSize = 0;
    let imageCount = 0;
    
    imageKeys.forEach(key => {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          const imageData: StoredImage = JSON.parse(stored);
          totalSize += imageData.size;
          imageCount++;
        }
      } catch (error) {
        console.error('Error parsing stored image:', error);
      }
    });
    
    return { totalSize, imageCount };
  } catch (error) {
    console.error('Error calculating storage usage:', error);
    return { totalSize: 0, imageCount: 0 };
  }
};

/**
 * Check if localStorage is available and has enough space
 */
export const checkStorageAvailability = (fileSize: number): boolean => {
  try {
    // Check if localStorage is available
    if (typeof localStorage === 'undefined') return false;
    
    // Test if we can write to localStorage
    const testKey = 'storage_test';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    
    // Estimate available space (rough calculation)
    const { totalSize } = getImageStorageUsage();
    const estimatedAvailable = 5 * 1024 * 1024; // Assume 5MB available
    const estimatedNeeded = fileSize + totalSize;
    
    return estimatedNeeded < estimatedAvailable;
  } catch (error) {
    console.error('Error checking storage availability:', error);
    return false;
  }
}; 