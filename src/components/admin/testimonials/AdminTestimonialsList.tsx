import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Search, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import type { Testimonial } from '@/types/testimonials';

interface AdminTestimonialsListProps {
  items: Testimonial[];
  onEdit: (item: Testimonial) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string, enabled: boolean) => void;
  onMove: (id: string, direction: 'up' | 'down') => void;
}

const AdminTestimonialsList = ({ items, onEdit, onDelete, onToggle, onMove }: AdminTestimonialsListProps) => {
  const [search, setSearch] = useState('');
  const filtered = items.filter((i) => i.business_name.toLowerCase().includes(search.toLowerCase()) || i.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-assistant">סינון</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input placeholder="חיפוש לפי שם/קטגוריה" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 text-right" dir="rtl" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((item) => (
          <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            <Card className="group hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 text-right">
                    <CardTitle className="text-lg font-assistant truncate">{item.business_name}</CardTitle>
                    <p className="text-sm text-muted-foreground font-open-sans">{item.category}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant="outline" className="text-xs">סדר: {item.display_order}</Badge>
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onMove(item.id, 'up')}><ArrowUp className="w-3 h-3" /></Button>
                      <Button variant="outline" size="sm" className="h-7 px-2 text-xs" onClick={() => onMove(item.id, 'down')}><ArrowDown className="w-3 h-3" /></Button>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs">מופעל</span>
                      <Switch checked={item.enabled} onCheckedChange={(v) => onToggle(item.id, v)} />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img src={item.image_url} alt={item.business_name} className="w-full h-full object-cover" />
                </div>
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => onEdit(item)} className="flex-1 text-xs font-assistant"><Edit className="w-3 h-3 mr-1" />עריכה</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-xs font-assistant text-destructive hover:text-destructive"><Trash2 className="w-3 h-3 mr-1" />מחק</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent dir="rtl">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="font-assistant">מחיקה</AlertDialogTitle>
                        <AlertDialogDescription className="font-open-sans">למחוק את "{item.business_name}"? פעולה זו לא ניתנת לביטול.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="font-assistant">ביטול</AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(item.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-assistant">מחק</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AdminTestimonialsList;
