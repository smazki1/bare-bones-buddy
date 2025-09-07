import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Client, ClientImage } from '@/types/clients';
import { categoryFilters } from '@/data/portfolioMock';
import { convertFileToDataUrl, isValidImageFile } from '@/utils/fileUtils';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Upload, X, Image, Plus, Trash2, Edit, Eye, Loader2 } from 'lucide-react';

interface AdminClientImagesProps {
  isOpen: boolean;
  onClose: () => void;
  client: Client | null;
  images: ClientImage[];
  onAddImage: (image: Omit<ClientImage, 'id' | 'created_at' | 'updated_at'>) => void;
  onUpdateImage: (image: ClientImage) => void;
  onDeleteImage: (id: string) => void;
}

const AdminClientImages = ({ 
  isOpen, 
  onClose, 
  client, 
  images, 
  onAddImage, 
  onUpdateImage, 
  onDeleteImage 
}: AdminClientImagesProps) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);
  const [editingImage, setEditingImage] = useState<ClientImage | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    dish_name: '',
    image_before: '',
    image_after: '',
    category: 'restaurants',
    service_type: 'תמונות' as 'תמונות' | 'סרטונים'
  });

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  const resetForm = () => {
    setFormData({
      dish_name: '',
      image_before: '',
      image_after: '',
      category: 'restaurants',
      service_type: 'תמונות'
    });
    setIsAdding(false);
    setEditingImage(null);
  };

  const handleImageUpload = async (file: File, type: 'before' | 'after') => {
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
        [type === 'after' ? 'image_after' : 'image_before']: dataUrl
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = e.target.files;
    if (files && files[0]) {
      handleImageUpload(files[0], type);
    }
  };

  const handleSave = async () => {
    if (!client || !formData.dish_name.trim() || !formData.image_after) {
      toast({
        title: "שגיאה",
        description: "יש למלא שם מנה ותמונה אחרי לפחות",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingImage) {
        await onUpdateImage({
          ...editingImage,
          ...formData
        });
        toast({
          title: "הצלחה",
          description: "תמונה עודכנה בהצלחה"
        });
      } else {
        await onAddImage({
          client_id: client.id,
          ...formData
        });
        toast({
          title: "הצלחה",
          description: "תמונה נוספה בהצלחה"
        });
      }
      resetForm();
    } catch (error) {
      console.error('Error saving image:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת התמונה",
        variant: "destructive"
      });
    }
  };

  const startEdit = (image: ClientImage) => {
    setEditingImage(image);
    setFormData({
      dish_name: image.dish_name,
      image_before: image.image_before || '',
      image_after: image.image_after,
      category: image.category,
      service_type: image.service_type
    });
    setIsAdding(true);
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
    const preview = type === 'after' ? formData.image_after : formData.image_before;

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
                className="w-full h-32 object-cover"
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
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    [type === 'after' ? 'image_after' : 'image_before']: ''
                  }))}
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
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
            onClick={() => inputRef.current?.click()}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">מעלה תמונה...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Image className="w-6 h-6 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  לחץ להעלאת תמונה
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

  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-assistant">
            ניהול תמונות - {client.business_name}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Add New Image Form */}
          {isAdding && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-assistant">
                  {editingImage ? 'עריכת תמונה' : 'הוספת תמונה חדשה'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dish_name" className="text-sm font-assistant font-medium">
                      שם המנה <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="dish_name"
                      value={formData.dish_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, dish_name: e.target.value }))}
                      placeholder="למשל: המבורגר הבית"
                      className="text-right"
                      dir="rtl"
                    />
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ImageUploadArea type="after" label="תמונה אחרי" required />
                  <ImageUploadArea type="before" label="תמונה לפני (אופציונלי)" />
                </div>

                <div className="flex gap-2">
                  <Button onClick={handleSave} className="font-assistant">
                    {editingImage ? 'עדכן תמונה' : 'הוסף תמונה'}
                  </Button>
                  <Button variant="outline" onClick={resetForm} className="font-assistant">
                    ביטול
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {!isAdding && (
            <div className="flex gap-2">
              <Button
                onClick={() => setIsAdding(true)}
                className="font-assistant"
              >
                <Plus className="w-4 h-4 mr-2" />
                הוסף תמונה חדשה
              </Button>
            </div>
          )}

          {/* Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="group hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-assistant font-medium truncate">
                        {image.dish_name}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {categoryFilters.find(cat => cat.slug === image.category)?.label}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {image.image_after && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">אחרי</p>
                          <img
                            src={image.image_after}
                            alt="תמונה אחרי"
                            className="w-full h-20 object-cover rounded"
                          />
                        </div>
                      )}
                      {image.image_before && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">לפני</p>
                          <img
                            src={image.image_before}
                            alt="תמונה לפני"
                            className="w-full h-20 object-cover rounded"
                          />
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => startEdit(image)}
                        className="flex-1 text-xs font-assistant"
                      >
                        <Edit className="w-3 h-3 mr-1" />
                        עריכה
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs font-assistant text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            מחק
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent dir="rtl">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="font-assistant">מחיקת תמונה</AlertDialogTitle>
                            <AlertDialogDescription className="font-open-sans">
                              האם אתה בטוח שברצונך למחוק את התמונה "{image.dish_name}"?
                              פעולה זו לא ניתנת לביטול.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="font-assistant">ביטול</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeleteImage(image.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-assistant"
                            >
                              מחק
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {images.length === 0 && !isAdding && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Image className="w-12 h-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-assistant font-semibold mb-2">
                  אין תמונות עדיין
                </h3>
                <p className="text-muted-foreground font-open-sans mb-4">
                  התחל ביצירת התמונה הראשונה עבור {client.business_name}
                </p>
                <Button
                  onClick={() => setIsAdding(true)}
                  className="font-assistant"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  הוסף תמונה ראשונה
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminClientImages;