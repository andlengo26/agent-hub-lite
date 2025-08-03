/**
 * Section visibility utilities for queue preview
 */

export interface SectionVisibility {
  waiting: boolean;
  aiActive: boolean;
  active: boolean;
  missed: boolean;
  closed: boolean;
}

export const DEFAULT_SECTION_VISIBILITY: SectionVisibility = {
  waiting: true,
  aiActive: true,
  active: true,
  missed: true,
  closed: false, // Closed sections hidden by default
};

const STORAGE_KEY = 'queueSectionVisibility';

export function getSectionVisibility(): SectionVisibility {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing keys
      return { ...DEFAULT_SECTION_VISIBILITY, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load section visibility from localStorage:', error);
  }
  return DEFAULT_SECTION_VISIBILITY;
}

export function setSectionVisibility(visibility: SectionVisibility): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(visibility));
  } catch (error) {
    console.warn('Failed to save section visibility to localStorage:', error);
  }
}

export const SECTION_OPTIONS = [
  { label: 'Waiting', value: 'waiting' as keyof SectionVisibility },
  { label: 'AI Assisted', value: 'aiActive' as keyof SectionVisibility },
  { label: 'Human Active', value: 'active' as keyof SectionVisibility },
  { label: 'Missed', value: 'missed' as keyof SectionVisibility },
  { label: 'Closed', value: 'closed' as keyof SectionVisibility },
];