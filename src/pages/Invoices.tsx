import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import TablePagination from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, FileDown, History, Banknote, CreditCard, CheckCheck, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvoices, useCreateInvoice, useUpdateInvoice, useDeleteInvoice, useRecordPayment } from "@/hooks/useInvoices";
import { useClients } from "@/hooks/useClients";
import { useProjects } from "@/hooks/useProjects";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { generateInvoicePDF } from "@/utils/pdfGenerator";
import { formatDate } from "@/utils/dateUtils";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Invoices = () => {
  const [search, setSearch] = useState("");
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<any | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchParams, setSearchParams] = useSearchParams();

  // Partial Payment Modal state
  const [paymentInvoice, setPaymentInvoice] = useState<any | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"full" | "partial">("partial");
  const [paymentAmountInput, setPaymentAmountInput] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [paymentNotes, setPaymentNotes] = useState<string>("");

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateDialogOpen(true);
      // Remove the param after opening to prevent re-opening on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("create");
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  const [formData, setFormData] = useState<{
    clientId: string;
    projectIds: string[];
    selectedDues: string[];
    referenceNo: string;
    invoiceNo: string;
    amount: string;
    description: string;
    method: 'Cash' | 'UPI' | 'Bank Transfer' | 'Card' | 'Cheque' | '';
    date: string;
    status: 'paid' | 'pending' | 'partial' | 'overdue';
    previousDue: number;
    items: { service: string; units: string; price: number }[];
  }>({
    clientId: "",
    projectIds: [],
    selectedDues: [],
    referenceNo: "",
    invoiceNo: "",
    amount: "",
    description: "",
    method: "",
    date: new Date().toISOString().split('T')[0],
    status: "pending",
    previousDue: 0,
    items: [],
  });

  // Helper to sync items based on selection
  const syncItems = (currentItems: any[], newProjectIds: string[], newSelectedDues: string[]) => {
    return currentItems;
  };

  useEffect(() => {
    if (isCreateDialogOpen || isEditDialogOpen) {
       const newItems = syncItems(formData.items, formData.projectIds, formData.selectedDues);
       if (JSON.stringify(newItems) !== JSON.stringify(formData.items)) {
         setFormData(prev => ({ ...prev, items: newItems }));
       }
    }
  }, [formData.projectIds, formData.selectedDues, isCreateDialogOpen, isEditDialogOpen]);

  const { data: invoices = [], isLoading, error } = useInvoices();
  const { data: clients = [] } = useClients();
  const { data: projects = [] } = useProjects();
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const deleteInvoice = useDeleteInvoice();
  const recordPaymentMutation = useRecordPayment();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Helper to calculate exact remaining due for an invoice
  const getInvoiceDue = (inv: any) => {
    const status = (inv?.status || "").toLowerCase();
    if (status === "paid") return 0;
    const totalObligation = Number(inv?.grandTotal) || (Number(inv?.amount) || 0) + (Number(inv?.previousDue) || 0);
    const paidAmt = Number(inv?.paidAmount) || 0;
    if (inv?.remainingDue !== undefined) {
      return Number(inv.remainingDue);
    }
    return Math.max(0, totalObligation - paidAmt);
  };

  const handleOpenPaymentModal = (invoice: any) => {
    setPaymentInvoice(invoice);
    const due = getInvoiceDue(invoice);
    setPaymentAmountInput(due > 0 ? due.toString() : "");
    setPaymentMode("partial");
    setPaymentDate(new Date().toISOString().split("T")[0]);
    setPaymentMethod(invoice.method || "Bank Transfer");
    setPaymentNotes("");
    setIsPaymentModalOpen(true);
  };

  const handleSetQuickPercentage = (percent: number) => {
    if (!paymentInvoice) return;
    const maxDue = getInvoiceDue(paymentInvoice);
    const calculated = Math.round((maxDue * percent) / 100);
    setPaymentAmountInput(calculated.toString());
  };

  const handleRecordPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentInvoice) return;
    const amount = Number(paymentAmountInput);
    const maxDue = getInvoiceDue(paymentInvoice);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount greater than 0",
        variant: "destructive",
      });
      return;
    }
    if (amount > maxDue) {
      toast({
        title: "Exceeds Remaining Due",
        description: `Payment amount (${formatCurrency(amount)}) cannot exceed remaining due (${formatCurrency(maxDue)})`,
        variant: "destructive",
      });
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
      toast({
        title: "Payment Recorded",
        description: `Successfully recorded payment of ${formatCurrency(amount)}.`,
      });
      setIsPaymentModalOpen(false);
      setPaymentInvoice(null);
      if (isViewDialogOpen) {
        setIsViewDialogOpen(false);
      }
    } catch (err: any) {
      toast({
        title: "Payment Failed",
        description: err.response?.data?.message || "Failed to record payment",
        variant: "destructive",
      });
    }
  };

  const parsedPaymentAmount = Number(paymentAmountInput) || 0;
  const currentInvoiceMaxDue = paymentInvoice ? getInvoiceDue(paymentInvoice) : 0;
  const remainingAfterPayment = Math.max(0, currentInvoiceMaxDue - parsedPaymentAmount);
  const willBeFullyPaid = parsedPaymentAmount >= currentInvoiceMaxDue;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredInvoices = invoices.filter(
    (inv: any) => {
      const matchesSearch = inv.number?.toLowerCase().includes(search.toLowerCase()) ||
        inv.clientName?.toLowerCase().includes(search.toLowerCase()) ||
        inv.projectName?.toLowerCase().includes(search.toLowerCase()) ||
        inv.description?.toLowerCase().includes(search.toLowerCase());
      
      let matchesStatus = true;
      if (statusFilter === "all") {
        matchesStatus = true;
      } else if (statusFilter === "pending") {
        matchesStatus = inv.status === "pending" || inv.status === "partial" || inv.status === "overdue";
      } else {
        matchesStatus = inv.status === statusFilter;
      }
      
      return matchesSearch && matchesStatus;
    }
  );

  // Newest added at top
  const sortedInvoices = [...filteredInvoices].sort((a: any, b: any) => {
    const numA = parseInt((a.number || "").replace(/\D/g, "") || "0", 10);
    const numB = parseInt((b.number || "").replace(/\D/g, "") || "0", 10);
    if (numA && numB && numA !== numB) return numB - numA;

    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return 0;
  });

  const totalPages = Math.ceil(sortedInvoices.length / itemsPerPage);
  const paginatedInvoices = sortedInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = formData.items && formData.items.length > 0 
      ? formData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
      : Number(formData.amount);

    // Frontend budget validation
    const allInvolvedProjectIds = [...new Set([...formData.projectIds, ...formData.selectedDues])];
    const selectedProjects = projects.filter((p: any) => allInvolvedProjectIds.includes(p.id));
    const totalBudget = selectedProjects.reduce((sum: number, p: any) => sum + (Number(p.dueAmount) || 0), 0);
    
    if (amountNum > totalBudget) {
      toast({
        title: "Budget Exceeded",
        description: `This invoice amount exceeds the remaining combined project budget (₹${totalBudget.toLocaleString()}).`,
        variant: "destructive",
      });
      return;
    }

    try {
      await createInvoice.mutateAsync({
        clientId: formData.clientId,
        projectIds: formData.projectIds,
        selectedDues: formData.selectedDues,
        referenceNo: formData.referenceNo,
        invoiceNo: formData.invoiceNo,
        amount: amountNum,
        description: formData.description,
        method: formData.method as any,
        date: formData.date,
        status: formData.status,
        previousDue: formData.previousDue,
        items: formData.items,
      });
      setIsCreateDialogOpen(false);
      setFormData({
        clientId: "",
        projectIds: [],
        selectedDues: [],
        referenceNo: "",
        invoiceNo: "",
        amount: "",
        description: "",
        method: "",
        date: new Date().toISOString().split('T')[0],
        status: "pending",
        previousDue: 0,
        items: [],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create invoice",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (invoice: any) => {
    setFormData({
      clientId: invoice.clientId || "",
      projectIds: Array.isArray(invoice.projectIds) ? invoice.projectIds : (invoice.projectId ? [invoice.projectId] : []),
      selectedDues: invoice.selectedDues || [],
      referenceNo: invoice.referenceNo || "",
      invoiceNo: invoice.number || "",
      amount: invoice.amount?.toString() || "",
      description: invoice.description || "",
      method: invoice.method || "",
      date: invoice.issueDate ? new Date(invoice.issueDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      status: invoice.status || "paid",
      previousDue: invoice.previousDue || 0,
      items: invoice.items || [],
    });
    setSelectedInvoice(invoice);
    setIsEditDialogOpen(true);
  };

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    const amountNum = formData.items && formData.items.length > 0 
      ? formData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0)
      : Number(formData.amount);

    const allInvolvedProjectIds = [...new Set([...formData.projectIds, ...formData.selectedDues])];
    const involvedProjects = projects.filter((p: any) => allInvolvedProjectIds.includes(p.id));
    
    // Total budget includes original invoice amount for projects that were already in this invoice
    const totalBudget = involvedProjects.reduce((sum: number, p: any) => {
        const originalInvoiceFound = (selectedInvoice?.projectIds?.includes(p.id)) || (selectedInvoice?.projectId === p.id);
        const previousContribution = originalInvoiceFound ? Number(selectedInvoice.amount) : 0;
        return sum + (Number(p.dueAmount) || 0) + previousContribution;
    }, 0);

    if (amountNum > totalBudget) {
        toast({
            title: "Budget Exceeded",
            description: `This invoice amount exceeds the remaining combined project budget (₹${totalBudget.toLocaleString()}).`,
            variant: "destructive",
        });
        return;
    }

    try {
      await updateInvoice.mutateAsync({
        id: selectedInvoice.id,
        data: {
          clientId: formData.clientId,
          projectIds: formData.projectIds,
          selectedDues: formData.selectedDues,
          referenceNo: formData.referenceNo,
          invoiceNo: formData.invoiceNo,
          amount: amountNum,
          description: formData.description,
          method: formData.method as any,
          date: formData.date,
          status: formData.status,
          previousDue: formData.previousDue,
          items: formData.items,
        },
      });
      setIsEditDialogOpen(false);
      setSelectedInvoice(null);
      setFormData({
        clientId: "",
        projectIds: [],
        selectedDues: [],
        referenceNo: "",
        invoiceNo: "",
        amount: "",
        description: "",
        method: "",
        date: new Date().toISOString().split('T')[0],
        status: "paid",
        previousDue: 0,
        items: [],
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update invoice",
        variant: "destructive",
      });
    }
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;

    try {
      await deleteInvoice.mutateAsync(invoiceToDelete.id);
      setInvoiceToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete invoice",
        variant: "destructive",
      });
    }
  };

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsViewDialogOpen(true);
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Invoices" subtitle="Error loading invoices" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load invoices. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${invoices.length} total invoices`}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create Invoice
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search invoices..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="w-full md:w-[180px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Invoices</SelectItem>
                <SelectItem value="paid">Paid Only</SelectItem>
                <SelectItem value="partial">Partially Paid</SelectItem>
                <SelectItem value="pending">Due / Unpaid</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-lg" />
            ))}
          </div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              {search ? "No invoices found" : "No invoices yet"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search ? "Try adjusting your search" : "Get started by creating your first invoice"}
            </p>
            {!search && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            )}
          </div>
        ) : (
          <div className="responsive-table-container custom-scrollbar">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Current Amt</TableHead>
                  <TableHead>Total Payable</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedInvoices.map((invoice: any) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.number}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        {invoice.customerCode && (
                          <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                            {invoice.customerCode}
                          </span>
                        )}
                        <span>{invoice.clientName}</span>
                      </div>
                    </TableCell>
                    <TableCell>{invoice.projectName}</TableCell>
                    <TableCell>{formatDate(invoice.date)}</TableCell>
                    <TableCell className="font-medium text-muted-foreground">{formatCurrency(invoice.total)}</TableCell>
                    <TableCell className="font-bold text-primary">{formatCurrency(invoice.grandTotal)}</TableCell>
                    <TableCell>
                      <StatusBadge status={invoice.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5 sm:gap-2">
                        {invoice.status !== "paid" && getInvoiceDue(invoice) > 0 && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenPaymentModal(invoice)}
                            className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                            title="Record Payment"
                          >
                            <Banknote className="w-4 h-4" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewInvoice(invoice)}
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => generateInvoicePDF(invoice)}
                          title="Download PDF"
                        >
                          <FileDown className="w-4 h-4 text-blue-500" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditClick(invoice)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setInvoiceToDelete(invoice)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sortedInvoices.length}
              itemsPerPage={itemsPerPage}
              itemName="invoices"
            />
          </div>
        )}
      </div>

      {/* Create Invoice Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateInvoice} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => {
                    const client = clients.find((c: any) => c.id === value);
                    // Filter projects for this client to get default dues (only those with an outstanding balance)
                    const clientProjects = projects.filter((p: any) => p.clientId === value && p.dueAmount > 0);
                    const totalDue = clientProjects.reduce((sum: number, p: any) => sum + (p.dueAmount || 0), 0);
                    const allProjectIds = clientProjects.map((p: any) => p.id);
                    
                    setFormData({
                      ...formData,
                      clientId: value,
                      referenceNo: client?.referenceNo || "",
                      projectIds: [], // Reset selected projects
                      selectedDues: [], // Default to NO dues included (manual selection)
                      previousDue: 0,
                    });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.filter((c: any) => c.totalDue > 0).map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{client.name}</span>
                          {client.totalDue > 0 && (
                            <span className="text-[10px] text-destructive ml-2 font-bold px-1.5 py-0.5 bg-destructive/5 rounded border border-destructive/10">
                              Due: {formatCurrency(client.totalDue)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Projects *</Label>
                <div className="border rounded-md p-2 bg-background/50">
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2 pr-4">
                      {projects
                        .filter((p: any) => (p.clientId === formData.clientId || !formData.clientId) && (Number(p.dueAmount) > 0 || formData.projectIds.includes(p.id)))
                        .map((project: any) => (
                          <div key={project.id} className="flex items-center justify-between p-2 rounded-lg border bg-card/60 hover:bg-accent/40 transition-colors">
                            <div className="flex items-center space-x-2.5 flex-1 min-w-0 pr-2">
                              <Checkbox
                                id={`project-${project.id}`}
                                checked={formData.projectIds.includes(project.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    const newSelectedDues = formData.selectedDues.filter(id => id !== project.id);
                                    const newTotalDue = projects
                                      .filter((proj: any) => newSelectedDues.includes(proj.id))
                                      .reduce((sum: number, proj: any) => sum + (Number(proj.dueAmount) || 0), 0);

                                    setFormData({ 
                                      ...formData, 
                                      projectIds: [...formData.projectIds, project.id],
                                      selectedDues: newSelectedDues,
                                      previousDue: newTotalDue
                                    });
                                  } else {
                                    setFormData({ ...formData, projectIds: formData.projectIds.filter(id => id !== project.id) });
                                  }
                                }}
                              />
                              <label
                                htmlFor={`project-${project.id}`}
                                className="text-xs font-semibold leading-tight cursor-pointer truncate"
                              >
                                {project.name}
                              </label>
                            </div>
                            <div className="flex items-center gap-2 text-[10px] whitespace-nowrap">
                              <span className="text-muted-foreground">
                                Total: <strong className="text-foreground">{formatCurrency(project.budget || 0)}</strong>
                              </span>
                              <span className="text-emerald-600 dark:text-emerald-400">
                                Paid: <strong>{formatCurrency(project.totalPaid || 0)}</strong>
                              </span>
                              <span className="text-destructive font-bold px-1.5 py-0.5 rounded bg-destructive/10">
                                Due: {formatCurrency(project.dueAmount || 0)}
                              </span>
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
                {formData.projectIds.length > 0 && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-2.5 mt-2 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-muted-foreground">Selected Project(s) Total: </span>
                      <strong className="text-foreground">
                        {formatCurrency(projects
                          .filter((p: any) => formData.projectIds.includes(p.id))
                          .reduce((sum: number, p: any) => sum + (Number(p.budget) || 0), 0)
                        )}
                      </strong>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-emerald-600 dark:text-emerald-400">
                        Paid: <strong>
                          {formatCurrency(projects
                            .filter((p: any) => formData.projectIds.includes(p.id))
                            .reduce((sum: number, p: any) => sum + (Number(p.totalPaid) || 0), 0)
                          )}
                        </strong>
                      </span>
                      <span className="text-destructive font-bold">
                        Remaining Due: {formatCurrency(projects
                          .filter((p: any) => formData.projectIds.includes(p.id))
                          .reduce((sum: number, p: any) => sum + (Number(p.dueAmount) || 0), 0)
                        )}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {formData.clientId && (
              <div className="space-y-2 border-t pt-4">
                <Label>Include Previous Dues From:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {projects
                        .filter((p: any) => p.clientId === formData.clientId && !formData.projectIds.includes(p.id) && Number(p.dueAmount) > 0)
                        .map((p: any) => (
                            <div key={p.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-accent/50 transition-colors">
                                <Checkbox 
                                    id={`due-${p.id}`}
                                    checked={formData.selectedDues.includes(p.id)}
                                    onCheckedChange={(checked) => {
                                        let newDues = [...formData.selectedDues];
                                        if (checked) {
                                            newDues.push(p.id);
                                        } else {
                                            newDues = newDues.filter(id => id !== p.id);
                                        }
                                        
                                        // Calculate only from the Filtered dues
                                        const actualDues = newDues.filter(id => !formData.projectIds.includes(id));
                                        const total = projects
                                            .filter((proj: any) => actualDues.includes(proj.id))
                                            .reduce((sum: number, proj: any) => sum + (Number(proj.dueAmount) || 0), 0);
                                            
                                        setFormData({ ...formData, selectedDues: actualDues, previousDue: total });
                                    }}
                                />
                                <Label htmlFor={`due-${p.id}`} className="text-xs cursor-pointer flex-1 truncate">
                                    {p.name}
                                </Label>
                                <span className="text-[10px] text-destructive font-bold">
                                    {formatCurrency(p.dueAmount)}
                                </span>
                            </div>
                        ))
                    }
                    {projects.filter((p: any) => p.clientId === formData.clientId && !formData.projectIds.includes(p.id) && p.dueAmount > 0).length === 0 && (
                        <p className="text-[10px] text-muted-foreground italic col-span-2">No other outstanding projects found for this client.</p>
                    )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Invoice Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partially Paid</SelectItem>
                    <SelectItem value="pending">Due (Pending)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount *</Label>
                <Input
                  id="amount"
                  type="number"
                  value={formData.items.length > 0 ? formData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0) : formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="5000"
                  disabled={formData.items.length > 0}
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="invoiceNo">Invoice Number</Label>
                  <Input
                    id="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                    placeholder="Auto-generated if empty"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <DatePicker 
                    date={formData.date} 
                    setDate={(v) => setFormData({ ...formData, date: v })} 
                    placeholder="Select date"
                  />
                </div>
              </div>

              {formData.clientId && formData.previousDue > 0 && (
                <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                      <History className="w-4 h-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-destructive/60 uppercase tracking-tighter">Previous Selected Balance</p>
                      <p className="text-base font-bold text-destructive leading-tight">{formatCurrency(formData.previousDue)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground italic leading-tight">Included from {formData.selectedDues.length} projects</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select
                    value={formData.method}
                    onValueChange={(value: any) => setFormData({ ...formData, method: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                      <SelectItem value="UPI">UPI</SelectItem>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Card">Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="referenceNo">Reference No</Label>
                  <Input
                    id="referenceNo"
                    value={formData.referenceNo}
                    onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="space-y-4 col-span-2">
                <div className="flex items-center justify-between">
                  <Label>Invoice Items (Optional)</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setFormData({
                      ...formData,
                      items: [...formData.items, { service: "", units: "", price: 0 }]
                    })}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
                {formData.items.length > 0 && (
                  <div className="space-y-3">
                    {formData.items.map((item, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="flex-1 space-y-1">
                          <Input
                            placeholder="Service (e.g., SM Handling Fee)"
                            value={item.service}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].service = e.target.value;
                              setFormData({ ...formData, items: newItems });
                            }}
                          />
                        </div>
                        <div className="w-1/4 space-y-1">
                          <Input
                            placeholder="Units (e.g., 4 x ₹400)"
                            value={item.units}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].units = e.target.value;
                              setFormData({ ...formData, items: newItems });
                            }}
                          />
                        </div>
                        <div className="w-1/4 space-y-1">
                          <Input
                            type="number"
                            placeholder="Price"
                            value={item.price === 0 ? "" : item.price}
                            onChange={(e) => {
                              const newItems = [...formData.items];
                              newItems[index].price = Number(e.target.value);
                              setFormData({ ...formData, items: newItems });
                            }}
                          />
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newItems = formData.items.filter((_, i) => i !== index);
                            setFormData({ ...formData, items: newItems });
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    ))}
                    <div className="flex justify-end pr-10 text-sm font-bold">
                      Calculated Total: {formatCurrency(formData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0))}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2 col-span-2">
                <Label htmlFor="description">Description (If not using line items)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Work details..."
                  rows={2}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={createInvoice.isPending}>
                {createInvoice.isPending ? "Creating..." : "Create Invoice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateInvoice} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client">Client *</Label>
                <Select
                  value={formData.clientId}
                  onValueChange={(value) => {
                    const client = clients.find((c: any) => c.id === value);
                    const clientProjects = projects.filter((p: any) => p.clientId === value && p.dueAmount > 0);
                    const totalDue = clientProjects.reduce((sum: number, p: any) => sum + (p.dueAmount || 0), 0);
                    const allProjectIds = clientProjects.map((p: any) => p.id);

                    setFormData({
                      ...formData,
                      clientId: value,
                      referenceNo: client?.referenceNo || "",
                      projectIds: [], 
                      selectedDues: allProjectIds,
                      previousDue: totalDue
                    });
                  }}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.filter((c: any) => c.totalDue > 0).map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        <div className="flex justify-between items-center w-full">
                          <span>{client.name}</span>
                          {client.totalDue > 0 && (
                            <span className="text-[10px] text-destructive ml-2 font-bold px-1.5 py-0.5 bg-destructive/5 rounded border border-destructive/10">
                              Due: {formatCurrency(client.totalDue)}
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Projects *</Label>
                <div className="border rounded-md p-2 bg-background/50">
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-2 pr-4">
                      {projects
                        .filter((p: any) => (p.clientId === formData.clientId || !formData.clientId) && (Number(p.dueAmount) > 0 || formData.projectIds.includes(p.id)))
                        .map((project: any) => (
                          <div key={project.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`edit-project-${project.id}`}
                              checked={formData.projectIds.includes(project.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  // Mutual exclusion: remove from selectedDues
                                  const newSelectedDues = formData.selectedDues.filter(id => id !== project.id);
                                  const newTotalDue = projects
                                    .filter((proj: any) => newSelectedDues.includes(proj.id))
                                    .reduce((sum: number, proj: any) => sum + (Number(proj.dueAmount) || 0), 0);

                                  setFormData({ 
                                    ...formData, 
                                    projectIds: [...formData.projectIds, project.id],
                                    selectedDues: newSelectedDues,
                                    previousDue: newTotalDue
                                  });
                                } else {
                                  setFormData({ ...formData, projectIds: formData.projectIds.filter(id => id !== project.id) });
                                }
                              }}
                            />
                            <label
                              htmlFor={`edit-project-${project.id}`}
                              className="text-sm font-medium leading-none cursor-pointer flex-1"
                            >
                              {project.name}
                            </label>
                            <span className="text-[10px] text-muted-foreground">
                              Due: {formatCurrency((project.dueAmount || 0) + (formData.projectIds.includes(project.id) && (selectedInvoice?.projectIds?.includes(project.id) || selectedInvoice?.projectId === project.id) ? Number(selectedInvoice.amount) : 0))}
                            </span>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </div>
                {formData.projectIds.length > 0 && (
                  <p className="text-[10px] font-medium text-muted-foreground mt-1 px-1 flex justify-between">
                    <span>Combined Budget:</span>
                    <span className="text-primary font-bold">
                      {formatCurrency(projects
                        .filter((p: any) => formData.projectIds.includes(p.id))
                        .reduce((sum: number, p: any) => {
                            const isIncludedInOriginal = selectedInvoice?.projectIds?.includes(p.id) || selectedInvoice?.projectId === p.id;
                            const contribution = isIncludedInOriginal ? Number(selectedInvoice.amount) : 0;
                            return sum + (p.dueAmount || 0) + contribution;
                        }, 0)
                      )}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {formData.clientId && (
              <div className="space-y-2 border-t pt-4">
                <Label>Include Previous Dues From:</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                    {projects
                        .filter((p: any) => p.clientId === formData.clientId && !formData.projectIds.includes(p.id) && Number(p.dueAmount) > 0)
                        .map((p: any) => (
                            <div key={p.id} className="flex items-center space-x-2 p-2 border rounded hover:bg-accent/50 transition-colors">
                                <Checkbox 
                                    id={`edit-due-${p.id}`}
                                    checked={formData.selectedDues.includes(p.id)}
                                    onCheckedChange={(checked) => {
                                        let newDues = [...formData.selectedDues];
                                        if (checked) {
                                            newDues.push(p.id);
                                        } else {
                                            newDues = newDues.filter(id => id !== p.id);
                                        }
                                        
                                        const total = projects
                                            .filter((proj: any) => newDues.includes(proj.id))
                                            .reduce((sum: number, proj: any) => sum + (proj.dueAmount || 0), 0);
                                            
                                        setFormData({ ...formData, selectedDues: newDues, previousDue: total });
                                    }}
                                />
                                <Label htmlFor={`edit-due-${p.id}`} className="text-xs cursor-pointer flex-1 truncate">
                                    {p.name}
                                </Label>
                                <span className="text-[10px] text-destructive font-bold">
                                    {formatCurrency(p.dueAmount)}
                                </span>
                            </div>
                        ))
                    }
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-invoiceNo">Invoice Number</Label>
                <Input
                  id="edit-invoiceNo"
                  value={formData.invoiceNo}
                  onChange={(e) => setFormData({ ...formData, invoiceNo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-date">Date *</Label>
                <DatePicker 
                  date={formData.date} 
                  setDate={(v) => setFormData({ ...formData, date: v })} 
                  placeholder="Select date"
                />
              </div>
            </div>

            {formData.clientId && formData.previousDue > 0 && (
              <div className="bg-destructive/5 border border-destructive/10 rounded-lg p-3 flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
                    <History className="w-4 h-4 text-destructive" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-destructive/60 uppercase tracking-tighter">Previous Selected Balance</p>
                    <p className="text-base font-bold text-destructive leading-tight">{formatCurrency(formData.previousDue)}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground italic leading-tight">Included from {formData.selectedDues.length} projects</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Invoice Status *</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  required
                >
                  <SelectTrigger id="edit-status">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="partial">Partially Paid</SelectItem>
                    <SelectItem value="pending">Due (Pending)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-amount">Amount *</Label>
                <Input
                  id="edit-amount"
                  type="number"
                  value={formData.items.length > 0 ? formData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0) : formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  disabled={formData.items.length > 0}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-method">Payment Method *</Label>
                <Select
                  value={formData.method}
                  onValueChange={(value: any) => setFormData({ ...formData, method: value })}
                  required
                >
                  <SelectTrigger id="edit-method">
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="UPI">UPI</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Cheque">Cheque</SelectItem>
                    <SelectItem value="Card">Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4 col-span-2">
              <div className="flex items-center justify-between">
                <Label>Invoice Items (Optional)</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setFormData({
                     ...formData,
                     items: [...formData.items, { service: "", units: "", price: 0 }]
                  })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </div>
              {formData.items.length > 0 && (
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="flex gap-2 items-start">
                      <div className="flex-1 space-y-1">
                        <Input
                          placeholder="Service"
                          value={item.service}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].service = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                      </div>
                      <div className="w-1/4 space-y-1">
                        <Input
                          placeholder="Units"
                          value={item.units}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].units = e.target.value;
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                      </div>
                      <div className="w-1/4 space-y-1">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={item.price === 0 ? "" : item.price}
                          onChange={(e) => {
                            const newItems = [...formData.items];
                            newItems[index].price = Number(e.target.value);
                            setFormData({ ...formData, items: newItems });
                          }}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          const newItems = formData.items.filter((_, i) => i !== index);
                          setFormData({ ...formData, items: newItems });
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex justify-end pr-10 text-sm font-bold">
                    Calculated Total: {formatCurrency(formData.items.reduce((sum, item) => sum + (Number(item.price) || 0), 0))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2 col-span-2">
              <Label htmlFor="edit-description">Description (If not using line items)</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={updateInvoice.isPending}>
                {updateInvoice.isPending ? "Updating..." : "Update Invoice"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Invoice Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2">
              <DialogTitle>Invoice Details</DialogTitle>
              <div className="flex items-center gap-2">
                {selectedInvoice && selectedInvoice.status !== "paid" && getInvoiceDue(selectedInvoice) > 0 && (
                  <Button
                    size="sm"
                    onClick={() => handleOpenPaymentModal(selectedInvoice)}
                    className="gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs"
                  >
                    <Banknote className="w-4 h-4" />
                    Pay / Partial Pay
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => generateInvoicePDF(selectedInvoice)}
                  className="gap-2 text-xs"
                >
                  <FileDown className="w-4 h-4" />
                  Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Invoice Number</Label>
                  <p className="text-foreground font-medium mt-1">{selectedInvoice.number}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <StatusBadge status={selectedInvoice.status} />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Client</Label>
                  <p className="text-foreground font-medium mt-1 flex items-center gap-2">
                    {selectedInvoice.customerCode && (
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                        {selectedInvoice.customerCode}
                      </span>
                    )}
                    <span>{selectedInvoice.clientName}</span>
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Project</Label>
                  <p className="text-foreground font-medium mt-1">{selectedInvoice.projectName}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Date</Label>
                  <p className="text-foreground mt-1">{formatDate(selectedInvoice.date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Payment Method</Label>
                  <p className="text-foreground mt-1">{selectedInvoice.method}</p>
                </div>
              </div>
              <div className="bg-primary/5 border border-primary/10 rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">Current Amount:</span>
                  <span className="font-semibold">{formatCurrency(selectedInvoice.total)}</span>
                </div>
                {selectedInvoice.previousDue > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm text-destructive">
                      <span className="font-medium">Previous Balance:</span>
                      <span className="font-bold">+ {formatCurrency(selectedInvoice.previousDue)}</span>
                    </div>
                    {selectedInvoice.dueBreakdown && selectedInvoice.dueBreakdown.length > 0 && (
                      <div className="pl-4 border-l-2 border-destructive/20 space-y-1">
                        {selectedInvoice.dueBreakdown.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-[11px] text-destructive/80 italic">
                            <span>{item.projectName}:</span>
                            <span>{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                <div className="pt-2 border-t border-primary/20 flex justify-between items-center">
                  <span className="text-base font-bold text-primary">GRAND TOTAL:</span>
                  <span className="text-2xl font-black text-primary">{formatCurrency(selectedInvoice.grandTotal)}</span>
                </div>
                {Number(selectedInvoice.paidAmount) > 0 && (
                  <div className="flex justify-between items-center text-sm text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>Paid So Far:</span>
                    <span className="font-mono font-bold">- {formatCurrency(selectedInvoice.paidAmount)}</span>
                  </div>
                )}
                {selectedInvoice.status !== 'paid' && (
                  <div className="flex justify-between items-center text-sm font-bold text-amber-600 dark:text-amber-400 pt-1 border-t border-border/30">
                    <span>Remaining Due:</span>
                    <span className="font-mono text-base">{formatCurrency(getInvoiceDue(selectedInvoice))}</span>
                  </div>
                )}
                {selectedInvoice.projectDue > 0 && (
                  <div className="pt-2 border-t border-dashed border-orange-300 dark:border-orange-800 flex justify-between items-center text-xs text-orange-600 dark:text-orange-400">
                    <span className="font-semibold">Project Remaining Due:</span>
                    <span className="font-bold">{formatCurrency(selectedInvoice.projectDue)}</span>
                  </div>
                )}
              </div>
              {selectedInvoice.status !== 'paid' && getInvoiceDue(selectedInvoice) > 0 && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-orange-700 dark:text-orange-400">Please pay on UPI ID:</span>
                  <span className="text-sm font-bold text-orange-600 dark:text-orange-500 select-all cursor-pointer">8540814729@upi</span>
                </div>
              )}
              {/* Payment History Installments Table */}
              {Array.isArray(selectedInvoice.payments) && selectedInvoice.payments.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                    <History className="w-3.5 h-3.5 text-primary" />
                    <span>Payment Installments ({selectedInvoice.payments.length})</span>
                  </div>
                  <div className="rounded-lg border border-border overflow-hidden text-xs">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="py-1.5 text-xs">Date</TableHead>
                          <TableHead className="py-1.5 text-xs">Method</TableHead>
                          <TableHead className="py-1.5 text-xs">Notes</TableHead>
                          <TableHead className="py-1.5 text-xs text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.payments.map((p: any, idx: number) => (
                          <TableRow key={idx}>
                            <TableCell className="py-1.5 text-muted-foreground whitespace-nowrap">{formatDate(p.date)}</TableCell>
                            <TableCell className="py-1.5 font-medium">{p.method || "Bank"}</TableCell>
                            <TableCell className="py-1.5 text-muted-foreground truncate max-w-[120px]">{p.notes || "—"}</TableCell>
                            <TableCell className="py-1.5 text-right font-mono font-bold text-emerald-500">
                              {formatCurrency(Number(p.amount) || 0)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <div>
                  <Label className="text-muted-foreground mb-2 block">Invoice Items</Label>
                  <div className="border border-border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/50">
                        <TableRow>
                          <TableHead className="h-8">Service</TableHead>
                          <TableHead className="h-8">Units</TableHead>
                          <TableHead className="h-8 text-right">Price</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedInvoice.items.map((item: any, i: number) => (
                          <TableRow key={i}>
                            <TableCell className="py-2">{item.service}</TableCell>
                            <TableCell className="py-2">{item.units}</TableCell>
                            <TableCell className="py-2 text-right">{formatCurrency(item.price || 0)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              {selectedInvoice.description && (
                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-foreground mt-1">{selectedInvoice.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Partial / Full Payment Dialog */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-lg font-bold flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-emerald-500" />
                  <span>Record Payment</span>
                </DialogTitle>
                <div className="text-xs text-muted-foreground mt-0.5">
                  Record full or partial installment for invoice{" "}
                  <strong className="text-foreground font-mono">
                    {paymentInvoice?.number || paymentInvoice?.invoiceNo}
                  </strong>
                </div>
              </div>
              {paymentInvoice?.customerCode && (
                <Badge variant="outline" className="font-mono text-xs font-bold text-primary">
                  {paymentInvoice.customerCode}
                </Badge>
              )}
            </div>
          </DialogHeader>

          {paymentInvoice && (
            <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 mt-2">
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
                <Label htmlFor="inv-pay-amount" className="text-xs font-semibold">
                  Payment Amount to Record (₹) *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                  <Input
                    id="inv-pay-amount"
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
                  <Label htmlFor="inv-pay-method" className="text-xs font-semibold">Payment Method *</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger id="inv-pay-method" className="h-9 text-xs">
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
                  <Label htmlFor="inv-pay-date" className="text-xs font-semibold">Payment Date *</Label>
                  <Input
                    id="inv-pay-date"
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
                <Label htmlFor="inv-pay-notes" className="text-xs">Notes / Transaction Reference</Label>
                <Input
                  id="inv-pay-notes"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder="e.g. UTR / Transaction ID / Installment 1"
                  className="h-9 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
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
                  <CheckCheck className="w-4 h-4" />
                  <span>
                    {recordPaymentMutation.isPending
                      ? "Recording..."
                      : `Confirm ${willBeFullyPaid ? "Full" : "Partial"} Pay (${formatCurrency(parsedPaymentAmount)})`}
                  </span>
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!invoiceToDelete} onOpenChange={() => setInvoiceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete invoice <strong>{invoiceToDelete?.number}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteInvoice}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteInvoice.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Invoices;
