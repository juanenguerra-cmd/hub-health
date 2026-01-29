import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { StatusBadge } from '@/components/StatusBadge';
import { Badge } from '@/components/ui/badge';
import { todayYMD, daysBetween } from '@/lib/calculations';
import { toast } from '@/hooks/use-toast';
import type { QaAction, EducationSession } from '@/types/nurse-educator';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  User,
  Calendar,
  ClipboardCheck,
  Play,
  Pencil,
  Trash2,
  GraduationCap
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
  templateId?: string;
  templateTitle?: string;
}

export function FollowUpPage() {
  const { qaActions, setQaActions, eduSessions, setEduSessions, templates, setActiveTab } = useApp();
  const today = todayYMD();
  
  const [activeQueue, setActiveQueue] = useState('overdue');
  const [searchTerm, setSearchTerm] = useState('');
  const [ownerFilter, setOwnerFilter] = useState('All');
  const [unitFilter, setUnitFilter] = useState('All');
  const [selectedItem, setSelectedItem] = useState<FollowUpItem | null>(null);

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
        linkedId: qa.id,
        templateId: qa.templateId,
        templateTitle: qa.templateTitle
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
          linkedId: qa.id,
          templateId: qa.reAuditTemplateId || qa.templateId,
          templateTitle: qa.templateTitle
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
        linkedId: edu.id,
        templateId: edu.templateId,
        templateTitle: edu.templateTitle
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
      case 'education': return <GraduationCap className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Start audit directly
  const handleStartAudit = (templateId: string, actionId?: string) => {
    if (!templateId) {
      toast({ title: 'No Audit Tool', description: 'This item is not linked to an audit tool.', variant: 'destructive' });
      return;
    }
    
    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast({ title: 'Template Not Found', description: 'The linked audit tool was not found.', variant: 'destructive' });
      return;
    }
    
    // Store the template to start in sessionStorage
    sessionStorage.setItem('NES_START_AUDIT', JSON.stringify({ 
      templateId, 
      from: 'follow-up', 
      actionId,
      autoStart: true 
    }));
    setSelectedItem(null);
    setActiveTab('sessions');
    toast({ title: 'Starting Audit', description: `Launching ${template.title}...` });
  };

  // Delete handlers
  const handleDeleteItem = () => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'qa' || selectedItem.type === 'reaudit') {
      // For re-audit, just clear the re-audit date; for QA, delete the action
      if (selectedItem.type === 'reaudit') {
        setQaActions(qaActions.map(a => 
          a.id === selectedItem.linkedId 
            ? { ...a, reAuditDueDate: '', reAuditTemplateId: '' }
            : a
        ));
        toast({ title: 'Re-Audit Cleared', description: 'The re-audit due date has been removed.' });
      } else {
        setQaActions(qaActions.filter(a => a.id !== selectedItem.linkedId));
        toast({ title: 'Action Deleted', description: 'The QA action has been deleted.' });
      }
    } else if (selectedItem.type === 'education') {
      setEduSessions(eduSessions.filter(e => e.id !== selectedItem.linkedId));
      toast({ title: 'Session Deleted', description: 'The education session has been deleted.' });
    }
    
    setSelectedItem(null);
  };

  // Navigate to edit
  const handleEditItem = () => {
    if (!selectedItem) return;
    
    if (selectedItem.type === 'qa' || selectedItem.type === 'reaudit') {
      setActiveTab('qa-actions');
    } else if (selectedItem.type === 'education') {
      setActiveTab('education');
    }
    setSelectedItem(null);
  };

  // Mark QA action complete
  const handleMarkComplete = () => {
    if (!selectedItem || selectedItem.type === 'education') return;
    
    if (selectedItem.type === 'reaudit') {
      setQaActions(qaActions.map(a => 
        a.id === selectedItem.linkedId 
          ? { ...a, reAuditCompletedAt: today }
          : a
      ));
      toast({ title: 'Re-Audit Completed', description: 'The re-audit has been marked as complete.' });
    } else {
      setQaActions(qaActions.map(a => 
        a.id === selectedItem.linkedId 
          ? { ...a, status: 'complete' as const, completedAt: today }
          : a
      ));
      toast({ title: 'Action Completed', description: 'The QA action has been marked as complete.' });
    }
    
    setSelectedItem(null);
  };

  // Mark education complete
  const handleMarkEduComplete = () => {
    if (!selectedItem || selectedItem.type !== 'education') return;
    
    setEduSessions(eduSessions.map(e => 
      e.id === selectedItem.linkedId 
        ? { ...e, status: 'completed' as const, completedDate: today }
        : e
    ));
    toast({ title: 'Session Completed', description: 'The education session has been marked as complete.' });
    setSelectedItem(null);
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
        <Card className={cn("cursor-pointer transition-all", activeQueue === 'overdue' && "ring-2 ring-destructive")}
              onClick={() => setActiveQueue('overdue')}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-3xl font-bold text-destructive">{overdueCnt}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-destructive/30" />
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
                    "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-sm",
                    item.status === 'overdue' && "border-destructive/30 bg-destructive/5",
                    item.status === 'due-soon' && "border-warning/30 bg-warning/5",
                    item.status === 'upcoming' && "border-border bg-muted/20"
                  )}
                  onClick={() => setSelectedItem(item)}
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
                          <Badge variant="outline" className="text-xs capitalize">{item.type}</Badge>
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
                    
                    {/* Quick action buttons */}
                    <div className="flex gap-1">
                      {(item.type === 'qa' || item.type === 'reaudit') && item.templateId && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartAudit(item.templateId!, item.linkedId);
                          }}
                          title="Start Audit"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Item Detail Modal */}
      <Dialog open={!!selectedItem} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedItem && getTypeIcon(selectedItem.type)}
              {selectedItem?.type === 'qa' && 'QA Action Details'}
              {selectedItem?.type === 'reaudit' && 'Re-Audit Details'}
              {selectedItem?.type === 'education' && 'Education Session Details'}
            </DialogTitle>
          </DialogHeader>
          
          {selectedItem && (
            <div className="space-y-4">
              {/* Status */}
              <div>
                <StatusBadge 
                  status={
                    selectedItem.status === 'overdue' ? 'error' : 
                    selectedItem.status === 'due-soon' ? 'warning' : 'info'
                  }
                >
                  {selectedItem.status === 'overdue' 
                    ? `${Math.abs(selectedItem.daysUntilDue)} days overdue`
                    : `Due in ${selectedItem.daysUntilDue} days`
                  }
                </StatusBadge>
              </div>
              
              {/* Title */}
              <div>
                <h3 className="text-lg font-semibold">{selectedItem.title}</h3>
                <p className="text-sm text-muted-foreground mt-1">{selectedItem.details}</p>
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="flex items-center gap-1 mt-1">
                    <User className="w-4 h-4" />
                    {selectedItem.owner}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {selectedItem.dueDate}
                  </p>
                </div>
                {selectedItem.unit && (
                  <div>
                    <p className="text-muted-foreground">Unit</p>
                    <p className="mt-1">Unit {selectedItem.unit}</p>
                  </div>
                )}
                {selectedItem.templateTitle && (
                  <div>
                    <p className="text-muted-foreground">Linked Audit Tool</p>
                    <p className="mt-1 text-xs">{selectedItem.templateTitle}</p>
                  </div>
                )}
              </div>
              
              {/* Actions */}
              <div className="flex flex-wrap justify-between gap-2 pt-4 border-t">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-destructive hover:text-destructive">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete this item?</AlertDialogTitle>
                      <AlertDialogDescription>
                        {selectedItem.type === 'reaudit' 
                          ? 'This will clear the re-audit due date from the QA action.'
                          : 'This will permanently delete this item. This cannot be undone.'
                        }
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteItem} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <div className="flex gap-2 flex-wrap">
                  {selectedItem.type === 'education' && (
                    <Button variant="outline" onClick={handleMarkEduComplete}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  {(selectedItem.type === 'qa' || selectedItem.type === 'reaudit') && (
                    <Button variant="outline" onClick={handleMarkComplete}>
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Mark Complete
                    </Button>
                  )}
                  {(selectedItem.type === 'qa' || selectedItem.type === 'reaudit') && selectedItem.templateId && (
                    <Button onClick={() => handleStartAudit(selectedItem.templateId!, selectedItem.linkedId)}>
                      <Play className="w-4 h-4 mr-1" />
                      Start {selectedItem.type === 'reaudit' ? 'Re-Audit' : 'Audit'}
                    </Button>
                  )}
                  <Button variant="outline" onClick={handleEditItem}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}