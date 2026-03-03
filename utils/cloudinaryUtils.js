// utils/cloudinaryUtils.js

import cloudinary from '../config/cloudinary.js'; // Adjust the path as needed

/**
 * Extracts the public ID from a Cloudinary URL
 * @param {string} cloudinaryUrl - The full Cloudinary URL
 * @returns {string|null} - The extracted public ID or null if not found
 */
export const extractPublicId = (cloudinaryUrl) => {
  if (!cloudinaryUrl) return null;
  
  // URL format: https://res.cloudinary.com/cloud-name/image/upload/v1234567890/folder/filename.ext
  const urlParts = cloudinaryUrl.split('/');
  const uploadIndex = urlParts.findIndex(part => part === 'upload');
  
  if (uploadIndex !== -1 && uploadIndex < urlParts.length - 2) {
    // Get everything after the version segment
    return urlParts.slice(uploadIndex + 2).join('/').replace(/\.\w+$/, '');
  }
  
  return null;
};

/**
 * Deletes a file from Cloudinary
 * @param {string} publicId - The Cloudinary public ID of the file
 * @param {string} resourceType - The type of resource ('image', 'video', 'raw', etc.)
 * @returns {Promise<object>} - The result of the delete operation
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'raw') => {
  try {
    if (!publicId) return { result: 'No public ID provided' };
    
    const result = await cloudinary.uploader.destroy(publicId, { 
      resource_type: resourceType 
    });
    console.log('Cloudinary delete result:', result);
    return result;
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    return { error: error.message };
  }
};

/**
 * Determines the resource type based on file extension
 * @param {string} fileUrl - The URL of the file
 * @returns {string} - The resource type for Cloudinary
 */
export const getResourceType = (fileUrl) => {
  if (!fileUrl) return 'raw';
  
  const extension = fileUrl.split('.').pop().toLowerCase();
  
  // Image extensions
  if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'].includes(extension)) {
    return 'image';
  }
  
  // Video extensions
  if (['mp4', 'mov', 'avi', 'wmv', 'flv', 'mkv', 'webm'].includes(extension)) {
    return 'video';
  }
  
  // For all other files
  return 'raw';
};

/**
 * Deletes a file from Cloudinary using its URL
 * @param {string} fileUrl - The Cloudinary URL of the file
 * @returns {Promise<object>} - The result of the delete operation
 */
export const deleteFileByUrl = async (fileUrl) => {
  if (!fileUrl) return { result: 'No file URL provided' };
  
  const publicId = extractPublicId(fileUrl);
  const resourceType = getResourceType(fileUrl);
  
  return await deleteFromCloudinary(publicId, resourceType);
};