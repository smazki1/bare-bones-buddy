import { supabase } from '@/integrations/supabase/client';

export interface ImageProcessingResult {
  thumbnail: string;
  large: string;
  original: string;
}

export async function uploadAndProcessImage(
  file: File,
  bucket: string,
  folder?: string
): Promise<ImageProcessingResult> {
  try {
    console.log(`Starting upload process for file: ${file.name}`);
    console.log(`File size: ${file.size} bytes`);
    console.log(`File type: ${file.type}`);
    console.log(`Target bucket: ${bucket}`);
    console.log(`Target folder: ${folder || 'root'}`);

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    console.log(`Generated filename: ${fileName}`);

    // Upload original image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Upload error: ${uploadError.message}`);
    }

    if (!uploadData) {
      throw new Error('לא התקבלה תגובה מהשרת');
    }

    console.log('Original image uploaded successfully:', uploadData);

    // Get original image URL
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Original URL:', originalUrl);

    // For images, try to process them. For videos, return the original
    if (file.type.startsWith('image/')) {
      console.log('Processing image with Edge Function');

      // Call Edge Function to process image
      const { data: processResult, error: processError } = await supabase.functions
        .invoke('process-image', {
          body: {
            originalPath: fileName,
            bucket: bucket,
            sizes: {
              thumbnail: { width: 600 },
              large: { width: 1200 }
            }
          }
        });

      if (processError) {
        console.warn('Process error, falling back to original:', processError);
        // If processing fails, return original URL for all sizes
        return {
          thumbnail: originalUrl,
          large: originalUrl,
          original: originalUrl
        };
      }

      if (!processResult || !processResult.urls) {
        console.warn('Invalid process result, falling back to original');
        return {
          thumbnail: originalUrl,
          large: originalUrl,
          original: originalUrl
        };
      }

      console.log('Image processing completed:', processResult);

      return {
        thumbnail: processResult.urls.thumbnail || originalUrl,
        large: processResult.urls.large || originalUrl,
        original: originalUrl
      };
    } else {
      // For videos, return original URL for all sizes
      console.log('File is video, returning original URL');
      return {
        thumbnail: originalUrl,
        large: originalUrl,
        original: originalUrl
      };
    }

  } catch (error: any) {
    console.error('Image processing error:', error);
    
    // If there was an upload error, we can't recover
    if (error.message?.includes('Upload error') || error.message?.includes('לא התקבלה תגובה')) {
      throw error;
    }
    
    // For processing errors, try to return original URL if we have it
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);
        
      if (publicUrl) {
        console.log('Fallback: returning original URL only');
        return {
          thumbnail: publicUrl,
          large: publicUrl,
          original: publicUrl
        };
      }
    } catch (fallbackError) {
      console.error('Fallback failed:', fallbackError);
    }
    
    // Provide more specific error messages
    if (error.message?.includes('InvalidBucketName')) {
      throw new Error('שגיאה בהגדרת האחסון');
    } else if (error.message?.includes('EntityTooLarge')) {
      throw new Error('הקובץ גדול מדי');
    } else if (error.message?.includes('permission')) {
      throw new Error('אין הרשאה להעלות קבצים');
    }
    
    throw new Error('שגיאה בהעלאת הקובץ - נסה שוב');
  }
}

// Specialized function for project images (before/after)
export async function uploadProjectImages(
  beforeImage: File,
  afterImage: File
): Promise<{
  beforeUrl: string;
  afterUrl: string;
  afterThumbUrl: string;
}> {
  console.log('Uploading project images (before/after)');

  const beforeResult = await uploadAndProcessImage(beforeImage, 'project-images', 'before');
  const afterResult = await uploadAndProcessImage(afterImage, 'project-images', 'after');

  return {
    beforeUrl: beforeResult.original,
    afterUrl: afterResult.large,
    afterThumbUrl: afterResult.thumbnail
  };
}

// Function for category icons - hardened upload with admin-link + retry
export async function uploadCategoryIcon(file: File): Promise<string> {
  const linkAdminBestEffort = async () => { try { await supabase.rpc('link_admin_user'); } catch (_) {} };

  const doUpload = async (): Promise<string> => {
    await linkAdminBestEffort();
    const fileExt = file.name.split('.').pop();
    const fileName = `icons/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('category-icons')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('category-icons')
      .getPublicUrl(fileName);

    return publicUrl;
  };

  try {
    return await doUpload();
  } catch (error: any) {
    const msg = String(error?.message || '');
    const code = String(error?.code || '');
    const isPerm = msg.includes('permission') || code === '42501';
    if (isPerm) {
      await new Promise(r => setTimeout(r, 150));
      return await doUpload();
    }
    console.error('Category icon upload error:', error);
    throw new Error('Failed to upload category icon');
  }
}

// Function for service images
export async function uploadServiceImage(file: File): Promise<string> {
  console.log('Uploading service image');
  const result = await uploadAndProcessImage(file, 'service-images', 'services');
  return result.large;
}

// Generic function for single image uploads with better error handling
export async function uploadSingleImage(
  file: File,
  bucket: string,
  folder?: string,
  useThumb = false
): Promise<string> {
  try {
    console.log(`[uploadSingleImage] Starting upload: ${file.name} to ${bucket}/${folder || ''}`);
    
    // Validate file
    if (!file) {
      throw new Error('לא נבחר קובץ');
    }
    
    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      throw new Error('הקובץ גדול מדי. מקסימום 10MB');
    }
    
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedImageTypes.includes(file.type)) {
      throw new Error('סוג קובץ לא נתמך לתמונות. אנא השתמש ב-JPG, PNG, GIF או WebP');
    }
    
    console.log(`[uploadSingleImage] File validation passed, calling uploadAndProcessImage`);
    const result = await uploadAndProcessImage(file, bucket, folder);
    console.log('[uploadSingleImage] Upload result:', result);
    
    const finalUrl = useThumb ? result.thumbnail : result.large;
    console.log(`[uploadSingleImage] Returning ${useThumb ? 'thumbnail' : 'large'} URL:`, finalUrl);
    
    return finalUrl;
  } catch (error: any) {
    console.error('[uploadSingleImage] Error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'שגיאה בהעלאת הקובץ';
    
    if (error.message?.includes('permission')) {
      userMessage = 'שגיאת הרשאה. אנא התחבר שוב';
    } else if (error.message?.includes('network')) {
      userMessage = 'שגיאת רשת. אנא נסה שוב';
    } else if (error.message?.includes('size')) {
      userMessage = 'הקובץ גדול מדי';
    } else if (error.message?.includes('Upload error')) {
      userMessage = `שגיאת העלאה: ${error.message}`;
    } else if (error.message) {
      userMessage = error.message;
    }
    
    throw new Error(userMessage);
  }
}

// Function for video uploads - simplified without image processing
export async function uploadSingleVideo(
  file: File,
  bucket: string,
  folder?: string
): Promise<string> {
  try {
    console.log(`Starting video upload: ${file.name} to ${bucket}/${folder || ''}`);
    
    // Validate file
    if (!file) {
      throw new Error('לא נבחר קובץ וידאו');
    }
    
    if (file.size > 50 * 1024 * 1024) { // 50MB limit for videos
      throw new Error('קובץ הוידאו גדול מדי. מקסימום 50MB');
    }
    
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/avi', 'video/mov'];
    if (!allowedVideoTypes.includes(file.type)) {
      throw new Error('סוג קובץ וידאו לא נתמך. אנא השתמש ב-MP4, WebM, AVI או MOV');
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    console.log(`Generated video filename: ${fileName}`);

    // Upload video file directly without processing
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Video upload error:', uploadError);
      throw new Error(`שגיאה בהעלאה: ${uploadError.message}`);
    }

    if (!uploadData) {
      throw new Error('לא התקבלה תגובה מהשרת');
    }

    console.log('Video uploaded successfully:', uploadData);

    // Get video URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Video URL:', publicUrl);
    return publicUrl;
    
  } catch (error: any) {
    console.error('Video upload error:', error);
    
    // Provide user-friendly error messages
    let userMessage = 'שגיאה בהעלאת הוידאו';
    
    if (error.message?.includes('permission')) {
      userMessage = 'שגיאת הרשאה. אנא התחבר שוב';
    } else if (error.message?.includes('network')) {
      userMessage = 'שגיאת רשת. אנא נסה שוב';
    } else if (error.message?.includes('size')) {
      userMessage = 'קובץ הוידאו גדול מדי';
    } else if (error.message?.includes('EntityTooLarge')) {
      userMessage = 'קובץ הוידאו גדול מדי';
    } else if (error.message) {
      userMessage = error.message;
    }
    
    throw new Error(userMessage);
  }
}