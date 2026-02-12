import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type {
  AuditTemplate,
  AuditSession,
  QaAction,
  EducationSession,
  OrientationRecord,
  EduTopic,
  StaffMember,
  AdminOwners,
  DashboardFilters,
  ActionsFilters,
  EducationFilters,
  AnalyticsFilters
} from '@/types/nurse-educator';
import type { FacilityUnit } from '@/types/facility-units';
import {
  loadTemplates,
  saveTemplates,
  loadSessions,
  saveSessions,
  loadQaActions,
  saveQaActions,
  loadEduSessions,
  saveEduSessions,
  loadOrientationRecords,
  saveOrientationRecords,
  loadEduLibrary,
  saveEduLibrary,
  loadStaffDirectory,
  saveStaffDirectory,
  loadAdminOwners,
  saveAdminOwners,
  loadFacilityName,
  saveFacilityName,
  loadFacilityUnits,
  saveFacilityUnits,
  generateDemoData
} from '@/lib/storage';
import { parseBackupFile, processBackupData, createBackup, type RestoreResult } from '@/lib/backup-restore';
import { getNavItemById, getNavItemByPath } from '@/lib/navigation';
import { categorizeByKeywords } from '@/lib/regulatory-categories';

interface AppContextType {
  // Data
  templates: AuditTemplate[];
  sessions: AuditSession[];
  qaActions: QaAction[];
  eduSessions: EducationSession[];
  orientationRecords: OrientationRecord[];
  eduLibrary: EduTopic[];
  staffDirectory: { rows: StaffMember[]; asOf: string };
  adminOwners: AdminOwners;
  facilityName: string;
  facilityUnits: FacilityUnit[];
  
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  
  // Filters
  dashFilters: DashboardFilters;
  setDashFilters: (filters: DashboardFilters) => void;
  actionsFilters: ActionsFilters;
  setActionsFilters: (filters: ActionsFilters) => void;
  eduFilters: EducationFilters;
  setEduFilters: (filters: EducationFilters) => void;
  analyticsFilters: AnalyticsFilters;
  setAnalyticsFilters: (filters: AnalyticsFilters) => void;
  
  // Data mutations
  setSessions: (sessions: AuditSession[]) => void;
  setQaActions: (actions: QaAction[]) => void;
  setEduSessions: (sessions: EducationSession[]) => void;
  setTemplates: (templates: AuditTemplate[]) => void;
  setEduLibrary: (library: EduTopic[]) => void;
  setOrientationRecords: (records: OrientationRecord[]) => void;
  setFacilityName: (name: string) => void;
  setFacilityUnits: (units: FacilityUnit[]) => void;
  
  // Backup & Restore
  restoreFromBackup: (content: string) => RestoreResult;
  exportBackup: () => string;
  
  // Demo mode
  loadDemoData: () => void;

  // Navigation requests
  startAuditRequest: StartAuditRequest | null;
  setStartAuditRequest: (request: StartAuditRequest | null) => void;
  openSessionRequest: OpenSessionRequest | null;
  setOpenSessionRequest: (request: OpenSessionRequest | null) => void;
  startQAActionRequest: StartQAActionRequest | null;
  setStartQAActionRequest: (request: StartQAActionRequest | null) => void;
  startEducationRequest: StartEducationRequest | null;
  setStartEducationRequest: (request: StartEducationRequest | null) => void;
}

const AppContext = createContext<AppContextType | null>(null);


const normalizeSessionStaff = (items: AuditSession[]): AuditSession[] => (
  items.map((session) => ({
    ...session,
    samples: (session.samples || []).map((sample) => ({
      ...sample,
      staffAudited: sample.staffAudited || ''
    }))
  }))
);

const normalizeQaActions = (items: QaAction[]): QaAction[] => (
  items.map((action) => ({
    ...action,
    staffAudited: action.staffAudited || '',
    linkedEducationSessions: action.linkedEducationSessions || (action.linkedEduSessionId ? [action.linkedEduSessionId] : []),
    closureValidated: action.closureValidated ?? true,
    closureValidationErrors: action.closureValidationErrors || []
  }))
);


type StartAuditRequest = {
  templateId: string;
  from: string;
  actionId?: string;
  unit?: string;
  auditor?: string;
  autoStart?: boolean;
  isReAudit?: boolean;
};

type OpenSessionRequest = {
  sessionId: string;
  from: string;
};

type StartQAActionRequest = {
  prefillData: Partial<QaAction>;
  returnTo: string;
};

type StartEducationRequest = {
  prefillData: Partial<EducationSession>;
  returnTo: string;
};

export function AppProvider({ children }: { children: ReactNode }) {
  // Core data state
  const [templates, setTemplates] = useState<AuditTemplate[]>([]);
  const [sessions, setSessionsState] = useState<AuditSession[]>([]);
  const [qaActions, setQaActionsState] = useState<QaAction[]>([]);
  const [eduSessions, setEduSessionsState] = useState<EducationSession[]>([]);
  const [orientationRecords, setOrientationRecords] = useState<OrientationRecord[]>([]);
  const [eduLibrary, setEduLibrary] = useState<EduTopic[]>([]);
  const [staffDirectory, setStaffDirectory] = useState<{ rows: StaffMember[]; asOf: string }>({ rows: [], asOf: '' });
  const [adminOwners, setAdminOwners] = useState<AdminOwners>({
    qapiLead: 'QAPI Coordinator',
    don: 'Director of Nursing',
    ip: 'Infection Preventionist',
    educator: 'Staff Educator',
    hr: 'HR/Staffing',
    unitMgr: 'Unit Manager',
    admin: 'Administrator'
  });
  const [facilityName, setFacilityName] = useState('My Healthcare Facility');
  const [facilityUnits, setFacilityUnits] = useState<FacilityUnit[]>([]);
  
  // Navigation
  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTabState] = useState('dashboard');

  useEffect(() => {
    const activeItem = getNavItemByPath(location.pathname);
    setActiveTabState(activeItem?.id ?? 'dashboard');
  }, [location.pathname]);

  const setActiveTab = (tab: string) => {
    const navItem = getNavItemById(tab);
    if (navItem) {
      navigate(navItem.path);
      return;
    }

    setActiveTabState(tab);
  };
  
  // Filters
  const [dashFilters, setDashFilters] = useState<DashboardFilters>({
    range: '30',
    unit: 'All',
    tool: 'All'
  });
  
  const [actionsFilters, setActionsFilters] = useState<ActionsFilters>({
    range: '30',
    status: 'All',
    tool: 'All',
    search: ''
  });
  
  const [eduFilters, setEduFilters] = useState<EducationFilters>({
    status: 'All',
    search: '',
    fromYmd: '',
    toYmd: ''
  });
  
  const [analyticsFilters, setAnalyticsFilters] = useState<AnalyticsFilters>({
    fromYmd: '',
    toYmd: '',
    unit: 'All',
    range: '30'
  });

  const [startAuditRequest, setStartAuditRequest] = useState<StartAuditRequest | null>(null);
  const [openSessionRequest, setOpenSessionRequest] = useState<OpenSessionRequest | null>(null);
  const [startQAActionRequest, setStartQAActionRequest] = useState<StartQAActionRequest | null>(null);
  const [startEducationRequest, setStartEducationRequest] = useState<StartEducationRequest | null>(null);
  
  // Load data on mount
  useEffect(() => {
    const loadedLibrary = loadEduLibrary();
    const migratedLibrary = loadedLibrary.map(topic => {
      if (topic.regulatoryCategory) {
        return topic;
      }

      const regulatoryCategory = categorizeByKeywords(
        topic.topic,
        topic.ftags,
        topic.nysdohRegs || '',
        topic.purpose
      );
      const nysdohRequired = /orientation|abuse|infection|fire|emergency|rights/i.test(
        `${topic.topic} ${topic.purpose}`
      );

      return {
        ...topic,
        regulatoryCategory,
        nysdohRequired
      };
    });

    setTemplates(loadTemplates());
    setSessionsState(normalizeSessionStaff(loadSessions()));
    setQaActionsState(normalizeQaActions(loadQaActions()));
    setEduSessionsState(loadEduSessions());
    setOrientationRecords(loadOrientationRecords());
    setEduLibrary(migratedLibrary);
    setStaffDirectory(loadStaffDirectory());
    setAdminOwners(loadAdminOwners());
    setFacilityName(loadFacilityName());
    setFacilityUnits(loadFacilityUnits());

    if (migratedLibrary.some((topic, index) => topic.regulatoryCategory !== loadedLibrary[index]?.regulatoryCategory)) {
      saveEduLibrary(migratedLibrary);
    }
  }, []);
  
  // Persist data mutations
  const setSessions = (newSessions: AuditSession[]) => {
    const normalized = normalizeSessionStaff(newSessions);
    setSessionsState(normalized);
    saveSessions(normalized);
  };
  
  const setQaActions = (newActions: QaAction[]) => {
    const normalized = normalizeQaActions(newActions);
    setQaActionsState(normalized);
    saveQaActions(normalized);
  };
  
  const setEduSessions = (newSessions: EducationSession[]) => {
    setEduSessionsState(newSessions);
    saveEduSessions(newSessions);
  };
  
  const setTemplatesData = (newTemplates: AuditTemplate[]) => {
    setTemplates(newTemplates);
    saveTemplates(newTemplates);
  };
  
  const setEduLibraryData = (newLibrary: EduTopic[]) => {
    setEduLibrary(newLibrary);
    saveEduLibrary(newLibrary);
  };
  
  const setOrientationRecordsData = (newRecords: OrientationRecord[]) => {
    setOrientationRecords(newRecords);
    saveOrientationRecords(newRecords);
  };
  
  const setFacilityNameData = (name: string) => {
    setFacilityName(name);
    saveFacilityName(name);
  };
  
  const setFacilityUnitsData = (units: FacilityUnit[]) => {
    setFacilityUnits(units);
    saveFacilityUnits(units);
  };
  
  // Backup & Restore
  const restoreFromBackup = (content: string): RestoreResult => {
    const backup = parseBackupFile(content);
    
    if (!backup) {
      return {
        success: false,
        message: 'Invalid backup file format. Please select a valid backup JSON file.',
        counts: { templates: 0, sessions: 0, eduSessions: 0, eduLibrary: 0, qaActions: 0 }
      };
    }
    
    const processed = processBackupData(backup);
    
    // Import the data
    if (processed.templates.length > 0) {
      setTemplates(processed.templates);
      saveTemplates(processed.templates);
    }
    
    if (processed.sessions.length > 0) {
      setSessionsState(processed.sessions);
      saveSessions(processed.sessions);
    }
    
    if (processed.eduSessions.length > 0) {
      setEduSessionsState(processed.eduSessions);
      saveEduSessions(processed.eduSessions);
    }
    
    if (processed.eduLibrary.length > 0) {
      setEduLibrary(processed.eduLibrary);
      saveEduLibrary(processed.eduLibrary);
    }
    
    if (processed.qaActions.length > 0) {
      setQaActionsState(processed.qaActions);
      saveQaActions(processed.qaActions);
    }

    if (processed.orientationRecords) {
      setOrientationRecords(processed.orientationRecords);
      saveOrientationRecords(processed.orientationRecords);
    }

    if (processed.staffDirectory) {
      setStaffDirectory(processed.staffDirectory);
      saveStaffDirectory(processed.staffDirectory);
    }

    if (processed.adminOwners) {
      setAdminOwners(processed.adminOwners);
      saveAdminOwners(processed.adminOwners);
    }

    if (processed.facilityName) {
      setFacilityName(processed.facilityName);
      saveFacilityName(processed.facilityName);
    }

    if (processed.facilityUnits) {
      setFacilityUnits(processed.facilityUnits);
      saveFacilityUnits(processed.facilityUnits);
    }
    
    return {
      success: true,
      message: 'Backup restored successfully!',
      counts: {
        templates: processed.templates.length,
        sessions: processed.sessions.length,
        eduSessions: processed.eduSessions.length,
        eduLibrary: processed.eduLibrary.length,
        qaActions: processed.qaActions.length
      }
    };
  };
  
  const exportBackup = (): string => {
    return createBackup({
      templates,
      sessions,
      eduSessions,
      eduLibrary,
      qaActions,
      orientationRecords,
      adminOwners,
      facilityName,
      staffDirectory,
      facilityUnits
    });
  };
  
  // Load demo data
  const loadDemoData = () => {
    const demo = generateDemoData();
    setSessions(demo.sessions);
    setQaActions(demo.qaActions);
    setEduSessions(demo.eduSessions);
  };
  
  return (
    <AppContext.Provider value={{
      templates,
      sessions,
      qaActions,
      eduSessions,
      orientationRecords,
      eduLibrary,
      staffDirectory,
      adminOwners,
      facilityName,
      facilityUnits,
      activeTab,
      setActiveTab,
      dashFilters,
      setDashFilters,
      actionsFilters,
      setActionsFilters,
      eduFilters,
      setEduFilters,
      analyticsFilters,
      setAnalyticsFilters,
      setSessions,
      setQaActions,
      setEduSessions,
      setTemplates: setTemplatesData,
      setEduLibrary: setEduLibraryData,
      setOrientationRecords: setOrientationRecordsData,
      setFacilityName: setFacilityNameData,
      setFacilityUnits: setFacilityUnitsData,
      restoreFromBackup,
      exportBackup,
      loadDemoData,
      startAuditRequest,
      setStartAuditRequest,
      openSessionRequest,
      setOpenSessionRequest,
      startQAActionRequest,
      setStartQAActionRequest,
      startEducationRequest,
      setStartEducationRequest
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
