import { useState, useEffect, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Image, 
  Tag, 
  Settings, 
  MessageSquare, 
  HelpCircle,
  LogOut,
  Menu,
  X,
  Users,
  FileText
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, isAdmin, isLoading, signOut } = useSupabaseAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && (!user || !isAdmin)) {
      // Prevent redirect loops: only redirect if not already on login
      if (location.pathname !== '/admin/login') {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [user, isAdmin, isLoading, navigate, location.pathname]);

  const handleLogout = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navigation = [
    { name: 'סקירה כללית', href: '/admin/dashboard', icon: Home },
    { name: 'פתרונות עסקיים', href: '/admin/solutions', icon: Settings },
    { name: 'פתרונות ויזואליים', href: '/admin/visualSolutions', icon: Image },
    { name: 'שווקי מזון', href: '/admin/markets', icon: Tag },
    { name: 'המלצות לקוחות', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'ניהול לקוחות', href: '/admin/clients', icon: Users },
  ];

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
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/30 flex" dir="rtl">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-black bg-opacity-50" 
            onClick={() => setSidebarOpen(false)} 
          />
          <div className="fixed right-0 top-0 h-full w-64 bg-background shadow-lg">
            <SidebarContent 
              navigation={navigation} 
              onLogout={handleLogout}
              currentPath={location.pathname}
              onClose={() => setSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col">
        <SidebarContent 
          navigation={navigation} 
          onLogout={handleLogout}
          currentPath={location.pathname}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-background shadow-sm border-b border-border">
          <div className="flex justify-between items-center px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-foreground font-assistant">{title}</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>
        </header>

        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  navigation: any[];
  onLogout: () => void;
  currentPath: string;
  onClose?: () => void;
}

function SidebarContent({ navigation, onLogout, currentPath, onClose }: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full bg-background border-l border-border">
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground font-assistant">Food Vision Admin</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-2 rounded-md text-muted-foreground hover:text-foreground"
          >
            <X size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 py-4 space-y-1">
        {navigation.map((item) => {
          const isActive = currentPath === item.href;
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${
                isActive 
                  ? 'bg-primary/10 text-primary' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              }`}
            >
              <item.icon className="ml-3 h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start font-assistant"
        >
          <LogOut className="ml-3 h-5 w-5" />
          התנתק
        </Button>
      </div>
    </div>
  );
}