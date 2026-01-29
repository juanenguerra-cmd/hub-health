import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { KpiCard, KpiGrid } from '@/components/KpiCard';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { daysBetween, todayYMD } from '@/lib/calculations';
import type { OrientationRecord } from '@/types/nurse-educator';
import {
  Search,
  Plus,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Building2,
  Briefcase,
  Edit2
} from 'lucide-react';

const DEPARTMENTS = ['1A', '1B', '2A', '2B', '3A', '3B', 'ICU', 'ER', 'OR', 'Rehab', 'Admin'];
const POSITIONS = ['RN', 'LPN', 'CNA', 'Unit Secretary', 'Dietary', 'Housekeeping', 'Maintenance', 'Social Worker', 'Activities'];

export function OrientationPage() {
  const { orientationRecords, setOrientationRecords } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<OrientationRecord | null>(null);

  const today = todayYMD();

  // Form state
  const [formData, setFormData] = useState<Partial<OrientationRecord>>({
    orientee: '',
    department: '',
    position: '',
    hireDate: today,
    status: 'active',
    retention30: false,
    retention60: false,
    retention90: false,
    notes: ''
  });

  const resetForm = () => {
    setFormData({
      orientee: '',
      department: '',
      position: '',
      hireDate: today,
      status: 'active',
      retention30: false,
      retention60: false,
      retention90: false,
      notes: ''
    });
    setEditingRecord(null);
  };

  const openEdit = (record: OrientationRecord) => {
    setEditingRecord(record);
    setFormData({ ...record });
    setDialogOpen(true);
  };

  const saveRecord = () => {
    if (!formData.orientee || !formData.department || !formData.position || !formData.hireDate) return;

    const now = new Date().toISOString();
    const weekStart = getWeekStart(formData.hireDate);

    if (editingRecord) {
      // Update existing
      const updated = orientationRecords.map(r =>
        r.id === editingRecord.id
          ? { ...r, ...formData, weekStart }
          : r
      );
      setOrientationRecords(updated);
    } else {
      // Create new
      const newRecord: OrientationRecord = {
        id: `ori_${Date.now().toString(16)}`,
        date: today,
        weekStart,
        orientee: formData.orientee!,
        department: formData.department!,
        position: formData.position!,
        hireDate: formData.hireDate!,
        status: formData.status as 'active' | 'completed' | 'terminated',
        terminationDate: formData.terminationDate || '',
        retention30: formData.retention30 || false,
        retention60: formData.retention60 || false,
        retention90: formData.retention90 || false,
        notes: formData.notes || '',
        createdAt: now
      };
      setOrientationRecords([...orientationRecords, newRecord]);
    }

    resetForm();
    setDialogOpen(false);
  };

  // Calculate week start (Monday) for a given date
  function getWeekStart(dateStr: string): string {
    const d = new Date(dateStr);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().slice(0, 10);
  }

  // Calculate retention checkpoint status
  function getRetentionStatus(record: OrientationRecord): {
    day30: 'pending' | 'due' | 'overdue' | 'completed';
    day60: 'pending' | 'due' | 'overdue' | 'completed';
    day90: 'pending' | 'due' | 'overdue' | 'completed';
    daysSinceHire: number;
  } {
    const daysSinceHire = daysBetween(record.hireDate, today);

    const getStatus = (checkpoint: number, isCompleted: boolean) => {
      if (isCompleted) return 'completed';
      if (daysSinceHire >= checkpoint + 7) return 'overdue';
      if (daysSinceHire >= checkpoint - 3) return 'due';
      return 'pending';
    };

    return {
      day30: getStatus(30, record.retention30),
      day60: getStatus(60, record.retention60),
      day90: getStatus(90, record.retention90),
      daysSinceHire
    };
  }

  // Filter records
  const filtered = orientationRecords.filter(r => {
    if (statusFilter !== 'All' && r.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${r.orientee} ${r.department} ${r.position}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  // KPI calculations
  const activeCount = orientationRecords.filter(r => r.status === 'active').length;
  const completedCount = orientationRecords.filter(r => r.status === 'completed').length;
  const terminatedCount = orientationRecords.filter(r => r.status === 'terminated').length;

  const checkpointsDue = orientationRecords.filter(r => {
    if (r.status !== 'active') return false;
    const status = getRetentionStatus(r);
    return status.day30 === 'due' || status.day60 === 'due' || status.day90 === 'due';
  }).length;

  const checkpointsOverdue = orientationRecords.filter(r => {
    if (r.status !== 'active') return false;
    const status = getRetentionStatus(r);
    return status.day30 === 'overdue' || status.day60 === 'overdue' || status.day90 === 'overdue';
  }).length;

  // 90-day retention rate
  const eligibleFor90 = orientationRecords.filter(r => {
    const days = daysBetween(r.hireDate, today);
    return days >= 90;
  });
  const retained90 = eligibleFor90.filter(r => r.status !== 'terminated' && r.retention90).length;
  const retentionRate = eligibleFor90.length > 0 ? Math.round((retained90 / eligibleFor90.length) * 100) : 100;

  const toggleRetention = (recordId: string, checkpoint: 'retention30' | 'retention60' | 'retention90') => {
    const updated = orientationRecords.map(r => {
      if (r.id === recordId) {
        return { ...r, [checkpoint]: !r[checkpoint] };
      }
      return r;
    });
    setOrientationRecords(updated);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Staff Orientation</h1>
          <p className="text-muted-foreground">Track new hire orientation with 30/60/90-day retention checkpoints</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Orientee
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingRecord ? 'Edit Orientee' : 'Add New Orientee'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Orientee Name *</Label>
                  <Input
                    value={formData.orientee || ''}
                    onChange={(e) => setFormData({ ...formData, orientee: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <Label>Department *</Label>
                  <Select value={formData.department} onValueChange={(v) => setFormData({ ...formData, department: v })}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Position *</Label>
                  <Select value={formData.position} onValueChange={(v) => setFormData({ ...formData, position: v })}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Hire Date *</Label>
                  <Input
                    type="date"
                    value={formData.hireDate || ''}
                    onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as 'active' | 'completed' | 'terminated' })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="terminated">Terminated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.status === 'terminated' && (
                  <div className="col-span-2">
                    <Label>Termination Date</Label>
                    <Input
                      type="date"
                      value={formData.terminationDate || ''}
                      onChange={(e) => setFormData({ ...formData, terminationDate: e.target.value })}
                    />
                  </div>
                )}
                <div className="col-span-2">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes..."
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                <Button onClick={saveRecord} disabled={!formData.orientee || !formData.department || !formData.position || !formData.hireDate}>
                  {editingRecord ? 'Update' : 'Add Orientee'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* KPIs */}
      <KpiGrid>
        <KpiCard
          label="Active Orientees"
          value={activeCount}
          icon={<Users className="w-5 h-5" />}
        />
        <KpiCard
          label="Checkpoints Due"
          value={checkpointsDue}
          icon={<Clock className="w-5 h-5" />}
          status={checkpointsDue > 0 ? 'warning' : 'success'}
        />
        <KpiCard
          label="Overdue"
          value={checkpointsOverdue}
          icon={<AlertCircle className="w-5 h-5" />}
          status={checkpointsOverdue > 0 ? 'error' : 'success'}
        />
        <KpiCard
          label="90-Day Retention"
          value={`${retentionRate}%`}
          icon={<CheckCircle2 className="w-5 h-5" />}
          status={retentionRate >= 80 ? 'success' : retentionRate >= 60 ? 'warning' : 'error'}
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
                  placeholder="Search orientees..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Orientation Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Orientation Records</CardTitle>
          <CardDescription>Click checkboxes to mark retention checkpoints complete</CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No orientation records found</p>
              <p className="text-sm text-muted-foreground">Add your first orientee to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Orientee</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Position</TableHead>
                    <TableHead>Hire Date</TableHead>
                    <TableHead>Days</TableHead>
                    <TableHead className="text-center">30-Day</TableHead>
                    <TableHead className="text-center">60-Day</TableHead>
                    <TableHead className="text-center">90-Day</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(record => {
                    const retStatus = getRetentionStatus(record);

                    const getCheckpointStyle = (status: string) => {
                      switch (status) {
                        case 'completed': return 'text-success';
                        case 'due': return 'text-warning';
                        case 'overdue': return 'text-error';
                        default: return 'text-muted-foreground';
                      }
                    };

                    return (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.orientee}</TableCell>
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
                        <TableCell>{retStatus.daysSinceHire}</TableCell>
                        <TableCell className="text-center">
                          <div className={`flex items-center justify-center ${getCheckpointStyle(retStatus.day30)}`}>
                            <Checkbox
                              checked={record.retention30}
                              onCheckedChange={() => toggleRetention(record.id, 'retention30')}
                              disabled={record.status !== 'active'}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`flex items-center justify-center ${getCheckpointStyle(retStatus.day60)}`}>
                            <Checkbox
                              checked={record.retention60}
                              onCheckedChange={() => toggleRetention(record.id, 'retention60')}
                              disabled={record.status !== 'active'}
                            />
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <div className={`flex items-center justify-center ${getCheckpointStyle(retStatus.day90)}`}>
                            <Checkbox
                              checked={record.retention90}
                              onCheckedChange={() => toggleRetention(record.id, 'retention90')}
                              disabled={record.status !== 'active'}
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.status === 'active' && (
                            <StatusBadge status="warning">
                              <Clock className="w-3 h-3" /> Active
                            </StatusBadge>
                          )}
                          {record.status === 'completed' && (
                            <StatusBadge status="success">
                              <CheckCircle2 className="w-3 h-3" /> Complete
                            </StatusBadge>
                          )}
                          {record.status === 'terminated' && (
                            <StatusBadge status="error">
                              <AlertCircle className="w-3 h-3" /> Terminated
                            </StatusBadge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(record)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Legend */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-muted-foreground"></div>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning"></div>
              <span>Due (within 3 days)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-error"></div>
              <span>Overdue (7+ days past)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success"></div>
              <span>Completed</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
