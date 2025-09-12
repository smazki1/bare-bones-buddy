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

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    console.log(`Generated filename: ${fileName}`);

    // Upload original image
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    console.log('Original image uploaded successfully');

    // Get original image URL
    const { data: { publicUrl: originalUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    console.log('Calling process-image Edge Function');

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
      console.error('Process error:', processError);
      throw processError;
    }

    console.log('Image processing completed:', processResult);

    return {
      thumbnail: processResult.urls.thumbnail,
      large: processResult.urls.large,
      original: originalUrl
    };

  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Failed to upload and process image');
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

// Function for category icons
export async function uploadCategoryIcon(file: File): Promise<string> {
  console.log('Uploading category icon');
  const result = await uploadAndProcessImage(file, 'category-icons', 'icons');
  return result.thumbnail; // Use thumbnail size for icons
}

// Function for service images
export async function uploadServiceImage(file: File): Promise<string> {
  console.log('Uploading service image');
  const result = await uploadAndProcessImage(file, 'service-images', 'services');
  return result.large;
}

// Generic function for single image uploads
export async function uploadSingleImage(
  file: File,
  bucket: string,
  folder?: string,
  useThumb = false
): Promise<string> {
  const result = await uploadAndProcessImage(file, bucket, folder);
  return useThumb ? result.thumbnail : result.large;
}