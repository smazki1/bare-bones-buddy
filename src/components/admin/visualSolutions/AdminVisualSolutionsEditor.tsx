import { useState, useEffect, useRef } from 'react';
import { X, Upload, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { VisualSolutionCard } from '@/types/visualSolutions';
import { visualSolutionsStore } from '@/data/visualSolutionsStore';
import { convertFileToDataUrl, isValidImageFile, isValidVideoFile } from '@/utils/fileUtils';

interface AdminVisualSolutionsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: VisualSolutionCard) => void;
  editingCard?: VisualSolutionCard | null;
}

const AdminVisualSolutionsEditor = ({ 
  isOpen, 
  onClose, 
  onSave, 
  editingCard 
}: AdminVisualSolutionsEditorProps) => {
  const [formData, setFormData] = useState<Partial<VisualSolutionCard>>({
    title: '',
    imageSrc: '',
    videoSrc: '',
    href: '/services',
    tagSlug: '',
    enabled: true,
    order: 0,
  });
  
  const [previewMode, setPreviewMode] = useState<'image' | 'video'>('image');
  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingCard) {
      setFormData(editingCard);
      setPreviewMode(editingCard.videoSrc ? 'video' : 'image');
    } else {
      const config = visualSolutionsStore.safeGetConfigOrDefaults();
      setFormData({
        title: '',
        imageSrc: '',
        videoSrc: '',
        href: '/services',
        tagSlug: '',
        enabled: true,
        order: config.items.length,
      });
      setPreviewMode('image');
    }
  }, [editingCard, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.imageSrc) {
      return;
    }

    const cardData: VisualSolutionCard = {
      id: editingCard?.id || visualSolutionsStore.generateId(formData.title),
      title: formData.title,
      imageSrc: formData.imageSrc,
      videoSrc: formData.videoSrc || undefined,
      href: formData.href || '/services',
      tagSlug: formData.tagSlug || undefined,
      enabled: formData.enabled ?? true,
      order: formData.order ?? 0,
    };

    onSave(cardData);
    onClose();
  };

  const handleDrop = async (e: React.DragEvent, type: 'image' | 'video') => {
    console.log('handleDrop called with type:', type);
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files.length, files.map(f => f.name));
    if (files.length === 0) {
      console.log('No files in drop');
      return;
    }
    
    const file = files[0];
    console.log('Processing dropped file:', file.name, file.type, file.size);
    setIsUploading(true);
    
    try {
      if (type === 'image') {
        if (!isValidImageFile(file)) {
          console.log('Invalid image file dropped:', file.name, file.type);
          return;
        }
        console.log('Converting dropped image to data URL');
        const dataUrl = await convertFileToDataUrl(file);
        setFormData(prev => ({ ...prev, imageSrc: dataUrl }));
        console.log('Image replaced via drag & drop');
      } else {
        if (!isValidVideoFile(file)) {
          console.log('Invalid video file dropped:', file.name, file.type);
          return;
        }
        console.log('Converting dropped video to data URL');
        const dataUrl = await convertFileToDataUrl(file);
        setFormData(prev => ({ ...prev, videoSrc: dataUrl }));
        console.log('Video replaced via drag & drop');
      }
    } catch (error) {
      console.error('Error processing dropped file:', error);
    } finally {
      setIsUploading(false);
      console.log('Drag & drop process completed');
    }
  };

  const handleImageFileSelect = async (file: File | null) => {
    console.log('handleImageFileSelect called with:', file?.name);
    if (!file) {
      console.log('No file provided');
      return;
    }
    if (!isValidImageFile(file)) {
      console.log('Invalid image file selected:', file.name, file.type);
      return;
    }
    
    console.log('Starting image upload process for:', file.name);
    setIsUploading(true);
    try {
      const dataUrl = await convertFileToDataUrl(file);
      console.log('Image converted to data URL, length:', dataUrl.length);
      setFormData(prev => {
        const newData = { ...prev, imageSrc: dataUrl };
        console.log('FormData updated with new image');
        return newData;
      });
      console.log('Image updated successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
      console.log('Upload process completed');
    }
  };

  const handleVideoFileSelect = async (file: File | null) => {
    if (!file) return;
    if (!isValidVideoFile(file)) {
      console.log('Invalid video file selected');
      return;
    }
    
    setIsUploading(true);
    try {
      const dataUrl = await convertFileToDataUrl(file);
      setFormData(prev => ({ ...prev, videoSrc: dataUrl }));
      console.log('Video updated successfully');
    } catch (error) {
      console.error('Error uploading video:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-assistant text-xl">
            {editingCard ? 'עריכת פתרון ויזואלי' : 'הוספת פתרון ויזואלי חדש'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title" className="font-assistant">כותרת *</Label>
              <Input
                id="title"
                value={formData.title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="לדוגמה: תמונות תפריט"
                required
                className="font-open-sans"
              />
            </div>

            <div>
              <Label htmlFor="href" className="font-assistant">קישור (אופציונלי)</Label>
              <Input
                id="href"
                value={formData.href || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
                placeholder="/services"
                className="font-open-sans"
              />
            </div>

            <div>
              <Label htmlFor="tagSlug" className="font-assistant">תג סינון (אופציונלי)</Label>
              <Input
                id="tagSlug"
                value={formData.tagSlug || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, tagSlug: e.target.value }))}
                placeholder="menu-photos"
                className="font-open-sans"
              />
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="enabled"
                checked={formData.enabled ?? true}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
              />
              <Label htmlFor="enabled" className="font-assistant">
                {formData.enabled ? <Eye className="w-4 h-4 inline ml-1" /> : <EyeOff className="w-4 h-4 inline ml-1" />}
                {formData.enabled ? 'פעיל' : 'לא פעיל'}
              </Label>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-4">
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                variant={previewMode === 'image' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('image')}
                className="font-assistant"
              >
                תמונה
              </Button>
              <Button
                type="button"
                variant={previewMode === 'video' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPreviewMode('video')}
                className="font-assistant"
              >
                וידאו
              </Button>
            </div>

            {previewMode === 'image' && (
              <div>
                <Label className="font-assistant">תמונה ראשית *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                  } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDrop={(e) => handleDrop(e, 'image')}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => {
                    console.log('Image upload area clicked');
                    if (!isUploading) {
                      console.log('Opening file picker');
                      imageInputRef.current?.click();
                    } else {
                      console.log('Upload in progress, click ignored');
                    }
                  }}
                >
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="font-open-sans text-sm text-gray-600">
                        מעלה תמונה...
                      </p>
                    </div>
                  ) : formData.imageSrc ? (
                    <div className="space-y-2">
                      <img
                        src={formData.imageSrc}
                        alt="Preview"
                        className="max-w-full h-32 object-cover mx-auto rounded"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, imageSrc: '' }));
                        }}
                        className="font-assistant"
                      >
                        <X className="w-4 h-4 ml-1" />
                        החלף תמונה
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="font-open-sans text-sm text-gray-600">
                        גרור תמונה לכאן או הדבק URL
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    console.log('Input onChange triggered', e.target.files?.[0]?.name);
                    handleImageFileSelect(e.target.files?.[0] || null);
                  }}
                />
                <Input
                  value={formData.imageSrc || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageSrc: e.target.value }))}
                  placeholder="או הדבק URL של תמונה כאן"
                  className="mt-2 font-open-sans"
                />
              </div>
            )}

            {previewMode === 'video' && (
              <div>
                <Label className="font-assistant">וידאו (אופציונלי)</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                    dragActive ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'
                  } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  onDrop={(e) => handleDrop(e, 'video')}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => !isUploading && videoInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="space-y-2">
                      <div className="w-8 h-8 mx-auto border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="font-open-sans text-sm text-gray-600">
                        מעלה וידאו...
                      </p>
                    </div>
                  ) : formData.videoSrc ? (
                    <div className="space-y-2">
                      <video
                        src={formData.videoSrc}
                        className="max-w-full h-32 object-cover mx-auto rounded"
                        controls
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFormData(prev => ({ ...prev, videoSrc: '' }));
                        }}
                        className="font-assistant"
                      >
                        <X className="w-4 h-4 ml-1" />
                        החלף וידאו
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="w-8 h-8 mx-auto text-gray-400" />
                      <p className="font-open-sans text-sm text-gray-600">
                        גרור וידאו לכאן או הדבק URL
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={videoInputRef}
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={(e) => handleVideoFileSelect(e.target.files?.[0] || null)}
                />
                <Input
                  value={formData.videoSrc || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, videoSrc: e.target.value }))}
                  placeholder="או הדבק URL של וידאו כאן"
                  className="mt-2 font-open-sans"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!formData.title || !formData.imageSrc || isUploading}
              className="font-assistant"
            >
              {isUploading ? 'מעלה...' : editingCard ? 'עדכן' : 'הוסף'} פתרון ויזואלי
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="font-assistant"
            >
              ביטול
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AdminVisualSolutionsEditor;