/**
 * CSV Export Utility
 * Handles exporting data to CSV format and triggering download
 */

export interface ExportableData {
  [key: string]: any;
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: ExportableData[], columns?: string[]): string {
  if (!data.length) return '';

  // Use provided columns or extract from first object
  const headers = columns || Object.keys(data[0]);
  
  // Create header row
  const headerRow = headers.map(header => `"${header}"`).join(',');
  
  // Create data rows
  const dataRows = data.map(item => 
    headers.map(header => {
      const value = item[header];
      // Handle nested objects, arrays, and null values
      const stringValue = value === null || value === undefined 
        ? '' 
        : typeof value === 'object' 
          ? JSON.stringify(value) 
          : String(value);
      // Escape quotes and wrap in quotes
      return `"${stringValue.replace(/"/g, '""')}"`;
    }).join(',')
  );

  return [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger file download for CSV data
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Export chats to CSV
 */
export function exportChatsCSV(chats: any[], filename?: string): void {
  const columns = [
    'requesterName',
    'requesterEmail', 
    'requesterPhone',
    'geo',
    'status',
    'assignedAgentId',
    'createdAt',
    'summary'
  ];
  
  const csvContent = convertToCSV(chats, columns);
  const exportFilename = filename || `chats-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, exportFilename);
}

/**
 * Export engagements to CSV
 */
export function exportEngagementsCSV(engagements: any[], filename?: string): void {
  const columns = [
    'customerName',
    'customerEmail',
    'engagementCount',
    'lastEngagedAt',
    'agentsInvolved'
  ];
  
  const csvContent = convertToCSV(engagements, columns);
  const exportFilename = filename || `engagements-export-${new Date().toISOString().split('T')[0]}.csv`;
  
  downloadCSV(csvContent, exportFilename);
}