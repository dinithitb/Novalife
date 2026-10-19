import { Droplets, Users, AlertTriangle, ClipboardList, Activity, Loader2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import MetricCard from '@/components/dashboard/MetricCard';
import BloodStockChart from '@/components/dashboard/BloodStockChart';
import RecentRequests from '@/components/dashboard/RecentRequests';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import QuickActions from '@/components/dashboard/QuickActions';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useDashboardStats, useRequests, useNotifications, useDonors } from '@/hooks/api';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: requests = [] } = useRequests();
  const { data: notifications = [] } = useNotifications();
  const { data: donors = [] } = useDonors();

  return (
    <div className="min-h-screen">
      <Header
        title="Dashboard"
        subtitle={`Welcome back, ${user?.firstName}! Here's your blood bank overview.`}
        actions={
          <Button className="bg-gradient-primary hover:opacity-90 text-primary-foreground">
            <Activity className="w-4 h-4 mr-2" />
            Emergency Mode
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {statsLoading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                title="Available Units"
                value={stats?.availableUnits ?? 0}
                subtitle={`of ${stats?.totalUnits ?? 0} total units`}
                icon={Droplets}
                variant="success"
              />
              <MetricCard
                title="Registered Donors"
                value={donors.length}
                subtitle="Active donors"
                icon={Users}
                variant="primary"
              />
              <MetricCard
                title="Pending Requests"
                value={stats?.pendingRequests ?? 0}
                subtitle={
                  (stats?.emergencyRequests ?? 0) > 0
                    ? `${stats!.emergencyRequests} emergency`
                    : 'No emergencies'
                }
                icon={ClipboardList}
                variant={(stats?.emergencyRequests ?? 0) > 0 ? 'destructive' : 'default'}
              />
              <MetricCard
                title="Expiring Soon"
                value={stats?.expiringUnits ?? 0}
                subtitle="Within 3 days"
                icon={AlertTriangle}
                variant={(stats?.expiringUnits ?? 0) > 5 ? 'warning' : 'default'}
              />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <BloodStockChart data={stats?.bloodGroupStats ?? {}} />
              </div>
              <div>
                <QuickActions />
              </div>
            </div>

            {/* Secondary Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentRequests requests={requests.slice(0, 5)} />
              <AlertsPanel notifications={notifications.slice(0, 5)} />
            </div>

            {/* Weekly Stats */}
            <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">Weekly Performance</h3>
                <p className="text-sm text-muted-foreground">Donations and distributions this week</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-4 rounded-lg bg-success/5 border border-success/20">
                  <p className="text-3xl font-bold text-success">{stats?.weeklyDonations ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Donations</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-info/5 border border-info/20">
                  <p className="text-3xl font-bold text-info">—</p>
                  <p className="text-sm text-muted-foreground mt-1">Units Issued</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-3xl font-bold text-primary">
                    {requests.filter(r => r.status === 'fulfilled').length}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Requests Fulfilled</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-warning/5 border border-warning/20">
                  <p className="text-3xl font-bold text-warning">{stats?.todayDonations ?? 0}</p>
                  <p className="text-sm text-muted-foreground mt-1">Today's Donations</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
