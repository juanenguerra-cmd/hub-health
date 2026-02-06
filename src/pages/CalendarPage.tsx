import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { todayYMD } from '@/lib/calculations';
import { getDueStatus } from '@/lib/due-status';
import { ChevronLeft, ChevronRight, Calendar, GraduationCap, ClipboardCheck, AlertTriangle, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CalendarQuickActionModal } from '@/components/calendar/CalendarQuickActionModal';

interface CalendarEvent {
  id: string;
  type: 'education' | 'audit' | 'reaudit' | 'followup';
  title: string;
  date: string;
  status: 'planned' | 'completed' | 'overdue';
  unit?: string;
  linkedId?: string;
}

export function CalendarPage() {
  const { sessions, eduSessions, qaActions } = useApp();
  const today = todayYMD();
  
  const [currentMonth, setCurrentMonth] = useState(() => today.slice(0, 7));
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [quickActionOpen, setQuickActionOpen] = useState(false);

  // Parse month for calendar grid
  const [year, month] = currentMonth.split('-').map(Number);
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday

  // Build calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    const evts: CalendarEvent[] = [];
    
    // Education sessions
    for (const edu of eduSessions) {
      const date = edu.status === 'completed' 
        ? (edu.completedDate || edu.scheduledDate || '')
        : (edu.scheduledDate || '');
      if (!date) continue;
      
      const { isOverdue } = getDueStatus(today, date);
      
      evts.push({
        id: edu.id,
        type: 'education',
        title: edu.topic,
        date: date.slice(0, 10),
        status: edu.status === 'completed' ? 'completed' : isOverdue ? 'overdue' : 'planned',
        unit: edu.unit,
        linkedId: edu.linkedQaActionId
      });
    }
    
    // Audit sessions
    for (const sess of sessions) {
      if (!sess.header?.auditDate) continue;
      
      evts.push({
        id: sess.id,
        type: 'audit',
        title: sess.templateTitle,
        date: sess.header.auditDate,
        status: sess.header.status === 'complete' ? 'completed' : 'planned',
        unit: sess.header.unit
      });
    }
    
    // QA Actions with re-audit due dates
    for (const qa of qaActions) {
      if (qa.reAuditDueDate) {
        const isComplete = !!qa.reAuditCompletedAt;
        const { isOverdue } = getDueStatus(today, qa.reAuditDueDate);
        
        evts.push({
          id: `reaudit_${qa.id}`,
          type: 'reaudit',
          title: `Re-audit: ${qa.issue}`,
          date: qa.reAuditDueDate,
          status: isComplete ? 'completed' : isOverdue ? 'overdue' : 'planned',
          unit: qa.unit,
          linkedId: qa.id
        });
      }
      
      // Due dates as follow-ups
      if (qa.dueDate && qa.status !== 'complete') {
        const { isOverdue } = getDueStatus(today, qa.dueDate);
        
        evts.push({
          id: `followup_${qa.id}`,
          type: 'followup',
          title: `Follow-up: ${qa.issue}`,
          date: qa.dueDate,
          status: isOverdue ? 'overdue' : 'planned',
          unit: qa.unit,
          linkedId: qa.id
        });
      }
    }
    
    return evts;
  }, [sessions, eduSessions, qaActions, today]);

  // Events by date for quick lookup
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const evt of events) {
      if (!map[evt.date]) map[evt.date] = [];
      map[evt.date].push(evt);
    }
    return map;
  }, [events]);

  // Events for selected date
  const selectedEvents = eventsByDate[selectedDate] || [];

  // Navigation
  const prevMonth = () => {
    const d = new Date(year, month - 2, 1);
    setCurrentMonth(d.toISOString().slice(0, 7));
  };

  const nextMonth = () => {
    const d = new Date(year, month, 1);
    setCurrentMonth(d.toISOString().slice(0, 7));
  };

  const goToToday = () => {
    setCurrentMonth(today.slice(0, 7));
    setSelectedDate(today);
  };

  // Build calendar grid
  const calendarDays: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
  
  // Previous month days
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = new Date(year, month - 2, prevMonthLastDay - i);
    calendarDays.push({
      date: d.toISOString().slice(0, 10),
      day: prevMonthLastDay - i,
      isCurrentMonth: false,
      isToday: false
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month - 1, day);
    const dateStr = d.toISOString().slice(0, 10);
    calendarDays.push({
      date: dateStr,
      day,
      isCurrentMonth: true,
      isToday: dateStr === today
    });
  }
  
  // Next month days to fill grid (6 rows)
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    const d = new Date(year, month, day);
    calendarDays.push({
      date: d.toISOString().slice(0, 10),
      day,
      isCurrentMonth: false,
      isToday: false
    });
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'education': return <GraduationCap className="w-3 h-3" />;
      case 'audit': return <ClipboardCheck className="w-3 h-3" />;
      case 'reaudit': return <ClipboardCheck className="w-3 h-3" />;
      case 'followup': return <AlertTriangle className="w-3 h-3" />;
      default: return <Calendar className="w-3 h-3" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">
            View audits, education, and follow-ups
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>Today</Button>
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="font-medium min-w-[140px] text-center">
            {monthNames[month - 1]} {year}
          </span>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Grid */}
        <Card className="lg:col-span-2">
          <CardContent className="pt-4">
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(({ date, day, isCurrentMonth, isToday }) => {
                const dayEvents = eventsByDate[date] || [];
                const hasOverdue = dayEvents.some(e => e.status === 'overdue');
                const hasPlanned = dayEvents.some(e => e.status === 'planned');
                const hasCompleted = dayEvents.some(e => e.status === 'completed');
                const isSelected = date === selectedDate;
                
                return (
                  <div
                    key={date}
                    onClick={() => setSelectedDate(date)}
                    className={cn(
                      "min-h-[80px] p-1 border rounded cursor-pointer transition-colors",
                      isCurrentMonth ? "bg-card" : "bg-muted/30",
                      isSelected && "ring-2 ring-primary",
                      isToday && "border-primary",
                      "hover:bg-muted/50"
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className={cn(
                        "text-sm font-medium",
                        !isCurrentMonth && "text-muted-foreground",
                        isToday && "bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center"
                      )}>
                        {day}
                      </span>
                    </div>
                    
                    {/* Event indicators */}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {hasOverdue && (
                        <span className="w-2 h-2 rounded-full bg-error" title="Overdue" />
                      )}
                      {hasPlanned && (
                        <span className="w-2 h-2 rounded-full bg-warning" title="Planned" />
                      )}
                      {hasCompleted && (
                        <span className="w-2 h-2 rounded-full bg-success" title="Completed" />
                      )}
                    </div>
                    
                    {/* Event count */}
                    {dayEvents.length > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-muted-foreground">
                          {dayEvents.length} item{dayEvents.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 mt-4 pt-4 border-t text-xs">
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-success" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-warning" />
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-error" />
                <span>Overdue</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Events */}
        <Card>
          <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { 
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </CardTitle>
              <CardDescription>
                {selectedEvents.length} scheduled item{selectedEvents.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <Button 
              size="sm" 
              onClick={() => setQuickActionOpen(true)}
              className="gap-1"
            >
              <Plus className="w-4 h-4" />
              Quick Action
            </Button>
          </CardHeader>
          <CardContent>
            {selectedEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activities scheduled</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setQuickActionOpen(true)}
                >
                  Add Activity
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedEvents.map(evt => (
                  <div 
                    key={evt.id} 
                    className={cn(
                      "p-3 rounded-lg border",
                      evt.status === 'completed' && "bg-success/5 border-success/30",
                      evt.status === 'planned' && "bg-warning/5 border-warning/30",
                      evt.status === 'overdue' && "bg-error/5 border-error/30"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <div className={cn(
                        "p-1.5 rounded",
                        evt.type === 'education' && "bg-primary/10 text-primary",
                        evt.type === 'audit' && "bg-success/10 text-success",
                        evt.type === 'reaudit' && "bg-warning/10 text-warning",
                        evt.type === 'followup' && "bg-error/10 text-error"
                      )}>
                        {getEventIcon(evt.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{evt.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-muted-foreground capitalize">
                            {evt.type}
                          </span>
                          {evt.unit && (
                            <span className="text-xs text-muted-foreground">
                              • Unit {evt.unit}
                            </span>
                          )}
                        </div>
                      </div>
                      <StatusBadge 
                        status={
                          evt.status === 'completed' ? 'success' : 
                          evt.status === 'overdue' ? 'error' : 'warning'
                        }
                      >
                        {evt.status === 'completed' ? '✓' : evt.status === 'overdue' ? '!' : '○'}
                      </StatusBadge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action Modal */}
      <CalendarQuickActionModal
        open={quickActionOpen}
        onOpenChange={setQuickActionOpen}
        selectedDate={selectedDate}
        eventsForDate={selectedEvents}
      />
    </div>
  );
}
