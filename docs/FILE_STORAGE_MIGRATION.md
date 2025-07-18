# File Storage Solution: Base64 Data URLs

## Overview

This document describes the solution for profile picture storage in the AI Resume Builder application using base64 data URLs stored directly in the database.

## Problem

The original implementation stored profile pictures in the local filesystem (`public/uploads/profile-pictures/`). This approach worked in development but failed in production on Vercel because:

1. Vercel's filesystem is read-only in production
2. Files are ephemeral and lost on each deployment
3. The `/public` directory is not writable in production

## Solution

Migrated to storing profile pictures as base64 data URLs directly in the database, which provides:
- No external storage dependencies
- Works on any Vercel plan (including Hobby)
- No filesystem dependencies
- Simple and reliable

## How It Works

### Data URL Format
Profile pictures are stored as base64 data URLs in the format:
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=
```

### Benefits
- **No External Dependencies**: No need for Vercel Blob, AWS S3, or other storage services
- **Works on Hobby Plan**: No upgrade required
- **Simple**: Everything stored in the database
- **Reliable**: No external service failures to worry about
- **Fast**: No network requests to load images

## Changes Made

### 1. Dependencies
- Removed `@vercel/blob` package (no longer needed)

### 2. API Routes Updated

#### `/api/resumes/upload-profile-picture/route.ts`
- Replaced Vercel Blob upload with base64 conversion
- Converts uploaded files to data URLs
- Stores the data URL directly in the database

#### `/api/resumes/delete-profile-picture/route.ts`
- Simplified to just return success (no file deletion needed)
- Data URLs are replaced when new images are uploaded

#### `/api/resumes/[id]/route.ts`
- Removed file deletion logic
- Data URLs are handled directly in the database

#### `/api/resumes/[id]/pdf/route.ts`
- Updated to handle data URLs properly
- Maintains backward compatibility with legacy file paths

### 3. Configuration Updates

#### `next.config.ts`
- Removed `blob.vercel-storage.com` from allowed image domains
- No special configuration needed for data URLs

## Database Storage

Profile pictures are now stored as text in the database:
- **Field**: `profilePicture` (String)
- **Format**: `data:image/jpeg;base64,<base64_data>` or `data:image/png;base64,<base64_data>`
- **Size**: Typically 20-50KB for compressed images

## File Size Considerations

### Recommended Limits
- **Maximum file size**: 5MB (enforced in upload API)
- **Recommended size**: 1-2MB for optimal performance
- **Image dimensions**: 500x500 pixels is sufficient for profile pictures

### Compression
The frontend can compress images before upload to reduce database size:
- Use browser's Canvas API to resize images
- Convert to JPEG for better compression
- Target 80% quality for good balance of size and quality

## URL Format

### Before (Local Filesystem)
```
/uploads/profile-pictures/filename.jpg
```

### After (Data URLs)
```
data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k=
```

## Backward Compatibility

The migration maintains backward compatibility:
- Legacy local file paths are still handled in PDF generation
- Old profile pictures in the database continue to work
- Gradual migration as users update their profile pictures

## Testing

### Local Development
- Profile pictures are converted to data URLs
- No local filesystem dependencies
- Works the same as production

### Production
- All profile pictures stored as data URLs in database
- No external storage dependencies
- Works on any Vercel plan

## Migration Steps

1. **Deploy the Updated Code**
   - The new code will handle both old and new file formats
   - No database migration required

2. **Monitor**
   - Check that new uploads work correctly
   - Verify PDF generation works with both old and new URLs
   - Old profile pictures will continue to work until users update them

## Benefits

1. **No External Dependencies**: Works without any cloud storage services
2. **Hobby Plan Compatible**: No Vercel plan upgrade required
3. **Simple**: Everything stored in the database
4. **Reliable**: No external service failures
5. **Fast**: No network requests to load images

## Limitations

1. **Database Size**: Images increase database size
2. **Query Performance**: Large data URLs may impact query performance
3. **Memory Usage**: Large images consume more memory when loaded

## Best Practices

1. **Compress Images**: Use frontend compression before upload
2. **Limit File Size**: Enforce reasonable size limits (5MB max)
3. **Monitor Database Size**: Keep an eye on database growth
4. **Consider Cleanup**: Periodically clean up unused profile pictures

## Troubleshooting

### Common Issues

1. **Upload Fails with 500 Error**
   - Check file size (should be under 5MB)
   - Verify file type (PNG, JPG, HEIC allowed)

2. **Images Not Loading**
   - Check that data URL is properly formatted
   - Verify base64 encoding is correct

3. **PDF Generation Fails**
   - Verify the data URL is accessible
   - Check that Puppeteer can handle the data URL

### Debug Steps

1. Check Vercel function logs for detailed error messages
2. Verify data URL format in database
3. Test image upload with smaller files
4. Check browser console for any JavaScript errors 