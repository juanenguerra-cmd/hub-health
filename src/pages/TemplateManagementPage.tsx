import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ClipboardCheck, 
  Search, 
  Edit, 
  Archive, 
  RotateCcw,
  Plus,
  History,
  ArrowLeft,
  FileText,
  AlertTriangle
} from 'lucide-react';
import type { AuditTemplate } from '@/types/nurse-educator';
import type { TemplateChange } from '@/types/template-history';
import { TemplateEditorModal } from '@/components/audit/TemplateEditorModal';
import { loadTemplateHistory, addTemplateChange, bumpVersion } from '@/lib/template-history-storage';
import { toast } from 'sonner';

interface TemplateManagementPageProps {
  onBack: () => void;
}

export function TemplateManagementPage({ onBack }: TemplateManagementPageProps) {
  const { templates, setTemplates } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [editingTemplate, setEditingTemplate] = useState<AuditTemplate | null>(null);
  const [viewHistoryTemplate, setViewHistoryTemplate] = useState<AuditTemplate | null>(null);
  const [historyChanges, setHistoryChanges] = useState<TemplateChange[]>([]);

  const activeTemplates = templates.filter(t => !t.archived);
  const archivedTemplates = templates.filter(t => t.archived);

  const filteredTemplates = (activeTab === 'active' ? activeTemplates : archivedTemplates)
    .filter(t => {
      if (!searchTerm) return true;
      const hay = `${t.title} ${t.category} ${t.ftagTags.join(' ')}`.toLowerCase();
      return hay.includes(searchTerm.toLowerCase());
    });

  const handleEditTemplate = (template: AuditTemplate) => {
    setEditingTemplate(template);
  };

  const handleSaveTemplate = (updatedTemplate: AuditTemplate, changes: string[]) => {
    setTemplates(templates.map(t => t.id === updatedTemplate.id ? updatedTemplate : t));
    toast.success(`Template updated to v${updatedTemplate.version}`, {
      description: `${changes.length} change${changes.length !== 1 ? 's' : ''} saved`
    });
    setEditingTemplate(null);
  };

  const handleArchiveTemplate = (template: AuditTemplate) => {
    const updated = {
      ...template,
      archived: true,
      archivedAt: new Date().toISOString()
    };
    
    const change: TemplateChange = {
      id: `ch_${Math.random().toString(16).slice(2, 10)}`,
      templateId: template.id,
      version: template.version,
      previousVersion: template.version,
      changedAt: new Date().toISOString(),
      changedBy: 'User',
      changeType: 'archived',
      changeDescription: 'Template archived',
      details: []
    };
    
    addTemplateChange(change);
    setTemplates(templates.map(t => t.id === template.id ? updated : t));
    toast.success('Template archived');
  };

  const handleRestoreTemplate = (template: AuditTemplate) => {
    const updated = {
      ...template,
      archived: false,
      archivedAt: undefined
    };
    
    const change: TemplateChange = {
      id: `ch_${Math.random().toString(16).slice(2, 10)}`,
      templateId: template.id,
      version: template.version,
      previousVersion: template.version,
      changedAt: new Date().toISOString(),
      changedBy: 'User',
      changeType: 'restored',
      changeDescription: 'Template restored from archive',
      details: []
    };
    
    addTemplateChange(change);
    setTemplates(templates.map(t => t.id === template.id ? updated : t));
    toast.success('Template restored');
  };

  const handleViewHistory = (template: AuditTemplate) => {
    const history = loadTemplateHistory().filter(c => c.templateId === template.id);
    setHistoryChanges(history);
    setViewHistoryTemplate(template);
  };

  const handleCreateTemplate = () => {
    const newTemplate: AuditTemplate = {
      id: `audit_custom_${Math.random().toString(16).slice(2, 10)}`,
      title: 'New Custom Audit',
      version: '1.0.0',
      category: 'Other',
      placementTags: ['Custom'],
      ftagTags: [],
      nydohTags: [],
      purpose: {
        summary: 'Custom audit template',
        risk: 'Define compliance risks',
        evidenceToShow: 'Document evidence requirements'
      },
      references: [],
      passingThreshold: 90,
      criticalFailKeys: [],
      sessionQuestions: [],
      sampleQuestions: [
        { key: 'patient_code', label: 'Patient/Sample Code', type: 'patientCode', required: true, score: 0 }
      ]
    };

    const change: TemplateChange = {
      id: `ch_${Math.random().toString(16).slice(2, 10)}`,
      templateId: newTemplate.id,
      version: newTemplate.version,
      previousVersion: '0.0.0',
      changedAt: new Date().toISOString(),
      changedBy: 'User',
      changeType: 'created',
      changeDescription: 'Template created',
      details: []
    };

    addTemplateChange(change);
    setTemplates([newTemplate, ...templates]);
    setEditingTemplate(newTemplate);
    toast.success('New template created');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Manage Templates</h1>
            <p className="text-muted-foreground">
              Edit, archive, and track changes to audit templates
            </p>
          </div>
        </div>
        <Button onClick={handleCreateTemplate} className="gap-2">
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Search and Tabs */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates..."
            className="pl-10"
          />
        </div>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'active' | 'archived')}>
          <TabsList>
            <TabsTrigger value="active">Active ({activeTemplates.length})</TabsTrigger>
            <TabsTrigger value="archived">Archived ({archivedTemplates.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Template Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((tpl) => (
          <Card key={tpl.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <ClipboardCheck className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base truncate">{tpl.title}</CardTitle>
                  <CardDescription className="mt-1">
                    v{tpl.version} • {tpl.category}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1.5 mb-4">
                <Badge variant="secondary" className="text-xs">
                  {tpl.sampleQuestions.length} questions
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {tpl.passingThreshold}% threshold
                </Badge>
                {tpl.criticalFailKeys.length > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {tpl.criticalFailKeys.length} critical
                  </Badge>
                )}
              </div>

              <div className="flex gap-2">
                {activeTab === 'active' ? (
                  <>
                    <Button size="sm" variant="outline" className="flex-1 gap-1" onClick={() => handleEditTemplate(tpl)}>
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleViewHistory(tpl)}>
                      <History className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleArchiveTemplate(tpl)}>
                      <Archive className="w-4 h-4" />
                    </Button>
                  </>
                ) : (
                  <Button size="sm" variant="outline" className="flex-1 gap-2" onClick={() => handleRestoreTemplate(tpl)}>
                    <RotateCcw className="w-4 h-4" />
                    Restore
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No templates found</p>
          </div>
        )}
      </div>

      {/* Template Editor Modal */}
      <TemplateEditorModal
        open={!!editingTemplate}
        onOpenChange={(open) => !open && setEditingTemplate(null)}
        template={editingTemplate}
        onSave={handleSaveTemplate}
      />

      {/* History Modal */}
      <Dialog open={!!viewHistoryTemplate} onOpenChange={(open) => !open && setViewHistoryTemplate(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Change History
            </DialogTitle>
            <DialogDescription>
              {viewHistoryTemplate?.title} • Current: v{viewHistoryTemplate?.version}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[50vh]">
            {historyChanges.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <History className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No change history recorded yet.</p>
              </div>
            ) : (
              <div className="space-y-3 pr-4">
                {historyChanges.map(change => (
                  <div key={change.id} className="border rounded-lg p-3 bg-muted/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            v{change.version}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(change.changedAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{change.changeDescription}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {change.changeType.replace(/_/g, ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
