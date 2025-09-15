import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, HelpCircle } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
  created_at: string;
}

export default function FAQAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    const { data, error } = await supabase
      .from('faq')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching FAQs:', error);
      return;
    }
    setFaqs(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק שאלה זו?')) return;

    const { error } = await supabase
      .from('faq')
      .delete()
      .eq('id', id);

    if (error) {
      alert('שגיאה במחיקת השאלה');
      return;
    }

    fetchFaqs();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('faq')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('שגיאה בעדכון השאלה');
      return;
    }

    fetchFaqs();
  };

  const categories = [...new Set(faqs.map(faq => faq.category))];

  if (loading) return <AdminLayout title="ניהול שאלות ותשובות"><div>טוען...</div></AdminLayout>;

  return (
    <AdminLayout title="ניהול שאלות ותשובות">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">שאלות ותשובות</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center gap-2"
          >
            <Plus size={20} />
            הוסף שאלה חדשה
          </button>
        </div>

        {categories.map(category => (
          <div key={category} className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 capitalize">{category}</h3>
            </div>
            <div className="divide-y divide-gray-200">
              {faqs.filter(faq => faq.category === category).map((faq) => (
                <div key={faq.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <HelpCircle size={16} className="text-orange-500" />
                        <h4 className="text-sm font-medium text-gray-900">{faq.question}</h4>
                        {!faq.is_active && (
                          <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                            לא פעיל
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{faq.answer}</p>
                    </div>
                    <div className="flex gap-2 mr-4">
                      <button
                        onClick={() => {
                          setEditingFaq(faq);
                          setShowForm(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleActive(faq.id, faq.is_active)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        {faq.is_active ? 'השבת' : 'הפעל'}
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {faqs.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">אין שאלות נפוצות</p>
          </div>
        )}

        {showForm && (
          <FAQForm
            faq={editingFaq}
            onClose={() => {
              setShowForm(false);
              setEditingFaq(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingFaq(null);
              fetchFaqs();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function FAQForm({ faq, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'general',
    order_index: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (faq) {
      setFormData(faq);
    }
  }, [faq]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (faq) {
        const { error } = await supabase
          .from('faq')
          .update(formData)
          .eq('id', faq.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faq')
          .insert(formData);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      alert('שגיאה בשמירת השאלה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {faq ? 'עריכת שאלה' : 'שאלה חדשה'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              השאלה *
            </label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              התשובה *
            </label>
            <textarea
              required
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                קטגוריה
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="general">כללי</option>
                <option value="services">שירותים</option>
                <option value="pricing">תמחור</option>
                <option value="technical">טכני</option>
              </select>
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
              שאלה פעילה
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