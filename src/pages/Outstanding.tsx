import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { TablePagination } from "@/components/TablePagination";
import { useInvoices, useRecordPayment } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { formatDate } from "@/utils/dateUtils";
import { toast } from "sonner";
import {
  AlertCircle,
  Receipt,
  FolderKanban,
  Users,
  Search,
  Eye,
  FileDown,
  CheckCircle2,
  Plus,
  Mail,
  Phone,
  ArrowUpRight,
  ExternalLink,
  Clock,
  CircleDollarSign,
  Filter,
  CheckCheck,
  CreditCard,
  Banknote,
  Calendar,
  History,
  TrendingDown,
  Building2,
} from "lucide-react";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export default function Outstanding() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"all" | "invoices" | "clients" | "projects">("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"due-desc" | "due-asc" | "date-desc" | "date-asc">("due-desc");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals state
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isViewInvoiceOpen, setIsViewInvoiceOpen] = useState(false);

  // Partial Payment Modal state
  const [paymentInvoice, setPaymentInvoice] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("partial");
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  // Fetch data
  const { data: invoices = [], isLoading: isLoadingInvoices } = useInvoices();
  const { data: clients = [], isLoading: isLoadingClients } = useClients();
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const recordPaymentMutation = useRecordPayment();

  const isLoading = isLoadingInvoices || isLoadingClients || isLoadingProjects;

  // Helper to calculate exact remaining due for an invoice
  const getInvoiceDue = (inv: any) => {
    if (!inv) return 0;
    const status = (inv.status || "").toLowerCase();
    if (status === "paid") return 0;

    const totalObligation = Number(inv.grandTotal) || (Number(inv.amount) || 0) + (Number(inv.previousDue) || 0);
    const paidAmt = Number(inv.paidAmount) || 0;

    if (inv.remainingDue !== undefined) {
      return Number(inv.remainingDue);
    }
    return Math.max(0, totalObligation - paidAmt);
  };

  // 1. INVOICES WHICH HAVE DUE
  // An invoice has due if status is NOT 'paid' and remaining due > 0
  const dueInvoices = useMemo(() => {
    return invoices.filter((inv: any) => {
      const status = (inv.status || "").toLowerCase();
      if (status === "paid") return false;
      const due = getInvoiceDue(inv);
      return due > 0;
    });
  }, [invoices]);

  // 2. PROJECTS WITH UNBILLED / REMAINING DUES
  const dueProjects = useMemo(() => {
    return projects.filter((p: any) => {
      const due = Number(p.dueAmount || 0);
      return due > 0;
    });
  }, [projects]);

  // 3. CLIENT RECEIVABLES SUMMARY
  const clientReceivables = useMemo(() => {
    return clients.map((client: any) => {
      const clientInvoicesDue = dueInvoices.filter((inv: any) => {
        const invClientId = inv.clientId || (typeof inv.clientId === "object" ? inv.clientId?._id : "");
        const matchCode = inv.customerCode && client.clientId && inv.customerCode === client.clientId;
        return invClientId === client.id || matchCode || (inv.clientName && inv.clientName.toLowerCase() === client.name.toLowerCase());
      });

      const totalInvoiceDueAmt = clientInvoicesDue.reduce(
        (sum: number, inv: any) => sum + getInvoiceDue(inv),
        0
      );

      const clientProjectsDue = dueProjects.filter((p: any) => {
        const pClientId = p.clientId || (typeof p.client === "object" ? p.client?._id : p.client);
        return pClientId === client.id || (p.client && typeof p.client === "string" && p.client.toLowerCase() === client.name.toLowerCase());
      });

      const totalProjectDueAmt = clientProjectsDue.reduce(
        (sum: number, p: any) => sum + (Number(p.dueAmount) || 0),
        0
      );

      const totalClientOutstanding = totalInvoiceDueAmt + totalProjectDueAmt;

      return {
        ...client,
        pendingInvoicesCount: clientInvoicesDue.length,
        pendingInvoicesAmount: totalInvoiceDueAmt,
        unbilledProjectsCount: clientProjectsDue.length,
        unbilledProjectsAmount: totalProjectDueAmt,
        totalOutstanding: totalClientOutstanding,
        hasDues: totalClientOutstanding > 0,
      };
    }).filter((c: any) => c.hasDues);
  }, [clients, dueInvoices, dueProjects]);

  // 4. UNIFIED ALL OUTSTANDING ITEMS
  const allOutstandingItems = useMemo(() => {
    const items: any[] = [];

    // Add Due Invoices
    dueInvoices.forEach((inv: any) => {
      const dueAmt = getInvoiceDue(inv);
      const totalAmt = Number(inv.grandTotal) || (Number(inv.amount) || 0) + (Number(inv.previousDue) || 0);
      const paidAmt = Number(inv.paidAmount) || 0;

      items.push({
        id: `inv-${inv.id}`,
        type: "invoice",
        typeLabel: inv.status === "partial" ? "Partial Due" : "Invoice Due",
        referenceNumber: inv.number,
        clientName: inv.clientName || "Valued Client",
        customerCode: inv.customerCode || "",
        contextName: inv.projectName || "General Project",
        date: inv.date || inv.issueDate,
        totalAmount: totalAmt,
        paidAmount: paidAmt,
        previousDue: Number(inv.previousDue) || 0,
        dueAmount: dueAmt,
        status: inv.status || "pending",
        raw: inv,
      });
    });

    // Add Project Contract Dues
    dueProjects.forEach((proj: any) => {
      const dueAmt = Number(proj.dueAmount || 0);
      const clientObj = typeof proj.client === "object" ? proj.client : null;
      const clientName = clientObj?.clientName || proj.client || "Client";
      const customerCode = clientObj?.clientId || clientObj?.referenceNo || "";

      items.push({
        id: `proj-${proj.id}`,
        type: "project",
        typeLabel: "Project Due",
        referenceNumber: proj.name,
        clientName: clientName,
        customerCode: customerCode,
        contextName: `Contract: ${formatCurrency(proj.budget || 0)} (Invoiced: ${formatCurrency(proj.totalPaid || 0)})`,
        date: proj.startDate || proj.deadline,
        totalAmount: Number(proj.budget || 0),
        paidAmount: Number(proj.totalPaid || 0),
        previousDue: 0,
        dueAmount: dueAmt,
        status: proj.status || "In Progress",
        raw: proj,
      });
    });

    return items;
  }, [dueInvoices, dueProjects]);

  // Top summary KPI calculations
  const totalInvoicesDueSum = useMemo(() => {
    return dueInvoices.reduce((sum: number, inv: any) => sum + getInvoiceDue(inv), 0);
  }, [dueInvoices]);

  const totalProjectsDueSum = useMemo(() => {
    return dueProjects.reduce((sum: number, p: any) => sum + (Number(p.dueAmount) || 0), 0);
  }, [dueProjects]);

  const grandTotalOutstanding = totalInvoicesDueSum + totalProjectsDueSum;

  // Filter & Search Logic
  const filteredItems = useMemo(() => {
    const s = search.toLowerCase().trim();

    if (activeTab === "all") {
      let list = allOutstandingItems.filter((item: any) => {
        if (!s) return true;
        return (
          item.clientName?.toLowerCase().includes(s) ||
          item.customerCode?.toLowerCase().includes(s) ||
          item.referenceNumber?.toLowerCase().includes(s) ||
          item.contextName?.toLowerCase().includes(s)
        );
      });

      return list.sort((a, b) => {
        if (sortBy === "due-desc") return b.dueAmount - a.dueAmount;
        if (sortBy === "due-asc") return a.dueAmount - b.dueAmount;
        if (sortBy === "date-desc") return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        if (sortBy === "date-asc") return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        return 0;
      });
    }

    if (activeTab === "invoices") {
      let list = dueInvoices.filter((inv: any) => {
        if (!s) return true;
        return (
          inv.clientName?.toLowerCase().includes(s) ||
          inv.customerCode?.toLowerCase().includes(s) ||
          inv.number?.toLowerCase().includes(s) ||
          inv.projectName?.toLowerCase().includes(s)
        );
      });

      return list.sort((a: any, b: any) => {
        const dueA = getInvoiceDue(a);
        const dueB = getInvoiceDue(b);
        if (sortBy === "due-desc") return dueB - dueA;
        if (sortBy === "due-asc") return dueA - dueB;
        if (sortBy === "date-desc") return new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime();
        if (sortBy === "date-asc") return new Date(a.date || 0).getTime() - new Date(b.date || 0).getTime();
        return 0;
      });
    }

    if (activeTab === "clients") {
      let list = clientReceivables.filter((c: any) => {
        if (!s) return true;
        return (
          c.name?.toLowerCase().includes(s) ||
          c.clientId?.toLowerCase().includes(s) ||
          c.email?.toLowerCase().includes(s) ||
          c.phone?.includes(s)
        );
      });

      return list.sort((a: any, b: any) => {
        if (sortBy === "due-desc") return b.totalOutstanding - a.totalOutstanding;
        if (sortBy === "due-asc") return a.totalOutstanding - b.totalOutstanding;
        return b.totalOutstanding - a.totalOutstanding;
      });
    }

    if (activeTab === "projects") {
      let list = dueProjects.filter((p: any) => {
        const clientName = typeof p.client === "object" ? p.client?.clientName : p.client;
        if (!s) return true;
        return (
          p.name?.toLowerCase().includes(s) ||
          (clientName && clientName.toLowerCase().includes(s))
        );
      });

      return list.sort((a: any, b: any) => {
        if (sortBy === "due-desc") return Number(b.dueAmount || 0) - Number(a.dueAmount || 0);
        if (sortBy === "due-asc") return Number(a.dueAmount || 0) - Number(b.dueAmount || 0);
        return Number(b.dueAmount || 0) - Number(a.dueAmount || 0);
      });
    }

    return [];
  }, [activeTab, search, sortBy, allOutstandingItems, dueInvoices, clientReceivables, dueProjects]);

  // Reset page when tab or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, sortBy]);

  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  // Open the Payment Modal (Full or Partial)
  const handleOpenPaymentModal = (invoice: any) => {
    const remaining = getInvoiceDue(invoice);
    setPaymentInvoice(invoice);
    setPaymentMode("partial");
    setPaymentAmountInput(remaining.toString());
    setPaymentMethod(invoice.method || "Bank Transfer");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentNotes("");
    setIsPaymentModalOpen(true);
  };

  // Submit payment (Partial or Full)
  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;

    const amount = Number(paymentAmountInput);
    const maxDue = getInvoiceDue(paymentInvoice);

    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid payment amount greater than 0");
      return;
    }

    if (amount > maxDue) {
      toast.error(`Payment amount (${formatCurrency(amount)}) cannot exceed remaining due (${formatCurrency(maxDue)})`);
      return;
    }

    try {
      await recordPaymentMutation.mutateAsync({
        id: paymentInvoice.id || paymentInvoice._id,
        data: {
          amount,
          method: paymentMethod,
          date: paymentDate,
          notes: paymentNotes || (amount >= maxDue ? "Full settlement" : "Partial installment"),
        },
      });

      setIsPaymentModalOpen(false);
      setPaymentInvoice(null);
      if (isViewInvoiceOpen) {
        setIsViewInvoiceOpen(false);
      }
    } catch (err: any) {
      // Error is handled by mutation onError toast
    }
  };

  // Quick percentage chip helper
  const handleSetQuickPercentage = (percent: number) => {
    if (!paymentInvoice) return;
    const maxDue = getInvoiceDue(paymentInvoice);
    const calculated = Math.round((maxDue * percent) / 100);
    setPaymentAmountInput(calculated.toString());
  };

  const parsedPaymentAmount = Number(paymentAmountInput) || 0;
  const currentInvoiceMaxDue = paymentInvoice ? getInvoiceDue(paymentInvoice) : 0;
  const remainingAfterPayment = Math.max(0, currentInvoiceMaxDue - parsedPaymentAmount);
  const willBeFullyPaid = parsedPaymentAmount >= currentInvoiceMaxDue;

  return (
    <div className="space-y-6 pb-12">
      {/* PAGE HEADER */}
      <PageHeader
        title="Outstanding Dues"
        subtitle="Consolidated receivables, partial payments, and pending contract balances"
        actions={
          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/clients")}
              className="gap-1.5 hidden sm:flex text-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span>All Clients</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate("/invoices?create=true")}
              className="gap-1.5 shadow-sm text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              <span>Create Invoice</span>
            </Button>
          </div>
        }
      />

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-br from-rose-500/10 via-card to-card p-5 shadow-sm transition-all hover:border-rose-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
              Total Outstanding
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {isLoading ? <Skeleton className="h-9 w-32" /> : formatCurrency(grandTotalOutstanding)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <span>Invoices Due + Unbilled Projects</span>
            </p>
          </div>
        </div>

        {/* Invoices Which Have Due */}
        <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-card to-card p-5 shadow-sm transition-all hover:border-amber-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-500">
              Due Invoices
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Receipt className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {isLoading ? <Skeleton className="h-9 w-28" /> : formatCurrency(totalInvoicesDueSum)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="font-semibold text-amber-500">{dueInvoices.length}</span>
              <span>invoices with pending balance</span>
            </p>
          </div>
        </div>

        {/* Project Contract Dues */}
        <div className="relative overflow-hidden rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 via-card to-card p-5 shadow-sm transition-all hover:border-blue-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-500">
              Project Dues
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
              <FolderKanban className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {isLoading ? <Skeleton className="h-9 w-28" /> : formatCurrency(totalProjectsDueSum)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1.5">
              <span className="font-semibold text-blue-500">{dueProjects.length}</span>
              <span>projects with unbilled balances</span>
            </p>
          </div>
        </div>

        {/* Clients with Dues */}
        <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-card p-5 shadow-sm transition-all hover:border-primary/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Debtor Clients
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-foreground font-mono">
              {isLoading ? <Skeleton className="h-9 w-20" /> : clientReceivables.length}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Client accounts with active receivables
            </p>
          </div>
        </div>
      </div>

      {/* FILTER TABS & SEARCH BAR */}
      <div className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-border/40 pb-3">
          {/* Custom Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant={activeTab === "all" ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveTab("all")}
              className="gap-2 text-xs font-bold"
            >
              <span>All Outstanding</span>
              <Badge variant="outline" className={`ml-1 px-1.5 py-0 text-[10px] ${activeTab === "all" ? "bg-primary-foreground/20 text-primary-foreground border-transparent" : ""}`}>
                {allOutstandingItems.length}
              </Badge>
            </Button>

            <Button
              variant={activeTab === "invoices" ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveTab("invoices")}
              className="gap-2 text-xs font-bold"
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Due Invoices</span>
              <Badge variant="outline" className={`ml-1 px-1.5 py-0 text-[10px] ${activeTab === "invoices" ? "bg-primary-foreground/20 text-primary-foreground border-transparent" : "bg-amber-500/10 text-amber-500 border-amber-500/20"}`}>
                {dueInvoices.length}
              </Badge>
            </Button>

            <Button
              variant={activeTab === "clients" ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveTab("clients")}
              className="gap-2 text-xs font-bold"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Client Receivables</span>
              <Badge variant="outline" className={`ml-1 px-1.5 py-0 text-[10px] ${activeTab === "clients" ? "bg-primary-foreground/20 text-primary-foreground border-transparent" : ""}`}>
                {clientReceivables.length}
              </Badge>
            </Button>

            <Button
              variant={activeTab === "projects" ? "default" : "secondary"}
              size="sm"
              onClick={() => setActiveTab("projects")}
              className="gap-2 text-xs font-bold"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Project Dues</span>
              <Badge variant="outline" className={`ml-1 px-1.5 py-0 text-[10px] ${activeTab === "projects" ? "bg-primary-foreground/20 text-primary-foreground border-transparent" : ""}`}>
                {dueProjects.length}
              </Badge>
            </Button>
          </div>

          {/* Search & Sort Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative min-w-[260px] lg:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by client, CUST-ID, invoice, project..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9 text-xs"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-full sm:w-[170px] h-9 text-xs gap-1">
                <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1" />
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-desc">Highest Due First</SelectItem>
                <SelectItem value="due-asc">Lowest Due First</SelectItem>
                <SelectItem value="date-desc">Newest First</SelectItem>
                <SelectItem value="date-asc">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* TABLE CONTENT */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border/80 bg-card/40 p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-3">
            <CheckCheck className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-foreground">
            {search ? "No matching outstanding records" : "No outstanding dues found!"}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
            {search
              ? `No records found matching "${search}". Try adjusting your search keyword or clearing the filter.`
              : "All clients and projects are currently cleared with no pending invoices or unbilled dues."}
          </p>
          {search && (
            <Button variant="outline" size="sm" onClick={() => setSearch("")} className="mt-4 text-xs">
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border/70 rounded-2xl overflow-hidden shadow-sm">
          {/* TAB 1: ALL OUTSTANDING */}
          {activeTab === "all" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-bold py-3.5">Type</TableHead>
                    <TableHead className="font-bold py-3.5">Reference / ID</TableHead>
                    <TableHead className="font-bold py-3.5">Client & Customer ID</TableHead>
                    <TableHead className="font-bold py-3.5">Project / Description</TableHead>
                    <TableHead className="font-bold py-3.5">Date</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Total Obligation</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Paid So Far</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Remaining Due</TableHead>
                    <TableHead className="font-bold py-3.5">Status</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((item: any) => (
                    <TableRow key={item.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="py-3.5">
                        <Badge
                          variant="outline"
                          className={
                            item.type === "invoice"
                              ? item.status === "partial"
                                ? "bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold"
                                : "bg-rose-500/10 text-rose-500 border-rose-500/30 font-semibold"
                              : "bg-blue-500/10 text-blue-500 border-blue-500/30 font-semibold"
                          }
                        >
                          {item.type === "invoice" ? (
                            <Receipt className="w-3 h-3 mr-1" />
                          ) : (
                            <FolderKanban className="w-3 h-3 mr-1" />
                          )}
                          <span>{item.typeLabel}</span>
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 font-mono text-xs font-bold text-foreground">
                        {item.referenceNumber}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div className="flex items-center gap-1.5">
                          {item.customerCode && (
                            <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                              {item.customerCode}
                            </span>
                          )}
                          <span className="font-bold text-sm text-foreground">{item.clientName}</span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-muted-foreground max-w-[220px] truncate">
                        {item.contextName}
                      </TableCell>

                      <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(item.date)}
                      </TableCell>

                      <TableCell className="py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatCurrency(item.totalAmount)}
                      </TableCell>

                      <TableCell className="py-3.5 text-right font-mono text-xs text-emerald-500 whitespace-nowrap">
                        {item.paidAmount > 0 ? formatCurrency(item.paidAmount) : "₹0"}
                      </TableCell>

                      <TableCell className="py-3.5 text-right font-mono font-bold text-sm text-rose-500 whitespace-nowrap">
                        {formatCurrency(item.dueAmount)}
                      </TableCell>

                      <TableCell className="py-3.5">
                        <StatusBadge status={item.status} />
                      </TableCell>

                      <TableCell className="py-3.5 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          {item.type === "invoice" ? (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                onClick={() => {
                                  setSelectedInvoice(item.raw);
                                  setIsViewInvoiceOpen(true);
                                }}
                                title="View Details & Payments"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-500"
                                onClick={() => generateInvoicePDF(item.raw)}
                                title="Download PDF"
                              >
                                <FileDown className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5 shadow-sm"
                                onClick={() => handleOpenPaymentModal(item.raw)}
                                title="Record Partial or Full Payment"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay</span>
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1 px-2.5"
                              onClick={() => navigate(`/invoices?create=true&client=${item.raw?.clientId || ""}`)}
                              title="Create Invoice for this project"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Invoice</span>
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* TAB 2: DUE INVOICES */}
          {activeTab === "invoices" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-bold py-3.5">Invoice #</TableHead>
                    <TableHead className="font-bold py-3.5">Client & Customer ID</TableHead>
                    <TableHead className="font-bold py-3.5">Project(s)</TableHead>
                    <TableHead className="font-bold py-3.5">Issue Date</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Invoice Total</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Paid So Far</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Remaining Due</TableHead>
                    <TableHead className="font-bold py-3.5">Status</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((inv: any) => {
                    const grandTotal = Number(inv.grandTotal) || (Number(inv.amount) || 0) + (Number(inv.previousDue) || 0);
                    const paidAmt = Number(inv.paidAmount) || 0;
                    const dueAmt = getInvoiceDue(inv);

                    return (
                      <TableRow key={inv.id} className="group hover:bg-muted/20 transition-colors">
                        <TableCell className="py-3.5 font-mono text-xs font-bold text-foreground whitespace-nowrap">
                          {inv.number}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            {inv.customerCode && (
                              <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                                {inv.customerCode}
                              </span>
                            )}
                            <span className="font-bold text-sm text-foreground">{inv.clientName}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-muted-foreground max-w-[180px] truncate">
                          {inv.projectName || "Standard Project"}
                        </TableCell>

                        <TableCell className="py-3.5 text-xs text-muted-foreground whitespace-nowrap">
                          {formatDate(inv.date)}
                        </TableCell>

                        <TableCell className="py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {formatCurrency(grandTotal)}
                        </TableCell>

                        <TableCell className="py-3.5 text-right font-mono text-xs text-emerald-500 whitespace-nowrap">
                          {paidAmt > 0 ? formatCurrency(paidAmt) : "₹0"}
                        </TableCell>

                        <TableCell className="py-3.5 text-right font-mono font-bold text-sm text-amber-500 whitespace-nowrap">
                          {formatCurrency(dueAmt)}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <StatusBadge status={inv.status || "pending"} />
                        </TableCell>

                        <TableCell className="py-3.5 text-right">
                          <div className="flex justify-end items-center gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                              onClick={() => {
                                setSelectedInvoice(inv);
                                setIsViewInvoiceOpen(true);
                              }}
                              title="View Details & Payments"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-8 w-8 p-0 text-muted-foreground hover:text-blue-500"
                              onClick={() => generateInvoicePDF(inv)}
                              title="Download PDF"
                            >
                              <FileDown className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white gap-1 px-2.5 shadow-sm"
                              onClick={() => handleOpenPaymentModal(inv)}
                              title="Record Partial or Full Payment"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>Pay</span>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* TAB 3: CLIENT RECEIVABLES */}
          {activeTab === "clients" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-bold py-3.5">Customer ID</TableHead>
                    <TableHead className="font-bold py-3.5">Client Name & Contact</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Total Billed</TableHead>
                    <TableHead className="font-bold py-3.5 text-center">Unpaid Invoices</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Unbilled Contract Due</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Total Outstanding</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((c: any) => (
                    <TableRow key={c.id} className="group hover:bg-muted/20 transition-colors">
                      <TableCell className="py-3.5">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                          {c.clientId || c.referenceNo || "—"}
                        </span>
                      </TableCell>

                      <TableCell className="py-3.5">
                        <div>
                          <p className="font-bold text-sm text-foreground">{c.name}</p>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                            {c.email && (
                              <a href={`mailto:${c.email}`} className="hover:text-primary flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{c.email}</span>
                              </a>
                            )}
                            {c.phone && (
                              <a href={`tel:${c.phone}`} className="hover:text-primary flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                <span>{c.phone}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                        {formatCurrency(c.totalBilled || 0)}
                      </TableCell>

                      <TableCell className="py-3.5 text-center">
                        {c.pendingInvoicesCount > 0 ? (
                          <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono text-xs">
                            {c.pendingInvoicesCount} ({formatCurrency(c.pendingInvoicesAmount)})
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 text-right font-mono text-xs text-blue-500 whitespace-nowrap">
                        {c.unbilledProjectsAmount > 0 ? formatCurrency(c.unbilledProjectsAmount) : "—"}
                      </TableCell>

                      <TableCell className="py-3.5 text-right font-mono font-bold text-sm text-rose-500 whitespace-nowrap">
                        {formatCurrency(c.totalOutstanding)}
                      </TableCell>

                      <TableCell className="py-3.5 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1 px-2.5"
                            onClick={() => navigate(`/invoices?create=true&client=${c.id}`)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* TAB 4: PROJECT DUES */}
          {activeTab === "projects" && (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="font-bold py-3.5">Project Name</TableHead>
                    <TableHead className="font-bold py-3.5">Client & Customer ID</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Contract Budget</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Invoiced / Paid</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Remaining Due</TableHead>
                    <TableHead className="font-bold py-3.5">Status</TableHead>
                    <TableHead className="font-bold py-3.5 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedItems.map((p: any) => {
                    const clientObj = typeof p.client === "object" ? p.client : null;
                    const clientName = clientObj?.clientName || p.client || "Client";
                    const customerCode = clientObj?.clientId || clientObj?.referenceNo || "";

                    return (
                      <TableRow key={p.id} className="group hover:bg-muted/20 transition-colors">
                        <TableCell className="py-3.5">
                          <p className="font-bold text-sm text-foreground">{p.name}</p>
                          {p.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-xs">{p.description}</p>
                          )}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <div className="flex items-center gap-1.5">
                            {customerCode && (
                              <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                                {customerCode}
                              </span>
                            )}
                            <span className="text-sm font-semibold text-foreground">{clientName}</span>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {formatCurrency(Number(p.budget || 0))}
                        </TableCell>

                        <TableCell className="py-3.5 text-right font-mono text-xs text-muted-foreground whitespace-nowrap">
                          {formatCurrency(Number(p.totalPaid || 0))}
                        </TableCell>

                        <TableCell className="py-3.5 text-right font-mono font-bold text-sm text-rose-500 whitespace-nowrap">
                          {formatCurrency(Number(p.dueAmount || 0))}
                        </TableCell>

                        <TableCell className="py-3.5">
                          <StatusBadge status={p.status || "In Progress"} />
                        </TableCell>

                        <TableCell className="py-3.5 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs font-semibold text-primary border-primary/30 hover:bg-primary/10 gap-1 px-2.5"
                            onClick={() => navigate(`/invoices?create=true&client=${p.clientId || ""}`)}
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Create Invoice</span>
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {/* TABLE PAGINATION */}
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={filteredItems.length}
            itemsPerPage={itemsPerPage}
            itemName="records"
          />
        </div>
      )}

      {/* PARTIAL / FULL PAYMENT DIALOG */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <span>Record Payment</span>
                </DialogTitle>
                <DialogDescription className="mt-0.5">
                  Record full or partial payment for invoice{" "}
                  <strong className="text-foreground font-mono">
                    {paymentInvoice?.number || paymentInvoice?.invoiceNo}
                  </strong>
                </DialogDescription>
              </div>
              <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                {paymentInvoice?.customerCode}
              </Badge>
            </div>
          </DialogHeader>

          {paymentInvoice && (
            <form onSubmit={handleSubmitPayment} className="space-y-4 mt-2">
              {/* Financial Snapshot Card */}
              <div className="grid grid-cols-3 gap-2.5 p-3 rounded-xl bg-muted/40 border border-border/60 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Invoice Total</span>
                  <span className="font-mono font-bold text-foreground text-sm">
                    {formatCurrency(Number(paymentInvoice.grandTotal) || (Number(paymentInvoice.amount) || 0) + (Number(paymentInvoice.previousDue) || 0))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Already Paid</span>
                  <span className="font-mono font-bold text-emerald-500 text-sm">
                    {formatCurrency(Number(paymentInvoice.paidAmount) || 0)}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Remaining Due</span>
                  <span className="font-mono font-bold text-rose-500 text-sm">
                    {formatCurrency(currentInvoiceMaxDue)}
                  </span>
                </div>
              </div>

              {/* Quick Payment Ratio Buttons */}
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Quick Amount Select</Label>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleSetQuickPercentage(25)}
                  >
                    25%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleSetQuickPercentage(50)}
                  >
                    50%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => handleSetQuickPercentage(75)}
                  >
                    75%
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 font-bold border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                    onClick={() => handleSetQuickPercentage(100)}
                  >
                    Full 100%
                  </Button>
                </div>
              </div>

              {/* Amount to Pay Input */}
              <div className="space-y-1.5">
                <Label htmlFor="payment-amount" className="text-xs font-semibold">
                  Payment Amount to Record (₹) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                  <Input
                    id="payment-amount"
                    type="number"
                    min="1"
                    max={currentInvoiceMaxDue}
                    step="any"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    placeholder="Enter payment amount"
                    className="pl-8 font-mono text-base font-bold"
                    required
                  />
                </div>

                {/* Real-time Calculation Indicator */}
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary/40 border border-border/40 text-xs">
                  <span className="text-muted-foreground">Remaining after this payment:</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-foreground">
                      {formatCurrency(remainingAfterPayment)}
                    </span>
                    <Badge
                      variant="outline"
                      className={
                        willBeFullyPaid
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px] font-bold"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px] font-bold"
                      }
                    >
                      {willBeFullyPaid ? "Will Be Fully Paid" : "Will Be Partial Due"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Payment Method & Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="pay-method" className="text-xs font-semibold">Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="pay-method" className="h-9 text-xs">
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer / NEFT</SelectItem>
                      <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="pay-date" className="text-xs font-semibold">Payment Date *</Label>
                  <Input
                    id="pay-date"
                    type="date"
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1.5">
                <Label htmlFor="pay-notes" className="text-xs">Notes / Transaction Reference</Label>
                <Input
                  id="pay-notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. UTR / Transaction ID / Check No."
                  className="h-9 text-xs"
                />
              </div>

              <DialogFooter className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPaymentModalOpen(false)}
                  disabled={recordPaymentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-1.5"
                  disabled={recordPaymentMutation.isPending || parsedPaymentAmount <= 0 || parsedPaymentAmount > currentInvoiceMaxDue}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {recordPaymentMutation.isPending
                      ? "Recording..."
                      : `Confirm ${willBeFullyPaid ? "Full" : "Partial"} Pay (${formatCurrency(parsedPaymentAmount)})`}
                  </span>
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* VIEW INVOICE & PAYMENT HISTORY MODAL */}
      <Dialog open={isViewInvoiceOpen} onOpenChange={setIsViewInvoiceOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <Receipt className="w-5 h-5 text-primary" />
                  <span>Invoice {selectedInvoice?.number || selectedInvoice?.invoiceNo}</span>
                </DialogTitle>
                <DialogDescription className="mt-0.5">
                  Invoice details, line items, and payment installments history
                </DialogDescription>
              </div>
              <StatusBadge status={selectedInvoice?.status || "pending"} />
            </div>
          </DialogHeader>

          {selectedInvoice && (
            <div className="space-y-4 mt-2">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Client</span>
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5 mt-0.5">
                    {selectedInvoice.customerCode && (
                      <span className="font-mono text-xs font-bold px-1.5 py-0.2 rounded bg-primary/10 text-primary border border-primary/20">
                        {selectedInvoice.customerCode}
                      </span>
                    )}
                    <span>{selectedInvoice.clientName}</span>
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Issue Date</span>
                  <p className="font-semibold text-foreground text-sm mt-0.5">
                    {formatDate(selectedInvoice.date)}
                  </p>
                </div>
                <div className="col-span-2 pt-1 border-t border-border/40">
                  <span className="text-muted-foreground block text-[11px]">Associated Project(s)</span>
                  <p className="font-medium text-foreground text-xs mt-0.5">
                    {selectedInvoice.projectName || "General IT Project"}
                  </p>
                </div>
              </div>

              {/* Line items if available */}
              {Array.isArray(selectedInvoice.items) && selectedInvoice.items.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Line Items</h4>
                  <div className="rounded-xl border border-border/60 overflow-hidden text-xs">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="py-2">Service</TableHead>
                          <TableHead className="py-2 text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="py-2 font-medium">{item.service}</TableCell>
                            <TableCell className="py-2 text-right font-mono">
                              {formatCurrency(Number(item.price) || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Financial Snapshot: Total, Paid, Balance */}
              <div className="p-3.5 rounded-xl bg-secondary/30 border border-border/60 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Invoice Billing Amount:</span>
                  <span className="font-mono font-medium">{formatCurrency(Number(selectedInvoice.amount) || 0)}</span>
                </div>
                {Number(selectedInvoice.previousDue) > 0 && (
                  <div className="flex justify-between text-amber-500">
                    <span>Past Carried Dues:</span>
                    <span className="font-mono font-medium">+{formatCurrency(Number(selectedInvoice.previousDue))}</span>
                  </div>
                )}
                <div className="flex justify-between font-semibold pt-1 border-t border-border/40">
                  <span>Grand Total Obligation:</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(Number(selectedInvoice.grandTotal) || (Number(selectedInvoice.amount) || 0) + (Number(selectedInvoice.previousDue) || 0))}
                  </span>
                </div>
                <div className="flex justify-between text-emerald-500 font-semibold">
                  <span>Amount Paid So Far:</span>
                  <span className="font-mono font-bold">
                    {formatCurrency(Number(selectedInvoice.paidAmount) || (selectedInvoice.status === "paid" ? Number(selectedInvoice.grandTotal) || Number(selectedInvoice.amount) : 0))}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-border/60 text-sm font-bold text-rose-500">
                  <span>Remaining Due / Outstanding:</span>
                  <span className="font-mono text-base">
                    {formatCurrency(getInvoiceDue(selectedInvoice))}
                  </span>
                </div>
              </div>

              {/* Payment History Log (if payments recorded) */}
              {Array.isArray(selectedInvoice.payments) && selectedInvoice.payments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    <History className="w-3.5 h-3.5 text-primary" />
                    <span>Payment Installments History</span>
                  </div>
                  <div className="rounded-xl border border-border/60 overflow-hidden text-xs">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="py-2">Date</TableHead>
                          <TableHead className="py-2">Method</TableHead>
                          <TableHead className="py-2">Notes</TableHead>
                          <TableHead className="py-2 text-right">Amount Paid</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.payments.map((p: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="py-2 whitespace-nowrap text-muted-foreground">
                              {formatDate(p.date)}
                            </TableCell>
                            <TableCell className="py-2 font-medium">
                              <Badge variant="outline" className="text-[10px] py-0">
                                {p.method || "Bank"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-2 text-muted-foreground truncate max-w-[150px]">
                              {p.notes || "—"}
                            </TableCell>
                            <TableCell className="py-2 text-right font-mono font-bold text-emerald-500 whitespace-nowrap">
                              {formatCurrency(Number(p.amount) || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => selectedInvoice && generateInvoicePDF(selectedInvoice)}
              disabled={!selectedInvoice}
              className="gap-1.5 w-full sm:w-auto"
            >
              <FileDown className="w-4 h-4 text-blue-500" />
              <span>Download PDF</span>
            </Button>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {Boolean(selectedInvoice && (selectedInvoice.status || "").toLowerCase() !== "paid" && getInvoiceDue(selectedInvoice) > 0) && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    handleOpenPaymentModal(selectedInvoice);
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 font-bold"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Record Payment</span>
                </Button>
              )}
              <Button type="button" variant="secondary" size="sm" onClick={() => setIsViewInvoiceOpen(false)}>
                Close
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
