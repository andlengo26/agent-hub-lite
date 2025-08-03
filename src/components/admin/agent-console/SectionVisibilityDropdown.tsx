/**
 * Section Visibility Dropdown for Queue Preview
 * Allows users to show/hide sections in the chat queue
 */

import React from 'react';
import { MultiSelect } from '@/components/ui/multi-select';
import { SectionVisibility, SECTION_OPTIONS } from '@/lib/section-visibility';

interface SectionVisibilityDropdownProps {
  visibility: SectionVisibility;
  onChange: (visibility: SectionVisibility) => void;
  disabled?: boolean;
}

export function SectionVisibilityDropdown({
  visibility,
  onChange,
  disabled = false,
}: SectionVisibilityDropdownProps) {
  const selectedValues = SECTION_OPTIONS
    .filter(option => visibility[option.value])
    .map(option => option.value);

  const handleSelectionChange = (selected: string[]) => {
    const newVisibility = { ...visibility };
    
    // Reset all to false
    SECTION_OPTIONS.forEach(option => {
      newVisibility[option.value] = false;
    });
    
    // Set selected to true
    selected.forEach(value => {
      const key = value as keyof SectionVisibility;
      newVisibility[key] = true;
    });

    onChange(newVisibility);
  };

  return (
    <MultiSelect
      options={SECTION_OPTIONS}
      selected={selectedValues}
      onChange={handleSelectionChange}
      placeholder="Show sections..."
      disabled={disabled}
      className="w-full text-xs"
    />
  );
}