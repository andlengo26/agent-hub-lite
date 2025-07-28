import React, { useState } from 'react';
import { FormModal } from '@/components/common/FormModal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function DocumentUploadModal({ isOpen, onClose, onSuccess }: DocumentUploadModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    fileType: '',
    file: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!formData.title || !formData.fileType || !formData.file) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields and select a file.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    // Simulate upload delay
    setTimeout(() => {
      toast({
        title: "Document Uploaded",
        description: `${formData.title} has been uploaded successfully.`,
      });
      setIsLoading(false);
      onSuccess();
      onClose();
      setFormData({ title: '', fileType: '', file: null });
    }, 1000);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name,
        fileType: prev.fileType || file.type.split('/')[1]?.toUpperCase() || 'FILE'
      }));
    }
  };

  return (
    <FormModal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Document"
      description="Add a new document to the knowledge base"
      onSubmit={handleSubmit}
      isLoading={isLoading}
      submitLabel="Upload"
    >
      <div className="space-y-space-4">
        <div>
          <Label htmlFor="file">Select File</Label>
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.doc,.docx,.txt,.xlsx,.pptx"
            className="mt-space-1"
          />
        </div>

        <div>
          <Label htmlFor="title">Document Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter document title"
            className="mt-space-1"
          />
        </div>

        <div>
          <Label htmlFor="fileType">File Type</Label>
          <Select value={formData.fileType} onValueChange={(value) => setFormData(prev => ({ ...prev, fileType: value }))}>
            <SelectTrigger className="mt-space-1">
              <SelectValue placeholder="Select file type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PDF">PDF</SelectItem>
              <SelectItem value="DOCX">Word Document</SelectItem>
              <SelectItem value="XLSX">Excel Spreadsheet</SelectItem>
              <SelectItem value="PPTX">PowerPoint Presentation</SelectItem>
              <SelectItem value="TXT">Text File</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </FormModal>
  );
}