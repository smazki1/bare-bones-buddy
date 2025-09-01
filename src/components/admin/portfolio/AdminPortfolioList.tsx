import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Search, Image, Eye, Copy } from 'lucide-react';
import { Project } from '@/data/portfolioMock';
import { categoryFilters } from '@/data/portfolioMock';

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

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.businessName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.businessType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || project.category === categoryFilter;
    const matchesService = serviceFilter === 'all' || project.serviceType === serviceFilter;
    
    return matchesSearch && matchesCategory && matchesService;
  });

  const ProjectCard = ({ project }: { project: Project }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
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
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Image Preview */}
          <div className="flex gap-2">
            {project.imageAfter && (
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">אחרי</p>
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={project.imageAfter}
                    alt="תמונה אחרי"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            {project.imageBefore && (
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">לפני</p>
                <div className="relative aspect-video rounded-md overflow-hidden bg-muted">
                  <img
                    src={project.imageBefore}
                    alt="תמונה לפני"
                    className="w-full h-full object-cover"
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
  );

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
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
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