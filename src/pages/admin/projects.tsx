import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ProjectForm } from '@/components/admin/ProjectForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Star, StarOff, Image } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Project {
  id: string;
  title: string;
  description: string;
  image_before_url: string;
  image_after_url: string;
  image_after_thumb_url: string;
  category_ids: string[];
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchProjects();
    fetchCategories();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בטעינת הפרויקטים',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('order_index');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק פרויקט זה?')) return;

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

      fetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה במחיקת הפרויקט',
        variant: 'destructive'
      });
    }
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ is_featured: !currentStatus })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: 'הצלחה',
        description: currentStatus ? 'הפרויקט הוסר מהמומלצים' : 'הפרויקט נוסף למומלצים'
      });

      fetchProjects();
    } catch (error) {
      console.error('Error updating project:', error);
      toast({
        title: 'שגיאה',
        description: 'שגיאה בעדכון הפרויקט',
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
        <div className="flex items-center justify-center h-64">
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
              ניהול תמונות לפני ואחרי של הפרויקטים
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="font-assistant bg-secondary hover:bg-secondary/90"
          >
            <Plus className="ml-2 h-4 w-4" />
            הוסף פרויקט חדש
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">סה"כ פרויקטים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">פרויקטים מומלצים</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.is_featured).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">קטגוריות פעילות</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categories.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <Card key={project.id} className="overflow-hidden">
              <div className="aspect-square relative bg-muted">
                {project.image_after_thumb_url ? (
                  <img
                    src={project.image_after_thumb_url}
                    alt={project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <Image className="h-12 w-12" />
                  </div>
                )}
                
                {project.is_featured && (
                  <Badge className="absolute top-2 right-2 bg-primary text-primary-foreground">
                    מומלץ
                  </Badge>
                )}
              </div>
              
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-semibold text-lg font-assistant line-clamp-1">
                      {project.title}
                    </h3>
                    {project.description && (
                      <p className="text-muted-foreground text-sm font-open-sans line-clamp-2 mt-1">
                        {project.description}
                      </p>
                    )}
                  </div>
                  
                  {project.category_ids.length > 0 && (
                    <p className="text-xs text-muted-foreground font-open-sans">
                      קטגוריות: {getCategoryNames(project.category_ids)}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center pt-2 border-t border-border">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingProject(project);
                          setShowForm(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => toggleFeatured(project.id, project.is_featured)}
                      >
                        {project.is_featured ? (
                          <StarOff className="h-4 w-4" />
                        ) : (
                          <Star className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(project.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <span className="text-xs text-muted-foreground">
                      סדר: {project.order_index}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {projects.length === 0 && (
          <Card className="p-12 text-center">
            <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold font-assistant mb-2">אין פרויקטים עדיין</h3>
            <p className="text-muted-foreground font-open-sans mb-4">
              התחל ביצירת הפרויקט הראשון שלך
            </p>
            <Button onClick={() => setShowForm(true)} className="font-assistant">
              <Plus className="ml-2 h-4 w-4" />
              הוסף פרויקט חדש
            </Button>
          </Card>
        )}

        {/* Project Form Modal */}
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
              fetchProjects();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}