import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from '@/components/StatusBadge';
import { todayYMD, daysBetween } from '@/lib/calculations';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  User,
  Calendar,
  ClipboardCheck,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FollowUpItem {
  id: string;
  type: 'qa' | 'reaudit' | 'education';
  title: string;
  details: string;
  unit: string;
  owner: string;
  dueDate: string;
  status: 'overdue' | 'due-soon' | 'upcoming';
  daysUntilDue: number;
  linkedId: string;
}

export function FollowUpPage() {
  const { qaActions, eduSessions, setActiveTab } = useApp();
  const today = todayYMD();
  
  const [activeQueue, setActiveQueue] = useState('overdue');
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');

  // Build follow-up queue
  const followUpItems = useMemo<FollowUpItem[]>(() => {
    const items: FollowUpItem[] = [];
    
    // QA Actions
    for (const qa of qaActions) {
      if (qa.status === 'complete') continue;
      if (!qa.dueDate) continue;
      
      const daysUntil = daysBetween(today, qa.dueDate);
      const isOverdue = qa.dueDate < today;
      const isDueSoon = !isOverdue && daysUntil <= 7;
      
      items.push({
        id: `qa_${qa.id}`,
        type: 'qa',
        title: qa.issue,
        details: `${qa.templateTitle} • Sample: ${qa.sample || 'N/A'}`,
        unit: qa.unit || '',
        owner: qa.owner || 'Unassigned',
        dueDate: qa.dueDate,
        status: isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'upcoming',
        daysUntilDue: isOverdue ? -daysBetween(qa.dueDate, today) : daysUntil,
        linkedId: qa.id
      });
      
      // Re-audit due dates
      if (qa.reAuditDueDate && !qa.reAuditCompletedAt) {
        const reDaysUntil = daysBetween(today, qa.reAuditDueDate);
        const reIsOverdue = qa.reAuditDueDate < today;
        const reIsDueSoon = !reIsOverdue && reDaysUntil <= 7;
        
        items.push({
          id: `reaudit_${qa.id}`,
          type: 'reaudit',
          title: `Re-audit: ${qa.issue}`,
          details: qa.templateTitle,
          unit: qa.unit || '',
          owner: qa.owner || 'Unassigned',
          dueDate: qa.reAuditDueDate,
          status: reIsOverdue ? 'overdue' : reIsDueSoon ? 'due-soon' : 'upcoming',
          daysUntilDue: reIsOverdue ? -daysBetween(qa.reAuditDueDate, today) : reDaysUntil,
          linkedId: qa.id
        });
      }
    }
    
    // Planned education sessions
    for (const edu of eduSessions) {
      if (edu.status === 'completed') continue;
      if (!edu.scheduledDate) continue;
      
      const daysUntil = daysBetween(today, edu.scheduledDate);
      const isOverdue = edu.scheduledDate < today;
      const isDueSoon = !isOverdue && daysUntil <= 7;
      
      items.push({
        id: `edu_${edu.id}`,
        type: 'education',
        title: edu.topic,
        details: `Instructor: ${edu.instructor || 'TBD'} • Audience: ${edu.audience || 'TBD'}`,
        unit: edu.unit || '',
        owner: edu.instructor || 'Unassigned',
        dueDate: edu.scheduledDate,
        status: isOverdue ? 'overdue' : isDueSoon ? 'due-soon' : 'upcoming',
        daysUntilDue: isOverdue ? -daysBetween(edu.scheduledDate, today) : daysUntil,
        linkedId: edu.id
      });
    }
    
    return items.sort((a, b) => a.daysUntilDue - b.daysUntilDue);
  }, [qaActions, eduSessions, today]);

  // Get unique owners and units
  const owners = useMemo(() => {
    const ownerSet = new Set<string>();
    followUpItems.forEach(item => ownerSet.add(item.owner));
    return ['All', ...Array.from(ownerSet).sort()];
  }, [followUpItems]);

  const units = useMemo(() => {
    const unitSet = new Set<string>();
    followUpItems.forEach(item => {
      if (item.unit) unitSet.add(item.unit);
    });
    return ['All', ...Array.from(unitSet).sort()];
  }, [followUpItems]);

  // Filter items
  const filteredItems = followUpItems.filter(item => {
    // Queue filter
    if (activeQueue === 'overdue' && item.status !== 'overdue') return false;
    if (activeQueue === 'due-soon' && item.status !== 'due-soon') return false;
    if (activeQueue === 'upcoming' && item.status === 'overdue') return false;
    
    // Owner filter
    if (ownerFilter !== 'All' && item.owner !== ownerFilter) return false;
    
    // Unit filter
    if (unitFilter !== 'All' && item.unit !== unitFilter) return false;
    
    // Search filter
    if (searchTerm) {
      const hay = `${item.title} ${item.details} ${item.owner} ${item.unit}`.toLowerCase();
      if (!hay.includes(searchTerm.toLowerCase())) return false;
    }
    
    return true;
  });

  // Counts for tabs
  const overdueCnt = followUpItems.filter(i => i.status === 'overdue').length;
  const dueSoonCnt = followUpItems.filter(i => i.status === 'due-soon').length;
  const upcomingCnt = followUpItems.filter(i => i.status === 'upcoming').length;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'qa': return <ClipboardCheck className="w-4 h-4" />;
      case 'reaudit': return <ClipboardCheck className="w-4 h-4" />;
      case 'education': return <User className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const navigateToItem = (item: FollowUpItem) => {
    if (item.type === 'qa' || item.type === 'reaudit') {
      setActiveTab('actions');
    } else if (item.type === 'education') {
      setActiveTab('education');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Follow-Up Queue</h1>
          <p className="text-muted-foreground">
            Track overdue and upcoming items requiring attention
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className={cn("cursor-pointer transition-all", activeQueue === 'overdue' && "ring-2 ring-error")}
              onClick={() => setActiveQueue('overdue')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-error">{overdueCnt}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-error/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={cn("cursor-pointer transition-all", activeQueue === 'due-soon' && "ring-2 ring-warning")}
              onClick={() => setActiveQueue('due-soon')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due Soon (≤7 days)</p>
                <p className="text-3xl font-bold text-warning">{dueSoonCnt}</p>
              </div>
              <Clock className="w-10 h-10 text-warning/30" />
            </div>
          </CardContent>
        </Card>
        
        <Card className={cn("cursor-pointer transition-all", activeQueue === 'upcoming' && "ring-2 ring-primary")}
              onClick={() => setActiveQueue('upcoming')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">All Upcoming</p>
                <p className="text-3xl font-bold">{upcomingCnt + dueSoonCnt}</p>
              </div>
              <Calendar className="w-10 h-10 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={ownerFilter} onValueChange={setOwnerFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Owner" />
              </SelectTrigger>
              <SelectContent>
                {owners.map(o => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={unitFilter} onValueChange={setUnitFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map(u => (
                  <SelectItem key={u} value={u}>{u}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Queue List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base capitalize">
            {activeQueue === 'due-soon' ? 'Due Soon' : activeQueue} Items
          </CardTitle>
          <CardDescription>
            {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''} requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">All clear!</p>
              <p>No {activeQueue} items at this time</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map(item => (
                <div 
                  key={item.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all",
                    item.status === 'overdue' && "border-error/30 bg-error/5",
                    item.status === 'due-soon' && "border-warning/30 bg-warning/5",
                    item.status === 'upcoming' && "border-border bg-muted/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={cn(
                        "p-2 rounded-lg",
                        item.type === 'qa' && "bg-primary/10 text-primary",
                        item.type === 'reaudit' && "bg-warning/10 text-warning",
                        item.type === 'education' && "bg-success/10 text-success"
                      )}>
                        {getTypeIcon(item.type)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{item.title}</span>
                          <StatusBadge 
                            status={
                              item.status === 'overdue' ? 'error' : 
                              item.status === 'due-soon' ? 'warning' : 'info'
                            }
                          >
                            {item.status === 'overdue' 
                              ? `${Math.abs(item.daysUntilDue)}d overdue`
                              : item.status === 'due-soon'
                                ? `Due in ${item.daysUntilDue}d`
                                : `${item.daysUntilDue}d`
                            }
                          </StatusBadge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mt-1">{item.details}</p>
                        
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          {item.unit && (
                            <span>Unit: {item.unit}</span>
                          )}
                          <span>Owner: {item.owner}</span>
                          <span>Due: {item.dueDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigateToItem(item)}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}