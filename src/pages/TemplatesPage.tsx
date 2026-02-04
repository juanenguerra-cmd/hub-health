import { useEffect, useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ClipboardCheck, 
  Play, 
  Eye, 
  Settings2, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Printer,
  Search,
  ChevronDown,
  Tag,
  Filter
} from 'lucide-react';
import type { AuditTemplate } from '@/types/nurse-educator';
import { PreAuditPrintModal } from '@/components/audit/PreAuditPrintModal';
import { TemplateManagementPage } from '@/pages/TemplateManagementPage';

export function TemplatesPage() {
  const { templates, setActiveTab } = useApp();
  
  // State for management view
  const [showManagement, setShowManagement] = useState(false);
  
  // State for search and filter
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  
  // State for expanded templates
  const [expandedTemplates, setExpandedTemplates] = useState<Set<string>>(new Set());

  // State for expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  
  // State for preview dialog
  const [previewTemplate, setPreviewTemplate] = useState<AuditTemplate | null>(null);
  
  // State for run audit dialog
  const [runAuditTemplate, setRunAuditTemplate] = useState<AuditTemplate | null>(null);
  const [auditUnit, setAuditUnit] = useState('');
  const [auditAuditor, setAuditAuditor] = useState('');
  
  // State for print pre-audit form
  const [printPreAuditTemplate, setPrintPreAuditTemplate] = useState<AuditTemplate | null>(null);
  
  const activeTemplates = templates.filter(t => !t.archived);

  // Get all unique categories
  const allCategories = useMemo(() => {
    const cats = new Set(activeTemplates.map(t => t.category || 'Uncategorized'));
    return Array.from(cats).sort();
  }, [activeTemplates]);

  // Filter templates by search and category
  const filteredTemplates = activeTemplates.filter(t => {
    // Category filter
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;
    // Search filter
    if (!search) return true;
    const q = search.toLowerCase();
    const hay = `${t.title} ${t.category} ${t.ftagTags.join(' ')} ${t.purpose.summary}`.toLowerCase();
    return hay.includes(q);
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

  useEffect(() => {
    setExpandedCategories(prev => {
      if (prev.size === 0) {
        return new Set(categories);
      }
      const next = new Set(prev);
      categories.forEach(category => next.add(category));
      return next;
    });
  }, [categories]);

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

  const toggleCategory = (category: string) => {
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

  const handleRunAudit = (template: AuditTemplate) => {
    setRunAuditTemplate(template);
    setAuditUnit('');
    setAuditAuditor('');
  };

  const handleStartAudit = () => {
    if (!runAuditTemplate) return;
    
    sessionStorage.setItem('NES_START_AUDIT', JSON.stringify({
      templateId: runAuditTemplate.id,
      unit: auditUnit,
      auditor: auditAuditor
    }));
    
    setRunAuditTemplate(null);
    setActiveTab('sessions');
  };

  const handlePreview = (template: AuditTemplate) => {
    setPreviewTemplate(template);
  };

  // Show management page if in management mode
  if (showManagement) {
    return <TemplateManagementPage onBack={() => setShowManagement(false)} />;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Audit Templates</h1>
          <p className="text-muted-foreground">Survey-ready audit tools with CMS F-tags and NYDOH references</p>
        </div>
        <Button className="gap-2" onClick={() => setShowManagement(true)}>
          <Settings2 className="w-4 h-4" />
          Manage Templates
        </Button>
      </div>

      {/* Search, Filter & Stats */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates by title, category, or F-tags..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
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
            <div className="flex items-center gap-4">
              <Badge variant="secondary">{filteredTemplates.length} Templates</Badge>
              <Badge variant="outline">{categories.length} Categories</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates by Category */}
      {filteredTemplates.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ClipboardCheck className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">No templates found</p>
            <p className="text-sm text-muted-foreground">
              {search ? 'Try adjusting your search' : 'No active templates available'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {categories.map(category => {
            const isCategoryExpanded = expandedCategories.has(category);

            return (
              <Card key={category}>
                <Collapsible
                  open={isCategoryExpanded}
                  onOpenChange={() => toggleCategory(category)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Tag className="w-4 h-4 text-primary" />
                        {category}
                        <Badge variant="secondary" className="ml-2 text-xs">
                          {templatesByCategory[category].length}
                        </Badge>
                      </CardTitle>
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="gap-1">
                          <span className="text-xs text-muted-foreground">
                            {isCategoryExpanded ? 'Collapse' : 'Expand'}
                          </span>
                          <ChevronDown className={`w-4 h-4 transition-transform ${isCategoryExpanded ? 'rotate-180' : ''}`} />
                        </Button>
                      </CollapsibleTrigger>
                    </div>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      <div className="space-y-2">
                        {templatesByCategory[category].map(template => {
                          const isExpanded = expandedTemplates.has(template.id);
                          
                          return (
                            <Card key={template.id} className="border-muted">
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
                                    <div className="flex items-center gap-2 shrink-0">
                                      <Button size="sm" className="gap-1" onClick={(e) => { e.stopPropagation(); handleRunAudit(template); }}>
                                        <Play className="w-3 h-3" />
                                        Run
                                      </Button>
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
                                    {/* Purpose Summary */}
                                    <div className="space-y-3">
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
                                      <div className="flex gap-2 pt-2">
                                        <Button size="sm" variant="outline" className="gap-1" onClick={() => handlePreview(template)}>
                                          <Eye className="w-3 h-3" />
                                          Full Preview
                                        </Button>
                                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setPrintPreAuditTemplate(template)}>
                                          <Printer className="w-3 h-3" />
                                          Print Form
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            </Card>
                          );
                        })}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>
            );
          })}
        </div>
      )}

      {/* Run Audit Dialog */}
      <Dialog open={!!runAuditTemplate} onOpenChange={(open) => !open && setRunAuditTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Audit: {runAuditTemplate?.title}</DialogTitle>
            <DialogDescription>
              Enter session details to begin auditing
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Unit</Label>
              <Input 
                value={auditUnit} 
                onChange={(e) => setAuditUnit(e.target.value)}
                placeholder="e.g., 1A, 2B, ICU"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Auditor Name</Label>
              <Input 
                value={auditAuditor} 
                onChange={(e) => setAuditAuditor(e.target.value)}
                placeholder="Your name"
              />
            </div>
            
            <Button onClick={handleStartAudit} className="w-full gap-2">
              <Play className="w-4 h-4" />
              Start Audit
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              {previewTemplate?.title}
            </DialogTitle>
            <DialogDescription>
              v{previewTemplate?.version} • {previewTemplate?.category} • {previewTemplate?.passingThreshold}% passing threshold
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {/* Purpose Section */}
              <div className="space-y-2">
                <h4 className="font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Purpose
                </h4>
                <p className="text-sm text-muted-foreground">{previewTemplate?.purpose.summary}</p>
                <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 mt-2">
                  <p className="text-sm font-medium text-destructive flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Risk if Not Compliant
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{previewTemplate?.purpose.risk}</p>
                </div>
                <div className="bg-primary/10 border border-primary/20 rounded-md p-3">
                  <p className="text-sm font-medium text-primary">Evidence to Show</p>
                  <p className="text-sm text-muted-foreground mt-1">{previewTemplate?.purpose.evidenceToShow}</p>
                </div>
              </div>

              <Separator />

              {/* Regulatory Tags */}
              <div className="space-y-2">
                <h4 className="font-semibold">Regulatory References</h4>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate?.ftagTags.map(tag => (
                    <Badge key={tag} variant="outline">CMS {tag}</Badge>
                  ))}
                  {previewTemplate?.nydohTags.map(tag => (
                    <Badge key={tag} variant="outline">NYDOH {tag}</Badge>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Critical Fail Keys */}
              {previewTemplate?.criticalFailKeys && previewTemplate.criticalFailKeys.length > 0 && (
                <>
                  <div className="space-y-2">
                    <h4 className="font-semibold flex items-center gap-2 text-destructive">
                      <XCircle className="w-4 h-4" />
                      Critical Fail Items
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      These items will cause automatic failure regardless of other scores:
                    </p>
                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                      {previewTemplate.criticalFailKeys.map(key => {
                        const question = previewTemplate.sampleQuestions.find(q => q.key === key);
                        return (
                          <li key={key} className="text-destructive">
                            {question?.label || key}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <Separator />
                </>
              )}

              {/* Sample Questions */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Audit Criteria ({previewTemplate?.sampleQuestions.length} items)
                </h4>
                <div className="space-y-2">
                  {previewTemplate?.sampleQuestions.map((q, idx) => (
                    <div 
                      key={q.key} 
                      className={`p-3 rounded-md border ${
                        previewTemplate.criticalFailKeys?.includes(q.key) 
                          ? 'border-destructive/50 bg-destructive/5' 
                          : 'border-border bg-muted/30'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <span className="text-xs text-muted-foreground">#{idx + 1}</span>
                          <p className="text-sm font-medium">
                            {q.label}
                            {q.required && <span className="text-destructive ml-1">*</span>}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge variant="secondary" className="text-xs">
                            {q.type === 'yn' ? 'Yes/No' : q.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {q.score} pts
                          </Badge>
                          {previewTemplate.criticalFailKeys?.includes(q.key) && (
                            <Badge variant="destructive" className="text-xs">
                              Critical
                            </Badge>
                          )}
                        </div>
                      </div>
                      {q.options && q.options.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Options: {q.options.join(', ')}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* References */}
              {previewTemplate?.references && previewTemplate.references.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <h4 className="font-semibold">Detailed References</h4>
                    {previewTemplate.references.map((ref, idx) => (
                      <div key={idx} className="p-3 rounded-md border bg-muted/30">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{ref.system}</Badge>
                          <span className="font-medium text-sm">{ref.code}</span>
                        </div>
                        <p className="text-sm font-medium">{ref.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">{ref.whyItMatters}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </ScrollArea>

          <div className="flex gap-2 pt-4">
            <Button className="flex-1 gap-2" onClick={() => {
              if (previewTemplate) {
                handleRunAudit(previewTemplate);
                setPreviewTemplate(null);
              }
            }}>
              <Play className="w-4 h-4" />
              Run This Audit
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => {
              if (previewTemplate) {
                setPrintPreAuditTemplate(previewTemplate);
                setPreviewTemplate(null);
              }
            }}>
              <Printer className="w-4 h-4" />
              Print Form
            </Button>
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pre-Audit Print Modal */}
      {printPreAuditTemplate && (
        <PreAuditPrintModal
          open={!!printPreAuditTemplate}
          onOpenChange={(open) => !open && setPrintPreAuditTemplate(null)}
          template={printPreAuditTemplate}
        />
      )}
    </div>
  );
}
