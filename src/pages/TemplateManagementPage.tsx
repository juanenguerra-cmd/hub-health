import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ClipboardCheck, 
  Search, 
  Edit, 
  Archive, 
  RotateCcw,
  History,
  ArrowLeft,
  FileText,
  Copy,
  Sparkles,
  ChevronDown,
  Tag,
  Filter,
  AlertTriangle,
  XCircle
} from 'lucide-react';
import type { AuditTemplate } from '@/types/nurse-educator';
import type { TemplateChange } from '@/types/template-history';
import { TemplateEditorModal } from '@/components/audit/TemplateEditorModal';
import { TemplateCreationWizard } from '@/components/audit/TemplateCreationWizard';
import { loadTemplateHistory, addTemplateChange } from '@/lib/template-history-storage';
import { toast } from 'sonner';

interface TemplateManagementPageProps {
  onBack: () => void;
}

export function TemplateManagementPage({ onBack }: TemplateManagementPageProps) {
  const { templates, setTemplates } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [editingTemplate, setEditingTemplate] = useState<AuditTemplate | null>(null);
  const [viewHistoryTemplate, setViewHistoryTemplate] = useState<AuditTemplate | null>(null);
  const [historyChanges, setHistoryChanges] = useState<TemplateChange[]>([]);
  const [showCreationWizard, setShowCreationWizard] = useState(false);
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());

  const activeTemplates = templates.filter(t => !t.archived);
  const archivedTemplates = templates.filter(t => t.archived);

  // Get all unique categories
  const allCategories = useMemo(() => {
    const currentTemplates = activeTab === 'active' ? activeTemplates : archivedTemplates;
    const cats = new Set(currentTemplates.map(t => t.category || 'Uncategorized'));
    return Array.from(cats).sort();
  }, [activeTab, activeTemplates, archivedTemplates]);

  const filteredTemplates = (activeTab === 'active' ? activeTemplates : archivedTemplates)
    .filter(t => {
      // Category filter
      if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
      // Search filter
      if (!searchTerm) return true;
      const hay = `${t.title} ${t.category} ${t.ftagTags.join(' ')}`.toLowerCase();
      return hay.includes(searchTerm.toLowerCase());
    });

  // Group templates by category
  const templatesByCategory = filteredTemplates.reduce((acc, template) => {
    const category = template.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {} as Record<string, AuditTemplate[]>);

  const categories = Object.keys(templatesByCategory).sort();

  const toggleExpanded = (id: string) => {
    setExpandedTemplates(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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

  const handleCreateTemplate = (template: AuditTemplate) => {
    setTemplates([template, ...templates]);
    toast.success('Custom template created!', {
      description: `${template.title} is now available`
    });
  };

  const handleDuplicateTemplate = (template: AuditTemplate) => {
    const newId = `audit_dup_${Math.random().toString(16).slice(2, 10)}`;
    const duplicatedTemplate: AuditTemplate = {
      ...JSON.parse(JSON.stringify(template)),
      id: newId,
      title: `${template.title} (Copy)`,
      version: '1.0.0',
      archived: false,
      archivedAt: undefined,
      archivedBy: undefined,
      replacedByTemplateId: undefined
    };

    const change: TemplateChange = {
      id: `ch_${Math.random().toString(16).slice(2, 10)}`,
      templateId: newId,
      version: '1.0.0',
      previousVersion: '0.0.0',
      changedAt: new Date().toISOString(),
      changedBy: 'User',
      changeType: 'created',
      changeDescription: `Duplicated from "${template.title}" (v${template.version})`,
      details: []
    };

    addTemplateChange(change);
    setTemplates([duplicatedTemplate, ...templates]);
    toast.success('Template duplicated!', {
      description: `${duplicatedTemplate.title} created with fresh version history`
    });
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
        <Button onClick={() => setShowCreationWizard(true)} className="gap-2">
          <Sparkles className="w-4 h-4" />
          New Template
        </Button>
      </div>

      {/* Search, Filter and Tabs */}
      <Card>
        <CardContent className="pt-4">
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
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {allCategories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v as 'active' | 'archived'); setCategoryFilter('all'); }}>
              <TabsList>
                <TabsTrigger value="active">Active ({activeTemplates.length})</TabsTrigger>
                <TabsTrigger value="archived">Archived ({archivedTemplates.length})</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Templates by Category */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
            <p className="font-medium">No templates found</p>
            <p className="text-sm text-muted-foreground">
              {searchTerm || categoryFilter !== 'all' ? 'Try adjusting your filters' : 'No templates available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map(category => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Tag className="w-4 h-4 text-primary" />
                  {category}
                  <Badge variant="secondary" className="ml-2 text-xs">
                    {templatesByCategory[category].length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {templatesByCategory[category].map(template => {
                    const isExpanded = expandedTemplates.has(template.id);
                    
                    return (
                      <Card key={template.id} className={`border-muted ${template.archived ? 'opacity-60' : ''}`}>
                        <Collapsible open={isExpanded} onOpenChange={() => toggleExpanded(template.id)}>
                          <div className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <ClipboardCheck className="w-4 h-4 text-primary shrink-0" />
                                  <span className="font-medium">{template.title}</span>
                                  <Badge variant="outline" className="text-xs">v{template.version}</Badge>
                                </div>
                                <div className="flex items-center gap-2 mt-1 flex-wrap">
                                  <Badge variant="secondary" className="text-xs">
                                    {template.sampleQuestions.length} questions
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {template.passingThreshold}% threshold
                                  </Badge>
                                  {template.criticalFailKeys.length > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {template.criticalFailKeys.length} critical
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                {activeTab === 'active' ? (
                                  <>
                                    <Button size="sm" variant="outline" className="gap-1" onClick={(e) => { e.stopPropagation(); handleEditTemplate(template); }}>
                                      <Edit className="w-3 h-3" />
                                      Edit
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleDuplicateTemplate(template); }} title="Duplicate">
                                      <Copy className="w-4 h-4" />
                                    </Button>
                                    <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleViewHistory(template); }} title="History">
                                      <History className="w-4 h-4" />
                                    </Button>
                                  </>
                                ) : (
                                  <Button size="sm" variant="outline" className="gap-1" onClick={(e) => { e.stopPropagation(); handleRestoreTemplate(template); }}>
                                    <RotateCcw className="w-3 h-3" />
                                    Restore
                                  </Button>
                                )}
                                <CollapsibleTrigger asChild>
                                  <Button variant="ghost" size="sm">
                                    <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                  </Button>
                                </CollapsibleTrigger>
                              </div>
                            </div>
                          </div>
                          
                          <CollapsibleContent>
                            <div className="px-4 pb-4 border-t pt-4 bg-muted/30">
                              <div className="space-y-3">
                                {/* Purpose Summary */}
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-1">Purpose</p>
                                  <p className="text-sm">{template.purpose.summary}</p>
                                </div>
                                
                                {/* Risk Warning */}
                                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    Risk if Not Compliant
                                  </p>
                                  <p className="text-sm text-muted-foreground mt-1">{template.purpose.risk}</p>
                                </div>

                                {/* Regulatory Tags */}
                                <div>
                                  <p className="text-sm font-medium text-muted-foreground mb-2">Regulatory References</p>
                                  <div className="flex flex-wrap gap-1.5">
                                    {template.ftagTags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        CMS {tag}
                                      </Badge>
                                    ))}
                                    {template.nydohTags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        NYDOH {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>

                                {/* Critical Items Preview */}
                                {template.criticalFailKeys.length > 0 && (
                                  <div>
                                    <p className="text-sm font-medium text-destructive flex items-center gap-1 mb-2">
                                      <XCircle className="w-3 h-3" />
                                      Critical Fail Items
                                    </p>
                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-0.5">
                                      {template.criticalFailKeys.slice(0, 3).map(key => {
                                        const question = template.sampleQuestions.find(q => q.key === key);
                                        return (
                                          <li key={key} className="text-destructive text-xs">
                                            {question?.label || key}
                                          </li>
                                        );
                                      })}
                                      {template.criticalFailKeys.length > 3 && (
                                        <li className="text-muted-foreground text-xs">
                                          +{template.criticalFailKeys.length - 3} more...
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                )}

                                {/* Action Buttons */}
                                {activeTab === 'active' && (
                                  <div className="flex gap-2 pt-2">
                                    <Button size="sm" variant="outline" className="gap-1" onClick={() => handleArchiveTemplate(template)}>
                                      <Archive className="w-3 h-3" />
                                      Archive
                                    </Button>
                                    <Button size="sm" variant="ghost" className="gap-1" onClick={() => handleDuplicateTemplate(template)}>
                                      <Copy className="w-3 h-3" />
                                      Duplicate
                                    </Button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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

      {/* Template Creation Wizard */}
      <TemplateCreationWizard
        open={showCreationWizard}
        onOpenChange={setShowCreationWizard}
        onComplete={handleCreateTemplate}
      />
    </div>
  );
}
