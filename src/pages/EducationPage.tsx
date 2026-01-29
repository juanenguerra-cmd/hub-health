import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { detectEducationCategory, todayYMD } from '@/lib/calculations';
import type { EducationSession } from '@/types/nurse-educator';
import { 
  Search, 
  Plus, 
  GraduationCap,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  User,
  ChevronRight,
  X
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

export function EducationPage() {
  const { eduSessions, eduFilters, setEduFilters } = useApp();
  const [selectedSession, setSelectedSession] = useState<EducationSession | null>(null);
  
  // Month/Year filter state
  const [filterMonth, setFilterMonth] = useState<string>('All');
  const [filterYear, setFilterYear] = useState<string>(String(currentYear));

  // Filter sessions
  let filtered = eduSessions.filter(s => {
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

  // Category breakdown for KPI
  const byCategory: Record<string, number> = {};
  eduSessions.filter(s => s.status === 'completed').forEach(s => {
    const cat = s.category || detectEducationCategory(s.topic || '', s.summary || '');
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });

  const getSessionDate = (session: EducationSession) => {
    return session.status === 'completed' ? session.completedDate : session.scheduledDate;
  };

  const getCategory = (session: EducationSession) => {
    return session.category || detectEducationCategory(session.topic || '', session.summary || '');
  };

  const isOverdue = (session: EducationSession) => {
    return session.status === 'planned' && session.scheduledDate && session.scheduledDate < today;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Education & Inservices</h1>
          <p className="text-muted-foreground">Plan and track staff education sessions</p>
        </div>
        <Button className="gap-2">
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
          <div className="flex flex-wrap gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Sessions Table */}
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

      {/* Session Detail Dialog */}
      <Dialog open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              Session Details
            </DialogTitle>
          </DialogHeader>
          {selectedSession && (
            <div className="space-y-4">
              {/* Status Badge */}
              <div>
                {selectedSession.status === 'completed' ? (
                  <StatusBadge status="success">
                    <CheckCircle2 className="w-3 h-3" /> Completed
                  </StatusBadge>
                ) : isOverdue(selectedSession) ? (
                  <StatusBadge status="error">
                    <Clock className="w-3 h-3" /> Overdue
                  </StatusBadge>
                ) : (
                  <StatusBadge status="warning">
                    <Clock className="w-3 h-3" /> Planned
                  </StatusBadge>
                )}
              </div>

              {/* Topic */}
              <div>
                <h3 className="text-lg font-semibold">{selectedSession.topic || 'Untitled Session'}</h3>
                {selectedSession.summary && (
                  <p className="text-sm text-muted-foreground mt-1">{selectedSession.summary}</p>
                )}
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Category</p>
                  <Badge variant="outline" className="mt-1">
                    {getCategory(selectedSession)}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="flex items-center gap-1 mt-1">
                    <Calendar className="w-4 h-4" />
                    {selectedSession.status === 'completed' 
                      ? selectedSession.completedDate 
                      : selectedSession.scheduledDate || 'TBD'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Instructor</p>
                  <p className="flex items-center gap-1 mt-1">
                    <User className="w-4 h-4" />
                    {selectedSession.instructor || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Audience</p>
                  <p className="flex items-center gap-1 mt-1">
                    <Users className="w-4 h-4" />
                    {selectedSession.audience || '—'}
                  </p>
                </div>
                {selectedSession.unit && (
                  <div>
                    <p className="text-muted-foreground">Unit</p>
                    <p className="mt-1">Unit {selectedSession.unit}</p>
                  </div>
                )}
                {selectedSession.templateTitle && (
                  <div>
                    <p className="text-muted-foreground">Related Audit</p>
                    <p className="mt-1 text-xs">{selectedSession.templateTitle}</p>
                  </div>
                )}
              </div>

              {/* Attendees */}
              {selectedSession.attendees && selectedSession.attendees.length > 0 && (
                <div>
                  <p className="text-muted-foreground text-sm mb-2">Attendees ({selectedSession.attendees.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedSession.attendees.map((name, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{name}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {selectedSession.notes && (
                <div>
                  <p className="text-muted-foreground text-sm">Notes</p>
                  <p className="text-sm mt-1 bg-muted/50 p-2 rounded">{selectedSession.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedSession(null)}>
                  Close
                </Button>
                <Button>Edit Session</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
