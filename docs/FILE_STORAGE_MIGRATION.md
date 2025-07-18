# File Storage Migration to Vercel Blob

## Overview

This document describes the migration from local filesystem storage to Vercel Blob storage for profile pictures in the AI Resume Builder application.

## Problem

The original implementation stored profile pictures in the local filesystem (`public/uploads/profile-pictures/`). This approach worked in development but failed in production on Vercel because:

1. Vercel's filesystem is read-only in production
2. Files are ephemeral and lost on each deployment
3. The `/public` directory is not writable in production

## Solution

Migrated to Vercel Blob storage, which provides:
- Persistent cloud storage
- Automatic CDN distribution
- Proper file management in production
- No filesystem dependencies

## Changes Made

### 1. Dependencies
- Added `@vercel/blob` package for cloud storage operations

### 2. API Routes Updated

#### `/api/resumes/upload-profile-picture/route.ts`
- Replaced `formidable` with native `FormData` parsing
- Replaced local filesystem operations with Vercel Blob `put()` function
- Added proper file validation (type and size)
- Generate unique filenames with user ID and timestamp

#### `/api/resumes/delete-profile-picture/route.ts`
- Replaced `fs.unlinkSync()` with Vercel Blob `del()` function
- Added validation for blob URLs
- Graceful handling of non-existent blobs

#### `/api/resumes/[id]/route.ts`
- Updated PUT method to handle blob URL deletion
- Updated DELETE method to handle blob URL deletion
- Added backward compatibility for legacy local file paths

#### `/api/resumes/[id]/pdf/route.ts`
- Added support for Vercel Blob URLs in PDF generation
- Maintained backward compatibility for legacy paths

### 3. Configuration Updates

#### `next.config.ts`
- Added `blob.vercel-storage.com` to allowed image domains
- Enables Next.js Image component to work with blob URLs

## Environment Variables Required

For production deployment, you need to set the following environment variable in Vercel:

```
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token
```

### How to Get the Token

1. Go to your Vercel dashboard
2. Navigate to Storage → Blob
3. Create a new Blob store if you don't have one
4. Copy the `BLOB_READ_WRITE_TOKEN` from the store settings

## File Structure

### Before (Local Filesystem)
```
public/uploads/profile-pictures/
├── user1/
│   ├── 1234567890-abc123.jpg
│   └── 1234567891-def456.png
└── user2/
    └── 1234567892-ghi789.jpg
```

### After (Vercel Blob)
```
profile-pictures/
├── user1/
│   ├── 1234567890-abc123.jpg
│   └── 1234567891-def456.png
└── user2/
    └── 1234567892-ghi789.jpg
```

## URL Format

### Before
```
/uploads/profile-pictures/filename.jpg
```

### After
```
https://blob.vercel-storage.com/profile-pictures/user-id/timestamp-randomid.jpg
```

## Backward Compatibility

The migration maintains backward compatibility:
- Legacy local file paths are still handled in PDF generation
- Old profile pictures in the database continue to work
- Gradual migration as users update their profile pictures

## Testing

### Local Development
- Profile pictures are uploaded to Vercel Blob storage
- No local filesystem dependencies
- Works the same as production

### Production
- All file operations use Vercel Blob
- Automatic CDN distribution
- Persistent storage across deployments

## Migration Steps for Existing Deployments

1. **Set Environment Variable**
   ```bash
   # In Vercel dashboard
   BLOB_READ_WRITE_TOKEN=your_token_here
   ```

2. **Deploy the Updated Code**
   - The new code will handle both old and new file formats
   - No database migration required

3. **Monitor**
   - Check that new uploads work correctly
   - Verify PDF generation works with both old and new URLs
   - Old profile pictures will continue to work until users update them

## Benefits

1. **Production Ready**: Works reliably on Vercel
2. **Scalable**: No filesystem limitations
3. **Fast**: CDN distribution for better performance
4. **Secure**: Proper access controls and validation
5. **Maintainable**: No local file management required

## Troubleshooting

### Common Issues

1. **Upload Fails with 500 Error**
   - Check that `BLOB_READ_WRITE_TOKEN` is set correctly
   - Verify the token has proper permissions

2. **Images Not Loading**
   - Ensure `blob.vercel-storage.com` is in `next.config.ts` image domains
   - Check that the blob URL is accessible

3. **PDF Generation Fails**
   - Verify the profile picture URL is accessible
   - Check that Puppeteer can access the blob URL

### Debug Steps

1. Check Vercel function logs for detailed error messages
2. Verify environment variables are set correctly
3. Test blob operations manually using the Vercel dashboard
4. Check that the blob store is properly configured 