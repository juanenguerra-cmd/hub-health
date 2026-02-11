import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Trash2, 
  GripVertical, 
  Save, 
  X, 
  AlertTriangle,
  FileText,
  Settings,
  History,
  ChevronUp,
  ChevronDown
} from 'lucide-react';
import type { AuditTemplate, TemplateQuestion } from '@/types/nurse-educator';
import type { TemplateChange } from '@/types/template-history';
import { bumpVersion, addTemplateChange, getTemplateChanges } from '@/lib/template-history-storage';

interface TemplateEditorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  template: AuditTemplate | null;
  onSave: (template: AuditTemplate, changes: string[]) => void;
}

const QUESTION_TYPES = [
  { value: 'yn', label: 'Yes/No' },
  { value: 'ynna', label: 'Yes/No/N-A' },
  { value: 'text', label: 'Text' },
  { value: 'patientCode', label: 'Patient Code' },
  { value: 'select', label: 'Select (Options)' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' }
];

const CATEGORIES = [
  'Respiratory',
  'Infection Control',
  'Safety',
  'Regulatory',
  'Education',
  'Nutrition',
  'Medication',
  'Documentation',
  'Environment',
  'Other'
];

export function TemplateEditorModal({ open, onOpenChange, template, onSave }: TemplateEditorModalProps) {
  const [editedTemplate, setEditedTemplate] = useState<AuditTemplate | null>(null);
  const [activeTab, setActiveTab] = useState('questions');
  const [history, setHistory] = useState<TemplateChange[]>([]);
  const [pendingChanges, setPendingChanges] = useState<string[]>([]);

  useEffect(() => {
    if (template) {
      setEditedTemplate(JSON.parse(JSON.stringify(template)));
      setHistory(getTemplateChanges(template.id));
      setPendingChanges([]);
    }
  }, [template]);

  if (!editedTemplate) return null;

  const addChange = (description: string) => {
    if (!pendingChanges.includes(description)) {
      setPendingChanges([...pendingChanges, description]);
    }
  };

  // Question management
  const addQuestion = () => {
    const newKey = `q_${Math.random().toString(16).slice(2, 8)}`;
    const newQuestion: TemplateQuestion = {
      key: newKey,
      label: 'New Question',
      type: 'yn',
      required: false,
      score: 10
    };
    setEditedTemplate({
      ...editedTemplate,
      sampleQuestions: [...editedTemplate.sampleQuestions, newQuestion]
    });
    addChange('Added new question');
  };

  const updateQuestion = (index: number, updates: Partial<TemplateQuestion>) => {
    const questions = [...editedTemplate.sampleQuestions];
    questions[index] = { ...questions[index], ...updates };
    setEditedTemplate({ ...editedTemplate, sampleQuestions: questions });
    addChange(`Modified question: ${questions[index].label}`);
  };

  const removeQuestion = (index: number) => {
    const removedLabel = editedTemplate.sampleQuestions[index].label;
    const questions = editedTemplate.sampleQuestions.filter((_, i) => i !== index);
    
    // Also remove from critical fail keys if present
    const removedKey = editedTemplate.sampleQuestions[index].key;
    const criticalKeys = editedTemplate.criticalFailKeys.filter(k => k !== removedKey);
    
    setEditedTemplate({ 
      ...editedTemplate, 
      sampleQuestions: questions,
      criticalFailKeys: criticalKeys
    });
    addChange(`Removed question: ${removedLabel}`);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const questions = [...editedTemplate.sampleQuestions];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    
    [questions[index], questions[newIndex]] = [questions[newIndex], questions[index]];
    setEditedTemplate({ ...editedTemplate, sampleQuestions: questions });
    addChange('Reordered questions');
  };

  const toggleCriticalFail = (key: string) => {
    const criticalKeys = editedTemplate.criticalFailKeys.includes(key)
      ? editedTemplate.criticalFailKeys.filter(k => k !== key)
      : [...editedTemplate.criticalFailKeys, key];
    setEditedTemplate({ ...editedTemplate, criticalFailKeys: criticalKeys });
    addChange(`Changed critical fail status`);
  };

  // Calculate total score
  const totalScore = editedTemplate.sampleQuestions.reduce((sum, q) => sum + (q.score || 0), 0);

  // Handle save
  const handleSave = () => {
    if (pendingChanges.length === 0) {
      onOpenChange(false);
      return;
    }

    // Bump version
    const newVersion = bumpVersion(editedTemplate.version, 'patch');
    const updatedTemplate = { ...editedTemplate, version: newVersion };

    // Record history
    const changeRecord: TemplateChange = {
      id: `ch_${Math.random().toString(16).slice(2, 10)}`,
      templateId: editedTemplate.id,
      version: newVersion,
      previousVersion: template?.version || '1.0.0',
      changedAt: new Date().toISOString(),
      changedBy: 'User',
      changeType: pendingChanges.some(c => c.includes('Added')) ? 'question_added' 
        : pendingChanges.some(c => c.includes('Removed')) ? 'question_removed'
        : 'question_modified',
      changeDescription: pendingChanges.join('; '),
      details: []
    };

    addTemplateChange(changeRecord);
    onSave(updatedTemplate, pendingChanges);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Edit Template: {editedTemplate.title}
          </DialogTitle>
          <DialogDescription>
            v{editedTemplate.version} • {editedTemplate.category} • 
            {pendingChanges.length > 0 && (
              <span className="text-warning ml-2">
                {pendingChanges.length} pending change{pendingChanges.length !== 1 && 's'}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="px-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="questions" className="gap-2">
                <FileText className="w-4 h-4" />
                Questions ({editedTemplate.sampleQuestions.length})
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="w-4 h-4" />
                History ({history.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <ScrollArea className="h-[55vh] mt-4">
            <div className="px-6">
              {/* Questions Tab */}
              <TabsContent value="questions" className="mt-0 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Total Score: <strong>{totalScore} pts</strong>
                    </span>
                    <Badge variant="outline">
                      Passing: {editedTemplate.passingThreshold}%
                    </Badge>
                  </div>
                  <Button size="sm" onClick={addQuestion} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>

                <div className="space-y-3">
                  {editedTemplate.sampleQuestions.map((q, idx) => (
                    <div 
                      key={q.key} 
                      className={`border rounded-lg p-4 bg-muted/20 ${
                      editedTemplate.criticalFailKeys.includes(q.key)
                          ? 'border-destructive/50 bg-destructive/5' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex flex-col gap-1 mt-1">
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => moveQuestion(idx, 'up')}
                            disabled={idx === 0}
                          >
                            <ChevronUp className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={() => moveQuestion(idx, 'down')}
                            disabled={idx === editedTemplate.sampleQuestions.length - 1}
                          >
                            <ChevronDown className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label className="text-xs">Question Label</Label>
                              <Input
                                value={q.label}
                                onChange={(e) => updateQuestion(idx, { label: e.target.value })}
                                placeholder="Question text..."
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <Label className="text-xs">Type</Label>
                                <Select 
                                  value={q.type} 
                                  onValueChange={(value) => updateQuestion(idx, { type: value as TemplateQuestion['type'] })}
                                >
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {QUESTION_TYPES.map(t => (
                                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-1">
                                <Label className="text-xs">Score</Label>
                                <Input
                                  type="number"
                                  min={0}
                                  value={q.score}
                                  onChange={(e) => updateQuestion(idx, { score: parseInt(e.target.value) || 0 })}
                                />
                              </div>
                            </div>
                          </div>

                          {q.type === 'select' && (
                            <div className="space-y-1">
                              <Label className="text-xs">Options (comma-separated)</Label>
                              <Input
                                value={q.options?.join(', ') || ''}
                                onChange={(e) => updateQuestion(idx, { 
                                  options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                                })}
                                placeholder="Option 1, Option 2, Option 3"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={q.required}
                                onCheckedChange={(checked) => updateQuestion(idx, { required: !!checked })}
                              />
                              <Label className="text-xs">Required</Label>
                            </div>
                            <div className="flex items-center gap-2">
                              <Checkbox
                                checked={editedTemplate.criticalFailKeys.includes(q.key)}
                                onCheckedChange={() => toggleCriticalFail(q.key)}
                              />
                              <Label className="text-xs text-destructive flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3" />
                                Critical Fail
                              </Label>
                            </div>
                          </div>
                        </div>

                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeQuestion(idx)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Settings Tab */}
              <TabsContent value="settings" className="mt-0 space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label>Template Title</Label>
                    <Input
                      value={editedTemplate.title}
                      onChange={(e) => {
                        setEditedTemplate({ ...editedTemplate, title: e.target.value });
                        addChange('Changed template title');
                      }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select 
                        value={editedTemplate.category}
                        onValueChange={(value) => {
                          setEditedTemplate({ ...editedTemplate, category: value });
                          addChange('Changed category');
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.map(c => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Passing Threshold (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={editedTemplate.passingThreshold}
                        onChange={(e) => {
                          setEditedTemplate({ ...editedTemplate, passingThreshold: parseInt(e.target.value) || 90 });
                          addChange('Changed passing threshold');
                        }}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Purpose Summary</Label>
                    <Textarea
                      value={editedTemplate.purpose.summary}
                      onChange={(e) => {
                        setEditedTemplate({ 
                          ...editedTemplate, 
                          purpose: { ...editedTemplate.purpose, summary: e.target.value } 
                        });
                        addChange('Changed purpose summary');
                      }}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Risk if Not Compliant</Label>
                    <Textarea
                      value={editedTemplate.purpose.risk}
                      onChange={(e) => {
                        setEditedTemplate({ 
                          ...editedTemplate, 
                          purpose: { ...editedTemplate.purpose, risk: e.target.value } 
                        });
                        addChange('Changed risk description');
                      }}
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>F-Tags (comma-separated)</Label>
                    <Input
                      value={editedTemplate.ftagTags.join(', ')}
                      onChange={(e) => {
                        setEditedTemplate({ 
                          ...editedTemplate, 
                          ftagTags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        });
                        addChange('Changed F-Tags');
                      }}
                      placeholder="F880, F689"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>NYDOH References (comma-separated)</Label>
                    <Input
                      value={editedTemplate.nydohTags.join(', ')}
                      onChange={(e) => {
                        setEditedTemplate({ 
                          ...editedTemplate, 
                          nydohTags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                        });
                        addChange('Changed NYDOH tags');
                      }}
                      placeholder="10 NYCRR 415.19"
                    />
                  </div>
                </div>
              </TabsContent>

              {/* History Tab */}
              <TabsContent value="history" className="mt-0 space-y-4">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No change history recorded yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map(change => (
                      <div key={change.id} className="border rounded-lg p-3 bg-muted/20">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary" className="text-xs">
                                v{change.version}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {new Date(change.changedAt).toLocaleDateString()} at {new Date(change.changedAt).toLocaleTimeString()}
                              </span>
                            </div>
                            <p className="text-sm mt-1">{change.changeDescription}</p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {change.changeType.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>

        <Separator />

        <div className="flex items-center justify-between p-6 pt-4">
          <div className="text-sm text-muted-foreground">
            {pendingChanges.length > 0 ? (
              <span className="text-warning">
                Unsaved changes will bump version to v{bumpVersion(editedTemplate.version, 'patch')}
              </span>
            ) : (
              'No changes to save'
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={pendingChanges.length === 0}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
