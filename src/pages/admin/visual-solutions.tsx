import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { uploadSingleImage } from '@/utils/imageProcessing';
import { Plus, Edit, Trash2, GripVertical, Upload, Eye, EyeOff } from 'lucide-react';
import { visualSolutionsStore } from '@/data/visualSolutionsStore';
import { VisualSolutionsConfig, VisualSolutionCard } from '@/types/visualSolutions';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableRowProps {
  solution: VisualSolutionCard;
  onEdit: (solution: VisualSolutionCard) => void;
  onToggleEnabled: (id: string, currentStatus: boolean) => void;
  onDelete: (id: string) => void;
}

function SortableRow({ solution, onEdit, onToggleEnabled, onDelete }: SortableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: solution.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      className={`${isDragging ? 'bg-gray-50' : ''}`}
    >
      <td className="px-6 py-4 whitespace-nowrap">
        <div
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={20} />
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <img
            src={solution.imageSrc}
            alt={solution.title}
            className="h-12 w-16 object-cover rounded-md ml-3"
          />
          <div>
            <div className="text-sm font-medium text-gray-900">{solution.title}</div>
            <div className="text-sm text-gray-500">ID: {solution.id}</div>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
          solution.enabled 
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}>
          {solution.enabled ? 'פעיל' : 'לא פעיל'}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(solution)}
            className="text-blue-600 hover:text-blue-900"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => onToggleEnabled(solution.id, solution.enabled)}
            className="text-yellow-600 hover:text-yellow-900"
          >
            {solution.enabled ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
          <button
            onClick={() => onDelete(solution.id)}
            className="text-red-600 hover:text-red-900"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function VisualSolutionsAdmin() {
  const [config, setConfig] = useState<VisualSolutionsConfig>(() => 
    visualSolutionsStore.safeGetConfigOrDefaults()
  );
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingSolution, setEditingSolution] = useState<VisualSolutionCard | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadConfig = async () => {
      console.log('Admin Panel: Loading config...');
      
      try {
        // Try Supabase first
        const cloudConfig = await visualSolutionsStore.fetchFromSupabase();
        if (cloudConfig && cloudConfig.items) {
          console.log('Admin Panel: Loaded from Supabase:', cloudConfig);
          setConfig(cloudConfig);
          return;
        }
      } catch (error) {
        console.warn('Admin Panel: Supabase fetch failed:', error);
      }
      
      // Fallback to local storage
      const newConfig = visualSolutionsStore.safeGetConfigOrDefaults();
      console.log('Admin Panel: Loaded from localStorage:', newConfig);
      setConfig(newConfig);
    };

    // Load initial config
    loadConfig();

    // Listen for updates
    const handleUpdate = () => {
      console.log('Admin Panel: Config update event received');
      loadConfig();
    };
    
    window.addEventListener('visualSolutions:updated', handleUpdate);
    window.addEventListener('storage', (e) => {
      if (e.key === 'aiMaster:visualSolutions') {
        console.log('Admin Panel: Storage change detected');
        loadConfig();
      }
    });

    return () => {
      window.removeEventListener('visualSolutions:updated', handleUpdate);
    };
  }, []);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = config.items.findIndex((item) => item.id === active.id);
    const newIndex = config.items.findIndex((item) => item.id === over.id);

    const reorderedItems = arrayMove(config.items, oldIndex, newIndex);
    
    // Update order property
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      order: index
    }));

    const newConfig = {
      ...config,
      items: updatedItems
    };

    setConfig(newConfig);
    visualSolutionsStore.saveConfig(newConfig);
    
    // Save to Supabase as well
    visualSolutionsStore.saveToSupabase(newConfig);
  };

  const handleDelete = (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק פתרון זה?')) return;

    const updatedItems = config.items.filter(item => item.id !== id);
    const newConfig = {
      ...config,
      items: updatedItems
    };

    setConfig(newConfig);
    visualSolutionsStore.saveConfig(newConfig);
    visualSolutionsStore.saveToSupabase(newConfig);
  };

  const toggleEnabled = (id: string, currentStatus: boolean) => {
    const updatedItems = config.items.map(item =>
      item.id === id ? { ...item, enabled: !currentStatus } : item
    );
    
    const newConfig = {
      ...config,
      items: updatedItems
    };

    setConfig(newConfig);
    visualSolutionsStore.saveConfig(newConfig);
    visualSolutionsStore.saveToSupabase(newConfig);
  };

  const handleSave = async (solutionData: Partial<VisualSolutionCard>) => {
    console.log('Admin Panel: Saving solution data:', solutionData);
    
    let updatedItems;
    
    if (editingSolution) {
      // Edit existing
      console.log('Admin Panel: Editing existing solution:', editingSolution.id);
      updatedItems = config.items.map(item =>
        item.id === editingSolution.id ? { ...item, ...solutionData } : item
      );
    } else {
      // Add new
      console.log('Admin Panel: Adding new solution');
      const newSolution: VisualSolutionCard = {
        id: visualSolutionsStore.generateId(solutionData.title || 'פתרון חדש'),
        title: solutionData.title || 'פתרון חדש',
        imageSrc: solutionData.imageSrc || '',
        videoSrc: solutionData.videoSrc,
        href: solutionData.href || '/services',
        tagSlug: solutionData.tagSlug,
        enabled: solutionData.enabled !== false,
        order: config.items.length
      };
      updatedItems = [...config.items, newSolution];
    }

    const newConfig = {
      ...config,
      items: updatedItems
    };

    console.log('Admin Panel: Saving new config:', newConfig);
    
    // Update local state immediately
    setConfig(newConfig);
    
    // Save to localStorage
    visualSolutionsStore.saveConfig(newConfig);
    
    // Save to Supabase
    try {
      const saved = await visualSolutionsStore.saveToSupabase(newConfig);
      if (saved) {
        console.log('Admin Panel: Successfully saved to Supabase');
      } else {
        console.warn('Admin Panel: Failed to save to Supabase, but localStorage updated');
      }
    } catch (error) {
      console.error('Admin Panel: Supabase save error:', error);
    }
    
    setShowForm(false);
    setEditingSolution(null);
  };

  return (
    <AdminLayout title="ניהול פתרונות ויזואליים">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">פתרונות ויזואליים</h2>
          <button
            onClick={() => setShowForm(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 flex items-center gap-2"
          >
            <Plus size={20} />
            הוסף פתרון חדש
          </button>
        </div>

        {/* Section Config */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">הגדרות סקשן</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                כותרת ראשית
              </label>
              <input
                type="text"
                value={config.sectionTitle}
                onChange={(e) => {
                  const newConfig = { ...config, sectionTitle: e.target.value };
                  setConfig(newConfig);
                  visualSolutionsStore.saveConfig(newConfig);
                  visualSolutionsStore.saveToSupabase(newConfig);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                תת כותרת
              </label>
              <input
                type="text"
                value={config.sectionSubtitle}
                onChange={(e) => {
                  const newConfig = { ...config, sectionSubtitle: e.target.value };
                  setConfig(newConfig);
                  visualSolutionsStore.saveConfig(newConfig);
                  visualSolutionsStore.saveToSupabase(newConfig);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Solutions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פתרון
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    סטטוס
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    פעולות
                  </th>
                </tr>
              </thead>
              <SortableContext items={config.items.map(item => item.id)} strategy={verticalListSortingStrategy}>
                <tbody className="bg-white divide-y divide-gray-200">
                  {config.items
                    .sort((a, b) => a.order - b.order)
                    .map((solution) => (
                      <SortableRow
                        key={solution.id}
                        solution={solution}
                        onEdit={(sol) => {
                          setEditingSolution(sol);
                          setShowForm(true);
                        }}
                        onToggleEnabled={toggleEnabled}
                        onDelete={handleDelete}
                      />
                    ))}
                </tbody>
              </SortableContext>
            </table>
          </DndContext>
        </div>

        {showForm && (
          <SolutionForm
            solution={editingSolution}
            onClose={() => {
              setShowForm(false);
              setEditingSolution(null);
            }}
            onSave={handleSave}
          />
        )}
      </div>
    </AdminLayout>
  );
}

function SolutionForm({ solution, onClose, onSave }: {
  solution: VisualSolutionCard | null;
  onClose: () => void;
  onSave: (data: Partial<VisualSolutionCard>) => void;
}) {
  const [formData, setFormData] = useState({
    title: '',
    imageSrc: '',
    videoSrc: '',
    href: '/services',
    tagSlug: '',
    enabled: true
  });
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (solution) {
      setFormData({
        title: solution.title,
        imageSrc: solution.imageSrc,
        videoSrc: solution.videoSrc || '',
        href: solution.href || '/services',
        tagSlug: solution.tagSlug || '',
        enabled: solution.enabled
      });
      setPreviewUrl(solution.imageSrc);
    }
  }, [solution]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let imageSrc = formData.imageSrc;
      let videoSrc = formData.videoSrc;

      if (imageFile) {
        try {
          console.log('Uploading image file:', imageFile.name);
          imageSrc = await uploadSingleImage(imageFile, 'service-images', 'visual-solutions');
          console.log('Image uploaded successfully:', imageSrc);
        } catch (error) {
          console.error('Image upload failed:', error);
          throw new Error(`שגיאה בהעלאת התמונה: ${error}`);
        }
      }

      if (videoFile) {
        try {
          console.log('Uploading video file:', videoFile.name);
          videoSrc = await uploadSingleImage(videoFile, 'service-images', 'visual-solutions');
          console.log('Video uploaded successfully:', videoSrc);
        } catch (error) {
          console.error('Video upload failed:', error);
          throw new Error(`שגיאה בהעלאת הסרטון: ${error}`);
        }
      }

      onSave({
        ...formData,
        imageSrc,
        videoSrc: videoSrc || undefined
      });
    } catch (error: any) {
      console.error('Error saving solution:', error);
      alert(`שגיאה בשמירת הפתרון: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {solution ? 'עריכת פתרון' : 'פתרון חדש'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              כותרת *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              תמונה *
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setImageFile(file);
                
                if (file) {
                  const url = URL.createObjectURL(file);
                  setPreviewUrl(url);
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {!imageFile && (
              <input
                type="url"
                placeholder="או הכנס URL של תמונה"
                value={formData.imageSrc}
                onChange={(e) => {
                  setFormData(prev => ({ ...prev, imageSrc: e.target.value }));
                  setPreviewUrl(e.target.value);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-2"
              />
            )}
            {previewUrl && (
              <img
                src={previewUrl}
                alt="תצוגה מקדימה"
                className="mt-2 h-32 w-48 object-cover rounded-md"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              וידאו (אופציונלי)
            </label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setVideoFile(file);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
            {!videoFile && (
              <input
                type="url"
                placeholder="או הכנס URL של וידאו"
                value={formData.videoSrc}
                onChange={(e) => setFormData(prev => ({ ...prev, videoSrc: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 mt-2"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              קישור
            </label>
            <input
              type="text"
              value={formData.href}
              onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tag Slug (אופציונלי)
            </label>
            <input
              type="text"
              value={formData.tagSlug}
              onChange={(e) => setFormData(prev => ({ ...prev, tagSlug: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              checked={formData.enabled}
              onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
              פעיל
            </label>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="bg-orange-500 text-white px-6 py-2 rounded-md hover:bg-orange-600 disabled:opacity-50"
            >
              {loading ? 'שומר...' : 'שמור'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
            >
              ביטול
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}