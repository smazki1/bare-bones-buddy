import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image, Eye, Loader2 } from 'lucide-react';
import { Project, ProjectSize } from '@/data/portfolioMock';
import { categoryFilters } from '@/data/portfolioMock';
import { convertFileToDataUrl, isValidImageFile } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';

interface AdminPortfolioEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Omit<Project, 'id'> | Project) => void;
  editingProject?: Project | null;
}

const AdminPortfolioEditor = ({ isOpen, onClose, onSave, editingProject }: AdminPortfolioEditorProps) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Project, 'id'>>({
    businessName: '',
    businessType: '',
    serviceType: 'תמונות',
    imageAfter: '',
    imageBefore: '',
    size: 'medium',
    category: 'restaurants'
  });
  const [isUploading, setIsUploading] = useState(false);
  const [previewImages, setPreviewImages] = useState<{
    after?: string;
    before?: string;
  }>({});

  const afterInputRef = useRef<HTMLInputElement>(null);
  const beforeInputRef = useRef<HTMLInputElement>(null);

  // Initialize form data when editing
  useState(() => {
    if (editingProject) {
      setFormData({
        businessName: editingProject.businessName,
        businessType: editingProject.businessType,
        serviceType: editingProject.serviceType,
        imageAfter: editingProject.imageAfter,
        imageBefore: editingProject.imageBefore || '',
        size: editingProject.size,
        category: editingProject.category
      });
      setPreviewImages({
        after: editingProject.imageAfter,
        before: editingProject.imageBefore
      });
    } else {
      setFormData({
        businessName: '',
        businessType: '',
        serviceType: 'תמונות',
        imageAfter: '',
        imageBefore: '',
        size: 'medium',
        category: 'restaurants'
      });
      setPreviewImages({});
    }
  });

  const handleImageUpload = async (file: File, type: 'after' | 'before') => {
    if (!isValidImageFile(file)) {
      toast({
        title: "שגיאה",
        description: "יש להעלות קובץ תמונה תקין (JPG, PNG, WebP) עד 12MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const dataUrl = await convertFileToDataUrl(file);
      
      setFormData(prev => ({
        ...prev,
        [type === 'after' ? 'imageAfter' : 'imageBefore']: dataUrl
      }));
      
      setPreviewImages(prev => ({
        ...prev,
        [type]: dataUrl
      }));

      toast({
        title: "הצלחה",
        description: `תמונה ${type === 'after' ? 'אחרי' : 'לפני'} הועלתה בהצלחה`
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בהעלאת התמונה",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: 'after' | 'before') => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleImageUpload(files[0], type);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'after' | 'before') => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageUpload(files[0], type);
    }
  };

  const removeImage = (type: 'after' | 'before') => {
    setFormData(prev => ({
      ...prev,
      [type === 'after' ? 'imageAfter' : 'imageBefore']: ''
    }));
    setPreviewImages(prev => ({
      ...prev,
      [type]: undefined
    }));
  };

  const handleSave = () => {
    if (!formData.businessName.trim() || !formData.imageAfter) {
      toast({
        title: "שגיאה",
        description: "יש למלא שם עסק ותמונה אחרי לפחות",
        variant: "destructive"
      });
      return;
    }

    const projectToSave = editingProject 
      ? { ...editingProject, ...formData }
      : formData;

    onSave(projectToSave);
    onClose();
  };

  const ImageUploadArea = ({ 
    type, 
    label, 
    required = false 
  }: { 
    type: 'after' | 'before'; 
    label: string; 
    required?: boolean; 
  }) => {
    const inputRef = type === 'after' ? afterInputRef : beforeInputRef;
    const preview = previewImages[type];

    return (
      <div className="space-y-2">
        <Label className="text-sm font-assistant font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
        
        {preview ? (
          <div className="relative group">
            <div className="relative border-2 border-border rounded-lg overflow-hidden">
              <img
                src={preview}
                alt={`תצוגה מקדימה - ${label}`}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => inputRef.current?.click()}
                  className="text-xs"
                >
                  <Upload className="w-3 h-3 mr-1" />
                  החלף
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(type)}
                  className="text-xs"
                >
                  <X className="w-3 h-3 mr-1" />
                  הסר
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onDrop={(e) => handleDrop(e, type)}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">מעלה תמונה...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Image className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  לחץ או גרור תמונה לכאן
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, WebP עד 12MB
                </p>
              </div>
            )}
          </div>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFileSelect(e, type)}
        />
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-assistant">
            {editingProject ? 'עריכת פרויקט' : 'פרויקט חדש'}
          </DialogTitle>
          <DialogDescription className="font-open-sans text-muted-foreground">
            {editingProject ? 'עדכן את פרטי הפרויקט והתמונות' : 'הוסף פרויקט חדש עם תמונות לפני ואחרי'}
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="businessName" className="text-sm font-assistant font-medium">
                שם העסק <span className="text-destructive">*</span>
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) => setFormData(prev => ({ ...prev, businessName: e.target.value }))}
                placeholder="למשל: מסעדת הזית הזהב"
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-sm font-assistant font-medium">
                סוג העסק
              </Label>
              <Input
                id="businessType"
                value={formData.businessType}
                onChange={(e) => setFormData(prev => ({ ...prev, businessType: e.target.value }))}
                placeholder="למשל: מסעדה"
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Service & Category */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">סוג שירות</Label>
              <Select
                value={formData.serviceType}
                onValueChange={(value: 'תמונות' | 'סרטונים') => 
                  setFormData(prev => ({ ...prev, serviceType: value }))
                }
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="תמונות">תמונות</SelectItem>
                  <SelectItem value="סרטונים">סרטונים</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">קטגוריה</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categoryFilters.filter(cat => cat.slug !== 'all').map((category) => (
                    <SelectItem key={category.slug} value={category.slug}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">גודל כרטיס</Label>
              <Select
                value={formData.size}
                onValueChange={(value: ProjectSize) => setFormData(prev => ({ ...prev, size: value }))}
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">קטן</SelectItem>
                  <SelectItem value="medium">בינוני</SelectItem>
                  <SelectItem value="large">גדול</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Images */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadArea type="after" label="תמונה אחרי" required />
            <ImageUploadArea type="before" label="תמונה לפני (אופציונלי)" />
          </div>

          {/* Preview */}
          {(previewImages.after || previewImages.before) && (
            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">תצוגה מקדימה</Label>
              <div className="flex gap-4 p-4 bg-muted/30 rounded-lg">
                {previewImages.after && (
                  <div className="flex-1">
                    <Badge variant="secondary" className="mb-2">אחרי</Badge>
                    <img
                      src={previewImages.after}
                      alt="תצוגה מקדימה - אחרי"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
                {previewImages.before && (
                  <div className="flex-1">
                    <Badge variant="outline" className="mb-2">לפני</Badge>
                    <img
                      src={previewImages.before}
                      alt="תצוגה מקדימה - לפני"
                      className="w-full h-32 object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} className="font-assistant">
            ביטול
          </Button>
          <Button 
            onClick={handleSave} 
            className="font-assistant"
            disabled={isUploading || !formData.businessName.trim() || !formData.imageAfter}
          >
            {editingProject ? 'עדכן' : 'שמור'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminPortfolioEditor;