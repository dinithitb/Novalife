import { BloodGroup } from '@/types';
import { cn } from '@/lib/utils';

interface BloodStockChartProps {
  data: Record<BloodGroup, number>;
}

const BloodStockChart = ({ data }: BloodStockChartProps) => {
  const bloodGroups: BloodGroup[] = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];
  const maxValue = Math.max(...Object.values(data), 1);

  const getStockLevel = (count: number) => {
    if (count === 0) return 'critical';
    if (count < 3) return 'low';
    if (count < 6) return 'medium';
    return 'good';
  };

  const stockColors = {
    critical: 'bg-destructive',
    low: 'bg-warning',
    medium: 'bg-info',
    good: 'bg-success',
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Blood Stock Levels</h3>
          <p className="text-sm text-muted-foreground">Available units by blood group</p>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-success" />
            <span className="text-muted-foreground">Good (6+)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-warning" />
            <span className="text-muted-foreground">Low (1-5)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-destructive" />
            <span className="text-muted-foreground">Critical (0)</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-8 gap-3">
        {bloodGroups.map((group) => {
          const count = data[group];
          const level = getStockLevel(count);
          const height = count === 0 ? 8 : (count / maxValue) * 100;

          return (
            <div key={group} className="flex flex-col items-center gap-2">
              <div className="relative h-32 w-full flex items-end justify-center">
                <div 
                  className={cn(
                    "w-full max-w-[40px] rounded-t-lg transition-all duration-500",
                    stockColors[level]
                  )}
                  style={{ height: `${Math.max(height, 8)}%` }}
                />
              </div>
              <div className="text-center">
                <p className="font-bold text-foreground">{group}</p>
                <p className={cn(
                  "text-sm font-medium",
                  level === 'critical' && "text-destructive",
                  level === 'low' && "text-warning",
                  level === 'medium' && "text-info",
                  level === 'good' && "text-success"
                )}>
                  {count}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BloodStockChart;
