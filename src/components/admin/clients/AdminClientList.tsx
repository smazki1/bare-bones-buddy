import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Edit, Trash2, Search, Users, Phone, Mail, Calendar, Images, Eye, DollarSign } from 'lucide-react';
import { Client, statusOptions, businessTypes } from '@/types/clients';

interface AdminClientListProps {
  clients: Client[];
  onEdit: (client: Client) => void;
  onDelete: (id: string) => void;
  onViewImages: (client: Client) => void;
}

const AdminClientList = ({ clients, onEdit, onDelete, onViewImages }: AdminClientListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [businessTypeFilter, setBusinessTypeFilter] = useState('all');

  const filteredClients = clients.filter(client => {
    const matchesSearch = 
      client.business_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.contact_person?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (client.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    const matchesBusinessType = businessTypeFilter === 'all' || client.business_type === businessTypeFilter;
    
    return matchesSearch && matchesStatus && matchesBusinessType;
  });

  const getTotalSavings = () => {
    return filteredClients.reduce((total, client) => total + client.monthly_savings, 0);
  };

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(s => s.value === status);
    return statusOption?.color || 'bg-gray-100 text-gray-800';
  };

  const ClientCard = ({ client }: { client: Client }) => (
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
                {client.business_name}
              </CardTitle>
              {client.contact_person && (
                <p className="text-sm text-muted-foreground font-open-sans">
                  {client.contact_person}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={getStatusColor(client.status)}>
                {client.status}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {client.business_type}
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Contact Info */}
          <div className="space-y-2">
            {client.email && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
            )}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>הצטרף: {new Date(client.signup_date).toLocaleDateString('he-IL')}</span>
            </div>
          </div>

          {/* Business Details */}
          <div className="p-3 bg-muted/30 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-assistant font-medium">חבילה:</span>
              <Badge variant="secondary" className="text-xs">
                {client.package_type}
              </Badge>
            </div>
            {client.monthly_savings > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm font-assistant font-medium">חיסכון חודשי:</span>
                <div className="flex items-center gap-1 text-green-600 font-bold">
                  <DollarSign className="w-4 h-4" />
                  <span>{client.monthly_savings.toLocaleString()}₪</span>
                </div>
              </div>
            )}
          </div>

          {/* Notes */}
          {client.notes && (
            <div className="p-2 bg-blue-50 rounded border-r-4 border-blue-400">
              <p className="text-sm text-blue-800">{client.notes}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onViewImages(client)}
              className="flex-1 text-xs font-assistant"
            >
              <Images className="w-3 h-3 mr-1" />
              תמונות
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(client)}
              className="flex-1 text-xs font-assistant"
            >
              <Edit className="w-3 h-3 mr-1" />
              עריכה
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
                  <AlertDialogTitle className="font-assistant">מחיקת לקוח</AlertDialogTitle>
                  <AlertDialogDescription className="font-open-sans">
                    האם אתה בטוח שברצונך למחוק את הלקוח "{client.business_name}"?
                    פעולה זו תמחק גם את כל התמונות של הלקוח ולא ניתנת לביטול.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="font-assistant">ביטול</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(client.id)}
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
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center p-4">
            <Users className="h-8 w-8 text-blue-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold">{filteredClients.length}</p>
              <p className="text-xs text-muted-foreground">לקוחות</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="flex items-center p-4">
            <DollarSign className="h-8 w-8 text-green-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold">{getTotalSavings().toLocaleString()}₪</p>
              <p className="text-xs text-muted-foreground">חיסכון חודשי</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
              <div className="h-3 w-3 rounded-full bg-green-600"></div>
            </div>
            <div className="mr-4">
              <p className="text-2xl font-bold">
                {filteredClients.filter(c => c.status === 'פעיל').length}
              </p>
              <p className="text-xs text-muted-foreground">פעילים</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex items-center p-4">
            <Images className="h-8 w-8 text-purple-600" />
            <div className="mr-4">
              <p className="text-2xl font-bold">∞</p>
              <p className="text-xs text-muted-foreground">תמונות</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-assistant">סינון ומציאת לקוחות</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="חיפוש לפי שם עסק, איש קשר או אימייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-right"
                dir="rtl"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="כל הסטטוסים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל הסטטוסים</SelectItem>
                {statusOptions.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={businessTypeFilter} onValueChange={setBusinessTypeFilter}>
              <SelectTrigger className="text-right" dir="rtl">
                <SelectValue placeholder="כל סוגי העסקים" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">כל סוגי העסקים</SelectItem>
                {businessTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{filteredClients.length} לקוחות נמצאו</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clients Grid */}
      {filteredClients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredClients.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-assistant font-semibold mb-2">
              {searchTerm || statusFilter !== 'all' || businessTypeFilter !== 'all' 
                ? 'לא נמצאו לקוחות'
                : 'אין לקוחות עדיין'
              }
            </h3>
            <p className="text-muted-foreground font-open-sans">
              {searchTerm || statusFilter !== 'all' || businessTypeFilter !== 'all'
                ? 'נסה לשנות את הפילטרים או החיפוש'
                : 'התחל ביצירת הלקוח הראשון שלך'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminClientList;