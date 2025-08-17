import { useState, useRef } from 'react';
import { SolutionCard } from '@/types/solutions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload, Play, Pause, ExternalLink } from 'lucide-react';
import { convertFileToDataUrl, isValidImageFile, isValidVideoFile } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';

interface AdminSolutionsEditorProps {
  card: SolutionCard | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (card: SolutionCard) => void;
}

const AdminSolutionsEditor: React.FC<AdminSolutionsEditorProps> = ({
  card,
  isOpen,
  onClose,
  onSave
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<SolutionCard>(
    card || {
      id: '',
      title: '',
      imageSrc: '',
      videoSrc: '',
      tagSlug: '',
      href: '',
      enabled: true,
      order: 0
    }
  );
  const [videoPlaying, setVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(card);

  const handleInputChange = (field: keyof SolutionCard, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (file: File) => {
    if (!isValidImageFile(file)) {
      toast({
        title: 'שגיאה',
        description: 'קובץ תמונה לא תקין. נתמכים: JPG, PNG, WebP (עד 12MB)',
        variant: 'destructive'
      });
      return;
    }

    try {
      const dataUrl = await convertFileToDataUrl(file);
      handleInputChange('imageSrc', dataUrl);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהעלאת התמונה',
        variant: 'destructive'
      });
    }
  };

  const handleVideoUpload = async (file: File) => {
    if (!isValidVideoFile(file)) {
      toast({
        title: 'שגיאה',
        description: 'קובץ וידאו לא תקין. נתמכים: MP4, WebM (עד 12MB)',
        variant: 'destructive'
      });
      return;
    }

    try {
      const dataUrl = await convertFileToDataUrl(file);
      handleInputChange('videoSrc', dataUrl);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהעלאת הוידאו',
        variant: 'destructive'
      });
    }
  };

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast({
        title: 'שגיאה',
        description: 'שם הכרטיס הוא שדה חובה',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.imageSrc && !formData.videoSrc) {
      toast({
        title: 'שגיאה',
        description: 'יש להוסיף לפחות תמונה או וידאו',
        variant: 'destructive'
      });
      return;
    }

    onSave(formData);
    onClose();
  };

  const handleClose = () => {
    if (isDirty) {
      if (confirm('יש שינויים שלא נשמרו. האם אתה בטוח שברצונך לסגור?')) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const toggleVideoPreview = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const linkTemplates = [
    { label: 'תיק עבודות עם תג', value: `/portfolio?tag=${formData.tagSlug || 'TAG'}` },
    { label: 'תיק עבודות כללי', value: '/portfolio' },
    { label: 'צור קשר', value: '/contact' },
    { label: 'אין קישור', value: '' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-assistant">
            {card ? 'עריכת כרטיס' : 'כרטיס חדש'}
          </DialogTitle>
          <DialogDescription className="text-right font-open-sans">
            הגדרת פרטי הכרטיס, מדיה וקישורים
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-assistant text-right">פרטים בסיסיים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-right text-sm font-medium">
                    כותרת <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="מסעדות ובתי קפה"
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tagSlug" className="text-right text-sm font-medium">
                    תג (slug)
                  </Label>
                  <Input
                    id="tagSlug"
                    value={formData.tagSlug}
                    onChange={(e) => handleInputChange('tagSlug', e.target.value)}
                    placeholder="restaurants"
                    className="text-right"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => handleInputChange('enabled', checked)}
                  />
                  <Label className="text-right text-sm font-medium">
                    מופעל
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Link Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-assistant text-right">קישור</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-right text-sm font-medium">תבניות מהירות</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {linkTemplates.map((template) => (
                      <Button
                        key={template.label}
                        variant="outline"
                        size="sm"
                        onClick={() => handleInputChange('href', template.value)}
                        className="text-xs font-open-sans"
                      >
                        {template.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="href" className="text-right text-sm font-medium">
                    קישור מותאם אישית
                  </Label>
                  <Input
                    id="href"
                    value={formData.href || ''}
                    onChange={(e) => handleInputChange('href', e.target.value || null)}
                    placeholder="/portfolio?tag=restaurants"
                    className="text-right"
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    השאר ריק אם הכרטיס לא צריך להיות לחיץ
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Media Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-assistant text-right">מדיה</CardTitle>
                <CardDescription className="text-right font-open-sans">
                  יש להוסיף לפחות תמונה או וידאו
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Image */}
                <div className="space-y-2">
                  <Label className="text-right text-sm font-medium">תמונה</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      העלה קובץ
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('imageSrc', '')}
                      disabled={!formData.imageSrc}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                  />
                  <Input
                    value={formData.imageSrc || ''}
                    onChange={(e) => handleInputChange('imageSrc', e.target.value)}
                    placeholder="או הדבק URL"
                    className="text-right text-xs"
                  />
                </div>

                {/* Video */}
                <div className="space-y-2">
                  <Label className="text-right text-sm font-medium">וידאו</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => videoInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      העלה קובץ
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleInputChange('videoSrc', '')}
                      disabled={!formData.videoSrc}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    ref={videoInputRef}
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleVideoUpload(file);
                    }}
                    className="hidden"
                  />
                  <Input
                    value={formData.videoSrc || ''}
                    onChange={(e) => handleInputChange('videoSrc', e.target.value)}
                    placeholder="או הדבק URL"
                    className="text-right text-xs"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-assistant text-right">תצוגה מקדימה</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative aspect-[16/11] rounded-2xl overflow-hidden shadow-lg bg-gray-100">
                  {/* Background Media */}
                  {formData.videoSrc ? (
                    <video
                      ref={videoRef}
                      className="absolute inset-0 w-full h-full object-cover"
                      loop
                      muted
                      playsInline
                      poster={formData.imageSrc}
                    >
                      <source src={formData.videoSrc} type="video/mp4" />
                    </video>
                  ) : formData.imageSrc ? (
                    <img
                      src={formData.imageSrc}
                      alt={formData.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                      <p className="text-gray-500 font-open-sans">אין מדיה</p>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-assistant font-bold text-lg leading-tight drop-shadow-lg text-right">
                      {formData.title || 'כותרת הכרטיס'}
                    </h3>
                    {formData.href && (
                      <div className="mt-2 flex items-center gap-1 text-white/80">
                        <ExternalLink className="h-3 w-3" />
                        <span className="text-xs">לחיץ</span>
                      </div>
                    )}
                  </div>

                  {/* Video Controls */}
                  {formData.videoSrc && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={toggleVideoPreview}
                      className="absolute top-2 right-2 text-white hover:bg-white/20"
                    >
                      {videoPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClose} className="font-assistant">
            ביטול
          </Button>
          <Button onClick={handleSave} className="font-assistant">
            שמירה
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminSolutionsEditor;