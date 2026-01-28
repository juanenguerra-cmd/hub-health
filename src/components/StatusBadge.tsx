import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  const statusClasses = {
    success: 'status-success',
    warning: 'status-warning',
    error: 'status-error',
    info: 'bg-primary/10 text-primary border border-primary/20'
  };

  return (
    <span className={cn('status-badge', statusClasses[status], className)}>
      {children}
    </span>
  );
}

interface ComplianceIndicatorProps {
  rate: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ComplianceIndicator({ rate, showLabel = true, size = 'md' }: ComplianceIndicatorProps) {
  const status = rate >= 90 ? 'success' : rate >= 70 ? 'warning' : 'error';
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  return (
    <StatusBadge status={status} className={sizeClasses[size]}>
      {rate}%{showLabel && ' Compliance'}
    </StatusBadge>
  );
}
