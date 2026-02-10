import { useMemo, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { defaultOpenGroups, getNavItemByPath, navGroups } from '@/lib/navigation';

interface AppSidebarProps {
  mobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

const SIDEBAR_COLLAPSED_KEY = 'hub-health.sidebar.collapsed';
const SIDEBAR_GROUPS_KEY = 'hub-health.sidebar.groups';

function loadCollapsedState() {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
}

function loadOpenGroups() {
  const rawValue = localStorage.getItem(SIDEBAR_GROUPS_KEY);
  if (!rawValue) {
    return defaultOpenGroups;
  }

  try {
    const parsed = JSON.parse(rawValue) as string[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultOpenGroups;
  } catch {
    return defaultOpenGroups;
  }
}

export function AppSidebar({ mobileOpen = false, onMobileOpenChange }: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(loadCollapsedState);
  const [openGroups, setOpenGroups] = useState<string[]>(loadOpenGroups);
  const isMobile = useIsMobile();
  const location = useLocation();

  const activeItem = getNavItemByPath(location.pathname);

  const currentOpenGroups = useMemo(() => {
    if (activeItem && !openGroups.includes(activeItem.groupId)) {
      return [...openGroups, activeItem.groupId];
    }

    return openGroups;
  }, [activeItem, openGroups]);

  const setCollapsedWithPersist = (next: boolean) => {
    setCollapsed(next);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
  };

  const setGroupsWithPersist = (value: string[]) => {
    setOpenGroups(value);
    localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(value));
  };

  const renderItems = (groupId: string) => {
    const group = navGroups.find((g) => g.id === groupId);
    if (!group) {
      return null;
    }

    return group.items.map((item) => {
      const Icon = item.icon;

      return (
        <NavLink
          key={item.id}
          to={item.path}
          onClick={() => {
            if (isMobile) {
              onMobileOpenChange?.(false);
            }
          }}
          title={collapsed ? item.label : undefined}
          className={({ isActive }) =>
            cn(
              'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
              isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-sidebar-foreground hover:bg-sidebar-accent',
            )
          }
        >
          <Icon className="w-5 h-5 shrink-0" />
          {!collapsed && <span>{item.label}</span>}
        </NavLink>
      );
    });
  };

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

      <nav className="flex-1 p-2 overflow-y-auto">
        {collapsed ? (
          <div className="space-y-1">{navGroups.flatMap((group) => renderItems(group.id))}</div>
        ) : (
          <Accordion
            type="multiple"
            value={currentOpenGroups}
            onValueChange={setGroupsWithPersist}
            className="space-y-1"
          >
            {navGroups.map((group) => (
              <AccordionItem key={group.id} value={group.id} className="border-none">
                <AccordionTrigger className="px-3 py-2 text-xs uppercase tracking-wide text-sidebar-foreground/70 hover:no-underline">
                  {group.label}
                </AccordionTrigger>
                <AccordionContent className="pb-1 pt-1 space-y-1">{renderItems(group.id)}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </nav>

      {!isMobile && (
        <div className="p-2 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={() => setCollapsedWithPersist(!collapsed)}
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
        'flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300',
        collapsed ? 'w-16' : 'w-72',
      )}
    >
      {sidebarContent}
    </aside>
  );
}
