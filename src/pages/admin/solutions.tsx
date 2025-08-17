import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { solutionsStore } from '@/data/solutionsStore';
import { SolutionsConfig, SolutionCard } from '@/types/solutions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { ArrowRight, Plus, Download, Upload, RotateCcw, Save } from 'lucide-react';
import { downloadBlob } from '@/utils/fileUtils';
import AdminSolutionsList from '@/components/admin/solutions/AdminSolutionsList';
import AdminSolutionsEditor from '@/components/admin/solutions/AdminSolutionsEditor';

const AdminSolutions = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const { toast } = useToast();
  const [config, setConfig] = useState<SolutionsConfig>(solutionsStore.safeGetConfigOrDefaults());
  const [editingCard, setEditingCard] = useState<SolutionCard | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      const storedConfig = solutionsStore.getConfig();
      if (storedConfig) {
        setConfig(storedConfig);
      }
    }
  }, [isAuthenticated]);

  const handleSectionChange = (field: 'sectionTitle' | 'sectionSubtitle', value: string) => {
    setConfig(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSaveConfig = () => {
    solutionsStore.saveConfig(config);
    setHasUnsavedChanges(false);
    toast({
      title: 'נשמר בהצלחה',
      description: 'התצורה נשמרה במערכת',
    });
  };

  const handleAddCard = () => {
    setEditingCard({
      id: '',
      title: '',
      imageSrc: '',
      videoSrc: '',
      tagSlug: '',
      href: '',
      enabled: true,
      order: config.items.length,
    });
    setIsEditorOpen(true);
  };

  const handleEditCard = (card: SolutionCard) => {
    setEditingCard(card);
    setIsEditorOpen(true);
  };

  const handleDuplicateCard = (card: SolutionCard) => {
    const newCard: SolutionCard = {
      ...card,
      id: solutionsStore.generateId(`${card.title} העתק`),
      title: `${card.title} - העתק`,
      order: config.items.length,
    };
    setEditingCard(newCard);
    setIsEditorOpen(true);
  };

  const handleDeleteCard = (id: string) => {
    setConfig(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id).map((item, index) => ({
        ...item,
        order: index,
      })),
    }));
    setHasUnsavedChanges(true);
  };

  const handleToggleEnabled = (id: string, enabled: boolean) => {
    setConfig(prev => ({
      ...prev,
      items: prev.items.map(item =>
        item.id === id ? { ...item, enabled } : item
      ),
    }));
    setHasUnsavedChanges(true);
  };

  const handleReorderCards = (reorderedItems: SolutionCard[]) => {
    setConfig(prev => ({ ...prev, items: reorderedItems }));
    setHasUnsavedChanges(true);
  };

  const handleSaveCard = (cardData: SolutionCard) => {
    if (!cardData.id) {
      // New card
      cardData.id = solutionsStore.generateId(cardData.title);
    }

    setConfig(prev => {
      const existingIndex = prev.items.findIndex(item => item.id === cardData.id);
      if (existingIndex >= 0) {
        // Update existing
        const newItems = [...prev.items];
        newItems[existingIndex] = cardData;
        return { ...prev, items: newItems };
      } else {
        // Add new
        return { ...prev, items: [...prev.items, cardData] };
      }
    });
    
    setHasUnsavedChanges(true);
    toast({
      title: 'נשמר',
      description: 'הכרטיס נשמר בהצלחה',
    });
  };

  const handleExport = () => {
    const blob = solutionsStore.exportConfig();
    const filename = `solutions-config-${new Date().toISOString().split('T')[0]}.json`;
    downloadBlob(blob, filename);
    toast({
      title: 'יוצא',
      description: 'הקובץ הורד בהצלחה',
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          const result = solutionsStore.importConfig(reader.result as string);
          if (result.success) {
            setConfig(solutionsStore.safeGetConfigOrDefaults());
            setHasUnsavedChanges(false);
            toast({
              title: 'יובא בהצלחה',
              description: 'התצורה עודכנה מהקובץ',
            });
          } else {
            toast({
              title: 'שגיאה ביבוא',
              description: result.error,
              variant: 'destructive',
            });
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל התצורה לברירת המחדל?')) {
      solutionsStore.resetToDefaults();
      setConfig(solutionsStore.safeGetConfigOrDefaults());
      setHasUnsavedChanges(false);
      toast({
        title: 'אופס',
        description: 'התצורה אופסה לברירת המחדל',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground font-open-sans">טוען...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-assistant">גישה דרושה</CardTitle>
            <CardDescription className="font-open-sans">
              יש להתחבר כדי לגשת לעמוד זה
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/admin">
              <Button className="w-full font-assistant">
                חזרה לכניסה
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-right">
            <div className="flex items-center gap-3 mb-2">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="p-2">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <h1 className="text-3xl font-assistant font-bold text-primary">
                ניהול פתרונות עסקיים
              </h1>
            </div>
            <p className="text-muted-foreground font-open-sans">
              עריכת התוכן, התמונות והקישורים של הסקשן
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSaveConfig}
              disabled={!hasUnsavedChanges}
              className="font-assistant"
            >
              <Save className="h-4 w-4 mr-2" />
              שמירה
            </Button>
          </div>
        </div>

        {hasUnsavedChanges && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-700 font-open-sans text-right">
              יש שינויים שלא נשמרו. לא לשכוח ללחוץ "שמירה"!
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="font-assistant text-right">הגדרות הסקשן</CardTitle>
                <CardDescription className="font-open-sans text-right">
                  עריכת הכותרת והתת-כותרת של הסקשן
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="sectionTitle" className="text-right text-sm font-medium">
                    כותרת הסקשן
                  </Label>
                  <Input
                    id="sectionTitle"
                    value={config.sectionTitle}
                    onChange={(e) => handleSectionChange('sectionTitle', e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sectionSubtitle" className="text-right text-sm font-medium">
                    תת-כותרת
                  </Label>
                  <Input
                    id="sectionSubtitle"
                    value={config.sectionSubtitle}
                    onChange={(e) => handleSectionChange('sectionSubtitle', e.target.value)}
                    className="text-right"
                    dir="rtl"
                  />
                </div>

                {/* Preview */}
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 text-right">
                    תצוגה מקדימה:
                  </h3>
                  <div className="text-center">
                    <h2 className="text-2xl font-assistant font-bold text-primary mb-2">
                      {config.sectionTitle}
                    </h2>
                    <p className="text-muted-foreground font-open-sans">
                      {config.sectionSubtitle}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cards Management */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="text-right">
                    <CardTitle className="font-assistant">הכרטיסים</CardTitle>
                    <CardDescription className="font-open-sans">
                      גרור לשינוי סדר, לחץ לעריכה
                    </CardDescription>
                  </div>
                  <Button onClick={handleAddCard} className="font-assistant">
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף כרטיס
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <AdminSolutionsList
                  items={config.items}
                  onReorder={handleReorderCards}
                  onEdit={handleEditCard}
                  onDuplicate={handleDuplicateCard}
                  onDelete={handleDeleteCard}
                  onToggleEnabled={handleToggleEnabled}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="font-assistant text-right">פעולות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  className="w-full justify-start font-assistant"
                >
                  <Download className="h-4 w-4 mr-2" />
                  יצוא JSON
                </Button>
                <Button
                  variant="outline"
                  onClick={handleImport}
                  className="w-full justify-start font-assistant"
                >
                  <Upload className="h-4 w-4 mr-2" />
                  יבוא JSON
                </Button>
                <Separator />
                <Button
                  variant="destructive"
                  onClick={handleReset}
                  className="w-full justify-start font-assistant"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  איפוס לברירת מחדל
                </Button>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="font-assistant text-right">סטטיסטיקות</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-open-sans">סה"כ כרטיסים:</span>
                  <span className="font-medium">{config.items.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-open-sans">מופעלים:</span>
                  <span className="font-medium">
                    {config.items.filter(item => item.enabled).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-open-sans">עם וידאו:</span>
                  <span className="font-medium">
                    {config.items.filter(item => item.videoSrc).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-open-sans">עם קישור:</span>
                  <span className="font-medium">
                    {config.items.filter(item => item.href).length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Editor Modal */}
        <AdminSolutionsEditor
          card={editingCard}
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingCard(null);
          }}
          onSave={handleSaveCard}
        />
      </div>
    </div>
  );
};

export default AdminSolutions;