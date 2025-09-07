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

  const [items, setItems] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const loadData = async () => {
    if (!user || !isAdmin) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems((data || []) as Testimonial[]);
    } catch (e) {
      console.error(e);
      toast({ title: 'שגיאה', description: 'שגיאה בטעינת נתונים', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [user, isAdmin]);

  const handleAdd = () => { setEditingItem(null); setShowEditor(true); };
  const handleEdit = (item: Testimonial) => { setEditingItem(item); setShowEditor(true); };

  const handleSave = async (payload: Partial<Testimonial> & { business_name: string; category: string; image_url: string }) => {
    if (payload.id) {
      const { error } = await supabase.from('testimonials').update(payload).eq('id', payload.id);
      if (error) throw error;
      setItems((prev) => prev.map((i) => (i.id === payload.id ? { ...i, ...payload } as Testimonial : i)));
    } else {
      const nextOrder = (items[items.length - 1]?.display_order ?? 0) + 1;
      const { data, error } = await supabase.from('testimonials').insert([{ ...payload, display_order: nextOrder }]).select().single();
      if (error) throw error;
      setItems((prev) => [...prev, data as Testimonial]);
    }
    setShowEditor(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('testimonials').delete().eq('id', id);
    if (error) { toast({ title: 'שגיאה', description: 'מחיקה נכשלה', variant: 'destructive' }); return; }
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const { error } = await supabase.from('testimonials').update({ enabled }).eq('id', id);
    if (error) { toast({ title: 'שגיאה', description: 'עדכון סטטוס נכשל', variant: 'destructive' }); return; }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, enabled } : i)) as Testimonial[]);
  };

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex((i) => i.id === id);
    if (currentIndex === -1) return;
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    // Re-assign display_order sequentially
    const withOrders = reordered.map((it, idx) => ({ ...it, display_order: idx }));
    setItems(withOrders as Testimonial[]);
    // Persist each row to satisfy TS types
    try {
      await Promise.all(
        withOrders.map(({ id, display_order }) =>
          supabase.from('testimonials').update({ display_order }).eq('id', id)
        )
      );
    } catch (error) {
      console.error(error);
      toast({ title: 'שגיאה', description: 'שמירת סדר נכשלה', variant: 'destructive' });
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
            <Link to="/admin"><Button className="font-assistant">חזרה לממשק ניהול</Button></Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-8">
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Link to="/admin"><Button variant="ghost" size="sm" className="font-assistant"><ArrowRight className="w-4 h-4 mr-1" />חזרה</Button></Link>
            </div>
            <h1 className="text-3xl font-assistant font-bold text-primary mb-2">ניהול לקוחות (Testimonials)</h1>
            <p className="text-muted-foreground font-open-sans">נהל את הכרטיסים המופיעים בסקשן "הלקוחות שלנו"</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} size="sm" className="font-assistant"><RefreshCw className="w-4 h-4 mr-1" />רענן</Button>
            <Button onClick={handleAdd} className="font-assistant"><Plus className="w-4 h-4 mr-2" />כרטיס חדש</Button>
          </div>
        </motion.div>

        <AdminTestimonialsList
          items={items}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onToggle={handleToggle}
          onMove={handleMove}
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
