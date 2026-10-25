import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Check,
  Briefcase,
  Users,
  Calendar,
  CreditCard,
  FileText,
  Save,
  PenTool,
  RotateCcw,
  PlusCircle,
  X,
  Sparkles,
  ShieldAlert,
  Building,
  Info,
  DollarSign,
  Upload,
  Image
} from "lucide-react";
import {
  useAgreementDetails,
  useCreateAgreement,
  useUpdateAgreement
} from "@/hooks/useAgreements";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { DatePicker } from "@/components/ui/date-picker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Default template legal clauses
const DEFAULT_CLAUSES = [
  {
    clauseId: "c1",
    title: "1. Intellectual Property & Code Ownership",
    content: "Upon full settlement of all outstanding invoices, the Client owns the custom website, mobile app source code, graphics, and database structures developed specifically for this project. Webflora Technologies retains ownership of any pre-existing modules, generic framework libraries, and operational tools used during development.",
    enabled: true
  },
  {
    clauseId: "c2",
    title: "2. Confidentiality & Non-Disclosure (NDA)",
    content: "Both parties agree to treat all business documents, trade secrets, software methodologies, and client lists shared during the project duration as private and confidential. No information shall be shared with third parties without prior written consent.",
    enabled: true
  },
  {
    clauseId: "c3",
    title: "3. Limitation of Liability",
    content: "Webflora Technologies shall not be held liable for indirect, incidental, special, or consequential damages, including loss of revenue, data, or operation delays. In no event shall total liability exceed the actual fees paid by the client under this agreement.",
    enabled: true
  },
  {
    clauseId: "c4",
    title: "4. Governing Law & Jurisdiction",
    content: "This agreement is governed by the laws of Bihar, India. Any legal dispute, mediation, or proceeding arising under this contract shall be submitted exclusively to the courts of Patna, Bihar.",
    enabled: true
  },
  {
    clauseId: "c5",
    title: "5. Invoice Payment Obligation & Suspension",
    content: "All invoices sent to you, then you have to make payment. If any invoice payment is delayed past 7 days from the invoice date, Webflora Technologies reserves the right to suspend all operational development, server hosting, and support channels until the outstanding dues are settled in full.",
    enabled: true
  },
  {
    clauseId: "c6",
    title: "6. Third-Party Services Disclaimer",
    content: "Webflora Technologies is not responsible for the stability, terms of service, cost fluctuations, or outages of third-party systems such as payment gateways (Razorpay, Stripe), SMS APIs, cloud hosting (AWS, Hostinger), or Google Maps APIs.",
    enabled: true
  },
  {
    clauseId: "c7",
    title: "7. Hosting Responsibility",
    content: "If hosting is not explicitly managed by Webflora Technologies, the Client is responsible for server updates, domain renewals, security patches, and periodic system backups. Webflora Technologies shall not be held liable for data losses due to server misconfiguration by third-party hosting teams.",
    enabled: true
  },
  {
    clauseId: "c8",
    title: "8. Force Majeure",
    content: "Neither party shall be liable for failure to perform commitments due to conditions beyond reasonable control, including natural disasters, internet network failures, war, civil strikes, or government regulations.",
    enabled: true
  }
];

const AVAILABLE_PROJECT_TYPES = [
  "Website Development",
  "Mobile App Development",
  "ERP Software",
  "CRM Software",
  "Custom Software",
  "SEO Services",
  "Digital Marketing",
  "AI Automation",
  "Attendance System",
  "HRMS",
  "E-commerce",
  "MLM Software",
  "SaaS Platform"
];

const CreateEditAgreement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const isEdit = !!id;

  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = 8;

  // React Query
  const { data: agreementData, isLoading: detailsLoading } = useAgreementDetails(id || "");
  const createAgreement = useCreateAgreement();
  const updateAgreement = useUpdateAgreement();

  // Form State
  const [formData, setFormData] = useState<any>({
    status: "Draft",
    companyInfo: {
      companyName: "Webflora Technologies",
      companyAddress: "IOC Colony, Kumhrar, Patna",
      city: "Patna",
      state: "Bihar",
      country: "India",
      zipCode: "800026",
      email: "info@webfloratechnologies.com",
      phone: "+91 8863081255",
      alternatePhone: "+91 8540814729",
      gstNumber: "",
      cinNumber: "",
      website: "www.webfloratechnologies.com",
      logoUrl: "",
      authPersonName: "Shashank Manohar",
      authPersonDesignation: "Director",
      companySignatureUrl: ""
    },
    clientInfo: {
      clientName: "",
      companyName: "",
      address: "",
      city: "",
      state: "",
      country: "",
      zipCode: "",
      email: "",
      phone: "",
      alternatePhone: "",
      gstNumber: "",
      clientDesignation: "CEO"
    },
    projectInfo: {
      title: "",
      projectCategory: "Web Development",
      projectType: "Website Development",
      description: "",
      techStack: [] as string[],
      featuresIncluded: [] as string[],
      deliverables: [] as string[],
      adminPanelIncluded: false,
      mobileAppIncluded: false,
      apiIntegration: false,
      hostingIncluded: false,
      seoIncluded: false,
      aiAutomationIncluded: false,
      maintenanceIncluded: false,
      cloudServicesIncluded: false
    },
    timeline: {
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      expectedDeliveryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      milestones: [] as any[],
      deliveryTimeline: "30 working days from receipt of advance payment.",
      developmentTimeline: "20 working days.",
      testingTimeline: "5 working days.",
      deploymentTimeline: "5 working days.",
      delayConditions: "Delays in providing project assets (images, texts, API keys) will shift timeline accordingly."
    },
    payment: {
      totalCost: 0,
      currency: "INR",
      advancePayment: 0,
      midPayment: 0,
      finalPayment: 0,
      monthlyCharges: 0,
      yearlyCharges: 0,
      amcCharges: 0,
      hostingCharges: 0,
      seoCharges: 0,
      gstPercentage: 18,
      taxAmount: 0,
      discount: 0,
      latePaymentCharges: "1.5% interest per month on outstanding dues after 7 days.",
      paymentTerms: "All invoices sent to you, then you have to make payment. Payments are to be made within 7 days of invoice presentation date.",
      refundPolicy: "Advance booking amounts are non-refundable once design assets are locked.",
      privacyPolicy: "Webflora Technologies is committed to protecting your privacy and data. Any personal information, project assets, database records, and trade credentials shared with us will be processed, stored, and utilized strictly for the performance of software development services and operational support. We do not sell, rent, or share confidential client data with unauthorized third parties except as required by law.",
      paymentMode: "Bank Transfer"
    },
    serviceCommitment: {
      commitmentRequired: false,
      commitmentType: "No Commitment",
      commitmentDuration: "No Commitment",
      lockInPeriod: 0,
      lockInStartDate: new Date().toISOString(),
      earlyTerminationCharges: "50% of the remaining contract duration charges.",
      recoveryCharges: "No recovery charges apply.",
      noticePeriod: "30 Days written notice required.",
      renewalTerms: "Auto-renew for next 1 year period unless notified in writing.",
      includedServices: [] as string[]
    },
    revisionSupport: {
      freeRevisions: 3,
      freeSupportDuration: "30 Days",
      amcCharges: 0,
      paidSupportTerms: "Subsequent support available at Rs 1,500/hour or custom AMC contract.",
      extraRevisionCharges: 1000,
      bugFixSupport: "Free lifetime support for bugs directly relating to developed logic.",
      emergencySupport: "24/7 Server monitoring and resolution support for high priority outages.",
      slaResponseTime: "SLA Response under 4 hours, resolution under 24 hours for Critical bugs."
    },
    clauses: DEFAULT_CLAUSES,
    digitalSignature: {
      signatureData: "",
      signedBy: "",
      signedAt: null,
      signStatus: "Pending"
    }
  });

  // Array item temp inputs
  const [techInput, setTechInput] = useState("");
  const [featureInput, setFeatureInput] = useState("");
  const [delInput, setDelInput] = useState("");

  // Signature Canvas in Step 5 (or Step 8)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureMode, setSignatureMode] = useState<"draw" | "upload">("draw");

  // Initialize form in edit mode
  useEffect(() => {
    if (isEdit && agreementData) {
      const agr = agreementData;
      setFormData({
        status: agr.status || "Draft",
        companyInfo: { ...formData.companyInfo, ...agr.companyInfo },
        clientInfo: { ...formData.clientInfo, ...agr.clientInfo },
        projectInfo: {
          ...formData.projectInfo,
          ...agr.projectInfo,
          techStack: agr.projectInfo?.techStack || [],
          featuresIncluded: agr.projectInfo?.featuresIncluded || [],
          deliverables: agr.projectInfo?.deliverables || []
        },
        timeline: {
          ...formData.timeline,
          ...agr.timeline,
          startDate: agr.timeline?.startDate ? new Date(agr.timeline.startDate).toISOString() : new Date().toISOString(),
          endDate: agr.timeline?.endDate ? new Date(agr.timeline.endDate).toISOString() : new Date().toISOString(),
          expectedDeliveryDate: agr.timeline?.expectedDeliveryDate ? new Date(agr.timeline.expectedDeliveryDate).toISOString() : new Date().toISOString()
        },
        payment: { ...formData.payment, ...agr.payment },
        serviceCommitment: {
          ...formData.serviceCommitment,
          ...agr.serviceCommitment,
          includedServices: agr.serviceCommitment?.includedServices || []
        },
        revisionSupport: { ...formData.revisionSupport, ...agr.revisionSupport },
        clauses: agr.clauses && agr.clauses.length > 0 ? agr.clauses : DEFAULT_CLAUSES,
        digitalSignature: { ...formData.digitalSignature, ...agr.digitalSignature }
      });
    }
  }, [isEdit, agreementData]);

  // Dynamic calculations
  useEffect(() => {
    const cost = Number(formData.payment.totalCost) || 0;
    const discount = Number(formData.payment.discount) || 0;
    const gstPercent = Number(formData.payment.gstPercentage) || 0;
    const taxableCost = Math.max(0, cost - discount);
    const tax = Math.round((taxableCost * gstPercent) / 100);

    setFormData((prev: any) => ({
      ...prev,
      payment: {
        ...prev.payment,
        taxAmount: tax
      }
    }));
  }, [formData.payment.totalCost, formData.payment.discount, formData.payment.gstPercentage]);

  // Nested form updates helper
  const updateNestedField = (section: string, field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Add Item to Arrays
  const addArrayItem = (field: "techStack" | "featuresIncluded" | "deliverables", value: string, clearFn: () => void) => {
    if (!value.trim()) return;
    setFormData((prev: any) => {
      const currentArray = prev.projectInfo?.[field] || [];
      return {
        ...prev,
        projectInfo: {
          ...prev.projectInfo,
          [field]: [...currentArray, value.trim()]
        }
      };
    });
    clearFn();
  };

  const removeArrayItem = (field: "techStack" | "featuresIncluded" | "deliverables", index: number) => {
    setFormData((prev: any) => {
      const currentArray = prev.projectInfo?.[field] || [];
      return {
        ...prev,
        projectInfo: {
          ...prev.projectInfo,
          [field]: currentArray.filter((_: any, i: number) => i !== index)
        }
      };
    });
  };



  // Step 6: Service Commitment Helper
  const toggleCommitmentService = (service: string) => {
    const current = formData.serviceCommitment.includedServices || [];
    const updated = current.includes(service)
      ? current.filter((s: string) => s !== service)
      : [...current, service];
    updateNestedField("serviceCommitment", "includedServices", updated);
  };

  // Canvas Handlers (Step 8 Signature Pad)
  const startDrawing = (e: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const pos = getMousePos(canvas, e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    setIsDrawing(true);
  };

  const draw = (e: any) => {
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
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    updateNestedField("digitalSignature", "signatureData", "");
  };

  const saveCanvasSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const signatureData = canvas.toDataURL("image/png");
    updateNestedField("digitalSignature", "signatureData", signatureData);
    updateNestedField("digitalSignature", "signStatus", "Signed");
    updateNestedField("digitalSignature", "signedAt", new Date().toISOString());
    toast({ title: "Authorized Signature Locked", description: "Drawing applied successfully to the legal execution block." });
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
      updateNestedField("digitalSignature", "signatureData", dataUrl);
      updateNestedField("digitalSignature", "signStatus", "Signed");
      updateNestedField("digitalSignature", "signedAt", new Date().toISOString());
      toast({
        title: "Signature Image Loaded",
        description: "Your signature photo has been successfully applied to the document execution block."
      });
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSave = async () => {
    if (!formData.clientInfo.clientName || !formData.clientInfo.email) {
      toast({
        title: "Client details missing",
        description: "Please specify at least a Client Name and Client Email.",
        variant: "destructive"
      });
      setActiveStep(2);
      return;
    }
    if (!formData.projectInfo.title) {
      toast({
        title: "Project title missing",
        description: "Please fill in the project title.",
        variant: "destructive"
      });
      setActiveStep(3);
      return;
    }

    try {
      if (isEdit) {
        await updateAgreement.mutateAsync({ id: id!, data: formData });
      } else {
        await createAgreement.mutateAsync(formData);
      }
      navigate("/agreements");
    } catch (err) { }
  };

  const nextStep = () => {
    if (activeStep < totalSteps) setActiveStep(activeStep + 1);
  };

  const prevStep = () => {
    if (activeStep > 1) setActiveStep(activeStep - 1);
  };

  // Dynamic Wording for Commitment Section
  const getDynamicLockInText = () => {
    if (!formData.serviceCommitment.commitmentRequired) {
      return "No minimum lock-in commitment is enforced under the terms of this agreement.";
    }
    return `The Client explicitly agrees to a minimum service lock-in commitment of ${formData.serviceCommitment.commitmentDuration || "1 Year"
      } commencing on ${formData.serviceCommitment.lockInStartDate
        ? new Date(formData.serviceCommitment.lockInStartDate).toLocaleDateString("en-IN")
        : "the contract start date"
      }. During this period, the Client agrees to retain and pay for all active services, including: ${formData.serviceCommitment.includedServices && formData.serviceCommitment.includedServices.length > 0
        ? formData.serviceCommitment.includedServices.join(", ")
        : "Hosting, AMC, and Server Management"
      }. Early termination prior to the commitment end date will trigger termination fees of ${formData.serviceCommitment.earlyTerminationCharges || "50% of the remaining contract duration charges"
      } and recovery/setup charges of ${formData.serviceCommitment.recoveryCharges || "zero rupees"
      }, subject to a mandatory written notice period of ${formData.serviceCommitment.noticePeriod || "30 days"
      }.`;
  };

  // Render Step Title
  const getStepHeader = () => {
    switch (activeStep) {
      case 1:
        return { title: "1. Company Information", desc: "Define contracting service provider company files & legal signing authorities.", icon: Building };
      case 2:
        return { title: "2. Client Information", desc: "Identify the client organization, representative title & billing addresses.", icon: Users };
      case 3:
        return { title: "3. Project Details", desc: "Specify contract scope, project type, core features & deliverables checklist.", icon: Briefcase };
      case 4:
        return { title: "4. Project Timeline", desc: "Schedule project phases, developmental sprints, testing, & delay conditions.", icon: Calendar };
      case 5:
        return { title: "5. Payment Structure", desc: "Establish pricing models, monthly retainer, GST, late payment penalties & terms.", icon: DollarSign };
      case 6:
        return { title: "6. Minimum Commitment", desc: "Design lock-in clauses, included maintenance assets, notice periods & termination terms.", icon: ShieldAlert };
      case 7:
        return { title: "7. Revisions & SLA Support", desc: "Define free revision quotas, post-launch support cycles & response time SLAs.", icon: Info };
      case 8:
        return { title: "8. Legal Clauses & E-Sign", desc: "Review binding legal clauses & execute with HTML5 digital signature pad.", icon: FileText };
      default:
        return { title: "Contract Agreement", desc: "", icon: FileText };
    }
  };

  const currentHeader = getStepHeader();

  if (isEdit && detailsLoading) {
    return (
      <div className="space-y-10">
        <PageHeader title="Loading Contract" subtitle="Retrieving draft records from the database secure vault..." />
        <div className="flex items-center justify-center py-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: formData.payment.currency || "INR",
      maximumFractionDigits: 0
    }).format(value);
  };



  return (
    <div className="space-y-6 pb-10">
      <PageHeader
        title={isEdit ? `Edit Contract: ${formData.projectInfo.title || "Draft"}` : "Create IT Service Agreement"}
        subtitle="Dynamic 8-step enterprise legal form builder with paper live-render sidecar"
        actions={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => navigate("/agreements")} className="text-slate-400 hover:text-white rounded-xl text-xs font-bold uppercase">
              Discard
            </Button>
            <Button
              onClick={handleSave}
              disabled={createAgreement.isPending || updateAgreement.isPending}
              className="premium-gradient premium-glow rounded-xl text-xs font-bold uppercase tracking-wider px-5 flex items-center gap-2"
            >
              <Save className="w-4 h-4" /> Save Agreement
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: MULTI-STEP FORM EDITOR */}
        <div className="xl:col-span-7 space-y-6">
          {/* Step Progress Bubble bar */}
          <div className="glass-card p-4 rounded-2xl border-white/5 flex justify-between items-center bg-white/[0.01] overflow-x-auto gap-2">
            {[...Array(totalSteps)].map((_, i) => {
              const step = i + 1;
              const isPassed = activeStep > step;
              const isCurrent = activeStep === step;
              return (
                <div key={step} className="flex items-center flex-1 last:flex-initial min-w-[36px]">
                  <button
                    onClick={() => setActiveStep(step)}
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border transition-all duration-300 ${isCurrent
                        ? "bg-primary border-primary text-white premium-glow scale-110"
                        : isPassed
                          ? "bg-primary/20 border-primary/30 text-primary"
                          : "bg-slate-900 border-white/10 text-slate-500 hover:border-white/20"
                      }`}
                  >
                    {isPassed ? <Check className="w-4 h-4" /> : step}
                  </button>
                  {step < totalSteps && (
                    <div className={`h-0.5 flex-1 mx-2 transition-all duration-500 min-w-[10px] ${activeStep > step ? "bg-primary/50" : "bg-white/5"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Form Content Card */}
          <div className="glass-card rounded-[2rem] border-white/5 overflow-hidden shadow-2xl">
            {/* Step Header */}
            <div className="bg-white/[0.02] border-b border-white/5 p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                <currentHeader.icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">{currentHeader.title}</h2>
                <p className="text-xs text-muted-foreground">{currentHeader.desc}</p>
              </div>
            </div>

            {/* Step Fields */}
            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStep}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  {/* STEP 1: COMPANY INFORMATION */}
                  {activeStep === 1 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Company Name</Label>
                          <Input
                            value={formData.companyInfo.companyName}
                            onChange={(e) => updateNestedField("companyInfo", "companyName", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Email Address</Label>
                          <Input
                            value={formData.companyInfo.email}
                            onChange={(e) => updateNestedField("companyInfo", "email", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Phone Number</Label>
                          <Input
                            value={formData.companyInfo.phone}
                            onChange={(e) => updateNestedField("companyInfo", "phone", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Alternate Phone</Label>
                          <Input
                            value={formData.companyInfo.alternatePhone}
                            onChange={(e) => updateNestedField("companyInfo", "alternatePhone", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Website URL</Label>
                          <Input
                            value={formData.companyInfo.website}
                            onChange={(e) => updateNestedField("companyInfo", "website", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Authorized Representative</Label>
                          <Input
                            value={formData.companyInfo.authPersonName}
                            onChange={(e) => updateNestedField("companyInfo", "authPersonName", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Representative Designation</Label>
                          <Input
                            value={formData.companyInfo.authPersonDesignation}
                            onChange={(e) => updateNestedField("companyInfo", "authPersonDesignation", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="md:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-300">City</Label>
                            <Input
                              value={formData.companyInfo.city}
                              onChange={(e) => updateNestedField("companyInfo", "city", e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-300">State</Label>
                            <Input
                              value={formData.companyInfo.state}
                              onChange={(e) => updateNestedField("companyInfo", "state", e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-300">Country</Label>
                            <Input
                              value={formData.companyInfo.country}
                              onChange={(e) => updateNestedField("companyInfo", "country", e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-300">ZIP Code</Label>
                            <Input
                              value={formData.companyInfo.zipCode}
                              onChange={(e) => updateNestedField("companyInfo", "zipCode", e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Registered Office Address</Label>
                          <Input
                            value={formData.companyInfo.companyAddress}
                            onChange={(e) => updateNestedField("companyInfo", "companyAddress", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: CLIENT INFORMATION */}
                  {activeStep === 2 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Client Name <span className="text-primary">*</span></Label>
                          <Input
                            value={formData.clientInfo.clientName}
                            placeholder="e.g. Shashank Manohar"
                            onChange={(e) => updateNestedField("clientInfo", "clientName", e.target.value)}
                            className="bg-white/[0.02] border-white/10 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Client Designation</Label>
                          <Input
                            value={formData.clientInfo.clientDesignation}
                            placeholder="e.g. Chief Executive Officer (CEO)"
                            onChange={(e) => updateNestedField("clientInfo", "clientDesignation", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Client Company Name</Label>
                          <Input
                            value={formData.clientInfo.companyName}
                            placeholder="e.g. Webflora Digital Inc."
                            onChange={(e) => updateNestedField("clientInfo", "companyName", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Contact Email <span className="text-primary">*</span></Label>
                          <Input
                            value={formData.clientInfo.email}
                            placeholder="e.g. client@email.com"
                            onChange={(e) => updateNestedField("clientInfo", "email", e.target.value)}
                            className="bg-white/[0.02] border-white/10 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Mobile Phone</Label>
                          <Input
                            value={formData.clientInfo.phone}
                            placeholder="e.g. +91 9988776655"
                            onChange={(e) => updateNestedField("clientInfo", "phone", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Alternate Phone</Label>
                          <Input
                            value={formData.clientInfo.alternatePhone}
                            placeholder="Alternate Phone number"
                            onChange={(e) => updateNestedField("clientInfo", "alternatePhone", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-300">City</Label>
                            <Input
                              value={formData.clientInfo.city}
                              placeholder="City"
                              onChange={(e) => updateNestedField("clientInfo", "city", e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-300">State</Label>
                            <Input
                              value={formData.clientInfo.state}
                              placeholder="State"
                              onChange={(e) => updateNestedField("clientInfo", "state", e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-300">Country</Label>
                            <Input
                              value={formData.clientInfo.country}
                              placeholder="Country"
                              onChange={(e) => updateNestedField("clientInfo", "country", e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-[11px] font-bold text-slate-300">ZIP Code</Label>
                            <Input
                              value={formData.clientInfo.zipCode}
                              placeholder="ZIP"
                              onChange={(e) => updateNestedField("clientInfo", "zipCode", e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                            />
                          </div>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Client Address</Label>
                          <Input
                            value={formData.clientInfo.address}
                            placeholder="Corporate Address street, floor number, block"
                            onChange={(e) => updateNestedField("clientInfo", "address", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: PROJECT DETAILS */}
                  {activeStep === 3 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Project Title <span className="text-primary">*</span></Label>
                          <Input
                            value={formData.projectInfo.title}
                            placeholder="e.g. B2B Corporate E-Commerce Portal"
                            onChange={(e) => updateNestedField("projectInfo", "title", e.target.value)}
                            className="bg-white/[0.02] border-white/10 focus-visible:ring-primary"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Project Category</Label>
                          <Input
                            value={formData.projectInfo.projectCategory}
                            placeholder="e.g. Custom Software / Web Application"
                            onChange={(e) => updateNestedField("projectInfo", "projectCategory", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Project Agreement Category</Label>
                          <Select
                            value={formData.projectInfo.projectType}
                            onValueChange={(val) => updateNestedField("projectInfo", "projectType", val)}
                          >
                            <SelectTrigger className="bg-white/[0.02] border-white/10">
                              <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              {AVAILABLE_PROJECT_TYPES.map((type) => (
                                <SelectItem key={type} value={type}>{type}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Project Description & Scope</Label>
                          <Textarea
                            value={formData.projectInfo.description}
                            placeholder="Outline details about project architecture, user roles, design style..."
                            rows={4}
                            onChange={(e) => updateNestedField("projectInfo", "description", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                      </div>

                      {/* Checklist toggles */}
                      <div className="border-t border-white/5 pt-4 space-y-3">
                        <Label className="text-xs font-bold text-slate-300 block mb-1">Included Technical Modules</Label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {[
                            { key: "adminPanelIncluded", label: "Admin Panel" },
                            { key: "mobileAppIncluded", label: "Mobile App" },
                            { key: "apiIntegration", label: "API Integration" },
                            { key: "hostingIncluded", label: "Hosting Included" },
                            { key: "seoIncluded", label: "SEO Campaign" },
                            { key: "aiAutomationIncluded", label: "AI Workflows" },
                            { key: "maintenanceIncluded", label: "Support AMC" },
                            { key: "cloudServicesIncluded", label: "Cloud Deploy" }
                          ].map((item) => (
                            <div key={item.key} className="flex items-center gap-2 bg-white/[0.01] border border-white/5 p-2 rounded-xl">
                              <Switch
                                checked={formData.projectInfo[item.key]}
                                onCheckedChange={(v) => updateNestedField("projectInfo", item.key, v)}
                              />
                              <span className="text-[10px] font-bold text-slate-300">{item.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Arrays Inputs */}
                      <div className="space-y-4 pt-2">
                        {/* Tech Stack */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-300">Technologies Utilized (Tech Stack)</Label>
                          <div className="flex gap-2">
                            <Input
                              value={techInput}
                              placeholder="e.g. Next.js, Node.js, MongoDB"
                              onChange={(e) => setTechInput(e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addArrayItem("techStack", techInput, () => setTechInput(""));
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() => addArrayItem("techStack", techInput, () => setTechInput(""))}
                              className="bg-slate-800 text-slate-200 hover:bg-slate-700"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {formData.projectInfo.techStack.map((tech: string, i: number) => (
                              <span key={i} className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/5 border border-white/10 px-2 py-0.5 rounded-md text-primary">
                                {tech}
                                <X className="w-3 h-3 cursor-pointer text-slate-400 hover:text-white" onClick={() => removeArrayItem("techStack", i)} />
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Features */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-300">Key Features Included</Label>
                          <div className="flex gap-2">
                            <Input
                              value={featureInput}
                              placeholder="e.g. OTP Mobile Login, Real-time SMS Analytics"
                              onChange={(e) => setFeatureInput(e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addArrayItem("featuresIncluded", featureInput, () => setFeatureInput(""));
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() => addArrayItem("featuresIncluded", featureInput, () => setFeatureInput(""))}
                              className="bg-slate-800 text-slate-200 hover:bg-slate-700"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto">
                            {formData.projectInfo.featuresIncluded.map((feat: string, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                <span>- {feat}</span>
                                <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 cursor-pointer" onClick={() => removeArrayItem("featuresIncluded", i)} />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Deliverables */}
                        <div className="space-y-2">
                          <Label className="text-xs font-bold text-slate-300">Project Key Deliverables</Label>
                          <div className="flex gap-2">
                            <Input
                              value={delInput}
                              placeholder="e.g. Fully documented source code on GitHub"
                              onChange={(e) => setDelInput(e.target.value)}
                              className="bg-white/[0.02] border-white/10"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addArrayItem("deliverables", delInput, () => setDelInput(""));
                                }
                              }}
                            />
                            <Button
                              type="button"
                              onClick={() => addArrayItem("deliverables", delInput, () => setDelInput(""))}
                              className="bg-slate-800 text-slate-200 hover:bg-slate-700"
                            >
                              Add
                            </Button>
                          </div>
                          <div className="space-y-1.5 mt-2 max-h-40 overflow-y-auto">
                            {formData.projectInfo.deliverables.map((del: string, i: number) => (
                              <div key={i} className="flex items-center justify-between bg-white/[0.02] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-semibold">
                                <span>- {del}</span>
                                <Trash2 className="w-3.5 h-3.5 text-slate-500 hover:text-red-400 cursor-pointer" onClick={() => removeArrayItem("deliverables", i)} />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: TIMELINE & MILESTONES */}
                  {activeStep === 4 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300 block mb-1">Contract Start Date</Label>
                          <DatePicker
                            date={formData.timeline.startDate ? new Date(formData.timeline.startDate) : undefined}
                            setDate={(date) => updateNestedField("timeline", "startDate", date?.toISOString() || null)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300 block mb-1">Target End Date</Label>
                          <DatePicker
                            date={formData.timeline.endDate ? new Date(formData.timeline.endDate) : undefined}
                            setDate={(date) => updateNestedField("timeline", "endDate", date?.toISOString() || null)}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300 block mb-1">Expected Delivery Date</Label>
                          <DatePicker
                            date={formData.timeline.expectedDeliveryDate ? new Date(formData.timeline.expectedDeliveryDate) : undefined}
                            setDate={(date) => updateNestedField("timeline", "expectedDeliveryDate", date?.toISOString() || null)}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Development Sprint Duration</Label>
                          <Input
                            value={formData.timeline.developmentTimeline}
                            onChange={(e) => updateNestedField("timeline", "developmentTimeline", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Testing & QA Duration</Label>
                          <Input
                            value={formData.timeline.testingTimeline}
                            onChange={(e) => updateNestedField("timeline", "testingTimeline", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Deployment & Rollout Time</Label>
                          <Input
                            value={formData.timeline.deploymentTimeline}
                            onChange={(e) => updateNestedField("timeline", "deploymentTimeline", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Delivery Staging Terms / Timeline Description</Label>
                          <Input
                            value={formData.timeline.deliveryTimeline}
                            onChange={(e) => updateNestedField("timeline", "deliveryTimeline", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Client Delays & Postponement Conditions</Label>
                          <Textarea
                            value={formData.timeline.delayConditions}
                            rows={3}
                            onChange={(e) => updateNestedField("timeline", "delayConditions", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                          />
                        </div>
                      </div>


                    </div>
                  )}

                  {/* STEP 5: PAYMENT STRUCTURE */}
                  {activeStep === 5 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Total Contract Value</Label>
                          <Input
                            type="number"
                            value={formData.payment.totalCost}
                            onChange={(e) => updateNestedField("payment", "totalCost", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10 focus-visible:ring-primary font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Currency Code</Label>
                          <Select
                            value={formData.payment.currency}
                            onValueChange={(val) => updateNestedField("payment", "currency", val)}
                          >
                            <SelectTrigger className="bg-white/[0.02] border-white/10">
                              <SelectValue placeholder="Select Currency" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              <SelectItem value="INR">INR (₹) - Indian Rupee</SelectItem>
                              <SelectItem value="USD">USD ($) - US Dollar</SelectItem>
                              <SelectItem value="EUR">EUR (€) - Euro</SelectItem>
                              <SelectItem value="GBP">GBP (£) - British Pound</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">GST Percentage (%)</Label>
                          <Input
                            type="number"
                            value={formData.payment.gstPercentage}
                            onChange={(e) => updateNestedField("payment", "gstPercentage", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-300">Advance Commitment</Label>
                          <Input
                            type="number"
                            value={formData.payment.advancePayment}
                            onChange={(e) => updateNestedField("payment", "advancePayment", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-300">Mid-term payment</Label>
                          <Input
                            type="number"
                            value={formData.payment.midPayment}
                            onChange={(e) => updateNestedField("payment", "midPayment", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-300">Final Release</Label>
                          <Input
                            type="number"
                            value={formData.payment.finalPayment}
                            onChange={(e) => updateNestedField("payment", "finalPayment", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-300">Discount Offered</Label>
                          <Input
                            type="number"
                            value={formData.payment.discount}
                            onChange={(e) => updateNestedField("payment", "discount", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10 text-emerald-400"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-300">Monthly Maintenance</Label>
                          <Input
                            type="number"
                            value={formData.payment.monthlyCharges}
                            onChange={(e) => updateNestedField("payment", "monthlyCharges", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-300">Yearly Charges</Label>
                          <Input
                            type="number"
                            value={formData.payment.yearlyCharges}
                            onChange={(e) => updateNestedField("payment", "yearlyCharges", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-300">Annual AMC Price</Label>
                          <Input
                            type="number"
                            value={formData.payment.amcCharges}
                            onChange={(e) => updateNestedField("payment", "amcCharges", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-[11px] font-bold text-slate-300">Cloud/Hosting Fee</Label>
                          <Input
                            type="number"
                            value={formData.payment.hostingCharges}
                            onChange={(e) => updateNestedField("payment", "hostingCharges", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Payment Routing Modes</Label>
                          <Select
                            value={formData.payment.paymentMode}
                            onValueChange={(val) => updateNestedField("payment", "paymentMode", val)}
                          >
                            <SelectTrigger className="bg-white/[0.02] border-white/10 text-xs">
                              <SelectValue placeholder="Select Payment Mode" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              <SelectItem value="Bank Transfer">Bank Transfer (IMPS/NEFT)</SelectItem>
                              <SelectItem value="UPI">UPI (Unified Payments Interface)</SelectItem>
                              <SelectItem value="Stripe">Stripe Secure Portal</SelectItem>
                              <SelectItem value="Razorpay">Razorpay Billing Portal</SelectItem>
                              <SelectItem value="PayPal">PayPal Gateways</SelectItem>
                              <SelectItem value="Cash">Cash settlement</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Calculated Summary</Label>
                          <div className="p-3 bg-white/[0.02] border border-white/10 rounded-xl grid grid-cols-3 text-center text-xs">
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase">Discount</p>
                              <p className="font-bold text-emerald-400">{formatCurrency(formData.payment.discount)}</p>
                            </div>
                            <div className="border-l border-r border-white/5">
                              <p className="text-[10px] text-slate-400 uppercase">Estimated Tax ({formData.payment.gstPercentage}%)</p>
                              <p className="font-bold text-amber-400">{formatCurrency(formData.payment.taxAmount)}</p>
                            </div>
                            <div>
                              <p className="text-[10px] text-slate-400 uppercase">Net Payable</p>
                              <p className="font-bold text-primary">
                                {formatCurrency(Math.max(0, formData.payment.totalCost - formData.payment.discount) + formData.payment.taxAmount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Payment Schedules & Terms</Label>
                          <Textarea
                            value={formData.payment.paymentTerms}
                            rows={3}
                            onChange={(e) => updateNestedField("payment", "paymentTerms", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Late Payment Interest Fees</Label>
                          <Textarea
                            value={formData.payment.latePaymentCharges}
                            rows={3}
                            onChange={(e) => updateNestedField("payment", "latePaymentCharges", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Cancellation & Refund Policy</Label>
                          <Textarea
                            value={formData.payment.refundPolicy}
                            rows={2}
                            onChange={(e) => updateNestedField("payment", "refundPolicy", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Privacy Policy & Data Protection</Label>
                          <Textarea
                            value={formData.payment.privacyPolicy || ""}
                            rows={3}
                            onChange={(e) => updateNestedField("payment", "privacyPolicy", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                            placeholder="Enter privacy policy and data security clauses..."
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 6: MINIMUM SERVICE COMMITMENT */}
                  {activeStep === 6 && (
                    <div className="space-y-6">
                      <div className="flex items-center gap-4 bg-white/[0.01] border border-white/5 p-4 rounded-2xl">
                        <Switch
                          checked={formData.serviceCommitment.commitmentRequired}
                          onCheckedChange={(v) => updateNestedField("serviceCommitment", "commitmentRequired", v)}
                        />
                        <div>
                          <Label className="text-sm font-bold text-slate-200 block cursor-pointer">Enforce Minimum Lock-In Commitment</Label>
                          <span className="text-[10px] text-muted-foreground">Requires the client to subscribe to recurring maintenance services for a defined billing lock period.</span>
                        </div>
                      </div>

                      {formData.serviceCommitment.commitmentRequired && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="space-y-4 border-l-2 border-primary/20 pl-4 pt-2"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-300">Commitment Duration</Label>
                              <Select
                                value={formData.serviceCommitment.commitmentDuration}
                                onValueChange={(val) => {
                                  updateNestedField("serviceCommitment", "commitmentDuration", val);
                                  const months = val === "1 Year" ? 12 : val === "3 Years" ? 36 : val === "5 Years" ? 60 : 0;
                                  updateNestedField("serviceCommitment", "lockInPeriod", months);
                                }}
                              >
                                <SelectTrigger className="bg-white/[0.02] border-white/10 text-xs">
                                  <SelectValue placeholder="No Commitment" />
                                </SelectTrigger>
                                <SelectContent className="bg-slate-900 border-white/10 text-white">
                                  <SelectItem value="1 Year">1 Year Lock-in</SelectItem>
                                  <SelectItem value="3 Years">3 Years Lock-in</SelectItem>
                                  <SelectItem value="5 Years">5 Years Lock-in</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-300 block mb-1">Lock-in Start Date</Label>
                              <DatePicker
                                date={formData.serviceCommitment.lockInStartDate ? new Date(formData.serviceCommitment.lockInStartDate) : undefined}
                                setDate={(date) => updateNestedField("serviceCommitment", "lockInStartDate", date?.toISOString() || null)}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-300">Notice Period</Label>
                              <Input
                                value={formData.serviceCommitment.noticePeriod}
                                onChange={(e) => updateNestedField("serviceCommitment", "noticePeriod", e.target.value)}
                                className="bg-white/[0.02] border-white/10"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-300">Early Termination charges</Label>
                              <Input
                                value={formData.serviceCommitment.earlyTerminationCharges}
                                onChange={(e) => updateNestedField("serviceCommitment", "earlyTerminationCharges", e.target.value)}
                                className="bg-white/[0.02] border-white/10"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs font-bold text-slate-300">Recovery & Setup Charges</Label>
                              <Input
                                value={formData.serviceCommitment.recoveryCharges}
                                onChange={(e) => updateNestedField("serviceCommitment", "recoveryCharges", e.target.value)}
                                className="bg-white/[0.02] border-white/10"
                              />
                            </div>
                            <div className="md:col-span-2 space-y-1.5">
                              <Label className="text-xs font-bold text-slate-300">Renewal Terms</Label>
                              <Input
                                value={formData.serviceCommitment.renewalTerms}
                                onChange={(e) => updateNestedField("serviceCommitment", "renewalTerms", e.target.value)}
                                className="bg-white/[0.02] border-white/10"
                              />
                            </div>
                          </div>

                          {/* Commitment services checklist */}
                          <div className="space-y-2 pt-2">
                            <Label className="text-xs font-bold text-slate-300">Services Bound by Lock-in</Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                              {[
                                "Hosting",
                                "AMC Support",
                                "Technical Support",
                                "SEO Operations",
                                "App Maintenance",
                                "Server Management",
                                "Cloud Services",
                                "Security Monitoring"
                              ].map((serv) => {
                                const isSel = formData.serviceCommitment.includedServices?.includes(serv);
                                return (
                                  <button
                                    key={serv}
                                    type="button"
                                    onClick={() => toggleCommitmentService(serv)}
                                    className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold transition-all ${isSel
                                        ? "bg-primary/20 border-primary text-primary"
                                        : "bg-white/[0.01] border-white/5 text-slate-400 hover:border-white/10"
                                      }`}
                                  >
                                    {serv}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          {/* Dynamic legally worded clause block */}
                          <div className="bg-slate-950/40 p-4 border border-white/5 rounded-2xl space-y-2 mt-4">
                            <h4 className="text-xs font-extrabold uppercase text-primary flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-primary" /> Generated Legal Wording
                            </h4>
                            <p className="text-[10px] text-slate-300 leading-relaxed font-mono whitespace-normal">
                              {getDynamicLockInText()}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* STEP 7: REVISIONS & SUPPORT */}
                  {activeStep === 7 && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Free Design Revisions Quota</Label>
                          <Input
                            type="number"
                            value={formData.revisionSupport.freeRevisions}
                            onChange={(e) => updateNestedField("revisionSupport", "freeRevisions", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Extra Revision Fee (Per Rev)</Label>
                          <Input
                            type="number"
                            value={formData.revisionSupport.extraRevisionCharges}
                            onChange={(e) => updateNestedField("revisionSupport", "extraRevisionCharges", Number(e.target.value) || 0)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Free Support Duration</Label>
                          <Input
                            value={formData.revisionSupport.freeSupportDuration}
                            onChange={(e) => updateNestedField("revisionSupport", "freeSupportDuration", e.target.value)}
                            className="bg-white/[0.02] border-white/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Bug Fixing Policy</Label>
                          <Textarea
                            value={formData.revisionSupport.bugFixSupport}
                            rows={3}
                            onChange={(e) => updateNestedField("revisionSupport", "bugFixSupport", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Paid Technical Support Terms</Label>
                          <Textarea
                            value={formData.revisionSupport.paidSupportTerms}
                            rows={3}
                            onChange={(e) => updateNestedField("revisionSupport", "paidSupportTerms", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">Emergency Outage / Hosting Outages support</Label>
                          <Textarea
                            value={formData.revisionSupport.emergencySupport}
                            rows={3}
                            onChange={(e) => updateNestedField("revisionSupport", "emergencySupport", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label className="text-xs font-bold text-slate-300">SLA Response Time Standards</Label>
                          <Textarea
                            value={formData.revisionSupport.slaResponseTime}
                            rows={3}
                            onChange={(e) => updateNestedField("revisionSupport", "slaResponseTime", e.target.value)}
                            className="bg-white/[0.02] border-white/10 text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 8: LEGAL CLAUSES & E-SIGN PAD */}
                  {activeStep === 8 && (
                    <div className="space-y-6">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center border-b border-white/5 pb-2">
                          <h3 className="text-sm font-bold text-slate-200">Legal Agreement Clauses</h3>
                          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-bold">PATNA JURISDICTION GOVERNED</span>
                        </div>

                        <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
                          {formData.clauses.map((c: any, index: number) => (
                            <div key={c.clauseId} className={`p-4 rounded-xl border transition-all ${c.enabled ? "bg-slate-950/40 border-white/10" : "bg-white/[0.01] border-white/5 opacity-50"}`}>
                              <div className="flex items-center justify-between mb-2">
                                <Input
                                  value={c.title}
                                  onChange={(e) => {
                                    const updated = [...formData.clauses];
                                    updated[index].title = e.target.value;
                                    setFormData((prev: any) => ({ ...prev, clauses: updated }));
                                  }}
                                  className="h-7 bg-transparent border-none text-xs font-bold p-0 text-slate-200 focus-visible:ring-0 max-w-sm"
                                />
                                <Switch
                                  checked={c.enabled}
                                  onCheckedChange={(val) => {
                                    const updated = [...formData.clauses];
                                    updated[index].enabled = val;
                                    setFormData((prev: any) => ({ ...prev, clauses: updated }));
                                  }}
                                />
                              </div>
                              {c.enabled && (
                                <Textarea
                                  value={c.content}
                                  rows={4}
                                  onChange={(e) => {
                                    const updated = [...formData.clauses];
                                    updated[index].content = e.target.value;
                                    setFormData((prev: any) => ({ ...prev, clauses: updated }));
                                  }}
                                  className="bg-white/[0.01] border-white/10 text-xs leading-relaxed"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Signature canvas */}
                      <div className="border-t border-white/5 pt-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="text-sm font-bold text-slate-200">Execution Block (E-Signature)</h3>
                            <p className="text-[10px] text-muted-foreground">Admin/Representative can sign the contract directly to validate preview.</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <Label className="text-xs font-bold text-slate-300">Signed Representative Name</Label>
                            <Input
                              value={formData.digitalSignature.signedBy}
                              placeholder="e.g. Authorized Signatory, Webflora"
                              onChange={(e) => updateNestedField("digitalSignature", "signedBy", e.target.value)}
                              className="bg-white/[0.02] border-white/10 mb-3"
                            />

                            {/* Signature Method Tabs */}
                            <div className="flex bg-slate-900/50 p-1 border border-white/5 rounded-xl mb-3">
                              <button
                                type="button"
                                onClick={() => setSignatureMode("draw")}
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${signatureMode === "draw"
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
                                className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${signatureMode === "upload"
                                    ? "bg-primary text-slate-950 shadow-md"
                                    : "text-slate-400 hover:text-white"
                                  }`}
                              >
                                <Upload className="w-3.5 h-3.5" />
                                Upload Photo / Image
                              </button>
                            </div>

                            {signatureMode === "draw" ? (
                              <>
                                <div className="border border-white/10 rounded-2xl overflow-hidden bg-white">
                                  <canvas
                                    ref={(el) => {
                                      canvasRef.current = el;
                                      if (el && !formData.digitalSignature.signatureData) {
                                        const ctx = el.getContext("2d");
                                        if (ctx) {
                                          ctx.fillStyle = "#ffffff";
                                          ctx.fillRect(0, 0, el.width, el.height);
                                        }
                                      }
                                    }}
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                    width={320}
                                    height={130}
                                    className="cursor-crosshair w-full h-[130px] touch-none"
                                  />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <Button type="button" variant="ghost" onClick={clearCanvas} className="text-slate-400 hover:text-white text-[10px] h-6 px-2 hover:bg-white/5">
                                    Clear Box
                                  </Button>
                                  <Button type="button" onClick={saveCanvasSignature} className="bg-slate-800 text-slate-200 hover:bg-slate-700 text-[10px] h-6 px-3">
                                    Lock Signature
                                  </Button>
                                </div>
                              </>
                            ) : (
                              <div className="space-y-2">
                                <div className="border-2 border-dashed border-white/10 rounded-2xl p-4 bg-white/[0.01] hover:bg-white/[0.02] transition-colors relative flex flex-col items-center justify-center text-center group h-[130px]">
                                  {formData.digitalSignature.signatureData ? (
                                    <div className="relative group w-full h-full flex items-center justify-center p-1 bg-white rounded-xl">
                                      <img
                                        src={formData.digitalSignature.signatureData}
                                        alt="Uploaded Signature"
                                        className="max-h-full max-w-full object-contain mix-blend-multiply bg-transparent"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          updateNestedField("digitalSignature", "signatureData", "");
                                          updateNestedField("digitalSignature", "signStatus", "Pending");
                                        }}
                                        className="absolute -top-1.5 -right-1.5 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full transition-transform scale-90 group-hover:scale-100 shadow-md"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  ) : (
                                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center space-y-1.5">
                                      <div className="p-2 bg-white/5 rounded-full text-slate-400 group-hover:text-primary transition-colors">
                                        <Image className="w-5 h-5" />
                                      </div>
                                      <div className="space-y-0.5">
                                        <p className="text-[10px] font-bold text-slate-200">
                                          Click to upload signature photo
                                        </p>
                                        <p className="text-[8px] text-slate-400">
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
                                <div className="flex justify-end items-center">
                                  {formData.digitalSignature.signatureData && (
                                    <span className="text-[9px] font-semibold text-emerald-400 flex items-center gap-1">
                                      <Check className="w-3.5 h-3.5" /> Signature Image Loaded
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col justify-center items-center p-6 border border-white/5 bg-white/[0.01] rounded-2xl text-center space-y-3">
                            <PenTool className="w-8 h-8 text-primary/40 animate-pulse" />
                            <h4 className="text-xs font-bold">Execution Verification</h4>
                            <p className="text-[10px] text-muted-foreground leading-normal max-w-[200px]">
                              Locking the drawing captures the canvas visual stroke as base64 and burns it instantly onto the legal pages.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Step Controls */}
            <div className="bg-white/[0.02] border-t border-white/5 p-6 flex justify-between items-center">
              <Button
                type="button"
                onClick={prevStep}
                disabled={activeStep === 1}
                variant="outline"
                className="bg-slate-900 border-white/10 text-white rounded-xl text-xs font-bold uppercase"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Previous
              </Button>

              {activeStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="bg-primary hover:bg-primary/95 text-white rounded-xl text-xs font-bold uppercase"
                >
                  Next Step <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSave}
                  className="premium-gradient text-white rounded-xl text-xs font-bold uppercase tracking-wider px-6 premium-glow"
                >
                  Complete & Save
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-FIDELITY LIVE PREVIEW SIDECAR */}
        <div className="xl:col-span-5 sticky top-28 space-y-4">
          <div className="flex justify-between items-center px-4">
            <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> Live Document Preview
            </span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 px-2 py-0.5 rounded uppercase tracking-wide">
              Bound Real-time
            </span>
          </div>

          {/* Document Sheet simulating physical paper A4 */}
          <div className="bg-white text-slate-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[1.5rem] border border-white/10 p-8 min-h-[700px] flex flex-col justify-between overflow-y-auto select-none relative custom-scrollbar max-h-[82vh]">

            {/* Low opacity diagonal watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] overflow-hidden select-none">
              <span className="text-primary font-black text-5xl rotate-45 tracking-widest">
                WEBFLORA LEGAL
              </span>
            </div>

            {/* Document Body */}
            <div className="space-y-6 z-10 relative">
              {/* Header branding */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h1 className="text-sm font-black tracking-tight text-primary uppercase">IT Service Agreement</h1>
                  <p className="text-[8px] font-bold text-slate-400 font-mono tracking-widest uppercase">
                    {formData.companyInfo.companyName} &bull; legal contract
                  </p>
                </div>
                <div className="text-right text-[7px] text-slate-400 space-y-0.5 font-mono">
                  <p className="font-bold">Doc ID: {isEdit ? agreementData?.agreementId : "WT-AGR-YYYY-XXXX"}</p>
                  <p>Date: {new Date().toLocaleDateString("en-IN")}</p>

                </div>
              </div>

              {/* Subject scope */}
              <div className="space-y-1 py-2 text-center bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-[7px] font-bold tracking-widest text-slate-400 uppercase">SUBJECT MATTER & SCOPE</p>
                <h2 className="text-xs font-black text-slate-800 uppercase px-2 line-clamp-1">{formData.projectInfo.title || "Project Specification Title"}</h2>
                <p className="text-[8px] text-slate-500 font-semibold">{formData.projectInfo.projectCategory} ({formData.projectInfo.projectType})</p>
              </div>

              {/* Contracting Parties Card */}
              <div className="grid grid-cols-2 gap-4 text-[9px] leading-relaxed border-b border-slate-100 pb-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-slate-400 uppercase tracking-wide text-[8px]">SERVICE PROVIDER</h3>
                  <p className="font-bold text-slate-700">{formData.companyInfo.companyName}</p>
                  <p className="text-slate-500 line-clamp-2 text-[8px]">{formData.companyInfo.companyAddress}</p>
                  <p className="text-slate-500 font-mono text-[8px]">{formData.companyInfo.email}</p>
                  <p className="text-slate-500 font-mono text-[8px]">{formData.companyInfo.phone}</p>

                </div>
                <div className="space-y-1 border-l border-slate-100 pl-4">
                  <h3 className="font-extrabold text-slate-400 uppercase tracking-wide text-[8px]">THE CLIENT</h3>
                  <p className="font-bold text-slate-700">{formData.clientInfo.clientName || "—"}</p>
                  {formData.clientInfo.clientDesignation && <p className="text-slate-500 font-bold text-[8px]">{formData.clientInfo.clientDesignation}</p>}
                  {formData.clientInfo.companyName && <p className="text-slate-500 font-bold text-[8px]">{formData.clientInfo.companyName}</p>}
                  <p className="text-slate-500 line-clamp-2 text-[8px]">{formData.clientInfo.address || "No address supplied"}</p>
                  <p className="text-slate-500 font-mono text-[8px]">{formData.clientInfo.email || "—"}</p>

                </div>
              </div>

              {/* Project Details Description */}
              <div className="space-y-1 text-[9px] leading-relaxed">
                <h3 className="font-extrabold text-slate-400 uppercase tracking-wide text-[8px]">Project Overview & Description</h3>
                <p className="text-slate-600 line-clamp-4 italic text-[8px]">
                  {formData.projectInfo.description || "Describe the custom application modules and requirements to see them pop up here in real-time."}
                </p>
              </div>

              {/* Toggles Checklist Details */}
              <div className="flex flex-wrap gap-2 py-1 text-[7px] text-slate-500 border-t border-b border-slate-100">
                {formData.projectInfo.adminPanelIncluded && <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-primary">✔ ADMIN PANEL</span>}
                {formData.projectInfo.mobileAppIncluded && <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-primary">✔ MOBILE APP</span>}
                {formData.projectInfo.apiIntegration && <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-primary">✔ API GATEWAY</span>}
                {formData.projectInfo.hostingIncluded && <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-primary">✔ CLOUD HOSTING</span>}
                {formData.projectInfo.seoIncluded && <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-primary">✔ SEO OPS</span>}
                {formData.projectInfo.aiAutomationIncluded && <span className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-primary">✔ AI AGENTS</span>}
              </div>

              {/* Tech stack, features, deliverables inline lists */}
              <div className="grid grid-cols-3 gap-2 text-[8px] py-1">
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wide mb-1">TECH STACK</h4>
                  <div className="flex flex-wrap gap-1">
                    {formData.projectInfo.techStack.length === 0 ? (
                      <span className="text-slate-400 font-medium">None added</span>
                    ) : (
                      formData.projectInfo.techStack.slice(0, 4).map((t: string, i: number) => (
                        <span key={i} className="bg-slate-100 px-1.5 py-0.5 rounded font-bold text-slate-600 uppercase">{t}</span>
                      ))
                    )}
                  </div>
                </div>
                <div className="border-l border-r border-slate-100 px-2">
                  <h4 className="font-bold text-slate-400 uppercase tracking-wide mb-1">FEATURES</h4>
                  <ul className="space-y-0.5 text-slate-600 font-medium">
                    {formData.projectInfo.featuresIncluded.length === 0 ? (
                      <li className="text-slate-400">None added</li>
                    ) : (
                      formData.projectInfo.featuresIncluded.slice(0, 3).map((m: string, i: number) => (
                        <li key={i} className="truncate">&bull; {m}</li>
                      ))
                    )}
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold text-slate-400 uppercase tracking-wide mb-1">DELIVERABLES</h4>
                  <ul className="space-y-0.5 text-slate-600 font-medium">
                    {formData.projectInfo.deliverables.length === 0 ? (
                      <li className="text-slate-400">None added</li>
                    ) : (
                      formData.projectInfo.deliverables.slice(0, 3).map((d: string, i: number) => (
                        <li key={i} className="truncate">&bull; {d}</li>
                      ))
                    )}
                  </ul>
                </div>
              </div>

              {/* SECTION 02: PROJECT TIMELINE & DELIVERY SCHEDULE */}
              <div className="space-y-2 text-[9px] border-t border-slate-100 pt-3">
                <h3 className="font-extrabold text-slate-400 uppercase tracking-wide text-[8px]">02. Project Timeline & Delivery Schedule</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-xl p-2.5 space-y-1">
                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">Commencement & Projection</p>
                    <p className="text-[8.5px] font-bold text-slate-700">Commencement: {formData.timeline.startDate ? new Date(formData.timeline.startDate).toLocaleDateString("en-IN") : new Date().toLocaleDateString("en-IN")}</p>
                    <p className="text-[8.5px] font-bold text-slate-700">Completion: {formData.timeline.endDate ? new Date(formData.timeline.endDate).toLocaleDateString("en-IN") : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN")}</p>
                    <p className="text-[7.5px] text-slate-500 line-clamp-2">Terms: {formData.timeline.deliveryTimeline || "30 working days from receipt of advance payment."}</p>
                  </div>
                  <div className="bg-orange-50/50 border border-orange-100 rounded-xl p-2.5 space-y-1">
                    <p className="text-[7px] text-primary font-bold uppercase tracking-wider">Compliance Protocol</p>
                    <p className="text-[7.5px] text-slate-600 leading-relaxed line-clamp-3">Extension: {formData.timeline.delayConditions || "Delays in providing project assets will shift timeline accordingly."}</p>
                  </div>
                </div>
              </div>

              {/* Financial Specifications */}
              <div className="space-y-2 text-[9px]">
                <h3 className="font-extrabold text-slate-400 uppercase tracking-wide text-[8px]">Financials & Staging payments</h3>
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex justify-between items-center">
                  <div>
                    <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider">PROJECT TOTAL BUDGET</p>
                    <p className="text-sm font-black text-slate-800">{formatCurrency(formData.payment.totalCost)}</p>
                    <p className="text-[7px] text-slate-400 font-bold">GST @ {formData.payment.gstPercentage}%: {formatCurrency(formData.payment.taxAmount)}</p>
                  </div>
                  <div className="text-right space-y-0.5 text-[7px] text-slate-500 font-semibold">
                    <p>Mode: {formData.payment.paymentMode || "Bank Transfer"}</p>
                    {formData.payment.monthlyCharges > 0 && <p>Monthly Maintenance: {formatCurrency(formData.payment.monthlyCharges)}</p>}
                    {formData.payment.amcCharges > 0 && <p>Annual AMC: {formatCurrency(formData.payment.amcCharges)}</p>}
                    <p>Refunds: {formData.payment.refundPolicy ? "Subject to terms" : "Non-refundable"}</p>
                  </div>
                </div>


              </div>

              {/* Service commitment wording preview */}
              {formData.serviceCommitment.commitmentRequired && (
                <div className="space-y-1 text-[8px] bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-normal">
                  <h4 className="font-black text-slate-700 uppercase tracking-wide text-[7px]">Minimum Service Lock-in Period</h4>
                  <p className="text-slate-500 font-medium italic">{getDynamicLockInText()}</p>
                </div>
              )}

              {/* Active clauses text previews */}
              <div className="space-y-2 text-[8px]">
                <h3 className="font-extrabold text-slate-400 uppercase tracking-wide text-[8px]">Legal Clauses Preview</h3>
                <div className="space-y-1.5 divide-y divide-slate-100 max-h-40 overflow-y-auto pr-1">
                  {formData.clauses.filter((c: any) => c.enabled).slice(0, 3).map((c: any) => (
                    <div key={c.clauseId} className="pt-1.5 first:pt-0">
                      <p className="font-bold text-slate-700 mb-0.5">{c.title}</p>
                      <p className="text-slate-500 leading-normal line-clamp-2">{c.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Document Signature Foot */}
            <div className="border-t border-slate-100 pt-4 flex justify-between items-end z-10 relative">
              <div className="text-[7px] text-slate-400 space-y-0.5">
                <p>Governed under Bihar Jurisdiction, Patna</p>
                <p className="font-mono text-[6px]">Secure Reference ID: {isEdit ? agreementData?.agreementId : "WT-AGR-YYYY-0000"}</p>
              </div>

              {/* Signature visualization */}
              <div className="text-center w-32 border-b border-slate-200 pb-1">
                {formData.digitalSignature.signatureData ? (
                  <img
                    src={formData.digitalSignature.signatureData}
                    alt="Authorized Signee"
                    className="max-h-8 object-contain mx-auto mix-blend-multiply bg-transparent"
                  />
                ) : (
                  <div className="h-8 flex items-center justify-center text-[7px] text-slate-400 italic">
                    Awaiting Signature
                  </div>
                )}
                <p className="text-[6px] font-black text-slate-700 border-t border-slate-100 pt-1 mt-1 truncate">
                  {formData.digitalSignature.signedBy || formData.companyInfo.authPersonName || "Authorized Signatory"}
                </p>
                <p className="text-[5px] text-slate-400 uppercase tracking-wider font-bold">digital e-signee</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEditAgreement;
