import {
  AlertCircle,
  BarChart3,
  BookOpen,
  Calendar,
  ClipboardCheck,
  FileSpreadsheet,
  FileText,
  GraduationCap,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';

export type NavItem = {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  groupId: string;
  groupLabel: string;
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
};

export const navGroups: NavGroup[] = [
  {
    id: 'core',
    label: 'Core Operations',
    items: [
      { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, groupId: 'core', groupLabel: 'Core Operations' },
      { id: 'calendar', label: 'Calendar', path: '/calendar', icon: Calendar, groupId: 'core', groupLabel: 'Core Operations' },
      { id: 'follow-up', label: 'Follow-Up Queue', path: '/follow-up', icon: Inbox, groupId: 'core', groupLabel: 'Core Operations' },
    ],
  },
  {
    id: 'audit',
    label: 'Audit Management',
    items: [
      { id: 'templates', label: 'Audit Templates', path: '/templates', icon: ClipboardCheck, groupId: 'audit', groupLabel: 'Audit Management' },
      { id: 'sessions', label: 'Audit Sessions', path: '/sessions', icon: FileText, groupId: 'audit', groupLabel: 'Audit Management' },
      { id: 'qa-actions', label: 'QA Actions', path: '/qa-actions', icon: AlertCircle, groupId: 'audit', groupLabel: 'Audit Management' },
      { id: 'workflow-dashboard', label: 'Workflow Dashboard', path: '/workflow-dashboard', icon: Workflow, groupId: 'audit', groupLabel: 'Audit Management' },
    ],
  },
  {
    id: 'education',
    label: 'Education & Training',
    items: [
      { id: 'education', label: 'Education Sessions', path: '/education', icon: GraduationCap, groupId: 'education', groupLabel: 'Education & Training' },
      { id: 'edu-library', label: 'Topic Library', path: '/edu-library', icon: BookOpen, groupId: 'education', groupLabel: 'Education & Training' },
      { id: 'orientation', label: 'Orientation', path: '/orientation', icon: Users, groupId: 'education', groupLabel: 'Education & Training' },
    ],
  },
  {
    id: 'insights',
    label: 'Insights & Reporting',
    items: [
      { id: 'analytics', label: 'Analytics+', path: '/analytics', icon: BarChart3, groupId: 'insights', groupLabel: 'Insights & Reporting' },
      { id: 'reports', label: 'Reports', path: '/reports', icon: FileSpreadsheet, groupId: 'insights', groupLabel: 'Insights & Reporting' },
      { id: 'recommendations', label: 'AI Recommendations', path: '/recommendations', icon: Sparkles, groupId: 'insights', groupLabel: 'Insights & Reporting' },
    ],
  },
  {
    id: 'resources',
    label: 'Resources',
    items: [
      { id: 'regulatory-references', label: 'Regulatory References', path: '/regulatory-references', icon: BookOpen, groupId: 'resources', groupLabel: 'Resources' },
      { id: 'user-guide', label: 'User Guide', path: '/user-guide', icon: HelpCircle, groupId: 'resources', groupLabel: 'Resources' },
      { id: 'settings', label: 'Settings', path: '/settings', icon: Settings, groupId: 'resources', groupLabel: 'Resources' },
    ],
  },
];

export const navItems = navGroups.flatMap((group) => group.items);

export const defaultOpenGroups = navGroups.map((group) => group.id);

export function getNavItemById(id: string) {
  return navItems.find((item) => item.id === id);
}

export function getNavItemByPath(pathname: string) {
  if (pathname.startsWith('/sessions/')) {
    return getNavItemById('sessions');
  }

  return navItems.find((item) => item.path === pathname);
}
