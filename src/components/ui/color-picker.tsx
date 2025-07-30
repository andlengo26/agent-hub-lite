/**
 * Color Picker component using HTML5 color input
 */

import * as React from "react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function ColorPicker({
  value,
  onChange,
  label,
  className,
  disabled = false,
}: ColorPickerProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && <Label>{label}</Label>}
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-12 h-10 rounded-md border border-input bg-background cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        />
        <div className="flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );
}