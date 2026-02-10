import { Bell } from 'lucide-react';
import { useWorkflowReminders } from '@/hooks/use-workflow-reminders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export function NotificationBell() {
  const { reminders, dismissReminder } = useWorkflowReminders();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Workflow reminders">
          <Bell className="w-5 h-5" />
          {reminders.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-destructive" />}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold">Workflow reminders</p>
            <Badge variant="secondary">{reminders.length}</Badge>
          </div>
          {reminders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active reminders.</p>
          ) : (
            reminders.map((reminder) => (
              <div key={reminder.id} className="rounded border border-border p-2 text-sm space-y-1">
                <p className="font-medium">{reminder.title}</p>
                <p className="text-xs text-muted-foreground">{reminder.message}</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={reminder.action}>{reminder.actionLabel}</Button>
                  <Button size="sm" variant="ghost" onClick={() => dismissReminder(reminder.id)}>Dismiss</Button>
                </div>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
