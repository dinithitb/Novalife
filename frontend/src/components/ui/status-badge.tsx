import { cn } from '@/lib/utils';

type StatusVariant = 
  | 'available' 
  | 'reserved' 
  | 'issued' 
  | 'expired' 
  | 'discarded' 
  | 'in-transit'
  | 'eligible'
  | 'deferred'
  | 'pending'
  | 'approved'
  | 'fulfilled'
  | 'rejected'
  | 'emergency'
  | 'urgent'
  | 'routine';

interface StatusBadgeProps {
  status: StatusVariant;
  label?: string;
  className?: string;
}

const statusConfig: Record<StatusVariant, { bg: string; text: string; label: string }> = {
  available: { bg: 'bg-success/10', text: 'text-success', label: 'Available' },
  reserved: { bg: 'bg-info/10', text: 'text-info', label: 'Reserved' },
  issued: { bg: 'bg-primary/10', text: 'text-primary', label: 'Issued' },
  expired: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Expired' },
  discarded: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Discarded' },
  'in-transit': { bg: 'bg-warning/10', text: 'text-warning', label: 'In Transit' },
  eligible: { bg: 'bg-success/10', text: 'text-success', label: 'Eligible' },
  deferred: { bg: 'bg-warning/10', text: 'text-warning', label: 'Deferred' },
  pending: { bg: 'bg-warning/10', text: 'text-warning', label: 'Pending' },
  approved: { bg: 'bg-info/10', text: 'text-info', label: 'Approved' },
  fulfilled: { bg: 'bg-success/10', text: 'text-success', label: 'Fulfilled' },
  rejected: { bg: 'bg-destructive/10', text: 'text-destructive', label: 'Rejected' },
  emergency: { bg: 'bg-destructive', text: 'text-destructive-foreground', label: 'Emergency' },
  urgent: { bg: 'bg-warning', text: 'text-warning-foreground', label: 'Urgent' },
  routine: { bg: 'bg-muted', text: 'text-muted-foreground', label: 'Routine' },
};

const StatusBadge = ({ status, label, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
      config.bg,
      config.text,
      className
    )}>
      {label || config.label}
    </span>
  );
};

export { StatusBadge };
