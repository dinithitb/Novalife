import { Clock, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HospitalRequest } from '@/types';
import { cn } from '@/lib/utils';

interface RecentRequestsProps {
  requests: HospitalRequest[];
}

const RecentRequests = ({ requests }: RecentRequestsProps) => {
  const urgencyConfig = {
    emergency: { color: 'bg-destructive text-destructive-foreground', icon: AlertTriangle },
    urgent: { color: 'bg-warning text-warning-foreground', icon: Clock },
    routine: { color: 'bg-muted text-muted-foreground', icon: Clock },
  };

  const statusConfig = {
    pending: { color: 'bg-warning/10 text-warning border-warning/30', label: 'Pending' },
    approved: { color: 'bg-info/10 text-info border-info/30', label: 'Approved' },
    fulfilled: { color: 'bg-success/10 text-success border-success/30', label: 'Fulfilled' },
    'partially-fulfilled': { color: 'bg-warning/10 text-warning border-warning/30', label: 'Partial' },
    rejected: { color: 'bg-destructive/10 text-destructive border-destructive/30', label: 'Rejected' },
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Recent Requests</h3>
          <p className="text-sm text-muted-foreground">Latest blood requests from hospitals</p>
        </div>
        <Button variant="outline" size="sm">View All</Button>
      </div>

      <div className="space-y-4">
        {requests.map((request) => {
          const UrgencyIcon = urgencyConfig[request.urgency].icon;
          
          return (
            <div 
              key={request.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200 hover:shadow-md",
                request.urgency === 'emergency' && "border-destructive/30 bg-destructive/5"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn(
                      "status-badge",
                      urgencyConfig[request.urgency].color
                    )}>
                      <UrgencyIcon className="w-3 h-3 mr-1" />
                      {request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}
                    </span>
                    <Badge variant="outline" className={statusConfig[request.status].color}>
                      {statusConfig[request.status].label}
                    </Badge>
                  </div>
                  <h4 className="font-medium text-foreground truncate">{request.hospitalName}</h4>
                  <p className="text-sm text-muted-foreground">
                    {request.quantity} units of {request.bloodGroup} {request.component}
                  </p>
                  {request.notes && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{request.notes}</p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentRequests;
