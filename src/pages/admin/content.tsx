import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { Edit, Save, X } from 'lucide-react';

interface SiteContent {
  id: string;
  key: string;
  value: string;
  description: string;
}

export default function ContentAdmin() {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*')
      .order('key', { ascending: true });
    
    if (error) {
      console.error('Error fetching content:', error);
      return;
    }
    setContents(data || []);
    setLoading(false);
  };

  const startEdit = (content: SiteContent) => {
    setEditingKey(content.key);
    setEditValue(content.value);
  };

  const cancelEdit = () => {
    setEditingKey(null);
    setEditValue('');
  };

  const saveEdit = async (key: string) => {
    try {
      const { error } = await supabase
        .from('site_content')
        .update({ 
          value: editValue,
          updated_at: new Date().toISOString()
        })
        .eq('key', key);

      if (error) throw error;

      setEditingKey(null);
      setEditValue('');
      fetchContent();
    } catch (error) {
      console.error('Error updating content:', error);
      alert('שגיאה בעדכון התוכן');
    }
  };

  const getDisplayKey = (key: string) => {
    return key
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) return <AdminLayout title="עריכת תכנים"><div>טוען...</div></AdminLayout>;

  return (
    <AdminLayout title="עריכת תכנים">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground">תכני האתר</h2>
          <div className="text-sm text-muted-foreground">
            עריכת טקסטים וכותרות באתר
          </div>
        </div>

        <div className="bg-card shadow-sm rounded-lg overflow-hidden">
          <div className="divide-y divide-border">
            {contents.map((content) => (
              <div key={content.key} className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-medium text-foreground">
                      {getDisplayKey(content.key)}
                    </h3>
                    {content.description && (
                      <p className="text-sm text-muted-foreground mt-1">{content.description}</p>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {editingKey === content.key ? (
                      <>
                        <button
                          onClick={() => saveEdit(content.key)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-2 text-muted-foreground hover:bg-muted rounded"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(content)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                  </div>
                </div>

                {editingKey === content.key ? (
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                ) : (
                  <div className="bg-muted/50 p-3 rounded-md">
                    <pre className="text-sm text-foreground whitespace-pre-wrap font-sans">
                      {content.value}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}