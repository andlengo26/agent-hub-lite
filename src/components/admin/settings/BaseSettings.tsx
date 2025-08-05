/**
 * Base Settings Component
 * Common functionality and patterns for all settings tabs
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useSettings } from '@/contexts/SettingsContext';

interface SettingsCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export function SettingsCard({ 
  title, 
  description, 
  children, 
  badge, 
  badgeVariant = 'default' 
}: SettingsCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

interface SettingsFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  required?: boolean;
}

export function SettingsField({ label, description, children, required }: SettingsFieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {children}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

interface SettingsToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SettingsToggle({
  label,
  description,
  checked,
  onCheckedChange,
  disabled
}: SettingsToggleProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label className="text-sm font-medium">{label}</Label>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      <Switch 
        checked={checked} 
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

interface SettingsInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  required?: boolean;
  type?: 'text' | 'email' | 'password' | 'url';
}

export function SettingsInput({
  label,
  value,
  onChange,
  placeholder,
  description,
  required,
  type = 'text'
}: SettingsInputProps) {
  return (
    <SettingsField label={label} description={description} required={required}>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </SettingsField>
  );
}

interface SettingsTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  description?: string;
  required?: boolean;
  rows?: number;
}

export function SettingsTextarea({
  label,
  value,
  onChange,
  placeholder,
  description,
  required,
  rows = 3
}: SettingsTextareaProps) {
  return (
    <SettingsField label={label} description={description} required={required}>
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
    </SettingsField>
  );
}

interface SettingsSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  placeholder?: string;
  description?: string;
  required?: boolean;
}

export function SettingsSelect({
  label,
  value,
  onChange,
  options,
  placeholder,
  description,
  required
}: SettingsSelectProps) {
  return (
    <SettingsField label={label} description={description} required={required}>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingsField>
  );
}

export function SettingsSeparator() {
  return <Separator className="my-4" />;
}

// Hook for common settings operations
export function useSettingsActions() {
  const { updateAppearance, updateAISettings, updateUserInfo, updateIntegrations, updateVoiceSettings } = useSettings();

  return {
    updateAppearance,
    updateAISettings, 
    updateUserInfo,
    updateIntegrations,
    updateVoiceSettings
  };
}