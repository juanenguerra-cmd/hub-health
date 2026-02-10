import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import type { AuditSample, AuditSession, EducationSession, QaAction } from '@/types/nurse-educator';

export const useWorkflowNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setStartAuditRequest, setStartQAActionRequest, setStartEducationRequest } = useApp();

  return {
    createQAFromSample: (session: AuditSession, sample: AuditSample) => {
      setStartQAActionRequest({
        prefillData: {
          templateId: session.templateId,
          templateTitle: session.templateTitle,
          unit: session.header.unit,
          auditDate: session.header.auditDate,
          sessionId: session.header.sessionId,
          sample: sample.id,
          issue: sample.result?.criticalFails?.[0] || 'Audit finding',
          staffAudited: sample.staffAudited,
        },
        returnTo: location.pathname,
      });
      navigate('/qa-actions');
    },
    scheduleEducationFromQA: (qaAction: QaAction) => {
      setStartEducationRequest({
        prefillData: {
          topic: qaAction.topic || qaAction.issue,
          summary: qaAction.summary,
          unit: qaAction.unit,
          linkedQaActionId: qaAction.id,
        },
        returnTo: location.pathname,
      });
      navigate('/education');
    },
    scheduleReAuditFromQA: (qaAction: QaAction) => {
      setStartAuditRequest({
        templateId: qaAction.reAuditTemplateId || qaAction.templateId,
        from: 'qa-action',
        actionId: qaAction.id,
        unit: qaAction.unit,
        autoStart: true,
      });
      navigate('/sessions');
    },
    scheduleReAuditFromEducation: (eduSession: EducationSession) => {
      setStartAuditRequest({
        templateId: eduSession.templateId,
        from: 'education',
        actionId: eduSession.linkedQaActionId,
        unit: eduSession.unit,
        autoStart: true,
      });
      navigate('/sessions');
    },
    closeQAFromEducation: (eduSession: EducationSession) => {
      setStartQAActionRequest({
        prefillData: {
          id: eduSession.linkedQaActionId,
          status: 'complete',
          completedAt: new Date().toISOString().slice(0, 10),
        },
        returnTo: location.pathname,
      });
      navigate('/qa-actions');
    },
    returnToPrevious: () => {
      navigate(-1);
    },
  };
};
