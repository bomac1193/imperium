import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string;
  trend?: string;
  trendPositive?: boolean;
  accent?: boolean;
  action?: React.ReactNode;
  className?: string;
}

export function StatCard({
  label,
  value,
  trend,
  trendPositive,
  accent,
  action,
  className,
}: StatCardProps) {
  return (
    <div className={cn('card p-6', accent && 'border-l-2 border-l-accent', className)}>
      <div className="flex items-start justify-between mb-4">
        <span className="overline">{label}</span>
        {action}
      </div>
      <p className={cn('text-heading-lg font-mono', accent && 'text-accent')}>
        {value}
      </p>
      {trend && (
        <p className={cn(
          'text-caption mt-1',
          trendPositive ? 'text-success' : 'text-gray-500'
        )}>
          {trend}
        </p>
      )}
    </div>
  );
}
