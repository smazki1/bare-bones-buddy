import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { uploadServiceImage } from '@/utils/imageProcessing';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order_index: number;
  is_active: boolean;
}

export default function ServicesAdmin() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching services:', error);
      return;
    }
    setServices(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק שירות זה?')) return;

    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      alert('שגיאה במחיקת השירות');
      return;
    }

    fetchServices();
  };

  if (loading) return <AdminLayout title="ניהול שירותים"><div>טוען...</div></AdminLayout>;

  return (
    <AdminLayout title="ניהול שירותים">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">שירותים</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 flex items-center gap-2"
          >
            <Plus size={20} />
            הוסף שירות
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-card rounded-lg shadow-md overflow-hidden">
              {service.image_url && (
                <img
                  src={service.image_url}
                  alt={service.name}
                  className="w-full h-48 object-cover"
                />
              )}
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                <p className="text-muted-foreground text-sm mb-3 line-clamp-3">{service.description}</p>
                
                <div className="flex justify-between items-center text-sm text-muted-foreground mb-3">
                  <span>CTA: {service.cta_text}</span>
                  <span className={service.is_active ? 'text-green-600' : 'text-red-600'}>
                    {service.is_active ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
                
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => {
                      setEditingService(service);
                      setShowForm(true);
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <ServiceForm
            service={editingService}
            onClose={() => {
              setShowForm(false);
              setEditingService(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingService(null);
              fetchServices();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function ServiceForm({ service, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image_url: '',
    cta_text: 'דברו איתנו',
    cta_link: '',
    order_index: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    if (service) {
      setFormData(service);
    }
  }, [service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageUrl = formData.image_url;

      if (imageFile) {
        imageUrl = await uploadServiceImage(imageFile);
      }

      const serviceData = {
        ...formData,
        image_url: imageUrl
      };

      if (service) {
        const { error } = await supabase
          .from('services')
          .update(serviceData)
          .eq('id', service.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('services')
          .insert(serviceData);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving service:', error);
      alert('שגיאה בשמירת השירות');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {service ? 'עריכת שירות' : 'שירות חדש'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              שם השירות *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              תיאור השירות
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              תמונת השירות
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="תמונה נוכחית"
                className="mt-2 w-full h-32 object-cover rounded"
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                טקסט כפתור
              </label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                קישור כפתור
              </label>
              <input
                type="text"
                value={formData.cta_link}
                onChange={(e) => setFormData(prev => ({ ...prev, cta_link: e.target.value }))}
                placeholder="/contact או https://wa.me/..."
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-border text-primary focus:ring-primary"
            />
            <label htmlFor="is_active" className="mr-2 text-sm font-medium text-foreground">
              שירות פעיל
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-muted-foreground bg-muted rounded-md hover:bg-muted/80"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/80 disabled:opacity-50"
            >
              {loading ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}