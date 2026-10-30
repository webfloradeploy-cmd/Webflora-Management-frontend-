import { useState, useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  FileText,
  FolderKanban,
  UserCog,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Bell,
  GraduationCap,
  Briefcase,
  MessageSquareWarning,
  Menu,
  X,
  Banknote,
  History,
  CreditCard,
  Download,
  CircleDollarSign,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navigation = [
  {
    title: "Core",
    items: [
      { to: "/", icon: LayoutDashboard, label: "Dashboard" },
      { to: "/projects", icon: FolderKanban, label: "Projects" },
      { to: "/invoices", icon: FileText, label: "Invoices" },
      { to: "/outstanding", icon: CircleDollarSign, label: "Outstanding" },
      { to: "/clients", icon: Users, label: "Clients" },
      { to: "/leads", icon: Users, label: "Leads" },
      { to: "/quotations", icon: FileText, label: "Quotations" },
      { to: "/agreements", icon: FileText, label: "Agreements" },
      { to: "/expenses", icon: CreditCard, label: "Expenses" },
    ]
  },
  {
    title: "Personnel",
    items: [
      { to: "/employees", icon: UserCog, label: "Employees" },
      { to: "/interns", icon: GraduationCap, label: "Interns" },
      { to: "/salaries", icon: Banknote, label: "Salaries" },
      { to: "/handovers", icon: Briefcase, label: "Handovers" },
    ]
  },
  {
    title: "Communication",
    items: [
      { to: "/notices", icon: Bell, label: "Notices" },
      { to: "/communications", icon: MessageSquareWarning, label: "Communications" },
    ]
  },
  {
    title: "Insights",
    items: [
      { to: "/activity", icon: History, label: "Activity Logs" },
      { to: "/reports", icon: BarChart3, label: "Reports" },
      { to: "/settings", icon: Settings, label: "Settings" },
    ]
  }
];

interface AppSidebarProps {
  children: React.ReactNode;
}

import { motion, AnimatePresence } from "framer-motion";

const SidebarContent = ({
  collapsed,
  setCollapsed,
  user,
  handleLogout,
  location,
  isMobile,
  onClose
}: {
  collapsed: boolean;
  setCollapsed?: (v: boolean) => void;
  user: any;
  handleLogout: () => void;
  location: any;
  isMobile: boolean;
  onClose?: () => void;
}) => {
  const { isInstallable, installPWA } = usePWAInstall();

  return (
  <div className="flex flex-col h-full bg-sidebar border-r border-white/5 relative overflow-hidden">
    {/* Animated background glow */}
    <div className="absolute top-0 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

    {/* Logo */}
    <div className="flex items-center gap-3 px-6 h-20 shrink-0 relative z-10">
      <div className={cn(
        "flex items-center justify-center transition-all duration-500",
        collapsed ? "w-8 h-8" : "w-auto h-10"
      )}>
        <img
          src={collapsed ? "/minilogo.png" : "/webflora-logo.webp"}
          alt="Webflora"
          className={cn(
            "h-full object-contain transition-all duration-500",
            collapsed ? "scale-110" : "max-w-[160px]"
          )}
        />
      </div>
      {isMobile && onClose && (
        <Button variant="ghost" size="icon" className="ml-auto text-sidebar-foreground/60 hover:text-foreground" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      )}
    </div>

    {/* Navigation */}
    <nav className="flex-1 py-6 px-3 space-y-8 overflow-y-auto custom-scrollbar relative z-10">
      <AnimatePresence>
        {navigation.map((section, sIdx) => (
          <div key={section.title} className="space-y-2">
            {(!collapsed || isMobile) && (
              <h4 className="px-3 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 mb-3">
                {section.title}
              </h4>
            )}
            <div className="space-y-1">
              {section.items.map((item, index) => {
                const isActive = location.pathname === item.to;
                return (
                  <motion.div
                    key={item.to}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (sIdx * 4 + index) * 0.03, duration: 0.4, ease: "easeOut" }}
                  >
                    <NavLink
                      to={item.to}
                      className={cn(
                        "sidebar-item group",
                        isActive ? "sidebar-item-active" : "sidebar-item-inactive"
                      )}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="sidebar-active"
                          className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20 shadow-[0_0_20px_rgba(var(--primary),0.05)]"
                          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                      <item.icon className={cn(
                        "w-[18px] h-[18px] shrink-0 transition-all duration-300 relative z-20",
                        isActive ? "text-primary scale-110" : "group-hover:text-foreground group-hover:scale-110"
                      )} />
                      {(!collapsed || isMobile) && (
                        <span className="relative z-20 truncate tracking-tight font-medium">{item.label}</span>
                      )}
                      {isActive && !collapsed && (
                        <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-primary premium-glow relative z-20" />
                      )}
                    </NavLink>
                  </motion.div>
                );
              })}
            </div>
            {sIdx < navigation.length - 1 && collapsed && !isMobile && (
              <div className="mx-3 h-px bg-white/5 my-4" />
            )}
          </div>
        ))}
      </AnimatePresence>
    </nav>

    {/* User Info & Logout */}
    <div className="p-4 border-t border-white/5 space-y-4 shrink-0 relative z-10 bg-sidebar">
      {(!collapsed || isMobile) && user && (
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
          <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
            {user.name[0]}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-xs font-semibold text-foreground truncate">{user.name}</p>
            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {isInstallable && (
          <button
            onClick={installPWA}
            className="sidebar-item w-full bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30 transition-all font-semibold"
            title="Install App"
          >
            <Download className="w-[18px] h-[18px] shrink-0 animate-bounce" />
            {(!collapsed || isMobile) && <span>Install Desktop/Phone App</span>}
          </button>
        )}

        <button
          onClick={handleLogout}
          className="sidebar-item sidebar-item-inactive w-full text-destructive/80 hover:text-destructive hover:bg-destructive/10"
          title="Logout"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          {(!collapsed || isMobile) && <span className="">Logout</span>}
        </button>

        {!isMobile && setCollapsed && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="sidebar-item sidebar-item-inactive w-full justify-center opacity-60 hover:opacity-100"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
            {!collapsed && <span className="text-[11px] uppercase tracking-widest ml-2">Collapse</span>}
          </button>
        )}
      </div>
    </div>
  </div>
  );
};

const AdminSidebar = ({ children }: AppSidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const isMobile = useIsMobile();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close mobile drawer when location changes
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  if (isMobile) {
    return (
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        {/* Mobile Header */}
        <header className="h-16 flex items-center justify-between px-4 border-b border-border bg-sidebar shrink-0 z-50">
          <div className="h-8">
            <img src="/webfloralogo.png" alt="Webflora" className="h-full object-contain" />
          </div>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-sidebar-foreground">
                <Menu className="w-6 h-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px] border-r-sidebar-border bg-sidebar">
              <SidebarContent
                collapsed={false}
                user={user}
                handleLogout={handleLogout}
                location={location}
                isMobile={true}
                onClose={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-4 sm:p-6 pb-20 min-w-0 text-foreground">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300 ease-in-out shrink-0",
          collapsed ? "w-[68px]" : "w-[260px]"
        )}
      >
        <SidebarContent
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          user={user}
          handleLogout={handleLogout}
          location={location}
          isMobile={false}
        />
      </aside>

      {/* Main Content Desktop */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background p-6 lg:p-8 min-w-0 text-foreground">
        {children}
      </main>
    </div>
  );
};

export default AdminSidebar;
