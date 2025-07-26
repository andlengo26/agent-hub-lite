import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { TenantProvider } from "@/contexts/TenantContext";

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
import Resources from "./pages/admin/Resources";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TenantProvider>
        <BrowserRouter>
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<Login />} />
            
            {/* Redirect root to admin */}
            <Route path="/" element={<Navigate to="/admin" replace />} />
            
            {/* Protected admin routes */}
            <Route path="/admin" element={
              <AuthGuard>
                <AdminLayout>
                  <Dashboard />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/profile" element={
              <AuthGuard>
                <AdminLayout>
                  <Profile />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/chats/all" element={
              <AuthGuard>
                <AdminLayout>
                  <AllChats />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/chats/my" element={
              <AuthGuard>
                <AdminLayout>
                  <MyChats />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/engagement-history" element={
              <AuthGuard>
                <AdminLayout>
                  <EngagementHistory />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/settings/organizations" element={
              <AuthGuard>
                <AdminLayout>
                  <Organizations />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/settings/users" element={
              <AuthGuard>
                <AdminLayout>
                  <Users />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/settings/ai-response" element={
              <AuthGuard>
                <AdminLayout>
                  <AIResponse />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/settings/notifications" element={
              <AuthGuard>
                <AdminLayout>
                  <Notifications />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/settings/widget" element={
              <AuthGuard>
                <AdminLayout>
                  <WidgetManagement />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/settings/security" element={
              <AuthGuard>
                <AdminLayout>
                  <Security />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/content/documents" element={
              <AuthGuard>
                <AdminLayout>
                  <Documents />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/content/scraper" element={
              <AuthGuard>
                <AdminLayout>
                  <URLScraper />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/content/faqs" element={
              <AuthGuard>
                <AdminLayout>
                  <FAQs />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="/admin/resources" element={
              <AuthGuard>
                <AdminLayout>
                  <Resources />
                </AdminLayout>
              </AuthGuard>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TenantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
