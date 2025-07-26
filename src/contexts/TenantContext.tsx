import { createContext, useContext, useState, ReactNode } from "react";

interface Organization {
  id: string;
  name: string;
  domain: string;
  plan: string;
}

interface TenantContextType {
  currentOrg: Organization | null;
  organizations: Organization[];
  setCurrentOrg: (org: Organization) => void;
  orgId: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const mockOrganizations: Organization[] = [
  { id: "org_001", name: "Acme Corp", domain: "acme.com", plan: "Enterprise" },
  { id: "org_002", name: "TechStart Inc", domain: "techstart.io", plan: "Pro" },
  { id: "org_003", name: "Global Services", domain: "global.net", plan: "Basic" },
];

export function TenantProvider({ children }: { children: ReactNode }) {
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(mockOrganizations[0]);

  const value: TenantContextType = {
    currentOrg,
    organizations: mockOrganizations,
    setCurrentOrg,
    orgId: currentOrg?.id || null,
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