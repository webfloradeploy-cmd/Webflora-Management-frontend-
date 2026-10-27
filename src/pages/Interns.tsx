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
  Clock
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
import { useInterns, useCreateIntern, useUpdateIntern, useDeleteIntern, useToggleInternStatus } from "@/hooks/useInterns";
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

const Interns = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState("directory");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [internToDelete, setInternToDelete] = useState<any | null>(null);
  const [selectedIntern, setSelectedIntern] = useState<any | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Attendance History State
  const [attendanceInternId, setAttendanceInternId] = useState<string | null>(null);
  const [attendanceInternName, setAttendanceInternName] = useState<string>("");
  const [isAttendanceDialogOpen, setIsAttendanceDialogOpen] = useState(false);

  // Salary Dialogs State
  const [isSalaryPaymentOpen, setIsSalaryPaymentOpen] = useState(false);
  const [isSalaryHistoryOpen, setIsSalaryHistoryOpen] = useState(false);
  const [salaryPayee, setSalaryPayee] = useState<any | null>(null);

  // Activity History State
  const [isActivityDialogOpen, setIsActivityDialogOpen] = useState(false);
  const [activityInternId, setActivityInternId] = useState<string | null>(null);
  const [activityInternName, setActivityInternName] = useState<string>("");

  // View Profile Dialog State
  const [isProfileDialogOpen, setIsProfileDialogOpen] = useState(false);
  const [profileIntern, setProfileIntern] = useState<any | null>(null);

  const initialInternFormData = {
    name: "",
    email: "",
    password: "",
    role: "intern",
    jobRole: "",
    department: "",
    duration: "",
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

  const [formData, setFormData] = useState(initialInternFormData);

  const { data: interns = [], isLoading, error } = useInterns();
  const { data: allAttendance = [], isLoading: attendanceLoading } = useAllAttendance();
  const createIntern = useCreateIntern();
  const updateIntern = useUpdateIntern();
  const deleteIntern = useDeleteIntern();
  const toggleStatus = useToggleInternStatus();
  const { toast } = useToast();

  const internAttendance = allAttendance.filter((a: any) => a.userModel === 'intern');

  const filteredInterns = interns
    .filter((intern: any) => {
      const matchesSearch =
        intern.name?.toLowerCase().includes(search.toLowerCase()) ||
        (intern.employeeId && intern.employeeId.toLowerCase().includes(search.toLowerCase())) ||
        (intern.jobRole && intern.jobRole.toLowerCase().includes(search.toLowerCase())) ||
        intern.email?.toLowerCase().includes(search.toLowerCase()) ||
        (intern.department && intern.department.toLowerCase().includes(search.toLowerCase()));

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && intern.status !== "inactive") ||
        (statusFilter === "inactive" && intern.status === "inactive");

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

  const totalPages = Math.ceil(filteredInterns.length / itemsPerPage);
  const paginatedInterns = filteredInterns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeCount = interns.filter((i: any) => i.status !== "inactive").length;
  const inactiveCount = interns.filter((i: any) => i.status === "inactive").length;

  const handleCreateIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createIntern.mutateAsync({
        ...formData,
        salary: Number(formData.salary),
        status: formData.status || "active",
      });
      setIsCreateDialogOpen(false);
      setFormData(initialInternFormData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create intern",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (intern: any) => {
    setFormData({
      name: intern.name || "",
      email: intern.email || "",
      password: "",
      role: intern.role || "intern",
      jobRole: intern.jobRole || "",
      department: intern.department || "",
      duration: intern.duration || "",
      phone: intern.phone || "",
      emergencyPhone: intern.emergencyPhone || "",
      address: intern.address || "",
      salary: intern.salary?.toString() || "",
      status: intern.status || "active",
      joiningDate: intern.joinDate ? intern.joinDate.split('T')[0] : (intern.createdAt ? intern.createdAt.split('T')[0] : ""),
      fatherName: intern.fatherName || "",
      motherName: intern.motherName || "",
      dob: intern.dob ? intern.dob.split('T')[0] : "",
      gender: intern.gender || "Male",
      bloodGroup: intern.bloodGroup || "",
      aadhaarNumber: intern.aadhaarNumber || "",
      panNumber: intern.panNumber || "",
      qualification: intern.qualification || "",
      stream: intern.stream || "",
      institution: intern.institution || "",
      passingYear: intern.passingYear || "",
      gradePercentage: intern.gradePercentage || "",
      bankName: intern.bankName || "",
      accountNumber: intern.accountNumber || "",
      ifscCode: intern.ifscCode || "",
      bio: intern.bio || "",
    });
    setSelectedIntern(intern);
    setIsEditDialogOpen(true);
  };

  const handleAttendanceClick = (intern: any) => {
    setAttendanceInternId(intern.id || intern._id);
    setAttendanceInternName(intern.name);
    setIsAttendanceDialogOpen(true);
  };

  const handleActivityClick = (intern: any) => {
    setActivityInternId(intern.id || intern._id);
    setActivityInternName(intern.name);
    setIsActivityDialogOpen(true);
  };

  const handleSalaryPaymentClick = (intern: any) => {
    setSalaryPayee(intern);
    setIsSalaryPaymentOpen(true);
  };

  const handleSalaryHistoryClick = (intern: any) => {
    setSalaryPayee(intern);
    setIsSalaryHistoryOpen(true);
  };

  const handleUpdateIntern = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIntern) return;

    try {
      const updateData: any = {
        ...formData,
        salary: Number(formData.salary),
      };

      if (!formData.password) {
        delete updateData.password;
      }

      await updateIntern.mutateAsync({
        id: selectedIntern.id || selectedIntern._id,
        data: updateData,
      });
      setIsEditDialogOpen(false);
      setSelectedIntern(null);
      setFormData(initialInternFormData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update intern",
        variant: "destructive",
      });
    }
  };

  const handleDeleteIntern = async () => {
    if (!internToDelete) return;

    try {
      await deleteIntern.mutateAsync(internToDelete.id || internToDelete._id);
      setInternToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete intern",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Interns" subtitle="Error loading interns" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load interns. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Interns"
        subtitle={`${interns.length} total interns (${activeCount} active, ${inactiveCount} inactive)`}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Intern
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
                    All ({interns.length})
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
            ) : filteredInterns.length === 0 ? (
              <div className="text-center py-16 bg-card border border-border rounded-2xl">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {search || statusFilter !== "all" ? "No matching interns found" : "No interns added yet"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {search || statusFilter !== "all" ? "Try adjusting your search or filters" : "Start by clicking the Add Intern button"}
                </p>
                {!search && statusFilter === "all" && (
                  <Button onClick={() => setIsCreateDialogOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" /> Add Intern
                  </Button>
                )}
              </div>
            ) : viewMode === "grid" ? (
              /* Modern Grid Card Layout */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedInterns.map((intern: any) => {
                  const isInactive = intern.status === "inactive";
                  return (
                    <div
                      key={intern.id || intern._id}
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
                            <div className="w-11 h-11 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 font-bold text-sm flex items-center justify-center shrink-0">
                              {intern.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-bold text-foreground text-base leading-snug truncate">
                                  {intern.name}
                                </h3>
                                {intern.employeeId && (
                                  <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border shrink-0">
                                    {intern.employeeId}
                                  </span>
                                )}
                              </div>
                              {(intern.jobRole || intern.department) ? (
                                <div className="flex flex-wrap items-center gap-1.5 mt-0.5">
                                  {intern.jobRole ? (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                                      {intern.jobRole}
                                    </span>
                                  ) : null}
                                  {intern.department ? (
                                    <span className="text-[11px] text-muted-foreground font-medium">
                                      {intern.jobRole ? `• ${intern.department}` : intern.department}
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
                            onClick={() => toggleStatus.mutate(intern.id || intern._id)}
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
                            <span>Work & Handover Assignment Restricted</span>
                          </div>
                        )}

                        {/* Contact Details */}
                        <div className="space-y-1.5 text-xs text-muted-foreground mt-3">
                          <div className="flex items-center gap-2 truncate">
                            <Mail className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                            <span className="truncate">{intern.email}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                            <span>{intern.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground/80">
                            <Clock className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                            <span>Duration: <strong className="text-foreground">{intern.duration || "6 Months"}</strong></span>
                          </div>
                          {intern.qualification && (
                            <div className="flex items-center gap-2 text-muted-foreground/80 truncate">
                              <GraduationCap className="w-3.5 h-3.5 text-primary/70 shrink-0" />
                              <span className="truncate">{intern.qualification} {intern.stream ? `(${intern.stream})` : ""}</span>
                            </div>
                          )}
                        </div>

                        {/* Financial Box */}
                        <div className="mt-3.5 p-2.5 rounded-xl bg-muted/40 border border-border/60 grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Monthly Stipend</span>
                            <span className="font-semibold text-foreground text-sm">
                              {formatCurrency(intern.salary || 0)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground block text-[11px]">Total Paid</span>
                            <span className="font-bold text-success text-sm">
                              {formatCurrency(intern.totalPaid || 0)}
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
                            setProfileIntern(intern);
                            setIsProfileDialogOpen(true);
                          }}
                        >
                          <Eye className="w-3.5 h-3.5 mr-1 text-primary" /> Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8"
                          onClick={() => handleSalaryPaymentClick(intern)}
                        >
                          <Plus className="w-3.5 h-3.5 mr-1 text-success" /> Pay
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs h-8"
                          onClick={() => handleSalaryHistoryClick(intern)}
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
                            <DropdownMenuItem onClick={() => handleAttendanceClick(intern)} className="cursor-pointer">
                              <History className="w-4 h-4 mr-2 text-primary" /> Attendance History
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleActivityClick(intern)} className="cursor-pointer">
                              <ScrollText className="w-4 h-4 mr-2 text-primary" /> Activity Log
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditClick(intern)} className="cursor-pointer">
                              <Edit className="w-4 h-4 mr-2 text-primary" /> Edit Details
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => setInternToDelete(intern)} className="text-destructive focus:text-destructive cursor-pointer">
                              <Trash2 className="w-4 h-4 mr-2" /> Delete Intern
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
                      <TableHead>Intern</TableHead>
                      <TableHead>Role & Department</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Stipend</TableHead>
                      <TableHead>Total Paid</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedInterns.map((intern: any) => {
                      const isInactive = intern.status === "inactive";
                      return (
                        <TableRow key={intern.id || intern._id} className={isInactive ? "bg-destructive/[0.02]" : ""}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-purple-500/10 text-purple-600 font-bold text-xs flex items-center justify-center shrink-0">
                                {intern.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="font-bold text-foreground block text-sm">{intern.name}</span>
                                  {intern.employeeId && (
                                    <span className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded bg-muted text-muted-foreground border border-border">
                                      {intern.employeeId}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">{intern.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {intern.jobRole ? (
                              <Badge variant="outline" className="font-medium text-xs bg-purple-500/5 text-purple-600 border-purple-500/20">
                                {intern.jobRole}
                              </Badge>
                            ) : null}
                            {intern.department && (
                              <span className="text-xs text-muted-foreground block mt-0.5">{intern.department}</span>
                            )}
                            {!intern.jobRole && !intern.department && (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="text-xs font-semibold text-foreground">
                            {intern.duration || "—"}
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {intern.phone}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-foreground">
                            {formatCurrency(intern.salary || 0)}
                          </TableCell>
                          <TableCell className="text-sm font-bold text-success">
                            {formatCurrency(intern.totalPaid || 0)}
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => toggleStatus.mutate(intern.id || intern._id)}
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
                                  setProfileIntern(intern);
                                  setIsProfileDialogOpen(true);
                                }}
                              >
                                <Eye className="w-3.5 h-3.5 mr-1 text-primary" /> Profile
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 px-2.5 text-xs"
                                onClick={() => handleSalaryPaymentClick(intern)}
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
                                  <DropdownMenuItem onClick={() => handleSalaryHistoryClick(intern)} className="cursor-pointer">
                                    <Banknote className="w-4 h-4 mr-2" /> Payment History
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleAttendanceClick(intern)} className="cursor-pointer">
                                    <History className="w-4 h-4 mr-2" /> Attendance
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleActivityClick(intern)} className="cursor-pointer">
                                    <ScrollText className="w-4 h-4 mr-2" /> Activity Log
                                  </DropdownMenuItem>
                                  <DropdownMenuItem onClick={() => handleEditClick(intern)} className="cursor-pointer">
                                    <Edit className="w-4 h-4 mr-2" /> Edit Details
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem onClick={() => setInternToDelete(intern)} className="text-destructive focus:text-destructive cursor-pointer">
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete Intern
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
              totalItems={filteredInterns.length}
              itemsPerPage={itemsPerPage}
              itemName="interns"
              className="rounded-xl border"
            />
          </TabsContent>

          <TabsContent value="attendance" className="mt-6">
            <div className="rounded-2xl border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Date</TableHead>
                    <TableHead className="font-bold py-4">Intern</TableHead>
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
                  ) : internAttendance.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground font-medium">
                        No attendance records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    internAttendance.map((record: any) => (
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
        </Tabs>
      </div>

      {/* Create Intern Dialog (3 Organized Tabs) */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <User className="w-5 h-5 text-primary" /> Add New Intern
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreateIntern} className="space-y-4 mt-2">
            <Tabs defaultValue="job" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="job" className="text-xs sm:text-sm">💼 Role & Duration</TabsTrigger>
                <TabsTrigger value="biodata" className="text-xs sm:text-sm">👤 Bio Data</TabsTrigger>
                <TabsTrigger value="education" className="text-xs sm:text-sm">🎓 Education & Bank</TabsTrigger>
              </TabsList>

              {/* Tab 1: Role & Duration */}
              <TabsContent value="job" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="intern-name">Full Name *</Label>
                    <Input
                      id="intern-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Rahul Sharma"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-email">Email *</Label>
                    <Input
                      id="intern-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="rahul@webflora.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="intern-password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="intern-password"
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
                    <Label htmlFor="intern-jobRole">Intern Role / Domain</Label>
                    <Input
                      id="intern-jobRole"
                      value={formData.jobRole}
                      onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                      placeholder="e.g. React Developer Intern, UI/UX Intern"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="intern-department">Department</Label>
                    <Select
                      value={formData.department || undefined}
                      onValueChange={(val) => setFormData({ ...formData, department: val === "unassigned" ? "" : val })}
                    >
                      <SelectTrigger id="intern-department">
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-duration">Duration *</Label>
                    <Input
                      id="intern-duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 3 Months, 6 Months"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-salary">Monthly Stipend (₹) *</Label>
                    <Input
                      id="intern-salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="e.g. 15000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="intern-joiningDate">Joining Date</Label>
                    <Input
                      id="intern-joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-status">Initial Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger id="intern-status">
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
                    <Label htmlFor="intern-fatherName">Father's Name</Label>
                    <Input
                      id="intern-fatherName"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="Father's full name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-motherName">Mother's Name</Label>
                    <Input
                      id="intern-motherName"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="Mother's full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="intern-phone">Phone Number *</Label>
                    <Input
                      id="intern-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="e.g. 9876543210"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-emergencyPhone">Emergency Phone Number</Label>
                    <Input
                      id="intern-emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="e.g. 9876543211"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="intern-dob">Date of Birth</Label>
                    <Input
                      id="intern-dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => setFormData({ ...formData, gender: val })}
                    >
                      <SelectTrigger id="intern-gender">
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
                    <Label htmlFor="intern-bloodGroup">Blood Group</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                    >
                      <SelectTrigger id="intern-bloodGroup">
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
                    <Label htmlFor="intern-aadhaarNumber">Aadhaar Number</Label>
                    <Input
                      id="intern-aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="12-digit Aadhaar UID"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-panNumber">PAN Card Number</Label>
                    <Input
                      id="intern-panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="intern-address">Residential Address *</Label>
                  <Textarea
                    id="intern-address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address, city, state, pincode"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="intern-bio">Bio / Professional Summary</Label>
                  <Textarea
                    id="intern-bio"
                    rows={2}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short bio, technical interests, goals..."
                  />
                </div>
              </TabsContent>

              {/* Tab 3: Education & Bank */}
              <TabsContent value="education" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="intern-qualification">Pursuing / Highest Qualification</Label>
                    <Select
                      value={formData.qualification}
                      onValueChange={(val) => setFormData({ ...formData, qualification: val })}
                    >
                      <SelectTrigger id="intern-qualification">
                        <SelectValue placeholder="Select Qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.Tech / B.E">B.Tech / B.E</SelectItem>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="B.Sc / M.Sc">B.Sc / M.Sc</SelectItem>
                        <SelectItem value="MBA / PGDM">MBA / PGDM</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-stream">Branch / Specialization</Label>
                    <Input
                      id="intern-stream"
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      placeholder="e.g. Computer Science, IT, AI"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="intern-institution">College / University / School</Label>
                  <Input
                    id="intern-institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. ABC Institute of Technology"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="intern-passingYear">Expected Passing Year</Label>
                    <Input
                      id="intern-passingYear"
                      value={formData.passingYear}
                      onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                      placeholder="e.g. 2025"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="intern-gradePercentage">Current CGPA / Percentage</Label>
                    <Input
                      id="intern-gradePercentage"
                      value={formData.gradePercentage}
                      onChange={(e) => setFormData({ ...formData, gradePercentage: e.target.value })}
                      placeholder="e.g. 8.5 CGPA or 85%"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" /> Stipend Bank Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="intern-bankName">Bank Name</Label>
                      <Input
                        id="intern-bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="e.g. HDFC Bank"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="intern-accountNumber">Account Number</Label>
                      <Input
                        id="intern-accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="e.g. 123456789012"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="intern-ifscCode">IFSC Code</Label>
                      <Input
                        id="intern-ifscCode"
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
              <Button type="submit" disabled={createIntern.isPending}>
                {createIntern.isPending ? "Creating..." : "Save Intern"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Intern Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <Edit className="w-5 h-5 text-primary" /> Edit Intern Details
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleUpdateIntern} className="space-y-4 mt-2">
            <Tabs defaultValue="job" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="job" className="text-xs sm:text-sm">💼 Role & Duration</TabsTrigger>
                <TabsTrigger value="biodata" className="text-xs sm:text-sm">👤 Bio Data</TabsTrigger>
                <TabsTrigger value="education" className="text-xs sm:text-sm">🎓 Education & Bank</TabsTrigger>
              </TabsList>

              {/* Tab 1: Role & Duration */}
              <TabsContent value="job" className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-name">Full Name *</Label>
                    <Input
                      id="edit-intern-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-email">Email *</Label>
                    <Input
                      id="edit-intern-email"
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
                    <Label htmlFor="edit-intern-password">Password (leave blank to keep current)</Label>
                    <div className="relative">
                      <Input
                        id="edit-intern-password"
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
                    <Label htmlFor="edit-intern-jobRole">Intern Role / Domain</Label>
                    <Input
                      id="edit-intern-jobRole"
                      value={formData.jobRole}
                      onChange={(e) => setFormData({ ...formData, jobRole: e.target.value })}
                      placeholder="e.g. React Developer Intern, UI/UX Intern"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-department">Department</Label>
                    <Select
                      value={formData.department || undefined}
                      onValueChange={(val) => setFormData({ ...formData, department: val === "unassigned" ? "" : val })}
                    >
                      <SelectTrigger id="edit-intern-department">
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
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-duration">Duration *</Label>
                    <Input
                      id="edit-intern-duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g. 6 Months"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-salary">Monthly Stipend (₹) *</Label>
                    <Input
                      id="edit-intern-salary"
                      type="number"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="15000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-joiningDate">Joining Date</Label>
                    <Input
                      id="edit-intern-joiningDate"
                      type="date"
                      value={formData.joiningDate}
                      onChange={(e) => setFormData({ ...formData, joiningDate: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(val: any) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger id="edit-intern-status">
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
                    <Label htmlFor="edit-intern-fatherName">Father's Name</Label>
                    <Input
                      id="edit-intern-fatherName"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      placeholder="Father's full name"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-motherName">Mother's Name</Label>
                    <Input
                      id="edit-intern-motherName"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      placeholder="Mother's full name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-phone">Phone Number *</Label>
                    <Input
                      id="edit-intern-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="9876543210"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-emergencyPhone">Emergency Phone Number</Label>
                    <Input
                      id="edit-intern-emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      placeholder="9876543211"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-dob">Date of Birth</Label>
                    <Input
                      id="edit-intern-dob"
                      type="date"
                      value={formData.dob}
                      onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-gender">Gender</Label>
                    <Select
                      value={formData.gender}
                      onValueChange={(val) => setFormData({ ...formData, gender: val })}
                    >
                      <SelectTrigger id="edit-intern-gender">
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
                    <Label htmlFor="edit-intern-bloodGroup">Blood Group</Label>
                    <Select
                      value={formData.bloodGroup}
                      onValueChange={(val) => setFormData({ ...formData, bloodGroup: val })}
                    >
                      <SelectTrigger id="edit-intern-bloodGroup">
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
                    <Label htmlFor="edit-intern-aadhaarNumber">Aadhaar Number</Label>
                    <Input
                      id="edit-intern-aadhaarNumber"
                      value={formData.aadhaarNumber}
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })}
                      placeholder="12-digit Aadhaar UID"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-panNumber">PAN Card Number</Label>
                    <Input
                      id="edit-intern-panNumber"
                      value={formData.panNumber}
                      onChange={(e) => setFormData({ ...formData, panNumber: e.target.value.toUpperCase() })}
                      placeholder="e.g. ABCDE1234F"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-intern-address">Residential Address *</Label>
                  <Textarea
                    id="edit-intern-address"
                    rows={2}
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Full street address, city, state"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-intern-bio">Bio / Professional Summary</Label>
                  <Textarea
                    id="edit-intern-bio"
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
                    <Label htmlFor="edit-intern-qualification">Pursuing / Highest Qualification</Label>
                    <Select
                      value={formData.qualification}
                      onValueChange={(val) => setFormData({ ...formData, qualification: val })}
                    >
                      <SelectTrigger id="edit-intern-qualification">
                        <SelectValue placeholder="Select Qualification" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="B.Tech / B.E">B.Tech / B.E</SelectItem>
                        <SelectItem value="BCA">BCA</SelectItem>
                        <SelectItem value="MCA">MCA</SelectItem>
                        <SelectItem value="B.Sc / M.Sc">B.Sc / M.Sc</SelectItem>
                        <SelectItem value="MBA / PGDM">MBA / PGDM</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-stream">Branch / Specialization</Label>
                    <Input
                      id="edit-intern-stream"
                      value={formData.stream}
                      onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                      placeholder="e.g. Computer Science, IT"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="edit-intern-institution">College / University / School</Label>
                  <Input
                    id="edit-intern-institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="e.g. ABC Institute of Technology"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-passingYear">Expected Passing Year</Label>
                    <Input
                      id="edit-intern-passingYear"
                      value={formData.passingYear}
                      onChange={(e) => setFormData({ ...formData, passingYear: e.target.value })}
                      placeholder="e.g. 2025"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="edit-intern-gradePercentage">Current CGPA / Percentage</Label>
                    <Input
                      id="edit-intern-gradePercentage"
                      value={formData.gradePercentage}
                      onChange={(e) => setFormData({ ...formData, gradePercentage: e.target.value })}
                      placeholder="e.g. 8.5 CGPA or 85%"
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-border">
                  <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-primary" /> Stipend Bank Information
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="edit-intern-bankName">Bank Name</Label>
                      <Input
                        id="edit-intern-bankName"
                        value={formData.bankName}
                        onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                        placeholder="e.g. HDFC Bank"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-intern-accountNumber">Account Number</Label>
                      <Input
                        id="edit-intern-accountNumber"
                        value={formData.accountNumber}
                        onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                        placeholder="e.g. 123456789012"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="edit-intern-ifscCode">IFSC Code</Label>
                      <Input
                        id="edit-intern-ifscCode"
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
              <Button type="submit" disabled={updateIntern.isPending}>
                {updateIntern.isPending ? "Updating..." : "Update Intern"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Full Profile & Bio Data Dialog */}
      <Dialog open={isProfileDialogOpen} onOpenChange={setIsProfileDialogOpen}>
        <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
          {profileIntern && (
            <div>
              <DialogHeader>
                <div className="flex items-start justify-between pb-4 border-b border-border">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold text-lg">
                      {profileIntern.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <DialogTitle className="text-xl font-bold flex items-center gap-2">
                        {profileIntern.name}
                        {profileIntern.employeeId && (
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-muted text-foreground border border-border">
                            {profileIntern.employeeId}
                          </span>
                        )}
                      </DialogTitle>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        {profileIntern.jobRole ? (
                          <Badge variant="outline" className="bg-purple-500/5 text-purple-600 border-purple-500/20 font-medium text-xs">
                            💼 {profileIntern.jobRole}
                          </Badge>
                        ) : null}
                        {profileIntern.department ? (
                          <Badge variant="secondary" className="text-xs">
                            🏢 {profileIntern.department}
                          </Badge>
                        ) : null}
                        <Badge
                          variant="outline"
                          className={profileIntern.status === 'inactive' ? 'border-destructive text-destructive bg-destructive/10' : 'border-emerald-500 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40'}
                        >
                          {profileIntern.status === 'inactive' ? 'Inactive' : 'Active'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <Tabs defaultValue="summary" className="w-full mt-4">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                  <TabsTrigger value="summary">💼 Internship</TabsTrigger>
                  <TabsTrigger value="biodata">👤 Bio Data</TabsTrigger>
                  <TabsTrigger value="education">🎓 Education & Bank</TabsTrigger>
                </TabsList>

                {/* Tab 1: Internship */}
                <TabsContent value="summary" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Intern ID</span>
                      <span className="font-mono font-bold text-foreground">{profileIntern.employeeId || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Intern Role / Domain</span>
                      <span className="font-semibold text-foreground">{profileIntern.jobRole || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Department</span>
                      <span className="font-semibold text-foreground">{profileIntern.department || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Duration</span>
                      <span className="font-semibold text-foreground">{profileIntern.duration || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Email</span>
                      <span className="font-semibold text-foreground break-all">{profileIntern.email}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Contact Phone</span>
                      <span className="font-semibold text-foreground">{profileIntern.phone || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Monthly Stipend</span>
                      <span className="font-semibold text-foreground">{formatCurrency(profileIntern.salary || 0)}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Total Paid</span>
                      <span className="font-semibold text-success">{formatCurrency(profileIntern.totalPaid || 0)}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Joining Date</span>
                      <span className="font-semibold text-foreground">
                        {profileIntern.joinDate ? formatDate(profileIntern.joinDate) : "—"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card col-span-2">
                      <span className="text-xs text-muted-foreground block mb-0.5">Work Assignment Status</span>
                      <span className={`font-semibold ${profileIntern.status === 'inactive' ? 'text-destructive' : 'text-emerald-600'}`}>
                        {profileIntern.status === 'inactive' ? 'Restricted from Projects/Handovers (Inactive)' : 'Available for Work (Active)'}
                      </span>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 2: Bio Data */}
                <TabsContent value="biodata" className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Father's Name</span>
                      <span className="font-semibold text-foreground">{profileIntern.fatherName || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Mother's Name</span>
                      <span className="font-semibold text-foreground">{profileIntern.motherName || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Date of Birth</span>
                      <span className="font-semibold text-foreground">
                        {profileIntern.dob ? formatDate(profileIntern.dob) : "Not Provided"}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Gender</span>
                      <span className="font-semibold text-foreground">{profileIntern.gender || "Not Specified"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Blood Group</span>
                      <span className="font-semibold text-foreground">{profileIntern.bloodGroup || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Emergency Contact</span>
                      <span className="font-semibold text-foreground">{profileIntern.emergencyPhone || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">Aadhaar Number</span>
                      <span className="font-mono text-foreground">{profileIntern.aadhaarNumber || "—"}</span>
                    </div>
                    <div className="p-3 rounded-lg border border-border bg-card">
                      <span className="text-xs text-muted-foreground block mb-0.5">PAN Card Number</span>
                      <span className="font-mono text-foreground uppercase">{profileIntern.panNumber || "—"}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card text-sm">
                    <span className="text-xs text-muted-foreground block mb-1">Residential Address</span>
                    <p className="text-foreground whitespace-pre-wrap">{profileIntern.address || "—"}</p>
                  </div>

                  {profileIntern.bio && (
                    <div className="p-3 rounded-lg border border-border bg-card text-sm">
                      <span className="text-xs text-muted-foreground block mb-1">Bio / Goals</span>
                      <p className="text-foreground whitespace-pre-wrap">{profileIntern.bio}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tab 3: Education & Banking */}
                <TabsContent value="education" className="space-y-4">
                  <div className="p-3 rounded-lg border border-border bg-card text-sm space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">College & Academic Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Qualification</span>
                        <span className="font-semibold text-foreground">{profileIntern.qualification || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Branch / Field</span>
                        <span className="font-semibold text-foreground">{profileIntern.stream || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Institution / College</span>
                        <span className="font-semibold text-foreground">{profileIntern.institution || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">Expected Passing Year & Score</span>
                        <span className="font-semibold text-foreground">
                          {profileIntern.passingYear ? `${profileIntern.passingYear} ` : ''}
                          {profileIntern.gradePercentage ? `(${profileIntern.gradePercentage})` : (profileIntern.passingYear ? '' : '—')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-border bg-card text-sm space-y-2">
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Stipend Bank Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-xs text-muted-foreground block">Bank Name</span>
                        <span className="font-semibold text-foreground">{profileIntern.bankName || "—"}</span>
                      </div>
                      <div>
                        <span className="text-xs text-muted-foreground block">IFSC Code</span>
                        <span className="font-mono text-foreground uppercase">{profileIntern.ifscCode || "—"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-xs text-muted-foreground block">Account Number</span>
                        <span className="font-mono font-semibold text-foreground">{profileIntern.accountNumber || "—"}</span>
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
                  handleEditClick(profileIntern);
                }}>
                  <Edit className="w-4 h-4 mr-1.5" /> Edit Details
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!internToDelete} onOpenChange={() => setInternToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <DialogTitle>Are you sure?</DialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{internToDelete?.name}</strong> and all associated records.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteIntern}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteIntern.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AttendanceHistoryDialog
        isOpen={isAttendanceDialogOpen}
        onOpenChange={setIsAttendanceDialogOpen}
        userId={attendanceInternId || undefined}
        userName={attendanceInternName}
      />

      <ActivityHistoryDialog
        isOpen={isActivityDialogOpen}
        onOpenChange={setIsActivityDialogOpen}
        userId={activityInternId || undefined}
        userName={activityInternName}
      />

      {salaryPayee && (
        <>
          <SalaryPaymentDialog
            isOpen={isSalaryPaymentOpen}
            onOpenChange={setIsSalaryPaymentOpen}
            payeeId={salaryPayee.id || salaryPayee._id}
            payeeName={salaryPayee.name}
            payeeModel="intern"
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

export default Interns;
