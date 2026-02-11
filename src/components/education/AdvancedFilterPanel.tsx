import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { getAllCategoriesByPriority, type CMSCategory } from '@/lib/regulatory-categories';
import type { EducationFilters } from '@/hooks/use-education-filters';
import { AlertTriangle, CheckCircle2, ClipboardCheck, Filter, Search, Tag, X } from 'lucide-react';

interface AdvancedFilterPanelProps {
  filters: EducationFilters;
  updateFilter: <K extends keyof EducationFilters>(key: K, value: EducationFilters[K]) => void;
  resetFilters: () => void;
  hasActiveFilters: boolean;
  filterStats: {
    total: number;
    filtered: number;
    active: number;
    archived: number;
    critical: number;
    nysdohRequired: number;
  };
  availableFTags: string[];
  availableDisciplines: string[];
}

export const AdvancedFilterPanel = ({
  filters,
  updateFilter,
  resetFilters,
  hasActiveFilters,
  filterStats,
  availableFTags,
  availableDisciplines
}: AdvancedFilterPanelProps) => {
  const categories = getAllCategoriesByPriority();
  const [disciplineInput, setDisciplineInput] = useState('');

  const addDisciplineFilter = () => {
    const next = disciplineInput.trim();
    if (!next) return;
    if (!filters.disciplines.some((discipline) => discipline.toLowerCase() === next.toLowerCase())) {
      updateFilter('disciplines', [...filters.disciplines, next]);
    }
    setDisciplineInput('');
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-primary" />
            <CardTitle className="text-base">Advanced Filters</CardTitle>
          </div>
          {hasActiveFilters && (
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-2">
              <X className="w-4 h-4" />
              Clear All
            </Button>
          )}
        </div>
        <CardDescription>
          Showing {filterStats.filtered} of {filterStats.total} topics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Search</Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search topics, F-tags, regulations..."
              value={filters.search}
              onChange={(e) => updateFilter('search', e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label className="text-sm font-medium">Regulatory Category</Label>
          <Select
            value={filters.regulatoryCategory}
            onValueChange={(value) => updateFilter('regulatoryCategory', value as 'all' | CMSCategory)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="max-h-[400px] w-[var(--radix-select-trigger-width)] max-w-[min(92vw,460px)]">
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat.name} value={cat.name}>
                  <div className="flex flex-col gap-1">
                    <span className="font-medium whitespace-normal break-words">{cat.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {cat.ftagRange} — {cat.priority.toUpperCase()}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Priority Level
          </Label>
          <Select
            value={filters.priority}
            onValueChange={(value) => updateFilter('priority', value as EducationFilters['priority'])}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="critical">Critical ({filterStats.critical})</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2"><Tag className="w-4 h-4" /> F-Tags</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {filters.ftags.length > 0
                  ? `${filters.ftags.length} F-tag${filters.ftags.length > 1 ? 's' : ''} selected`
                  : <span className="text-muted-foreground">Select F-tags...</span>}
                <Tag className="w-4 h-4 ml-2 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search F-tags..." />
                <CommandEmpty>No F-tags found</CommandEmpty>
                <CommandList className="max-h-[300px]">
                  <CommandGroup>
                    {availableFTags.map(ftag => (
                      <CommandItem
                        key={ftag}
                        onSelect={() => {
                          const isSelected = filters.ftags.includes(ftag);
                          updateFilter('ftags', isSelected ? filters.ftags.filter(t => t !== ftag) : [...filters.ftags, ftag]);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{ftag}</span>
                          {filters.ftags.includes(ftag) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {filters.ftags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.ftags.map(ftag => (
                <Badge key={ftag} variant="secondary" className="gap-1">
                  {ftag}
                  <button type="button" onClick={() => updateFilter('ftags', filters.ftags.filter(t => t !== ftag))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Disciplines</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                {filters.disciplines.length > 0
                  ? `${filters.disciplines.length} selected`
                  : <span className="text-muted-foreground">Select disciplines...</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Search disciplines..." />
                <CommandEmpty>No disciplines found</CommandEmpty>
                <CommandList className="max-h-[300px]">
                  <CommandGroup>
                    {availableDisciplines.map(discipline => (
                      <CommandItem
                        key={discipline}
                        onSelect={() => {
                          const isSelected = filters.disciplines.includes(discipline);
                          updateFilter('disciplines', isSelected
                            ? filters.disciplines.filter(d => d !== discipline)
                            : [...filters.disciplines, discipline]);
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span>{discipline}</span>
                          {filters.disciplines.includes(discipline) && <CheckCircle2 className="w-4 h-4 text-primary" />}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <div className="flex gap-2">
            <Input
              value={disciplineInput}
              onChange={(event) => setDisciplineInput(event.target.value)}
              placeholder="Add custom discipline"
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  addDisciplineFilter();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addDisciplineFilter}>Add</Button>
          </div>
          {filters.disciplines.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {filters.disciplines.map((discipline) => (
                <Badge key={discipline} variant="secondary" className="gap-1">
                  {discipline}
                  <button type="button" onClick={() => updateFilter('disciplines', filters.disciplines.filter(d => d !== discipline))}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-3">
          <Label className="text-sm font-medium">Quick Filters</Label>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <Label className="text-sm font-normal">NYSDOH Required</Label>
            </div>
            <Select
              value={filters.nysdohRequired}
              onValueChange={(value) => updateFilter('nysdohRequired', value as EducationFilters['nysdohRequired'])}
            >
              <SelectTrigger className="w-[110px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes ({filterStats.nysdohRequired})</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="w-4 h-4 text-primary" />
              <Label className="text-sm font-normal">Has Trigger Audit</Label>
            </div>
            <Select
              value={filters.hasAudit}
              onValueChange={(value) => updateFilter('hasAudit', value as EducationFilters['hasAudit'])}
            >
              <SelectTrigger className="w-[110px] h-8"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
                <SelectItem value="no">No</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="show-archived-filter" className="text-sm font-normal">Show Archived Topics</Label>
            <Switch
              id="show-archived-filter"
              checked={filters.showArchived}
              onCheckedChange={(checked) => updateFilter('showArchived', checked)}
            />
          </div>
        </div>

        <Separator />
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-muted-foreground">Active: <strong className="text-foreground">{filterStats.active}</strong></div>
          <div className="text-muted-foreground">Critical: <strong className="text-foreground">{filterStats.critical}</strong></div>
          <div className="text-muted-foreground">NYSDOH: <strong className="text-foreground">{filterStats.nysdohRequired}</strong></div>
          <div className="text-muted-foreground">Archived: <strong className="text-foreground">{filterStats.archived}</strong></div>
        </div>
      </CardContent>
    </Card>
  );
};
