import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge, ComplianceIndicator } from '@/components/StatusBadge';
import { filterActionsByRange, computeClosedLoopStats, todayYMD } from '@/lib/calculations';
import { recommendationRules } from '@/lib/recommendation-rules';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { QaActionFormModal } from '@/components/qa/QaActionFormModal';
import { PrintableQaActionsReport } from '@/components/reports/PrintableQaActionsReport';
import { toast } from '@/hooks/use-toast';
import { useAuditNavigation } from '@/hooks/use-audit-navigation';
import type { QaAction } from '@/types/nurse-educator';
import { 
  Search, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText,
  User,
  Calendar,
  Pencil,
  Trash2,
  Play,
  ClipboardCheck,
  GraduationCap,
  Printer
} from 'lucide-react';

// Helper to extract competency titles from notes
const extractCompetenciesFromNotes = (notes: string): string[] => {
  if (!notes) return [];
  const competencies: string[] = [];
  const lines = notes.split('\n');
  
  for (const line of lines) {
    // Match pattern like "[CODE-123] Title Here"
    const match = line.match(/^\[([A-Z0-9-]+)\]\s+(.+)$/);
    if (match) {
      competencies.push(`[${match[1]}] ${match[2]}`);
    }
  }
  
  return competencies;
};

export function QaActionsPage() {
  const { qaActions, setQaActions, actionsFilters, setActionsFilters, templates, setActiveTab, sessions } = useApp();
  const { startAudit, openAuditSession } = useAuditNavigation();
  
  // Modal states
  const [selectedAction, setSelectedAction] = useState<QaAction | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editAction, setEditAction] = useState<QaAction | null>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);

  const daysAgo = parseInt(actionsFilters.range, 10);
  const today = todayYMD();
  
  // Filter actions
  let filtered = filterActionsByRange(qaActions, daysAgo);
  
  if (actionsFilters.status !== 'All') {
    filtered = filtered.filter(a => a.status === actionsFilters.status);
  }
  
  if (actionsFilters.tool !== 'All') {
    filtered = filtered.filter(a => a.templateTitle === actionsFilters.tool);
  }
  
  if (actionsFilters.search) {
    const q = actionsFilters.search.toLowerCase();
    filtered = filtered.filter(a => 
      (a.issue || '').toLowerCase().includes(q) ||
      (a.topic || '').toLowerCase().includes(q) ||
      (a.templateTitle || '').toLowerCase().includes(q) ||
      (a.unit || '').toLowerCase().includes(q)
    );
  }

  // Sort by created date desc
  filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const stats = computeClosedLoopStats(filtered);
  const tools = ['All', ...Array.from(new Set(qaActions.map(a => a.templateTitle).filter(Boolean))).sort()];
  const recommendationMatches = useMemo(() => {
    if (filtered.length === 0) return [];
    const actionText = filtered
      .map(action => [
        action.issue,
        action.topic,
        action.summary,
        action.reason,
        action.notes,
        action.templateTitle,
        action.unit
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase())
      .join(' | ');

    return recommendationRules.filter(rule => {
      const triggerMatch = rule.trigger.toLowerCase();
      if (actionText.includes(triggerMatch)) {
        return true;
      }
      return rule.searchTags.some(tag => actionText.includes(tag.toLowerCase()));
    });
  }, [filtered]);

  const getStatusBadge = (action: typeof qaActions[0]) => {
    const due = (action.dueDate || '').slice(0, 10);
    const isOverdue = due && due < today && action.status !== 'complete';
    
    if (action.status === 'complete') {
      return <StatusBadge status="success"><CheckCircle2 className="w-3 h-3" /> Complete</StatusBadge>;
    }
    if (isOverdue) {
      return <StatusBadge status="error"><AlertCircle className="w-3 h-3" /> Overdue</StatusBadge>;
    }
    if (action.status === 'in_progress') {
      return <StatusBadge status="warning"><Clock className="w-3 h-3" /> In Progress</StatusBadge>;
    }
    return <StatusBadge status="info"><Clock className="w-3 h-3" /> Open</StatusBadge>;
  };

  // Handlers
  const handleCreateAction = () => {
    setEditAction(null);
    setShowFormModal(true);
  };

  const handleEditAction = () => {
    setEditAction(selectedAction);
    setSelectedAction(null);
    setShowFormModal(true);
  };

  const handleDeleteAction = () => {
    if (!selectedAction) return;
    setQaActions(qaActions.filter(a => a.id !== selectedAction.id));
    setSelectedAction(null);
    toast({ title: 'Action Deleted', description: 'The QA action has been deleted.' });
  };

  const handleSaveAction = (action: QaAction) => {
    const exists = qaActions.find(a => a.id === action.id);
    if (exists) {
      setQaActions(qaActions.map(a => a.id === action.id ? action : a));
    } else {
      setQaActions([action, ...qaActions]);
    }
  };

  const handleStartAudit = (templateId: string) => {
    startAudit({ templateId, from: 'qa-action', actionId: selectedAction?.id });
    setSelectedAction(null);
  };

  const handleOpenAuditFile = (action: QaAction) => {
    openAuditSession({ sessionId: action.sessionId, from: 'qa-action' });
    setSelectedAction(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">QA Action Tracker</h1>
          <p className="text-muted-foreground">Closed-loop QAPI tracking with owners and re-audits</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowPrintModal(true)}>
            <Printer className="w-4 h-4 mr-2" />
            Print Report
          </Button>
          <Button className="gap-2" onClick={handleCreateAction}>
            <Plus className="w-4 h-4" />
            Add Action
          </Button>
        </div>
      </div>

      {/* KPIs */}
      <KpiGrid>
        <KpiCard label="Total Actions" value={stats.total} />
        <KpiCard 
          label="Open / In Progress" 
          value={stats.open + stats.prog}
          status={stats.open + stats.prog > 10 ? 'warning' : 'neutral'}
        />
        <KpiCard 
          label="Closure Rate" 
          value={`${stats.closureRate}%`}
          status={stats.closureRate >= 80 ? 'success' : stats.closureRate >= 60 ? 'warning' : 'error'}
        />
        <KpiCard 
          label="Overdue" 
          value={stats.overdueCount}
          status={stats.overdueCount === 0 ? 'success' : 'error'}
        />
      </KpiGrid>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={actionsFilters.search}
                  onChange={(e) => setActionsFilters({ ...actionsFilters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select 
              value={actionsFilters.range} 
              onValueChange={(v) => setActionsFilters({ ...actionsFilters, range: v })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="9999">All time</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={actionsFilters.status} 
              onValueChange={(v) => setActionsFilters({ ...actionsFilters, status: v })}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
              </SelectContent>
            </Select>

            <Select 
              value={actionsFilters.tool} 
              onValueChange={(v) => setActionsFilters({ ...actionsFilters, tool: v })}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tool" />
              </SelectTrigger>
              <SelectContent>
                {tools.map(t => (
                  <SelectItem key={t} value={t}>{t === 'All' ? 'All Tools' : t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions List */}
      <div className="space-y-3">
        {recommendationMatches.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recommendation Matches</CardTitle>
              <CardDescription>
                Based on current QA action findings. Review the full recommendation center for details.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {recommendationMatches.map(rule => (
                <div key={rule.id} className="rounded-lg border border-border p-3 space-y-2">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-sm font-semibold">{rule.trigger}</p>
                    <Button size="sm" variant="outline" onClick={() => setActiveTab('recommendations')}>
                      View Recommendation Center
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Competencies</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {rule.competencyDomains.map(item => (
                          <Badge key={item} variant="secondary">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">In-service</p>
                      <p className="text-sm mt-2">{rule.inserviceTitle}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Follow-up</p>
                      <p className="text-sm mt-2">{rule.followUp}</p>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
              <p className="font-medium">No action items found</p>
              <p className="text-sm text-muted-foreground">All QA actions are resolved or no items match your filters</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map(action => (
            <Card 
              key={action.id} 
              className="hover:shadow-sm transition-shadow cursor-pointer"
              onClick={() => setSelectedAction(action)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getStatusBadge(action)}
                    </div>
                    <h3 className="font-semibold">{action.issue || 'Untitled Issue'}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {action.topic || action.summary || 'No description'}
                    </p>
                    
                    <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <FileText className="w-3 h-3" />
                        {action.templateTitle || 'No tool'}
                      </span>
                      {action.sessionId && (
                        <span className="flex items-center gap-1">
                          <ClipboardCheck className="w-3 h-3" />
                          Audit: {action.sessionId}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {action.owner || 'Unassigned'}
                      </span>
                      {action.unit && (
                        <span>Unit {action.unit}</span>
                      )}
                      {action.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Due: {action.dueDate}
                        </span>
                      )}
                    </div>

                    {/* Evidence indicators */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {action.ev_educationProvided && (
                        <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded">Education</span>
                      )}
                      {action.ev_competencyValidated && (
                        <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded">Competency</span>
                      )}
                      {action.ev_correctiveAction && (
                        <span className="text-xs px-2 py-0.5 bg-success/10 text-success rounded">Corrective</span>
                      )}
                      {action.reAuditCompletedAt && (
                        <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">Re-audited</span>
                      )}
                    </div>

                    {/* Competency Titles from Notes */}
                    {(() => {
                      const comps = extractCompetenciesFromNotes(action.notes);
                      if (comps.length === 0) return null;
                      return (
                        <div className="mt-3 pt-2 border-t">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-primary" />
                            <span className="text-xs font-medium text-primary">Recommended Competencies</span>
                          </div>
                          <div className="space-y-0.5">
                            {comps.slice(0, 2).map((comp, idx) => (
                              <p key={idx} className="text-xs text-muted-foreground truncate">{comp}</p>
                            ))}
                            {comps.length > 2 && (
                              <p className="text-xs text-muted-foreground">+{comps.length - 2} more</p>
                            )}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Action Detail Modal */}
      <Dialog open={!!selectedAction} onOpenChange={(open) => !open && setSelectedAction(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              QA Action Details
            </DialogTitle>
            <DialogDescription>View and manage this QA action.</DialogDescription>
          </DialogHeader>
          
          {selectedAction && (
            <div className="space-y-4">
              {/* Status */}
              <div>{getStatusBadge(selectedAction)}</div>
              
              {/* Issue */}
              <div>
                <h3 className="text-lg font-semibold">{selectedAction.issue}</h3>
                {selectedAction.topic && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedAction.topic}</p>
                )}
              </div>
              
              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Owner</p>
                  <p className="flex items-center gap-1 mt-1">
                    <User className="w-4 h-4" />
                    {selectedAction.owner || 'Unassigned'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {selectedAction.dueDate || 'Not set'}
                  </p>
                </div>
                {selectedAction.unit && (
                  <div>
                    <p className="text-muted-foreground">Unit</p>
                    <p className="mt-1">Unit {selectedAction.unit}</p>
                  </div>
                )}
                {selectedAction.templateTitle && (
                  <div>
                    <p className="text-muted-foreground">Audit Tool</p>
                    <p className="mt-1 text-xs">{selectedAction.templateTitle}</p>
                  </div>
                )}
                {selectedAction.sessionId && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Audit Session</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-sm">{selectedAction.sessionId}</span>
                      {sessions.some(session => session.header.sessionId === selectedAction.sessionId) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenAuditFile(selectedAction)}
                        >
                          <FileText className="w-3.5 h-3.5 mr-1" />
                          Open Audit File
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">Session not found</span>
                      )}
                    </div>
                  </div>
                )}
                {selectedAction.reAuditDueDate && (
                  <div className="col-span-2">
                    <p className="text-muted-foreground">Re-Audit Due</p>
                    <p className="mt-1">{selectedAction.reAuditDueDate} {selectedAction.reAuditCompletedAt && `(Completed: ${selectedAction.reAuditCompletedAt})`}</p>
                  </div>
                )}
              </div>
              
              {/* Evidence Checklist */}
              <div>
                <p className="text-muted-foreground text-sm mb-2">Evidence Checklist</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={selectedAction.ev_policyReviewed ? "default" : "outline"}>Policy Reviewed</Badge>
                  <Badge variant={selectedAction.ev_educationProvided ? "default" : "outline"}>Education</Badge>
                  <Badge variant={selectedAction.ev_competencyValidated ? "default" : "outline"}>Competency</Badge>
                  <Badge variant={selectedAction.ev_correctiveAction ? "default" : "outline"}>Corrective Action</Badge>
                  <Badge variant={selectedAction.ev_monitoringInPlace ? "default" : "outline"}>Monitoring</Badge>
                </div>
              </div>
              
              {/* Competencies Section */}
              {(() => {
                const comps = extractCompetenciesFromNotes(selectedAction.notes);
                if (comps.length === 0) return null;
                return (
                  <div>
                    <p className="text-muted-foreground text-sm mb-2 flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Recommended Competencies (MASTERED.IT)
                    </p>
                    <div className="bg-muted/30 border rounded-lg p-3 space-y-1.5 max-h-32 overflow-y-auto">
                      {comps.map((comp, idx) => (
                        <p key={idx} className="text-sm">{comp}</p>
                      ))}
                    </div>
                  </div>
                );
              })()}
              
              {/* Notes */}
              {selectedAction.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm mt-1 bg-muted/50 p-2 rounded whitespace-pre-wrap">{selectedAction.notes}</p>
                </div>
              )}
              
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
                      <AlertDialogTitle>Delete QA Action?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this action item. This cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDeleteAction} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                
                <div className="flex gap-2">
                  {selectedAction.templateId && (
                    <Button variant="outline" onClick={() => handleStartAudit(selectedAction.reAuditTemplateId || selectedAction.templateId)}>
                      <Play className="w-4 h-4 mr-1" />
                      Start Re-Audit
                    </Button>
                  )}
                  <Button onClick={handleEditAction}>
                    <Pencil className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create/Edit Form Modal */}
      <QaActionFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        action={editAction}
        templates={templates}
        onSave={handleSaveAction}
      />

      <PrintableQaActionsReport
        open={showPrintModal}
        onOpenChange={setShowPrintModal}
        actions={filtered}
        title="QA Actions Report"
      />
    </div>
  );
}
