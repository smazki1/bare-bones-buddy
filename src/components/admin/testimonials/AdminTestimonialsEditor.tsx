import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import type { Testimonial } from '@/types/testimonials';

interface AdminTestimonialsEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (testimonial: Partial<Testimonial>) => Promise<void>;
  editingItem: Testimonial | null;
}

const AdminTestimonialsEditor = ({
  isOpen,
  onClose,
  onSave,
  editingItem
}: AdminTestimonialsEditorProps) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    client_name: '',
    client_business: '',
    content: '',
    rating: 5,
    is_featured: false
  });

  useEffect(() => {
    if (editingItem) {
      setFormData({
        client_name: editingItem.client_name || '',
        client_business: editingItem.client_business || '',
        content: editingItem.content || '',
        rating: editingItem.rating || 5,
        is_featured: editingItem.is_featured || false
      });
    } else {
      setFormData({
        client_name: '',
        client_business: '',
        content: '',
        rating: 5,
        is_featured: false
      });
    }
  }, [editingItem, isOpen]);

  const handleSave = async () => {
    if (!formData.client_name.trim() || !formData.content.trim()) {
      toast({
        title: "שגיאה",
        description: "שם הלקוח ותוכן ההמלצה חובה",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      await onSave(formData);
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-right font-assistant">
            {editingItem ? 'ערוך המלצה' : 'המלצה חדשה'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="client_name">שם הלקוח *</Label>
              <Input
                id="client_name"
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                placeholder="למשל: יוסי כהן"
                className="text-right"
              />
            </div>
            
            <div>
              <Label htmlFor="client_business">שם העסק</Label>
              <Input
                id="client_business"
                value={formData.client_business}
                onChange={(e) => setFormData(prev => ({ ...prev, client_business: e.target.value }))}
                placeholder="למשל: מסעדת הדג הזהב"
                className="text-right"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="content">תוכן ההמלצה *</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="כתוב כאן את ההמלצה של הלקוח..."
              className="text-right min-h-[120px]"
              rows={5}
            />
          </div>

          <div>
            <Label>דירוג (כוכבים)</Label>
            <div className="mt-2">
              <Slider
                value={[formData.rating]}
                onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value[0] }))}
                min={1}
                max={5}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>1</span>
                <span className="font-medium">{formData.rating} כוכבים</span>
                <span>5</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_featured">המלצה מומלצת</Label>
            <Switch
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
            />
          </div>
        </div>

        <div className="flex justify-between gap-3 pt-6">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            ביטול
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? 'שומר...' : 'שמור'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AdminTestimonialsEditor;