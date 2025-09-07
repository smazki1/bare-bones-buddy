import { useState, useEffect } from 'react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Client, ClientImage, ClientWithImages } from '@/types/clients';
import AdminClientEditor from '@/components/admin/clients/AdminClientEditor';
import AdminClientList from '@/components/admin/clients/AdminClientList';
import AdminClientImages from '@/components/admin/clients/AdminClientImages';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { ArrowRight, Plus, Users, DollarSign, TrendingUp, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminClientsPage = () => {
  const { user, isLoading: authLoading, isAdmin } = useSupabaseAuth();
  const { toast } = useToast();
  
  const [clients, setClients] = useState<Client[]>([]);
  const [clientImages, setClientImages] = useState<ClientImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [showImages, setShowImages] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  const loadData = async () => {
    if (!user || !isAdmin) return;
    
    setIsLoading(true);
    try {
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (clientsError) throw clientsError;
      setClients((clientsData || []) as Client[]);

      // Load client images
      const { data: imagesData, error: imagesError } = await supabase
        .from('client_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (imagesError) throw imagesError;
      setClientImages((imagesData || []) as ClientImage[]);

      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה בטעינת הנתונים",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user, isAdmin]);

  const handleAddClient = () => {
    setEditingClient(null);
    setShowEditor(true);
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setShowEditor(true);
  };

  const handleSaveClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'> | Client) => {
    try {
      if ('id' in clientData) {
        // Update existing client
        const { error } = await supabase
          .from('clients')
          .update(clientData)
          .eq('id', clientData.id);

        if (error) throw error;
        
        setClients(prev => prev.map(c => c.id === clientData.id ? clientData as Client : c));
      } else {
        // Add new client
        const { data, error } = await supabase
          .from('clients')
          .insert([clientData])
          .select()
          .single();

        if (error) throw error;
        
        setClients(prev => [data as Client, ...prev]);
      }
      
      setUnsavedChanges(true);
      setShowEditor(false);
    } catch (error) {
      console.error('Error saving client:', error);
      throw error;
    }
  };

  const handleDeleteClient = async (id: string) => {
    try {
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClients(prev => prev.filter(c => c.id !== id));
      setClientImages(prev => prev.filter(img => img.client_id !== id));
      setUnsavedChanges(true);
      
      toast({
        title: "הצלחה",
        description: "לקוח נמחק בהצלחה"
      });
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת הלקוח",
        variant: "destructive"
      });
    }
  };

  const handleViewImages = (client: Client) => {
    setSelectedClient(client);
    setShowImages(true);
  };

  const handleAddImage = async (imageData: Omit<ClientImage, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('client_images')
        .insert([imageData])
        .select()
        .single();

      if (error) throw error;
      
      setClientImages(prev => [data as ClientImage, ...prev]);
      setUnsavedChanges(true);
    } catch (error) {
      console.error('Error adding image:', error);
      throw error;
    }
  };

  const handleUpdateImage = async (imageData: ClientImage) => {
    try {
      const { error } = await supabase
        .from('client_images')
        .update(imageData)
        .eq('id', imageData.id);

      if (error) throw error;
      
      setClientImages(prev => prev.map(img => img.id === imageData.id ? imageData : img));
      setUnsavedChanges(true);
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  };

  const handleDeleteImage = async (id: string) => {
    try {
      const { error } = await supabase
        .from('client_images')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setClientImages(prev => prev.filter(img => img.id !== id));
      setUnsavedChanges(true);
      
      toast({
        title: "הצלחה",
        description: "תמונה נמחקה בהצלחה"
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "שגיאה",
        description: "שגיאה במחיקת התמונה",
        variant: "destructive"
      });
    }
  };

  const getStats = () => {
    const totalSavings = clients.reduce((sum, client) => sum + client.monthly_savings, 0);
    const activeClients = clients.filter(c => c.status === 'פעיל').length;
    const totalImages = clientImages.length;
    
    return {
      totalClients: clients.length,
      activeClients,
      totalSavings,
      totalImages,
      avgSavingsPerClient: clients.length > 0 ? Math.round(totalSavings / clients.length) : 0
    };
  };

  const stats = getStats();
  const selectedClientImages = selectedClient 
    ? clientImages.filter(img => img.client_id === selectedClient.id)
    : [];

  if (authLoading || isLoading) {
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
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Users className="w-12 h-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-assistant font-semibold mb-2">
              גישה מוגבלת
            </h3>
            <p className="text-muted-foreground font-open-sans mb-4">
              יש צורך בהרשאות מנהל לגשת לממשק ניהול הלקוחות
            </p>
            <Link to="/admin">
              <Button className="font-assistant">
                חזרה לממשק ניהול
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
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className="text-right">
            <div className="flex items-center gap-2 mb-2">
              <Link to="/admin">
                <Button variant="ghost" size="sm" className="font-assistant">
                  <ArrowRight className="w-4 h-4 mr-1" />
                  חזרה לממשק ניהול
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-assistant font-bold text-primary mb-2">
              ניהול לקוחות 🏢
            </h1>
            <p className="text-muted-foreground font-open-sans">
              עסקים שהבינו את העתיד = כבר חוסכים אלפי שקלים בכל חודש
            </p>
            {unsavedChanges && (
              <Badge variant="secondary" className="mt-2">
                ⚡ יש שינויים שלא נשמרו
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadData} size="sm" className="font-assistant">
              <RefreshCw className="w-4 h-4 mr-1" />
              רענן
            </Button>
            <Button onClick={handleAddClient} className="font-assistant">
              <Plus className="w-4 h-4 mr-2" />
              לקוח חדש
            </Button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8"
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="flex items-center p-4">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-blue-900">{stats.totalClients}</p>
                <p className="text-xs text-blue-700">סה״כ לקוחות</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="flex items-center p-4">
              <div className="h-8 w-8 rounded-full bg-green-600 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-white"></div>
              </div>
              <div className="mr-4">
                <p className="text-2xl font-bold text-green-900">{stats.activeClients}</p>
                <p className="text-xs text-green-700">לקוחות פעילים</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="flex items-center p-4">
              <DollarSign className="h-8 w-8 text-purple-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-purple-900">
                  {stats.totalSavings.toLocaleString()}₪
                </p>
                <p className="text-xs text-purple-700">חיסכון חודשי</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="flex items-center p-4">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="mr-4">
                <p className="text-2xl font-bold text-orange-900">
                  {stats.avgSavingsPerClient.toLocaleString()}₪
                </p>
                <p className="text-xs text-orange-700">ממוצע לקוח</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
            <CardContent className="flex items-center p-4">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="h-8 w-8 text-pink-600"
              >
                📸
              </motion.div>
              <div className="mr-4">
                <p className="text-2xl font-bold text-pink-900">{stats.totalImages}</p>
                <p className="text-xs text-pink-700">תמונות נוצרו</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AdminClientList
            clients={clients}
            onEdit={handleEditClient}
            onDelete={handleDeleteClient}
            onViewImages={handleViewImages}
          />
        </motion.div>

        {/* Modals */}
        <AdminClientEditor
          isOpen={showEditor}
          onClose={() => setShowEditor(false)}
          onSave={handleSaveClient}
          editingClient={editingClient}
        />

        <AdminClientImages
          isOpen={showImages}
          onClose={() => setShowImages(false)}
          client={selectedClient}
          images={selectedClientImages}
          onAddImage={handleAddImage}
          onUpdateImage={handleUpdateImage}
          onDeleteImage={handleDeleteImage}
        />
      </div>
    </div>
  );
};

export default AdminClientsPage;