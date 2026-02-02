import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ClipboardCheck, GraduationCap, RefreshCw, Calendar, Play, ChevronsUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AuditSession, QaAction, EducationSession } from '@/types/nurse-educator';
import { todayYMD } from '@/lib/calculations';

interface CalendarEvent {
  id: string;
  type: 'education' | 'audit' | 'reaudit' | 'followup';
  title: string;
  date: string;
  status: 'planned' | 'completed' | 'overdue';
  unit?: string;
  linkedId?: string;
}

interface CalendarQuickActionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: string;
  eventsForDate: CalendarEvent[];
}

export function CalendarQuickActionModal({
  open,
  onOpenChange,
  selectedDate,
  eventsForDate
}: CalendarQuickActionModalProps) {
  const { templates, qaActions, setQaActions, setSessions, sessions, setEduSessions, eduSessions, eduLibrary, setActiveTab, facilityUnits } = useApp();
  const today = todayYMD();
  
  const [activeAction, setActiveAction] = useState<'menu' | 'audit' | 'inservice' | 'reaudit'>('menu');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [auditorName, setAuditorName] = useState('');
  
  // For inservice
  const [inserviceTopic, setInserviceTopic] = useState('');
  const [inserviceInstructor, setInserviceInstructor] = useState('');
  const [inserviceAudience, setInserviceAudience] = useState('');
  const [inserviceNotes, setInserviceNotes] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState('');
  
  // For reaudit
  const [selectedReauditAction, setSelectedReauditAction] = useState<QaAction | null>(null);
  
  // Unit combobox
  const [unitPopoverOpen, setUnitPopoverOpen] = useState(false);
  
  const activeTemplates = templates.filter(t => !t.archived);
  const activeTopics = eduLibrary.filter(t => !t.archived);
  
  // Get re-audit events for this date
  const reauditEvents = eventsForDate.filter(e => e.type === 'reaudit' && e.status !== 'completed');
  
  

  const handleClose = () => {
    setActiveAction('menu');
    setSelectedTemplateId('');
    setSelectedUnit('');
    setAuditorName('');
    setInserviceTopic('');
    setInserviceInstructor('');
    setInserviceAudience('');
    setInserviceNotes('');
    setSelectedTopicId('');
    setSelectedReauditAction(null);
    onOpenChange(false);
  };

  const handleStartAudit = () => {
    if (!selectedTemplateId || !selectedUnit || !auditorName) return;
    
    const template = templates.find(t => t.id === selectedTemplateId);
    if (!template) return;
    
    const newSession: AuditSession = {
      id: `session_${Date.now()}`,
      templateId: template.id,
      templateTitle: template.title,
      createdAt: new Date().toISOString(),
      header: {
        status: 'draft',
        sessionId: `S${Date.now().toString().slice(-6)}`,
        auditDate: selectedDate,
        auditor: auditorName,
        unit: selectedUnit
      },
      samples: []
    };
    
    setSessions([...sessions, newSession]);
    // Use sessionStorage to pass the session to edit
    sessionStorage.setItem('NES_EDIT_SESSION', newSession.id);
    handleClose();
    setActiveTab('sessions');
  };

  const handlePlanInservice = () => {
    const topic = selectedTopicId 
      ? activeTopics.find(t => t.id === selectedTopicId)?.topic || inserviceTopic
      : inserviceTopic;
      
    if (!topic || !inserviceInstructor) return;
    
    const topicData = activeTopics.find(t => t.id === selectedTopicId);
    
    const newEduSession: EducationSession = {
      id: `edu_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'planned',
      topic: topic,
      summary: topicData?.description || '',
      audience: inserviceAudience || 'All Staff',
      instructor: inserviceInstructor,
      unit: selectedUnit || 'All Units',
      scheduledDate: selectedDate,
      completedDate: '',
      notes: inserviceNotes,
      templateTitle: '',
      templateId: '',
      issue: '',
      linkedQaActionId: '',
      category: topicData?.disciplines || 'General'
    };
    
    setEduSessions([...eduSessions, newEduSession]);
    handleClose();
    setActiveTab('education');
  };

  const handleStartReaudit = () => {
    if (!selectedReauditAction) return;
    
    const qa = selectedReauditAction;
    const template = templates.find(t => t.id === qa.reAuditTemplateId || t.id === qa.templateId);
    
    if (!template) return;
    
    const newSession: AuditSession = {
      id: `session_${Date.now()}`,
      templateId: template.id,
      templateTitle: template.title,
      createdAt: new Date().toISOString(),
      header: {
        status: 'draft',
        sessionId: `RS${Date.now().toString().slice(-6)}`,
        auditDate: today,
        auditor: auditorName || 'Auditor',
        unit: qa.unit
      },
      samples: []
    };
    
    // Update QA action with reaudit session reference
    const updatedActions = qaActions.map(a => 
      a.id === qa.id 
        ? { ...a, reAuditSessionRef: newSession.id }
        : a
    );
    
    setSessions([...sessions, newSession]);
    setQaActions(updatedActions);
    // Use sessionStorage to pass the session to edit
    sessionStorage.setItem('NES_EDIT_SESSION', newSession.id);
    handleClose();
    setActiveTab('sessions');
  };

  const formattedDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Quick Actions
          </DialogTitle>
          <DialogDescription>{formattedDate}</DialogDescription>
        </DialogHeader>

        {activeAction === 'menu' && (
          <div className="space-y-3">
            {/* Re-audit actions if available */}
            {reauditEvents.length > 0 && (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  Scheduled Re-audits
                </Label>
                {reauditEvents.map(evt => {
                  const qa = qaActions.find(a => `reaudit_${a.id}` === evt.id);
                  if (!qa) return null;
                  
                  return (
                    <Button
                      key={evt.id}
                      variant="outline"
                      className="w-full justify-start gap-3 h-auto py-3 border-warning/50 bg-warning/5 hover:bg-warning/10"
                      onClick={() => {
                        setSelectedReauditAction(qa);
                        setSelectedUnit(qa.unit);
                        setActiveAction('reaudit');
                      }}
                    >
                      <RefreshCw className="w-5 h-5 text-warning shrink-0" />
                      <div className="text-left">
                        <p className="font-medium text-sm">{qa.issue}</p>
                        <p className="text-xs text-muted-foreground">
                          Re-audit due • Unit {qa.unit}
                        </p>
                      </div>
                    </Button>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              {reauditEvents.length > 0 && (
                <Label className="text-xs text-muted-foreground uppercase tracking-wide">
                  New Activities
                </Label>
              )}
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => setActiveAction('audit')}
              >
                <ClipboardCheck className="w-5 h-5 text-success shrink-0" />
                <div className="text-left">
                  <p className="font-medium">Run Audit</p>
                  <p className="text-xs text-muted-foreground">Start a new audit session</p>
                </div>
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-auto py-3"
                onClick={() => setActiveAction('inservice')}
              >
                <GraduationCap className="w-5 h-5 text-primary shrink-0" />
                <div className="text-left">
                  <p className="font-medium">Plan Inservice</p>
                  <p className="text-xs text-muted-foreground">Schedule an education session</p>
                </div>
              </Button>
            </div>
          </div>
        )}

        {activeAction === 'audit' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Audit Template *</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {activeTemplates.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Unit *</Label>
              <Popover open={unitPopoverOpen} onOpenChange={setUnitPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={unitPopoverOpen}
                    className="w-full justify-between font-normal"
                  >
                    {selectedUnit || "Select or type unit..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0" align="start">
                  <Command>
                    <CommandInput 
                      placeholder="Search or type new unit..." 
                      value={selectedUnit}
                      onValueChange={setSelectedUnit}
                    />
                    <CommandList>
                      <CommandEmpty>
                        <span className="text-muted-foreground">Press enter to use "{selectedUnit}"</span>
                      </CommandEmpty>
                      <CommandGroup>
                        {facilityUnits.map(unit => (
                          <CommandItem
                            key={unit}
                            value={unit}
                            onSelect={(value) => {
                              setSelectedUnit(value);
                              setUnitPopoverOpen(false);
                            }}
                          >
                            <Check className={cn("mr-2 h-4 w-4", selectedUnit === unit ? "opacity-100" : "opacity-0")} />
                            {unit}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>Auditor Name *</Label>
              <Input 
                value={auditorName} 
                onChange={e => setAuditorName(e.target.value)}
                placeholder="Enter auditor name"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setActiveAction('menu')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleStartAudit}
                disabled={!selectedTemplateId || !selectedUnit || !auditorName}
                className="flex-1 gap-2"
              >
                <Play className="w-4 h-4" />
                Start Audit
              </Button>
            </div>
          </div>
        )}

        {activeAction === 'inservice' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Topic from Library</Label>
              <Select value={selectedTopicId} onValueChange={(v) => {
                setSelectedTopicId(v);
                const topic = activeTopics.find(t => t.id === v);
                if (topic) setInserviceTopic(topic.topic);
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select from library or enter below..." />
                </SelectTrigger>
                <SelectContent>
                  {activeTopics.map(t => (
                    <SelectItem key={t.id} value={t.id}>{t.topic}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {!selectedTopicId && (
              <div className="space-y-2">
                <Label>Custom Topic *</Label>
                <Input 
                  value={inserviceTopic} 
                  onChange={e => setInserviceTopic(e.target.value)}
                  placeholder="Enter topic name"
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Instructor *</Label>
              <Input 
                value={inserviceInstructor} 
                onChange={e => setInserviceInstructor(e.target.value)}
                placeholder="Enter instructor name"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Unit</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between font-normal"
                    >
                      {selectedUnit || "Select unit..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0" align="start">
                    <Command>
                      <CommandInput 
                        placeholder="Search or type unit..." 
                        value={selectedUnit}
                        onValueChange={setSelectedUnit}
                      />
                      <CommandList>
                        <CommandEmpty>
                          <span className="text-muted-foreground">Use "{selectedUnit}"</span>
                        </CommandEmpty>
                        <CommandGroup>
                          {facilityUnits.map(unit => (
                            <CommandItem
                              key={unit}
                              value={unit}
                              onSelect={(value) => {
                                setSelectedUnit(value);
                              }}
                            >
                              <Check className={cn("mr-2 h-4 w-4", selectedUnit === unit ? "opacity-100" : "opacity-0")} />
                              {unit}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>Audience</Label>
                <Input 
                  value={inserviceAudience} 
                  onChange={e => setInserviceAudience(e.target.value)}
                  placeholder="e.g., RN, LPN"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={inserviceNotes} 
                onChange={e => setInserviceNotes(e.target.value)}
                placeholder="Optional notes..."
                rows={2}
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setActiveAction('menu')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handlePlanInservice}
                disabled={(!selectedTopicId && !inserviceTopic) || !inserviceInstructor}
                className="flex-1 gap-2"
              >
                <GraduationCap className="w-4 h-4" />
                Plan Inservice
              </Button>
            </div>
          </div>
        )}

        {activeAction === 'reaudit' && selectedReauditAction && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg bg-warning/10 border border-warning/30">
              <p className="font-medium text-sm">{selectedReauditAction.issue}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Original audit: {selectedReauditAction.templateTitle}
              </p>
              <p className="text-xs text-muted-foreground">
                Unit: {selectedReauditAction.unit}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label>Auditor Name *</Label>
              <Input 
                value={auditorName} 
                onChange={e => setAuditorName(e.target.value)}
                placeholder="Enter auditor name"
              />
            </div>
            
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={() => setActiveAction('menu')} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleStartReaudit}
                disabled={!auditorName}
                className="flex-1 gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Start Re-audit
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
