import { AlertTriangle, Clock, Package, ArrowRight } from 'lucide-react';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface AlertsPanelProps {
  notifications: Notification[];
}

const AlertsPanel = ({ notifications }: AlertsPanelProps) => {
  const priorityConfig = {
    critical: { 
      bg: 'bg-destructive/10 border-destructive/30', 
      icon: 'bg-destructive text-destructive-foreground',
      dot: 'bg-destructive'
    },
    high: { 
      bg: 'bg-warning/10 border-warning/30', 
      icon: 'bg-warning text-warning-foreground',
      dot: 'bg-warning'
    },
    medium: { 
      bg: 'bg-info/10 border-info/30', 
      icon: 'bg-info text-info-foreground',
      dot: 'bg-info'
    },
    low: { 
      bg: 'bg-muted border-border', 
      icon: 'bg-muted text-muted-foreground',
      dot: 'bg-muted-foreground'
    },
  };

  const typeIcon = {
    'low-stock': Package,
    'expiry-warning': Clock,
    'emergency-request': AlertTriangle,
    'transfer-request': ArrowRight,
    'system': AlertTriangle,
  };

  const unreadNotifications = notifications.filter(n => !n.isRead);

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Active Alerts</h3>
          <p className="text-sm text-muted-foreground">
            {unreadNotifications.length} unread alert{unreadNotifications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="text-primary">
          Mark all read
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.slice(0, 4).map((notification) => {
          const Icon = typeIcon[notification.type];
          const config = priorityConfig[notification.priority];

          return (
            <div 
              key={notification.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-sm",
                config.bg,
                !notification.isRead && "ring-1 ring-inset ring-primary/20"
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                  config.icon
                )}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className={cn(
                      "text-sm font-medium",
                      !notification.isRead ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {notification.title}
                    </h4>
                    {!notification.isRead && (
                      <div className={cn("w-2 h-2 rounded-full", config.dot)} />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {notification.message}
                  </p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    {formatTimeAgo(notification.createdAt)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {notifications.length > 4 && (
        <Button variant="outline" className="w-full mt-4" size="sm">
          View all {notifications.length} alerts
        </Button>
      )}
    </div>
  );
};

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default AlertsPanel;
