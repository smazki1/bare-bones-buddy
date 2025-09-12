import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import type { Testimonial } from '@/types/testimonials';
import AdminTestimonialsEditor from '@/components/admin/testimonials/AdminTestimonialsEditor';
import AdminTestimonialsList from '@/components/admin/testimonials/AdminTestimonialsList';
import { Plus, RefreshCw, ArrowRight, Users } from 'lucide-react';

const AdminTestimonialsPage = () => {
  const { user, isLoading: authLoading, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();

  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      
      setTestimonials(data || []);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    }
  };

  const createTestimonial = async (testimonialData: Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([testimonialData])
        .select()
        .single();

      if (error) throw error;
      
      setTestimonials(prev => [...prev, data]);
      return data;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  };

  const updateTestimonial = async (id: string, updates: Partial<Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>>) => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setTestimonials(prev => prev.map(t => t.id === id ? data : t));
      return data;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  };

  const reorderTestimonials = async (reorderedItems: Testimonial[]) => {
    try {
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        order_index: index
      }));

      for (const update of updates) {
        await supabase
          .from('testimonials')
          .update({ order_index: update.order_index })
          .eq('id', update.id);
      }

      setTestimonials(reorderedItems);
    } catch (error) {
      console.error('Error reordering testimonials:', error);
      throw error;
    }
  };

  useEffect(() => {
    if (user && isAdmin) {
      fetchTestimonials();
    }
  }, [user, isAdmin]);

  const handleAdd = () => {
    setEditingItem(null);
    setShowEditor(true);
  };

  const handleEdit = (item: Testimonial) => {
    setEditingItem(item);
    setShowEditor(true);
  };

  const handleSave = async (testimonialData: Partial<Testimonial>) => {
    try {
      if (editingItem) {
        await updateTestimonial(editingItem.id, testimonialData);
        toast({
          title: "הצלחה",
          description: "המלצה עודכנה בהצלחה",
        });
      } else {
        const nextOrder = testimonials.length > 0 ? Math.max(...testimonials.map(t => t.order_index)) + 1 : 0;
        await createTestimonial({
          ...testimonialData,
          order_index: nextOrder
        } as Omit<Testimonial, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "הצלחה",
          description: "המלצה נוספה בהצלחה",
        });
      }
      setShowEditor(false);
      await fetchTestimonials();
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שמירה נכשלה",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTestimonials(prev => prev.filter(t => t.id !== id));
      toast({
        title: "הצלחה",
        description: "המלצה נמחקה בהצלחה",
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "מחיקה נכשלה",
        variant: "destructive",
      });
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground font-open-sans">טוען...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-assistant font-semibold mb-2">גישה מוגבלת</h3>
            <p className="text-muted-foreground font-open-sans mb-4">יש צורך בהרשאות מנהל</p>
            <Link to="/admin">
              <Button className="font-assistant">חזרה לממשק ניהול</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="font-assistant">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  חזרה
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-assistant font-bold text-primary mb-2">
              ניהול המלצות לקוחות
            </h1>
            <p className="text-muted-foreground font-open-sans">
              נהל את המלצות הלקוחות המופיעות באתר
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchTestimonials} size="sm" className="font-assistant">
              <RefreshCw className="w-4 h-4 mr-1" />
              רענן
            </Button>
            <Button onClick={handleAdd} className="font-assistant">
              <Plus className="w-4 h-4 mr-2" />
              המלצה חדשה
            </Button>
          </div>
        </motion.div>

        <AdminTestimonialsList
          items={testimonials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onReorder={reorderTestimonials}
        />

        <AdminTestimonialsEditor
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          onSave={handleSave}
          editingItem={editingItem}
        />
      </div>
    </div>
  );
};

export default AdminTestimonialsPage;