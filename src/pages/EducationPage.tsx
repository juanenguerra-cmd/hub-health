import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { detectEducationCategory, todayYMD } from '@/lib/calculations';
import { 
  Search, 
  Plus, 
  GraduationCap,
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  User
} from 'lucide-react';

export function EducationPage() {
  const { eduSessions, eduFilters, setEduFilters } = useApp();

  // Filter sessions
  let filtered = eduSessions.filter(s => {
    if (eduFilters.status !== 'All' && s.status !== eduFilters.status) return false;
    if (eduFilters.search) {
      const q = eduFilters.search.toLowerCase();
      const hay = `${s.topic || ''} ${s.summary || ''} ${s.instructor || ''} ${s.audience || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  // Sort by date desc
  filtered.sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''));

  const today = todayYMD();
  const planned = filtered.filter(s => s.status === 'planned').length;
  const completed = filtered.filter(s => s.status === 'completed').length;
  const overdue = filtered.filter(s => 
    s.status === 'planned' && s.scheduledDate && s.scheduledDate < today
  ).length;

  // Category breakdown
  const byCategory: Record<string, number> = {};
  filtered.filter(s => s.status === 'completed').forEach(s => {
    const cat = s.category || detectEducationCategory(s.topic || '', s.summary || '');
    byCategory[cat] = (byCategory[cat] || 0) + 1;
  });
  const topCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sessions List */}
        <div className="lg:col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">No education sessions found</p>
                <p className="text-sm text-muted-foreground">Create your first inservice to get started</p>
              </CardContent>
            </Card>
          ) : (
            filtered.map(session => {
              const isOverdue = session.status === 'planned' && session.scheduledDate && session.scheduledDate < today;
              
              return (
                <Card key={session.id} className="hover:shadow-sm transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                        session.status === 'completed' ? 'bg-success/10' : 'bg-primary/10'
                      }`}>
                        <GraduationCap className={`w-5 h-5 ${
                          session.status === 'completed' ? 'text-success' : 'text-primary'
                        }`} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {session.status === 'completed' ? (
                            <StatusBadge status="success">
                              <CheckCircle2 className="w-3 h-3" /> Completed
                            </StatusBadge>
                          ) : isOverdue ? (
                            <StatusBadge status="error">
                              <Clock className="w-3 h-3" /> Overdue
                            </StatusBadge>
                          ) : (
                            <StatusBadge status="warning">
                              <Clock className="w-3 h-3" /> Planned
                            </StatusBadge>
                          )}
                        </div>
                        
                        <h3 className="font-semibold">{session.topic || 'Untitled Session'}</h3>
                        {session.summary && (
                          <p className="text-sm text-muted-foreground mt-1">{session.summary}</p>
                        )}
                        
                        <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-muted-foreground">
                          {session.instructor && (
                            <span className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {session.instructor}
                            </span>
                          )}
                          {session.audience && (
                            <span className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {session.audience}
                            </span>
                          )}
                          {(session.scheduledDate || session.completedDate) && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {session.status === 'completed' ? session.completedDate : session.scheduledDate}
                            </span>
                          )}
                          {session.unit && (
                            <span>Unit {session.unit}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>

        {/* Category Breakdown */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Categories</CardTitle>
              <CardDescription>Completed sessions by topic category</CardDescription>
            </CardHeader>
            <CardContent>
              {topCategories.length > 0 ? (
                <div className="space-y-3">
                  {topCategories.map(([cat, count]) => (
                    <div key={cat} className="flex items-center justify-between gap-2">
                      <span className="text-sm truncate">{cat}</span>
                      <span className="text-sm font-medium text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No completed sessions yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
