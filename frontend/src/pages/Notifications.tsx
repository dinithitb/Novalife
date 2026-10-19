import { Bell, Check, Trash2, AlertTriangle, Clock, Package, ArrowRight, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Notification } from '@/types';
import { cn } from '@/lib/utils';
import { useNotifications, useMarkNotificationRead } from '@/hooks/api';
import { useToast } from '@/hooks/use-toast';

const priorityConfig = {
  critical: { className: 'border-l-destructive bg-destructive/5', dot: 'bg-destructive', label: 'Critical' },
  high: { className: 'border-l-warning bg-warning/5', dot: 'bg-warning', label: 'High' },
  medium: { className: 'border-l-info bg-info/5', dot: 'bg-info', label: 'Medium' },
  low: { className: 'border-l-muted-foreground bg-muted/30', dot: 'bg-muted-foreground', label: 'Low' },
};

const typeIcon: Record<string, any> = {
  'emergency-request': AlertTriangle,
  'low-stock': Package,
  'expiry-warning': Clock,
  'transfer-request': ArrowRight,
  'system': Bell,
};

const Notifications = () => {
  const { data: notifications = [], isLoading } = useNotifications();
  const markRead = useMarkNotificationRead();
  const { toast } = useToast();

  const unread = notifications.filter(n => !n.isRead);
  const read = notifications.filter(n => n.isRead);

  const handleMarkRead = async (id: string) => {
    try {
      await markRead.mutateAsync(id);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e.message });
    }
  };

  const NotificationCard = ({ n }: { n: Notification }) => {
    const cfg = priorityConfig[n.priority];
    const Icon = typeIcon[n.type] ?? Bell;
    return (
      <div className={cn(
        'p-4 rounded-lg border-l-4 transition-colors',
        cfg.className,
        !n.isRead && 'ring-1 ring-inset ring-border'
      )}>
        <div className="flex items-start gap-3">
          <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', cfg.dot)} />
          <Icon className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <p className={cn('text-sm font-medium', !n.isRead ? 'text-foreground' : 'text-muted-foreground')}>
                {n.title}
              </p>
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{n.message}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium',
                n.priority === 'critical' && 'bg-destructive/10 text-destructive',
                n.priority === 'high' && 'bg-warning/10 text-warning',
                n.priority === 'medium' && 'bg-info/10 text-info',
                n.priority === 'low' && 'bg-muted text-muted-foreground',
              )}>
                {cfg.label}
              </span>
              {!n.isRead && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs"
                  onClick={() => handleMarkRead(n.id)}
                >
                  <Check className="w-3 h-3 mr-1" /> Mark read
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen">
      <Header
        title="Notifications"
        subtitle="Stay on top of alerts and system events"
        actions={
          unread.length > 0 ? (
            <Button variant="outline" onClick={() => unread.forEach(n => handleMarkRead(n.id))}>
              <Check className="w-4 h-4 mr-2" /> Mark all read
            </Button>
          ) : undefined
        }
      />

      <div className="p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <Tabs defaultValue="unread">
            <TabsList className="mb-6">
              <TabsTrigger value="unread">
                Unread {unread.length > 0 && (
                  <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5">
                    {unread.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="unread" className="space-y-3">
              {unread.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>All caught up — no unread notifications.</p>
                </div>
              ) : (
                unread.map(n => <NotificationCard key={n.id} n={n} />)
              )}
            </TabsContent>

            <TabsContent value="all" className="space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No notifications yet.</p>
                </div>
              ) : (
                notifications.map(n => <NotificationCard key={n.id} n={n} />)
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default Notifications;
