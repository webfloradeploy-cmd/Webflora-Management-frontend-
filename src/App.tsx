import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppSidebar from "@/components/AppSidebar";
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Invoices from "./pages/Invoices";
import Projects from "./pages/Projects";
import Employees from "./pages/Employees";
import Handovers from "./pages/Handovers";
import Interns from "./pages/Interns";
import Notices from "./pages/Notices";
import Communications from "./pages/Communications";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Salaries from "./pages/Salaries";
import NotFound from "./pages/NotFound";
import ForgotPassword from "./pages/ForgotPassword";
import VerifyOTP from "./pages/VerifyOTP";
import ResetPassword from "./pages/ResetPassword";
import AdminActivityView from "./pages/AdminActivityView";
import ExpenseManagement from "./pages/ExpenseManagement";
import Leads from "./pages/Leads";
import Quotations from "./pages/Quotations";
import Agreements from "./pages/Agreements";
import CreateEditAgreement from "./pages/CreateEditAgreement";
import Outstanding from "./pages/Outstanding";

const queryClient = new QueryClient();

import { useAuth } from "@/contexts/AuthContext";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import InternDashboard from "./pages/InternDashboard";
import RoleBasedLayout from "@/components/RoleBasedLayout";

const DashboardWrapper = () => {
  const { user } = useAuth();
  if (user?.role === 'employee') return <EmployeeDashboard />;
  if (user?.role === 'intern') return <InternDashboard />;
  return <Dashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/verify-otp" element={<VerifyOTP />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <RoleBasedLayout>
                    <Routes>
                      <Route path="/" element={<DashboardWrapper />} />
                      <Route path="/clients" element={<Clients />} />
                      <Route path="/salaries" element={<Salaries />} />
                      <Route path="/invoices" element={<Invoices />} />
                      <Route path="/outstanding" element={<Outstanding />} />
                      <Route path="/projects" element={<Projects />} />
                      <Route path="/handovers" element={<Handovers />} />
                      <Route path="/employees" element={<Employees />} />
                      <Route path="/interns" element={<Interns />} />
                      <Route path="/notices" element={<Notices />} />
                      <Route path="/communications" element={<Communications />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/activity" element={<AdminActivityView />} />
                      <Route path="/expenses" element={<ExpenseManagement />} />
                      <Route path="/leads" element={<Leads />} />
                      <Route path="/quotations" element={<Quotations />} />
                      <Route path="/agreements" element={<Agreements />} />
                      <Route path="/agreements/new" element={<CreateEditAgreement />} />
                      <Route path="/agreements/edit/:id" element={<CreateEditAgreement />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </RoleBasedLayout>
                </ProtectedRoute>
              }
            />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
