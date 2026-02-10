import { useMemo, useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import type { OrientationRecord } from '@/types/nurse-educator';
import {
  Search,
  Plus,
  Users,
  Calendar,
  Building2,
  Briefcase,
  Edit2,
  BarChart3,
  TrendingUp
} from 'lucide-react';
import { BarChart, Bar, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

const DEPARTMENTS = ['Nursing', 'Administration', 'housekeeping', 'maintenance', 'dietary', 'recreation', 'rehabilitation', 'HR', 'others'];
const POSITIONS = ['RN', 'LPN', 'CNA', 'Unit Secretary', 'Dietary', 'Housekeeping', 'Maintenance', 'Social Worker', 'Activities', 'others'];
const STATUS_OPTIONS: Array<OrientationRecord['status']> = ['active', 'completed', 'terminated'];
const CHART_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

function getSessionName(record: OrientationRecord): string {
  return record.sessionName || record.orientee || 'Orientation Session';
}

function getAttendanceCount(record: OrientationRecord): number {
  return Number(record.attendanceCount ?? 0);
}

export function OrientationPage() {
  const { orientationRecords, setOrientationRecords } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OrientationRecord | null>(null);
  const [departmentOther, setDepartmentOther] = useState('');
  const [positionOther, setPositionOther] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const [formData, setFormData] = useState<Partial<OrientationRecord>>({
    orientee: '',
    department: '',
    position: '',
    hireDate: today,
    attendanceCount: 0,
    status: 'completed',
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      orientee: '',
      department: '',
      position: '',
      hireDate: today,
      attendanceCount: 0,
      status: 'completed',
      notes: ''
    });
    setDepartmentOther('');
    setPositionOther('');
    setEditingRecord(null);
  };

  const openEdit = (record: OrientationRecord) => {
    const departmentIsPreset = DEPARTMENTS.includes(record.department);
    const positionIsPreset = POSITIONS.includes(record.position);

    setDepartmentOther(departmentIsPreset ? '' : record.department);
    setPositionOther(positionIsPreset ? '' : record.position);
    setEditingRecord(record);
    setFormData({
      ...record,
      department: departmentIsPreset ? record.department : 'others',
      position: positionIsPreset ? record.position : 'others',
      attendanceCount: getAttendanceCount(record)
    });
    setDialogOpen(true);
  };

  const saveRecord = () => {
    const finalDepartment = formData.department === 'others' ? departmentOther.trim() : formData.department;
    const finalPosition = formData.position === 'others' ? positionOther.trim() : formData.position;

    if (!finalDepartment || !finalPosition || !formData.hireDate) return;

    const now = new Date().toISOString();
    const weekStart = formData.hireDate;

    if (editingRecord) {
      const updated = orientationRecords.map((r) =>
        r.id === editingRecord.id
          ? {
              ...r,
              ...formData,
              sessionName: '',
              orientee: `${finalDepartment} - ${finalPosition}`,
              department: finalDepartment,
              position: finalPosition,
              attendanceCount: Number(formData.attendanceCount || 0),
              weekStart
            }
          : r
      );
      setOrientationRecords(updated);
    } else {
      const newRecord: OrientationRecord = {
        id: `ori_${Date.now().toString(16)}`,
        date: today,
        weekStart,
        sessionName: '',
        orientee: `${finalDepartment} - ${finalPosition}`,
        department: finalDepartment,
        position: finalPosition,
        hireDate: formData.hireDate,
        status: (formData.status || 'completed') as OrientationRecord['status'],
        attendanceCount: Number(formData.attendanceCount || 0),
        terminationDate: '',
        retention30: false,
        retention60: false,
        retention90: false,
        notes: formData.notes || '',
        createdAt: now
      };
      setOrientationRecords([...orientationRecords, newRecord]);
    }

    resetForm();
    setDialogOpen(false);
  };

  const filtered = orientationRecords
    .filter((r) => {
      if (statusFilter !== 'All' && r.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay = `${getSessionName(r)} ${r.department} ${r.position}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const totalSessions = orientationRecords.length;
  const totalAttendance = orientationRecords.reduce((sum, record) => sum + getAttendanceCount(record), 0);
  const averageAttendance = totalSessions > 0 ? (totalAttendance / totalSessions).toFixed(1) : '0.0';
  const thisMonth = new Date().toISOString().slice(0, 7);
  const sessionsThisMonth = orientationRecords.filter((record) => record.hireDate.startsWith(thisMonth)).length;

  const sessionsByDepartment = useMemo(() => {
    const map = new Map<string, { department: string; sessions: number; attendance: number }>();
    orientationRecords.forEach((record) => {
      const key = record.department;
      const current = map.get(key) || { department: key, sessions: 0, attendance: 0 };
      current.sessions += 1;
      current.attendance += getAttendanceCount(record);
      map.set(key, current);
    });
    return Array.from(map.values()).sort((a, b) => b.sessions - a.sessions);
  }, [orientationRecords]);

  const sessionsByPosition = useMemo(() => {
    const map = new Map<string, number>();
    orientationRecords.forEach((record) => {
      map.set(record.position, (map.get(record.position) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [orientationRecords]);

  const sessionsByMonth = useMemo(() => {
    const map = new Map<string, number>();
    orientationRecords.forEach((record) => {
      const key = record.hireDate.slice(0, 7);
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, sessions]) => ({ month, sessions }));
  }, [orientationRecords]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Orientation Sessions</h1>
          <p className="text-muted-foreground">Track attendance by session, department, and position with quick infographics</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Session
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit Orientation Session' : 'Add Orientation Session'}</DialogTitle>
              <DialogDescription>
                Capture session attendance and categorize by department and position.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(v) => {
                      setFormData({ ...formData, department: v });
                      if (v !== 'others') setDepartmentOther('');
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formData.department === 'others' && (
                    <Input
                      className="mt-2"
                      value={departmentOther}
                      onChange={(e) => setDepartmentOther(e.target.value)}
                      placeholder="Enter department"
                    />
                  )}
                </div>
                <div>
                  <Label>Position *</Label>
                  <Select
                    value={formData.position}
                    onValueChange={(v) => {
                      setFormData({ ...formData, position: v });
                      if (v !== 'others') setPositionOther('');
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {formData.position === 'others' && (
                    <Input
                      className="mt-2"
                      value={positionOther}
                      onChange={(e) => setPositionOther(e.target.value)}
                      placeholder="Enter position"
                    />
                  )}
                </div>
                <div>
                  <Label>Session Date *</Label>
                  <Input
                    type="date"
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Attendance *</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.attendanceCount ?? 0}
                    onChange={(e) => setFormData({ ...formData, attendanceCount: Number(e.target.value) })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as OrientationRecord['status'] })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STATUS_OPTIONS.map((status) => (
                        <SelectItem key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Optional details..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button
                  onClick={saveRecord}
                  disabled={
                    !formData.department ||
                    !formData.position ||
                    (formData.department === 'others' && !departmentOther.trim()) ||
                    (formData.position === 'others' && !positionOther.trim()) ||
                    !formData.hireDate
                  }
                >
                  {editingRecord ? 'Update Session' : 'Add Session'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <KpiGrid>
        <KpiCard label="Total Sessions" value={totalSessions} icon={<BarChart3 className="w-5 h-5" />} />
        <KpiCard label="Total Attendance" value={totalAttendance} icon={<Users className="w-5 h-5" />} />
        <KpiCard label="Avg Attendance / Session" value={averageAttendance} icon={<TrendingUp className="w-5 h-5" />} />
        <KpiCard label="Sessions This Month" value={sessionsThisMonth} icon={<Calendar className="w-5 h-5" />} />
      </KpiGrid>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Orientation Sessions by Month</CardTitle>
            <CardDescription>Quick trend infographic to monitor orientation activity.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="sessions" stroke="hsl(var(--chart-1))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Session Mix by Position</CardTitle>
            <CardDescription>Distribution of orientations by role.</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={sessionsByPosition} dataKey="value" nameKey="name" outerRadius={90} label>
                  {sessionsByPosition.map((entry, index) => (
                    <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance by Department</CardTitle>
          <CardDescription>Session count and attendance totals by department.</CardDescription>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sessionsByDepartment}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="department" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="sessions" fill="hsl(var(--chart-2))" name="Sessions" />
              <Bar dataKey="attendance" fill="hsl(var(--chart-3))" name="Attendance" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search sessions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                {STATUS_OPTIONS.map((status) => (
                  <SelectItem key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orientation Session Log</CardTitle>
          <CardDescription>Session-level attendance records with department and position details.</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No orientation sessions found</p>
              <p className="text-sm text-muted-foreground">Add your first session to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Session</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Attendance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="font-medium">{getSessionName(record)}</TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          {record.department}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          {record.position}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {record.hireDate}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{getAttendanceCount(record)}</TableCell>
                      <TableCell>
                        {record.status === 'active' && <StatusBadge status="warning">Active</StatusBadge>}
                        {record.status === 'completed' && <StatusBadge status="success">Completed</StatusBadge>}
                        {record.status === 'terminated' && <StatusBadge status="error">Cancelled</StatusBadge>}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => openEdit(record)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
