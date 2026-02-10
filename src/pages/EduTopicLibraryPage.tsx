import { useMemo, useState, useRef } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { toast } from '@/hooks/use-toast';
import { EducationSessionFormModal } from '@/components/education/EducationSessionFormModal';
import { todayYMD } from '@/lib/calculations';
import type { EduTopic, EducationSession } from '@/types/nurse-educator';
import {
  Search,
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
  ListFilter,
  Play
} from 'lucide-react';

export function EduTopicLibraryPage() {
  const { eduLibrary, setEduLibrary, templates, setActiveTab, eduSessions, setEduSessions } = useApp();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showArchived, setShowArchived] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState<EduTopic | null>(null);
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionPrefill, setSessionPrefill] = useState<Partial<EducationSession> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<EduTopic>>({
    topic: '',
    category: '',
    description: '',
    purpose: '',
    disciplines: '',
    ftags: '',
    nysdohRegs: '',
    facilityPolicy: ''
  });

  const resetForm = () => {
    setFormData({
      topic: '',
      category: '',
      description: '',
      purpose: '',
      disciplines: '',
      ftags: '',
      nysdohRegs: '',
      facilityPolicy: ''
    });
    setEditingTopic(null);
  };

  const openEdit = (topic: EduTopic) => {
    setEditingTopic(topic);
    setFormData({ ...topic });
    setDialogOpen(true);
  };


  const normalizeCategory = (value: string) => value.trim() || 'Uncategorized';

  const inferCategory = (topic: EduTopic): string => {
    if (topic.category && topic.category.trim()) {
      return topic.category.trim();
    }

    const haystack = `${topic.topic} ${topic.purpose} ${topic.ftags}`.toLowerCase();

    if (haystack.includes('orientation') || haystack.includes('onboarding')) return 'Orientation';
    if (haystack.includes('medication') || haystack.includes('med pass')) return 'Medication Safety';
    if (haystack.includes('fall') || haystack.includes('pressure') || haystack.includes('wound')) return 'Clinical Safety';
    if (haystack.includes('documentation') || haystack.includes('chart')) return 'Documentation';
    if (haystack.includes('abuse') || haystack.includes('resident rights') || haystack.includes('dementia')) return 'Resident Care & Rights';
    if (haystack.includes('infection') || haystack.includes('ipcp') || haystack.includes('ppe') || haystack.includes('hand hygiene') || haystack.includes('f880')) return 'Infection Prevention';

    return 'General Education';
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
        category: normalizeCategory(formData.category || ''),
        description: formData.description || '',
        purpose: formData.purpose || '',
        disciplines: formData.disciplines || '',
        ftags: formData.ftags || '',
        nysdohRegs: formData.nysdohRegs || '',
        facilityPolicy: formData.facilityPolicy || '',
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

  // Filter topics
  const filtered = eduLibrary.filter(t => {
    if (!showArchived && t.archived) return false;
    if (showArchived && !t.archived) return false;
    if (selectedCategory !== 'all' && inferCategory(t) !== selectedCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${t.topic} ${t.category || ''} ${t.disciplines} ${t.ftags} ${t.purpose}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const categories = useMemo(() => {
    const all = eduLibrary
      .filter(t => (showArchived ? t.archived : !t.archived))
      .map(inferCategory);
    return Array.from(new Set(all)).sort((a, b) => a.localeCompare(b));
  }, [eduLibrary, showArchived]);

  const groupedTopics = useMemo(() => {
    const groups = new Map<string, EduTopic[]>();
    filtered.forEach(topic => {
      const category = inferCategory(topic);
      const items = groups.get(category) || [];
      items.push(topic);
      groups.set(category, items);
    });

    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([category, topics]) => ({
        category,
        topics: topics.sort((a, b) => a.topic.localeCompare(b.topic))
      }));
  }, [filtered]);

  const toggleCategoryExpanded = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

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
    const headers = ['Category', 'Topic', 'Description', 'Purpose', 'Disciplines', 'F-Tags', 'NYSDOH Regs', 'Facility Policy', 'Archived'];
    const rows = eduLibrary.map(t => [
      `"${inferCategory(t).replace(/"/g, '""')}"`,
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
            category: values[categoryIdx] || '',
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
                  <Label>Category</Label>
                  <Input
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Infection Prevention"
                  />
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

      {/* Stats & Filter */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search topics..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <ListFilter className="w-4 h-4 text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="all">All categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <Badge variant="secondary">{activeCount} Active</Badge>
              <Badge variant="outline">{archivedCount} Archived</Badge>
              <div className="flex items-center gap-2">
                <Switch checked={showArchived} onCheckedChange={setShowArchived} id="show-archived" />
                <Label htmlFor="show-archived" className="text-sm">Show Archived</Label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Topics Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {showArchived ? 'Archived Topics' : 'Active Topics'}
          </CardTitle>
          <CardDescription>
            {showArchived
              ? 'Previously used topics preserved for historical reference'
              : 'Education topics with regulatory and policy references'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="font-medium">No topics found</p>
              <p className="text-sm text-muted-foreground">
                {showArchived ? 'No archived topics' : 'Add your first education topic'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {groupedTopics.map(group => {
                const categoryOpen = expandedCategories.size === 0 || expandedCategories.has(group.category);

                return (
                  <Card key={group.category}>
                    <Collapsible open={categoryOpen} onOpenChange={() => toggleCategoryExpanded(group.category)}>
                      <CollapsibleTrigger asChild>
                        <button type="button" className="w-full p-4 flex items-center justify-between text-left hover:bg-muted/40 rounded-t-lg">
                          <div className="flex items-center gap-2">
                            <Badge>{group.category}</Badge>
                            <span className="text-sm text-muted-foreground">{group.topics.length} topic{group.topics.length === 1 ? '' : 's'}</span>
                          </div>
                          <ChevronDown className={`w-4 h-4 transition-transform ${categoryOpen ? 'rotate-180' : ''}`} />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-4 pb-4 space-y-2 border-t border-border">
                          {group.topics.map(topic => {
                            const isExpanded = expandedTopics.has(topic.id);
                            const triggerAuditTitle = getTriggerAuditTitle(topic.triggerAuditId);
                            const hasExtras = topic.triggerAuditId || (topic.evidenceArtifacts && topic.evidenceArtifacts.length > 0);

                            return (
                              <Card key={topic.id} className={`${topic.archived ? 'opacity-60' : ''}`}>
                                <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(topic.id)}>
                                  <div className="p-4">
                                    <div className="flex items-start justify-between gap-4">
                                      <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <FileText className="w-4 h-4 text-primary shrink-0" />
                                          <span className="font-medium">{topic.topic}</span>
                                          {topic.ftags && topic.ftags.split(';').map((tag, i) => (
                                            <Badge key={i} variant="outline" className="text-xs">
                                              <Tag className="w-3 h-3 mr-1" />
                                              {tag.trim()}
                                            </Badge>
                                          ))}
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
                                    <div className="px-4 pb-4 pt-0 border-t border-border mt-2">
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
                      </CollapsibleContent>
                    </Collapsible>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
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
