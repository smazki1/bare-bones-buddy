import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ImageProcessingRequest {
  originalPath: string;
  bucket: string;
  sizes: {
    thumbnail: { width: number; height?: number };
    large: { width: number; height?: number };
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('Processing image request started');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { originalPath, bucket, sizes }: ImageProcessingRequest = await req.json();
    
    console.log(`Processing image: ${originalPath} in bucket: ${bucket}`);

    // Download original image
    const { data: originalFile, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(originalPath);

    if (downloadError) {
      console.error('Download error:', downloadError);
      throw downloadError;
    }

    console.log('Original image downloaded successfully');

    // Convert to ArrayBuffer for image processing
    const arrayBuffer = await originalFile.arrayBuffer();
    
    // Process images using Canvas API
    const processedImages = await processImageSizes(arrayBuffer, sizes);
    
    console.log(`Generated ${Object.keys(processedImages).length} processed images`);

    // Upload processed images back to storage
    const results = await Promise.all(
      Object.entries(processedImages).map(async ([sizeName, imageData]) => {
        const fileName = originalPath.replace(/\.[^/.]+$/, `-${sizeName}.webp`);
        
        console.log(`Uploading ${sizeName} as: ${fileName}`);

        const { data, error } = await supabase.storage
          .from(bucket)
          .upload(fileName, imageData, {
            contentType: 'image/webp',
            upsert: true
          });

        if (error) {
          console.error(`Upload error for ${sizeName}:`, error);
          throw error;
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from(bucket)
          .getPublicUrl(fileName);

        console.log(`${sizeName} uploaded successfully: ${publicUrl}`);

        return { [sizeName]: publicUrl };
      })
    );

    const urlMap = results.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    console.log('Image processing completed successfully');

    return new Response(
      JSON.stringify({ 
        success: true, 
        urls: urlMap,
        originalPath 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Image processing error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    );
  }
});

async function processImageSizes(
  imageBuffer: ArrayBuffer, 
  sizes: { [key: string]: { width: number; height?: number } }
): Promise<{ [key: string]: Blob }> {
  const results: { [key: string]: Blob } = {};
  
  try {
    // Create image bitmap from buffer
    const imageBlob = new Blob([imageBuffer]);
    const imageBitmap = await createImageBitmap(imageBlob);
    
    console.log(`Original image dimensions: ${imageBitmap.width}x${imageBitmap.height}`);
    
    for (const [sizeName, dimensions] of Object.entries(sizes)) {
      // Calculate dimensions maintaining aspect ratio
      const originalWidth = imageBitmap.width;
      const originalHeight = imageBitmap.height;
      const aspectRatio = originalWidth / originalHeight;
      
      let targetWidth = dimensions.width;
      let targetHeight = dimensions.height || Math.round(targetWidth / aspectRatio);
      
      console.log(`Processing ${sizeName}: ${targetWidth}x${targetHeight}`);
      
      // Create canvas for resizing
      const canvas = new OffscreenCanvas(targetWidth, targetHeight);
      const ctx = canvas.getContext('2d')!;
      
      // Draw and resize image
      ctx.drawImage(imageBitmap, 0, 0, targetWidth, targetHeight);
      
      // Convert to WebP
      const webpBlob = await canvas.convertToBlob({ 
        type: 'image/webp', 
        quality: 0.8 
      });
      
      console.log(`${sizeName} processed: ${webpBlob.size} bytes`);
      results[sizeName] = webpBlob;
    }
    
    imageBitmap.close();
    return results;
  } catch (error) {
    console.error('Error in processImageSizes:', error);
    throw error;
  }
}