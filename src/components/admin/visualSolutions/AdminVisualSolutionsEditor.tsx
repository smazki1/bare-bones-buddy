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

  const handleDrop = (e: React.DragEvent, type: 'image' | 'video') => {
    e.preventDefault();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;
    
    const file = files[0];
    if (type === 'image') {
      if (!isValidImageFile(file)) return;
      convertFileToDataUrl(file).then((dataUrl) => {
        setFormData(prev => ({ ...prev, imageSrc: dataUrl }));
      });
    } else {
      if (!isValidVideoFile(file)) return;
      convertFileToDataUrl(file).then((dataUrl) => {
        setFormData(prev => ({ ...prev, videoSrc: dataUrl }));
      });
    }
  };

  const handleImageFileSelect = async (file: File | null) => {
    if (!file) return;
    if (!isValidImageFile(file)) return;
    const dataUrl = await convertFileToDataUrl(file);
    setFormData(prev => ({ ...prev, imageSrc: dataUrl }));
  };

  const handleVideoFileSelect = async (file: File | null) => {
    if (!file) return;
    if (!isValidVideoFile(file)) return;
    const dataUrl = await convertFileToDataUrl(file);
    setFormData(prev => ({ ...prev, videoSrc: dataUrl }));
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
                  }`}
                  onDrop={(e) => handleDrop(e, 'image')}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => imageInputRef.current?.click()}
                >
                  {formData.imageSrc ? (
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
                        onClick={() => setFormData(prev => ({ ...prev, imageSrc: '' }))}
                        className="font-assistant"
                      >
                        <X className="w-4 h-4 ml-1" />
                        הסר תמונה
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
                  onChange={(e) => handleImageFileSelect(e.target.files?.[0] || null)}
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
                  }`}
                  onDrop={(e) => handleDrop(e, 'video')}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onClick={() => videoInputRef.current?.click()}
                >
                  {formData.videoSrc ? (
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
                        onClick={() => setFormData(prev => ({ ...prev, videoSrc: '' }))}
                        className="font-assistant"
                      >
                        <X className="w-4 h-4 ml-1" />
                        הסר וידאו
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
              disabled={!formData.title || !formData.imageSrc}
              className="font-assistant"
            >
              {editingCard ? 'עדכן' : 'הוסף'} פתרון ויזואלי
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