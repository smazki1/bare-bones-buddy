import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Star } from 'lucide-react';

interface Testimonial {
  id: string;
  client_name: string;
  client_business: string;
  content: string;
  rating: number;
  is_featured: boolean;
  order_index: number;
  created_at: string;
}

export default function TestimonialsAdmin() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching testimonials:', error);
      return;
    }
    setTestimonials(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק המלצה זו?')) return;

    const { error } = await supabase
      .from('testimonials')
      .delete()
      .eq('id', id);

    if (error) {
      alert('שגיאה במחיקת ההמלצה');
      return;
    }

    fetchTestimonials();
  };

  const toggleFeatured = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ is_featured: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('שגיאה בעדכון ההמלצה');
      return;
    }

    fetchTestimonials();
  };

  if (loading) return <AdminLayout title="ניהול המלצות"><div>טוען...</div></AdminLayout>;

  return (
    <AdminLayout title="ניהול המלצות">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">המלצות לקוחות</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center gap-2"
          >
            <Plus size={20} />
            הוסף המלצה חדשה
          </button>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  לקוח
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  המלצה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  דירוג
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {testimonials.map((testimonial) => (
                <tr key={testimonial.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{testimonial.client_name}</div>
                      <div className="text-sm text-gray-500">{testimonial.client_business}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {testimonial.content}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      testimonial.is_featured 
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {testimonial.is_featured ? 'מומלץ' : 'רגיל'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingTestimonial(testimonial);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleFeatured(testimonial.id, testimonial.is_featured)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        <Star size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showForm && (
          <TestimonialForm
            testimonial={editingTestimonial}
            onClose={() => {
              setShowForm(false);
              setEditingTestimonial(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingTestimonial(null);
              fetchTestimonials();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function TestimonialForm({ testimonial, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_business: '',
    content: '',
    rating: 5,
    is_featured: false,
    order_index: 0
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (testimonial) {
      setFormData(testimonial);
    }
  }, [testimonial]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (testimonial) {
        const { error } = await supabase
          .from('testimonials')
          .update(formData)
          .eq('id', testimonial.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('testimonials')
          .insert(formData);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving testimonial:', error);
      alert('שגיאה בשמירת ההמלצה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {testimonial ? 'עריכת המלצה' : 'המלצה חדשה'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם הלקוח *
              </label>
              <input
                type="text"
                required
                value={formData.client_name}
                onChange={(e) => setFormData(prev => ({ ...prev, client_name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                שם העסק
              </label>
              <input
                type="text"
                value={formData.client_business}
                onChange={(e) => setFormData(prev => ({ ...prev, client_business: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תוכן ההמלצה *
            </label>
            <textarea
              required
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              דירוג (1-5)
            </label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {[1, 2, 3, 4, 5].map(num => (
                <option key={num} value={num}>{num} כוכבים</option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_featured"
              checked={formData.is_featured}
              onChange={(e) => setFormData(prev => ({ ...prev, is_featured: e.target.checked }))}
              className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
            />
            <label htmlFor="is_featured" className="mr-2 text-sm font-medium text-gray-700">
              הצג בדף הבית (מומלץ)
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
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