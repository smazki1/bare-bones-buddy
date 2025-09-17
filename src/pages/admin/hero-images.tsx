import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Trash2, Upload, Eye, EyeOff } from 'lucide-react';

interface HeroImage {
  id: string;
  url: string;
  title: string;
  active: boolean | null;
  language: string;
  created_at: string;
}

export default function AdminHeroImages() {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from('background_images')
        .select('*')
        .order('id');

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching hero images:', error);
      toast.error('שגיאה בטעינת תמונות ה-Hero');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewImageFile(file);
    
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const uploadImage = async () => {
    if (!newImageFile || !newImageTitle.trim()) {
      toast.error('נא למלא כותרת ולבחור תמונה');
      return;
    }

    setUploading(true);
    try {
      // Upload to Supabase storage
      const fileExt = newImageFile.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('backgrounds')
        .upload(fileName, newImageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('backgrounds')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase
        .from('background_images')
        .insert({
          url: publicUrl,
          title: newImageTitle.trim(),
          active: true,
          language: 'he'
        });

      if (dbError) throw dbError;

      toast.success('תמונה נוספה בהצלחה');
      setNewImageFile(null);
      setNewImageTitle('');
      setPreviewUrl(null);
      fetchImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('שגיאה בהעלאת התמונה');
    } finally {
      setUploading(false);
    }
  };

  const toggleImageActive = async (id: string, currentActive: boolean | null) => {
    try {
      const { error } = await supabase
        .from('background_images')
        .update({ active: !currentActive })
        .eq('id', id);

      if (error) throw error;

      toast.success(currentActive ? 'תמונה הוסתרה' : 'תמונה הופעלה');
      fetchImages();
    } catch (error) {
      console.error('Error toggling image:', error);
      toast.error('שגיאה בעדכון התמונה');
    }
  };

  const deleteImage = async (id: string, url: string) => {
    if (!confirm('האם אתה בטוח שאתה רוצה למחוק תמונה זו?')) {
      return;
    }

    try {
      // Delete from database
      const { error: dbError } = await supabase
        .from('background_images')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // Try to delete from storage (optional - might fail if file doesn't exist)
      const fileName = url.split('/').pop();
      if (fileName) {
        await supabase.storage
          .from('backgrounds')
          .remove([fileName]);
      }

      toast.success('תמונה נמחקה בהצלחה');
      fetchImages();
    } catch (error) {
      console.error('Error deleting image:', error);
      toast.error('שגיאה במחיקת התמונה');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">ניהול תמונות Hero</h1>
        </div>

        {/* Add New Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="w-5 h-5" />
              הוספת תמונה חדשה
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="title">כותרת התמונה</Label>
              <Input
                id="title"
                value={newImageTitle}
                onChange={(e) => setNewImageTitle(e.target.value)}
                placeholder="כותרת לתמונה..."
              />
            </div>

            <div>
              <Label htmlFor="image">בחירת תמונה</Label>
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
              />
              {previewUrl && (
                <div className="mt-2">
                  <img
                    src={previewUrl}
                    alt="תצוגה מקדימה"
                    className="w-32 h-20 object-cover rounded"
                  />
                  <p className="text-xs text-gray-600 mt-1">תמונה נבחרת</p>
                </div>
              )}
            </div>

            <Button
              onClick={uploadImage}
              disabled={uploading || !newImageFile || !newImageTitle.trim()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {uploading ? 'מעלה...' : 'הוסף תמונה'}
            </Button>
          </CardContent>
        </Card>

        {/* Images List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {images.map((image) => (
            <Card key={image.id}>
              <CardContent className="p-4">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-32 object-cover rounded mb-3"
                />
                <h3 className="font-semibold mb-2">{image.title}</h3>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {image.active ? (
                      <Eye className="w-4 h-4 text-green-600" />
                    ) : (
                      <EyeOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span className="text-sm">
                      {image.active ? 'פעיל' : 'מוסתר'}
                    </span>
                  </div>
                  <Switch
                    checked={image.active || false}
                    onCheckedChange={() => toggleImageActive(image.id, image.active)}
                  />
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteImage(image.id, image.url)}
                  className="w-full"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  מחק
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {images.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">אין תמונות Hero עדיין</p>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
}