import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, Download, Upload, RotateCcw, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import AdminVisualSolutionsList from '@/components/admin/visualSolutions/AdminVisualSolutionsList';
import AdminVisualSolutionsEditor from '@/components/admin/visualSolutions/AdminVisualSolutionsEditor';
import { VisualSolutionsConfig, VisualSolutionCard, DEFAULT_VISUAL_SOLUTIONS_CONFIG } from '@/types/visualSolutions';
import { visualSolutionsStore } from '@/data/visualSolutionsStore';

const AdminVisualSolutions = () => {
  const { user, isLoading, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [config, setConfig] = useState<VisualSolutionsConfig>(DEFAULT_VISUAL_SOLUTIONS_CONFIG);
  const [editingCard, setEditingCard] = useState<VisualSolutionCard | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (user && isAdmin) {
      const loadedConfig = visualSolutionsStore.safeGetConfigOrDefaults();
      setConfig(loadedConfig);
    }
  }, [user, isAdmin]);

  const handleSectionChange = (field: 'sectionTitle' | 'sectionSubtitle', value: string) => {
    setConfig(prev => {
      const next = { ...prev, [field]: value };
      visualSolutionsStore.saveConfig(next);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveConfig = () => {
    visualSolutionsStore.saveConfig(config);
    setHasUnsavedChanges(false);
    toast({
      title: "נשמר בהצלחה",
      description: "הגדרות הפתרונות הויזואליים נשמרו",
    });
  };

  const handleAddCard = () => {
    setEditingCard(null);
    setIsEditorOpen(true);
  };

  const handleEditCard = (card: VisualSolutionCard) => {
    setEditingCard(card);
    setIsEditorOpen(true);
  };

  const handleDuplicateCard = (card: VisualSolutionCard) => {
    const newCard: VisualSolutionCard = {
      ...card,
      id: visualSolutionsStore.generateId(`${card.title} - עותק`),
      title: `${card.title} - עותק`,
      order: config.items.length,
    };
    
    const newItems = [...config.items, newCard];
    setConfig(prev => {
      const next = { ...prev, items: newItems };
      visualSolutionsStore.saveConfig(next);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleDeleteCard = (id: string) => {
    const newItems = config.items
      .filter(item => item.id !== id)
      .map((item, index) => ({ ...item, order: index }));
    
    setConfig(prev => {
      const next = { ...prev, items: newItems };
      visualSolutionsStore.saveConfig(next);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleToggleEnabled = (id: string) => {
    const newItems = config.items.map(item =>
      item.id === id ? { ...item, enabled: !item.enabled } : item
    );
    
    setConfig(prev => {
      const next = { ...prev, items: newItems };
      visualSolutionsStore.saveConfig(next);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleReorderCards = (newCards: VisualSolutionCard[]) => {
    setConfig(prev => {
      const next = { ...prev, items: newCards };
      visualSolutionsStore.saveConfig(next);
      return next;
    });
    setHasUnsavedChanges(true);
  };

  const handleSaveCard = (cardData: VisualSolutionCard) => {
    let newItems;
    
    if (editingCard) {
      newItems = config.items.map(item =>
        item.id === editingCard.id ? cardData : item
      );
    } else {
      newItems = [...config.items, cardData];
    }
    
    setConfig(prev => {
      const next = { ...prev, items: newItems };
      visualSolutionsStore.saveConfig(next);
      return next;
    });
    setHasUnsavedChanges(true);
    
    toast({
      title: editingCard ? "עודכן בהצלחה" : "נוסף בהצלחה",
      description: `הפתרון הויזואלי "${cardData.title}" ${editingCard ? 'עודכן' : 'נוסף'}`,
    });
  };

  const handleExport = () => {
    const blob = visualSolutionsStore.exportConfig();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visual-solutions-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "יוצא בהצלחה",
      description: "קובץ הגדרות הפתרונות הויזואליים ירד למחשב",
    });
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = visualSolutionsStore.importConfig(content);
      
      if (result.success) {
        const newConfig = visualSolutionsStore.safeGetConfigOrDefaults();
        setConfig(newConfig);
        setHasUnsavedChanges(false);
        toast({
          title: "יובא בהצלחה",
          description: "הגדרות הפתרונות הויזואליים יובאו מהקובץ",
        });
      } else {
        toast({
          variant: "destructive",
          title: "שגיאה בייבוא",
          description: result.error || "הקובץ אינו תקין",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleReset = () => {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות? פעולה זו לא ניתנת לביטול.')) {
      visualSolutionsStore.resetToDefaults();
      setConfig(DEFAULT_VISUAL_SOLUTIONS_CONFIG);
      setHasUnsavedChanges(false);
      toast({
        title: "אופס בהצלחה",
        description: "הגדרות הפתרונות הויזואליים חזרו לברירת המחדל",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center font-assistant">גישה לא מורשית</CardTitle>
            <CardDescription className="text-center font-open-sans">
              עליך להתחבר כדי לגשת לעמוד זה
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const enabledCount = config.items.filter(item => item.enabled).length;
  const totalCount = config.items.length;

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/admin">
                <ArrowLeft className="w-4 h-4 ml-2" />
                חזרה לדשבורד
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-assistant font-bold">ניהול פתרונות ויזואליים</h1>
              <p className="text-muted-foreground font-open-sans">
                נהל את הקלפים בסקציה "מה אפשר ליצור איתנו"
              </p>
            </div>
          </div>
          
          {hasUnsavedChanges && (
            <div className="flex items-center gap-3">
              <Badge variant="destructive" className="font-assistant">
                שינויים לא נשמרו
              </Badge>
              <Button onClick={handleSaveConfig} className="font-assistant">
                <Save className="w-4 h-4 ml-2" />
                שמור שינויים
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Section Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="font-assistant">הגדרות סקציה</CardTitle>
                <CardDescription className="font-open-sans">
                  עריכת כותרת ותת-כותרת של הסקציה
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="sectionTitle" className="font-assistant">כותרת הסקציה</Label>
                  <Input
                    id="sectionTitle"
                    value={config.sectionTitle}
                    onChange={(e) => handleSectionChange('sectionTitle', e.target.value)}
                    className="font-assistant"
                  />
                </div>
                <div>
                  <Label htmlFor="sectionSubtitle" className="font-assistant">תת-כותרת הסקציה</Label>
                  <Textarea
                    id="sectionSubtitle"
                    value={config.sectionSubtitle}
                    onChange={(e) => handleSectionChange('sectionSubtitle', e.target.value)}
                    rows={2}
                    className="font-open-sans"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Cards Management */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="font-assistant">ניהול קלפים</CardTitle>
                    <CardDescription className="font-open-sans">
                      גרור לשינוי סדר, לחץ על הכפתורים לעריכה
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddCard} className="font-assistant">
                    <Plus className="w-4 h-4 ml-2" />
                    הוסף פתרון ויזואלי
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdminVisualSolutionsList
                  cards={config.items}
                  onEdit={handleEditCard}
                  onDuplicate={handleDuplicateCard}
                  onDelete={handleDeleteCard}
                  onToggleEnabled={handleToggleEnabled}
                  onReorder={handleReorderCards}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-assistant text-lg">פעולות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="w-full font-assistant"
                >
                  <Download className="w-4 h-4 ml-2" />
                  יצא הגדרות
                </Button>
                
                <div>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                    id="import-file"
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('import-file')?.click()}
                    className="w-full font-assistant"
                  >
                    <Upload className="w-4 h-4 ml-2" />
                    יבא הגדרות
                  </Button>
                </div>
                
                <Separator />
                
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  className="w-full font-assistant"
                >
                  <RotateCcw className="w-4 h-4 ml-2" />
                  אפס לברירת מחדל
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-assistant text-lg">סטטיסטיקות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="font-open-sans text-sm text-muted-foreground">סה"כ קלפים:</span>
                  <Badge variant="secondary" className="font-assistant">{totalCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-open-sans text-sm text-muted-foreground">קלפים פעילים:</span>
                  <Badge className="font-assistant">{enabledCount}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-open-sans text-sm text-muted-foreground">קלפים לא פעילים:</span>
                  <Badge variant="outline" className="font-assistant">{totalCount - enabledCount}</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Editor Modal */}
      <AdminVisualSolutionsEditor
        isOpen={isEditorOpen}
        onClose={() => {
          setIsEditorOpen(false);
          setEditingCard(null);
        }}
        onSave={handleSaveCard}
        editingCard={editingCard}
      />
    </div>
  );
};

export default AdminVisualSolutions;