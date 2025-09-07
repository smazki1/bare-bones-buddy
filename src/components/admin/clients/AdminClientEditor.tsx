import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Client, packageTypes, businessTypes, statusOptions } from '@/types/clients';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { Save, Loader2 } from 'lucide-react';

interface AdminClientEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Omit<Client, 'id' | 'created_at' | 'updated_at'> | Client) => void;
  editingClient?: Client | null;
}

const AdminClientEditor = ({ isOpen, onClose, onSave, editingClient }: AdminClientEditorProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Omit<Client, 'id' | 'created_at' | 'updated_at'>>({
    business_name: '',
    contact_person: '',
    email: '',
    phone: '',
    business_type: 'מסעדה',
    package_type: 'חבילת התנסות',
    monthly_savings: 0,
    status: 'פעיל',
    signup_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (!isOpen) return;
    
    if (editingClient) {
      setFormData({
        business_name: editingClient.business_name,
        contact_person: editingClient.contact_person || '',
        email: editingClient.email || '',
        phone: editingClient.phone || '',
        business_type: editingClient.business_type,
        package_type: editingClient.package_type,
        monthly_savings: editingClient.monthly_savings,
        status: editingClient.status,
        signup_date: editingClient.signup_date,
        notes: editingClient.notes || ''
      });
    } else {
      setFormData({
        business_name: '',
        contact_person: '',
        email: '',
        phone: '',
        business_type: 'מסעדה',
        package_type: 'חבילת התנסות',
        monthly_savings: 0,
        status: 'פעיל',
        signup_date: new Date().toISOString().split('T')[0],
        notes: ''
      });
    }
  }, [isOpen, editingClient]);

  const handleSave = async () => {
    if (!formData.business_name.trim()) {
      toast({
        title: "שגיאה",
        description: "יש למלא שם עסק",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const clientToSave = editingClient 
        ? { ...editingClient, ...formData }
        : formData;

      await onSave(clientToSave);
      onClose();
      
      toast({
        title: "הצלחה",
        description: editingClient ? "לקוח עודכן בהצלחה" : "לקוח חדש נוסף בהצלחה"
      });
    } catch (error) {
      console.error('Error saving client:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת פרטי הלקוח",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const statusOption = statusOptions.find(s => s.value === formData.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-xl font-assistant">
            {editingClient ? 'עריכת לקוח' : 'לקוח חדש'}
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="business_name" className="text-sm font-assistant font-medium">
                שם העסק <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business_name"
                value={formData.business_name}
                onChange={(e) => setFormData(prev => ({ ...prev, business_name: e.target.value }))}
                placeholder="למשל: מסעדת הבית"
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contact_person" className="text-sm font-assistant font-medium">
                איש קשר
              </Label>
              <Input
                id="contact_person"
                value={formData.contact_person}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_person: e.target.value }))}
                placeholder="שם איש הקשר"
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-assistant font-medium">
                אימייל
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="email@example.com"
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-assistant font-medium">
                טלפון
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="050-123-4567"
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Business Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">סוג העסק</Label>
              <Select
                value={formData.business_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, business_type: value }))}
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {businessTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">חבילה</Label>
              <Select
                value={formData.package_type}
                onValueChange={(value) => setFormData(prev => ({ ...prev, package_type: value }))}
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {packageTypes.map((pkg) => (
                    <SelectItem key={pkg} value={pkg}>{pkg}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status & Savings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-assistant font-medium">סטטוס</Label>
              <Select
                value={formData.status}
                onValueChange={(value: 'פעיל' | 'לא פעיל' | 'השהיה') => 
                  setFormData(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="text-right" dir="rtl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      <Badge className={status.color}>{status.label}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="monthly_savings" className="text-sm font-assistant font-medium">
                חיסכון חודשי (₪)
              </Label>
              <Input
                id="monthly_savings"
                type="number"
                value={formData.monthly_savings}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  monthly_savings: parseInt(e.target.value) || 0 
                }))}
                placeholder="0"
                className="text-right"
                dir="rtl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup_date" className="text-sm font-assistant font-medium">
                תאריך הצטרפות
              </Label>
              <Input
                id="signup_date"
                type="date"
                value={formData.signup_date}
                onChange={(e) => setFormData(prev => ({ ...prev, signup_date: e.target.value }))}
                className="text-right"
                dir="rtl"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-sm font-assistant font-medium">
              הערות
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="הערות על הלקוח..."
              className="text-right min-h-20"
              dir="rtl"
            />
          </div>

          {/* Current Status Display */}
          {statusOption && (
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-assistant font-medium">סטטוס נוכחי:</Label>
                <Badge className={statusOption.color}>{statusOption.label}</Badge>
              </div>
            </div>
          )}
        </motion.div>

        <DialogFooter 
          className="gap-2 sticky bottom-0 bg-background p-4 border-t mt-6"
          style={{ marginTop: '1.5rem' }}
        >
          <Button variant="outline" onClick={onClose} className="font-assistant">
            ביטול
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isLoading || !formData.business_name.trim()}
            className="font-assistant bg-primary hover:bg-primary/90 text-white font-bold px-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                שומר...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                {editingClient ? 'עדכן לקוח 💾' : 'שמור לקוח חדש 🎉'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminClientEditor;