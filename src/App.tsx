import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminLayout from "./layouts/AdminLayout.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminPhotos from "./pages/admin/AdminPhotos.tsx";
import AdminTenants from "./pages/admin/AdminTenants.tsx";
import AdminFeatures from "./pages/admin/AdminFeatures.tsx";
import AdminSeo from "./pages/admin/AdminSeo.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminProfile from "./pages/admin/AdminProfile.tsx";
import AdminMessages from "./pages/admin/AdminMessages.tsx";
import ProtectedRoute from "./components/admin/ProtectedRoute.tsx";

// Accounting layout & pages
import AccountingLayout from "./layouts/AccountingLayout.tsx";
import AccountingDashboard from "./pages/admin/accounting/AccountingDashboard.tsx";
import AccountsList from "./pages/admin/accounting/AccountsList.tsx";
import InvoicesList from "./pages/admin/accounting/InvoicesList.tsx";
import PurchasesList from "./pages/admin/accounting/PurchasesList.tsx";
import SuppliersList from "./pages/admin/accounting/SuppliersList.tsx";
import PartnersList from "./pages/admin/accounting/PartnersList.tsx";
import ReportsPage from "./pages/admin/accounting/ReportsPage.tsx";
import AttachmentsPage from "./pages/admin/accounting/AttachmentsPage.tsx";
import AuditTrailPage from "./pages/admin/accounting/AuditTrailPage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* ═══ Admin Panel ═══ */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="photos" element={<AdminPhotos />} />
            <Route path="tenants" element={<AdminTenants />} />
            <Route path="features" element={<AdminFeatures />} />
            <Route path="seo" element={<AdminSeo />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="messages" element={<AdminMessages />} />
          </Route>

          {/* ═══ Accounting System (Unified) ═══ */}
          <Route
            path="/accounting"
            element={
              <ProtectedRoute allowedRoles={['admin', 'accountant', 'data_entry']}>
                <AccountingLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AccountingDashboard />} />
            <Route path="accounts" element={<AccountsList />} />
            <Route path="invoices" element={<InvoicesList />} />
            <Route path="purchases" element={<PurchasesList />} />
            <Route path="suppliers" element={<SuppliersList />} />
            <Route path="partners" element={<PartnersList />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="attachments" element={<AttachmentsPage />} />
            <Route path="audit" element={<AuditTrailPage />} />
          </Route>

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
