import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { detectEducationCategory, todayYMD } from '@/lib/calculations';
import { EducationSessionFormModal } from '@/components/education/EducationSessionFormModal';
import { SignOffSheetModal } from '@/components/education/SignOffSheetModal';
import { SessionDetailModal } from '@/components/education/SessionDetailModal';
import { useWorkflowNavigation } from '@/hooks/use-workflow-navigation';
import type { EducationSession } from '@/types/nurse-educator';
import { 
  Search, 
  Plus, 
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  ChevronRight,
  Printer
} from 'lucide-react';

// Generate year options (current year ± 2 years)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
const MONTHS = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

type EducationViewMode = 'table' | 'weekly' | 'monthly';

const toDate = (dateValue?: string) => {
  if (!dateValue) return null;
  const [year, month, day] = dateValue.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
};

const formatLongDate = (dateValue?: string) => {
  const date = toDate(dateValue);
  if (!date) return 'TBD';
  return date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

const getWeekStart = (dateValue?: string) => {
  const date = toDate(dateValue);
  if (!date) return null;
  const weekStart = new Date(date);
  weekStart.setDate(date.getDate() - date.getDay());
  weekStart.setHours(0, 0, 0, 0);
  return weekStart;
};

export function EducationPage() {
  const { eduSessions, eduFilters, setEduFilters, setEduSessions, facilityName, eduLibrary, setActiveTab, startEducationRequest, setStartEducationRequest } = useApp();
  
  // Modal states
  const [selectedSession, setSelectedSession] = useState<EducationSession | null>(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editSession, setEditSession] = useState<EducationSession | null>(null);
  const [showSignOffModal, setShowSignOffModal] = useState(false);
  const [signOffSession, setSignOffSession] = useState<EducationSession | null>(null);
  

  useEffect(() => {
    if (!startEducationRequest) return;

    setEditSession((prev) => ({
      ...(prev ?? {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        status: 'planned',
        topic: '',
        summary: '',
        audience: '',
        instructor: '',
        unit: '',
        scheduledDate: '',
        completedDate: '',
        notes: '',
        templateTitle: '',
        templateId: '',
        issue: '',
        linkedQaActionId: '',
      }),
      ...startEducationRequest.prefillData,
    } as EducationSession));
    setShowFormModal(true);
    setStartEducationRequest(null);
  }, [setStartEducationRequest, startEducationRequest]);

  // Month/Year filter state
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>(String(currentYear));
  const [viewMode, setViewMode] = useState<EducationViewMode>('table');
  const { scheduleReAuditFromEducation } = useWorkflowNavigation();

  // Filter sessions
  const filtered = eduSessions.filter(s => {
    // Status filter
    if (eduFilters.status !== 'All' && s.status !== eduFilters.status) return false;
    
    // Search filter
    if (eduFilters.search) {
      const q = eduFilters.search.toLowerCase();
      const hay = `${s.topic || ''} ${s.summary || ''} ${s.instructor || ''} ${s.audience || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    
    // Month/Year filter
    const sessionDate = s.status === 'completed' ? s.completedDate : s.scheduledDate;
    if (sessionDate) {
      const [year, month] = sessionDate.split('-');
      if (filterYear !== 'All' && year !== filterYear) return false;
      if (filterMonth !== 'All' && month !== filterMonth) return false;
    }
    
    return true;
  });

  // Sort by date desc
  filtered.sort((a, b) => {
    const dateA = a.status === 'completed' ? a.completedDate : a.scheduledDate;
    const dateB = b.status === 'completed' ? b.completedDate : b.scheduledDate;
    return (dateB || '').localeCompare(dateA || '');
  });

  const today = todayYMD();
  const planned = eduSessions.filter(s => s.status === 'planned').length;
  const completed = eduSessions.filter(s => s.status === 'completed').length;
  const overdue = eduSessions.filter(s => 
    s.status === 'planned' && s.scheduledDate && s.scheduledDate < today
  ).length;

  const getSessionDate = (session: EducationSession) => {
    return session.status === 'completed' ? session.completedDate : session.scheduledDate;
  };

  const getCategory = (session: EducationSession) => {
    return session.category || detectEducationCategory(session.topic || '', session.summary || '');
  };

  const isOverdue = (session: EducationSession) => {
    return session.status === 'planned' && session.scheduledDate && session.scheduledDate < today;
  };

  const weeklyGroups = Object.entries(
    filtered.reduce<Record<string, EducationSession[]>>((acc, session) => {
      const weekStart = getWeekStart(getSessionDate(session));
      if (!weekStart) return acc;
      const key = weekStart.toISOString().slice(0, 10);
      if (!acc[key]) acc[key] = [];
      acc[key].push(session);
      return acc;
    }, {})
  )
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([weekStart, sessions]) => {
      const start = toDate(weekStart);
      const end = start ? new Date(start) : null;
      if (end) end.setDate(end.getDate() + 6);

      return {
        weekStart,
        label: `${formatLongDate(weekStart)} - ${end ? formatLongDate(end.toISOString().slice(0, 10)) : 'TBD'}`,
        sessions: [...sessions].sort((a, b) => (getSessionDate(a) || '').localeCompare(getSessionDate(b) || ''))
      };
    });

  const monthlyGroups = Object.entries(
    filtered.reduce<Record<string, EducationSession[]>>((acc, session) => {
      const sessionDate = getSessionDate(session);
      if (!sessionDate) return acc;
      if (!acc[sessionDate]) acc[sessionDate] = [];
      acc[sessionDate].push(session);
      return acc;
    }, {})
  )
    .sort(([a], [b]) => a.localeCompare(b));

  // Handlers
  const handleCreateSession = () => {
    setEditSession(null);
    setShowFormModal(true);
  };

  const handleEditSession = () => {
    setEditSession(selectedSession);
    setSelectedSession(null);
    setShowFormModal(true);
  };

  const handleDeleteSession = () => {
    if (!selectedSession) return;
    setEduSessions(eduSessions.filter(s => s.id !== selectedSession.id));
    setSelectedSession(null);
  };

  const handleSaveSession = (session: EducationSession) => {
    const exists = eduSessions.find(s => s.id === session.id);
    if (exists) {
      // Update existing
      setEduSessions(eduSessions.map(s => s.id === session.id ? session : s));
    } else {
      // Add new
      setEduSessions([session, ...eduSessions]);
      setActiveTab('recommendations');
    }
  };

  const handleGenerateSignOff = () => {
    setSignOffSession(selectedSession);
    setSelectedSession(null);
    setShowSignOffModal(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Education & Inservices</h1>
          <p className="text-muted-foreground">Plan and track staff education sessions</p>
        </div>
        <Button className="gap-2" onClick={handleCreateSession}>
          <Plus className="w-4 h-4" />
          Plan Inservice
        </Button>
      </div>

      {/* KPIs */}
      <KpiGrid>
        <KpiCard 
          label="Planned" 
          value={planned}
          icon={<Clock className="w-5 h-5" />}
        />
        <KpiCard 
          label="Completed" 
          value={completed}
          icon={<CheckCircle2 className="w-5 h-5" />}
          status="success"
        />
        <KpiCard 
          label="Overdue" 
          value={overdue}
          status={overdue === 0 ? 'success' : 'error'}
        />
        <KpiCard 
          label="Completion Rate" 
          value={`${planned + completed > 0 ? Math.round((completed / (planned + completed)) * 100) : 0}%`}
        />
      </KpiGrid>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics, instructors..."
                  value={eduFilters.search}
                  onChange={(e) => setEduFilters({ ...eduFilters, search: e.target.value })}
                  className="pl-9"
                />
              </div>
            </div>
            
            <Select 
              value={eduFilters.status} 
              onValueChange={(v) => setEduFilters({ ...eduFilters, status: v })}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Months</SelectItem>
                {MONTHS.map(m => (
                  <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={setFilterYear}>
              <SelectTrigger className="w-[100px]">
                <SelectValue placeholder="Year" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Years</SelectItem>
                {YEARS.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={viewMode} onValueChange={(v) => setViewMode(v as EducationViewMode)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="table">Table View</SelectItem>
                <SelectItem value="weekly">Weekly View</SelectItem>
                <SelectItem value="monthly">Calendar Agenda</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handlePrint} className="gap-2">
              <Printer className="w-4 h-4" />
              Print View
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
      {viewMode === 'table' && (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Education Sessions
            <Badge variant="secondary" className="ml-2">{filtered.length}</Badge>
          </CardTitle>
          <CardDescription>Click any row to view full details</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No education sessions found</p>
              <p className="text-sm text-muted-foreground">Create your first inservice to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="min-w-[250px]">Topic</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Discipline</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(session => (
                    <TableRow 
                      key={session.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedSession(session)}
                    >
                      <TableCell>
                        <span className="flex items-center gap-1 text-sm">
                          <Calendar className="w-3 h-3" />
                          {getSessionDate(session) || 'TBD'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium">{session.topic || 'Untitled Session'}</span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getCategory(session)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {session.audience || '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {session.status === 'completed' ? (
                          <StatusBadge status="success">
                            <CheckCircle2 className="w-3 h-3" /> Completed
                          </StatusBadge>
                        ) : isOverdue(session) ? (
                          <StatusBadge status="error">
                            <Clock className="w-3 h-3" /> Overdue
                          </StatusBadge>
                        ) : (
                          <StatusBadge status="warning">
                            <Clock className="w-3 h-3" /> Planned
                          </StatusBadge>
                        )}
                      </TableCell>
                      <TableCell>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      )}

      {viewMode === 'weekly' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Inservice Calendar
            </CardTitle>
            <CardDescription>Print-friendly weekly list of planned and completed sessions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {weeklyGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions found for this filter.</p>
            ) : weeklyGroups.map((group) => (
              <div key={group.weekStart} className="rounded-lg border p-4 space-y-3">
                <h3 className="font-medium">Week of {group.label}</h3>
                <div className="space-y-2">
                  {group.sessions.map((session) => (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => setSelectedSession(session)}
                      className="w-full text-left rounded-md border p-3 hover:bg-muted/40"
                    >
                      <p className="font-medium">{session.topic || 'Untitled Session'}</p>
                      <p className="text-sm text-muted-foreground">{formatLongDate(getSessionDate(session))} • {session.audience || 'All Staff'}</p>
                      <p className="text-xs text-muted-foreground mt-1">{session.status === 'completed' ? 'Completed' : isOverdue(session) ? 'Overdue' : 'Planned'}</p>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {viewMode === 'monthly' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Full Calendar Agenda
            </CardTitle>
            <CardDescription>Whole calendar list with readable inservice topics by date.</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyGroups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sessions found for this filter.</p>
            ) : (
              <div className="space-y-4">
                {monthlyGroups.map(([date, sessions]) => (
                  <div key={date} className="rounded-lg border p-4">
                    <h3 className="font-medium mb-2">{formatLongDate(date)}</h3>
                    <ul className="space-y-2">
                      {sessions.map((session) => (
                        <li key={session.id}>
                          <button
                            type="button"
                            className="w-full text-left rounded-md bg-muted/40 p-3 hover:bg-muted"
                            onClick={() => setSelectedSession(session)}
                          >
                            <p className="font-medium">{session.topic || 'Untitled Session'}</p>
                            <p className="text-sm text-muted-foreground">{session.summary || 'No summary provided.'}</p>
                            <p className="text-xs text-muted-foreground mt-1">{session.status === 'completed' ? 'Completed' : isOverdue(session) ? 'Overdue' : 'Planned'}</p>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Detail Modal */}
      <SessionDetailModal
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
        session={selectedSession}
        onEdit={handleEditSession}
        onDelete={handleDeleteSession}
        onGenerateSignOff={handleGenerateSignOff}
        onScheduleReAudit={() => selectedSession && scheduleReAuditFromEducation(selectedSession)}
      />

      {/* Create/Edit Form Modal */}
      <EducationSessionFormModal
        open={showFormModal}
        onOpenChange={setShowFormModal}
        session={editSession}
        onSave={handleSaveSession}
        eduLibrary={eduLibrary}
      />

      {/* Sign-Off Sheet Modal */}
      <SignOffSheetModal
        open={showSignOffModal}
        onOpenChange={setShowSignOffModal}
        session={signOffSession}
        facilityName={facilityName}
      />
    </div>
  );
}
