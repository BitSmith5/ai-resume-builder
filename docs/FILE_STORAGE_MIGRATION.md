# File Storage Solution: Browser localStorage

## Overview

This document describes the solution for profile picture storage in the AI Resume Builder application using browser localStorage to store images locally on each device.

## Problem

The original implementation stored profile pictures in the local filesystem (`public/uploads/profile-pictures/`). This approach worked in development but failed in production on Vercel because:

1. Vercel's filesystem is read-only in production
2. Files are ephemeral and lost on each deployment
3. The `/public` directory is not writable in production

## Solution

Migrated to storing profile pictures in browser localStorage, which provides:
- No external storage dependencies
- Works on any Vercel plan (including Hobby)
- No filesystem dependencies
- Images stored locally on each device
- No server storage costs

## How It Works

### localStorage Storage
Profile pictures are stored in the browser's localStorage on each device:
- **Database**: Stores only the image ID (e.g., `profile_user123_1234567890_abc123`)
- **localStorage**: Stores the actual image as base64 data URL
- **Device-specific**: Each device manages its own images

### Benefits
- **No External Dependencies**: No need for Vercel Blob, AWS S3, or other storage services
- **Works on Hobby Plan**: No upgrade required
- **Device-specific**: Images stay on the device where they were uploaded
- **No Server Storage**: No database bloat from image data
- **Privacy**: Images never leave the user's device

## Changes Made

### 1. Dependencies
- Removed `@vercel/blob` package (no longer needed)
- Added localStorage utility functions

### 2. API Routes Updated

#### `/api/resumes/upload-profile-picture/route.ts`
- Generates unique image IDs instead of storing files
- Returns image ID for frontend to store in localStorage
- No file storage on server

#### `/api/resumes/delete-profile-picture/route.ts`
- Simplified to just return success
- Actual deletion happens in localStorage

#### `/api/resumes/[id]/route.ts`
- Removed file deletion logic
- Only stores image IDs in database

#### `/api/resumes/[id]/pdf/route.ts`
- Updated to handle localStorage image IDs
- Skips profile pictures in PDF generation (since server can't access localStorage)
- Maintains backward compatibility with legacy paths

### 3. New Utility Functions

#### `src/lib/imageStorage.ts`
- `storeImage()`: Store image in localStorage with ID
- `getImage()`: Retrieve image from localStorage by ID
- `getLatestUserImage()`: Get the most recent image for a user
- `deleteImage()`: Remove image from localStorage
- `clearUserImages()`: Remove all images for a user
- `getImageStorageUsage()`: Check storage usage
- `checkStorageAvailability()`: Verify localStorage is available

### 4. Frontend Updates

#### `src/components/ResumeEditor.tsx`
- Uploads image to get ID, then stores in localStorage
- Loads images from localStorage when editing resumes
- Handles image deletion from localStorage
- Manages device-specific image storage

## Database Storage

Profile pictures are now stored as simple IDs in the database:
- **Field**: `profilePicture` (String)
- **Format**: `profile_userId_timestamp_randomId`
- **Example**: `profile_123_1703123456789_abc123def456`
- **Size**: Very small (just the ID string)

## localStorage Storage

Images are stored in browser localStorage:
- **Key Format**: `profile_image_<imageId>`
- **Value**: JSON object with image data, timestamp, and size
- **Size**: Typically 20-50KB per compressed image
- **Persistence**: Survives browser sessions until cleared

## File Size Considerations

### Recommended Limits
- **Maximum file size**: 5MB (enforced in upload API)
- **Recommended size**: 1-2MB for optimal performance
- **Image dimensions**: 500x500 pixels is sufficient for profile pictures
- **localStorage limit**: ~5-10MB total (varies by browser)

### Compression
The frontend can compress images before storage:
- Use browser's Canvas API to resize images
- Convert to JPEG for better compression
- Target 80% quality for good balance of size and quality

## URL Format

### Before (Local Filesystem)
```
/uploads/profile-pictures/filename.jpg
```

### After (localStorage)
```
profile_user123_1703123456789_abc123def456
```

## Device Behavior

### First Time on Device
1. User uploads profile picture
2. Server generates unique ID
3. Frontend stores image in localStorage with that ID
4. Database stores only the ID

### Returning to Device
1. Resume loads with image ID from database
2. Frontend checks localStorage for image with that ID
3. If found, displays the image
4. If not found, shows no profile picture

### Different Device
1. Resume loads with image ID from database
2. Frontend checks localStorage (empty on new device)
3. No profile picture displayed
4. User must upload image again on this device

## Backward Compatibility

The migration maintains backward compatibility:
- Legacy data URLs still work
- Legacy file paths still work in PDF generation
- Old profile pictures in the database continue to work
- Gradual migration as users update their profile pictures

## Testing

### Local Development
- Profile pictures stored in browser localStorage
- No server storage dependencies
- Works the same as production

### Production
- All profile pictures stored in browser localStorage
- No external storage dependencies
- Works on any Vercel plan

## Migration Steps

1. **Deploy the Updated Code**
   - The new code will handle both old and new file formats
   - No database migration required

2. **Monitor**
   - Check that new uploads work correctly
   - Verify images are stored in localStorage
   - Old profile pictures will continue to work until users update them

## Benefits

1. **No External Dependencies**: Works without any cloud storage services
2. **Hobby Plan Compatible**: No Vercel plan upgrade required
3. **Device-specific**: Images stay on user's device
4. **Privacy-focused**: Images never uploaded to server
5. **Cost-effective**: No storage costs

## Limitations

1. **Device-specific**: Images don't sync across devices
2. **localStorage Limits**: Limited by browser storage capacity
3. **PDF Generation**: Profile pictures not available in PDF (server can't access localStorage)
4. **Browser Clearing**: Images lost if user clears browser data

## Best Practices

1. **Compress Images**: Use frontend compression before storage
2. **Limit File Size**: Enforce reasonable size limits (5MB max)
3. **Monitor Storage**: Check localStorage usage
4. **User Education**: Inform users that images are device-specific

## Troubleshooting

### Common Issues

1. **Upload Fails with 500 Error**
   - Check file size (should be under 5MB)
   - Verify file type (PNG, JPG, HEIC allowed)
   - Check localStorage availability

2. **Images Not Loading**
   - Check if localStorage is available
   - Verify image ID format
   - Check if image exists in localStorage

3. **PDF Generation Missing Profile Picture**
   - This is expected behavior
   - Server cannot access localStorage
   - Consider alternative PDF generation approach

### Debug Steps

1. Check browser console for localStorage errors
2. Verify image ID format in database
3. Test image upload with smaller files
4. Check localStorage usage in browser dev tools
5. Verify localStorage is not disabled 