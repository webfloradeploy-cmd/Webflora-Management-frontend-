import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Mail,
  Users,
  Search,
  Edit,
  Trash2,
  Phone,
  Calendar,
  Check,
  X,
  Clock,
  Sparkles,
  FileText,
  Send,
  ThumbsUp,
  ThumbsDown,
  HelpCircle,
  CheckCircle2,
  XCircle,
  History,
  User as UserIcon,
  UserCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
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
  useLeads,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
  useRequestQuotation,
  useApproveQuotation,
  useRejectQuotation,
  useAddFollowUp,
  useConvertToCustomer,
} from "@/hooks/useLeads";
import { useEmployees } from "@/hooks/useEmployees";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { DatePicker } from "@/components/ui/date-picker";
import { formatDate } from "@/utils/dateUtils";

const Leads = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const navigate = useNavigate();
  const { toast } = useToast();

  const [search, setSearch] = useState("");
  const [filterTab, setFilterTab] = useState<string>("all");

  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<any | null>(null);

  // Multiple Follow-up Dialog State
  const [followUpLead, setFollowUpLead] = useState<any | null>(null);
  const [followUpForm, setFollowUpForm] = useState({
    conductedByName: user?.name || "Admin",
    conductedById: user?.id || "",
    followUpDate: new Date().toISOString().split("T")[0],
    notes: "",
    interestStatus: "Interested",
    nextFollowUpDate: "",
  });

  // Quotation Request Modal State
  const [quotationRequestLead, setQuotationRequestLead] = useState<any | null>(null);
  const [quotationRequestNotes, setQuotationRequestNotes] = useState("");

  // Quotation Rejection Modal State
  const [rejectLead, setRejectLead] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [formData, setFormData] = useState({
    leadName: "",
    email: "",
    contactNumber: "",
    address: "",
    source: "",
    status: "New",
    interestStatus: "Pending",
    followUpDate: "",
    notes: "",
  });

  const { data: leads = [], isLoading, error } = useLeads();
  const { data: employees = [] } = useEmployees({ enabled: true });
  const activeEmployees = employees.filter((e: any) => e.status !== "inactive");

  const createLead = useCreateLead();
  const updateLead = useUpdateLead();
  const deleteLead = useDeleteLead();
  const requestQuotationMutation = useRequestQuotation();
  const approveQuotationMutation = useApproveQuotation();
  const rejectQuotationMutation = useRejectQuotation();
  const addFollowUpMutation = useAddFollowUp();
  const convertToCustomerMutation = useConvertToCustomer();
  const [leadToConvert, setLeadToConvert] = useState<any | null>(null);

  const handleConfirmConvert = async () => {
    if (!leadToConvert) return;
    try {
      await convertToCustomerMutation.mutateAsync(leadToConvert._id);
      setLeadToConvert(null);
    } catch (err) {
      // Toast handled by mutation
    }
  };

  const todayStr = new Date().toISOString().split("T")[0];

  const filteredLeads = leads.filter((l: any) => {
    const matchesSearch =
      (l.leadId && l.leadId.toLowerCase().includes(search.toLowerCase())) ||
      l.leadName?.toLowerCase().includes(search.toLowerCase()) ||
      (l.email && l.email.toLowerCase().includes(search.toLowerCase())) ||
      (l.contactNumber && l.contactNumber.includes(search)) ||
      (l.source && l.source.toLowerCase().includes(search.toLowerCase())) ||
      (l.lastFollowUp?.conductedByName &&
        l.lastFollowUp.conductedByName.toLowerCase().includes(search.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === "all") return true;
    if (filterTab === "interested") return l.interestStatus === "Interested";
    if (filterTab === "not_interested") return l.interestStatus === "Not Interested";
    if (filterTab === "quotation_requested")
      return l.quotationRequest?.status === "Requested" || l.status === "Quotation Requested";
    if (filterTab === "quotation_approved")
      return l.quotationRequest?.status === "Approved" || l.status === "Quotation Approved";
    if (filterTab === "followup_due") {
      if (!l.followUpDate) return false;
      const fDate = l.followUpDate.split("T")[0];
      return fDate <= todayStr;
    }

    return true;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterTab]);

  // Recent leads at the top
  const sortedLeads = [...filteredLeads].sort((a: any, b: any) => {
    const numA = parseInt((a.leadId || "").replace(/\D/g, "") || "0", 10);
    const numB = parseInt((b.leadId || "").replace(/\D/g, "") || "0", 10);
    if (numA && numB && numA !== numB) return numB - numA;

    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;

    return 0;
  });

  const totalPages = Math.ceil(sortedLeads.length / itemsPerPage);
  const paginatedLeads = sortedLeads.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLead.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error: any) {}
  };

  const handleEditClick = (lead: any) => {
    setFormData({
      leadName: lead.leadName,
      email: lead.email || "",
      contactNumber: lead.contactNumber || "",
      address: lead.address || "",
      source: lead.source || "",
      status: lead.status || "New",
      interestStatus: lead.interestStatus || (lead.status === "Interested" ? "Interested" : "Pending"),
      followUpDate: lead.followUpDate ? lead.followUpDate.split("T")[0] : "",
      notes: lead.notes || "",
    });
    setSelectedLead(lead);
    setIsEditDialogOpen(true);
  };

  const handleUpdateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;

    try {
      await updateLead.mutateAsync({
        id: selectedLead._id,
        data: formData,
      });
      setIsEditDialogOpen(false);
      setSelectedLead(null);
      resetForm();
    } catch (error: any) {}
  };

  const handleDeleteLead = async () => {
    if (!leadToDelete) return;
    try {
      await deleteLead.mutateAsync(leadToDelete._id);
      setLeadToDelete(null);
    } catch (error: any) {}
  };

  const resetForm = () => {
    setFormData({
      leadName: "",
      email: "",
      contactNumber: "",
      address: "",
      source: "",
      status: "New",
      interestStatus: "Pending",
      followUpDate: "",
      notes: "",
    });
    setSelectedLead(null);
  };

  // Open Follow-up Dialog
  const openFollowUpDialog = (lead: any) => {
    setFollowUpLead(lead);
    setFollowUpForm({
      conductedByName: user?.name || (isAdmin ? "Admin" : "Employee"),
      conductedById: user?.id || "",
      followUpDate: new Date().toISOString().split("T")[0],
      notes: "",
      interestStatus: lead.interestStatus || "Interested",
      nextFollowUpDate: lead.followUpDate ? lead.followUpDate.split("T")[0] : "",
    });
  };

  // Save Follow-up Session
  const handleSaveFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!followUpLead) return;

    try {
      await addFollowUpMutation.mutateAsync({
        id: followUpLead._id,
        data: followUpForm,
      });
      // Update local lead in dialog
      const updatedLead = leads.find((l: any) => l._id === followUpLead._id);
      if (updatedLead) {
        setFollowUpLead(updatedLead);
      }
      setFollowUpForm({
        ...followUpForm,
        notes: "",
        nextFollowUpDate: "",
      });
    } catch (error) {}
  };

  // Quick Interest Change
  const handleInterestChange = async (lead: any, newInterest: string) => {
    try {
      const newStatus =
        newInterest === "Interested" && lead.status !== "Quotation Requested" && lead.status !== "Quotation Approved"
          ? "Interested"
          : newInterest === "Not Interested"
          ? "Not Interested"
          : lead.status;

      await updateLead.mutateAsync({
        id: lead._id,
        data: {
          interestStatus: newInterest,
          status: newStatus,
        },
      });
    } catch (error) {}
  };

  // Submit Quotation Request
  const handleSubmitQuotationRequest = async () => {
    if (!quotationRequestLead) return;
    try {
      await requestQuotationMutation.mutateAsync({
        id: quotationRequestLead._id,
        notes: quotationRequestNotes,
      });
      setQuotationRequestLead(null);
      setQuotationRequestNotes("");
    } catch (error) {}
  };

  // Admin Approve Quotation
  const handleApproveQuotation = async (leadId: string) => {
    try {
      await approveQuotationMutation.mutateAsync(leadId);
    } catch (error) {}
  };

  // Admin Reject Quotation
  const handleRejectQuotation = async () => {
    if (!rejectLead) return;
    try {
      await rejectQuotationMutation.mutateAsync({
        id: rejectLead._id,
        reason: rejectionReason,
      });
      setRejectLead(null);
      setRejectionReason("");
    } catch (error) {}
  };

  const getInterestBadge = (interest: string) => {
    switch (interest) {
      case "Interested":
        return (
          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-semibold gap-1">
            <ThumbsUp className="w-3 h-3" /> Interested
          </Badge>
        );
      case "Not Interested":
        return (
          <Badge variant="outline" className="bg-rose-500/10 text-rose-500 border-rose-500/20 font-semibold gap-1">
            <ThumbsDown className="w-3 h-3" /> Not Interested
          </Badge>
        );
      case "Under Consideration":
        return (
          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-semibold gap-1">
            <HelpCircle className="w-3 h-3" /> Considering
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="text-muted-foreground text-[10px]">
            Pending
          </Badge>
        );
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Leads" subtitle="Error loading leads" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load leads. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  // Active lead being viewed in follow-up dialog
  const activeFollowUpLead = followUpLead
    ? leads.find((l: any) => l._id === followUpLead._id) || followUpLead
    : null;

  return (
    <div>
      <PageHeader
        title="Leads Management"
        subtitle={`${leads.length} potential clients • Multi-session follow-up logs, interest tracking, and quotation approvals`}
        actions={
          <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Add Lead
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Search & Quick Filter Tabs */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search leads by name, email, phone, or caller name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Button
              variant={filterTab === "all" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs rounded-full"
              onClick={() => setFilterTab("all")}
            >
              All Leads ({leads.length})
            </Button>
            <Button
              variant={filterTab === "interested" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs rounded-full gap-1"
              onClick={() => setFilterTab("interested")}
            >
              <ThumbsUp className="w-3 h-3 text-emerald-500" />
              Interested
            </Button>
            <Button
              variant={filterTab === "quotation_requested" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs rounded-full gap-1 border-amber-500/30"
              onClick={() => setFilterTab("quotation_requested")}
            >
              <Clock className="w-3 h-3 text-amber-500" />
              Quotation Requested
            </Button>
            <Button
              variant={filterTab === "quotation_approved" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs rounded-full gap-1 border-emerald-500/30"
              onClick={() => setFilterTab("quotation_approved")}
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              Quotation Approved
            </Button>
            <Button
              variant={filterTab === "followup_due" ? "default" : "outline"}
              size="sm"
              className="h-8 text-xs rounded-full gap-1"
              onClick={() => setFilterTab("followup_due")}
            >
              <Calendar className="w-3 h-3 text-rose-500" />
              Follow-up Due
            </Button>
          </div>
        </div>

        {/* Leads Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No leads match your filter</h3>
            <p className="text-sm text-muted-foreground mb-6">Try adjusting your search query or status filter.</p>
            <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Add Lead
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Lead Name & Source</TableHead>
                    <TableHead className="font-bold py-4">Contact Info</TableHead>
                    <TableHead className="font-bold py-4">Interest Level</TableHead>
                    <TableHead className="font-bold py-4 min-w-[200px]">Follow-Up & Caller History</TableHead>
                    <TableHead className="font-bold py-4">Quotation Workflow</TableHead>
                    <TableHead className="font-bold py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedLeads.map((lead: any) => {
                    const isInterested = lead.interestStatus === "Interested";
                    const isQuotationRequested =
                      lead.quotationRequest?.status === "Requested" || lead.status === "Quotation Requested";
                    const isQuotationApproved =
                      lead.quotationRequest?.status === "Approved" || lead.status === "Quotation Approved";
                    const isQuotationRejected = lead.quotationRequest?.status === "Rejected";

                    const followUpsCount = Array.isArray(lead.followUps) ? lead.followUps.length : 0;
                    const lastPerson =
                      lead.lastFollowUp?.conductedByName ||
                      (followUpsCount > 0 ? lead.followUps[0]?.conductedBy?.name : "");

                    const nextFDate = lead.followUpDate ? lead.followUpDate.split("T")[0] : null;
                    const isDueToday = nextFDate === todayStr;
                    const isOverdue = nextFDate && nextFDate < todayStr;

                    return (
                      <TableRow key={lead._id} className="group hover:bg-muted/30 transition-colors">
                        <TableCell className="font-medium py-3.5 tracking-tight">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              {lead.leadId && (
                                <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                                  {lead.leadId}
                                </span>
                              )}
                              <span className="font-bold text-foreground text-sm">{lead.leadName}</span>
                            </div>
                            {lead.source && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                                <span className="opacity-70">Source:</span> {lead.source}
                              </p>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-sm py-3.5">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                              {lead.email ? (
                                <a href={`mailto:${lead.email}`} className="hover:underline text-foreground">
                                  {lead.email}
                                </a>
                              ) : (
                                <span className="text-muted-foreground/60 italic">No email</span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-xs">
                              <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                              <a href={`tel:${lead.contactNumber}`} className="hover:underline text-muted-foreground">
                                {lead.contactNumber}
                              </a>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          <Select
                            value={lead.interestStatus || "Pending"}
                            onValueChange={(val) => handleInterestChange(lead, val)}
                          >
                            <SelectTrigger className="h-8 border-none bg-transparent hover:bg-muted/50 p-0 w-auto gap-2">
                              {getInterestBadge(lead.interestStatus || "Pending")}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Interested">
                                <span className="flex items-center gap-1.5 text-emerald-500 font-semibold">
                                  <ThumbsUp className="w-3.5 h-3.5" /> Interested
                                </span>
                              </SelectItem>
                              <SelectItem value="Under Consideration">
                                <span className="flex items-center gap-1.5 text-amber-500 font-semibold">
                                  <HelpCircle className="w-3.5 h-3.5" /> Under Consideration
                                </span>
                              </SelectItem>
                              <SelectItem value="Not Interested">
                                <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                                  <ThumbsDown className="w-3.5 h-3.5" /> Not Interested
                                </span>
                              </SelectItem>
                              <SelectItem value="Pending">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                  Pending Contact
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {/* MULTIPLE FOLLOW-UPS & WHO CONDUCTED CELL */}
                        <TableCell className="py-3.5">
                          <div className="space-y-1.5">
                            {lead.followUpDate ? (
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
                                <span className="text-xs font-semibold text-foreground">
                                  Next: {formatDate(lead.followUpDate)}
                                </span>
                                {isDueToday && (
                                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 text-[9px] px-1.5 py-0 h-4 font-bold">
                                    Due Today
                                  </Badge>
                                )}
                                {isOverdue && (
                                  <Badge className="bg-rose-500/10 text-rose-500 border-rose-500/20 text-[9px] px-1.5 py-0 h-4 font-bold">
                                    Overdue
                                  </Badge>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No date scheduled</span>
                            )}

                            {lastPerson && (
                              <p className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                                <UserIcon className="w-3 h-3 text-primary" />
                                Last by: <span className="text-foreground font-semibold truncate max-w-[140px]">{lastPerson}</span>
                              </p>
                            )}

                            <Button
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] font-bold border-primary/30 text-primary hover:bg-primary/10 gap-1 rounded-md"
                              onClick={() => openFollowUpDialog(lead)}
                            >
                              <History className="w-3 h-3" />
                              {followUpsCount > 0
                                ? `${followUpsCount} Follow-up${followUpsCount > 1 ? "s" : ""} logged`
                                : "+ Log Follow-up"}
                            </Button>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5">
                          {isQuotationApproved ? (
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 gap-1 text-[11px] font-bold">
                                <CheckCircle2 className="w-3 h-3" /> Approved
                              </Badge>
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2 rounded-lg shadow-sm"
                                onClick={() => navigate(`/quotations?leadId=${lead._id}`)}
                                title="Create quotation for approved lead"
                              >
                                <FileText className="w-3 h-3 mr-1" /> Make Quotation
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 font-bold px-2 rounded-lg gap-1"
                                onClick={() => setLeadToConvert(lead)}
                                title="Convert this lead to a paying Customer (will remove from leads)"
                              >
                                <UserCheck className="w-3 h-3" /> Convert to Customer
                              </Button>
                            </div>
                          ) : isQuotationRequested ? (
                            <div className="flex items-center gap-2">
                              <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/30 gap-1 text-[11px] font-bold">
                                <Clock className="w-3 h-3" /> Requested
                              </Badge>

                              {isAdmin ? (
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs text-emerald-600 hover:bg-emerald-500/10 border-emerald-500/30 font-bold"
                                    onClick={() => handleApproveQuotation(lead._id)}
                                    title="Approve quotation request"
                                  >
                                    <Check className="w-3.5 h-3.5 mr-1" /> Approve
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-500/10 border-rose-500/30"
                                    onClick={() => setRejectLead(lead)}
                                    title="Reject quotation request"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </div>
                              ) : (
                                <span className="text-[10px] text-muted-foreground italic">
                                  Waiting for admin approval
                                </span>
                              )}
                            </div>
                          ) : isInterested ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-semibold border-primary/30 text-primary hover:bg-primary/10 gap-1 rounded-lg"
                              onClick={() => {
                                setQuotationRequestLead(lead);
                                setQuotationRequestNotes(lead.notes || "");
                              }}
                            >
                              <Send className="w-3 h-3" /> Request Quotation
                            </Button>
                          ) : isQuotationRejected ? (
                            <Badge variant="outline" className="text-rose-500 border-rose-500/20 text-[10px] gap-1">
                              <XCircle className="w-3 h-3" /> Request Rejected
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground italic">
                              Mark "Interested" to request quote
                            </span>
                          )}
                        </TableCell>

                        <TableCell className="text-right py-3.5">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                              onClick={() => setLeadToConvert(lead)}
                              title="Convert to Customer (removes from leads)"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-primary"
                              onClick={() => handleEditClick(lead)}
                              title="Edit Lead Details"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {isAdmin && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                onClick={() => setLeadToDelete(lead)}
                                title="Delete Lead"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sortedLeads.length}
              itemsPerPage={itemsPerPage}
              itemName="leads"
            />
          </div>
        )}
      </div>

      {/* MULTIPLE FOLLOW-UP HISTORY & LOG DIALOG */}
      <Dialog open={!!activeFollowUpLead} onOpenChange={(open) => !open && setFollowUpLead(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" /> Follow-Up History & New Log
                </DialogTitle>
                <DialogDescription>
                  Record multi-session follow-ups, who conducted each call, client interest, and discussion notes.
                </DialogDescription>
              </div>
              <Badge variant="outline" className="text-xs">
                {activeFollowUpLead?.leadId && (
                  <span className="mr-1.5 font-mono font-bold text-primary">
                    {activeFollowUpLead.leadId}
                  </span>
                )}
                {activeFollowUpLead?.leadName}
              </Badge>
            </div>
          </DialogHeader>

          {activeFollowUpLead && (
            <div className="space-y-6 mt-2">
              {/* Lead Info Banner */}
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground">Contact:</span>{" "}
                  <span className="font-semibold text-foreground">{activeFollowUpLead.contactNumber}</span>
                  <span className="mx-2">•</span>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-semibold text-foreground">{activeFollowUpLead.email || "No email"}</span>
                </div>
                <div>{getInterestBadge(activeFollowUpLead.interestStatus || "Pending")}</div>
              </div>

              {/* FORM TO ADD A NEW FOLLOW-UP SESSION */}
              <form onSubmit={handleSaveFollowUp} className="p-4 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary" /> Log New Follow-Up Session
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* WHO CONDUCTED THE FOLLOW-UP */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <UserIcon className="w-3.5 h-3.5 text-primary" /> Who Conducted Follow-Up? *
                    </Label>
                    {isAdmin ? (
                      <Select
                        value={followUpForm.conductedByName}
                        onValueChange={(val) => {
                          const matched = activeEmployees.find((e: any) => e.name === val);
                          setFollowUpForm({
                            ...followUpForm,
                            conductedByName: val,
                            conductedById: matched ? matched.id : user?.id || "",
                          });
                        }}
                      >
                        <SelectTrigger className="h-9 bg-card border-border">
                          <SelectValue placeholder="Select caller / employee" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={user?.name || "Admin"}>
                            ⭐ {user?.name || "Admin"} (Current User)
                          </SelectItem>
                          {activeEmployees.map((emp: any) => (
                            <SelectItem key={emp.id} value={emp.name}>
                              👤 {emp.name} ({emp.jobRole || emp.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input
                        value={followUpForm.conductedByName}
                        readOnly
                        className="h-9 bg-card/70 font-medium"
                      />
                    )}
                  </div>

                  {/* DATE OF THIS FOLLOW-UP */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Follow-Up Date</Label>
                    <DatePicker
                      date={followUpForm.followUpDate}
                      setDate={(d) => setFollowUpForm({ ...followUpForm, followUpDate: d })}
                      placeholder="Today"
                    />
                  </div>
                </div>

                {/* DISCUSSION NOTES */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Discussion / Conversation Summary *</Label>
                  <Textarea
                    value={followUpForm.notes}
                    onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                    placeholder="e.g. Called client, discussed project features, requested quotation for e-commerce site..."
                    className="h-20 bg-card border-border"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* UPDATED INTEREST STATUS */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Client Interest Status</Label>
                    <Select
                      value={followUpForm.interestStatus}
                      onValueChange={(v) => setFollowUpForm({ ...followUpForm, interestStatus: v })}
                    >
                      <SelectTrigger className="h-9 bg-card border-border">
                        <SelectValue placeholder="Select interest" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Interested">
                          <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                            <ThumbsUp className="w-3.5 h-3.5" /> Interested
                          </span>
                        </SelectItem>
                        <SelectItem value="Under Consideration">
                          <span className="text-amber-500 font-semibold flex items-center gap-1.5">
                            <HelpCircle className="w-3.5 h-3.5" /> Under Consideration
                          </span>
                        </SelectItem>
                        <SelectItem value="Not Interested">
                          <span className="text-rose-500 font-semibold flex items-center gap-1.5">
                            <ThumbsDown className="w-3.5 h-3.5" /> Not Interested
                          </span>
                        </SelectItem>
                        <SelectItem value="Pending">Pending Decision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* NEXT SCHEDULED FOLLOW-UP */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">Next Follow-Up Date (Optional)</Label>
                    <DatePicker
                      date={followUpForm.nextFollowUpDate}
                      setDate={(d) => setFollowUpForm({ ...followUpForm, nextFollowUpDate: d })}
                      placeholder="Schedule next call"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <Button
                    type="submit"
                    disabled={addFollowUpMutation.isPending}
                    className="bg-primary text-primary-foreground font-semibold px-5"
                  >
                    <Plus className="w-4 h-4 mr-1.5" />
                    {addFollowUpMutation.isPending ? "Saving Log..." : "Save Follow-Up"}
                  </Button>
                </div>
              </form>

              {/* TIMELINE OF PAST FOLLOW-UPS */}
              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <History className="w-4 h-4 text-muted-foreground" />
                  Past Follow-Up Sessions ({activeFollowUpLead.followUps?.length || 0})
                </h4>

                {(!activeFollowUpLead.followUps || activeFollowUpLead.followUps.length === 0) ? (
                  <div className="p-6 rounded-xl border border-dashed border-border text-center text-xs text-muted-foreground">
                    No previous follow-up history recorded yet. Use the form above to log your first call or meeting!
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                    {activeFollowUpLead.followUps.map((fu: any, idx: number) => {
                      const callerName = fu.conductedBy?.name || fu.conductedByName || "Team Member";
                      const callerRole = fu.conductedBy?.role || "";

                      return (
                        <div key={idx} className="p-3.5 rounded-xl border border-border/70 bg-card/60 space-y-2">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px]">
                                {callerName[0]}
                              </div>
                              <span className="font-bold text-foreground">{callerName}</span>
                              {callerRole && (
                                <Badge variant="secondary" className="text-[9px] uppercase px-1 py-0 h-4">
                                  {callerRole}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {getInterestBadge(fu.interestStatus || "Pending")}
                              <span className="text-[11px] text-muted-foreground">
                                {formatDate(fu.followUpDate || fu.createdAt)}
                              </span>
                            </div>
                          </div>

                          <p className="text-xs text-foreground/90 pl-8 leading-relaxed whitespace-pre-wrap">
                            {fu.notes || "No discussion notes recorded."}
                          </p>

                          {fu.nextFollowUpDate && (
                            <p className="text-[10px] text-primary font-medium pl-8 flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              Scheduled next follow-up: {formatDate(fu.nextFollowUpDate)}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setFollowUpLead(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* CREATE LEAD DIALOG */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Lead</DialogTitle>
            <DialogDescription>
              Record a potential client's contact information, interest level, and follow-up timeline.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateLead} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="leadName">Lead Name *</Label>
                <Input
                  id="leadName"
                  value={formData.leadName}
                  onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                  placeholder="e.g. John Doe / TechCorp"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number *</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  placeholder="e.g. +91 9876543210"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="lead@example.com (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="source">Lead Source</Label>
                <Input
                  id="source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                  placeholder="Website, Referral, LinkedIn..."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="interestStatus">Interest Level *</Label>
                <Select
                  value={formData.interestStatus}
                  onValueChange={(v) => {
                    const newStatus = v === "Interested" ? "Interested" : v === "Not Interested" ? "Not Interested" : "New";
                    setFormData({ ...formData, interestStatus: v, status: newStatus });
                  }}
                >
                  <SelectTrigger id="interestStatus">
                    <SelectValue placeholder="Select interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interested">
                      <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> Interested
                      </span>
                    </SelectItem>
                    <SelectItem value="Under Consideration">
                      <span className="text-amber-500 font-semibold flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Under Consideration
                      </span>
                    </SelectItem>
                    <SelectItem value="Not Interested">
                      <span className="text-rose-500 font-semibold flex items-center gap-1.5">
                        <ThumbsDown className="w-3.5 h-3.5" /> Not Interested
                      </span>
                    </SelectItem>
                    <SelectItem value="Pending">
                      <span className="text-muted-foreground flex items-center gap-1.5">
                        Pending Initial Contact
                      </span>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Follow-Up Date</Label>
                <DatePicker
                  date={formData.followUpDate}
                  setDate={(dateStr) => setFormData({ ...formData, followUpDate: dateStr })}
                  placeholder="Pick follow-up date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address / Location</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes & Scope Details</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Budget, project requirements, discussion points..."
                className="h-20"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createLead.isPending}>
                {createLead.isPending ? "Creating..." : "Create Lead"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* EDIT LEAD DIALOG */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Edit Lead
              {selectedLead?.leadId && (
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                  {selectedLead.leadId}
                </span>
              )}
            </DialogTitle>
            <DialogDescription>Update lead interest, follow-up timeline, and notes.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleUpdateLead} className="space-y-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-leadName">Lead Name *</Label>
                <Input
                  id="edit-leadName"
                  value={formData.leadName}
                  onChange={(e) => setFormData({ ...formData, leadName: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-contactNumber">Contact Number *</Label>
                <Input
                  id="edit-contactNumber"
                  value={formData.contactNumber}
                  onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email (Optional)</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="lead@example.com (optional)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-source">Source</Label>
                <Input
                  id="edit-source"
                  value={formData.source}
                  onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-interestStatus">Interest Level *</Label>
                <Select
                  value={formData.interestStatus}
                  onValueChange={(v) => {
                    setFormData({ ...formData, interestStatus: v });
                  }}
                >
                  <SelectTrigger id="edit-interestStatus">
                    <SelectValue placeholder="Select interest" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Interested">
                      <span className="text-emerald-500 font-semibold flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> Interested
                      </span>
                    </SelectItem>
                    <SelectItem value="Under Consideration">
                      <span className="text-amber-500 font-semibold flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5" /> Under Consideration
                      </span>
                    </SelectItem>
                    <SelectItem value="Not Interested">
                      <span className="text-rose-500 font-semibold flex items-center gap-1.5">
                        <ThumbsDown className="w-3.5 h-3.5" /> Not Interested
                      </span>
                    </SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Follow-Up Date</Label>
                <DatePicker
                  date={formData.followUpDate}
                  setDate={(dateStr) => setFormData({ ...formData, followUpDate: dateStr })}
                  placeholder="Set follow-up date"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address / Location</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-notes">Notes & Scope Details</Label>
              <Textarea
                id="edit-notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="h-20"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateLead.isPending}>
                {updateLead.isPending ? "Updating..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* REQUEST QUOTATION MODAL */}
      <Dialog open={!!quotationRequestLead} onOpenChange={(open) => !open && setQuotationRequestLead(null)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-5 h-5 text-primary" /> Request Quotation from Admin
            </DialogTitle>
            <DialogDescription>
              Submit a request for <span className="font-bold text-foreground">{quotationRequestLead?.leadName}</span>.
              The Admin will review and approve it before the official quotation can be prepared.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-2">
            <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 text-xs space-y-1">
              <p className="flex items-center gap-2">
                <span className="text-muted-foreground">Lead:</span>{" "}
                {quotationRequestLead?.leadId && (
                  <span className="font-mono text-[11px] font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                    {quotationRequestLead.leadId}
                  </span>
                )}
                <span className="font-bold text-foreground">{quotationRequestLead?.leadName}</span>
              </p>
              <p>
                <span className="text-muted-foreground">Email:</span> {quotationRequestLead?.email || "N/A"}
              </p>
              <p>
                <span className="text-muted-foreground">Contact:</span> {quotationRequestLead?.contactNumber}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="req-notes">Requirements & Scope Details *</Label>
              <Textarea
                id="req-notes"
                value={quotationRequestNotes}
                onChange={(e) => setQuotationRequestNotes(e.target.value)}
                placeholder="Mention what the client requested (e.g. Website development, CRM software, budget range, timeline)..."
                className="h-28"
                required
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setQuotationRequestLead(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitQuotationRequest}
              disabled={requestQuotationMutation.isPending}
              className="bg-primary text-primary-foreground font-semibold gap-1.5"
            >
              <Send className="w-4 h-4" />
              {requestQuotationMutation.isPending ? "Submitting..." : "Send Request to Admin"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADMIN REJECT QUOTATION DIALOG */}
      <Dialog open={!!rejectLead} onOpenChange={(open) => !open && setRejectLead(null)}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-500">
              <XCircle className="w-5 h-5" /> Reject Quotation Request
            </DialogTitle>
            <DialogDescription>
              Reject quotation request for <span className="font-bold text-foreground">{rejectLead?.leadName}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 mt-2">
            <Label htmlFor="reject-reason">Reason for rejection (Optional)</Label>
            <Textarea
              id="reject-reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Budget below minimum project threshold, need more requirements..."
              className="h-24"
            />
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setRejectLead(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleRejectQuotation}
              disabled={rejectQuotationMutation.isPending}
            >
              {rejectQuotationMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION */}
      <AlertDialog open={!!leadToDelete} onOpenChange={() => setLeadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the lead record for{" "}
              <span className="font-semibold text-foreground">{leadToDelete?.leadName}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteLead} className="bg-destructive text-destructive-foreground">
              Delete Lead
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CONVERT TO CUSTOMER CONFIRMATION */}
      <AlertDialog open={!!leadToConvert} onOpenChange={(open) => !open && setLeadToConvert(null)}>
        <AlertDialogContent className="sm:max-w-[460px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-foreground">
              <UserCheck className="w-5 h-5 text-emerald-600" /> Convert Lead to Customer
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2 text-sm text-muted-foreground pt-1">
              <p>
                Are you sure you want to convert <strong className="text-foreground">{leadToConvert?.leadName}</strong> into an official Customer?
              </p>
              <div className="p-3 rounded-xl bg-muted/50 border border-border/50 text-xs space-y-1 font-sans">
                <p><span className="text-muted-foreground">Contact:</span> {leadToConvert?.contactNumber}</p>
                <p><span className="text-muted-foreground">Email:</span> {leadToConvert?.email || "Not provided"}</p>
                <p><span className="text-muted-foreground">Location:</span> {leadToConvert?.address || "N/A"}</p>
              </div>
              <p className="text-xs text-amber-600 font-semibold bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                Notice: Once converted, a new Customer profile (with auto-assigned unique CUST ID) will be created, and this entry will be removed from your Leads list.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-2">
            <AlertDialogCancel disabled={convertToCustomerMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmConvert}
              disabled={convertToCustomerMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {convertToCustomerMutation.isPending ? "Converting..." : "Confirm & Convert"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Leads;
