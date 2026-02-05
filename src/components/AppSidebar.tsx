import { useApp } from '@/contexts/AppContext';
import {
  LayoutDashboard,
  ClipboardCheck,
  FileText,
  AlertCircle,
  GraduationCap,
  Users,
  BarChart3,
  Calendar,
  Settings,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Inbox,
  BookOpen,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'templates', label: 'Audit Templates', icon: ClipboardCheck },
  { id: 'sessions', label: 'Audit Sessions', icon: FileText },
  { id: 'qa-actions', label: 'QA Actions', icon: AlertCircle },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'edu-library', label: 'Topic Library', icon: BookOpen },
  { id: 'orientation', label: 'Orientation', icon: Users },
  { id: 'follow-up', label: 'Follow-Up Queue', icon: Inbox },
  { id: 'analytics', label: 'Analytics+', icon: BarChart3 },
  { id: 'calendar', label: 'Calendar', icon: Calendar },
  { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
  { id: 'regulatory-references', label: 'Regulatory References', icon: BookOpen },
  { id: 'recommendations', label: 'Recommendation Center', icon: Sparkles },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'user-guide', label: 'User Guide', icon: HelpCircle },
];

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

export function AppSidebar({ mobileOpen = false, onMobileOpenChange }: AppSidebarProps) {
  const { activeTab, setActiveTab } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const isMobile = useIsMobile();

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0">
            NE
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-bold text-sm leading-tight">Nurse Educator</h1>
              <p className="text-xs text-muted-foreground">Suite</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (isMobile) {
                  onMobileOpenChange?.(false);
                }
              }}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {!isMobile && (
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      )}
    </>
  );

  if (isMobile) {
    return (
      <Sheet open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <SheetContent
          side="left"
          className="w-72 bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden"
        >
          <div className="flex h-full flex-col">{sidebarContent}</div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <aside
      className={cn(
        "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {sidebarContent}
    </aside>
  );
}
