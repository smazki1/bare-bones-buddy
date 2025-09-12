import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { uploadCategoryIcon } from '@/utils/imageProcessing';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_url: string;
  order_index: number;
  is_active: boolean;
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories:', error);
      return;
    }
    setCategories(data || []);
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id);

    if (error) {
      alert('שגיאה במחיקת הקטגוריה');
      return;
    }

    fetchCategories();
  };

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', id);

    if (error) {
      alert('שגיאה בעדכון הקטגוריה');
      return;
    }

    fetchCategories();
  };

  if (loading) return <AdminLayout title="ניהול קטגוריות"><div>טוען...</div></AdminLayout>;

  return (
    <AdminLayout title="ניהול קטגוריות">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">קטגוריות</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-secondary text-secondary-foreground px-4 py-2 rounded-md hover:bg-secondary/80 flex items-center gap-2"
          >
            <Plus size={20} />
            הוסף קטגוריה
          </button>
        </div>

        <div className="bg-card shadow-sm rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  קטגוריה
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  תיאור
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  סטטוס
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  פעולות
                </th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {category.icon_url && (
                        <img
                          className="h-10 w-10 rounded-full ml-4"
                          src={category.icon_url}
                          alt=""
                        />
                      )}
                      <div>
                        <div className="text-sm font-medium text-foreground">{category.name}</div>
                        <div className="text-sm text-muted-foreground">{category.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground">{category.description}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleActive(category.id, category.is_active)}
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {category.is_active ? 'פעיל' : 'לא פעיל'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setEditingCategory(category);
                          setShowForm(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
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
          <CategoryForm
            category={editingCategory}
            onClose={() => {
              setShowForm(false);
              setEditingCategory(null);
            }}
            onSave={() => {
              setShowForm(false);
              setEditingCategory(null);
              fetchCategories();
            }}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function CategoryForm({ category, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon_url: '',
    order_index: 0,
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [iconFile, setIconFile] = useState<File | null>(null);

  useEffect(() => {
    if (category) {
      setFormData(category);
    }
  }, [category]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let iconUrl = formData.icon_url;

      if (iconFile) {
        iconUrl = await uploadCategoryIcon(iconFile);
      }

      const categoryData = {
        ...formData,
        icon_url: iconUrl,
        slug: formData.slug || generateSlug(formData.name)
      };

      if (category) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData);
        if (error) throw error;
      }

      onSave();
    } catch (error) {
      console.error('Error saving category:', error);
      alert('שגיאה בשמירת הקטגוריה');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold">
            {category ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}
          </h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              שם הקטגוריה *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value;
                setFormData(prev => ({ 
                  ...prev, 
                  name,
                  slug: generateSlug(name)
                }));
              }}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Slug (אנגלית)
            </label>
            <input
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              תיאור
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              אייקון קטגוריה
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setIconFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-border rounded-md"
            />
            {formData.icon_url && (
              <img
                src={formData.icon_url}
                alt="אייקון נוכחי"
                className="mt-2 w-16 h-16 object-cover rounded"
              />
            )}
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