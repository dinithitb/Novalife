import { Plus, UserPlus, Droplets, ClipboardPlus, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface QuickAction {
  icon: React.ElementType;
  label: string;
  description: string;
  variant: 'primary' | 'secondary' | 'success' | 'warning';
  onClick?: () => void;
}

const QuickActions = () => {
  const actions: QuickAction[] = [
    {
      icon: UserPlus,
      label: 'Register Donor',
      description: 'Add new donor',
      variant: 'primary',
    },
    {
      icon: Droplets,
      label: 'Add Blood Unit',
      description: 'Record donation',
      variant: 'success',
    },
    {
      icon: ClipboardPlus,
      label: 'New Request',
      description: 'Hospital request',
      variant: 'warning',
    },
    {
      icon: ArrowLeftRight,
      label: 'Transfer Units',
      description: 'Between branches',
      variant: 'secondary',
    },
  ];

  const variantStyles = {
    primary: 'bg-primary/10 text-primary hover:bg-primary/20 border-primary/20',
    secondary: 'bg-secondary/10 text-secondary hover:bg-secondary/20 border-secondary/20',
    success: 'bg-success/10 text-success hover:bg-success/20 border-success/20',
    warning: 'bg-warning/10 text-warning-foreground hover:bg-warning/20 border-warning/20',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-foreground">Quick Actions</h3>
        <p className="text-sm text-muted-foreground">Common tasks</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={action.onClick}
            className={cn(
              "p-4 rounded-lg border transition-all duration-200 text-left group",
              variantStyles[action.variant]
            )}
          >
            <action.icon className="w-5 h-5 mb-2 transition-transform group-hover:scale-110" />
            <p className="font-medium text-sm">{action.label}</p>
            <p className="text-xs opacity-70">{action.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;
