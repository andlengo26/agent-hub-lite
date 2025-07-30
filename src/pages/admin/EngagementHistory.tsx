/**
 * Engagement History - Customer-centric view showing aggregated engagements per customer
 */

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Customer } from '@/types';
import { useCustomers } from '@/hooks/useCustomers';
import { DataTable, Column } from '@/components/ui/data-table';
import { EngagementFilters } from '@/components/admin/EngagementFilters';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { CalendarDays, Phone, Mail, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Define columns for customer engagement table
const customerColumns: Column<Customer>[] = [
  {
    key: 'customer',
    label: 'Customer',
    render: (customer) => (
      <div className="flex items-center space-x-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {customer.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium text-text-primary">{customer.name}</div>
          <div className="text-sm text-text-secondary">{customer.email}</div>
        </div>
      </div>
    ),
  },
  {
    key: 'engagementCount',
    label: 'Engagements',
    sortable: true,
    render: (customer) => (
      <Badge variant="secondary" className="font-medium">
        {customer.engagementCount} total
      </Badge>
    ),
  },
  {
    key: 'lastEngagedAt',
    label: 'Last Contact',
    sortable: true,
    render: (customer) => (
      <div className="flex items-center space-x-1 text-sm text-text-secondary">
        <CalendarDays className="h-4 w-4" />
        <span>{formatDistanceToNow(new Date(customer.lastEngagedAt), { addSuffix: true })}</span>
      </div>
    ),
  },
  {
    key: 'phone',
    label: 'Contact',
    render: (customer) => (
      <div className="space-y-1">
        {customer.phone && (
          <div className="flex items-center space-x-1 text-sm">
            <Phone className="h-3 w-3" />
            <span>{customer.phone}</span>
          </div>
        )}
        <div className="flex items-center space-x-1 text-sm text-text-secondary">
          <Mail className="h-3 w-3" />
          <span>{customer.email}</span>
        </div>
      </div>
    ),
  },
];

export default function EngagementHistory() {
  const navigate = useNavigate();
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch customers data
  const { data: customersData, isLoading, error } = useCustomers({
    search: searchQuery,
  });

  // Filter customers based on date range
  const filteredCustomers = useMemo(() => {
    if (!customersData?.data) return [];

    let filtered = customersData.data;

    // Apply date range filter
    if (dateRange.from || dateRange.to) {
      filtered = filtered.filter(customer => {
        const lastEngaged = new Date(customer.lastEngagedAt);
        
        if (dateRange.from && lastEngaged < dateRange.from) return false;
        if (dateRange.to && lastEngaged > dateRange.to) return false;
        
        return true;
      });
    }

    return filtered;
  }, [customersData?.data, dateRange]);

  // Handle viewing customer details
  const handleViewDetails = (customer: Customer) => {
    navigate(`/chats/history/${customer.id}`);
  };

  // Handle bulk actions
  const handleBulkExport = (selectedCustomers: Customer[]) => {
    const csvData = selectedCustomers.map(customer => ({
      Name: customer.name,
      Email: customer.email,
      Phone: customer.phone,
      'Total Engagements': customer.engagementCount,
      'Last Contact': customer.lastEngagedAt,
      'Customer Since': customer.createdAt,
    }));
    
    // Convert to CSV and download
    const csv = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customer-engagements.csv';
    a.click();
  };

  // Define bulk actions
  const bulkActions = [
    {
      label: 'Export Selected',
      action: handleBulkExport,
    },
  ];

  // Define custom actions
  const customActions = [
    {
      label: 'View Details',
      action: handleViewDetails,
    },
  ];

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center text-red-600">
          Failed to load customer data. Please try again.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Engagement History</h1>
          <p className="text-text-secondary">
            View customer engagement history across all channels
          </p>
        </div>
      </div>

      {/* Search only for now */}
      <div className="flex gap-4">
        {/* Filters can be added later */}
      </div>

      {/* Customer Table */}
      <DataTable
        data={filteredCustomers}
        columns={customerColumns}
        loading={isLoading}
        searchable
        selectable
        pagination
        customActions={[
          {
            id: 'view',
            label: 'View Details',
            icon: <MessageSquare className="h-4 w-4" />,
            onClick: handleViewDetails,
          },
        ]}
        emptyMessage="No customers found matching your criteria."
      />
    </div>
  );
}