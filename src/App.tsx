import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "@/components/admin/AdminLayout";

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
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/admin" replace />} />
          <Route path="/admin" element={
            <AdminLayout>
              <Dashboard />
            </AdminLayout>
          } />
          <Route path="/admin/profile" element={
            <AdminLayout>
              <Profile />
            </AdminLayout>
          } />
          <Route path="/admin/chats/all" element={
            <AdminLayout>
              <AllChats />
            </AdminLayout>
          } />
          <Route path="/admin/chats/my" element={
            <AdminLayout>
              <MyChats />
            </AdminLayout>
          } />
          <Route path="/admin/engagement-history" element={
            <AdminLayout>
              <EngagementHistory />
            </AdminLayout>
          } />
          <Route path="/admin/settings/organizations" element={
            <AdminLayout>
              <Organizations />
            </AdminLayout>
          } />
          <Route path="/admin/settings/users" element={
            <AdminLayout>
              <Users />
            </AdminLayout>
          } />
          <Route path="/admin/settings/ai-response" element={
            <AdminLayout>
              <AIResponse />
            </AdminLayout>
          } />
          <Route path="/admin/settings/notifications" element={
            <AdminLayout>
              <Notifications />
            </AdminLayout>
          } />
          <Route path="/admin/settings/widget" element={
            <AdminLayout>
              <WidgetManagement />
            </AdminLayout>
          } />
          <Route path="/admin/settings/security" element={
            <AdminLayout>
              <Security />
            </AdminLayout>
          } />
          <Route path="/admin/settings/preview" element={
            <AdminLayout>
              <Preview />
            </AdminLayout>
          } />
          <Route path="/admin/content/documents" element={
            <AdminLayout>
              <Documents />
            </AdminLayout>
          } />
          <Route path="/admin/content/scraper" element={
            <AdminLayout>
              <URLScraper />
            </AdminLayout>
          } />
          <Route path="/admin/content/faqs" element={
            <AdminLayout>
              <FAQs />
            </AdminLayout>
          } />
          <Route path="/admin/resources" element={
            <AdminLayout>
              <Resources />
            </AdminLayout>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
