import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { uploadProjectImages } from '@/utils/imageProcessing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Upload, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProjectFormProps {
  project?: any;
  categories: any[];
  onClose: () => void;
  onSave: () => void;
}

export function ProjectForm({ project, categories, onClose, onSave }: ProjectFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_before_url: '',
    image_after_url: '',
    image_after_thumb_url: '',
    category_ids: [] as string[],
    is_featured: false,
    order_index: 0
  });
  
  const [loading, setLoading] = useState(false);
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const [beforePreview, setBeforePreview] = useState<string>('');
  const [afterPreview, setAfterPreview] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title || '',
        description: project.description || '',
        image_before_url: project.image_before_url || '',
        image_after_url: project.image_after_url || '',
        image_after_thumb_url: project.image_after_thumb_url || '',
        category_ids: project.category_ids || [],
        is_featured: project.is_featured || false,
        order_index: project.order_index || 0
      });
      setBeforePreview(project.image_before_url || '');
      setAfterPreview(project.image_after_thumb_url || '');
    }
  }, [project]);

  const handleBeforeImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBeforeImage(file);
      const preview = URL.createObjectURL(file);
      setBeforePreview(preview);
    }
  };

  const handleAfterImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAfterImage(file);
      const preview = URL.createObjectURL(file);
      setAfterPreview(preview);
    }
  };

  const handleCategoryToggle = (categoryId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      category_ids: checked
        ? [...prev.category_ids, categoryId]
        : prev.category_ids.filter(id => id !== categoryId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast({
        title: 'שגיאה',
        description: 'יש להזין שם פרויקט',
        variant: 'destructive'
      });
      return;
    }

    // For new projects, require images
    if (!project && (!beforeImage || !afterImage)) {
      toast({
        title: 'שגיאה',
        description: 'יש להעלות תמונה לפני ואחרי',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);

    try {
      let imageUrls = {
        beforeUrl: formData.image_before_url,
        afterUrl: formData.image_after_url,
        afterThumbUrl: formData.image_after_thumb_url
      };

      // If new images were uploaded, process them
      if (beforeImage && afterImage) {
        toast({
          title: 'מעלה תמונות',
          description: 'מעבד תמונות, אנא המתן...'
        });
        
        imageUrls = await uploadProjectImages(beforeImage, afterImage);
        
        toast({
          title: 'הצלחה',
          description: 'התמונות הועלו ועובדו בהצלחה'
        });
      }

      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        image_before_url: imageUrls.beforeUrl,
        image_after_url: imageUrls.afterUrl,
        image_after_thumb_url: imageUrls.afterThumbUrl,
        category_ids: formData.category_ids,
        is_featured: formData.is_featured,
        order_index: formData.order_index
      };

      if (project) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', project.id);

        if (error) throw error;
        
        toast({
          title: 'הצלחה',
          description: 'הפרויקט עודכן בהצלחה'
        });
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert(projectData);

        if (error) throw error;
        
        toast({
          title: 'הצלחה',
          description: 'הפרויקט נוסף בהצלחה'
        });
      }

      onSave();
    } catch (error: any) {
      console.error('Error saving project:', error);
      toast({
        title: 'שגיאה',
        description: error.message || 'שגיאה בשמירת הפרויקט',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" dir="rtl">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-assistant">
            {project ? 'עריכת פרויקט' : 'פרויקט חדש'}
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="font-open-sans">
                שם הפרויקט *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="text-right"
                dir="rtl"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-open-sans">
                תיאור הפרויקט
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="text-right min-h-[80px]"
                dir="rtl"
                placeholder="תיאור קצר של הפרויקט..."
              />
            </div>

            {/* Images */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Before Image */}
              <div className="space-y-2">
                <Label className="font-open-sans">תמונה לפני *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {beforePreview ? (
                    <div className="relative">
                      <img
                        src={beforePreview}
                        alt="לפני"
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setBeforeImage(null);
                          setBeforePreview('');
                        }}
                        className="absolute top-2 left-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <Label
                        htmlFor="before-image"
                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground font-open-sans"
                      >
                        לחץ להעלאת תמונה
                      </Label>
                    </div>
                  )}
                  <input
                    id="before-image"
                    type="file"
                    accept="image/*"
                    onChange={handleBeforeImageChange}
                    className="hidden"
                  />
                </div>
              </div>

              {/* After Image */}
              <div className="space-y-2">
                <Label className="font-open-sans">תמונה אחרי *</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-4">
                  {afterPreview ? (
                    <div className="relative">
                      <img
                        src={afterPreview}
                        alt="אחרי"
                        className="w-full h-32 object-cover rounded"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setAfterImage(null);
                          setAfterPreview('');
                        }}
                        className="absolute top-2 left-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                      <Label
                        htmlFor="after-image"
                        className="cursor-pointer text-sm text-muted-foreground hover:text-foreground font-open-sans"
                      >
                        לחץ להעלאת תמונה
                      </Label>
                    </div>
                  )}
                  <input
                    id="after-image"
                    type="file"
                    accept="image/*"
                    onChange={handleAfterImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="space-y-3">
                <Label className="font-open-sans">קטגוריות</Label>
                <div className="grid grid-cols-2 gap-3">
                  {categories.map((category) => (
                    <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={formData.category_ids.includes(category.id)}
                        onCheckedChange={(checked) => 
                          handleCategoryToggle(category.id, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-open-sans cursor-pointer"
                      >
                        {category.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Settings */}
            <div className="space-y-4">
              {/* Featured */}
              <div className="flex items-center space-x-2 space-x-reverse">
                <Checkbox
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, is_featured: checked as boolean }))
                  }
                />
                <Label htmlFor="is_featured" className="font-open-sans cursor-pointer">
                  הצג בדף הבית (מומלץ)
                </Label>
              </div>

              {/* Order */}
              <div className="space-y-2">
                <Label htmlFor="order_index" className="font-open-sans">
                  סדר הצגה
                </Label>
                <Input
                  id="order_index"
                  type="number"
                  value={formData.order_index}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    order_index: parseInt(e.target.value) || 0 
                  }))}
                  className="w-24 text-right"
                  dir="rtl"
                />
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
                className="font-assistant"
              >
                ביטול
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="font-assistant"
              >
                {loading && <Loader2 className="ml-2 h-4 w-4 animate-spin" />}
                {loading ? 'שומר...' : 'שמור'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}