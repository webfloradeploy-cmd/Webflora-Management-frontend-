import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import TablePagination from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileDown,
  Mail,
  Copy,
  PenTool,
  AlertTriangle,
  FolderOpen,
  Calendar,
  Layers,
  Sparkles,
  CheckCircle,
  FileText,
  DollarSign,
  Upload,
  Image,
  X
} from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  useAgreements,
  useDeleteAgreement,
  useDuplicateAgreement,
  useSendAgreement,
  useESignAgreement,
} from "@/hooks/useAgreements";
import { Skeleton } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { formatDate } from "@/utils/dateUtils";
import { generateAgreementPDF } from "@/utils/pdfGenerator";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Agreements = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Sign Modal States
  const [isSignOpen, setIsSignOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<any | null>(null);
  const [signedBy, setSignedBy] = useState("");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");
  const [uploadedSignatureData, setUploadedSignatureData] = useState("");

  // Delete Alert States
  const [agreementToDelete, setAgreementToDelete] = useState<any | null>(null);

  // Fetch Agreements
  const { data: agreements = [], isLoading, refetch } = useAgreements();

  // Mutations
  const deleteMutation = useDeleteAgreement();
  const duplicateMutation = useDuplicateAgreement();
  const sendMutation = useSendAgreement();
  const esignMutation = useESignAgreement();

  // Calculate Metrics
  const totalCount = agreements.length;
  const activeCount = agreements.filter((a: any) => a.status === "Active" || a.status === "Signed").length;
  const sentCount = agreements.filter((a: any) => a.status === "Sent").length;
  const draftCount = agreements.filter((a: any) => a.status === "Draft").length;

  const totalValue = agreements.reduce((sum: number, a: any) => sum + (a.payment?.totalCost || 0), 0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, typeFilter]);

  // Filtered Agreements
  const filteredAgreements = agreements.filter((a: any) => {
    const matchesSearch =
      a.agreementId?.toLowerCase().includes(search.toLowerCase()) ||
      a.clientInfo?.clientName?.toLowerCase().includes(search.toLowerCase()) ||
      a.clientInfo?.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      a.projectInfo?.title?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || a.status === statusFilter;
    const matchesType = typeFilter === "all" || a.projectInfo?.projectType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  // Recent added at top
  const sortedAgreements = [...filteredAgreements].sort((a: any, b: any) => {
    const numA = parseInt((a.agreementId || "").replace(/\D/g, "") || "0", 10);
    const numB = parseInt((b.agreementId || "").replace(/\D/g, "") || "0", 10);
    if (numA && numB && numA !== numB) return numB - numA;

    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return 0;
  });

  const totalPages = Math.ceil(sortedAgreements.length / itemsPerPage);
  const paginatedAgreements = sortedAgreements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Canvas Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getMousePos(canvas, e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getMousePos = (canvas: HTMLCanvasElement, e: any) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // Actions
  const handleDuplicate = async (id: string) => {
    try {
      await duplicateMutation.mutateAsync(id);
    } catch (err) {}
  };

  const handleSendEmail = async (id: string) => {
    try {
      await sendMutation.mutateAsync(id);
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!agreementToDelete) return;
    try {
      await deleteMutation.mutateAsync(agreementToDelete._id);
      setAgreementToDelete(null);
    } catch (err) {}
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file (PNG, JPG, or JPEG).",
        variant: "destructive"
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedSignatureData(dataUrl);
      toast({
        title: "Signature Image Loaded",
        description: "Your signature photo has been successfully loaded."
      });
    };
    reader.readAsDataURL(file);
  };

  const handleOpenSign = (agr: any) => {
    setSelectedAgreement(agr);
    setSignedBy(agr.clientInfo?.clientName || "");
    setSignatureMode("draw");
    setUploadedSignatureData("");
    setIsSignOpen(true);
    // Canvas requires rendering before using
    setTimeout(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = canvas.parentElement?.clientWidth || 450;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      }
    }, 150);
  };

  const handleSaveSignature = async () => {
    if (!selectedAgreement) return;

    if (!signedBy.trim()) {
      toast({
        title: "Name required",
        description: "Please specify who is signing this agreement.",
        variant: "destructive",
      });
      return;
    }

    let signatureData = "";
    if (signatureMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return;
      // Convert signature drawing to image base64
      signatureData = canvas.toDataURL("image/png");
    } else {
      if (!uploadedSignatureData) {
        toast({
          title: "Signature required",
          description: "Please upload a photo of your signature or switch to drawing.",
          variant: "destructive",
        });
        return;
      }
      signatureData = uploadedSignatureData;
    }

    try {
      await esignMutation.mutateAsync({
        id: selectedAgreement._id,
        signatureData,
        signedBy,
      });
      setIsSignOpen(false);
      clearCanvas();
      setUploadedSignatureData("");
    } catch (err) {}
  };

  const getStatusBadge = (status: string) => {
    const configs: Record<string, string> = {
      Draft: "bg-slate-500/10 text-slate-400 border-slate-500/20",
      Sent: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      Signed: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      Completed: "bg-success/10 text-success border-success/20",
      Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
    };
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${configs[status] || "bg-info/10 text-info"}`}>
        {status}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-10">
        <PageHeader title="IT Agreements" subtitle="Loading legally governed digital service contracts..." />
        <div className="p-6 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-3xl" />
            ))}
          </div>
          <Skeleton className="h-[450px] rounded-[2rem]" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-10">
      <PageHeader
        title="Agreement Generator"
        subtitle="Professional IT Legal Service Contracts Builder"
        actions={
          <Button
            onClick={() => navigate("/agreements/new")}
            className="premium-gradient premium-glow rounded-xl font-bold text-xs uppercase tracking-wider px-5 py-2.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Agreement
          </Button>
        }
      />

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Contracts"
          value={totalCount.toString()}
          change={`Active contract value: ${formatCurrency(totalValue)}`}
          changeType="neutral"
          icon={FileText}
        />
        <StatCard
          title="Active / Signed"
          value={activeCount.toString()}
          change="Fully binding execution"
          changeType="positive"
          icon={CheckCircle}
          iconColor="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
        />
        <StatCard
          title="Sent to Clients"
          value={sentCount.toString()}
          change="Awaiting signatures"
          changeType="neutral"
          icon={Mail}
          iconColor="bg-blue-500/10 border border-blue-500/20 text-blue-400"
        />
        <StatCard
          title="Draft Contracts"
          value={draftCount.toString()}
          change="Preparation mode"
          changeType="neutral"
          icon={Layers}
          iconColor="bg-amber-500/10 border border-amber-500/20 text-amber-400"
        />
      </div>

      {/* Filter / Search Bar */}
      <div className="glass-card p-6 rounded-2xl border-white/5 shadow-lg flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 items-center flex-1 max-w-2xl">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by ID, client, project, company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl bg-white/[0.02] border-white/10 text-sm focus-visible:ring-primary"
            />
          </div>

          <div className="w-[160px]">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="rounded-xl bg-white/[0.02] border-white/10 text-xs">
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Signed">Signed</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="w-[160px]">
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="rounded-xl bg-white/[0.02] border-white/10 text-xs">
                <SelectValue placeholder="All Formats" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-white/10">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Website">Websites</SelectItem>
                <SelectItem value="Mobile App">Mobile Apps</SelectItem>
                <SelectItem value="Software">Software</SelectItem>
                <SelectItem value="SEO">SEO Ops</SelectItem>
                <SelectItem value="AI Automation">AI Automations</SelectItem>
                <SelectItem value="ERP/CRM">ERP & CRMs</SelectItem>
                <SelectItem value="AMC">AMC Plans</SelectItem>
                <SelectItem value="Other">Other Services</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="glass-card rounded-[2rem] overflow-hidden border-white/5 shadow-2xl">
        {filteredAgreements.length === 0 ? (
          <div className="text-center py-20 px-4 space-y-4">
            <FolderOpen className="w-12 h-12 text-muted-foreground/60 mx-auto" />
            <h3 className="text-lg font-bold">No Agreements Found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Create your first agreement to generate legally structured proposals with digital sign sheets.
            </p>
            <Button onClick={() => navigate("/agreements/new")} className="premium-gradient font-bold text-xs uppercase rounded-xl tracking-tight">
              Create Agreement
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-white/[0.02] border-b border-white/5">
              <TableRow>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Reference ID</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Client Name & Project</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Format</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Budget</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Created Date</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Status</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground px-6 py-4">Sign State</TableHead>
                <TableHead className="font-bold text-xs uppercase text-muted-foreground px-6 py-4 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedAgreements.map((agr: any) => (
                <TableRow key={agr._id} className="hover:bg-white/[0.01] border-b border-white/5 transition-colors">
                  <TableCell className="font-mono text-xs font-bold text-primary px-6 py-4">{agr.agreementId}</TableCell>
                  <TableCell className="px-6 py-4">
                    <div className="space-y-0.5">
                      <p className="text-sm font-bold text-foreground">{agr.clientInfo?.clientName}</p>
                      <p className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                        {agr.projectInfo?.title}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-6 py-4 text-xs font-semibold text-muted-foreground">{agr.projectInfo?.projectType}</TableCell>
                  <TableCell className="px-6 py-4 text-sm font-extrabold text-foreground">{formatCurrency(agr.payment?.totalCost || 0)}</TableCell>
                  <TableCell className="px-6 py-4 text-xs font-semibold text-muted-foreground">{formatDate(agr.createdAt || new Date())}</TableCell>
                  <TableCell className="px-6 py-4">{getStatusBadge(agr.status)}</TableCell>
                  <TableCell className="px-6 py-4">
                    {agr.digitalSignature?.signStatus === "Signed" ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-md border border-emerald-400/20">
                        <CheckCircle className="w-3 h-3" /> Signed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-md border border-amber-400/20">
                        <AlertTriangle className="w-3 h-3" /> Pending
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {agr.digitalSignature?.signStatus !== "Signed" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenSign(agr)}
                          title="Apply Digital E-Signature"
                          className="h-8 w-8 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-amber-400/10"
                        >
                          <PenTool className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/agreements/edit/${agr._id}`)}
                        title="Edit Agreement Form"
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-foreground hover:bg-white/5"
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDuplicate(agr._id)}
                        disabled={duplicateMutation.isPending}
                        title="Duplicate Agreement Template"
                        className="h-8 w-8 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => generateAgreementPDF(agr)}
                        title="Export Multi-page Legal PDF"
                        className="h-8 w-8 rounded-lg text-emerald-400 hover:text-emerald-300 hover:bg-emerald-400/10"
                      >
                        <FileDown className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSendEmail(agr._id)}
                        disabled={sendMutation.isPending}
                        title="Dispatch Agreement by Email"
                        className="h-8 w-8 rounded-lg text-purple-400 hover:text-purple-300 hover:bg-purple-400/10"
                      >
                        <Mail className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setAgreementToDelete(agr)}
                        title="Delete Permanently"
                        className="h-8 w-8 rounded-lg text-destructive hover:text-red-400 hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={sortedAgreements.length}
          itemsPerPage={itemsPerPage}
          itemName="agreements"
        />
      </div>

      {/* Signature Pad Dialog */}
      <Dialog open={isSignOpen} onOpenChange={setIsSignOpen}>
        <DialogContent className="bg-slate-900 border border-white/10 text-white rounded-3xl max-w-lg shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <PenTool className="w-5 h-5 text-amber-400" /> Apply Digital E-Signature
            </DialogTitle>
            <DialogDescription className="text-slate-400 text-xs">
              Review binding legal clauses & execute with HTML5 digital signature pad or upload signature photo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-slate-300">Signed By (Print Name)</Label>
              <Input
                value={signedBy}
                onChange={(e) => setSignedBy(e.target.value)}
                placeholder="Enter client or representative name..."
                className="bg-white/[0.03] border-white/10 text-sm rounded-xl"
              />
            </div>

            {/* Signature Method Tabs */}
            <div className="flex bg-slate-950/50 p-1 border border-white/5 rounded-xl mb-3">
              <button
                type="button"
                onClick={() => setSignatureMode("draw")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  signatureMode === "draw"
                    ? "bg-primary text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <PenTool className="w-3.5 h-3.5" />
                Draw Signature
              </button>
              <button
                type="button"
                onClick={() => setSignatureMode("upload")}
                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  signatureMode === "upload"
                    ? "bg-primary text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                Upload Photo / Image
              </button>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs font-bold text-slate-300">
                  {signatureMode === "draw" ? "Sign in Box Below" : "Upload Signature Image"}
                </Label>
                {signatureMode === "draw" && (
                  <Button variant="ghost" onClick={clearCanvas} className="text-xs text-amber-400 hover:text-amber-300 h-6 px-2 hover:bg-white/5 rounded-md">
                    Clear Box
                  </Button>
                )}
              </div>

              {signatureMode === "draw" ? (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-white">
                  <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair w-full h-[180px] touch-none"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative flex flex-col items-center justify-center text-center group h-[180px]">
                  {uploadedSignatureData ? (
                    <div className="relative group w-full h-full flex items-center justify-center p-1 bg-white rounded-xl">
                      <img
                        src={uploadedSignatureData}
                        alt="Uploaded Signature"
                        className="max-h-full max-w-full object-contain mix-blend-multiply bg-transparent"
                      />
                      <button
                        type="button"
                        onClick={() => setUploadedSignatureData("")}
                        className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform scale-90 group-hover:scale-100 shadow-md"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center space-y-1.5">
                      <div className="p-2.5 bg-white/5 rounded-full text-slate-400 group-hover:text-primary transition-colors">
                        <Image className="w-6 h-6" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-slate-200">
                          Click to upload signature photo
                        </p>
                        <p className="text-[10px] text-slate-400">
                          PNG, JPG or JPEG (Transparent PNG recommended)
                        </p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleSignatureUpload}
                      />
                    </label>
                  )}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsSignOpen(false)} className="rounded-xl text-xs font-bold uppercase text-slate-400 hover:text-white hover:bg-white/5">
              Cancel
            </Button>
            <Button
              onClick={handleSaveSignature}
              disabled={esignMutation.isPending}
              className="premium-gradient premium-glow rounded-xl text-xs font-bold uppercase tracking-wide px-5"
            >
              {esignMutation.isPending ? "Applying..." : "E-Sign Agreement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={!!agreementToDelete} onOpenChange={() => setAgreementToDelete(null)}>
        <AlertDialogContent className="bg-slate-900 border border-white/10 text-white rounded-3xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              <AlertTriangle className="text-destructive w-5 h-5" /> Permanent Delete Confirmation
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400 text-sm">
              Are you sure you want to delete agreement <span className="font-mono font-bold text-primary">{agreementToDelete?.agreementId}</span>? This action is permanent and will void all associated digital legal records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-white/5 border-white/10 rounded-xl hover:bg-white/10 text-white">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-red-600 rounded-xl font-bold">
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Agreements;
