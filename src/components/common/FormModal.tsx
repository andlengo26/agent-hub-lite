import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  isLoading?: boolean;
  submitLabel?: string;
  cancelLabel?: string;
  onSubmit?: () => void;
  onCancel?: () => void;
  submitDisabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function FormModal({
  isOpen,
  onClose,
  title,
  description,
  children,
  isLoading = false,
  submitLabel = 'Save',
  cancelLabel = 'Cancel',
  onSubmit,
  onCancel,
  submitDisabled = false,
  size = 'md',
}: FormModalProps) {
  const handleCancel = () => {
    onCancel?.();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
    >
      <div
        className="space-y-6"
        aria-busy={isLoading}
        aria-live="polite"
      >
        {children}
        
        <div className="flex justify-end space-x-3 pt-4 border-t border-border">
          <Button
            variant="outline"
            size="sm"
            type="button"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelLabel}
          </Button>
          {onSubmit && (
            <Button
              variant="default"
              size="sm"
              type="submit"
              onClick={onSubmit}
              disabled={submitDisabled || isLoading}
            >
              {isLoading && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              {submitLabel}
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}