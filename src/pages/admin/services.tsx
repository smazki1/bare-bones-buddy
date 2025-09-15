import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { uploadServiceImage } from '@/utils/imageProcessing';
import { Plus, Edit, Trash2, Settings } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  image_url: string;
  cta_text: string;
  cta_link: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
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

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('services')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('שגיאה בעדכון השירות');
      return;
    }

    fetchServices();
  };

  if (loading) return <AdminLayout title="ניהול שירותים"><div>טוען...</div></AdminLayout>;

  return (
    <AdminLayout title="ניהול שירותים">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">שירותים</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center gap-2"
          >
            <Plus size={20} />
            הוסף שירות חדש
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="aspect-video relative">
                {service.image_url ? (
                  <img
                    src={service.image_url}
                    alt={service.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Settings className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {!service.is_active && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <span className="text-white font-semibold">לא פעיל</span>
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                <p className="text-gray-600 text-sm mb-3 line-clamp-3">{service.description}</p>
                
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-gray-500">
                    CTA: {service.cta_text || 'דברו איתנו'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    service.is_active 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {service.is_active ? 'פעיל' : 'לא פעיל'}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
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
                  
                  <button
                    onClick={() => toggleActive(service.id, service.is_active)}
                    className={`px-3 py-1 rounded text-xs ${
                      service.is_active 
                        ? 'bg-orange-100 text-orange-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.is_active ? 'השבת' : 'הפעל'}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {service ? 'עריכת שירות' : 'שירות חדש'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              שם השירות *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תיאור השירות
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תמונת השירות
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {formData.image_url && (
              <img
                src={formData.image_url}
                alt="תמונה נוכחית"
                className="mt-2 w-full h-48 object-cover rounded"
              />
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                טקסט כפתור פעולה
              </label>
              <input
                type="text"
                value={formData.cta_text}
                onChange={(e) => setFormData(prev => ({ ...prev, cta_text: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                קישור פעולה
              </label>
              <input
                type="url"
                value={formData.cta_link}
                onChange={(e) => setFormData(prev => ({ ...prev, cta_link: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="https://..."
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              סדר הצגה
            </label>
            <input
              type="number"
              value={formData.order_index}
              onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="is_active" className="mr-2 text-sm font-medium text-gray-700">
              שירות פעיל
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'שומר...' : 'שמור'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}