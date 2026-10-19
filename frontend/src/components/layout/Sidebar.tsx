import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Droplets, ClipboardList, ArrowLeftRight,
  Building2, Bell, FileText, Settings, ChevronLeft, ChevronRight,
  Heart, LogOut, UserCog
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/context/SidebarContext';

const navigation = [
  { name: 'Dashboard',     href: '/',             icon: LayoutDashboard },
  { name: 'Donors',        href: '/donors',        icon: Users },
  { name: 'Inventory',     href: '/inventory',     icon: Droplets },
  { name: 'Requests',      href: '/requests',      icon: ClipboardList },
  { name: 'Transfers',     href: '/transfers',     icon: ArrowLeftRight },
  { name: 'Branches',      href: '/branches',      icon: Building2 },
  { name: 'Notifications', href: '/notifications', icon: Bell },
  { name: 'Reports',       href: '/reports',       icon: FileText },
  { name: 'Users',         href: '/users',         icon: UserCog, adminOnly: true },
];

const Sidebar = () => {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { user, logout } = useAuth();
  const { collapsed, setCollapsed } = useSidebar();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = user
    ? `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase()
    : '?';

  const visibleNav = navigation.filter(item => !item.adminOnly || user?.role === 'admin');

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-sidebar flex flex-col transition-all duration-300 z-50',
      collapsed ? 'w-20' : 'w-64'
    )}>
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow flex-shrink-0">
            <Heart className="w-5 h-5 text-primary-foreground fill-current" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in overflow-hidden">
              <h1 className="font-bold text-lg text-sidebar-foreground leading-tight">Novalife</h1>
              <p className="text-xs text-sidebar-foreground/60">Blood Bank System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              title={collapsed ? item.name : undefined}
              className={cn(
                'sidebar-item',
                isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
              {!collapsed && <span className="animate-fade-in">{item.name}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn(
          'flex items-center gap-3 p-2 rounded-lg bg-sidebar-accent/50',
          collapsed && 'justify-center'
        )}>
          <div className="w-9 h-9 rounded-full bg-gradient-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
            {initials}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-sidebar-foreground/60 capitalize">
                {user?.role?.replace(/-/g, ' ')}
              </p>
            </div>
          )}
        </div>

        {!collapsed && (
          <div className="flex gap-2 mt-3 animate-fade-in">
            <button
              onClick={() => navigate('/settings')}
              className="flex-1 sidebar-item sidebar-item-inactive justify-center py-2"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
              <span className="text-xs">Settings</span>
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sidebar-item sidebar-item-inactive justify-center py-2 hover:text-destructive"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-xs">Logout</span>
            </button>
          </div>
        )}

        {collapsed && (
          <div className="flex flex-col gap-1 mt-2">
            <button onClick={() => navigate('/settings')} className="w-full sidebar-item sidebar-item-inactive justify-center py-2" title="Settings">
              <Settings className="w-4 h-4" />
            </button>
            <button onClick={handleLogout} className="w-full sidebar-item sidebar-item-inactive justify-center py-2 hover:text-destructive" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </aside>
  );
};

export default Sidebar;
