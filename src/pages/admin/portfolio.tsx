import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Plus, Upload, Download, RotateCcw, Image, BarChart3 } from 'lucide-react';
import AdminPortfolioEditor from '@/components/admin/portfolio/AdminPortfolioEditor';
import AdminPortfolioList from '@/components/admin/portfolio/AdminPortfolioList';
import { portfolioStore, PORTFOLIO_UPDATE_EVENT } from '@/data/portfolioStore';
// Supabase sync removed: local-only mode
import { Project } from '@/data/portfolioMock';
import { portfolioMockData } from '@/data/portfolioMock';
import { useToast } from '@/hooks/use-toast';

const AdminPortfolioPage = () => {
  const { user, isLoading, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load projects and stats
  const loadData = async () => {
    try {
      const [projectsData, statsData] = await Promise.all([
        portfolioStore.getProjects(),
        portfolioStore.getStats()
      ]);
      setProjects(projectsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading portfolio data:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    if (user && isAdmin) {
      loadData();
    }
  }, [user, isAdmin]);

  // Listen for real-time updates
  useEffect(() => {
    const handleUpdate = () => {
      loadData();
      setHasUnsavedChanges(false);
    };

    window.addEventListener(PORTFOLIO_UPDATE_EVENT, handleUpdate);
    return () => window.removeEventListener(PORTFOLIO_UPDATE_EVENT, handleUpdate);
  }, []);

  const handleAddProject = () => {
    setEditingProject(null);
    setIsEditorOpen(true);
  };

  const handleEditProject = async (project: Project) => {
    try {
      // Always pass a fresh reference from the store to avoid stale data
      const projects = await portfolioStore.getProjects();
      const fresh = projects.find(p => p.id === project.id) || project;
      setEditingProject(fresh);
      setIsEditorOpen(true);
    } catch (error) {
      console.error('Error loading project:', error);
      setEditingProject(project);
      setIsEditorOpen(true);
    }
  };

  const handleSaveProject = async (projectData: Omit<Project, 'id'> | Project) => {
    try {
      if ('id' in projectData) {
        await portfolioStore.updateProject(projectData.id, {
          businessName: projectData.businessName,
          businessType: projectData.businessType,
          serviceType: projectData.serviceType,
          imageAfter: projectData.imageAfter,
          imageBefore: projectData.imageBefore,
          size: projectData.size,
          category: projectData.category,
          pinned: projectData.pinned,
        });
      } else {
        await portfolioStore.addProject(projectData);
      }
      toast({ title: 'הצלחה', description: 'הפרויקט נשמר' });
      setIsEditorOpen(false);
      setEditingProject(null);
      setHasUnsavedChanges(true);
      loadData(); // Refresh data
    } catch (error) {
      toast({ title: 'שגיאה', description: 'שגיאה בשמירת הפרויקט', variant: 'destructive' });
    }
  };

  const handleDeleteProject = async (id: string | number) => {
    try {
      const ok = await portfolioStore.deleteProject(id);
      if (ok) {
        toast({ title: 'הצלחה', description: 'הפרויקט נמחק בהצלחה' });
        setHasUnsavedChanges(true);
        loadData(); // Refresh data
      } else {
        toast({ title: 'שגיאה', description: 'פרויקט לא נמצא', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'שגיאה', description: 'שגיאה במחיקת הפרויקט', variant: 'destructive' });
    }
  };

  const handleDuplicateProject = (project: Project) => {
    const { id, ...projectData } = project;
    const duplicatedProject = {
      ...projectData,
      businessName: `${project.businessName} - עותק`
    };
    
    try {
      portfolioStore.addProject(duplicatedProject);
      toast({
        title: "הצלחה",
        description: "הפרויקט שוכפל בהצלחה"
      });
      setHasUnsavedChanges(true);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בשכפול הפרויקט",
        variant: "destructive"
      });
    }
  };

  const handleExport = () => {
    try {
      const config = portfolioStore.exportConfig();
      const dataStr = JSON.stringify(config, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `portfolio-backup-${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
      
      toast({
        title: "הצלחה",
        description: "הגדרות הקטלוג יוצאו בהצלחה"
      });
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה ביצוא ההגדרות",
        variant: "destructive"
      });
    }
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const config = JSON.parse(e.target?.result as string);
        portfolioStore.importConfig(config);
        toast({
          title: "הצלחה",
          description: "הגדרות הקטלוג יובאו בהצלחה"
        });
        setHasUnsavedChanges(true);
      } catch (error) {
        toast({
          title: "שגיאה",
          description: "קובץ לא תקין",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);
  };

  const handleLoadMockData = () => {
    try {
      portfolioStore.setProjects(portfolioMockData);
      toast({
        title: "הצלחה",
        description: "נתוני דמו נטענו בהצלחה"
      });
      setHasUnsavedChanges(true);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת נתוני הדמו",
        variant: "destructive"
      });
    }
  };

  const handleReset = () => {
    try {
      portfolioStore.reset();
      toast({
        title: "הצלחה",
        description: "הקטלוג נוקה בהצלחה"
      });
      setHasUnsavedChanges(true);
    } catch (error) {
      toast({
        title: "שגיאה",
        description: "שגיאה באיפוס הקטלוג",
        variant: "destructive"
      });
    }
  };

  // Supabase import removed – local-only mode

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

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-assistant font-bold text-primary mb-4">
            נדרשת הרשאה
          </h1>
          <p className="text-muted-foreground font-open-sans mb-6">
            יש להתחבר כדי לגשת לעמוד זה
          </p>
          <Link to="/admin">
            <Button className="font-assistant">
              חזרה לעמוד הכניסה
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin">
            <Button variant="outline" size="icon">
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <div className="text-right flex-1">
            <h1 className="text-3xl font-assistant font-bold text-primary mb-2">
              ניהול קטלוג הפרויקטים
            </h1>
            <p className="text-muted-foreground font-open-sans">
              העלאה ועריכה של פרויקטים עם תמונות לפני ואחרי
            </p>
          </div>
          {hasUnsavedChanges && (
            <Badge variant="secondary" className="font-assistant">
              יש שינויים
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Action Bar */}
            <Card>
              <CardContent className="flex items-center justify-between p-4">
                <Button
                  onClick={handleAddProject}
                  className="font-assistant"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  פרויקט חדש
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    className="font-assistant text-xs"
                  >
                    <Download className="w-3 h-3 mr-1" />
                    יצוא
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    asChild
                    className="font-assistant text-xs"
                  >
                    <label>
                      <Upload className="w-3 h-3 mr-1" />
                      יבוא
                      <input
                        type="file"
                        accept=".json"
                        className="hidden"
                        onChange={handleImport}
                      />
                    </label>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Projects List */}
            <AdminPortfolioList
              projects={projects}
              onEdit={handleEditProject}
              onDelete={handleDeleteProject}
              onDuplicate={handleDuplicateProject}
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Stats */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  <CardTitle className="text-sm font-assistant">סטטיסטיקות</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">סה"כ פרויקטים</span>
                  <Badge variant="secondary">{stats?.total || 0}</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs font-assistant font-medium">לפי שירות:</p>
                  {stats?.byServiceType && Object.entries(stats.byServiceType).map(([service, count]) => (
                    <div key={service} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{service}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>

                {stats?.lastUpdated && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      עודכן: {new Date(stats.lastUpdated).toLocaleDateString('he-IL')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-assistant">פעולות מערכת</CardTitle>
                <CardDescription className="text-xs">
                  ניהול נתוני הקטלוג
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadMockData}
                  className="w-full justify-start font-assistant text-xs"
                >
                  <Image className="w-3 h-3 mr-2" />
                  טען נתוני דמו
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="w-full justify-start font-assistant text-xs text-destructive hover:text-destructive"
                >
                  <RotateCcw className="w-3 h-3 mr-2" />
                  נקה הכל
                </Button>

                
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Editor Modal */}
        <AdminPortfolioEditor
          isOpen={isEditorOpen}
          onClose={() => {
            setIsEditorOpen(false);
            setEditingProject(null);
          }}
          onSave={handleSaveProject}
          editingProject={editingProject}
        />
      </div>
    </div>
  );
};

export default AdminPortfolioPage;