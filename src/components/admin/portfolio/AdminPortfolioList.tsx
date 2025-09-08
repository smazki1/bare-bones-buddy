import { useState, useEffect, useMemo, memo } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Search, Image, Eye, Copy, Pin } from 'lucide-react';
import { Project } from '@/data/portfolioMock';
import { categoryFilters } from '@/data/portfolioMock';
import { portfolioStore } from '@/data/portfolioStore';
// TODO: In a follow-up, route writes via Edge Function

interface AdminPortfolioListProps {
  projects: Project[];
  onEdit: (project: Project) => void;
  onDelete: (id: string | number) => void;
  onDuplicate: (project: Project) => void;
}

const AdminPortfolioList = ({ projects, onEdit, onDelete, onDuplicate }: AdminPortfolioListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('all');
  const [sortMode, setSortMode] = useState(false);
  const [localOrder, setLocalOrder] = useState<number[]>([]);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const filteredProjects = useMemo(() => {
    return projects.filter(project => {
      const matchesSearch = project.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           project.businessType.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
      const matchesService = serviceFilter === 'all' || project.serviceType === serviceFilter;
      return matchesSearch && matchesCategory && matchesService;
    });
  }, [projects, searchTerm, categoryFilter, serviceFilter]);

  const visibleCategory = useMemo(() => (categoryFilter === 'all' ? '' : categoryFilter), [categoryFilter]);

  useEffect(() => {
    if (sortMode && visibleCategory) {
      // Initialize once per category change
      setLocalOrder(prev => {
        const currentIds = filteredProjects.map(p => Number(p.id));
        const unchanged = prev.length === currentIds.length && prev.every((v, i) => v === currentIds[i]);
        return unchanged ? prev : currentIds;
      });
    }
  }, [sortMode, visibleCategory, filteredProjects.length]);

  const moveItem = (id: number, direction: 'up' | 'down') => {
    setLocalOrder(prev => {
      const idx = prev.indexOf(id);
      if (idx === -1) return prev;
      const target = direction === 'up' ? idx - 1 : idx + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const temp = next[idx];
      next[idx] = next[target];
      next[target] = temp;
      return next;
    });
  };

  const setItemPosition = (id: number, newIndex: number) => {
    setLocalOrder(prev => {
      if (newIndex < 0 || newIndex >= prev.length) return prev;
      const currentIndex = prev.indexOf(id);
      if (currentIndex === -1 || currentIndex === newIndex) return prev;
      
      const next = [...prev];
      next.splice(currentIndex, 1);
      next.splice(newIndex, 0, id);
      return next;
    });
  };

  const saveOrder = () => {
    if (!visibleCategory || !sortMode || localOrder.length === 0) return;
    portfolioStore.setManualOrderForCategory(visibleCategory, localOrder.map(String));
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (!sortMode || !visibleCategory) return;
    try {
      e.dataTransfer.setData('text/plain', String(index));
      e.dataTransfer.effectAllowed = 'move';
    } catch {}
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!sortMode || !visibleCategory) return;
    e.preventDefault();
  };

  const handleDrop = (targetIndex: number, displayedIds: number[]) => {
    if (!sortMode || !visibleCategory) return;
    if (dragIndex === null || dragIndex === targetIndex) return;
    const next = [...displayedIds];
    const [moved] = next.splice(dragIndex, 1);
    next.splice(targetIndex, 0, moved);
    setLocalOrder(next);
    setDragIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const ProjectCard = memo(({ project }: { project: Project }) => (
    <motion.div
      initial={sortMode ? false : { opacity: 0, y: 20 }}
      animate={sortMode ? undefined : { opacity: 1, y: 0 }}
      exit={sortMode ? undefined : { opacity: 0, y: -20 }}
      transition={sortMode ? { duration: 0 } : { duration: 0.3 }}
    >
      <Card className={`group hover:shadow-md transition-all ${
        sortMode && visibleCategory 
          ? 'cursor-grab active:cursor-grabbing border-2 border-dashed border-primary/30 hover:border-primary/60' 
          : ''
      }`}>
        <CardHeader className="pb-3">
          {sortMode && visibleCategory && (
            <div className="flex items-center justify-center w-full mb-2 text-muted-foreground">
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
                <div className="w-1 h-1 bg-current rounded-full"></div>
              </div>
            </div>
          )}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-assistant truncate">
                {project.businessName}
              </CardTitle>
              <p className="text-sm text-muted-foreground font-open-sans">
                {project.businessType}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={project.serviceType === 'תמונות' ? 'default' : 'secondary'}>
                {project.serviceType}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {categoryFilters.find(cat => cat.slug === project.category)?.label}
              </Badge>
              {project.pinned && (
                <Badge variant="secondary" className="text-[10px] mt-1">Pinned</Badge>
              )}
              {sortMode && visibleCategory && (
                <div className="flex flex-col gap-1 mt-1">
                  <Input
                    type="number"
                    min="1"
                    max={filteredProjects.length}
                    value={localOrder.indexOf(Number(project.id)) + 1}
                    onChange={(e) => setItemPosition(Number(project.id), parseInt(e.target.value) - 1)}
                    className="h-7 w-12 text-xs text-center"
                    title="מיקום"
                  />
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0 text-xs" onClick={() => moveItem(Number(project.id), 'up')}>↑</Button>
                    <Button variant="outline" size="sm" className="h-6 w-6 p-0 text-xs" onClick={() => moveItem(Number(project.id), 'down')}>↓</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Image Preview */}
          <div className="flex gap-2">
            {project.imageAfter && (
              <div className="flex-1" style={{ pointerEvents: sortMode ? 'none' : 'auto' }}>
                <p className="text-xs text-muted-foreground mb-1">אחרי</p>
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={project.imageAfter}
                    alt="תמונה אחרי"
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            )}
            {project.imageBefore && (
              <div className="flex-1" style={{ pointerEvents: sortMode ? 'none' : 'auto' }}>
                <p className="text-xs text-muted-foreground mb-1">לפני</p>
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={project.imageBefore}
                    alt="תמונה לפני"
                    className="w-full h-full object-cover"
                    draggable={false}
                    loading="lazy"
                    decoding="async"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Project Details */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>ID: {project.id}</span>
            <Badge variant="outline">
              {project.size === 'small' ? 'קטן' : project.size === 'medium' ? 'בינוני' : 'גדול'}
            </Badge>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            {!sortMode && (
            <Button
              variant={project.pinned ? 'default' : 'outline'}
              size="sm"
              onClick={() => portfolioStore.togglePinned(String(project.id))}
              className="text-xs font-assistant"
            >
                <Pin className="w-3 h-3 mr-1" />
                {project.pinned ? 'Unpin' : 'Pin'}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(project)}
              className="flex-1 text-xs font-assistant"
            >
              <Edit className="w-3 h-3 mr-1" />
              עריכה
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate(project)}
              className="text-xs font-assistant"
            >
              <Copy className="w-3 h-3 mr-1" />
              שכפל
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-assistant text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  מחק
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent dir="rtl">
                <AlertDialogHeader>
                  <AlertDialogTitle className="font-assistant">מחיקת פרויקט</AlertDialogTitle>
                  <AlertDialogDescription className="font-open-sans">
                    האם אתה בטוח שברצונך למחוק את הפרויקט "{project.businessName}"?
                    פעולה זו לא ניתנת לביטול.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-assistant">ביטול</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(project.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-assistant"
                  >
                    מחק
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  ));

  // Compute displayed list (used for both rendering and DnD index mapping)
  const displayedProjects = useMemo(() => (
    sortMode && visibleCategory
      ? [...filteredProjects].sort((a, b) => localOrder.indexOf(Number(a.id)) - localOrder.indexOf(Number(b.id)))
      : filteredProjects
  ), [sortMode, visibleCategory, filteredProjects, localOrder]);

  const displayedIds = useMemo(() => displayedProjects.map(p => Number(p.id)), [displayedProjects]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-assistant">סינון ומציאת פרויקטים</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם עסק..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-right"
                dir="rtl"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="כל הקטגוריות" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הקטגוריות</SelectItem>
                {categoryFilters.filter(cat => cat.slug !== 'all').map((category) => (
                  <SelectItem key={category.slug} value={category.slug}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={serviceFilter} onValueChange={setServiceFilter}>
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="כל השירותים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל השירותים</SelectItem>
                <SelectItem value="תמונות">תמונות</SelectItem>
                <SelectItem value="סרטונים">סרטונים</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Image className="w-4 h-4" />
              <span>{filteredProjects.length} פרויקטים</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={sortMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSortMode(!sortMode)}
                className="font-assistant text-xs"
                title={categoryFilter === 'all' ? 'Select a category to save order' : ''}
              >
                {sortMode ? 'סיום סידור' : 'מצב סידור'}
              </Button>
              {sortMode && visibleCategory && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={saveOrder}
                  className="font-assistant text-xs"
                >
                  שמור סדר
                </Button>
              )}
            </div>
          </div>
          {sortMode && !visibleCategory && (
            <div className="text-xs text-muted-foreground mt-2" dir="rtl">
              בחרו קטגוריה כדי לסדר ולשמור את סדר הפרויקטים.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedProjects.map((project, index) => (
            <div
              key={project.id}
              draggable={!!sortMode && !!visibleCategory}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(index, displayedIds)}
              onDragEnd={handleDragEnd}
              className={`${
                sortMode && visibleCategory 
                  ? 'cursor-grab hover:scale-105 transition-transform' 
                  : ''
              } ${dragIndex === index ? 'opacity-50 scale-95' : ''}`}
              aria-grabbed={sortMode && visibleCategory ? dragIndex === index : undefined}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Image className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-assistant font-semibold mb-2">
              {searchTerm || categoryFilter !== 'all' || serviceFilter !== 'all' 
                ? 'לא נמצאו פרויקטים'
                : 'אין פרויקטים עדיין'
              }
            </h3>
            <p className="text-muted-foreground font-open-sans">
              {searchTerm || categoryFilter !== 'all' || serviceFilter !== 'all'
                ? 'נסה לשנות את הפילטרים או החיפוש'
                : 'התחל ביצירת הפרויקט הראשון שלך'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminPortfolioList;