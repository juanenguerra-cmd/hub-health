import { useApp } from '@/contexts/AppContext';
import { Bell, Search, HelpCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AppBreadcrumbs } from '@/components/Breadcrumbs';

interface AppHeaderProps {
  onMenuClick?: () => void;
}

export function AppHeader({ onMenuClick }: AppHeaderProps) {
  const { facilityName, sessions, qaActions } = useApp();

  const overdueCount = qaActions.filter((a) => {
    const due = (a.dueDate || '').slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return due && due < today && a.status !== 'complete';
  }).length;

  return (
    <header className="bg-card border-b border-border shrink-0 px-4 lg:px-6 py-3 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-4 min-w-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
            <Menu className="w-5 h-5" />
          </Button>

          <div className="hidden md:flex items-center gap-3 bg-muted/50 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search sessions, actions..."
              className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0 w-64"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <Badge variant="secondary" className="font-normal">
              {sessions.filter((s) => s.header?.status === 'complete').length} sessions
            </Badge>
            {overdueCount > 0 && (
              <Badge variant="destructive" className="font-normal">
                {overdueCount} overdue
              </Badge>
            )}
          </div>

          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            {overdueCount > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full" />}
          </Button>

          <Button variant="ghost" size="icon">
            <HelpCircle className="w-5 h-5" />
          </Button>

          <div className="hidden lg:block pl-3 border-l border-border">
            <p className="text-sm font-medium">{facilityName}</p>
            <p className="text-xs text-muted-foreground">Admin</p>
          </div>
        </div>
      </div>

      <div className="hidden md:block">
        <AppBreadcrumbs />
      </div>
    </header>
  );
}
