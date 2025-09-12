import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, X, ChevronUp, ChevronDown } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
}

export default function FAQAdmin() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQ | null>(null);

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
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

    fetchFAQs();
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    
    const newFaqs = [...faqs];
    [newFaqs[index - 1], newFaqs[index]] = [newFaqs[index], newFaqs[index - 1]];
    
    // Update order_index values
    const updates = newFaqs.map((item, idx) => ({ id: item.id, order_index: idx }));
    
    for (const update of updates) {
      await supabase
        .from('faq')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }
    
    setFaqs(newFaqs);
  };

  const handleMoveDown = async (index: number) => {
    if (index === faqs.length - 1) return;
    
    const newFaqs = [...faqs];
    [newFaqs[index], newFaqs[index + 1]] = [newFaqs[index + 1], newFaqs[index]];
    
    // Update order_index values
    const updates = newFaqs.map((item, idx) => ({ id: item.id, order_index: idx }));
    
    for (const update of updates) {
      await supabase
        .from('faq')
        .update({ order_index: update.order_index })
        .eq('id', update.id);
    }
    
    setFaqs(newFaqs);
  };

  if (loading) return <AdminLayout title="ניהול שאלות ותשובות"><div>טוען...</div></AdminLayout>;

  return (
    <AdminLayout title="ניהול שאלות ותשובות">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">שאלות ותשובות</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 flex items-center gap-2"
          >
            <Plus size={20} />
            הוסף שאלה
          </button>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={faq.id} className="bg-card rounded-lg shadow-sm border border-border overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-muted-foreground">
                        קטגוריה: {faq.category}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        faq.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {faq.is_active ? 'פעיל' : 'לא פעיל'}
                      </span>
                    </div>
                    
                    <h3 className="font-semibold text-lg mb-2 text-foreground">
                      {faq.question}
                    </h3>
                    
                    <p className="text-muted-foreground">
                      {faq.answer}
                    </p>
                    
                    <div className="text-xs text-muted-foreground mt-2">
                      סדר הצגה: {faq.order_index}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-2 text-muted-foreground hover:bg-muted rounded disabled:opacity-50"
                      >
                        <ChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === faqs.length - 1}
                        className="p-2 text-muted-foreground hover:bg-muted rounded disabled:opacity-50"
                      >
                        <ChevronDown size={16} />
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingFAQ(faq);
                          setShowForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(faq.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {showForm && (
          <FAQForm
            faq={editingFAQ}
            onClose={() => {
              setShowForm(false);
              setEditingFAQ(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingFAQ(null);
              fetchFAQs();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {faq ? 'עריכת שאלה' : 'שאלה חדשה'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              השאלה *
            </label>
            <input
              type="text"
              required
              value={formData.question}
              onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              התשובה *
            </label>
            <textarea
              required
              value={formData.answer}
              onChange={(e) => setFormData(prev => ({ ...prev, answer: e.target.value }))}
              rows={6}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                קטגוריה
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="general">כללי</option>
                <option value="pricing">מחירים</option>
                <option value="technical">טכני</option>
                <option value="service">שירות</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                סדר הצגה
              </label>
              <input
                type="number"
                value={formData.order_index}
                onChange={(e) => setFormData(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
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
              שאלה פעילה
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