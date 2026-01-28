import * as React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
}

const StatusBadge = React.forwardRef<HTMLSpanElement, StatusBadgeProps>(
  ({ status, children, className, ...props }, ref) => {
    const statusClasses = {
      success: 'status-success',
      warning: 'status-warning',
      error: 'status-error',
      info: 'bg-primary/10 text-primary border border-primary/20'
    };

    return (
      <span 
        ref={ref}
        className={cn('status-badge', statusClasses[status], className)}
        {...props}
      >
        {children}
      </span>
    );
  }
);
StatusBadge.displayName = 'StatusBadge';

interface ComplianceIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
  rate: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ComplianceIndicator = React.forwardRef<HTMLSpanElement, ComplianceIndicatorProps>(
  ({ rate, showLabel = true, size = 'md', className, ...props }, ref) => {
    const status = rate >= 90 ? 'success' : rate >= 70 ? 'warning' : 'error';
    const sizeClasses = {
      sm: 'text-xs px-2 py-0.5',
      md: 'text-sm px-2.5 py-1',
      lg: 'text-base px-3 py-1.5'
    };

    return (
      <StatusBadge 
        ref={ref}
        status={status} 
        className={cn(sizeClasses[size], className)}
        {...props}
      >
        {rate}%{showLabel && ' Compliance'}
      </StatusBadge>
    );
  }
);
ComplianceIndicator.displayName = 'ComplianceIndicator';

export { StatusBadge, ComplianceIndicator };
