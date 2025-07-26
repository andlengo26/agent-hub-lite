import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TenantProvider } from "@/contexts/TenantContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Login page
import Login from "@/pages/Login";

// Admin Pages
import Dashboard from "./pages/admin/Dashboard";
import Profile from "./pages/admin/Profile";
import AllChats from "./pages/admin/AllChats";
import MyChats from "./pages/admin/MyChats";
import EngagementHistory from "./pages/admin/EngagementHistory";
import Organizations from "./pages/admin/settings/Organizations";
import Users from "./pages/admin/settings/Users";
import AIResponse from "./pages/admin/settings/AIResponse";
import Notifications from "./pages/admin/settings/Notifications";
import WidgetManagement from "./pages/admin/settings/WidgetManagement";
import Security from "./pages/admin/settings/Security";
import Preview from "./pages/admin/settings/Preview";
import Documents from "./pages/admin/content/Documents";
import URLScraper from "./pages/admin/content/URLScraper";
import FAQs from "./pages/admin/content/FAQs";
import Resources from "./pages/admin/content/Resources";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <TenantProvider>
          <BrowserRouter>
            <ErrorBoundary>
              <Routes>
                {/* Login route */}
                <Route path="/login" element={<Login />} />
                
                {/* Redirect root to dashboard */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Protected admin routes */}
            <Route path="/dashboard" element={
              <AuthGuard>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/profile" element={
              <AuthGuard>
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/chats/all" element={
              <AuthGuard>
                <AdminLayout>
                  <AllChats />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/chats/my" element={
              <AuthGuard>
                <AdminLayout>
                  <MyChats />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/chats/history" element={
              <AuthGuard>
                <AdminLayout>
                  <EngagementHistory />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/settings/organizations" element={
              <AuthGuard>
                <AdminLayout>
                  <Organizations />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/settings/users" element={
              <AuthGuard>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/settings/ai-response" element={
              <AuthGuard>
                <AdminLayout>
                  <AIResponse />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/settings/notifications" element={
              <AuthGuard>
                <AdminLayout>
                  <Notifications />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/settings/widget" element={
              <AuthGuard>
                <AdminLayout>
                  <WidgetManagement />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/settings/security" element={
              <AuthGuard>
                <AdminLayout>
                  <Security />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/content/documents" element={
              <AuthGuard>
                <AdminLayout>
                  <Documents />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/content/scraper" element={
              <AuthGuard>
                <AdminLayout>
                  <URLScraper />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/content/faqs" element={
              <AuthGuard>
                <AdminLayout>
                  <FAQs />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/content/resources" element={
              <AuthGuard>
                <AdminLayout>
                  <Resources />
                </AdminLayout>
              </AuthGuard>
            } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </ErrorBoundary>
          </BrowserRouter>
        </TenantProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
