import { useState, useEffect, useMemo, useRef } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Image as ImageIcon
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy, useSortable, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Project {
  id: string;
  title: string;
  description: string | null;
  image_before_url: string;
  image_after_url: string;
  image_after_thumb_url: string;
  category_ids: string[];
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  order_index: number;
  size: 'small' | 'medium' | 'large';
}

interface Category {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [savingOrder, setSavingOrder] = useState(false);
  const { toast } = useToast();
  const originalOrderIdsRef = useRef<string[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsResult, categoriesResult] = await Promise.all([
        supabase
          .from('projects')
          .select('*')
          .order('order_index', { ascending: true }),
        supabase
          .from('categories')
          .select('*')
          .eq('is_active', true)
          .order('order_index', { ascending: true })
      ]);

      if (projectsResult.error) throw projectsResult.error;
      if (categoriesResult.error) throw categoriesResult.error;

      const ordered = (projectsResult.data || []).map(p => ({ ...p, size: (p as any).size || 'medium' as 'small' | 'medium' | 'large' }));
      setProjects(ordered);
      originalOrderIdsRef.current = ordered.map(p => p.id);
      setCategories(categoriesResult.data || []);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת הנתונים',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const hasOrderChanged = useMemo(() => {
    const current = projects.map(p => p.id).join('|');
    const initial = originalOrderIdsRef.current.join('|');
    return current !== initial;
  }, [projects]);

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = projects.findIndex(p => p.id === active.id);
    const newIndex = projects.findIndex(p => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;
    setProjects(prev => arrayMove(prev, oldIndex, newIndex));
  };

  const saveOrder = async () => {
    try {
      setSavingOrder(true);
      await Promise.all(
        projects.map((p, index) =>
          supabase.from('projects').update({ order_index: index }).eq('id', p.id)
        )
      );
      originalOrderIdsRef.current = projects.map(p => p.id);
      toast({ title: 'הצלחה', description: 'הסדר נשמר בהצלחה' });
    } catch (error: any) {
      console.error('Error saving order:', error);
      toast({ title: 'שגיאה', description: 'שמירת הסדר נכשלה', variant: 'destructive' });
    } finally {
      setSavingOrder(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`האם אתה בטוח שברצונך למחוק את הפרויקט "${title}"?`)) return;

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: 'הפרויקט נמחק בהצלחה'
      });

      fetchData();
    } catch (error: any) {
      console.error('Error deleting project:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה במחיקת הפרויקט',
        variant: 'destructive'
      });
    }
  };


  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds
      .map(id => categories.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  if (loading) {
    return (
      <AdminLayout title="ניהול פרויקטים">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="ניהול פרויקטים">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground font-assistant">פרויקטים</h2>
            <p className="text-muted-foreground font-open-sans">
              ניהול פרויקטים ותמונות לפני ואחרי
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="secondary"
              disabled={!hasOrderChanged || savingOrder}
              onClick={saveOrder}
            >
              {savingOrder ? 'שומר...' : 'שמור סדר'}
            </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 ml-2" />
            פרויקט חדש
          </Button>
          </div>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">אין פרויקטים</h3>
              <p className="text-muted-foreground text-center mb-4">
                לחץ על "פרויקט חדש" כדי להוסיף את הפרויקט הראשון
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 ml-2" />
                פרויקט חדש
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={projects.map(p => p.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
                  <SortableProjectCard
                    key={project.id}
                    id={project.id}
                    project={project}
                    onEdit={() => { setEditingProject(project); setShowForm(true); }}
                    onDelete={() => handleDelete(project.id, project.title)}
                    getCategoryNames={getCategoryNames}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Project Form Dialog */}
        {showForm && (
          <ProjectForm
            project={editingProject}
            categories={categories}
            onClose={() => {
              setShowForm(false);
              setEditingProject(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingProject(null);
              fetchData();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function SortableProjectCard({
  id,
  project,
  onEdit,
  onDelete,
  getCategoryNames,
}: {
  id: string;
  project: Project;
  onEdit: () => void;
  onDelete: () => void;
  getCategoryNames: (categoryIds: string[]) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.9 : 1,
    cursor: 'grab',
  };

  return (
    <Card ref={setNodeRef} style={style} className="overflow-hidden">
                <div className="aspect-square relative">
        <button
          type="button"
          className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded bg-background/80 px-2 py-1 text-xs border shadow-sm"
          aria-label="גרור לשינוי סדר"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
          גרור
        </button>
                  <img
                    src={project.image_after_thumb_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = project.image_after_url;
                    }}
                  />
                </div>
                
                <CardContent className="p-4">
                  <h3 className="font-semibold text-lg mb-2 font-assistant line-clamp-2">
                    {project.title}
                  </h3>
                  {project.description && (
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2 font-open-sans">
                      {project.description}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mb-3 font-open-sans">
                    קטגוריות: {getCategoryNames(project.category_ids) || 'ללא קטגוריה'}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
              onClick={onEdit}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
              onClick={onDelete}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
  );
}

function ProjectForm({ 
  project, 
  categories, 
  onClose, 
  onSave 
}: {
  project: Project | null;
  categories: Category[];
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_before_url: '',
    image_after_url: '',
    image_after_thumb_url: '',
    category_ids: [] as string[],
    order_index: 0,
    size: 'large' as 'small' | 'medium' | 'large'
  });
  const [loading, setLoading] = useState(false);
  const [beforeImage, setBeforeImage] = useState<File | null>(null);
  const [afterImage, setAfterImage] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (project) {
      setFormData({
        title: project.title,
        description: project.description || '',
        image_before_url: project.image_before_url,
        image_after_url: project.image_after_url,
        image_after_thumb_url: project.image_after_thumb_url,
        category_ids: project.category_ids,
        order_index: project.order_index,
        size: project.size || 'medium'
      });
    }
  }, [project]);

  const linkAdminBestEffort = async () => {
    try { await supabase.rpc('link_admin_user'); } catch (_) {}
  };

  const uploadImage = async (file: File, prefix: string): Promise<string> => {
    const doUpload = async (): Promise<string> => {
      await linkAdminBestEffort();
      const fileExt = file.name.split('.').pop();
      const fileName = `${prefix}_${Date.now()}.${fileExt}`;
      const filePath = `projects/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);
      return data.publicUrl;
    };

    try {
      return await doUpload();
    } catch (error: any) {
      const msg = String(error?.message || '');
      const code = String(error?.code || '');
      const isPerm = msg.includes('permission') || code === '42501';
      if (isPerm) {
        await new Promise(r => setTimeout(r, 150));
        return await doUpload();
      }
      throw error;
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast({ title: 'שגיאה', description: 'שם הפרויקט חובה', variant: 'destructive' });
      return;
    }
    if (!project && (!beforeImage || !afterImage)) {
      toast({ title: 'שגיאה', description: 'יש להעלות תמונות לפני ואחרי לפרויקט חדש', variant: 'destructive' });
      return;
    }

    setLoading(true);

    const saveOnce = async () => {
      await linkAdminBestEffort();

      let imageUrls = {
        beforeUrl: formData.image_before_url,
        afterUrl: formData.image_after_url,
        afterThumbUrl: formData.image_after_thumb_url
      };

      if (beforeImage) imageUrls.beforeUrl = await uploadImage(beforeImage, 'before');
      if (afterImage) {
        imageUrls.afterUrl = await uploadImage(afterImage, 'after');
        imageUrls.afterThumbUrl = imageUrls.afterUrl;
      }

      const projectData = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        image_before_url: imageUrls.beforeUrl,
        image_after_url: imageUrls.afterUrl,
        image_after_thumb_url: imageUrls.afterThumbUrl,
        category_ids: formData.category_ids,
        order_index: formData.order_index,
        size: formData.size
      };

      if (project) {
        const { error } = await supabase.from('projects').update(projectData).eq('id', project.id);
        if (error) throw error;
        toast({ title: 'הצלחה', description: 'הפרויקט עודכן בהצלחה' });
      } else {
        const { error } = await supabase.from('projects').insert(projectData);
        if (error) throw error;
        toast({ title: 'הצלחה', description: 'הפרויקט נוצר בהצלחה' });
      }
    };

    try {
      await saveOnce();
      onSave();
    } catch (error: any) {
      const msg = String(error?.message || '');
      const code = String(error?.code || '');
      const isPerm = msg.includes('permission') || code === '42501' || code === 'PGRST301';
      if (isPerm) {
        try {
          await new Promise(r => setTimeout(r, 150));
          await saveOnce();
          onSave();
          return;
        } catch (e2: any) {
          console.error('Retry save failed:', e2);
          toast({ title: 'שגיאה', description: 'שגיאת הרשאה בשמירת הפרויקט. נסה לצאת ולהתחבר שוב.', variant: 'destructive' });
        }
      } else {
        console.error('Error saving project:', error);
        toast({ title: 'שגיאה', description: `שגיאה בשמירת הפרויקט: ${msg || 'שגיאה לא מזוהה'}`, variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="font-assistant">
            {project ? 'עריכת פרויקט' : 'פרויקט חדש'}
          </DialogTitle>
          <DialogDescription>
            {project ? 'ערוך את פרטי הפרויקט' : 'צור פרויקט חדש עם תמונות לפני ואחרי'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">שם הפרויקט *</Label>
            <Input id="title" value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} placeholder="הכנס שם פרויקט" required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">תיאור</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))} placeholder="תיאור הפרויקט (אופציונלי)" rows={3} />
          </div>

          <div className="space-y-2">
            <Label>גודל תמונה</Label>
            <Select value={formData.size} onValueChange={(value: 'small' | 'medium' | 'large') => setFormData(prev => ({ ...prev, size: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="בחר גודל תמונה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">קטן (פוזיציה 1 - 1x1 ריבוע)</SelectItem>
                <SelectItem value="medium">בינוני (פוזיציה 5 - 2x1 מלבן)</SelectItem>
                <SelectItem value="large">גדול (פוזיציה 9 - 2x2 ריבוע)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="beforeImage">תמונה לפני {!project && '*'}</Label>
              <Input id="beforeImage" type="file" accept="image/*" onChange={(e) => setBeforeImage(e.target.files?.[0] || null)} />
              {formData.image_before_url && (<img src={formData.image_before_url} alt="לפני" className="w-full h-32 object-cover rounded border" />)}
            </div>

            <div className="space-y-2">
              <Label htmlFor="afterImage">תמונה אחרי {!project && '*'}</Label>
              <Input id="afterImage" type="file" accept="image/*" onChange={(e) => setAfterImage(e.target.files?.[0] || null)} />
              {formData.image_after_thumb_url && (<img src={formData.image_after_thumb_url} alt="אחרי" className="w-full h-32 object-cover rounded border" />)}
            </div>
          </div>

          {categories.length > 0 && (
            <div className="space-y-2">
              <Label>קטגוריות</Label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox id={`category-${category.id}`} checked={formData.category_ids.includes(category.id)} onCheckedChange={() => handleCategoryToggle(category.id)} />
                    <Label htmlFor={`category-${category.id}`} className="text-sm">{category.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={onClose}>ביטול</Button>
            <Button type="submit" disabled={loading}>{loading ? 'שומר...' : 'שמור'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}