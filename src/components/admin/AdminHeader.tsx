import { useState } from "react";
import { ChevronDown, User, LogOut, Settings } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { mockOrganizations } from "@/lib/mock-data";

export function AdminHeader() {
  const [selectedOrg, setSelectedOrg] = useState(mockOrganizations[0].id);
  const currentOrg = mockOrganizations.find(org => org.id === selectedOrg);

  return (
    <header className="h-16 border-b bg-background flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-semibold">Customer Support AI Portal</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Live
          </Badge>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Organization Selector */}
        <Select value={selectedOrg} onValueChange={setSelectedOrg}>
          <SelectTrigger className="w-[200px]">
            <SelectValue>
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={currentOrg?.logoUrl} />
                  <AvatarFallback className="text-xs">
                    {currentOrg?.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="truncate">{currentOrg?.name}</span>
              </div>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {mockOrganizations.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={org.logoUrl} />
                    <AvatarFallback className="text-xs">
                      {org.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{org.name}</span>
                  <Badge variant={org.status === 'active' ? 'default' : 'secondary'} className="ml-auto">
                    {org.status}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 hover:bg-accent hover:text-accent-foreground rounded-md p-2 transition-colors">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
            <ChevronDown className="h-4 w-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem>
              <User className="mr-2 h-4 w-4" />
              My Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}