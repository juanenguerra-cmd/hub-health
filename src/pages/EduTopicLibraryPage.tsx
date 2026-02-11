import { Fragment, useEffect, useMemo, useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationEllipsis,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from '@/components/ui/pagination';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { EducationSessionFormModal } from '@/components/education/EducationSessionFormModal';
import { AdvancedFilterPanel } from '@/components/education/AdvancedFilterPanel';
import { useEducationFilters } from '@/hooks/use-education-filters';
import { todayYMD } from '@/lib/calculations';
import {
  categorizeByKeywords,
  getAllCategoriesByPriority,
  getCategoryMetadata,
  parseFTags,
  type CMSCategory
} from '@/lib/regulatory-categories';
import type { EduTopic, EducationSession } from '@/types/nurse-educator';
import {
  Plus,
  BookOpen,
  Download,
  Upload,
  Edit2,
  Calendar,
  Archive,
  RotateCcw,
  FileText,
  Tag,
  ClipboardCheck,
  ChevronDown,
  CheckCircle2,
  Sparkles,
  Play
} from 'lucide-react';

export function EduTopicLibraryPage() {
  const { eduLibrary, setEduLibrary, templates, setActiveTab, eduSessions, setEduSessions } = useApp();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<EduTopic | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionPrefill, setSessionPrefill] = useState<Partial<EducationSession> | null>(null);
  const [topicsPage, setTopicsPage] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EduTopic>>({
    topic: '',
    regulatoryCategory: undefined,
    category: '',
    description: '',
    purpose: '',
    disciplines: '',
    ftags: '',
    nysdohRegs: '',
    facilityPolicy: '',
    nysdohRequired: false
  });

  const {
    filters,
    updateFilter,
    resetFilters,
    hasActiveFilters,
    filteredTopics,
    filterStats,
    availableFTags,
    availableDisciplines
  } = useEducationFilters(eduLibrary);

  const resetForm = () => {
    setFormData({
      topic: '',
      regulatoryCategory: undefined,
      category: '',
      description: '',
      purpose: '',
      disciplines: '',
      ftags: '',
      nysdohRegs: '',
      facilityPolicy: '',
      nysdohRequired: false
    });
    setEditingTopic(null);
  };

  const openEdit = (topic: EduTopic) => {
    setEditingTopic(topic);
    setFormData({ ...topic });
    setDialogOpen(true);
  };

  const saveTopic = () => {
    if (!formData.topic) return;

    if (editingTopic) {
      // Update existing
      const updated = eduLibrary.map(t =>
        t.id === editingTopic.id ? { ...t, ...formData } : t
      );
      setEduLibrary(updated);
      toast({ title: 'Topic Updated', description: `"${formData.topic}" has been updated.` });
    } else {
      // Create new
      const newTopic: EduTopic = {
        id: `edu_topic_${Date.now().toString(16)}`,
        topic: formData.topic!,
        regulatoryCategory: formData.regulatoryCategory || categorizeByKeywords(
          formData.topic || '',
          formData.ftags || '',
          formData.nysdohRegs || '',
          formData.purpose || ''
        ),
        category: formData.category || '',
        description: formData.description || '',
        purpose: formData.purpose || '',
        disciplines: formData.disciplines || '',
        ftags: formData.ftags || '',
        nysdohRegs: formData.nysdohRegs || '',
        facilityPolicy: formData.facilityPolicy || '',
        nysdohRequired: Boolean(formData.nysdohRequired),
        archived: false
      };
      setEduLibrary([...eduLibrary, newTopic]);
      toast({ title: 'Topic Created', description: `"${formData.topic}" has been added to the library.` });
    }

    resetForm();
    setDialogOpen(false);
  };

  const archiveTopic = (topicId: string) => {
    const now = new Date().toISOString();
    const updated = eduLibrary.map(t =>
      t.id === topicId ? { ...t, archived: true, archivedAt: now } : t
    );
    setEduLibrary(updated);
    toast({ title: 'Topic Archived', description: 'The topic has been archived.' });
  };

  const restoreTopic = (topicId: string) => {
    const updated = eduLibrary.map(t =>
      t.id === topicId ? { ...t, archived: false, archivedAt: undefined } : t
    );
    setEduLibrary(updated);
    toast({ title: 'Topic Restored', description: 'The topic has been restored.' });
  };

  const TOPICS_PER_PAGE = 10;
  const totalTopicPages = Math.max(1, Math.ceil(filteredTopics.length / TOPICS_PER_PAGE));
  const safeTopicsPage = Math.min(topicsPage, totalTopicPages);
  const pageStart = (safeTopicsPage - 1) * TOPICS_PER_PAGE;
  const pagedTopics = filteredTopics.slice(pageStart, pageStart + TOPICS_PER_PAGE);

  useEffect(() => {
    setTopicsPage(1);
  }, [filters, filteredTopics.length]);

  const pagedTopicGroups = useMemo(() => {
    return pagedTopics
      .slice()
      .sort((a, b) => a.topic.localeCompare(b.topic));
  }, [pagedTopics]);

  const pageNumbers = useMemo(() => {
    if (totalTopicPages <= 7) {
      return Array.from({ length: totalTopicPages }, (_, index) => index + 1);
    }

    const pages = new Set<number>([1, totalTopicPages, safeTopicsPage]);
    for (let offset = 1; offset <= 1; offset += 1) {
      pages.add(Math.max(1, safeTopicsPage - offset));
      pages.add(Math.min(totalTopicPages, safeTopicsPage + offset));
    }

    return Array.from(pages).sort((a, b) => a - b);
  }, [safeTopicsPage, totalTopicPages]);

  const toggleExpanded = (id: string) => {
    setExpandedTopics(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getTriggerAuditTitle = (auditId: string | undefined) => {
    if (!auditId) return null;
    const template = templates.find(t => t.id === auditId);
    return template?.title || null;
  };

  const runTriggerAudit = (auditId: string) => {
    // Navigate to templates page - in future, could go directly to audit wizard
    setActiveTab('templates');
    toast({
      title: 'Navigate to Templates',
      description: 'Select the audit template to run a new session.'
    });
  };

  const buildNotesFromTopic = (topic: EduTopic): string => {
    const parts: string[] = [];
    if (topic.ftags) {
      parts.push(`F-Tags: ${topic.ftags}`);
    }
    if (topic.nysdohRegs) {
      parts.push(`NYSDOH: ${topic.nysdohRegs}`);
    }
    if (topic.facilityPolicy) {
      parts.push(`Policy: ${topic.facilityPolicy}`);
    }
    return parts.join('\n');
  };

  const openQuickSession = (topic: EduTopic, status: 'planned' | 'completed') => {
    const today = todayYMD();
    setSessionPrefill({
      topic: topic.topic,
      summary: topic.description || topic.purpose || '',
      audience: topic.disciplines || '',
      notes: buildNotesFromTopic(topic),
      status,
      scheduledDate: status === 'planned' ? today : '',
      completedDate: status === 'completed' ? today : ''
    });
    setShowSessionModal(true);
  };

  const handleSaveSession = (session: EducationSession) => {
    const exists = eduSessions.find(s => s.id === session.id);
    if (exists) {
      setEduSessions(eduSessions.map(s => s.id === session.id ? session : s));
    } else {
      setEduSessions([session, ...eduSessions]);
    }
  };

  // CSV Export
  const exportCsv = () => {
    const headers = ['Regulatory Category', 'Legacy Category', 'Priority', 'NYSDOH Required', 'Topic', 'Description', 'Purpose', 'Disciplines', 'F-Tags', 'NYSDOH Regs', 'Facility Policy', 'Archived'];
    const rows = eduLibrary.map(t => [
      `"${(t.regulatoryCategory || categorizeByKeywords(t.topic, t.ftags, t.nysdohRegs || '', t.purpose)).replace(/"/g, '""')}"`,
      `"${(t.category || '').replace(/"/g, '""')}"`,
      `"${(t.priority || getCategoryMetadata(t.regulatoryCategory || categorizeByKeywords(t.topic, t.ftags, t.nysdohRegs || '', t.purpose)).priority).replace(/"/g, '""')}"`,
      t.nysdohRequired ? 'Yes' : 'No',
      `"${(t.topic || '').replace(/"/g, '""')}"`,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${(t.purpose || '').replace(/"/g, '""')}"`,
      `"${(t.disciplines || '').replace(/"/g, '""')}"`,
      `"${(t.ftags || '').replace(/"/g, '""')}"`,
      `"${(t.nysdohRegs || '').replace(/"/g, '""')}"`,
      `"${(t.facilityPolicy || '').replace(/"/g, '""')}"`,
      t.archived ? 'Yes' : 'No'
    ]);

    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `education-topic-library-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast({ title: 'Export Complete', description: `${eduLibrary.length} topics exported to CSV.` });
  };

  // CSV Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const text = evt.target?.result as string;
        const lines = text.split('\n').filter(l => l.trim());
        if (lines.length < 2) {
          toast({ title: 'Import Error', description: 'CSV file is empty or invalid.', variant: 'destructive' });
          return;
        }

        // Parse CSV - handle quoted fields
        const parseCSVLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;

          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
              if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++;
              } else {
                inQuotes = !inQuotes;
              }
            } else if (char === ',' && !inQuotes) {
              result.push(current.trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/[^a-z]/g, ''));
        const imported: EduTopic[] = [];

        for (let i = 1; i < lines.length; i++) {
          const values = parseCSVLine(lines[i]);
          if (values.length < 2) continue;

          const categoryIdx = headers.findIndex(h => h.includes('category'));
          const regCategoryIdx = headers.findIndex(h => h.includes('regulatorycategory'));
          const priorityIdx = headers.findIndex(h => h.includes('priority'));
          const requiredIdx = headers.findIndex(h => h.includes('required'));
          const topicIdx = headers.findIndex(h => h.includes('topic'));
          const descIdx = headers.findIndex(h => h.includes('description'));
          const purposeIdx = headers.findIndex(h => h.includes('purpose'));
          const discIdx = headers.findIndex(h => h.includes('discipline'));
          const ftagIdx = headers.findIndex(h => h.includes('ftag') || h.includes('tag'));
          const regIdx = headers.findIndex(h => h.includes('nysdoh') || h.includes('reg'));
          const policyIdx = headers.findIndex(h => h.includes('policy'));

          const topic = values[topicIdx >= 0 ? topicIdx : 0] || '';
          if (!topic) continue;

          imported.push({
            id: `edu_topic_import_${Date.now().toString(16)}_${i}`,
            topic,
            regulatoryCategory: values[regCategoryIdx] as CMSCategory || undefined,
            category: values[categoryIdx] || '',
            priority: values[priorityIdx] as EduTopic['priority'] || undefined,
            nysdohRequired: /^yes|true|1$/i.test(values[requiredIdx] || ''),
            description: values[descIdx] || '',
            purpose: values[purposeIdx] || '',
            disciplines: values[discIdx] || '',
            ftags: values[ftagIdx] || '',
            nysdohRegs: values[regIdx] || '',
            facilityPolicy: values[policyIdx] || '',
            archived: false
          });
        }

        if (imported.length > 0) {
          // Merge: add new topics, don't duplicate by topic name
          const existingTopics = new Set(eduLibrary.map(t => t.topic.toLowerCase()));
          const newTopics = imported.filter(t => !existingTopics.has(t.topic.toLowerCase()));
          setEduLibrary([...eduLibrary, ...newTopics]);
          toast({
            title: 'Import Complete',
            description: `${newTopics.length} new topics imported (${imported.length - newTopics.length} duplicates skipped).`
          });
        } else {
          toast({ title: 'Import Error', description: 'No valid topics found in CSV.', variant: 'destructive' });
        }
      } catch (err) {
        toast({ title: 'Import Error', description: 'Failed to parse CSV file.', variant: 'destructive' });
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const activeCount = eduLibrary.filter(t => !t.archived).length;
  const archivedCount = eduLibrary.filter(t => t.archived).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Education Topic Library</h1>
          <p className="text-muted-foreground">Manage education topics with regulatory references</p>
        </div>
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleImport}
            className="hidden"
          />
          <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="gap-2">
            <Upload className="w-4 h-4" />
            Import CSV
          </Button>
          <Button variant="outline" onClick={exportCsv} className="gap-2">
            <Download className="w-4 h-4" />
            Export CSV
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Topic
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingTopic ? 'Edit Topic' : 'Add New Topic'}</DialogTitle>
                <DialogDescription>
                  {editingTopic ? 'Update the education topic details.' : 'Add a new topic to your inservice library.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label>Topic Title *</Label>
                  <Input
                    value={formData.topic || ''}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    placeholder="e.g., Hand Hygiene — 5 Moments + Glove Change"
                  />
                </div>
                <div>
                  <Label>Regulatory Category *</Label>
                  <Select
                    value={formData.regulatoryCategory || 'unselected'}
                    onValueChange={(value) => setFormData({ ...formData, regulatoryCategory: value === 'unselected' ? undefined : value as CMSCategory })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select regulatory category..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-[320px]">
                      <SelectItem value="unselected">Select regulatory category...</SelectItem>
                      {getAllCategoriesByPriority().map(cat => (
                        <SelectItem key={cat.name} value={cat.name}>
                          <div className="whitespace-normal break-words leading-snug">
                            {cat.name} ({cat.ftagRange})
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-2 mt-2"
                    onClick={() => {
                      const suggested = categorizeByKeywords(
                        formData.topic || '',
                        formData.ftags || '',
                        formData.nysdohRegs || '',
                        formData.purpose || ''
                      );
                      setFormData({ ...formData, regulatoryCategory: suggested });
                      toast({ title: 'Category Suggested', description: suggested });
                    }}
                  >
                    <Sparkles className="w-4 h-4" />
                    Auto-Suggest Category
                  </Button>
                </div>
                <div>
                  <Label>Purpose</Label>
                  <Input
                    value={formData.purpose || ''}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    placeholder="Why this education matters..."
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Key learning objectives and content..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Disciplines</Label>
                    <Input
                      value={formData.disciplines || ''}
                      onChange={(e) => setFormData({ ...formData, disciplines: e.target.value })}
                      placeholder="e.g., Nursing; CNA; All staff"
                    />
                  </div>
                  <div>
                    <Label>F-Tags</Label>
                    <Input
                      value={formData.ftags || ''}
                      onChange={(e) => setFormData({ ...formData, ftags: e.target.value })}
                      placeholder="e.g., F880;F689"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="nysdoh-required"
                    checked={formData.nysdohRequired || false}
                    onCheckedChange={(checked) => setFormData({ ...formData, nysdohRequired: checked })}
                  />
                  <Label htmlFor="nysdoh-required" className="text-sm">
                    NYSDOH Annual Required Training (10 NYCRR 415.26)
                  </Label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>NYSDOH Regulations</Label>
                    <Input
                      value={formData.nysdohRegs || ''}
                      onChange={(e) => setFormData({ ...formData, nysdohRegs: e.target.value })}
                      placeholder="e.g., 10 NYCRR 415.19"
                    />
                  </div>
                  <div>
                    <Label>Facility Policy</Label>
                    <Input
                      value={formData.facilityPolicy || ''}
                      onChange={(e) => setFormData({ ...formData, facilityPolicy: e.target.value })}
                      placeholder="e.g., IC-001"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
                  <Button onClick={saveTopic} disabled={!formData.topic}>
                    {editingTopic ? 'Update' : 'Add Topic'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <AdvancedFilterPanel
            filters={filters}
            updateFilter={updateFilter}
            resetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
            filterStats={filterStats}
            availableFTags={availableFTags}
            availableDisciplines={availableDisciplines}
          />
        </div>

        <div className="lg:col-span-2">
          <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {filters.showArchived ? 'Archived Topics' : 'Active Topics'}
          </CardTitle>
          <CardDescription>
            {hasActiveFilters
              ? <span className="text-primary font-medium">Filtered results — {filteredTopics.length} topic{filteredTopics.length === 1 ? '' : 's'}</span>
              : 'Education topics with regulatory references'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTopics.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No topics match your filters</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={resetFilters} className="mt-4">Clear Filters</Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {pagedTopicGroups.map((topic) => {
                            const resolvedCategory = topic.regulatoryCategory || categorizeByKeywords(
                              topic.topic,
                              topic.ftags,
                              topic.nysdohRegs || '',
                              topic.purpose
                            );
                            const categoryMetadata = getCategoryMetadata(resolvedCategory);
                            const isExpanded = expandedTopics.has(topic.id);
                            const triggerAuditTitle = getTriggerAuditTitle(topic.triggerAuditId);
                            const hasExtras = topic.triggerAuditId || (topic.evidenceArtifacts && topic.evidenceArtifacts.length > 0);

                            return (
                              <Card key={topic.id} className={`border shadow-none ${topic.archived ? 'opacity-60' : ''}`}>
                                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(topic.id)}>
                                  <div className="px-3 py-2">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <FileText className="w-4 h-4 text-primary shrink-0" />
                                          <span className="font-medium">{topic.topic}</span>
                                          <Badge variant={categoryMetadata.priority === 'critical' ? 'destructive' : 'secondary'} className="text-xs">
                                            {resolvedCategory}
                                          </Badge>
                                          {parseFTags(topic.ftags).map((tag, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              <Tag className="w-3 h-3 mr-1" />
                                              {tag.trim()}
                                            </Badge>
                                          ))}
                                          <Badge variant={(topic.priority || categoryMetadata.priority) === 'critical' ? 'destructive' : 'secondary'} className="text-xs uppercase">
                                            {topic.priority || categoryMetadata.priority}
                                          </Badge>
                                          {topic.nysdohRequired && <Badge variant="outline" className="text-xs">NYSDOH Required</Badge>}
                                          {topic.triggerAuditId && (
                                            <Badge variant="secondary" className="text-xs gap-1">
                                              <ClipboardCheck className="w-3 h-3" />
                                              Has Audit
                                            </Badge>
                                          )}
                                        </div>
                                        {topic.purpose && (
                                          <p className="text-sm text-muted-foreground mt-1">{topic.purpose}</p>
                                        )}
                                        <div className="flex flex-wrap gap-4 mt-2 text-xs text-muted-foreground">
                                          <span><strong>Disciplines:</strong> {topic.disciplines || '—'}</span>
                                          <span><strong>NYSDOH:</strong> {topic.nysdohRegs || '—'}</span>
                                          {topic.facilityPolicy && <span><strong>Policy:</strong> {topic.facilityPolicy}</span>}
                                          <span><strong>Potential Audit Tool:</strong> {triggerAuditTitle || 'Not mapped yet'}</span>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {hasExtras && (
                                          <CollapsibleTrigger asChild>
                                            <Button variant="ghost" size="sm" className="gap-1">
                                              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                              Details
                                            </Button>
                                          </CollapsibleTrigger>
                                        )}
                                        {!topic.archived && (
                                          <>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => openQuickSession(topic, 'planned')}
                                              title="Plan inservice"
                                            >
                                              <Calendar className="w-4 h-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => openQuickSession(topic, 'completed')}
                                              title="Log completed inservice"
                                            >
                                              <CheckCircle2 className="w-4 h-4" />
                                            </Button>
                                          </>
                                        )}
                                        <Button variant="ghost" size="sm" onClick={() => openEdit(topic)}>
                                          <Edit2 className="w-4 h-4" />
                                        </Button>
                                        {topic.archived ? (
                                          <Button variant="ghost" size="sm" onClick={() => restoreTopic(topic.id)} title="Restore">
                                            <RotateCcw className="w-4 h-4" />
                                          </Button>
                                        ) : (
                                          <Button variant="ghost" size="sm" onClick={() => archiveTopic(topic.id)} title="Archive">
                                            <Archive className="w-4 h-4" />
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  <CollapsibleContent>
                                    <div className="px-3 pb-3 pt-0 border-t border-border mt-1">
                                      <div className="grid md:grid-cols-2 gap-4 pt-4">
                            {/* Trigger Audit Section */}
                            {topic.triggerAuditId && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <ClipboardCheck className="w-4 h-4 text-primary" />
                                  Trigger Audit
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <p className="text-sm font-medium">{triggerAuditTitle || topic.triggerAuditId}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    Use this audit to verify staff competency after education
                                  </p>
                                  <Button 
                                    size="sm" 
                                    className="mt-2 gap-2"
                                    onClick={() => runTriggerAudit(topic.triggerAuditId!)}
                                  >
                                    <Play className="w-3 h-3" />
                                    Run Audit
                                  </Button>
                                </div>
                              </div>
                            )}
                            
                            {/* Evidence Artifacts Section */}
                            {topic.evidenceArtifacts && topic.evidenceArtifacts.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="text-sm font-semibold flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-primary" />
                                  Evidence Artifacts
                                </h4>
                                <div className="bg-muted/50 rounded-lg p-3">
                                  <ul className="space-y-1">
                                    {topic.evidenceArtifacts.map((artifact, i) => (
                                      <li key={i} className="text-sm flex items-start gap-2">
                                        <span className="text-primary mt-0.5">•</span>
                                        {artifact}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </div>
                          
                          {topic.description && (
                            <div className="mt-4">
                              <h4 className="text-sm font-semibold mb-1">Description</h4>
                              <p className="text-sm text-muted-foreground">{topic.description}</p>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}

          {filteredTopics.length > 0 && (
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-muted-foreground">
                Showing {pageStart + 1}-{Math.min(pageStart + TOPICS_PER_PAGE, filteredTopics.length)} of {filteredTopics.length} topics
              </p>
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      className={safeTopicsPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      onClick={(event) => {
                        event.preventDefault();
                        setTopicsPage((prev) => Math.max(1, prev - 1));
                      }}
                    />
                  </PaginationItem>
                  {pageNumbers.map((pageNumber, index) => {
                    const previous = pageNumbers[index - 1];
                    const needsEllipsis = previous && pageNumber - previous > 1;

                    return (
                      <Fragment key={`page-${pageNumber}`}>
                        {needsEllipsis && (
                          <PaginationItem>
                            <PaginationEllipsis />
                          </PaginationItem>
                        )}
                        <PaginationItem>
                          <PaginationLink
                            href="#"
                            isActive={pageNumber === safeTopicsPage}
                            onClick={(event) => {
                              event.preventDefault();
                              setTopicsPage(pageNumber);
                            }}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      </Fragment>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      className={safeTopicsPage === totalTopicPages ? 'pointer-events-none opacity-50' : ''}
                      onClick={(event) => {
                        event.preventDefault();
                        setTopicsPage((prev) => Math.min(totalTopicPages, prev + 1));
                      }}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
          </Card>
        </div>
      </div>
      <EducationSessionFormModal
        open={showSessionModal}
        onOpenChange={(open) => {
          setShowSessionModal(open);
          if (!open) {
            setSessionPrefill(null);
          }
        }}
        onSave={handleSaveSession}
        eduLibrary={eduLibrary}
        prefill={sessionPrefill}
      />
    </div>
  );
}
