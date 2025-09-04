import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowRight, Plus, Upload, Download, RotateCcw, Image, BarChart3 } from 'lucide-react';
import AdminPortfolioEditor from '@/components/admin/portfolio/AdminPortfolioEditor';
import AdminPortfolioList from '@/components/admin/portfolio/AdminPortfolioList';
import { portfolioStore, PORTFOLIO_UPDATE_EVENT } from '@/data/portfolioStore';
import { supabase, getSupabase, fetchProjects } from '@/lib/supabase';
import { Project } from '@/data/portfolioMock';
import { portfolioMockData } from '@/data/portfolioMock';
import { useToast } from '@/hooks/use-toast';

const AdminPortfolioPage = () => {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const { toast } = useToast();
  
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState(portfolioStore.getStats());
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Load projects and stats
  const loadData = () => {
    setProjects(portfolioStore.getProjects());
    setStats(portfolioStore.getStats());
  };

  // Initialize data
  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

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

  const handleEditProject = (project: Project) => {
    // Always pass a fresh reference from the store to avoid stale data
    const fresh = portfolioStore.getProjects().find(p => p.id === project.id) || project;
    setEditingProject(fresh);
    setIsEditorOpen(true);
  };

  const handleSaveProject = (projectData: Omit<Project, 'id'> | Project) => {
    const run = async () => {
      try {
        let adminToken = localStorage.getItem('aiMaster:adminToken') || '';
        if (!adminToken) {
          const entered = window.prompt('נא להזין ADMIN_TOKEN לניהול (יישמר בדפדפן שלך):');
          if (!entered) {
            toast({ title: 'בוטל', description: 'נדרש טוקן ניהול', variant: 'destructive' });
            return;
          }
          adminToken = entered;
          localStorage.setItem('aiMaster:adminToken', adminToken);
        }

        const action = 'id' in projectData ? 'update' : 'add';
        const payload = 'id' in projectData
          ? {
              id: Number((projectData as Project).id),
              business_name: projectData.businessName,
              business_type: projectData.businessType,
              service_type: projectData.serviceType,
              image_after: projectData.imageAfter,
              image_before: projectData.imageBefore ?? null,
              size: projectData.size,
              category: projectData.category,
              pinned: !!(projectData as Project).pinned,
            }
          : {
              business_name: (projectData as Omit<Project, 'id'>).businessName,
              business_type: (projectData as Omit<Project, 'id'>).businessType,
              service_type: (projectData as Omit<Project, 'id'>).serviceType,
              image_after: (projectData as Omit<Project, 'id'>).imageAfter,
              image_before: (projectData as Omit<Project, 'id'>).imageBefore || null,
              size: (projectData as Omit<Project, 'id'>).size,
              category: (projectData as Omit<Project, 'id'>).category,
              pinned: false,
            };
        const client = getSupabase() || supabase;
        const { data, error } = await client!.functions.invoke('portfolio-admin', {
          body: { action, payload },
          headers: { 'x-admin-token': adminToken }
        });
        if (error || !data?.ok) throw error || new Error(data?.error || 'edge error');

        // Refresh from Supabase to sync IDs/order
        const remote = await fetchProjects();
        const mapped: Project[] = remote.map(p => ({
          id: p.id,
          businessName: p.business_name,
          businessType: p.business_type,
          serviceType: p.service_type,
          imageAfter: p.image_after,
          imageBefore: p.image_before ?? undefined,
          size: p.size,
          category: p.category,
          pinned: p.pinned,
          createdAt: p.created_at,
        }));
        portfolioStore.setProjects(mapped);

        toast({ title: 'הצלחה', description: action === 'add' ? 'פרויקט חדש נוסף' : 'הפרויקט עודכן' });
        setIsEditorOpen(false);
        setEditingProject(null);
        setHasUnsavedChanges(true);
      } catch (error) {
        toast({ title: 'שגיאה', description: 'שגיאה בשמירת הפרויקט', variant: 'destructive' });
      }
    };
    void run();
  };

  const handleDeleteProject = (id: string | number) => {
    const run = async () => {
      try {
        let adminToken = localStorage.getItem('aiMaster:adminToken') || '';
        if (!adminToken) {
          const entered = window.prompt('נא להזין ADMIN_TOKEN לניהול (יישמר בדפדפן שלך):');
          if (!entered) { toast({ title: 'בוטל', description: 'נדרש טוקן ניהול', variant: 'destructive' }); return; }
          adminToken = entered; localStorage.setItem('aiMaster:adminToken', adminToken);
        }
        const client = getSupabase() || supabase;
        const { data, error } = await client!.functions.invoke('portfolio-admin', {
          body: { action: 'delete', payload: { id: Number(id) } },
          headers: { 'x-admin-token': adminToken }
        });
        if (error || !data?.ok) throw error || new Error(data?.error || 'edge error');

        const remote = await fetchProjects();
        const mapped: Project[] = remote.map(p => ({
          id: p.id,
          businessName: p.business_name,
          businessType: p.business_type,
          serviceType: p.service_type,
          imageAfter: p.image_after,
          imageBefore: p.image_before ?? undefined,
          size: p.size,
          category: p.category,
          pinned: p.pinned,
          createdAt: p.created_at,
        }));
        portfolioStore.setProjects(mapped);
        toast({ title: 'הצלחה', description: 'הפרויקט נמחק בהצלחה' });
        setHasUnsavedChanges(true);
      } catch (error) {
        toast({ title: 'שגיאה', description: 'שגיאה במחיקת הפרויקט', variant: 'destructive' });
      }
    };
    void run();
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

  // One-time migration: import all current local projects (and any currently visible in catalog)
  const handleImportLocalToSupabase = () => {
    const run = async () => {
      try {
        let adminToken = localStorage.getItem('aiMaster:adminToken') || '';
        if (!adminToken) {
          const entered = window.prompt('נא להזין ADMIN_TOKEN לניהול (יישמר בדפדפן שלך):');
          if (!entered) { toast({ title: 'בוטל', description: 'נדרש טוקן ניהול', variant: 'destructive' }); return; }
          adminToken = entered; localStorage.setItem('aiMaster:adminToken', adminToken);
        }

        // Fetch remote to avoid duplicates
        const remote = await fetchProjects();
        const existing = new Set(remote.map(p => `${p.image_after}`));

        // Use everything we have locally (store already contains mock + any admin items)
        const local = portfolioStore.getProjects();
        let imported = 0;
        for (const p of local) {
          if (existing.has(p.imageAfter)) continue;
          const payload = {
            business_name: p.businessName,
            business_type: p.businessType,
            service_type: p.serviceType,
            image_after: p.imageAfter,
            image_before: p.imageBefore ?? null,
            size: p.size,
            category: p.category,
            pinned: !!p.pinned,
          };
          const client = getSupabase() || supabase;
          const { data, error } = await client!.functions.invoke('portfolio-admin', {
            body: { action: 'add', payload },
            headers: { 'x-admin-token': adminToken }
          });
          if (error || !data?.ok) {
            console.warn('Import failed for', p, error || data?.error);
            continue;
          }
          imported += 1;
        }

        // Refresh store from Supabase
        const refreshed = await fetchProjects();
        const mapped: Project[] = refreshed.map(p => ({
          id: p.id,
          businessName: p.business_name,
          businessType: p.business_type,
          serviceType: p.service_type,
          imageAfter: p.image_after,
          imageBefore: p.image_before ?? undefined,
          size: p.size,
          category: p.category,
          pinned: p.pinned,
          createdAt: p.created_at,
        }));
        portfolioStore.setProjects(mapped);
        setHasUnsavedChanges(true);
        toast({ title: 'ייבוא הושלם', description: `${imported} פרויקטים נוספו ל-Supabase` });
      } catch (e) {
        toast({ title: 'שגיאה', description: 'ייבוא נכשל', variant: 'destructive' });
      }
    };
    void run();
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
                  <Badge variant="secondary">{stats.total}</Badge>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <p className="text-xs font-assistant font-medium">לפי שירות:</p>
                  {Object.entries(stats.byServiceType).map(([service, count]) => (
                    <div key={service} className="flex justify-between items-center text-xs">
                      <span className="text-muted-foreground">{service}</span>
                      <span>{count}</span>
                    </div>
                  ))}
                </div>

                {stats.lastUpdated && (
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

                <Button
                  variant="default"
                  size="sm"
                  onClick={handleImportLocalToSupabase}
                  className="w-full justify-start font-assistant text-xs bg-secondary text-white hover:bg-secondary/90"
                >
                  <Upload className="w-3 h-3 mr-2" />
                  ייבוא כל הפרויקטים המקומיים ל‑Supabase
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