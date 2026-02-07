import { useState, useEffect } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { StatusBadge, ComplianceIndicator } from '@/components/StatusBadge';
import { AuditTable } from '@/components/audit/AuditTable';
import { AuditCards } from '@/components/audit/AuditCards';
import { computeSampleResult, todayYMD, nowISO } from '@/lib/calculations';
import type { AuditSession, AuditTemplate, SampleResult, QaAction } from '@/types/nurse-educator';
import { getAllUnitOptions } from '@/types/facility-units';
import { PreAuditPrintModal } from '@/components/audit/PreAuditPrintModal';
import { PostAuditPrintModal } from '@/components/audit/PostAuditPrintModal';
import { cn } from '@/lib/utils';
import { 
  Play, 
  FileText, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Plus,
  Trash2,
  Eye,
  Printer,
  Pencil,
  ChevronsUpDown,
  Check
} from 'lucide-react';

export function SessionsPage() {
  const {
    templates,
    sessions,
    setSessions,
    qaActions,
    setQaActions,
    facilityUnits,
    setActiveTab,
    startAuditRequest,
    setStartAuditRequest,
    openSessionRequest,
    setOpenSessionRequest
  } = useApp();
  const allUnits = getAllUnitOptions(facilityUnits);
  
  // View state
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [activeSession, setActiveSession] = useState<AuditSession | null>(null);
  const [showNewSessionDialog, setShowNewSessionDialog] = useState(false);
  const [detailSession, setDetailSession] = useState<AuditSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  
  // Edit unit state
  const [editingUnitSessionId, setEditingUnitSessionId] = useState<string | null>(null);
  const [editUnitValue, setEditUnitValue] = useState('');
  
  // Print modals state
  const [printPreAuditTemplate, setPrintPreAuditTemplate] = useState<AuditTemplate | null>(null);
  const [printPostAuditSession, setPrintPostAuditSession] = useState<AuditSession | null>(null);
  
  // New session form
  const [newSessionUnit, setNewSessionUnit] = useState('');
  const [newSessionAuditor, setNewSessionAuditor] = useState('');
  const [newSessionDate, setNewSessionDate] = useState(todayYMD());
  
  const activeTemplates = templates.filter(t => !t.archived);
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  // Check for pre-selected template from TemplatesPage
  useEffect(() => {
    if (!startAuditRequest) return;
    const { templateId, unit, auditor } = startAuditRequest;
    setStartAuditRequest(null);
    
    // Pre-fill and auto-start the session
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplateId(templateId);
      setNewSessionUnit(unit || '');
      setNewSessionAuditor(auditor || '');
      
      // Auto-start the session
      const today = todayYMD();
      const sessionId = `${template.id.slice(0, 4).toUpperCase()}-${today.replace(/-/g, '')}-${unit || 'GEN'}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
      
      const newSession: AuditSession = {
        id: `sess_${Math.random().toString(16).slice(2, 10)}`,
        templateId: template.id,
        templateTitle: template.title,
        createdAt: nowISO(),
        header: {
          status: 'in_progress',
          sessionId,
          auditDate: today,
          auditor: auditor || 'Auditor',
          unit: unit || ''
        },
        samples: []
      };
      
      setSessions([newSession, ...sessions]);
      setActiveSession(newSession);
    }
  }, [startAuditRequest, setStartAuditRequest, templates, setSessions, sessions]);

  useEffect(() => {
    if (!openSessionRequest?.sessionId) return;
    setOpenSessionRequest(null);

    const targetSession = sessions.find(session => session.header.sessionId === openSessionRequest.sessionId);
    if (targetSession) {
      setSelectedTemplateId(targetSession.templateId);
      setActiveSession(targetSession);
    }
  }, [openSessionRequest, setOpenSessionRequest, sessions]);

  // Filter sessions
  const filteredSessions = sessions.filter(s => {
    if (statusFilter !== 'All' && s.header?.status !== statusFilter) return false;
    if (searchTerm) {
      const hay = `${s.templateTitle} ${s.header?.unit} ${s.header?.sessionId}`.toLowerCase();
      if (!hay.includes(searchTerm.toLowerCase())) return false;
    }
    return true;
  }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const sessionSummaries = filteredSessions.map(session => {
    const scoredSamples = session.samples.filter(smp => smp.result);
    const passingCount = scoredSamples.filter(smp => smp.result?.pass).length;
    const totalSamples = scoredSamples.length;
    const complianceRate = totalSamples > 0 ? Math.round((passingCount / totalSamples) * 100) : 0;
    const isPass = session.header.status === 'complete' && totalSamples > 0 && passingCount === totalSamples;
    return { session, complianceRate, isPass, totalSamples };
  });
  const totalAudits = filteredSessions.length;
  const avgScore = sessionSummaries.length
    ? Math.round(sessionSummaries.reduce((acc, item) => acc + item.complianceRate, 0) / sessionSummaries.length)
    : 0;
  const passCount = sessionSummaries.filter(item => item.isPass).length;
  const needsReviewCount = totalAudits - passCount;

  // Start a new session
  const startNewSession = () => {
    if (!selectedTemplate) return;
    
    const auditDate = newSessionDate || todayYMD();
    const sessionId = `${selectedTemplate.id.slice(0, 4).toUpperCase()}-${auditDate.replace(/-/g, '')}-${newSessionUnit || 'GEN'}-${Math.random().toString(16).slice(2, 6).toUpperCase()}`;
    
    const newSession: AuditSession = {
      id: `sess_${Math.random().toString(16).slice(2, 10)}`,
      templateId: selectedTemplate.id,
      templateTitle: selectedTemplate.title,
      createdAt: nowISO(),
      header: {
        status: 'in_progress',
        sessionId,
        auditDate,
        auditor: newSessionAuditor || 'Auditor',
        unit: newSessionUnit || '',
        immediateAction: '',
        immediateActionDate: '',
        followUpAction: '',
        followUpActionDate: ''
      },
      samples: []
    };
    
    setSessions([newSession, ...sessions]);
    setActiveSession(newSession);
    setShowNewSessionDialog(false);
    setNewSessionUnit('');
    setNewSessionAuditor('');
    setNewSessionDate(todayYMD());
  };

  // Update audit date on active session
  const updateAuditDate = (newDate: string) => {
    if (!activeSession) return;
    const updated = {
      ...activeSession,
      header: { ...activeSession.header, auditDate: newDate }
    };
    setActiveSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
  };

  // Add a sample to active session
  const addSample = () => {
    if (!activeSession || !selectedTemplate) return;
    
    const newSample = {
      id: `smp_${Math.random().toString(16).slice(2, 10)}`,
      answers: {} as Record<string, string>,
      result: null,
      staffAudited: ''
    };
    
    const updated = {
      ...activeSession,
      samples: [...activeSession.samples, newSample]
    };
    
    setActiveSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
  };

  // Update staff audited
  const updateStaffAudited = (sampleId: string, value: string) => {
    if (!activeSession) return;
    
    const updated = {
      ...activeSession,
      samples: activeSession.samples.map(smp => {
        if (smp.id !== sampleId) return smp;
        return { ...smp, staffAudited: value };
      })
    };
    
    setActiveSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
  };

  // Update sample answer
  const updateSampleAnswer = (sampleId: string, key: string, value: string) => {
    if (!activeSession) return;
    
    const updated = {
      ...activeSession,
      samples: activeSession.samples.map(smp => {
        if (smp.id !== sampleId) return smp;
        return { ...smp, answers: { ...smp.answers, [key]: value } };
      })
    };
    
    setActiveSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
  };

  const updateSessionCorrectiveField = (
    field: 'immediateAction' | 'immediateActionDate' | 'followUpAction' | 'followUpActionDate',
    value: string
  ) => {
    if (!activeSession) return;

    const updated = {
      ...activeSession,
      header: {
        ...activeSession.header,
        [field]: value
      }
    };

    setActiveSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
  };

  // Score a sample
  const scoreSample = (sampleId: string) => {
    if (!activeSession) return;
    const tpl = templates.find(t => t.id === activeSession.templateId);
    if (!tpl) return;
    
    const updated = {
      ...activeSession,
      samples: activeSession.samples.map(smp => {
        if (smp.id !== sampleId) return smp;
        const result = computeSampleResult(tpl, smp.answers);
        return { ...smp, result };
      })
    };
    
    setActiveSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
  };

  // Delete a sample
  const deleteSample = (sampleId: string) => {
    if (!activeSession) return;
    
    const updated = {
      ...activeSession,
      samples: activeSession.samples.filter(smp => smp.id !== sampleId)
    };
    
    setActiveSession(updated);
    setSessions(sessions.map(s => s.id === updated.id ? updated : s));
  };

  const deleteSession = (sessionId: string) => {
    const target = sessions.find(session => session.id === sessionId);
    if (!target) return;
    const confirmed = window.confirm(`Delete audit session ${target.header.sessionId}? This cannot be undone.`);
    if (!confirmed) return;

    const updatedSessions = sessions.filter(session => session.id !== sessionId);
    setSessions(updatedSessions);
    if (activeSession?.id === sessionId) {
      setActiveSession(null);
    }
    if (detailSession?.id === sessionId) {
      setDetailSession(null);
    }
  };

  // Complete session and generate QA actions
  const completeSession = () => {
    if (!activeSession) return;
    
    // Score all unscored samples
    const tpl = templates.find(t => t.id === activeSession.templateId);
    if (!tpl) return;
    
    const scoredSamples = activeSession.samples.map(smp => {
      if (smp.result) return smp;
      return { ...smp, result: computeSampleResult(tpl, smp.answers) };
    });
    
    const completed: AuditSession = {
      ...activeSession,
      samples: scoredSamples,
      header: { ...activeSession.header, status: 'complete' }
    };
    
    // Generate QA actions for failed samples
    const newActions: QaAction[] = [];
    for (const smp of scoredSamples) {
      if (smp.result && !smp.result.pass) {
        for (const action of smp.result.actionNeeded) {
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + 14);
          
          newActions.push({
            id: `qa_${Math.random().toString(16).slice(2, 10)}`,
            createdAt: nowISO(),
            status: 'open',
            templateId: activeSession.templateId,
            templateTitle: activeSession.templateTitle,
            unit: activeSession.header.unit,
            auditDate: activeSession.header.auditDate,
            sessionId: activeSession.header.sessionId,
            sample: smp.answers.patient_code || smp.id,
            issue: action.label,
            reason: action.reason,
            topic: '',
            summary: '',
            owner: '',
            dueDate: dueDate.toISOString().slice(0, 10),
            completedAt: '',
            notes: '',
            ftagTags: tpl.ftagTags || [],
            nydohTags: tpl.nydohTags || [],
            reAuditDueDate: '',
            reAuditCompletedAt: '',
            reAuditSessionRef: '',
            reAuditTemplateId: '',
            ev_policyReviewed: false,
            ev_educationProvided: false,
            ev_competencyValidated: false,
            ev_correctiveAction: false,
            ev_monitoringInPlace: false,
            linkedEduSessionId: '',
            staffAudited: smp.staffAudited || ''
          });
        }
      }
    }
    
    setSessions(sessions.map(s => s.id === completed.id ? completed : s));
    if (newActions.length > 0) {
      setQaActions([...newActions, ...qaActions]);
      setActiveTab('recommendations');
    }
    setActiveSession(null);
  };

  // Open session for viewing/editing
  const openSession = (session: AuditSession) => {
    setSelectedTemplateId(session.templateId);
    setActiveSession(session);
  };

  // Update session unit
  const handleUpdateSessionUnit = (sessionId: string) => {
    if (!editUnitValue.trim()) return;
    
    const updatedSessions = sessions.map(s => 
      s.id === sessionId 
        ? { ...s, header: { ...s.header, unit: editUnitValue.trim() } }
        : s
    );
    setSessions(updatedSessions);
    setEditingUnitSessionId(null);
    setEditUnitValue('');
  };

  const startEditingUnit = (session: AuditSession) => {
    setEditingUnitSessionId(session.id);
    setEditUnitValue(session.header.unit || '');
  };

  const cancelEditUnit = () => {
    setEditingUnitSessionId(null);
    setEditUnitValue('');
  };

  const isReadOnly = activeSession?.header.status === 'complete';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Sessions</h1>
          <p className="text-muted-foreground">
            Run audits, enter samples, and score compliance
          </p>
        </div>
        
        <Dialog open={showNewSessionDialog} onOpenChange={setShowNewSessionDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Play className="w-4 h-4" />
              Start New Audit
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Start New Audit Session</DialogTitle>
              <DialogDescription>
                Select an audit tool and enter session details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Audit Tool</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an audit tool..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activeTemplates.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Audit Date</Label>
                <Input 
                  type="date"
                  value={newSessionDate} 
                  onChange={(e) => setNewSessionDate(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Unit</Label>
                <Input 
                  value={newSessionUnit} 
                  onChange={(e) => setNewSessionUnit(e.target.value)}
                  placeholder="e.g., 1A, 2B, ICU"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Auditor Name</Label>
                <Input 
                  value={newSessionAuditor} 
                  onChange={(e) => setNewSessionAuditor(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={startNewSession} 
                  disabled={!selectedTemplateId}
                  className="flex-1"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Audit
                </Button>
                <Button 
                  variant="outline"
                  disabled={!selectedTemplateId}
                  onClick={() => {
                    const tpl = templates.find(t => t.id === selectedTemplateId);
                    if (tpl) {
                      setPrintPreAuditTemplate(tpl);
                      setShowNewSessionDialog(false);
                    }
                  }}
                >
                  <Printer className="w-4 h-4 mr-2" />
                  Print Form
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Active Session Panel */}
      {activeSession && selectedTemplate && (
        <Card className="border-primary">
          <CardHeader className="bg-primary/5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-lg">{activeSession.templateTitle}</CardTitle>
                <CardDescription className="flex items-center gap-2 flex-wrap">
                  <span>Session: {activeSession.header.sessionId}</span>
                  <span>•</span>
                  <span>Unit: {activeSession.header.unit || 'N/A'}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    Date: 
                    {activeSession.header.status !== 'complete' ? (
                      <Input 
                        type="date"
                        value={activeSession.header.auditDate}
                        onChange={(e) => updateAuditDate(e.target.value)}
                        className="h-6 w-auto text-xs px-1 py-0 inline-flex"
                      />
                    ) : (
                      activeSession.header.auditDate
                    )}
                  </span>
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-destructive hover:text-destructive"
                  onClick={() => deleteSession(activeSession.id)}
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </Button>
                <StatusBadge status={activeSession.header.status === 'complete' ? 'success' : 'warning'}>
                  {activeSession.header.status === 'complete' ? 'Complete' : 'In Progress'}
                </StatusBadge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* Samples */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Samples ({activeSession.samples.length})</h3>
                {activeSession.header.status !== 'complete' && (
                  <Button size="sm" onClick={addSample} variant="outline">
                    <Plus className="w-4 h-4 mr-1" /> Add Sample
                  </Button>
                )}
              </div>
              
              {activeSession.samples.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No samples yet. Click "Add Sample" to begin.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="hidden md:block">
                    <div className="overflow-hidden rounded-lg border">
                      <div className="max-h-[520px] overflow-auto">
                        <table className="min-w-full text-sm">
                          <thead className="sticky top-0 z-10 bg-muted">
                            <tr className="text-left">
                              <th className="px-2 py-2 font-semibold min-w-[80px]">Sample</th>
                              <th className="px-2 py-2 font-semibold min-w-[180px]">Staff Audited</th>
                              {selectedTemplate.sampleQuestions.map(q => (
                                <th key={q.key} className="px-2 py-2 font-semibold min-w-[180px]">
                                  {q.label}
                                  {q.required && <span className="text-destructive ml-1">*</span>}
                                </th>
                              ))}
                              <th className="px-2 py-2 font-semibold min-w-[140px]">Result</th>
                              <th className="px-2 py-2 font-semibold min-w-[120px] text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {activeSession.samples.map((sample, idx) => (
                              <tr key={sample.id} className={idx % 2 === 0 ? 'bg-background' : 'bg-muted/20'}>
                                <td className="px-2 py-2 font-medium">#{idx + 1}</td>
                                <td className="px-2 py-2">
                                  <Input
                                    value={sample.staffAudited || ''}
                                    onChange={(e) => updateStaffAudited(sample.id, e.target.value)}
                                    placeholder="e.g., John Smith, RN"
                                    disabled={isReadOnly}
                                    className="h-8 text-xs"
                                  />
                                </td>
                                {selectedTemplate.sampleQuestions.map(q => (
                                  <td key={q.key} className="px-2 py-2 align-top">
                                    {q.type === 'patientCode' && (
                                      <Input
                                        value={sample.answers[q.key] || ''}
                                        onChange={(e) => updateSampleAnswer(sample.id, q.key, e.target.value)}
                                        placeholder="e.g., P123"
                                        disabled={isReadOnly}
                                        className="h-8 text-xs"
                                      />
                                    )}
                                    {q.type === 'yn' && (
                                      <RadioGroup
                                        value={sample.answers[q.key] || ''}
                                        onValueChange={(v) => updateSampleAnswer(sample.id, q.key, v)}
                                        className="flex gap-2"
                                        disabled={isReadOnly}
                                      >
                                        <div className="flex items-center space-x-1">
                                          <RadioGroupItem value="yes" id={`${sample.id}-${q.key}-yes`} />
                                          <Label htmlFor={`${sample.id}-${q.key}-yes`} className="text-[11px]">Yes</Label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <RadioGroupItem value="no" id={`${sample.id}-${q.key}-no`} />
                                          <Label htmlFor={`${sample.id}-${q.key}-no`} className="text-[11px]">No</Label>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <RadioGroupItem value="na" id={`${sample.id}-${q.key}-na`} />
                                          <Label htmlFor={`${sample.id}-${q.key}-na`} className="text-[11px]">N/A</Label>
                                        </div>
                                      </RadioGroup>
                                    )}
                                    {q.type === 'select' && q.options && (
                                      <Select
                                        value={sample.answers[q.key] || ''}
                                        onValueChange={(v) => updateSampleAnswer(sample.id, q.key, v)}
                                        disabled={isReadOnly}
                                      >
                                        <SelectTrigger className="h-8 text-xs">
                                          <SelectValue placeholder="Select..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                          {q.options.map(opt => (
                                            <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    )}
                                    {q.type === 'text' && (
                                      <Input
                                        value={sample.answers[q.key] || ''}
                                        onChange={(e) => updateSampleAnswer(sample.id, q.key, e.target.value)}
                                        disabled={isReadOnly}
                                        className="h-8 text-xs"
                                      />
                                    )}
                                  </td>
                                ))}
                                <td className="px-2 py-2 align-top">
                                  {sample.result ? (
                                    <div className="flex items-center gap-2">
                                      <ComplianceIndicator rate={sample.result.pct} size="sm" showLabel={false} />
                                      <span className={`text-xs ${sample.result.pass ? 'text-success' : 'text-error'}`}>
                                        {sample.result.pass ? 'Pass' : 'Fail'} {sample.result.pct}%
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">Not scored</span>
                                  )}
                                </td>
                                <td className="px-2 py-2 align-top text-right">
                                  {!isReadOnly && (
                                    <div className="flex items-center justify-end gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => scoreSample(sample.id)}
                                      >
                                        Score
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => deleteSample(sample.id)}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                  <div className="block md:hidden space-y-4">
                    {activeSession.samples.map((sample, idx) => (
                      <div key={sample.id} className="border rounded-lg p-4 bg-muted/20">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-medium">Sample #{idx + 1}</h4>
                          <div className="flex items-center gap-2">
                            {sample.result && (
                              <ComplianceIndicator rate={sample.result.pct} size="sm" showLabel={false} />
                            )}
                            {!isReadOnly && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => scoreSample(sample.id)}
                                >
                                  Score
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost"
                                  onClick={() => deleteSample(sample.id)}
                                >
                                  <Trash2 className="w-4 h-4 text-destructive" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Staff Being Audited Field */}
                        <div className="mb-3 max-w-xs">
                          <Label className="text-xs text-muted-foreground">Staff Being Audited (Optional)</Label>
                          <Input
                            value={sample.staffAudited || ''}
                            onChange={(e) => updateStaffAudited(sample.id, e.target.value)}
                            placeholder="e.g., John Smith, RN"
                            disabled={isReadOnly}
                            className="h-8 text-sm"
                          />
                        </div>
                        
                        {/* Questions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selectedTemplate.sampleQuestions.map(q => (
                            <div key={q.key} className="space-y-1">
                              <Label className="text-xs">
                                {q.label}
                                {q.required && <span className="text-destructive ml-1">*</span>}
                              </Label>
                              
                              {q.type === 'patientCode' && (
                                <Input
                                  value={sample.answers[q.key] || ''}
                                  onChange={(e) => updateSampleAnswer(sample.id, q.key, e.target.value)}
                                  placeholder="e.g., P123"
                                  disabled={isReadOnly}
                                />
                              )}
                              
                              {q.type === 'yn' && (
                                <RadioGroup
                                  value={sample.answers[q.key] || ''}
                                  onValueChange={(v) => updateSampleAnswer(sample.id, q.key, v)}
                                  className="flex gap-4"
                                  disabled={isReadOnly}
                                >
                                  <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="yes" id={`${sample.id}-${q.key}-yes`} />
                                    <Label htmlFor={`${sample.id}-${q.key}-yes`} className="text-xs">Yes</Label>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="no" id={`${sample.id}-${q.key}-no`} />
                                    <Label htmlFor={`${sample.id}-${q.key}-no`} className="text-xs">No</Label>
                                  </div>
                                  <div className="flex items-center space-x-1">
                                    <RadioGroupItem value="na" id={`${sample.id}-${q.key}-na`} />
                                    <Label htmlFor={`${sample.id}-${q.key}-na`} className="text-xs">N/A</Label>
                                  </div>
                                </RadioGroup>
                              )}
                              
                              {q.type === 'select' && q.options && (
                                <Select
                                  value={sample.answers[q.key] || ''}
                                  onValueChange={(v) => updateSampleAnswer(sample.id, q.key, v)}
                                  disabled={isReadOnly}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {q.options.map(opt => (
                                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                              
                              {q.type === 'text' && (
                                <Input
                                  value={sample.answers[q.key] || ''}
                                  onChange={(e) => updateSampleAnswer(sample.id, q.key, e.target.value)}
                                  disabled={isReadOnly}
                                />
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* Result display */}
                        {sample.result && (
                          <div className="mt-4 pt-3 border-t space-y-3">
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex items-center gap-2">
                                {sample.result.pass ? (
                                  <CheckCircle2 className="w-5 h-5 text-success" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-error" />
                                )}
                                <span className="font-medium">
                                  {sample.result.pass ? 'PASS' : 'FAIL'} — {sample.result.pct}%
                                </span>
                              </div>
                              
                              {sample.result.criticalFails.length > 0 && (
                                <StatusBadge status="error">
                                  <AlertTriangle className="w-3 h-3 mr-1" />
                                  {sample.result.criticalFails.length} Critical
                                </StatusBadge>
                              )}
                            </div>
                            
                            {sample.result.actionNeeded.length > 0 && (
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Action Needed:</p>
                                <ul className="text-sm space-y-1">
                                  {sample.result.actionNeeded.map((a, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="text-error">•</span>
                                      <span>{a.label} ({a.reason})</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="rounded-lg border p-4 space-y-3">
                <h4 className="text-sm font-semibold">Corrective Actions (Session Summary)</h4>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Immediate Action</Label>
                    <Textarea
                      value={activeSession.header.immediateAction || ''}
                      onChange={(e) => updateSessionCorrectiveField('immediateAction', e.target.value)}
                      placeholder="Document immediate action..."
                      rows={2}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Immediate Action Date</Label>
                    <Input
                      type="date"
                      value={activeSession.header.immediateActionDate || ''}
                      onChange={(e) => updateSessionCorrectiveField('immediateActionDate', e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Follow-Up Action</Label>
                    <Textarea
                      value={activeSession.header.followUpAction || ''}
                      onChange={(e) => updateSessionCorrectiveField('followUpAction', e.target.value)}
                      placeholder="Document follow-up action..."
                      rows={2}
                      disabled={isReadOnly}
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Follow-Up Action Date</Label>
                    <Input
                      type="date"
                      value={activeSession.header.followUpActionDate || ''}
                      onChange={(e) => updateSessionCorrectiveField('followUpActionDate', e.target.value)}
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
              </div>
              
              {/* Session Actions */}
              {activeSession.header.status !== 'complete' && activeSession.samples.length > 0 && (
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={() => setActiveSession(null)}>
                    Save & Close
                  </Button>
                  <Button onClick={completeSession}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Complete Session
                  </Button>
                </div>
              )}
              
              {activeSession.header.status === 'complete' && (
                <div className="flex justify-end gap-2 pt-4 border-t">
                  <Button variant="outline" className="gap-2" onClick={() => setPrintPostAuditSession(activeSession)}>
                    <Printer className="w-4 h-4" />
                    Print Results
                  </Button>
                  <Button variant="outline" onClick={() => setActiveSession(null)}>
                    Close
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card>
        <CardHeader>
          <CardTitle>Session History</CardTitle>
          <CardDescription>View and manage past audit sessions</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
            <span>
              Total: <strong className="text-foreground">{totalAudits}</strong>
            </span>
            <span>
              Avg: <strong className="text-foreground">{avgScore}%</strong>
            </span>
            <span>
              Pass: <strong className="text-foreground">{passCount}</strong>
            </span>
            <span>
              Needs Review: <strong className="text-foreground">{needsReviewCount}</strong>
            </span>
          </div>
          
          {/* Session List */}
          {filteredSessions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No audit sessions found</p>
            </div>
          ) : (
            <div>
              <div className="hidden md:block">
                <AuditTable
                  audits={filteredSessions.slice(0, 20)}
                  onView={(session) => setDetailSession(session)}
                />
              </div>
              <div className="block md:hidden">
                <AuditCards
                  audits={filteredSessions.slice(0, 20)}
                  onView={(session) => setDetailSession(session)}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detailSession} onOpenChange={(open) => !open && setDetailSession(null)}>
        <DialogContent className="max-w-3xl">
          {detailSession && (
            <div className="space-y-4">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {detailSession.templateTitle}
                  <StatusBadge status={detailSession.header.status === 'complete' ? 'success' : 'warning'}>
                    {detailSession.header.status === 'complete' ? 'Complete' : 'In Progress'}
                  </StatusBadge>
                </DialogTitle>
                <DialogDescription>
                  Session {detailSession.header.sessionId} • {detailSession.header.auditDate}
                </DialogDescription>
              </DialogHeader>

              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
                <div>
                  <span className="text-xs uppercase tracking-wide">Unit</span>
                  <div className="mt-1 flex items-center gap-2">
                    {editingUnitSessionId === detailSession.id ? (
                      <div className="flex items-center gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              className="w-[180px] justify-between h-8 text-sm"
                            >
                              {editUnitValue || "Select unit..."}
                              <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-[200px] p-0" align="start">
                            <Command>
                              <CommandInput
                                placeholder="Search or type..."
                                value={editUnitValue}
                                onValueChange={setEditUnitValue}
                              />
                              <CommandList>
                                <CommandEmpty>
                                  <span className="text-muted-foreground text-xs">Use "{editUnitValue}"</span>
                                </CommandEmpty>
                                <CommandGroup>
                                  {allUnits.map(unitName => (
                                    <CommandItem
                                      key={unitName}
                                      value={unitName}
                                      onSelect={(value) => setEditUnitValue(value)}
                                    >
                                      <Check className={cn("mr-2 h-3 w-3", editUnitValue === unitName ? "opacity-100" : "opacity-0")} />
                                      {unitName}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={() => handleUpdateSessionUnit(detailSession.id)}>
                          <Check className="h-4 w-4 text-success" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2" onClick={cancelEditUnit}>
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{detailSession.header.unit || 'N/A'}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => startEditingUnit(detailSession)}
                        >
                          <Pencil className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide">Auditor</span>
                  <p className="mt-1 text-foreground">{detailSession.header.auditor}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide">Created</span>
                  <p className="mt-1 text-foreground">{new Date(detailSession.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wide">Samples</span>
                  <p className="mt-1 text-foreground">{detailSession.samples.length}</p>
                </div>
              </div>

              {detailSession.samples.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {detailSession.samples.slice(0, 8).map((smp, idx) => (
                    <div
                      key={smp.id}
                      className={`text-xs p-2 rounded border ${
                        smp.result?.pass
                          ? 'bg-success/10 border-success/30'
                          : smp.result
                            ? 'bg-error/10 border-error/30'
                            : 'bg-muted'
                      }`}
                    >
                      Sample #{idx + 1}: {smp.result ? `${smp.result.pct}%` : 'Not scored'}
                    </div>
                  ))}
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {detailSession.header.status === 'complete' && (
                  <Button size="sm" variant="outline" onClick={() => setPrintPostAuditSession(detailSession)}>
                    <Printer className="w-4 h-4 mr-1" />
                    Print
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteSession(detailSession.id)}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    openSession(detailSession);
                    setDetailSession(null);
                  }}
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {detailSession.header.status === 'complete' ? 'View' : 'Continue'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Print Pre-Audit Modal */}
      {printPreAuditTemplate && (
        <PreAuditPrintModal
          open={!!printPreAuditTemplate}
          onOpenChange={(open) => !open && setPrintPreAuditTemplate(null)}
          template={printPreAuditTemplate}
        />
      )}

      {/* Print Post-Audit Modal */}
      {printPostAuditSession && (
        <PostAuditPrintModal
          open={!!printPostAuditSession}
          onOpenChange={(open) => !open && setPrintPostAuditSession(null)}
          session={printPostAuditSession}
          template={templates.find(t => t.id === printPostAuditSession.templateId)!}
        />
      )}
    </div>
  );
}
