import { useState, useRef, useEffect } from 'react';
import { SolutionCard } from '@/types/solutions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, Upload, Play, Pause, ExternalLink, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { convertFileToDataUrl, isValidImageFile, isValidVideoFile, compressImageToDataUrl } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';
import { marketsStore } from '@/data/marketsStore';

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
  const initialSnapshotRef = useRef<SolutionCard | null>(card || {
    id: '',
    title: '',
    imageSrc: '',
    videoSrc: '',
    tagSlug: '',
    href: '',
    enabled: true,
    order: 0
  });
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [isClickable, setIsClickable] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [availableTags, setAvailableTags] = useState<Array<{id: string, label: string, slug: string}>>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryLabel, setNewCategoryLabel] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load available tags from markets store
  useEffect(() => {
    loadAvailableTags();
  }, []);

  const loadAvailableTags = () => {
    const marketsConfig = marketsStore.safeGetConfigOrDefaults();
    const enabledTags = marketsConfig.items
      .filter(item => item.enabled)
      .map(item => ({
        id: item.id,
        label: item.label,
        slug: item.slug
      }));
    setAvailableTags(enabledTags);
  };

  const handleAddCategory = () => {
    if (!newCategoryLabel.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין שם קטגוריה',
        variant: 'destructive'
      });
      return;
    }

    const marketsConfig = marketsStore.safeGetConfigOrDefaults();
    const newId = marketsStore.generateId(newCategoryLabel);
    const newSlug = newCategoryLabel
      .toLowerCase()
      .replace(/[\s\u05D0-\u05EA]+/g, '-')
      .replace(/[^\w-]/g, '')
      .replace(/^-+|-+$/g, '');

    const newTag = {
      id: newId,
      label: newCategoryLabel.trim(),
      slug: newSlug,
      enabled: true,
      order: marketsConfig.items.length
    };

    const updatedConfig = {
      ...marketsConfig,
      items: [...marketsConfig.items, newTag]
    };

    marketsStore.saveConfig(updatedConfig);
    loadAvailableTags();
    setNewCategoryLabel('');
    setShowAddCategory(false);
    
    // Auto-select the new category
    handleTagChange(newSlug);
    
    toast({
      title: 'הצלחה',
      description: 'קטגוריה חדשה נוספה בהצלחה',
    });
  };

  // Sync form data when opening editor or when switching cards
  useEffect(() => {
    if (!isOpen) return;

    const nextData: SolutionCard = card || {
      id: '',
      title: '',
      imageSrc: '',
      videoSrc: '',
      tagSlug: '',
      href: '',
      enabled: true,
      order: 0
    };

    setFormData(nextData);
    initialSnapshotRef.current = nextData;

    const hasLink = !!(nextData.href || nextData.tagSlug);
    setIsClickable(hasLink);
    setIsAdvancedOpen(!!(nextData.videoSrc || (nextData.href && nextData.href !== `/portfolio?tag=${nextData.tagSlug}`)));
  }, [card, isOpen]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialSnapshotRef.current);

  const handleInputChange = (field: keyof SolutionCard, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleClickableToggle = (checked: boolean) => {
    setIsClickable(checked);
    if (checked && formData.tagSlug) {
      // Auto-generate href from selected tag
      handleInputChange('href', `/portfolio?tag=${formData.tagSlug}`);
    } else if (!checked) {
      // Clear href when not clickable
      handleInputChange('href', '');
    }
  };

  const handleTagChange = (selectedSlug: string) => {
    handleInputChange('tagSlug', selectedSlug);
    if (isClickable) {
      // Auto-update href when tag changes and card is clickable
      handleInputChange('href', `/portfolio?tag=${selectedSlug}`);
    }
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
      // דחיסה לפני שמירה כדי למנוע חריגת נפח ב-localStorage
      const dataUrl = await compressImageToDataUrl(file, {
        maxWidth: 1600,
        maxHeight: 1200,
        maxSizeKB: 200,
        mimeType: 'image/webp',
        initialQuality: 0.85,
        minQuality: 0.6,
      });
      handleInputChange('imageSrc', dataUrl);
    } catch (error) {
      toast({
        title: 'שגיאה',
        description: 'שגיאה בהעלאת/דחיסת התמונה',
        variant: 'destructive'
      });
    }
  };

  const handleVideoUpload = async (file: File) => {
    console.log('Video upload attempt:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2)
    });

    if (!isValidVideoFile(file)) {
      console.log('Video file validation failed for:', file.type);
      toast({
        title: 'שגיאה',
        description: `קובץ וידאו לא תקין. סוג קובץ: ${file.type}. נתמכים: MP4, WebM (עד 12MB)`,
        variant: 'destructive'
      });
      return;
    }

    try {
      console.log('Converting video file to data URL...');
      const dataUrl = await convertFileToDataUrl(file);
      console.log('Video conversion successful, data URL length:', dataUrl.length);
      handleInputChange('videoSrc', dataUrl);
    } catch (error) {
      console.error('Video upload error:', error);
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

    if (!formData.imageSrc) {
      toast({
        title: 'שגיאה',
        description: 'יש להוסיף תמונה',
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


  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-background border-border" dir="rtl">
        <DialogHeader className="bg-background">
          <DialogTitle className="text-right font-assistant text-foreground">
            {card ? 'עריכת כרטיס' : 'כרטיס חדש'}
          </DialogTitle>
          <DialogDescription className="text-right font-open-sans text-muted-foreground">
            הגדרת פרטי הכרטיס, מדיה וקישורים
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-background">
          {/* Form */}
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-card border-border">
              <CardHeader className="bg-card">
                <CardTitle className="text-lg font-assistant text-right text-card-foreground">פרטים בסיסיים</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 bg-card">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-right text-sm font-medium text-card-foreground">
                    כותרת <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="מסעדות ובתי קפה"
                    className="text-right bg-background border-input text-foreground placeholder:text-muted-foreground"
                    dir="rtl"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image" className="text-right text-sm font-medium text-card-foreground">
                    תמונה <span className="text-destructive">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => imageInputRef.current?.click()}
                      className="flex items-center gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      העלה תמונה
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
                    placeholder="או הדבק URL לתמונה"
                    className="text-right text-xs bg-background border-input text-foreground placeholder:text-muted-foreground"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Switch
                    checked={isClickable}
                    onCheckedChange={handleClickableToggle}
                  />
                  <Label className="text-right text-sm font-medium text-card-foreground">
                    הפוך את הכרטיס ללחיץ
                  </Label>
                </div>

                {isClickable && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCategory(!showAddCategory)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        הוסף קטגוריה
                      </Button>
                      <Label className="text-right text-sm font-medium text-card-foreground">
                        בחר קטגוריה
                      </Label>
                    </div>
                    
                    {showAddCategory && (
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleAddCategory}
                          disabled={!newCategoryLabel.trim()}
                        >
                          הוסף
                        </Button>
                        <Input
                          value={newCategoryLabel}
                          onChange={(e) => setNewCategoryLabel(e.target.value)}
                          placeholder="שם קטגוריה חדשה"
                          className="flex-1 text-right bg-background border-input text-foreground placeholder:text-muted-foreground"
                          dir="rtl"
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCategory();
                            }
                          }}
                        />
                      </div>
                    )}
                    
                    <Select value={formData.tagSlug || ''} onValueChange={handleTagChange}>
                      <SelectTrigger className="text-right bg-background border-input text-foreground" dir="rtl">
                        <SelectValue placeholder="בחר קטגוריה לתיק העבודות" />
                      </SelectTrigger>
                      <SelectContent dir="rtl" className="bg-background border-border shadow-md z-50">
                        {availableTags.map((tag) => (
                          <SelectItem 
                            key={tag.id} 
                            value={tag.slug}
                            className="text-foreground hover:bg-muted focus:bg-muted cursor-pointer"
                          >
                            {tag.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground text-right">
                      הכרטיס יוביל לתיק העבודות מסונן לפי הקטגוריה הנבחרת
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <Switch
                    checked={formData.enabled}
                    onCheckedChange={(checked) => handleInputChange('enabled', checked)}
                  />
                  <Label className="text-right text-sm font-medium text-card-foreground">
                    מופעל
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Settings */}
            <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
              <Card className="bg-card border-border">
                <CollapsibleTrigger asChild>
                  <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors bg-card">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {isAdvancedOpen ? <ChevronDown className="h-4 w-4 text-card-foreground" /> : <ChevronRight className="h-4 w-4 text-card-foreground" />}
                        <CardTitle className="text-lg font-assistant text-right text-card-foreground">הגדרות מתקדמות</CardTitle>
                      </div>
                    </div>
                    <CardDescription className="text-right font-open-sans text-muted-foreground">
                      וידאו וקישור מותאם אישית (אופציונלי)
                    </CardDescription>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 bg-card">
                    {/* Video */}
                    <div className="space-y-2">
                      <Label className="text-right text-sm font-medium text-card-foreground">וידאו (אופציונלי)</Label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => videoInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          העלה וידאו
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
                        placeholder="או הדבק URL לוידאו"
                        className="text-right text-xs bg-background border-input text-foreground placeholder:text-muted-foreground"
                      />
                    </div>

                    {/* Custom Link */}
                    <div className="space-y-2">
                      <Label htmlFor="customHref" className="text-right text-sm font-medium text-card-foreground">
                        קישור מותאם אישית
                      </Label>
                      <Input
                        id="customHref"
                        value={formData.href || ''}
                        onChange={(e) => {
                          const newHref = e.target.value || '';
                          handleInputChange('href', newHref);
                          // If user manually sets custom href, update clickable state
                          if (newHref && !isClickable) {
                            setIsClickable(true);
                          }
                        }}
                        placeholder="/contact או /portfolio"
                        className="text-right bg-background border-input text-foreground placeholder:text-muted-foreground"
                      />
                      <p className="text-xs text-muted-foreground text-right">
                        עוקף את הקישור האוטומטי לתיק העבודות. השאר ריק לשימוש בקטגוריה שנבחרה למעלה
                      </p>
                    </div>
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          </div>

          {/* Preview */}
          <div className="space-y-4">
            <Card className="bg-card border-border">
              <CardHeader className="bg-card">
                <CardTitle className="text-lg font-assistant text-right text-card-foreground">תצוגה מקדימה</CardTitle>
              </CardHeader>
              <CardContent className="bg-card">
                <div className="relative aspect-[16/11] rounded-2xl overflow-hidden shadow-lg bg-muted">
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
                    <div className="absolute inset-0 flex items-center justify-center bg-muted">
                      <p className="text-muted-foreground font-open-sans">אין מדיה</p>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h3 className="text-white font-assistant font-bold text-lg leading-tight drop-shadow-lg text-right">
                      {formData.title || 'כותרת הכרטיס'}
                    </h3>
                    {isClickable && (formData.href || formData.tagSlug) && (
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