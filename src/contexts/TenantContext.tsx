import { createContext, useContext, useState, ReactNode } from "react";
import { useOrganizations } from "@/hooks/useApiQuery";
import { Organization } from "@/types";

interface TenantContextType {
  currentOrg: Organization | null;
  organizations: Organization[];
  setCurrentOrg: (org: Organization) => void;
  orgId: string | null;
  isLoading: boolean;
  error: any;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const { data: orgsResponse, isLoading, error } = useOrganizations();
  const organizations = orgsResponse?.data || [];
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(
    organizations.length > 0 ? organizations[0] : null
  );

  // Update currentOrg when organizations are loaded
  if (!currentOrg && organizations.length > 0) {
    setCurrentOrg(organizations[0]);
  }

  const value: TenantContextType = {
    currentOrg,
    organizations,
    setCurrentOrg,
    orgId: currentOrg?.id || null,
    isLoading,
    error,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}