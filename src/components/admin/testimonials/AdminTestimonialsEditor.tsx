import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { Testimonial } from '@/types/testimonials';
import { Save, Loader2 } from 'lucide-react';

interface AdminTestimonialsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Partial<Testimonial> & { business_name: string; category: string; image_url: string }) => Promise<void>;
  editingItem?: Testimonial | null;
}

const AdminTestimonialsEditor = ({ isOpen, onClose, onSave, editingItem }: AdminTestimonialsEditorProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    business_name: '',
    category: '',
    image_url: '',
    link_instagram: '',
    link_facebook: '',
    link_x: '',
    enabled: true,
  });

  useEffect(() => {
    if (!isOpen) return;
    if (editingItem) {
      setFormData({
        business_name: editingItem.business_name,
        category: editingItem.category,
        image_url: editingItem.image_url,
        link_instagram: editingItem.link_instagram || '',
        link_facebook: editingItem.link_facebook || '',
        link_x: editingItem.link_x || '',
        enabled: editingItem.enabled,
      });
    } else {
      setFormData({
        business_name: '',
        category: '',
        image_url: '',
        link_instagram: '',
        link_facebook: '',
        link_x: '',
        enabled: true,
      });
    }
  }, [isOpen, editingItem]);

  const handleSave = async () => {
    if (!formData.business_name.trim() || !formData.category.trim() || !formData.image_url.trim()) {
      toast({ title: 'שגיאה', description: 'יש למלא שם עסק, קטגוריה וקישור לתמונה', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      await onSave({
        ...(editingItem ? { id: editingItem.id } : {}),
        ...formData,
      });
      onClose();
    } catch (e) {
      console.error(e);
      toast({ title: 'שגיאה', description: 'שגיאה בשמירה', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-assistant">
            {editingItem ? 'עריכת לקוח' : 'לקוח חדש'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-assistant font-medium">שם העסק</Label>
            <Input
              value={formData.business_name}
              onChange={(e) => setFormData((p) => ({ ...p, business_name: e.target.value }))}
              placeholder="למשל: דג הזהב"
              className="text-right"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-assistant font-medium">קטגוריה</Label>
            <Input
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              placeholder="למשל: מסעדות / מאפיות"
              className="text-right"
              dir="rtl"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-assistant font-medium">תמונת רקע (URL)</Label>
            <Input
              value={formData.image_url}
              onChange={(e) => setFormData((p) => ({ ...p, image_url: e.target.value }))}
              placeholder="https://..."
              className="text-right"
              dir="rtl"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">Instagram</Label>
              <Input
                value={formData.link_instagram}
                onChange={(e) => setFormData((p) => ({ ...p, link_instagram: e.target.value }))}
                placeholder="https://instagram.com/..."
                className="text-right"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">Facebook</Label>
              <Input
                value={formData.link_facebook}
                onChange={(e) => setFormData((p) => ({ ...p, link_facebook: e.target.value }))}
                placeholder="https://facebook.com/..."
                className="text-right"
                dir="rtl"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">X (Twitter)</Label>
              <Input
                value={formData.link_x}
                onChange={(e) => setFormData((p) => ({ ...p, link_x: e.target.value }))}
                placeholder="https://x.com/..."
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded bg-muted/30">
            <Label className="text-sm font-assistant">מופעל להצגה</Label>
            <Switch checked={formData.enabled} onCheckedChange={(v) => setFormData((p) => ({ ...p, enabled: v }))} />
          </div>
        </div>

        <DialogFooter className="gap-2 sticky bottom-0 bg-background p-4 border-t mt-6">
          <Button variant="outline" onClick={onClose} className="font-assistant">
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={isLoading || !formData.business_name.trim() || !formData.category.trim() || !formData.image_url.trim()} className="font-assistant bg-primary hover:bg-primary/90 text-white font-bold px-6">
            {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />שומר...</>) : (<><Save className="w-4 h-4 mr-2" />{editingItem ? 'עדכן' : 'שמור'}</>)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminTestimonialsEditor;
