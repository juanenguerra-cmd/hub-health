import { useState, useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StaffSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}

export function StaffSelect({ value, onValueChange, placeholder = 'Select staff...', disabled = false }: StaffSelectProps) {
  const { staffDirectory } = useApp();
  const [open, setOpen] = useState(false);

  const activeStaff = useMemo(
    () => staffDirectory.rows.filter((s) => s.status === 'Active').sort((a, b) => a.name.localeCompare(b.name)),
    [staffDirectory]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-full justify-between', !value && 'text-muted-foreground')}
          disabled={disabled}
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput placeholder="Search staff..." />
          <CommandEmpty>No staff found.</CommandEmpty>
          <CommandGroup className="max-h-64 overflow-auto">
            {activeStaff.map((staff) => (
              <CommandItem
                key={staff.id}
                value={`${staff.name} ${staff.position} ${staff.department}`}
                onSelect={() => {
                  onValueChange(staff.name);
                  setOpen(false);
                }}
              >
                <Check className={cn('mr-2 h-4 w-4', value === staff.name ? 'opacity-100' : 'opacity-0')} />
                <div className="flex-1">
                  <div className="font-medium">{staff.name}</div>
                  <div className="text-xs text-muted-foreground">{staff.position} • {staff.department}</div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
