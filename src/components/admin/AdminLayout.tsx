import { ReactNode } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  Users, 
  MessageSquare, 
  Settings, 
  LogOut, 
  HelpCircle,
  Menu
} from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export function AdminLayout({ children, title }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { signOut } = useSupabaseAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const navigationItems = [
    { name: 'סקירה כללית', href: '/admin/dashboard', icon: Home },
    { name: 'לקוחות', href: '/admin/clients', icon: Users },
    { name: 'המלצות', href: '/admin/testimonials', icon: MessageSquare },
    { name: 'שאלות ותשובות', href: '/admin/faq', icon: HelpCircle },
    { name: 'הגדרות', href: '/admin/settings', icon: Settings },
  ];

  const NavigationItems = () => (
    <>
      {navigationItems.map((item) => {
        const IconComponent = item.icon;
        const isActive = location.pathname === item.href;
        
        return (
          <NavLink
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            <IconComponent className="h-4 w-4" />
            {item.name}
          </NavLink>
        );
      })}
    </>
  );

  return (
    <div className="min-h-screen bg-background" dir="rtl">
      <div className="flex">
        {/* Desktop Sidebar */}
        <div className="hidden md:flex md:w-64 md:flex-col">
          <div className="flex flex-col flex-grow pt-5 pb-4 overflow-y-auto bg-card border-l">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-lg font-semibold text-foreground font-assistant">
                Food Vision Admin
              </h2>
            </div>
            <div className="mt-5 flex-1 flex flex-col">
              <nav className="flex-1 px-2 pb-4 space-y-1">
                <NavigationItems />
              </nav>
              <div className="px-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4 ml-3" />
                  יציאה
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-w-0">
          {/* Mobile Header */}
          <div className="md:hidden bg-card border-b px-4 py-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold font-assistant">Food Vision Admin</h2>
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="mt-5 flex flex-1 flex-col">
                    <nav className="flex-1 space-y-1">
                      <NavigationItems />
                    </nav>
                    <div className="pt-4">
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-muted-foreground hover:text-foreground"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 ml-3" />
                        יציאה
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Page Content */}
          <main className="flex-1 relative overflow-y-auto focus:outline-none">
            <div className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
                {title && (
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-foreground font-assistant">
                      {title}
                    </h1>
                  </div>
                )}
                {children}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}