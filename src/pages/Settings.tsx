import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Shield,
  Bell as BellIcon,
  Palette,
  FolderKanban,
  FileText,
  Users,
  CreditCard,
  Banknote,
  Briefcase,
  History,
  MessageSquareWarning,
  BarChart3,
  CheckCircle2,
  UserCheck,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  ShieldCheck,
  Sliders,
  Lock,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSettings, useUpdateSettings, useMyPermissions } from "@/hooks/useSettings";
import { useEmployees } from "@/hooks/useEmployees";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const defaultEmployeePermissions = {
  projects: false,
  invoices: false,
  clients: false,
  leads: false,
  quotations: false,
  agreements: false,
  expenses: true,
  salaries: true,
  handovers: true,
  notices: true,
  communications: true,
  activity: true,
  reports: false,
};

const Settings = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const { data: systemSettings, isLoading: settingsLoading } = useSettings();
  const { data: myPermData, isLoading: myPermsLoading } = useMyPermissions();
  const { data: employees = [] } = useEmployees({ enabled: isAdmin });
  const activeEmployees = employees
    .filter((emp: any) => emp.status !== "inactive")
    .sort((a: any, b: any) => a.name.localeCompare(b.name));
  const updateSettingsMutation = useUpdateSettings();

  // Company info form state
  const [companyInfo, setCompanyInfo] = useState({
    companyName: "Webflora Technologies",
    website: "https://webfloratechnologies.com",
    email: "contact@webfloratechnologies.com",
    phone: "+91 8863081255, +91 8540814729",
    address: "123 Tech Park, Bengaluru, Karnataka 560001",
    gstNumber: "29ABCDE1234F1Z5",
  });

  // Global employee permissions
  const [globalPermissions, setGlobalPermissions] = useState(defaultEmployeePermissions);

  // Selected employee override mode: "global" or employeeId
  const [selectedTarget, setSelectedTarget] = useState<string>("global");
  const [employeeOverrides, setEmployeeOverrides] = useState<any[]>([]);

  // Current active permissions being edited
  const [activeEditingPermissions, setActiveEditingPermissions] = useState(defaultEmployeePermissions);

  // Populate data when systemSettings loads
  useEffect(() => {
    if (systemSettings) {
      if (systemSettings.companyInfo) {
        setCompanyInfo({
          companyName: systemSettings.companyInfo.companyName || "Webflora Technologies",
          website: systemSettings.companyInfo.website || "https://webfloratechnologies.com",
          email: systemSettings.companyInfo.email || "contact@webfloratechnologies.com",
          phone: systemSettings.companyInfo.phone || "+91 8863081255, +91 8540814729",
          address: systemSettings.companyInfo.address || "123 Tech Park, Bengaluru, Karnataka 560001",
          gstNumber: systemSettings.companyInfo.gstNumber || "29ABCDE1234F1Z5",
        });
      }

      if (systemSettings.employeePermissions) {
        setGlobalPermissions({
          ...defaultEmployeePermissions,
          ...systemSettings.employeePermissions,
        });
      }

      if (Array.isArray(systemSettings.employeeOverrides)) {
        setEmployeeOverrides(systemSettings.employeeOverrides);
      }
    }
  }, [systemSettings]);

  // Sync active editing permissions when target changes
  useEffect(() => {
    if (selectedTarget === "global") {
      setActiveEditingPermissions(globalPermissions);
    } else {
      const foundOverride = employeeOverrides.find(
        (o) => (o.employeeId?._id || o.employeeId) === selectedTarget
      );
      if (foundOverride && foundOverride.permissions) {
        setActiveEditingPermissions({
          ...globalPermissions,
          ...foundOverride.permissions,
        });
      } else {
        setActiveEditingPermissions(globalPermissions);
      }
    }
  }, [selectedTarget, globalPermissions, employeeOverrides]);

  const handlePermissionToggle = (key: keyof typeof defaultEmployeePermissions) => {
    const updated = {
      ...activeEditingPermissions,
      [key]: !activeEditingPermissions[key],
    };
    setActiveEditingPermissions(updated);

    if (selectedTarget === "global") {
      setGlobalPermissions(updated);
    } else {
      // Update override in state
      const existingIdx = employeeOverrides.findIndex(
        (o) => (o.employeeId?._id || o.employeeId) === selectedTarget
      );
      let newOverrides = [...employeeOverrides];
      if (existingIdx >= 0) {
        newOverrides[existingIdx] = {
          ...newOverrides[existingIdx],
          permissions: {
            ...newOverrides[existingIdx].permissions,
            [key]: updated[key],
          },
        };
      } else {
        newOverrides.push({
          employeeId: selectedTarget,
          permissions: { [key]: updated[key] },
        });
      }
      setEmployeeOverrides(newOverrides);
    }
  };

  const applyPreset = (preset: "all" | "developer" | "sales" | "minimal") => {
    let newPerms = { ...defaultEmployeePermissions };
    if (preset === "all") {
      newPerms = {
        projects: true,
        invoices: true,
        clients: true,
        leads: true,
        quotations: true,
        agreements: true,
        expenses: true,
        salaries: true,
        handovers: true,
        notices: true,
        communications: true,
        activity: true,
        reports: true,
      };
    } else if (preset === "developer") {
      newPerms = {
        ...defaultEmployeePermissions,
        projects: true,
        handovers: true,
        activity: true,
        expenses: true,
        salaries: true,
        notices: true,
        communications: true,
      };
    } else if (preset === "sales") {
      newPerms = {
        ...defaultEmployeePermissions,
        leads: true,
        clients: true,
        quotations: true,
        agreements: true,
        expenses: true,
        salaries: true,
        notices: true,
        communications: true,
      };
    } else if (preset === "minimal") {
      newPerms = { ...defaultEmployeePermissions };
    }

    setActiveEditingPermissions(newPerms);
    if (selectedTarget === "global") {
      setGlobalPermissions(newPerms);
    } else {
      const existingIdx = employeeOverrides.findIndex(
        (o) => (o.employeeId?._id || o.employeeId) === selectedTarget
      );
      let newOverrides = [...employeeOverrides];
      if (existingIdx >= 0) {
        newOverrides[existingIdx] = {
          ...newOverrides[existingIdx],
          permissions: newPerms,
        };
      } else {
        newOverrides.push({
          employeeId: selectedTarget,
          permissions: newPerms,
        });
      }
      setEmployeeOverrides(newOverrides);
    }
  };

  const clearCurrentOverride = () => {
    if (selectedTarget === "global") return;
    const newOverrides = employeeOverrides.filter(
      (o) => (o.employeeId?._id || o.employeeId) !== selectedTarget
    );
    setEmployeeOverrides(newOverrides);
    setActiveEditingPermissions(globalPermissions);
  };

  const handleSaveAll = async () => {
    try {
      await updateSettingsMutation.mutateAsync({
        companyInfo,
        employeePermissions: globalPermissions,
        employeeOverrides: employeeOverrides.map((o) => ({
          employeeId: o.employeeId?._id || o.employeeId,
          permissions: o.permissions,
        })),
      });
    } catch (error) {
      // Error handled by mutation hook
    }
  };

  // Modules metadata
  const coreModules = [
    {
      key: "projects" as const,
      label: "Projects",
      route: "/projects",
      icon: FolderKanban,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      description: "Allow employees to view projects, progress, deadlines, and project details.",
    },
    {
      key: "invoices" as const,
      label: "Invoices",
      route: "/invoices",
      icon: FileText,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Allow employees to view project invoices, payment histories, and client dues.",
    },
    {
      key: "clients" as const,
      label: "Clients",
      route: "/clients",
      icon: Users,
      color: "text-purple-500 bg-purple-500/10 border-purple-500/20",
      description: "Allow employees to view client directory, contact records, and profiles.",
    },
    {
      key: "leads" as const,
      label: "Leads",
      route: "/leads",
      icon: UserCheck,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Allow employees to view and manage business leads and prospect contacts.",
    },
    {
      key: "quotations" as const,
      label: "Quotations",
      route: "/quotations",
      icon: FileText,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      description: "Allow employees to view quotation proposals, scope, and project pricing.",
    },
    {
      key: "agreements" as const,
      label: "Agreements",
      route: "/agreements",
      icon: FileText,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      description: "Allow employees to view agreements, contracts, terms, and signed documents.",
    },
    {
      key: "expenses" as const,
      label: "Expenses",
      route: "/expenses",
      icon: CreditCard,
      color: "text-cyan-500 bg-cyan-500/10 border-cyan-500/20",
      description: "Allow employees to submit, track, and view reimbursement claims & expenses.",
    },
  ];

  const operationalModules = [
    {
      key: "handovers" as const,
      label: "Handovers",
      route: "/handovers",
      icon: Briefcase,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      description: "Allow employees to access credentials, server IPs, and project handovers.",
    },
    {
      key: "salaries" as const,
      label: "My Salaries",
      route: "/salaries",
      icon: Banknote,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      description: "Allow employees to view their salary slips, earnings, and payment logs.",
    },
    {
      key: "activity" as const,
      label: "Work Logs",
      route: "/#activity",
      icon: History,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      description: "Allow employees to submit daily work accomplishments and view logs.",
    },
    {
      key: "notices" as const,
      label: "Notices",
      route: "/notices",
      icon: BellIcon,
      color: "text-violet-500 bg-violet-500/10 border-violet-500/20",
      description: "Allow employees to view company-wide announcements and notice updates.",
    },
    {
      key: "communications" as const,
      label: "Communications",
      route: "/communications",
      icon: MessageSquareWarning,
      color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
      description: "Allow employees to receive direct warnings, inquiries, and communications.",
    },
    {
      key: "reports" as const,
      label: "Reports & Analytics",
      route: "/reports",
      icon: BarChart3,
      color: "text-pink-500 bg-pink-500/10 border-pink-500/20",
      description: "Allow employees to view performance reports and analytics summaries.",
    },
  ];

  const currentSelectedEmployee =
    selectedTarget !== "global"
      ? employees.find((e: any) => e.id === selectedTarget)
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        subtitle={
          isAdmin
            ? "Manage workspace preferences, company branding, and employee dashboard access"
            : "Manage your personal workspace preferences and view granted permissions"
        }
        actions={
          isAdmin && (
            <Button
              onClick={handleSaveAll}
              disabled={updateSettingsMutation.isPending}
              className="bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              {updateSettingsMutation.isPending ? "Saving Changes..." : "Save Settings"}
            </Button>
          )
        }
      />

      <div className="p-6">
        <Tabs defaultValue={isAdmin ? "permissions" : "my-access"} className="space-y-6">
          <TabsList className="bg-secondary/40 p-1 border border-border/50">
            {isAdmin && <TabsTrigger value="permissions" className="gap-2"><ShieldCheck className="w-4 h-4" /> Employee Permissions</TabsTrigger>}
            <TabsTrigger value="general" className="gap-2"><Globe className="w-4 h-4" /> Company & Profile</TabsTrigger>
            {!isAdmin && <TabsTrigger value="my-access" className="gap-2"><CheckCircle2 className="w-4 h-4" /> My Dashboard Access</TabsTrigger>}
            <TabsTrigger value="notifications" className="gap-2"><BellIcon className="w-4 h-4" /> Notifications</TabsTrigger>
            <TabsTrigger value="security" className="gap-2"><Shield className="w-4 h-4" /> Security</TabsTrigger>
          </TabsList>

          {/* ADMIN: EMPLOYEE PERMISSIONS TAB */}
          {isAdmin && (
            <TabsContent value="permissions" className="space-y-6 mt-0">
              {/* Target & Scope Control Card */}
              <Card className="border-border/60 bg-gradient-to-r from-card via-card to-primary/5">
                <CardHeader className="pb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="border-primary/30 text-primary bg-primary/10 font-bold uppercase tracking-wider text-[10px]">
                          Access Control
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-primary" /> Real-time Sync
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold">Employee Dashboard & Sidebar Access</CardTitle>
                      <CardDescription>
                        Select which core modules and options employees can view and interact with in their dashboard.
                      </CardDescription>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-64">
                        <Label className="text-xs text-muted-foreground mb-1 block">Scope / Target</Label>
                        <Select value={selectedTarget} onValueChange={setSelectedTarget}>
                          <SelectTrigger className="h-9 bg-card border-border">
                            <SelectValue placeholder="Select Scope" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="global" className="font-semibold text-primary">
                              🌐 Global (All Employees)
                            </SelectItem>
                            {activeEmployees.map((emp: any) => (
                              <SelectItem key={emp.id} value={emp.id}>
                                👤 {emp.name} ({emp.jobRole || emp.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {selectedTarget !== "global" && (
                        <div className="pt-5">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-9 text-xs border-dashed text-muted-foreground hover:text-foreground"
                            onClick={clearCurrentOverride}
                            title="Reset to global defaults"
                          >
                            <RotateCcw className="w-3.5 h-3.5 mr-1.5" /> Reset
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border/40">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mr-1">
                      Quick Presets:
                    </span>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs rounded-full font-medium"
                      onClick={() => applyPreset("all")}
                    >
                      🌟 Enable All Core
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs rounded-full font-medium"
                      onClick={() => applyPreset("developer")}
                    >
                      💻 Developer Mode (Projects + Logs)
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="h-7 text-xs rounded-full font-medium"
                      onClick={() => applyPreset("sales")}
                    >
                      🤝 Sales & BD (Leads + Clients)
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs rounded-full font-medium text-muted-foreground hover:text-foreground"
                      onClick={() => applyPreset("minimal")}
                    >
                      🔒 Minimal Default
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Status Banner when editing a specific employee */}
              {currentSelectedEmployee && (
                <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center text-primary font-bold">
                      {currentSelectedEmployee.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-foreground">
                        Customizing Permissions for: <span className="text-primary">{currentSelectedEmployee.name}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {currentSelectedEmployee.email} • {currentSelectedEmployee.jobRole || currentSelectedEmployee.role}
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Individual Override Active
                  </Badge>
                </div>
              )}

              {/* SECTION 1: CORE MODULES (MATCHING THE SCREENSHOT) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-primary" /> Core Navigation Modules
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      These appear in the top "CORE" navigation section of the employee's sidebar and dashboard.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {coreModules.map((mod) => {
                    const isEnabled = !!activeEditingPermissions[mod.key];
                    const IconComp = mod.icon;
                    return (
                      <Card
                        key={mod.key}
                        className={`transition-all border ${
                          isEnabled
                            ? "border-primary/40 bg-card shadow-sm shadow-primary/5"
                            : "border-border/50 bg-secondary/10 opacity-70"
                        }`}
                      >
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${mod.color}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                {mod.label}
                                {isEnabled && <Check className="w-3.5 h-3.5 text-primary" />}
                              </CardTitle>
                              <span className="text-[10px] font-mono text-muted-foreground">{mod.route}</span>
                            </div>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handlePermissionToggle(mod.key)}
                          />
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                          <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/30">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Sidebar Visibility
                            </span>
                            <Badge
                              variant={isEnabled ? "default" : "secondary"}
                              className={`text-[10px] h-5 ${isEnabled ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : ""}`}
                            >
                              {isEnabled ? "Visible to Employee" : "Hidden"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 2: WORKFLOW & PERSONNEL MODULES */}
              <div className="space-y-4 pt-4">
                <div>
                  <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Personnel, Work Logs & Communication
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Control access to salary records, credential handovers, and communication channels.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {operationalModules.map((mod) => {
                    const isEnabled = !!activeEditingPermissions[mod.key];
                    const IconComp = mod.icon;
                    return (
                      <Card
                        key={mod.key}
                        className={`transition-all border ${
                          isEnabled
                            ? "border-primary/40 bg-card shadow-sm shadow-primary/5"
                            : "border-border/50 bg-secondary/10 opacity-70"
                        }`}
                      >
                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${mod.color}`}>
                              <IconComp className="w-5 h-5" />
                            </div>
                            <div>
                              <CardTitle className="text-sm font-bold flex items-center gap-1.5">
                                {mod.label}
                                {isEnabled && <Check className="w-3.5 h-3.5 text-primary" />}
                              </CardTitle>
                              <span className="text-[10px] font-mono text-muted-foreground">{mod.route}</span>
                            </div>
                          </div>
                          <Switch
                            checked={isEnabled}
                            onCheckedChange={() => handlePermissionToggle(mod.key)}
                          />
                        </CardHeader>
                        <CardContent className="p-4 pt-1">
                          <p className="text-xs text-muted-foreground leading-relaxed">{mod.description}</p>
                          <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/30">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                              Status
                            </span>
                            <Badge
                              variant={isEnabled ? "default" : "secondary"}
                              className={`text-[10px] h-5 ${isEnabled ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : ""}`}
                            >
                              {isEnabled ? "Enabled" : "Disabled"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Save Bar */}
              <div className="p-4 rounded-2xl bg-card border border-border/60 flex items-center justify-between sticky bottom-4 shadow-xl z-20 backdrop-blur-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground font-medium">
                    Changes take effect immediately across all employee dashboards upon saving.
                  </span>
                </div>
                <Button
                  onClick={handleSaveAll}
                  disabled={updateSettingsMutation.isPending}
                  className="bg-primary text-primary-foreground font-semibold px-6"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {updateSettingsMutation.isPending ? "Saving..." : "Save Settings"}
                </Button>
              </div>
            </TabsContent>
          )}

          {/* EMPLOYEE VIEW: MY ACCESS TAB */}
          {!isAdmin && (
            <TabsContent value="my-access" className="space-y-6 mt-0">
              <Card className="border-border">
                <CardHeader>
                  <CardTitle className="text-lg font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    My Active Workspace Permissions
                  </CardTitle>
                  <CardDescription>
                    These features and navigation modules have been enabled for your employee account by the administrator.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...coreModules, ...operationalModules].map((mod) => {
                      const hasAccess = !!myPermData?.permissions?.[mod.key];
                      const IconComp = mod.icon;
                      return (
                        <div
                          key={mod.key}
                          className={`p-4 rounded-xl border flex items-center justify-between ${
                            hasAccess
                              ? "bg-card border-border shadow-sm"
                              : "bg-secondary/20 border-border/40 opacity-40"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center border ${mod.color}`}>
                              <IconComp className="w-4 h-4" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{mod.label}</p>
                              <p className="text-[10px] text-muted-foreground">{mod.route}</p>
                            </div>
                          </div>
                          <Badge variant={hasAccess ? "default" : "secondary"} className="text-[10px]">
                            {hasAccess ? "Granted" : "Restricted"}
                          </Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* GENERAL TAB */}
          <TabsContent value="general" className="space-y-6 mt-0">
            {/* Company Info */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Company Information</h3>
                  <p className="text-xs text-muted-foreground">Basic details about your organization</p>
                </div>
              </div>
              <Separator />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Company Name</Label>
                  <Input
                    value={companyInfo.companyName}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, companyName: e.target.value })}
                    disabled={!isAdmin}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Website</Label>
                  <Input
                    value={companyInfo.website}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, website: e.target.value })}
                    disabled={!isAdmin}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input
                    value={companyInfo.email}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, email: e.target.value })}
                    disabled={!isAdmin}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input
                    value={companyInfo.phone}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, phone: e.target.value })}
                    disabled={!isAdmin}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <Label className="text-xs">Address</Label>
                  <Input
                    value={companyInfo.address}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, address: e.target.value })}
                    disabled={!isAdmin}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">GST Number</Label>
                  <Input
                    value={companyInfo.gstNumber}
                    onChange={(e) => setCompanyInfo({ ...companyInfo, gstNumber: e.target.value })}
                    disabled={!isAdmin}
                    className="h-9 font-mono"
                  />
                </div>
              </div>
              {isAdmin && (
                <div className="pt-2">
                  <Button
                    size="sm"
                    onClick={handleSaveAll}
                    disabled={updateSettingsMutation.isPending}
                    className="bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Save Changes
                  </Button>
                </div>
              )}
            </div>

            {/* Appearance */}
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
                  <p className="text-xs text-muted-foreground">Customize the look and feel</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Compact Mode</p>
                    <p className="text-xs text-muted-foreground">Use smaller spacing in tables and lists</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Show Animations</p>
                    <p className="text-xs text-muted-foreground">Enable page transition animations</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* NOTIFICATIONS TAB */}
          <TabsContent value="notifications" className="space-y-6 mt-0">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BellIcon className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Notification Preferences</h3>
                  <p className="text-xs text-muted-foreground">Choose what notifications you receive</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Invoice Reminders</p>
                    <p className="text-xs text-muted-foreground">Get notified about due invoices</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Project Deadlines</p>
                    <p className="text-xs text-muted-foreground">Alerts for upcoming deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Payment Received</p>
                    <p className="text-xs text-muted-foreground">Notification when payments are collected</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Employee Updates</p>
                    <p className="text-xs text-muted-foreground">Leave requests, attendance alerts</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* SECURITY TAB */}
          <TabsContent value="security" className="space-y-6 mt-0">
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground">Security Settings</h3>
                  <p className="text-xs text-muted-foreground">Manage access and permissions</p>
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add extra security to your account</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">Session Timeout</p>
                    <p className="text-xs text-muted-foreground">Auto-logout after 30 mins of inactivity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
              <Separator />
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Password & Credentials
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-xs">Current Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-9" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">New Password</Label>
                    <Input type="password" placeholder="••••••••" className="h-9" />
                  </div>
                </div>
                <div className="pt-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs">
                    <Lock className="w-3.5 h-3.5 mr-1.5" /> Update Password
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
