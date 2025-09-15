import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Save, Edit } from 'lucide-react';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function ContentAdmin() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchContents();
  }, []);

  const fetchContents = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('key', { ascending: true });
    
    if (error) {
      console.error('Error fetching contents:', error);
      return;
    }
    setContents(data || []);
    setLoading(false);
  };

  const handleEdit = (content: SiteContent) => {
    setEditingContent(content);
    setEditValue(content.value);
  };

  const handleSave = async () => {
    if (!editingContent) return;

    const { error } = await supabase
      .from('site_content')
      .update({ value: editValue })
      .eq('id', editingContent.id);

    if (error) {
      alert('שגיאה בשמירת התוכן');
      return;
    }

    setEditingContent(null);
    setEditValue('');
    fetchContents();
  };

  const handleCancel = () => {
    setEditingContent(null);
    setEditValue('');
  };

  const contentSections = [
    {
      title: 'עמוד ראשי',
      items: contents.filter(c => c.key.startsWith('home_'))
    },
    {
      title: 'עמוד אודות',
      items: contents.filter(c => c.key.startsWith('about_'))
    },
    {
      title: 'עמוד שירותים',
      items: contents.filter(c => c.key.startsWith('services_'))
    },
    {
      title: 'עמוד יצירת קשר',
      items: contents.filter(c => c.key.startsWith('contact_'))
    },
    {
      title: 'כללי',
      items: contents.filter(c => !c.key.includes('_'))
    }
  ];

  if (loading) return <AdminLayout title="ניהול תכנים"><div>טוען...</div></AdminLayout>;

  return (
    <AdminLayout title="ניהול תכנים">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">תכני האתר</h2>
        </div>

        {contentSections.map((section) => (
          section.items.length > 0 && (
            <div key={section.title} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">{section.title}</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {section.items.map((content) => (
                  <div key={content.id} className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-1">
                          {content.key}
                        </h4>
                        {content.description && (
                          <p className="text-xs text-gray-500 mb-3">{content.description}</p>
                        )}
                      </div>
                      <button
                        onClick={() => handleEdit(content)}
                        className="text-blue-600 hover:text-blue-800 p-1"
                      >
                        <Edit size={16} />
                      </button>
                    </div>

                    {editingContent?.id === content.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2"
                          >
                            <Save size={16} />
                            שמור
                          </button>
                          <button
                            onClick={handleCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            ביטול
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-md">
                        <p className="text-sm text-gray-700 whitespace-pre-wrap">
                          {content.value || 'אין תוכן'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}

        {contents.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <p className="text-gray-500">אין תכנים להצגה</p>
            <p className="text-sm text-gray-400 mt-2">
              תכנים יתווספו אוטומטית כאשר יווספו לאתר
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}