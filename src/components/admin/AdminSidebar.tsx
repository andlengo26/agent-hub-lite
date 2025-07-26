import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  User,
  MessageSquare,
  History,
  Settings,
  FileText,
  Folder,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "My Profile",
    url: "/admin/profile",
    icon: User,
  },
  {
    title: "Chats",
    icon: MessageSquare,
    submenu: [
      { title: "All Chats", url: "/admin/chats/all" },
      { title: "My Chats", url: "/admin/chats/my" },
    ],
  },
  {
    title: "Engagement History",
    url: "/admin/engagement-history",
    icon: History,
  },
  {
    title: "Settings",
    icon: Settings,
    submenu: [
      { title: "Organizations", url: "/admin/settings/organizations" },
      { title: "Users", url: "/admin/settings/users" },
      { title: "Auto AI Response", url: "/admin/settings/ai-response" },
      { title: "Notifications", url: "/admin/settings/notifications" },
      { title: "Widget Management", url: "/admin/settings/widget" },
      { title: "Security", url: "/admin/settings/security" },
      { title: "Preview", url: "/admin/settings/preview" },
    ],
  },
  {
    title: "Content Management",
    icon: FileText,
    submenu: [
      { title: "Documents", url: "/admin/content/documents" },
      { title: "URL Scraper", url: "/admin/content/scraper" },
      { title: "FAQs", url: "/admin/content/faqs" },
    ],
  },
  {
    title: "Resources",
    url: "/admin/resources",
    icon: Folder,
  },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const currentPath = location.pathname;

  const [openMenus, setOpenMenus] = useState<string[]>(() => {
    // Auto-open menus that contain the current path
    const initialOpen: string[] = [];
    menuItems.forEach((item) => {
      if (item.submenu && item.submenu.some((sub) => currentPath.startsWith(sub.url))) {
        initialOpen.push(item.title);
      }
    });
    return initialOpen;
  });

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) =>
      prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]
    );
  };

  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-accent hover:text-accent-foreground";

  return (
    <Sidebar className={collapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold mb-4">
            {!collapsed && "Admin Portal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                if (item.submenu) {
                  return (
                    <SidebarMenuItem key={item.title}>
                      <Collapsible
                        open={openMenus.includes(item.title)}
                        onOpenChange={() => toggleMenu(item.title)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton className="w-full justify-between">
                            <div className="flex items-center gap-2">
                              <item.icon className="h-4 w-4" />
                              {!collapsed && <span>{item.title}</span>}
                            </div>
                            {!collapsed && (
                              openMenus.includes(item.title) ? (
                                <ChevronDown className="h-4 w-4" />
                              ) : (
                                <ChevronRight className="h-4 w-4" />
                              )
                            )}
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        {!collapsed && (
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {item.submenu.map((subItem) => (
                                <SidebarMenuSubItem key={subItem.title}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink to={subItem.url} className={getNavCls}>
                                      <span>{subItem.title}</span>
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        )}
                      </Collapsible>
                    </SidebarMenuItem>
                  );
                }

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url!} className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}