import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  trend?: { value: string; direction: 'up' | 'down' | 'neutral' };
  subtitle?: string;
  className?: string;
}

export function KpiCard({ label, value, icon, status = 'neutral', trend, subtitle, className }: KpiCardProps) {
  const statusClasses = {
    success: 'kpi-card-success',
    warning: 'kpi-card-warning',
    error: 'kpi-card-error',
    neutral: ''
  };

  const TrendIcon = trend?.direction === 'up' ? TrendingUp : 
                   trend?.direction === 'down' ? TrendingDown : Minus;
  
  const trendColorClass = trend?.direction === 'up' ? 'text-success' : 
                          trend?.direction === 'down' ? 'text-error' : 'text-muted-foreground';

  return (
    <div className={cn('kpi-card', statusClasses[status], className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn('flex items-center gap-1 mt-1', trendColorClass)}>
              <TrendIcon className="w-3 h-3" />
              <span className="text-xs font-medium">{trend.value}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="text-muted-foreground/50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

interface KpiGridProps {
  children: ReactNode;
  className?: string;
}

export function KpiGrid({ children, className }: KpiGridProps) {
  return (
    <div className={cn('grid grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {children}
    </div>
  );
}
