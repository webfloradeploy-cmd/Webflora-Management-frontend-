import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  History,
  Banknote,
  Eye,
  EyeOff,
  ScrollText,
  User,
  GraduationCap,
  CreditCard,
  Building,
  MoreVertical,
  LayoutGrid,
  List,
  Mail,
  Phone,
  AlertCircle,
  Briefcase
} from "lucide-react";
import AttendanceHistoryDialog from "@/components/AttendanceHistoryDialog";
import ActivityHistoryDialog from "@/components/ActivityHistoryDialog";
import SalaryPaymentDialog from "@/components/SalaryPaymentDialog";
import SalaryHistoryDialog from "@/components/SalaryHistoryDialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEmployees, useCreateEmployee, useUpdateEmployee, useDeleteEmployee, useToggleEmployeeStatus } from "@/hooks/useEmployees";
import { useAllAttendance } from "@/hooks/useAttendance";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Employees = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("directory");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<any | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Attendance History State
  const [attendanceEmployeeId, setAttendanceEmployeeId] = useState<string | null>(null);
  const [attendanceEmployeeName, setAttendanceEmployeeName] = useState<string>("");
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);

  // Salary Dialogs State
  const [isSalaryPaymentOpen, setIsSalaryPaymentOpen] = useState(false);
  const [isSalaryHistoryOpen, setIsSalaryHistoryOpen] = useState(false);
  const [salaryPayee, setSalaryPayee] = useState<any | null>(null);

  // Activity History State
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [activityEmployeeId, setActivityEmployeeId] = useState<string | null>(null);
  const [activityEmployeeName, setActivityEmployeeName] = useState<string>("");

  // View Profile Dialog State
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileEmployee, setProfileEmployee] = useState<any | null>(null);

  const initialEmployeeFormData = {
    name: "",
    email: "",
    password: "",
    role: "employee",
    jobRole: "",
    department: "",
    phone: "",
    emergencyPhone: "",
    address: "",
    salary: "",
    status: "active" as "active" | "inactive",
    joiningDate: new Date().toISOString().split('T')[0],
    fatherName: "",
    motherName: "",
    dob: "",
    gender: "Male",
    bloodGroup: "",
    aadhaarNumber: "",
    panNumber: "",
    qualification: "",
    stream: "",
    institution: "",
    passingYear: "",
    gradePercentage: "",
    bankName: "",
    accountNumber: "",
    ifscCode: "",
    bio: "",
  };

  const [formData, setFormData] = useState(initialEmployeeFormData);

  const { data: employees = [], isLoading, error } = useEmployees();
  const { data: allAttendance = [], isLoading: attendanceLoading } = useAllAttendance();
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee();
  const deleteEmployee = useDeleteEmployee();
  const toggleStatus = useToggleEmployeeStatus();
  const { toast } = useToast();

  const employeeAttendance = allAttendance.filter((a: any) => a.userModel === 'employee');

  const filteredEmployees = employees
    .filter((e: any) => {
      const matchesSearch =
        e.name?.toLowerCase().includes(search.toLowerCase()) ||
        (e.employeeId && e.employeeId.toLowerCase().includes(search.toLowerCase())) ||
        (e.jobRole && e.jobRole.toLowerCase().includes(search.toLowerCase())) ||
        e.email?.toLowerCase().includes(search.toLowerCase()) ||
        (e.department && e.department.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && e.status !== "inactive") ||
        (statusFilter === "inactive" && e.status === "inactive");

      return matchesSearch && matchesStatus;
    })
    .sort((a: any, b: any) => {
      const aInactive = a.status === "inactive";
      const bInactive = b.status === "inactive";
      if (aInactive !== bInactive) {
        return aInactive ? 1 : -1;
      }
      // Newest first
      const dateA = new Date(a.createdAt || a.joinDate || 0).getTime();
      const dateB = new Date(b.createdAt || b.joinDate || 0).getTime();
      if (dateA !== dateB) return dateB - dateA;
      return 0;
    });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const paginatedEmployees = filteredEmployees.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = employees.filter((e: any) => e.status !== "inactive").length;
  const inactiveCount = employees.filter((e: any) => e.status === "inactive").length;

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createEmployee.mutateAsync({
        ...formData,
        salary: parseInt(formData.salary),
        status: formData.status || "active",
      });
      setIsCreateDialogOpen(false);
      setFormData(initialEmployeeFormData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create employee",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (employee: any) => {
    setFormData({
      name: employee.name || "",
      email: employee.email || "",
      password: "",
      role: employee.role || "employee",
      jobRole: employee.jobRole || "",
      department: employee.department || "",
      phone: employee.phone || "",
      emergencyPhone: employee.emergencyPhone || "",
      address: employee.address || "",
      salary: employee.salary?.toString() || "",
      status: employee.status || "active",
      joiningDate: employee.joinDate ? employee.joinDate.split('T')[0] : (employee.createdAt ? employee.createdAt.split('T')[0] : ""),
      fatherName: employee.fatherName || "",
      motherName: employee.motherName || "",
      dob: employee.dob ? employee.dob.split('T')[0] : "",
      gender: employee.gender || "Male",
      bloodGroup: employee.bloodGroup || "",
      aadhaarNumber: employee.aadhaarNumber || "",
      panNumber: employee.panNumber || "",
      qualification: employee.qualification || "",
      stream: employee.stream || "",
      institution: employee.institution || "",
      passingYear: employee.passingYear || "",
      gradePercentage: employee.gradePercentage || "",
      bankName: employee.bankName || "",
      accountNumber: employee.accountNumber || "",
      ifscCode: employee.ifscCode || "",
      bio: employee.bio || "",
    });
    setSelectedEmployee(employee);
    setIsEditDialogOpen(true);
  };

  const handleAttendanceClick = (employee: any) => {
    setAttendanceEmployeeId(employee.id || employee._id);
    setAttendanceEmployeeName(employee.name);
    setIsAttendanceDialogOpen(true);
  };

  const handleActivityClick = (employee: any) => {
    setActivityEmployeeId(employee.id || employee._id);
    setActivityEmployeeName(employee.name);
    setIsActivityDialogOpen(true);
  };

  const handleSalaryPaymentClick = (employee: any) => {
    setSalaryPayee(employee);
    setIsSalaryPaymentOpen(true);
  };

  const handleSalaryHistoryClick = (employee: any) => {
    setSalaryPayee(employee);
    setIsSalaryHistoryOpen(true);
  };

  const handleUpdateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const updateData: any = {
        ...formData,
        salary: parseInt(formData.salary),
      };

      if (!formData.password) {
        delete updateData.password;
      }

      await updateEmployee.mutateAsync({
        id: selectedEmployee.id,
        data: updateData,
      });
      setIsEditDialogOpen(false);
      setSelectedEmployee(null);
      setFormData(initialEmployeeFormData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update employee",
        variant: "destructive",
      });
    }
  };

  const handleDeleteEmployee = async () => {
    if (!employeeToDelete) return;

    try {
      await deleteEmployee.mutateAsync(employeeToDelete.id);
      setEmployeeToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete employee",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Employees" subtitle="Error loading employees" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load employees. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} team members (${activeCount} active, ${inactiveCount} inactive)`}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Navigation & Controls Bar */}
        <Tabs value={tab} onValueChange={setTab}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <TabsList>
              <TabsTrigger value="directory">Directory</TabsTrigger>
              <TabsTrigger value="attendance">Attendance</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>

            {tab === "directory" && (
              <div className="flex items-center gap-2">
                {/* Status Filter Badges */}
                <div className="bg-muted p-1 rounded-lg flex items-center gap-1 text-xs font-medium">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      statusFilter === "all" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    All ({employees.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("active")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      statusFilter === "active" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Active ({activeCount})
                  </button>
                  <button
                    onClick={() => setStatusFilter("inactive")}
                    className={`px-2.5 py-1 rounded-md transition-all ${
                      statusFilter === "inactive" ? "bg-destructive/10 text-destructive font-semibold shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    Inactive ({inactiveCount})
                  </button>
                </div>

                {/* View Switcher */}
                <div className="bg-muted p-1 rounded-lg flex items-center gap-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === "grid" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Grid Card View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("table")}
                    className={`p-1.5 rounded-md transition-all ${
                      viewMode === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                    }`}
                    title="Table View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          <TabsContent value="directory" className="mt-6 space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, role, email, or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-56 rounded-2xl" />
                ))}
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {search || statusFilter !== "all" ? "No matching employees found" : "No employees added yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || statusFilter !== "all" ? "Try adjusting your search or filters" : "Start by clicking the Add Employee button"}
                </p>
                {!search && statusFilter === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Employee
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* Modern Grid Card Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedEmployees.map((employee: any) => {
                  const isInactive = employee.status === "inactive";
                  return (
                    <div
                      key={employee.id}
                      className={`bg-card border rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between ${
                        isInactive
                          ? "border-destructive/30 bg-destructive/[0.015]"
                          : "border-border hover:border-border/80"
                      }`}
                    >
                      {/* Top Header: Avatar + Info + Status Toggle */}
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                              {employee.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-foreground text-base leading-snug truncate">
                                  {employee.name}
                                </h3>
                                {employee.employeeId && (
                                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border shrink-0">
                                    {employee.employeeId}
                                  </span>
                                )}
                              </div>
                              {(employee.jobRole || employee.department) ? (
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {employee.jobRole ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-primary/10 text-primary border border-primary/20">
                                      {employee.jobRole}
                                    </span>
                                  ) : null}
                                  {employee.department ? (
                                    <span className="text-[11px] text-muted-foreground font-medium">
                                      {employee.jobRole ? `• ${employee.department}` : employee.department}
                                    </span>
                                  ) : null}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          {/* Status Pill Toggle */}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => toggleStatus.mutate(employee.id)}
                            disabled={toggleStatus.isPending}
                            className={`h-7 px-2.5 text-xs font-semibold rounded-full border transition-all shrink-0 ${
                              isInactive
                                ? "border-destructive/40 text-destructive bg-destructive/10 hover:bg-destructive/20"
                                : "border-emerald-500/40 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400"
                            }`}
                            title={`Click to switch status (currently ${isInactive ? "Inactive" : "Active"})`}
                          >
                            <span className={`w-2 h-2 rounded-full mr-1.5 ${
                              isInactive ? "bg-destructive" : "bg-emerald-500 animate-pulse"
                            }`} />
                            {isInactive ? "Inactive" : "Active"}
                          </Button>
                        </div>

                        {/* Inactive Alert (Clean & Compact) */}
                        {isInactive && (
                          <div className="mb-3 flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg px-2.5 py-1 font-medium">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span>Work & Project Assignment Restricted</span>
                          </div>
                        )}

                        {/* Contact Details */}
                        <div className="space-y-1.5 text-xs text-muted-foreground mt-3">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                            <span className="truncate">{employee.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                            <span>{employee.phone}</span>
                          </div>
                          {employee.qualification && (
                            <div className="flex items-center gap-2 text-muted-foreground/80 truncate">
                              <GraduationCap className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                              <span className="truncate">{employee.qualification} {employee.stream ? `(${employee.stream})` : ""}</span>
                            </div>
                          )}
                        </div>

                        {/* Financial Box */}
                        <div className="mt-3.5 p-2.5 rounded-xl bg-muted/40 border border-border/60 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Monthly Salary</span>
                            <span className="font-semibold text-foreground text-sm">
                              {formatCurrency(employee.salary || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Total Paid</span>
                            <span className="font-bold text-success text-sm">
                              {formatCurrency(employee.totalPaid || 0)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Clean Actions Bar (Clean Main Actions + Dropdown Menu) */}
                      <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8"
                          onClick={() => {
                            setProfileEmployee(employee);
                            setIsProfileDialogOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-primary" /> Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8"
                          onClick={() => handleSalaryPaymentClick(employee)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1 text-success" /> Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8"
                          onClick={() => handleSalaryHistoryClick(employee)}
                        >
                          <Banknote className="w-3.5 h-3.5 mr-1 text-primary" /> History
                        </Button>

                        {/* More Actions Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 shrink-0">
                              <MoreVertical className="w-4 h-4 text-muted-foreground" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => handleAttendanceClick(employee)} className="cursor-pointer">
                              <History className="w-4 h-4 mr-2 text-primary" /> Attendance History
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActivityClick(employee)} className="cursor-pointer">
                              <ScrollText className="w-4 h-4 mr-2 text-primary" /> Activity Log
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(employee)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2 text-primary" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setEmployeeToDelete(employee)} className="text-destructive focus:text-destructive cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Employee
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* High-Density Clean Table View */
              <div className="rounded-2xl border border-border overflow-hidden bg-card">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role & Department</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Salary</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedEmployees.map((employee: any) => {
                      const isInactive = employee.status === "inactive";
                      return (
                        <TableRow key={employee.id} className={isInactive ? "bg-destructive/[0.02]" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                                {employee.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-foreground block text-sm">{employee.name}</span>
                                  {employee.employeeId && (
                                    <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                      {employee.employeeId}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">{employee.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {employee.jobRole ? (
                              <Badge variant="outline" className="font-medium text-xs bg-primary/5 text-primary border-primary/20">
                                {employee.jobRole}
                              </Badge>
                            ) : null}
                            {employee.department && (
                              <span className="text-xs text-muted-foreground block mt-0.5">{employee.department}</span>
                            )}
                            {!employee.jobRole && !employee.department && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {employee.phone}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-foreground">
                            {formatCurrency(employee.salary || 0)}
                          </TableCell>
                          <TableCell className="text-sm font-bold text-success">
                            {formatCurrency(employee.totalPaid || 0)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleStatus.mutate(employee.id)}
                              disabled={toggleStatus.isPending}
                              className={`h-7 px-2.5 text-xs font-semibold rounded-full border transition-all ${
                                isInactive
                                  ? "border-destructive/40 text-destructive bg-destructive/10"
                                  : "border-emerald-500/40 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                              }`}
                            >
                              <span className={`w-2 h-2 rounded-full mr-1.5 ${isInactive ? "bg-destructive" : "bg-emerald-500"}`} />
                              {isInactive ? "Inactive" : "Active"}
                            </Button>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs"
                                onClick={() => {
                                  setProfileEmployee(employee);
                                  setIsProfileDialogOpen(true);
                                }}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-primary" /> Profile
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs"
                                onClick={() => handleSalaryPaymentClick(employee)}
                              >
                                Pay
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0">
                                    <MoreVertical className="w-4 h-4 text-muted-foreground" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-48">
                                  <DropdownMenuItem onClick={() => handleSalaryHistoryClick(employee)} className="cursor-pointer">
                                    <Banknote className="w-4 h-4 mr-2" /> Payment History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAttendanceClick(employee)} className="cursor-pointer">
                                    <History className="w-4 h-4 mr-2" /> Attendance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleActivityClick(employee)} className="cursor-pointer">
                                    <ScrollText className="w-4 h-4 mr-2" /> Activity Log
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditClick(employee)} className="cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setEmployeeToDelete(employee)} className="text-destructive focus:text-destructive cursor-pointer">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Employee
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            )}

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={filteredEmployees.length}
              itemsPerPage={itemsPerPage}
              itemName="employees"
              className="rounded-xl border"
            />
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Date</TableHead>
                    <TableHead className="font-bold py-4">Employee</TableHead>
                    <TableHead className="font-bold py-4">Status</TableHead>
                    <TableHead className="font-bold py-4">Check-In Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                        <div className="flex justify-center">
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : employeeAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-medium">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    employeeAttendance.map((record: any) => (
                      <TableRow key={record._id || record.id}>
                        <TableCell className="font-medium whitespace-nowrap">
                          {formatDate(record.date)}
                        </TableCell>
                        <TableCell className="font-bold text-foreground">
                          {record.userName}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              record.status === "present"
                                ? "bg-success/20 text-success border-success/30 hover:bg-success/20 capitalize font-bold"
                                : "bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/20 capitalize font-bold"
                            }
                          >
                            {record.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">
                          {record.timeIn ? formatDate(record.timeIn) : "—"}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <div className="text-center py-16 text-muted-foreground bg-card border border-border rounded-2xl">
              Performance metrics coming soon...
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Employee Dialog (3 Organized Tabs) */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <User className="w-5 h-5 text-primary" /> Add New Employee
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateEmployee} className="space-y-4 mt-2">
            <Tabs defaultValue="job" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="job" className="text-xs sm:text-sm">💼 Job & Role</TabsTrigger>
                <TabsTrigger value="biodata" className="text-xs sm:text-sm">👤 Bio Data</TabsTrigger>
                <TabsTrigger value="education" className="text-xs sm:text-sm">🎓 Education & Bank</TabsTrigger>
              </TabsList>

              {/* Tab 1: Job & Role */}
              <TabsContent value="job" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@webflora.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors h-5 w-5 flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="jobRole">Job Role / Designation</Label>
                    <Input
                      id="jobRole"
                      value={formData.jobRole}
                      onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                      placeholder="e.g. Frontend Developer, UI/UX Designer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="department">Department</Label>
                    <Select
                      value={formData.department || undefined}
                      onValueChange={(val) => setFormData({ ...formData, department: val === "unassigned" ? "" : val })}
                    >
                      <SelectTrigger id="department">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">None / Not Assigned</SelectItem>
                        <SelectItem value="Development">Development & Engineering</SelectItem>
                        <SelectItem value="Design">UI/UX & Graphic Design</SelectItem>
                        <SelectItem value="Quality Assurance">Quality Assurance (QA)</SelectItem>
                        <SelectItem value="Marketing">Digital Marketing & SEO</SelectItem>
                        <SelectItem value="Sales">Sales & Business Development</SelectItem>
                        <SelectItem value="Human Resources">Human Resources (HR)</SelectItem>
                        <SelectItem value="Operations">Operations & Management</SelectItem>
                        <SelectItem value="Finance">Finance & Accounts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="salary">Monthly Salary (₹) *</Label>
                    <Input
                      id="salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="e.g. 50000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="joiningDate">Joining Date</Label>
                    <Input
                      id="joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="status">Initial Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active (Available for Projects/Handovers)</SelectItem>
                        <SelectItem value="inactive">Inactive (Restricted from Projects/Handovers)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Bio Data */}
              <TabsContent value="biodata" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="fatherName">Father's Name</Label>
                    <Input
                      id="fatherName"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="Father's full name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="motherName">Mother's Name</Label>
                    <Input
                      id="motherName"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="Mother's full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="emergencyPhone">Emergency Phone Number</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="e.g. 9876543211"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="dob">Date of Birth</Label>
                    <Input
                      id="dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => setFormData({ ...formData, gender: val })}
                    >
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="bloodGroup">Blood Group</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                    >
                      <SelectTrigger id="bloodGroup">
                        <SelectValue placeholder="Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                    <Input
                      id="aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="12-digit Aadhaar UID"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="panNumber">PAN Card Number</Label>
                    <Input
                      id="panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="address">Residential Address *</Label>
                  <Textarea
                    id="address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address, city, state, pincode"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="bio">Bio / Professional Summary</Label>
                  <Textarea
                    id="bio"
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short bio, technical strengths, notes..."
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Education & Bank */}
              <TabsContent value="education" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="qualification">Highest Qualification</Label>
                    <Select
                      value={formData.qualification}
                      onValueChange={(val) => setFormData({ ...formData, qualification: val })}
                    >
                      <SelectTrigger id="qualification">
                        <SelectValue placeholder="Select Qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.Tech / B.E">B.Tech / B.E</SelectItem>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="B.Sc / M.Sc">B.Sc / M.Sc</SelectItem>
                        <SelectItem value="MBA / PGDM">MBA / PGDM</SelectItem>
                        <SelectItem value="B.Com / M.Com">B.Com / M.Com</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Higher Secondary (12th)">Higher Secondary (12th)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="stream">Stream / Specialization</Label>
                    <Input
                      id="stream"
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      placeholder="e.g. Computer Science, IT"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="institution">College / University / Institution</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. ABC Institute of Technology"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="passingYear">Passing Year</Label>
                    <Input
                      id="passingYear"
                      value={formData.passingYear}
                      onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                      placeholder="e.g. 2023"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="gradePercentage">Grade / Percentage / CGPA</Label>
                    <Input
                      id="gradePercentage"
                      value={formData.gradePercentage}
                      onChange={(e) => setFormData({ ...formData, gradePercentage: e.target.value })}
                      placeholder="e.g. 8.2 CGPA or 82%"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" /> Banking Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="bankName">Bank Name</Label>
                      <Input
                        id="bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="e.g. HDFC Bank"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="accountNumber">Account Number</Label>
                      <Input
                        id="accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="e.g. 123456789012"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input
                        id="ifscCode"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. HDFC0001234"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createEmployee.isPending}>
                {createEmployee.isPending ? "Creating..." : "Save Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Employee Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Edit className="w-5 h-5 text-primary" /> Edit Employee Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateEmployee} className="space-y-4 mt-2">
            <Tabs defaultValue="job" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="job" className="text-xs sm:text-sm">💼 Job & Role</TabsTrigger>
                <TabsTrigger value="biodata" className="text-xs sm:text-sm">👤 Bio Data</TabsTrigger>
                <TabsTrigger value="education" className="text-xs sm:text-sm">🎓 Education & Bank</TabsTrigger>
              </TabsList>

              {/* Tab 1: Job & Role */}
              <TabsContent value="job" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-name">Full Name *</Label>
                    <Input
                      id="edit-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-email">Email *</Label>
                    <Input
                      id="edit-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@webflora.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-password">Password (leave blank to keep current)</Label>
                    <div className="relative">
                      <Input
                        id="edit-password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        placeholder="••••••••"
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors h-5 w-5 flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-jobRole">Job Role / Designation</Label>
                    <Input
                      id="edit-jobRole"
                      value={formData.jobRole}
                      onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                      placeholder="e.g. Frontend Developer, UI/UX Designer"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-department">Department</Label>
                    <Select
                      value={formData.department || undefined}
                      onValueChange={(val) => setFormData({ ...formData, department: val === "unassigned" ? "" : val })}
                    >
                      <SelectTrigger id="edit-department">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="unassigned">None / Not Assigned</SelectItem>
                        <SelectItem value="Development">Development & Engineering</SelectItem>
                        <SelectItem value="Design">UI/UX & Graphic Design</SelectItem>
                        <SelectItem value="Quality Assurance">Quality Assurance (QA)</SelectItem>
                        <SelectItem value="Marketing">Digital Marketing & SEO</SelectItem>
                        <SelectItem value="Sales">Sales & Business Development</SelectItem>
                        <SelectItem value="Human Resources">Human Resources (HR)</SelectItem>
                        <SelectItem value="Operations">Operations & Management</SelectItem>
                        <SelectItem value="Finance">Finance & Accounts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-salary">Monthly Salary (₹) *</Label>
                    <Input
                      id="edit-salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="50000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-joiningDate">Joining Date</Label>
                    <Input
                      id="edit-joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger id="edit-status">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active (Available for projects/handovers)</SelectItem>
                        <SelectItem value="inactive">Inactive (Restricted from work/handovers)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Tab 2: Bio Data */}
              <TabsContent value="biodata" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-fatherName">Father's Name</Label>
                    <Input
                      id="edit-fatherName"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="Father's full name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-motherName">Mother's Name</Label>
                    <Input
                      id="edit-motherName"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="Mother's full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-phone">Phone Number *</Label>
                    <Input
                      id="edit-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-emergencyPhone">Emergency Phone Number</Label>
                    <Input
                      id="edit-emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="9876543211"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-dob">Date of Birth</Label>
                    <Input
                      id="edit-dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => setFormData({ ...formData, gender: val })}
                    >
                      <SelectTrigger id="edit-gender">
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-bloodGroup">Blood Group</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                    >
                      <SelectTrigger id="edit-bloodGroup">
                        <SelectValue placeholder="Blood Group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-aadhaarNumber">Aadhaar Number</Label>
                    <Input
                      id="edit-aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="12-digit Aadhaar UID"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-panNumber">PAN Card Number</Label>
                    <Input
                      id="edit-panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-address">Residential Address *</Label>
                  <Textarea
                    id="edit-address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address, city, state"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-bio">Bio / Professional Summary</Label>
                  <Textarea
                    id="edit-bio"
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short bio, technical expertise, notes..."
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Education & Bank */}
              <TabsContent value="education" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-qualification">Highest Qualification</Label>
                    <Select
                      value={formData.qualification}
                      onValueChange={(val) => setFormData({ ...formData, qualification: val })}
                    >
                      <SelectTrigger id="edit-qualification">
                        <SelectValue placeholder="Select Qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.Tech / B.E">B.Tech / B.E</SelectItem>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="B.Sc / M.Sc">B.Sc / M.Sc</SelectItem>
                        <SelectItem value="MBA / PGDM">MBA / PGDM</SelectItem>
                        <SelectItem value="B.Com / M.Com">B.Com / M.Com</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Higher Secondary (12th)">Higher Secondary (12th)</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-stream">Stream / Specialization</Label>
                    <Input
                      id="edit-stream"
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      placeholder="e.g. Computer Science, IT"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-institution">College / University / Institution</Label>
                  <Input
                    id="edit-institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. ABC Institute of Technology"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-passingYear">Passing Year</Label>
                    <Input
                      id="edit-passingYear"
                      value={formData.passingYear}
                      onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                      placeholder="e.g. 2023"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-gradePercentage">Grade / Percentage / CGPA</Label>
                    <Input
                      id="edit-gradePercentage"
                      value={formData.gradePercentage}
                      onChange={(e) => setFormData({ ...formData, gradePercentage: e.target.value })}
                      placeholder="e.g. 8.2 CGPA or 82%"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" /> Banking Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-bankName">Bank Name</Label>
                      <Input
                        id="edit-bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="e.g. HDFC Bank"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-accountNumber">Account Number</Label>
                      <Input
                        id="edit-accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="e.g. 123456789012"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-ifscCode">IFSC Code</Label>
                      <Input
                        id="edit-ifscCode"
                        value={formData.ifscCode}
                        onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value.toUpperCase() })}
                        placeholder="e.g. HDFC0001234"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateEmployee.isPending}>
                {updateEmployee.isPending ? "Updating..." : "Update Employee"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Full Profile & Bio Data Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          {profileEmployee && (
            <div>
              <DialogHeader>
                <div className="flex items-start justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-lg">
                      {profileEmployee.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {profileEmployee.name}
                        {profileEmployee.employeeId && (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                            {profileEmployee.employeeId}
                          </span>
                        )}
                      </DialogTitle>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {profileEmployee.jobRole ? (
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-medium text-xs">
                            💼 {profileEmployee.jobRole}
                          </Badge>
                        ) : null}
                        {profileEmployee.department ? (
                          <Badge variant="secondary" className="text-xs">
                            🏢 {profileEmployee.department}
                          </Badge>
                        ) : null}
                        <Badge
                          variant="outline"
                          className={profileEmployee.status === 'inactive' ? 'border-destructive text-destructive bg-destructive/10' : 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'}
                        >
                          {profileEmployee.status === 'inactive' ? 'Inactive' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="summary" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="summary">💼 Employment</TabsTrigger>
                  <TabsTrigger value="biodata">👤 Bio Data</TabsTrigger>
                  <TabsTrigger value="education">🎓 Education & Bank</TabsTrigger>
                </TabsList>

                {/* Tab 1: Employment */}
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Employee ID</span>
                      <span className="font-mono font-bold text-foreground">{profileEmployee.employeeId || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Job Role / Designation</span>
                      <span className="font-semibold text-foreground">{profileEmployee.jobRole || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Department</span>
                      <span className="font-semibold text-foreground">{profileEmployee.department || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
                      <span className="font-semibold text-foreground break-all">{profileEmployee.email}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Contact Phone</span>
                      <span className="font-semibold text-foreground">{profileEmployee.phone || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Monthly Salary</span>
                      <span className="font-semibold text-foreground">{formatCurrency(profileEmployee.salary || 0)}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Total Paid</span>
                      <span className="font-semibold text-success">{formatCurrency(profileEmployee.totalPaid || 0)}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Joining Date</span>
                      <span className="font-semibold text-foreground">
                        {profileEmployee.joinDate ? formatDate(profileEmployee.joinDate) : "—"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Work Assignment Status</span>
                      <span className={`font-semibold ${profileEmployee.status === 'inactive' ? 'text-destructive' : 'text-emerald-600'}`}>
                        {profileEmployee.status === 'inactive' ? 'Restricted (Inactive)' : 'Available (Active)'}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Bio Data */}
                <TabsContent value="biodata" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Father's Name</span>
                      <span className="font-semibold text-foreground">{profileEmployee.fatherName || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Mother's Name</span>
                      <span className="font-semibold text-foreground">{profileEmployee.motherName || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Date of Birth</span>
                      <span className="font-semibold text-foreground">
                        {profileEmployee.dob ? formatDate(profileEmployee.dob) : "Not Provided"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Gender</span>
                      <span className="font-semibold text-foreground">{profileEmployee.gender || "Not Specified"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Blood Group</span>
                      <span className="font-semibold text-foreground">{profileEmployee.bloodGroup || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Emergency Contact</span>
                      <span className="font-semibold text-foreground">{profileEmployee.emergencyPhone || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Aadhaar Number</span>
                      <span className="font-mono text-foreground">{profileEmployee.aadhaarNumber || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">PAN Card Number</span>
                      <span className="font-mono text-foreground uppercase">{profileEmployee.panNumber || "—"}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card text-sm">
                    <span className="text-xs text-muted-foreground block mb-1">Residential Address</span>
                    <p className="text-foreground whitespace-pre-wrap">{profileEmployee.address || "—"}</p>
                  </div>

                  {profileEmployee.bio && (
                    <div className="p-3 rounded-lg border border-border bg-card text-sm">
                      <span className="text-xs text-muted-foreground block mb-1">Bio / Professional Summary</span>
                      <p className="text-foreground whitespace-pre-wrap">{profileEmployee.bio}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Education & Banking */}
                <TabsContent value="education" className="space-y-4">
                  <div className="p-3 rounded-lg border border-border bg-card text-sm space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Academic Qualifications</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Qualification</span>
                        <span className="font-semibold text-foreground">{profileEmployee.qualification || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Stream / Field</span>
                        <span className="font-semibold text-foreground">{profileEmployee.stream || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Institution / University</span>
                        <span className="font-semibold text-foreground">{profileEmployee.institution || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Passing Year & Score</span>
                        <span className="font-semibold text-foreground">
                          {profileEmployee.passingYear ? `${profileEmployee.passingYear} ` : ''}
                          {profileEmployee.gradePercentage ? `(${profileEmployee.gradePercentage})` : (profileEmployee.passingYear ? '' : '—')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card text-sm space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Banking Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Bank Name</span>
                        <span className="font-semibold text-foreground">{profileEmployee.bankName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">IFSC Code</span>
                        <span className="font-mono text-foreground uppercase">{profileEmployee.ifscCode || "—"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-muted-foreground block">Account Number</span>
                        <span className="font-mono font-semibold text-foreground">{profileEmployee.accountNumber || "—"}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 pt-4 border-t border-border mt-4">
                <Button variant="outline" onClick={() => setIsProfileDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setIsProfileDialogOpen(false);
                  handleEditClick(profileEmployee);
                }}>
                  <Edit className="w-4 h-4 mr-1.5" /> Edit Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!employeeToDelete} onOpenChange={() => setEmployeeToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{employeeToDelete?.name}</strong> and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteEmployee}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEmployee.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AttendanceHistoryDialog
        isOpen={isAttendanceDialogOpen}
        onOpenChange={setIsAttendanceDialogOpen}
        userId={attendanceEmployeeId || undefined}
        userName={attendanceEmployeeName}
      />

      <ActivityHistoryDialog
        isOpen={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        userId={activityEmployeeId || undefined}
        userName={activityEmployeeName}
      />

      {salaryPayee && (
        <>
          <SalaryPaymentDialog
            isOpen={isSalaryPaymentOpen}
            onOpenChange={setIsSalaryPaymentOpen}
            payeeId={salaryPayee.id || salaryPayee._id}
            payeeName={salaryPayee.name}
            payeeModel="employee"
            defaultAmount={salaryPayee.salary || 0}
          />
          <SalaryHistoryDialog
            isOpen={isSalaryHistoryOpen}
            onOpenChange={setIsSalaryHistoryOpen}
            payeeId={salaryPayee.id || salaryPayee._id}
            payeeName={salaryPayee.name}
          />
        </>
      )}
    </div>
  );
};

export default Employees;
