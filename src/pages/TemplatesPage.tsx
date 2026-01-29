import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ClipboardCheck, Play, Eye, Settings2, FileText, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import type { AuditTemplate } from '@/types/nurse-educator';

export function TemplatesPage() {
  const { templates, setActiveTab } = useApp();
  
  // State for preview dialog
  const [previewTemplate, setPreviewTemplate] = useState<AuditTemplate | null>(null);
  
  // State for run audit dialog
  const [runAuditTemplate, setRunAuditTemplate] = useState<AuditTemplate | null>(null);
  const [auditUnit, setAuditUnit] = useState('');
  const [auditAuditor, setAuditAuditor] = useState('');
  
  const activeTemplates = templates.filter(t => !t.archived);

  const handleRunAudit = (template: AuditTemplate) => {
    setRunAuditTemplate(template);
    setAuditUnit('');
    setAuditAuditor('');
  };

  const handleStartAudit = () => {
    if (!runAuditTemplate) return;
    
    // Navigate to sessions page with template pre-selected
    // Store the selected template info in sessionStorage for the sessions page to pick up
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Templates</h1>
          <p className="text-muted-foreground">Survey-ready audit tools with CMS F-tags and NYDOH references</p>
        </div>
        <Button className="gap-2">
          <Settings2 className="w-4 h-4" />
          Manage Templates
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {activeTemplates.map((tpl) => (
          <Card key={tpl.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <ClipboardCheck className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{tpl.title}</CardTitle>
                    <CardDescription className="mt-1">
                      v{tpl.version} • {tpl.category}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {tpl.passingThreshold}% threshold
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {tpl.purpose.summary}
              </p>
              
              <div className="flex flex-wrap gap-1.5 mb-4">
                {tpl.ftagTags.map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    CMS {tag}
                  </Badge>
                ))}
                {tpl.nydohTags.slice(0, 1).map(tag => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    NYDOH
                  </Badge>
                ))}
                {tpl.placementTags.slice(0, 2).map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <div className="flex gap-2">
                <Button size="sm" className="flex-1 gap-2" onClick={() => handleRunAudit(tpl)}>
                  <Play className="w-4 h-4" />
                  Run Audit
                </Button>
                <Button size="sm" variant="outline" className="gap-2" onClick={() => handlePreview(tpl)}>
                  <Eye className="w-4 h-4" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

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
            <Button variant="outline" onClick={() => setPreviewTemplate(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
