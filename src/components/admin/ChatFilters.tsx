import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { SearchInput } from '@/components/common/SearchInput';
import { SectionVisibilityDropdown } from '@/components/admin/agent-console/SectionVisibilityDropdown';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { useUsers } from '@/hooks/useApiQuery';
import { cn } from '@/lib/utils';
import { 
  SectionVisibility, 
  getSectionVisibility, 
  setSectionVisibility 
} from '@/lib/section-visibility';

export interface ChatFiltersConfig {
  search: string;
  status: string;
  agent: string;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  sectionVisibility?: SectionVisibility;
}

// Keep this export for backward compatibility
export interface ChatFilters extends ChatFiltersConfig {}

interface ChatFiltersProps {
  filters: ChatFiltersConfig;
  onFiltersChange: (filters: ChatFiltersConfig) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function ChatFilters({ 
  filters, 
  onFiltersChange, 
  isCollapsed = false, 
  onToggleCollapse 
}: ChatFiltersProps) {
  const { data: usersResponse } = useUsers();
  const users = usersResponse?.data || [];
  const [sectionVisibility, setSectionVisibilityState] = useState<SectionVisibility>(
    filters.sectionVisibility || getSectionVisibility()
  );

  // Update localStorage and filters when visibility changes
  useEffect(() => {
    setSectionVisibility(sectionVisibility);
    onFiltersChange({ ...filters, sectionVisibility });
  }, [sectionVisibility]);
  
  const updateFilter = (key: keyof ChatFiltersConfig, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    const defaultVisibility = getSectionVisibility();
    setSectionVisibilityState(defaultVisibility);
    onFiltersChange({
      search: '',
      status: 'all',
      agent: 'all',
      dateRange: { from: undefined, to: undefined },
      sectionVisibility: defaultVisibility
    });
  };

  const hasActiveFilters = filters.search || filters.status || filters.agent || 
    filters.dateRange.from || filters.dateRange.to;

  if (isCollapsed) {
    return (
      <div className="flex items-center gap-2 mb-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleCollapse}
          className="flex items-center gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
              {[filters.search, filters.status, filters.agent, filters.dateRange.from].filter(Boolean).length}
            </span>
          )}
        </Button>
      </div>
    );
  }

  return (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Filters</h3>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear All
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onToggleCollapse}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Section Visibility */}
          <div>
            <label className="text-sm font-medium mb-2 block">Show Sections</label>
            <SectionVisibilityDropdown
              visibility={sectionVisibility}
              onChange={setSectionVisibilityState}
            />
          </div>

          {/* Search */}
          <div>
            <label className="text-sm font-medium mb-2 block">Search</label>
            <SearchInput
              value={filters.search}
              onChange={(value) => updateFilter('search', value)}
              placeholder="Search chats..."
              className="w-full"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Status</label>
            <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="missed">Missed</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Agent</label>
            <Select value={filters.agent} onValueChange={(value) => updateFilter('agent', value)}>
              <SelectTrigger>
                <SelectValue placeholder="All agents" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                <SelectItem value="unassigned">Unassigned</SelectItem>
                {users.filter(user => user.role === 'agent').map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Date Range</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={filters.dateRange}
                  onSelect={(range) => updateFilter('dateRange', range || { from: undefined, to: undefined })}
                  numberOfMonths={2}
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}