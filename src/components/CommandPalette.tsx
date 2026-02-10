import { type ComponentType, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, ClipboardCheck, FileDown, PlusCircle, Sparkles } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from '@/components/ui/command';
import { navGroups } from '@/lib/navigation';

type QuickAction = {
  id: string;
  label: string;
  keywords?: string;
  shortcut?: string;
  onSelect: () => void;
  icon?: ComponentType<{ className?: string }>; 
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  const navigationActions = useMemo(
    () =>
      navGroups.flatMap((group) =>
        group.items.map((item) => ({
          id: `nav-${item.id}`,
          label: item.label,
          keywords: `${group.label} ${item.label}`,
          onSelect: () => {
            navigate(item.path);
            setOpen(false);
          },
          icon: item.icon,
        })),
      ),
    [navigate],
  );

  const quickActions: QuickAction[] = [
    {
      id: 'new-audit-session',
      label: 'New Audit Session',
      keywords: 'session create',
      shortcut: 'AS',
      icon: PlusCircle,
      onSelect: () => {
        navigate('/sessions');
        setOpen(false);
      },
    },
    {
      id: 'new-qa-action',
      label: 'New QA Action',
      keywords: 'qa action create',
      shortcut: 'QA',
      icon: ClipboardCheck,
      onSelect: () => {
        navigate('/qa-actions');
        setOpen(false);
      },
    },
    {
      id: 'schedule-education',
      label: 'Schedule Education',
      keywords: 'education schedule training',
      shortcut: 'ED',
      icon: Sparkles,
      onSelect: () => {
        navigate('/education');
        setOpen(false);
      },
    },
    {
      id: 'view-calendar',
      label: 'View Calendar',
      keywords: 'calendar view',
      shortcut: 'VC',
      icon: Calendar,
      onSelect: () => {
        navigate('/calendar');
        setOpen(false);
      },
    },
    {
      id: 'export-reports',
      label: 'Export Reports',
      keywords: 'reports export',
      shortcut: 'ER',
      icon: FileDown,
      onSelect: () => {
        navigate('/reports');
        setOpen(false);
      },
    },
  ];

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages and actions..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {navigationActions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem key={action.id} value={`${action.label} ${action.keywords ?? ''}`} onSelect={action.onSelect}>
                {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                <span>{action.label}</span>
              </CommandItem>
            );
          })}
        </CommandGroup>
        <CommandGroup heading="Quick Actions">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <CommandItem key={action.id} value={`${action.label} ${action.keywords ?? ''}`} onSelect={action.onSelect}>
                {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
                <span>{action.label}</span>
                {action.shortcut ? <CommandShortcut>{action.shortcut}</CommandShortcut> : null}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
