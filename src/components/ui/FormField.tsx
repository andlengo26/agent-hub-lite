/**
 * Form field components following KB design system
 * Provides consistent form styling with error handling
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { Checkbox } from "./checkbox";
import { Label } from "./label";

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  className?: string;
}

interface InputFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}

interface TextareaFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

interface SelectOption {
  label: string;
  value: any;
}

interface SelectFieldProps extends BaseFieldProps {
  options: SelectOption[];
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  multi?: boolean;
}

interface CheckboxFieldProps extends BaseFieldProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function InputField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  error,
  required,
  className
}: InputFieldProps) {
  const id = React.useId();

  return (
    <div className={cn("space-y-space-2", className)}>
      <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-destructive after:ml-1")}>
        {label}
      </Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(error && "border-destructive focus-visible:ring-destructive")}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export function TextareaField({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  error,
  required,
  className
}: TextareaFieldProps) {
  const id = React.useId();

  return (
    <div className={cn("space-y-space-2", className)}>
      <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-destructive after:ml-1")}>
        {label}
      </Label>
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(error && "border-destructive focus-visible:ring-destructive")}
      />
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export function SelectField({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option",
  error,
  required,
  className
}: SelectFieldProps) {
  const id = React.useId();

  return (
    <div className={cn("space-y-space-2", className)}>
      <Label htmlFor={id} className={cn(required && "after:content-['*'] after:text-destructive after:ml-1")}>
        {label}
      </Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger 
          id={id}
          className={cn(error && "border-destructive focus:ring-destructive")}
        >
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
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}

export function CheckboxField({
  label,
  checked,
  onChange,
  error,
  className
}: CheckboxFieldProps) {
  const id = React.useId();

  return (
    <div className={cn("space-y-space-2", className)}>
      <div className="flex items-center space-x-space-2">
        <Checkbox
          id={id}
          checked={checked}
          onCheckedChange={onChange}
          className={cn(error && "border-destructive")}
        />
        <Label htmlFor={id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
          {label}
        </Label>
      </div>
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}
    </div>
  );
}