import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { uploadSingleImage } from '@/utils/imageProcessing';

interface ImageUploadProps {
  onImageUploaded: (url: string) => void;
  currentImageUrl?: string;
  label: string;
  accept?: string;
  uploadFunction?: (file: File) => Promise<string>;
  className?: string;
  bucket?: string;
  folder?: string;
}

export function ImageUpload({ 
  onImageUploaded, 
  currentImageUrl, 
  label, 
  accept = "image/*",
  uploadFunction,
  className = "",
  bucket = 'service-images',
  folder = 'services'
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    
    try {
      // Create preview
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Upload and process image
      let uploadedUrl: string;
      if (uploadFunction) {
        uploadedUrl = await uploadFunction(file);
      } else {
        // Use default image processing
        uploadedUrl = await uploadSingleImage(file, bucket, folder);
      }
      
      // Clean up preview URL
      URL.revokeObjectURL(preview);
      
      // Set the actual uploaded URL
      setPreviewUrl(uploadedUrl);
      onImageUploaded(uploadedUrl);

    } catch (error) {
      console.error('Upload failed:', error);
      // Reset preview on error
      setPreviewUrl(currentImageUrl);
      alert('העלאת התמונה נכשלה. אנא נסה שוב.');
    } finally {
      setUploading(false);
    }
  };

  const clearImage = () => {
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-2 ${className}`} dir="rtl">
      <label className="block text-sm font-medium text-foreground">
        {label}
      </label>
      
      <div className="border-2 border-dashed border-border rounded-lg p-4 bg-background">
        {previewUrl ? (
          <div className="relative">
            <img 
              src={previewUrl} 
              alt="תצוגה מקדימה" 
              className="w-full h-48 object-cover rounded-md"
            />
            {!uploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={clearImage}
                className="absolute top-2 right-2"
              >
                <X size={16} />
              </Button>
            )}
            {uploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
                <div className="flex items-center gap-2 text-white">
                  <Loader2 className="animate-spin" size={20} />
                  <span>מעלה...</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
            <div className="mt-4">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                {uploading ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    מעלה...
                  </>
                ) : (
                  <>
                    <Upload size={16} />
                    העלה תמונה
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              PNG, JPG, WEBP עד 10MB
            </p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
}