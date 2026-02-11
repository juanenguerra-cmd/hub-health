import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  Plus, 
  Trash2,
  FileText,
  Settings,
  ListChecks,
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import type { AuditTemplate, TemplateQuestion } from '@/types/nurse-educator';
import type { TemplateChange } from '@/types/template-history';
import { addTemplateChange } from '@/lib/template-history-storage';

interface TemplateCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: (template: AuditTemplate) => void;
}

const STEPS = [
  { id: 'basics', title: 'Basic Info', icon: FileText },
  { id: 'purpose', title: 'Purpose & Risk', icon: Settings },
  { id: 'questions', title: 'Questions', icon: ListChecks },
  { id: 'review', title: 'Review', icon: Check }
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

const QUESTION_TYPES = [
  { value: 'yn', label: 'Yes/No' },
  { value: 'ynna', label: 'Yes/No/N-A' },
  { value: 'text', label: 'Text' },
  { value: 'patientCode', label: 'Patient Code' },
  { value: 'select', label: 'Select (Options)' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' }
];

export function TemplateCreationWizard({ open, onOpenChange, onComplete }: TemplateCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  // Template state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Other');
  const [passingThreshold, setPassingThreshold] = useState(90);
  const [ftagTags, setFtagTags] = useState('');
  const [nydohTags, setNydohTags] = useState('');
  
  const [purposeSummary, setPurposeSummary] = useState('');
  const [risk, setRisk] = useState('');
  const [evidenceToShow, setEvidenceToShow] = useState('');
  
  const [questions, setQuestions] = useState<TemplateQuestion[]>([
    { key: 'patient_code', label: 'Patient/Sample Code', type: 'patientCode', required: true, score: 0 }
  ]);
  const [criticalFailKeys, setCriticalFailKeys] = useState<string[]>([]);

  const resetForm = () => {
    setCurrentStep(0);
    setTitle('');
    setCategory('Other');
    setPassingThreshold(90);
    setFtagTags('');
    setNydohTags('');
    setPurposeSummary('');
    setRisk('');
    setEvidenceToShow('');
    setQuestions([
      { key: 'patient_code', label: 'Patient/Sample Code', type: 'patientCode', required: true, score: 0 }
    ]);
    setCriticalFailKeys([]);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  // Validation
  const isStep1Valid = title.trim().length >= 3;
  const isStep2Valid = purposeSummary.trim().length >= 10;
  const isStep3Valid = questions.length >= 2; // At least patient code + 1 question

  const canProceed = () => {
    switch (currentStep) {
      case 0: return isStep1Valid;
      case 1: return isStep2Valid;
      case 2: return isStep3Valid;
      default: return true;
    }
  };

  // Question management
  const addQuestion = () => {
    const newKey = `q_${Math.random().toString(16).slice(2, 8)}`;
    setQuestions([...questions, {
      key: newKey,
      label: '',
      type: 'yn',
      required: false,
      score: 10
    }]);
  };

  const updateQuestion = (index: number, updates: Partial<TemplateQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    setQuestions(updated);
  };

  const removeQuestion = (index: number) => {
    if (questions[index].type === 'patientCode') return; // Can't remove patient code
    const removedKey = questions[index].key;
    setQuestions(questions.filter((_, i) => i !== index));
    setCriticalFailKeys(criticalFailKeys.filter(k => k !== removedKey));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= questions.length) return;
    const updated = [...questions];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setQuestions(updated);
  };

  const toggleCriticalFail = (key: string) => {
    setCriticalFailKeys(
      criticalFailKeys.includes(key)
        ? criticalFailKeys.filter(k => k !== key)
        : [...criticalFailKeys, key]
    );
  };

  // Calculate total score
  const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);

  // Complete the wizard
  const handleComplete = () => {
    const templateId = `audit_custom_${Math.random().toString(16).slice(2, 10)}`;
    
    const newTemplate: AuditTemplate = {
      id: templateId,
      title: title.trim(),
      version: '1.0.0',
      category,
      placementTags: ['Custom'],
      ftagTags: ftagTags.split(',').map(s => s.trim()).filter(Boolean),
      nydohTags: nydohTags.split(',').map(s => s.trim()).filter(Boolean),
      purpose: {
        summary: purposeSummary.trim(),
        risk: risk.trim(),
        evidenceToShow: evidenceToShow.trim()
      },
      references: [],
      passingThreshold,
      criticalFailKeys,
      sessionQuestions: [],
      sampleQuestions: questions
    };

    // Record creation in history
    const change: TemplateChange = {
      id: `ch_${Math.random().toString(16).slice(2, 10)}`,
      templateId,
      version: '1.0.0',
      previousVersion: '0.0.0',
      changedAt: new Date().toISOString(),
      changedBy: 'User',
      changeType: 'created',
      changeDescription: `Created custom template "${title}" with ${questions.length} questions`,
      details: []
    };

    addTemplateChange(change);
    onComplete(newTemplate);
    handleClose();
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Create Custom Audit Template
          </DialogTitle>
          <DialogDescription>
            Step {currentStep + 1} of {STEPS.length}: {STEPS[currentStep].title}
          </DialogDescription>
        </DialogHeader>

        {/* Progress */}
        <div className="px-6">
          <Progress value={progress} className="h-2" />
          <div className="flex justify-between mt-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isActive = idx === currentStep;
              const isComplete = idx < currentStep;
              return (
                <div 
                  key={step.id}
                  className={`flex items-center gap-1.5 text-xs ${
                    isActive ? 'text-primary font-medium' : 
                    isComplete ? 'text-muted-foreground' : 'text-muted-foreground/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{step.title}</span>
                </div>
              );
            })}
          </div>
        </div>

        <ScrollArea className="h-[50vh] mt-4">
          <div className="px-6 pb-6">
            {/* Step 1: Basic Info */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Template Title *</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Fall Risk Assessment Audit"
                  />
                  {title && title.length < 3 && (
                    <p className="text-xs text-destructive">Title must be at least 3 characters</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={setCategory}>
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
                      value={passingThreshold}
                      onChange={(e) => setPassingThreshold(parseInt(e.target.value) || 90)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>F-Tags (comma-separated, optional)</Label>
                  <Input
                    value={ftagTags}
                    onChange={(e) => setFtagTags(e.target.value)}
                    placeholder="F880, F881"
                  />
                </div>

                <div className="space-y-2">
                  <Label>NYSDOH Tags (comma-separated, optional)</Label>
                  <Input
                    value={nydohTags}
                    onChange={(e) => setNydohTags(e.target.value)}
                    placeholder="10 NYCRR 415.12"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Purpose & Risk */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Purpose Summary *</Label>
                  <Textarea
                    value={purposeSummary}
                    onChange={(e) => setPurposeSummary(e.target.value)}
                    placeholder="Describe what this audit monitors and why it's important..."
                    rows={4}
                  />
                  {purposeSummary && purposeSummary.length < 10 && (
                    <p className="text-xs text-destructive">Purpose must be at least 10 characters</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Risk if Not Compliant</Label>
                  <Textarea
                    value={risk}
                    onChange={(e) => setRisk(e.target.value)}
                    placeholder="What are the consequences of non-compliance?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Evidence to Show Surveyors</Label>
                  <Textarea
                    value={evidenceToShow}
                    onChange={(e) => setEvidenceToShow(e.target.value)}
                    placeholder="What documentation demonstrates compliance?"
                    rows={3}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Questions */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      Total Score: <strong>{totalScore} pts</strong>
                    </span>
                    <Badge variant="outline">
                      {questions.length} question{questions.length !== 1 && 's'}
                    </Badge>
                  </div>
                  <Button size="sm" onClick={addQuestion} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Question
                  </Button>
                </div>

                {questions.length < 2 && (
                  <p className="text-xs text-destructive">Add at least one scoring question</p>
                )}

                <div className="space-y-3">
                  {questions.map((q, idx) => (
                    <div 
                      key={q.key} 
                      className={`border rounded-lg p-4 bg-muted/20 ${
                        criticalFailKeys.includes(q.key)
                          ? 'border-destructive/50 bg-destructive/5' 
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {q.type !== 'patientCode' && (
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
                              disabled={idx === questions.length - 1}
                            >
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </div>
                        )}

                        <div className="flex-1 space-y-3">
                          {q.type === 'patientCode' ? (
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Badge variant="secondary">Patient Code (auto)</Badge>
                              <span>Required identifier field</span>
                            </div>
                          ) : (
                            <>
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
                                    checked={criticalFailKeys.includes(q.key)}
                                    onCheckedChange={() => toggleCriticalFail(q.key)}
                                  />
                                  <Label className="text-xs text-destructive flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" />
                                    Critical Fail
                                  </Label>
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {q.type !== 'patientCode' && (
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="text-destructive hover:text-destructive"
                            onClick={() => removeQuestion(idx)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h3 className="font-semibold mb-2">{title}</h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Badge variant="secondary">{category}</Badge>
                    <Badge variant="outline">{passingThreshold}% threshold</Badge>
                    <Badge variant="outline">{questions.length} questions</Badge>
                    <Badge variant="outline">{totalScore} pts total</Badge>
                    {criticalFailKeys.length > 0 && (
                      <Badge variant="destructive">{criticalFailKeys.length} critical</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{purposeSummary}</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Questions Preview</h4>
                  <div className="border rounded-lg divide-y">
                    {questions.map((q, idx) => (
                      <div key={q.key} className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-6">{idx + 1}.</span>
                          <span className="text-sm">{q.label || '(Unnamed)'}</span>
                          {criticalFailKeys.includes(q.key) && (
                            <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">{q.type}</Badge>
                          {q.score > 0 && (
                            <span className="text-xs text-muted-foreground">{q.score} pts</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {ftagTags && (
                  <div className="flex flex-wrap gap-1.5">
                    <span className="text-xs text-muted-foreground">F-Tags:</span>
                    {ftagTags.split(',').map((tag, i) => (
                      <Badge key={i} variant="outline" className="text-xs">{tag.trim()}</Badge>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Navigation */}
        <div className="p-6 pt-4 border-t flex justify-between">
          <Button
            variant="outline"
            onClick={() => currentStep > 0 ? setCurrentStep(currentStep - 1) : handleClose()}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            {currentStep > 0 ? 'Back' : 'Cancel'}
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              className="gap-2"
            >
              <Check className="w-4 h-4" />
              Create Template
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
