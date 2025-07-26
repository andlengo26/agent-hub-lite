import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { AdminFooter } from "./AdminFooter";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { toast } = useToast();

  // Mock real-time notification
  useEffect(() => {
    const timer = setTimeout(() => {
      toast({
        title: "New Chat Assigned",
        description: "A customer is requesting support on the pricing page.",
        duration: 5000,
      });
    }, 3000);

    return () => clearTimeout(timer);
  }, [toast]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 p-6 bg-muted/30">
            {children}
          </main>
          <AdminFooter />
        </div>
      </div>
      <Toaster />
      <Sonner />
    </SidebarProvider>
  );
}