import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
import {
  loadTemplates,
  loadSessions,
  saveSessions,
  loadQaActions,
  saveQaActions,
  loadEduSessions,
  saveEduSessions,
  loadOrientationRecords,
  loadEduLibrary,
  loadStaffDirectory,
  loadAdminOwners,
  loadFacilityName,
  generateDemoData
} from '@/lib/storage';

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
  
  // Demo mode
  loadDemoData: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

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
  
  // Navigation
  const [activeTab, setActiveTab] = useState('dashboard');
  
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
  
  // Load data on mount
  useEffect(() => {
    setTemplates(loadTemplates());
    setSessionsState(loadSessions());
    setQaActionsState(loadQaActions());
    setEduSessionsState(loadEduSessions());
    setOrientationRecords(loadOrientationRecords());
    setEduLibrary(loadEduLibrary());
    setStaffDirectory(loadStaffDirectory());
    setAdminOwners(loadAdminOwners());
    setFacilityName(loadFacilityName());
  }, []);
  
  // Persist data mutations
  const setSessions = (newSessions: AuditSession[]) => {
    setSessionsState(newSessions);
    saveSessions(newSessions);
  };
  
  const setQaActions = (newActions: QaAction[]) => {
    setQaActionsState(newActions);
    saveQaActions(newActions);
  };
  
  const setEduSessions = (newSessions: EducationSession[]) => {
    setEduSessionsState(newSessions);
    saveEduSessions(newSessions);
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
      loadDemoData
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
