import { useState, useEffect } from 'react'
import { AdminLayout } from '@/components/admin/AdminLayout'
import { supabase } from '@/integrations/supabase/client'
import { uploadCategoryIcon } from '@/utils/imageProcessing'
import { Plus, Edit, Trash2, GripVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/hooks/use-toast'

interface Category {
  id: string
  name: string
  slug: string
  description: string
  icon_url: string
  order_index: number
  is_active: boolean
}

export default function CategoriesAdmin() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('order_index', { ascending: true })
    
    if (error) {
      console.error('Error fetching categories:', error)
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת הקטגוריות",
        variant: "destructive"
      })
      return
    }
    setCategories(data || [])
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק קטגוריה זו?')) return

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', id)

    if (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת הקטגוריה",
        variant: "destructive"
      })
      return
    }

    toast({
      title: "הצלחה",
      description: "הקטגוריה נמחקה בהצלחה"
    })
    fetchCategories()
  }

  const toggleActive = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('categories')
      .update({ is_active: !currentStatus })
      .eq('id', id)

    if (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בעדכון הקטגוריה",
        variant: "destructive"
      })
      return
    }

    fetchCategories()
  }

  if (loading) return <AdminLayout title="ניהול קטגוריות"><div>טוען...</div></AdminLayout>

  return (
    <AdminLayout title="ניהול קטגוריות">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-foreground font-assistant">קטגוריות</h2>
          <Button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            הוסף קטגוריה
          </Button>
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
                        <div className="text-sm font-medium text-foreground font-assistant">{category.name}</div>
                        <div className="text-sm text-muted-foreground font-open-sans">{category.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-foreground font-open-sans">{category.description}</div>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingCategory(category)
                          setShowForm(true)
                        }}
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(category.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
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
              setShowForm(false)
              setEditingCategory(null)
            }}
            onSave={() => {
              setShowForm(false)
              setEditingCategory(null)
              fetchCategories()
            }}
          />
        )}
      </div>
    </AdminLayout>
  )
}

// CategoryForm Component
function CategoryForm({ category, onClose, onSave }: any) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    icon_url: '',
    order_index: 0,
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [iconFile, setIconFile] = useState<File | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (category) {
      setFormData(category)
    }
  }, [category])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\u0590-\u05FF]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let iconUrl = formData.icon_url

      if (iconFile) {
        iconUrl = await uploadCategoryIcon(iconFile)
      }

      const categoryData = {
        ...formData,
        icon_url: iconUrl,
        slug: formData.slug || generateSlug(formData.name)
      }

      if (category) {
        const { error } = await supabase
          .from('categories')
          .update(categoryData)
          .eq('id', category.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('categories')
          .insert(categoryData)
        if (error) throw error
      }

      toast({
        title: "הצלחה",
        description: category ? "הקטגוריה עודכנה בהצלחה" : "הקטגוריה נוצרה בהצלחה"
      })
      onSave()
    } catch (error) {
      console.error('Error saving category:', error)
      toast({
        title: "שגיאה",
        description: "שגיאה בשמירת הקטגוריה",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b border-border">
          <h2 className="text-xl font-semibold font-assistant">
            {category ? 'עריכת קטגוריה' : 'קטגוריה חדשה'}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            ✕
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="name" className="block text-sm font-medium mb-2">
              שם הקטגוריה *
            </Label>
            <Input
              id="name"
              type="text"
              required
              value={formData.name}
              onChange={(e) => {
                const name = e.target.value
                setFormData(prev => ({ 
                  ...prev, 
                  name,
                  slug: generateSlug(name)
                }))
              }}
            />
          </div>

          <div>
            <Label htmlFor="slug" className="block text-sm font-medium mb-2">
              Slug (אנגלית)
            </Label>
            <Input
              id="slug"
              type="text"
              value={formData.slug}
              onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="description" className="block text-sm font-medium mb-2">
              תיאור
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="icon" className="block text-sm font-medium mb-2">
              אייקון קטגוריה
            </Label>
            <Input
              id="icon"
              type="file"
              accept="image/*"
              onChange={(e) => setIconFile(e.target.files?.[0] || null)}
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
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              ביטול
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'שומר...' : 'שמור'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}