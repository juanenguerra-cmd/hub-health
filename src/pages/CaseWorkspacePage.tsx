import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { getDueStatus } from '@/lib/due-status';
import { todayYMD } from '@/lib/calculations';

export function CaseWorkspacePage() {
  const { caseId = '' } = useParams();
  const { qaActions, eduSessions } = useApp();
  const today = todayYMD();

  const caseQa = useMemo(() => qaActions.filter((q) => q.caseId === caseId), [qaActions, caseId]);
  const caseEdu = useMemo(() => eduSessions.filter((e) => e.caseId === caseId), [eduSessions, caseId]);

  const nextAction = caseQa.find((q) => q.status !== 'complete');
  const sla = nextAction?.dueDate ? getDueStatus(today, nextAction.dueDate) : null;

  const timeline = useMemo(() => {
    const events = [
      ...caseQa.map((q) => ({ date: q.createdAt, label: `QA draft created: ${q.issue}` })),
      ...caseQa.filter((q) => q.status === 'complete').map((q) => ({ date: q.completedAt, label: `QA completed: ${q.issue}` })),
      ...caseEdu.map((e) => ({ date: e.createdAt, label: `Education draft created: ${e.topic}` })),
      ...caseEdu.filter((e) => e.status === 'completed').map((e) => ({ date: e.completedDate, label: `Education delivered: ${e.topic}` })),
      ...caseQa.filter((q) => q.reAuditCompletedAt).map((q) => ({ date: q.reAuditCompletedAt, label: `Re-audit completed for ${q.issue}` })),
    ].filter((e) => e.date);
    return events.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  }, [caseQa, caseEdu]);

  if (!caseId || (caseQa.length === 0 && caseEdu.length === 0)) {
    return <Card><CardContent className="pt-6">Case not found.</CardContent></Card>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Case Workspace: {caseId}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">QA: {caseQa.length}</Badge>
          <Badge variant="outline">Education: {caseEdu.length}</Badge>
          {nextAction && <Badge>Next best action: {nextAction.issue}</Badge>}
          {sla && <StatusBadge status={sla.status === 'overdue' ? 'error' : sla.status === 'due-soon' ? 'warning' : 'info'}>SLA: {sla.status}</StatusBadge>}
        </CardContent>
      </Card>

      <Tabs defaultValue="summary">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="qa">QA</TabsTrigger>
          <TabsTrigger value="education">Education</TabsTrigger>
          <TabsTrigger value="reaudit">Re-audit</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="evidence">Evidence</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">Open QA items: {caseQa.filter((q) => q.status !== 'complete').length}</TabsContent>
        <TabsContent value="qa" className="space-y-2">{caseQa.map((q) => <Card key={q.id}><CardContent className="pt-4">{q.issue} • {q.status}</CardContent></Card>)}</TabsContent>
        <TabsContent value="education" className="space-y-2">{caseEdu.map((e) => <Card key={e.id}><CardContent className="pt-4">{e.topic} • {e.status}</CardContent></Card>)}</TabsContent>
        <TabsContent value="reaudit" className="space-y-2">{caseQa.map((q) => <Card key={q.id}><CardContent className="pt-4">{q.reAuditDueDate || 'No re-audit target'} {q.reAuditCompletedAt ? `• Completed ${q.reAuditCompletedAt}` : ''}</CardContent></Card>)}</TabsContent>
        <TabsContent value="timeline" className="space-y-2">{timeline.map((e, idx) => <Card key={`${e.label}-${idx}`}><CardContent className="pt-4">{(e.date || '').slice(0,10)} • {e.label}</CardContent></Card>)}</TabsContent>
        <TabsContent value="evidence" className="space-y-2">{caseQa.map((q) => <Card key={q.id}><CardContent className="pt-4">{q.issue}: policy {q.ev_policyReviewed ? '✓' : '✗'} / education {q.ev_educationProvided ? '✓' : '✗'} / competency {q.ev_competencyValidated ? '✓' : '✗'}</CardContent></Card>)}</TabsContent>
      </Tabs>

      <Link to="/follow-up" className="text-sm underline">Back to Follow-Up Queue</Link>
    </div>
  );
}
