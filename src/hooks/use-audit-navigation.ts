import { useApp } from '@/contexts/AppContext';
import { toast } from '@/hooks/use-toast';

type StartAuditOptions = {
  templateId: string;
  from: string;
  actionId?: string;
  unit?: string;
  auditor?: string;
  autoStart?: boolean;
};

type OpenAuditOptions = {
  sessionId: string;
  from: string;
};

export function useAuditNavigation() {
  const { templates, setActiveTab, setStartAuditRequest, setOpenSessionRequest } = useApp();

  const startAudit = ({ templateId, from, actionId, unit, auditor, autoStart }: StartAuditOptions) => {
    if (!templateId) {
      toast({ title: 'No Audit Tool', description: 'This item is not linked to an audit tool.', variant: 'destructive' });
      return;
    }

    const template = templates.find(t => t.id === templateId);
    if (!template) {
      toast({ title: 'Template Not Found', description: 'The linked audit tool was not found.', variant: 'destructive' });
      return;
    }

    setStartAuditRequest({
      templateId,
      from,
      actionId,
      unit,
      auditor,
      autoStart
    });
    setActiveTab('sessions');
    toast({ title: 'Starting Audit', description: `Launching ${template.title}...` });
  };

  const openAuditSession = ({ sessionId, from }: OpenAuditOptions) => {
    if (!sessionId) {
      toast({ title: 'No Audit Session', description: 'This item does not reference an audit session.', variant: 'destructive' });
      return;
    }

    setOpenSessionRequest({ sessionId, from });
    setActiveTab('sessions');
    toast({ title: 'Opening Audit File', description: 'Navigate to review the linked audit session.' });
  };

  return { startAudit, openAuditSession };
}
