import { SidebarProvider, useSidebar } from '@/context/SidebarContext';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

function LayoutInner({ children }: MainLayoutProps) {
  const { collapsed } = useSidebar();
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className={cn(
        'transition-all duration-300 min-h-screen',
        collapsed ? 'pl-20' : 'pl-64'
      )}>
        {children}
      </main>
    </div>
  );
}

const MainLayout = ({ children }: MainLayoutProps) => (
  <SidebarProvider>
    <LayoutInner>{children}</LayoutInner>
  </SidebarProvider>
);

export default MainLayout;
