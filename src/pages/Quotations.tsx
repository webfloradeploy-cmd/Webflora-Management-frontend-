import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, FileDown, MessageSquare, X, CheckSquare, Clock, DollarSign, FileText, CheckCircle2, Mail, Send, Loader2 } from "lucide-react";
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
  DialogDescription,
  DialogFooter,
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
import { useQuotations, useCreateQuotation, useUpdateQuotation, useDeleteQuotation, useSendQuotationEmail } from "@/hooks/useQuotations";
import { useLeads } from "@/hooks/useLeads";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/utils/dateUtils";
import { generateQuotationPDF } from "@/utils/pdfGenerator";
import { DatePicker } from "@/components/ui/date-picker";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value || 0);

const getProjectTypesList = (str?: string): string[] =>
  (str || "").split(",").map(t => t.trim()).filter(Boolean);

// Dynamic adjustment of defaults based on the selected project type(s)
const adjustDefaultsForProjectType = (typesArray: string[]) => {
  const hasWebsite = typesArray.some(t => /website/i.test(t));
  const hasMobile = typesArray.some(t => /mobile|app/i.test(t));
  const hasERP = typesArray.some(t => /erp/i.test(t));
  const hasSoftware = typesArray.some(t => /software/i.test(t));
  const hasDesign = typesArray.some(t => /ui|ux|design/i.test(t));
  const hasSEO = typesArray.some(t => /\bseo\b|search engine/i.test(t));
  const hasMarketing = typesArray.some(t => /marketing|social|brand|advertis|shoot|video|photo|content/i.test(t));

  if (hasMobile) {
    return {
      scopeOfWork: "• Native / Cross-Platform Mobile Application Development (iOS & Android).\n• Splash Screen & User Onboarding Flows.\n• Secure Mobile Authentication & User Profile Management.\n• Real-Time Push Notification Engine Integration.\n• In-App Payment Gateway Integration.\n• Offline Data Synchronization & Security Layers.",
      timeline: [
        { stage: "UI/UX App Wireframing", days: 7 },
        { stage: "API & Backend Construction", days: 10 },
        { stage: "Cross-Platform Mobile Coding", days: 15 },
        { stage: "App Store & Play Store Release", days: 6 }
      ],
      deliverables: [
        "iOS App Bundle (IPA File / TestFlight Release)",
        "Android App Package (APK/AAB Store Bundle)",
        "Server API Source Code & Database Setup",
        "Admin Dashboard Panel Access",
        "App Store Submission Support & Guidelines"
      ],
      websitePages: [
        { page: "Splash / Onboarding Screen", included: true },
        { page: "Sign In / Sign Up Screen", included: true },
        { page: "User Profile & Settings", included: true },
        { page: "Core Home Dashboard", included: true },
        { page: "Product / Service Catalog", included: true },
        { page: "Advanced Search & Filter", included: true },
        { page: "Cart & Checkout View", included: true },
        { page: "Push Notifications Screen", included: true },
        { page: "Help & Support Tickets", included: true }
      ],
      adminPanelFeatures: [
        { feature: "Dashboard Overview", included: true },
        { feature: "Manage Registered Users", included: true },
        { feature: "Push Notification Scheduler", included: true },
        { feature: "Transaction & Payment Logs", included: true },
        { feature: "Enquiry & Support Tickets", included: true },
        { feature: "Logout Session", included: true }
      ],
      additionalServices: [
        { service: "Google Play Store Setup & Publishing", price: 2500, isMonthly: false },
        { service: "Apple App Store Setup & Publishing", price: 8500, isMonthly: false },
        { service: "Annual App Maintenance & Updates (AMC)", price: 15000, isMonthly: false }
      ],
      paymentTerms: [
        "50% Advance mobilization deposit",
        "30% Upon beta build presentation",
        "20% Before final source code and store release"
      ],
      termsAndConditions: [
        "Source code will be handed over only after full settlement of payment.",
        "Development timeline will commence immediately after receipt of the advance payment.",
        "Store approval timelines are subject to Apple and Google policies.",
        "Any scope modification or addition of features outside this list will be billed separately."
      ]
    };
  } else if (hasERP) {
    return {
      scopeOfWork: "• Fully integrated custom ERP system for internal corporate workflows.\n• Modular business processes automation.\n• High transactional integrity database schema.\n• Role-based Access Control (RBAC) security.\n• Real-time automated reporting tools.",
      timeline: [
        { stage: "Requirement Mapping & Architecture Design", days: 10 },
        { stage: "Database Model & Core System Coding", days: 15 },
        { stage: "Custom Modules Implementation", days: 20 },
        { stage: "Integration Testing & Staff Training", days: 8 }
      ],
      deliverables: [
        "Secure Private Cloud ERP Deployment",
        "Modular ERP Source Code Transfer",
        "Custom Database Structure Schemas",
        "ERP Operations Training Manual",
        "3-Month Free Support SLA Agreement"
      ],
      websitePages: [
        { page: "ERP Central Dashboard", included: true },
        { page: "HR & Employee Portal", included: true },
        { page: "Inventory & Warehouse Stock", included: true },
        { page: "Sales & Client CRM Module", included: true },
        { page: "Purchase & Vendor Manager", included: true },
        { page: "Finance Ledger Accounts", included: true },
        { page: "Reports & Analytics Wizard", included: true },
        { page: "Access Control Settings", included: true }
      ],
      adminPanelFeatures: [
        { feature: "System Configurations", included: true },
        { feature: "Audit Logs & Activity Monitor", included: true },
        { feature: "User Role Controller (RBAC)", included: true },
        { feature: "Automated Backup Scheduler", included: true },
        { feature: "API Access Keys Console", included: true },
        { feature: "Logout Session", included: true }
      ],
      additionalServices: [
        { service: "Dedicated Cloud Server Setup", price: 6000, isMonthly: false },
        { service: "Annual ERP Maintenance & Technical SLA", price: 25000, isMonthly: false }
      ],
      paymentTerms: [
        "40% Advance mobilization deposit",
        "30% Upon core modules milestone",
        "30% Upon final deployment and staff training"
      ],
      termsAndConditions: [
        "Source code will be handed over only after full settlement of payment.",
        "Development timeline will commence immediately after receipt of the advance payment.",
        "Custom requirements outside the signed scope will be estimated separately.",
        "Full administrative credentials handed over upon final clearance."
      ]
    };
  } else if (hasSoftware) {
    return {
      scopeOfWork: "• Bespoke custom software solution tailored to specific business processes.\n• Advanced custom database configuration.\n• High-security data transmission layers.\n• Interactive dashboards and export tools.",
      timeline: [
        { stage: "System Modeling & DB Design", days: 7 },
        { stage: "Custom Backend Engine Dev", days: 18 },
        { stage: "UI Dashboard Integration", days: 12 },
        { stage: "User Acceptance Testing (UAT)", days: 5 }
      ],
      deliverables: [
        "Custom Software Web Application / Executables",
        "Complete Repository Source Code",
        "Technical & API Reference Documentation",
        "Automated DB Backups Routine Setup",
        "System Administration Training"
      ],
      websitePages: [
        { page: "Main Operations Portal", included: true },
        { page: "User Management Module", included: true },
        { page: "Interactive Data Grid Views", included: true },
        { page: "Digital Document Repository", included: true },
        { page: "Billing & Transaction Controller", included: true },
        { page: "Reports & Analytics Customizer", included: true },
        { page: "Global Alerts & Activity Log", included: true },
        { page: "Account Settings Panel", included: true }
      ],
      adminPanelFeatures: [
        { feature: "Global Software Settings", included: true },
        { feature: "Access Control Console (RBAC)", included: true },
        { feature: "Custom Query Executor", included: true },
        { feature: "System Integrity Logs", included: true },
        { feature: "Logout Session", included: true }
      ],
      additionalServices: [
        { service: "Cloud Hosting & Dedicated Server Setup", price: 5000, isMonthly: false },
        { service: "Annual Maintenance Contract (AMC)", price: 18000, isMonthly: false }
      ],
      paymentTerms: [
        "50% Advance mobilization deposit",
        "30% Upon beta version completion",
        "20% Upon final handover and deployment"
      ],
      termsAndConditions: [
        "Source code will be handed over only after full settlement of payment.",
        "Development timeline will commence immediately after receipt of the advance payment.",
        "Up to 30 days post-launch bug fixing support is included.",
        "Any scope modification outside this list will be billed separately."
      ]
    };
  } else if (hasDesign) {
    return {
      scopeOfWork: "• Professional UI/UX wireframing and pixel-perfect high-fidelity interface design.\n• Modern branding, typography scales, and style guide creation.\n• Interactive clickable prototype development in Figma.",
      timeline: [
        { stage: "Research & Brand Discovery", days: 4 },
        { stage: "Low-Fidelity Wireframes", days: 6 },
        { stage: "High-Fidelity Mockups Development", days: 8 },
        { stage: "Figma Prototyping & Design Revisions", days: 4 }
      ],
      deliverables: [
        "Figma Source File (Full Link & Edit Access)",
        "High-Resolution Visual Page Exports",
        "Developer Specifications Hand-Off Document",
        "Custom System UI Style Guide",
        "Interactive Figma Prototype Link"
      ],
      websitePages: [
        { page: "Brand Moodboard & Typography Scales", included: true },
        { page: "Low-Fidelity Wireframe Flows", included: true },
        { page: "High-Fidelity UI Screens Mockups", included: true },
        { page: "Design System Elements & UI Kit", included: true },
        { page: "Interactive Clickable Prototype", included: true }
      ],
      adminPanelFeatures: [],
      additionalServices: [],
      paymentTerms: [
        "50% Advance deposit to initiate design sprints",
        "50% Upon final presentation and design mockups hand-off"
      ],
      termsAndConditions: [
        "Visual design mockups source files will be delivered upon final milestone clearance.",
        "Up to three rounds of wireframe layout revisions are included in this design phase.",
        "Specialized stock media, typography licenses, or vector icon packs are billed at cost if needed."
      ]
    };
  } else if (hasMarketing) {
    return {
      scopeOfWork: "• Brand development, content strategy, and target audience mapping.\n• High-resolution creative assets and promotional media production.\n• Campaign scheduling, ad set optimization, and multi-channel reach.\n• Performance monitoring, KPI audits, and monthly conversion reports.",
      timeline: [
        { stage: "Discovery & Campaign Strategy", days: 4 },
        { stage: "Asset Production & Content Creation", days: 8 },
        { stage: "Campaign Launch & Audience Targeting", days: 10 },
        { stage: "Performance Review & Reporting", days: 4 }
      ],
      deliverables: [
        "Brand Identity & Campaign Assets",
        "Social Media & Content Calendar",
        "High-Resolution Visual Creative Files",
        "Target Audience Strategy Plan",
        "Monthly Campaign Performance & ROI Report"
      ],
      websitePages: [],
      adminPanelFeatures: [],
      additionalServices: [],
      paymentTerms: [
        "50% Advance mobilization payment to initiate production",
        "50% Upon campaign delivery and launch"
      ],
      termsAndConditions: [
        "Campaign activities commence immediately upon receipt of advance mobilization deposit.",
        "Paid advertising budgets and ad spend are paid directly to platforms unless separately agreed.",
        "Content usage rights, duration, and permitted platforms are confirmed before production.",
        "Deliverables will be formally handed over upon full payment clearance."
      ]
    };
  } else if (hasSEO) {
    return {
      scopeOfWork: "• Comprehensive Technical SEO audit and competitor analysis.\n• High-intent keyword research, mapping, and core strategy.\n• On-page optimization including meta tags, title tags, heading structure, and image alt text.\n• Core Web Vitals audit and page speed recommendation implementation.\n• Google Analytics 4 and Google Search Console integration and dashboard setup.\n• Monthly rank tracking and traffic growth reports.",
      timeline: [
        { stage: "Audit & Keyword Research", days: 7 },
        { stage: "On-Page Optimization", days: 15 },
        { stage: "Technical & Core Web Vitals Fixes", days: 10 },
        { stage: "Analytics Integration & Schema Markup", days: 5 }
      ],
      deliverables: [
        "SEO Technical Audit Document",
        "Keyword Research & Target Strategy Map",
        "GA4 & Search Console Account Integration",
        "On-page Schema Markup Implementation",
        "First Month Optimization & Rank Report"
      ],
      websitePages: [],
      adminPanelFeatures: [],
      additionalServices: [],
      paymentTerms: [
        "100% Advance monthly retainer payment to initiate optimization cycles.",
        "Monthly invoices are due within the first 5 business days of each service cycle."
      ],
      termsAndConditions: [
        "Search engine rankings are subject to Google algorithm updates and competitive index changes.",
        "Monthly optimization actions commence immediately after receipt of advance retainer payment.",
        "Analytics accounts, GSC logs, and CMS website admin access must be provided by the client.",
        "Detailed performance reports are provided at the end of each monthly cycle."
      ]
    };
  } else if (hasWebsite) {
    return {
      scopeOfWork: "• Modern responsive website design and frontend engineering.\n• Administrative content management dashboard.\n• Interactive contact forms and lead capture integration.\n• On-page Search Engine Optimization (SEO) structured tags.\n• SSL configuration, cross-browser compatibility, and speed optimization.",
      timeline: [
        { stage: "UI/UX Design", days: 5 },
        { stage: "Development", days: 10 },
        { stage: "Testing & Deployment", days: 3 }
      ],
      deliverables: [
        "Responsive Website",
        "Admin Dashboard Access",
        "Source Code Delivery",
        "Basic SEO Setup",
        "SSL Configuration",
        "Deployment Support",
        "1-Hour Training Session"
      ],
      websitePages: [
        { page: "Home", included: true },
        { page: "About Us", included: true },
        { page: "Services / Solutions", included: true },
        { page: "Portfolio / Case Studies", included: true },
        { page: "Products / Pricing", included: true },
        { page: "Blog / Articles", included: true },
        { page: "Careers", included: true },
        { page: "Contact Us & Enquiry Form", included: true },
        { page: "Privacy Policy & Terms", included: true }
      ],
      adminPanelFeatures: [
        { feature: "Dashboard Overview & Stats", included: true },
        { feature: "Manage Enquiries & Leads", included: true },
        { feature: "Manage Content / CMS", included: true },
        { feature: "Manage Gallery & Media", included: true },
        { feature: "SEO Meta Settings", included: true },
        { feature: "Logout Session", included: true }
      ],
      additionalServices: [
        { service: "Cloud Hosting & Server Setup", price: 3000, isMonthly: false },
        { service: "Domain Registration (.com / .in)", price: 1000, isMonthly: false },
        { service: "Annual Maintenance Contract (AMC)", price: 8000, isMonthly: false }
      ],
      paymentTerms: [
        "50% Advance mobilization deposit",
        "30% During development phase",
        "20% Before final source code hand-off"
      ],
      termsAndConditions: [
        "Source code will be handed over only after full settlement of payment.",
        "Development timeline will commence immediately after receipt of the advance payment.",
        "Up to three rounds of visual layout reviews are included. Additional updates are billable.",
        "Any scope modification or addition of features outside this list will be billed separately."
      ]
    };
  } else {
    // Pure custom or unselected non-development project (empty defaults, no website items)
    return {
      scopeOfWork: "",
      timeline: [],
      deliverables: [],
      websitePages: [],
      adminPanelFeatures: [],
      additionalServices: [],
      paymentTerms: [
        "50% Advance mobilization payment",
        "50% Upon project completion and handover"
      ],
      termsAndConditions: [
        "Work commences immediately upon receipt of the advance payment.",
        "Any scope modification outside this agreement will be estimated separately.",
        "Deliverables will be formally handed over upon full payment clearance."
      ]
    };
  }
};

const getDefaultFormData = (initialType: string = "Website Development") => {
  const types = getProjectTypesList(initialType);
  const defaults = adjustDefaultsForProjectType(types);

  return {
    leadId: "",
    quotationNo: "",
    date: new Date().toISOString().split('T')[0],
    validUntil: "",
    projectName: "",
    projectType: initialType,
    projectOverview: "",
    items: [{ service: "", description: "", quantity: 1, price: 0, amount: 0, isMonthly: false }],
    totalAmount: 0,
    status: "Draft",
    notes: "",
    ...defaults
  };
};

const Quotations = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedQuotation, setSelectedQuotation] = useState<any | null>(null);
  const [viewingQuotation, setViewingQuotation] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [quotationToDelete, setQuotationToDelete] = useState<any | null>(null);
  const [searchParams] = useSearchParams();

  const [formData, setFormData] = useState(getDefaultFormData(""));

  useEffect(() => {
    const leadId = searchParams.get("leadId");
    if (leadId) {
      setFormData(prev => ({ ...prev, leadId }));
      setIsCreateDialogOpen(true);
    }
  }, [searchParams]);

  // Check if current types require software/web checklists
  const currentTypes = getProjectTypesList(formData.projectType);
  const hasWebsite = currentTypes.some(t => /website/i.test(t));
  const hasMobileApp = currentTypes.some(t => /mobile|app/i.test(t));
  const hasERP = currentTypes.some(t => /erp/i.test(t));
  const hasCustomSoftware = currentTypes.some(t => /software/i.test(t));
  const hasUIUX = currentTypes.some(t => /ui|ux|design/i.test(t));
  const hasChecklistDev = hasWebsite || hasMobileApp || hasERP || hasCustomSoftware || hasUIUX;
  const showChecklists = hasChecklistDev || formData.websitePages.length > 0 || formData.adminPanelFeatures.length > 0;

  const getFormChecklistHeaders = () => {
    if (hasMobileApp) {
      return { left: "Mobile App Screens Checklist", right: "Admin / API Features Checklist" };
    } else if (hasERP) {
      return { left: "ERP Modules Checklist", right: "System Control Features Checklist" };
    } else if (hasUIUX) {
      return { left: "Design Screens & Wireframes", right: "UX Assets & Prototypes Checklist" };
    } else if (hasCustomSoftware) {
      return { left: "Custom Modules Checklist", right: "Admin Panel & Security Config" };
    }
    return { left: "Website Pages Checklist", right: "Admin Panel Features Checklist" };
  };

  const formHeaders = getFormChecklistHeaders();

  const { data: quotations = [], isLoading, error } = useQuotations();
  const { data: leads = [] } = useLeads();
  const createQuotation = useCreateQuotation();
  const updateQuotation = useUpdateQuotation();
  const deleteQuotation = useDeleteQuotation();
  const sendQuotationEmail = useSendQuotationEmail();

  // Email modal state
  const [emailQuotation, setEmailQuotation] = useState<any | null>(null);
  const [emailForm, setEmailForm] = useState({
    email: "",
    subject: "",
    message: ""
  });

  const handleOpenEmailDialog = (q: any) => {
    setEmailQuotation(q);
    setEmailForm({
      email: q.leadId?.email || "",
      subject: `Project Quotation: ${q.projectName || "Project"} - Webflora Technologies`,
      message: `Dear ${q.leadId?.leadName || "Valued Client"},\n\nWe are pleased to present the official quotation for "${q.projectName || "your project"}".\n\nPlease review the attached quotation PDF for detailed milestone timeline, technical deliverables, and pricing breakdown.\n\nWarm regards,\nWebflora Technologies Team`
    });
  };

  const handleSendEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailQuotation) return;
    try {
      let pdfBase64 = "";
      try {
        const doc: any = generateQuotationPDF(emailQuotation, false);
        if (doc) {
          pdfBase64 = doc.output("datauristring").split(",")[1];
        }
      } catch (pdfErr) {
        console.error("Failed to generate PDF attachment:", pdfErr);
      }

      await sendQuotationEmail.mutateAsync({
        id: emailQuotation._id,
        data: {
          email: emailForm.email,
          subject: emailForm.subject,
          message: emailForm.message,
          pdfBase64
        }
      });
      setEmailQuotation(null);
    } catch (err) {
      console.error("Failed to send quotation email:", err);
    }
  };

  // Dynamic lists helper states
  const [newPageName, setNewPageName] = useState("");
  const [newFeatureName, setNewFeatureName] = useState("");
  const [newDeliverable, setNewDeliverable] = useState("");
  const [newPaymentTerm, setNewPaymentTerm] = useState("");
  const [newTC, setNewTC] = useState("");
  const [newStageName, setNewStageName] = useState("");
  const [newStageDays, setNewStageDays] = useState(5);
  const [newAddServiceName, setNewAddServiceName] = useState("");
  const [newAddServicePrice, setNewAddServicePrice] = useState(0);

  const addWebsitePage = () => {
    if (!newPageName.trim()) return;
    setFormData(prev => ({
      ...prev,
      websitePages: [...prev.websitePages, { page: newPageName.trim(), included: true }]
    }));
    setNewPageName("");
  };

  const removeWebsitePage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      websitePages: prev.websitePages.filter((_, i) => i !== index)
    }));
  };

  const toggleWebsitePage = (index: number) => {
    setFormData(prev => {
      const pages = [...prev.websitePages];
      pages[index] = { ...pages[index], included: !pages[index].included };
      return { ...prev, websitePages: pages };
    });
  };

  const addAdminFeature = () => {
    if (!newFeatureName.trim()) return;
    setFormData(prev => ({
      ...prev,
      adminPanelFeatures: [...prev.adminPanelFeatures, { feature: newFeatureName.trim(), included: true }]
    }));
    setNewFeatureName("");
  };

  const removeAdminFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      adminPanelFeatures: prev.adminPanelFeatures.filter((_, i) => i !== index)
    }));
  };

  const toggleAdminFeature = (index: number) => {
    setFormData(prev => {
      const feats = [...prev.adminPanelFeatures];
      feats[index] = { ...feats[index], included: !feats[index].included };
      return { ...prev, adminPanelFeatures: feats };
    });
  };

  const addDeliverable = () => {
    if (!newDeliverable.trim()) return;
    setFormData(prev => ({
      ...prev,
      deliverables: [...prev.deliverables, newDeliverable.trim()]
    }));
    setNewDeliverable("");
  };

  const removeDeliverable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  const addPaymentTerm = () => {
    if (!newPaymentTerm.trim()) return;
    setFormData(prev => ({
      ...prev,
      paymentTerms: [...prev.paymentTerms, newPaymentTerm.trim()]
    }));
    setNewPaymentTerm("");
  };

  const removePaymentTerm = (index: number) => {
    setFormData(prev => ({
      ...prev,
      paymentTerms: prev.paymentTerms.filter((_, i) => i !== index)
    }));
  };

  const addTC = () => {
    if (!newTC.trim()) return;
    setFormData(prev => ({
      ...prev,
      termsAndConditions: [...prev.termsAndConditions, newTC.trim()]
    }));
    setNewTC("");
  };

  const removeTC = (index: number) => {
    setFormData(prev => ({
      ...prev,
      termsAndConditions: prev.termsAndConditions.filter((_, i) => i !== index)
    }));
  };

  const addTimelineStage = () => {
    if (!newStageName.trim()) return;
    setFormData(prev => ({
      ...prev,
      timeline: [...prev.timeline, { stage: newStageName.trim(), days: Number(newStageDays) || 0 }]
    }));
    setNewStageName("");
    setNewStageDays(5);
  };

  const removeTimelineStage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      timeline: prev.timeline.filter((_, i) => i !== index)
    }));
  };

  const checkIsMonthly = (item: any) => {
    if (typeof item?.isMonthly === "boolean") return item.isMonthly;
    return /monthly|\/mo|\/month/i.test(item?.service || "");
  };

  const toggleItemMonthly = (index: number) => {
    const newItems = [...formData.items];
    const currentMonthly = checkIsMonthly(newItems[index]);
    newItems[index] = {
      ...newItems[index],
      isMonthly: !currentMonthly
    };
    setFormData(prev => ({ ...prev, items: newItems }));
  };

  const toggleAdditionalServiceMonthly = (index: number) => {
    const newAdd = [...formData.additionalServices];
    const currentMonthly = checkIsMonthly(newAdd[index]);
    newAdd[index] = {
      ...newAdd[index],
      isMonthly: !currentMonthly
    };
    setFormData(prev => ({ ...prev, additionalServices: newAdd }));
  };

  const addAdditionalService = (isMonthly = false) => {
    if (!newAddServiceName.trim() && !newAddServicePrice) return;
    const name = newAddServiceName.trim() || (isMonthly ? "Monthly Maintenance Charge" : "Additional Service");
    setFormData(prev => ({
      ...prev,
      additionalServices: [...prev.additionalServices, { service: name, price: Number(newAddServicePrice) || 0, isMonthly }]
    }));
    setNewAddServiceName("");
    setNewAddServicePrice(0);
  };

  const removeAdditionalService = (index: number) => {
    setFormData(prev => ({
      ...prev,
      additionalServices: prev.additionalServices.filter((_, i) => i !== index)
    }));
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + ((Number(item.quantity) || 1) * (Number(item.price) || 0)), 0);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    if (field === "quantity" || field === "price") {
      newItems[index].amount = (Number(newItems[index].quantity) || 1) * (Number(newItems[index].price) || 0);
    }
    const newTotal = calculateTotal(newItems);
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service: "", description: "", quantity: 1, price: 0, amount: 0, isMonthly: false }]
    });
  };

  const addMonthlyItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { service: "Monthly Retainer / Service", description: "", quantity: 1, price: 0, amount: 0, isMonthly: true }]
    });
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const newTotal = calculateTotal(newItems);
    setFormData({ ...formData, items: newItems, totalAmount: newTotal });
  };

  const handleCreateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createQuotation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch {
      // Toast notification is handled in mutation hook
    }
  };

  // Crucial: Load EXACT saved quotation properties without forcibly re-injecting deleted services/pages
  const handleEditClick = (q: any) => {
    setFormData({
      leadId: q.leadId?._id || (typeof q.leadId === 'string' ? q.leadId : ""),
      quotationNo: q.quotationNo || "",
      date: q.date ? new Date(q.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validUntil: q.validUntil ? new Date(q.validUntil).toISOString().split('T')[0] : "",
      projectName: q.projectName || "",
      projectType: q.projectType || "",
      projectOverview: q.projectOverview || "",
      scopeOfWork: q.scopeOfWork || "",
      websitePages: Array.isArray(q.websitePages) ? q.websitePages : [],
      adminPanelFeatures: Array.isArray(q.adminPanelFeatures) ? q.adminPanelFeatures : [],
      items: (Array.isArray(q.items) && q.items.length > 0)
        ? q.items
        : [{ service: "", description: "", quantity: 1, price: 0, amount: 0, isMonthly: false }],
      totalAmount: Number(q.totalAmount || 0),
      timeline: Array.isArray(q.timeline) ? q.timeline : [],
      deliverables: Array.isArray(q.deliverables) ? q.deliverables : [],
      paymentTerms: Array.isArray(q.paymentTerms) ? q.paymentTerms : [],
      additionalServices: Array.isArray(q.additionalServices) ? q.additionalServices : [],
      termsAndConditions: Array.isArray(q.termsAndConditions) ? q.termsAndConditions : [],
      status: q.status || "Draft",
      notes: q.notes || "",
    });
    setSelectedQuotation(q);
    setIsEditDialogOpen(true);
  };

  const handleUpdateQuotation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuotation) return;
    try {
      await updateQuotation.mutateAsync({
        id: selectedQuotation._id,
        data: formData,
      });
      setIsEditDialogOpen(false);
      resetForm();
    } catch {
      // Toast handled by mutation hook
    }
  };

  const handleDeleteQuotation = async () => {
    if (!quotationToDelete) return;
    try {
      await deleteQuotation.mutateAsync(quotationToDelete._id);
      setQuotationToDelete(null);
    } catch {
      // Toast handled by mutation hook
    }
  };

  const resetForm = (targetType: string = "") => {
    setFormData(getDefaultFormData(targetType));
    setSelectedQuotation(null);
  };

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredQuotations = (Array.isArray(quotations) ? quotations : []).filter((q: any) => {
    const matchesSearch =
      q.quotationNo?.toLowerCase().includes(search.toLowerCase()) ||
      q.projectName?.toLowerCase().includes(search.toLowerCase()) ||
      q.projectType?.toLowerCase().includes(search.toLowerCase()) ||
      q.leadId?.leadName?.toLowerCase().includes(search.toLowerCase()) ||
      q.status?.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "all" || (q.status || "").toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Recent added at top
  const sortedQuotations = [...filteredQuotations].sort((a: any, b: any) => {
    const numA = parseInt((a.quotationNo || "").replace(/\D/g, "") || "0", 10);
    const numB = parseInt((b.quotationNo || "").replace(/\D/g, "") || "0", 10);
    if (numA && numB && numA !== numB) return numB - numA;

    const dateA = new Date(a.date || a.createdAt || 0).getTime();
    const dateB = new Date(b.date || b.createdAt || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return 0;
  });

  const totalPages = Math.ceil(sortedQuotations.length / itemsPerPage);
  const paginatedQuotations = sortedQuotations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Draft": return <Badge variant="secondary">Draft</Badge>;
      case "Sent": return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Sent</Badge>;
      case "Accepted": return <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">Accepted</Badge>;
      case "Rejected": return <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">Rejected</Badge>;
      case "Expired": return <Badge variant="outline" className="bg-gray-500/10 text-gray-500 border-gray-500/20">Expired</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Quotations" subtitle="Error loading quotations" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load quotations. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  const renderQuotationForm = () => {
    return (
      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid grid-cols-5 w-full bg-muted p-1 rounded-lg">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="scope">Scope & Pages</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="terms">Terms & Notes</TabsTrigger>
        </TabsList>

        {/* Tab 1: Basic Details */}
        <TabsContent value="details" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Lead *</Label>
              <Select value={formData.leadId} onValueChange={(v) => setFormData({ ...formData, leadId: v })} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {(Array.isArray(leads) ? leads : []).map((lead: any) => (
                    <SelectItem key={lead._id} value={lead._id}>
                      {lead.leadId ? `[${lead.leadId}] ` : ''}{lead.leadName} {lead.companyName ? `(${lead.companyName})` : ''}
                    </SelectItem>
                  ))}
                  {/* Fallback option if lead is attached from selectedQuotation but not in active leads list */}
                  {formData.leadId && selectedQuotation?.leadId && typeof selectedQuotation.leadId === 'object' && !leads.some((l: any) => l._id === formData.leadId) && (
                    <SelectItem value={formData.leadId}>
                      {selectedQuotation.leadId.leadName || "Selected Lead"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quotation Number</Label>
              <Input
                value={formData.quotationNo}
                onChange={(e) => setFormData({ ...formData, quotationNo: e.target.value })}
                placeholder="Auto-generated if empty (e.g. WT-QTN-2026-0001)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <DatePicker
                date={formData.date}
                setDate={(v) => setFormData({ ...formData, date: v })}
              />
            </div>
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <DatePicker
                date={formData.validUntil}
                setDate={(v) => setFormData({ ...formData, validUntil: v })}
                placeholder="Optional (Default: 30 days)"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project Name *</Label>
            <Input
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              placeholder="e.g. Corporate Web Application or SEO Growth Sprint"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold">Project Types (Select multiple or add custom)</Label>

            {/* Selected Types Badges */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px] p-2 border rounded-md bg-muted/20">
              {currentTypes.map((type, idx) => (
                <Badge key={idx} variant="secondary" className="flex items-center gap-1 bg-primary/10 text-primary border-primary/20 text-[10px]">
                  {type}
                  <X
                    className="h-2.5 w-2.5 cursor-pointer hover:text-destructive"
                    onClick={() => {
                      const updated = currentTypes.filter(t => t !== type);
                      const adjustments = adjustDefaultsForProjectType(updated);
                      setFormData({
                        ...formData,
                        projectType: updated.join(", "),
                        ...adjustments
                      });
                    }}
                  />
                </Badge>
              ))}
              {currentTypes.length === 0 && (
                <span className="text-[11px] text-muted-foreground self-center">No types selected yet.</span>
              )}
            </div>

            {/* Quick Select Buttons */}
            <div className="flex flex-wrap gap-1.5 mt-1">
              {[
                "Website Development",
                "Mobile App Development",
                "ERP System",
                "Digital Marketing",
                "SEO Optimization",
                "UI/UX Design",
                "Custom Software"
              ].map((type) => {
                const isSelected = currentTypes.includes(type);
                return (
                  <Button
                    key={type}
                    type="button"
                    variant={isSelected ? "default" : "outline"}
                    className="h-6 text-[10px] px-2"
                    onClick={() => {
                      const updated = isSelected
                        ? currentTypes.filter(t => t !== type)
                        : [...currentTypes, type];
                      const adjustments = adjustDefaultsForProjectType(updated);
                      setFormData({
                        ...formData,
                        projectType: updated.join(", "),
                        ...adjustments
                      });
                    }}
                  >
                    {type}
                  </Button>
                );
              })}
            </div>

            {/* Custom Type Input */}
            <div className="flex gap-2 mt-1.5 max-w-sm">
              <Input
                id="custom-project-type"
                placeholder="Custom Type (e.g. CRM System, Branding)"
                className="h-7 text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const val = (e.target as HTMLInputElement).value.trim();
                    if (val && !currentTypes.includes(val)) {
                      const updated = [...currentTypes, val];
                      const adjustments = adjustDefaultsForProjectType(updated);
                      setFormData({
                        ...formData,
                        projectType: updated.join(", "),
                        ...adjustments
                      });
                      (e.target as HTMLInputElement).value = "";
                    }
                  }
                }}
              />
              <Button
                type="button"
                className="h-7 text-xs px-3"
                onClick={() => {
                  const el = document.getElementById("custom-project-type") as HTMLInputElement;
                  const val = el?.value.trim();
                  if (val && !currentTypes.includes(val)) {
                    const updated = [...currentTypes, val];
                    const adjustments = adjustDefaultsForProjectType(updated);
                    setFormData({
                      ...formData,
                      projectType: updated.join(", "),
                      ...adjustments
                    });
                    el.value = "";
                  }
                }}
              >
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Project Overview</Label>
            <Textarea
              value={formData.projectOverview}
              onChange={(e) => setFormData({ ...formData, projectOverview: e.target.value })}
              placeholder="Short summary describing the client's business goals..."
              rows={3}
            />
          </div>
        </TabsContent>

        {/* Tab 2: Scope & Checklist */}
        <TabsContent value="scope" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label>Scope of Work (Markdown/Bullets)</Label>
              <Button
                type="button"
                variant="link"
                className="h-auto p-0 text-xs text-primary"
                onClick={() => {
                  const adjustments = adjustDefaultsForProjectType(currentTypes);
                  setFormData({
                    ...formData,
                    scopeOfWork: adjustments.scopeOfWork || "• Requirement Discovery & Architecture Mapping\n• Core Implementation & Sprints\n• Testing, Deployment & Verification\n• Handover & Documentation"
                  });
                }}
              >
                Reset to Type Scope Template
              </Button>
            </div>
            <Textarea
              value={formData.scopeOfWork}
              onChange={(e) => setFormData({ ...formData, scopeOfWork: e.target.value })}
              placeholder="Detail work scope here..."
              rows={3}
            />
          </div>

          {!showChecklists ? (
            <div className="border border-dashed border-border rounded-xl p-5 text-center bg-muted/20 mt-3 space-y-2">
              <div className="inline-flex p-2 rounded-full bg-primary/10 text-primary mb-1">
                <CheckSquare className="w-5 h-5" />
              </div>
              <p className="text-sm font-semibold">Checklists Hidden for Non-Development Project</p>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Website pages & admin feature checklists only apply to Website, Mobile App, ERP, and Software development projects. For {formData.projectType || "this service"}, use the Scope of Work and Deliverables tabs.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => {
                  setFormData(prev => ({
                    ...prev,
                    websitePages: [{ page: "Service Deliverable 1", included: true }]
                  }));
                }}
              >
                + Enable Custom Item Checklist
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 border-t pt-3">
              {/* Pages / Screens Checklist */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">{formHeaders.left}</Label>
                  <span className="text-[10px] text-muted-foreground">({formData.websitePages.filter(p => p.included).length} Included)</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newPageName}
                    onChange={(e) => setNewPageName(e.target.value)}
                    placeholder="Page / Screen Name"
                    className="h-7 text-xs"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addWebsitePage(); } }}
                  />
                  <Button type="button" size="sm" onClick={addWebsitePage} className="h-7 text-xs">Add</Button>
                </div>
                <div className="border rounded-md p-2 space-y-1.5 max-h-[160px] overflow-y-auto bg-muted/20">
                  {formData.websitePages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`page-${index}`}
                          checked={page.included}
                          onCheckedChange={() => toggleWebsitePage(index)}
                        />
                        <label htmlFor={`page-${index}`} className={`text-xs cursor-pointer ${page.included ? "font-medium text-foreground" : "text-muted-foreground line-through"}`}>
                          {page.page}
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={() => removeWebsitePage(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.websitePages.length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-2">No pages added.</p>
                  )}
                </div>
              </div>

              {/* Admin / Modules Checklist */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold">{formHeaders.right}</Label>
                  <span className="text-[10px] text-muted-foreground">({formData.adminPanelFeatures.filter(f => f.included).length} Included)</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newFeatureName}
                    onChange={(e) => setNewFeatureName(e.target.value)}
                    placeholder="Module / Feature Name"
                    className="h-7 text-xs"
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAdminFeature(); } }}
                  />
                  <Button type="button" size="sm" onClick={addAdminFeature} className="h-7 text-xs">Add</Button>
                </div>
                <div className="border rounded-md p-2 space-y-1.5 max-h-[160px] overflow-y-auto bg-muted/20">
                  {formData.adminPanelFeatures.map((feat, index) => (
                    <div key={index} className="flex items-center justify-between py-0.5 border-b border-border/50 last:border-0">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`feat-${index}`}
                          checked={feat.included}
                          onCheckedChange={() => toggleAdminFeature(index)}
                        />
                        <label htmlFor={`feat-${index}`} className={`text-xs cursor-pointer ${feat.included ? "font-medium text-foreground" : "text-muted-foreground line-through"}`}>
                          {feat.feature}
                        </label>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={() => removeAdminFeature(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  {formData.adminPanelFeatures.length === 0 && (
                    <p className="text-[11px] text-muted-foreground text-center py-2">No modules added.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </TabsContent>

        {/* Tab 3: Timeline & Deliverables */}
        <TabsContent value="timeline" className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Implementation Timeline Stages</Label>
            <div className="flex gap-2 items-center">
              <Input
                value={newStageName}
                onChange={(e) => setNewStageName(e.target.value)}
                placeholder="Stage Description"
                className="h-7 text-xs"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTimelineStage(); } }}
              />
              <Input
                type="number"
                value={newStageDays}
                onChange={(e) => setNewStageDays(Number(e.target.value))}
                placeholder="Days"
                className="w-16 h-7 text-xs"
              />
              <Button type="button" size="sm" onClick={addTimelineStage} className="h-7 text-xs">Add</Button>
            </div>
            <div className="border rounded-md p-2 space-y-1 bg-muted/20 max-h-[140px] overflow-y-auto">
              {formData.timeline.map((stage, index) => (
                <div key={index} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                  <span>{stage.stage}</span>
                  <div className="flex items-center gap-2 font-bold">
                    <span>{stage.days} Days</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => removeTimelineStage(index)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="text-right text-xs font-bold pt-2 text-primary">
                Total Estimated Duration: {formData.timeline.reduce((sum, s) => sum + (Number(s.days) || 0), 0)} Days
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t pt-3">
            <Label className="text-xs font-semibold">Deliverables Checklist</Label>
            <div className="flex gap-2">
              <Input
                value={newDeliverable}
                onChange={(e) => setNewDeliverable(e.target.value)}
                placeholder="Deliverable Description"
                className="h-7 text-xs"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addDeliverable(); } }}
              />
              <Button type="button" size="sm" onClick={addDeliverable} className="h-7 text-xs">Add</Button>
            </div>
            <div className="border rounded-md p-2 space-y-1 bg-muted/20 max-h-[120px] overflow-y-auto">
              {formData.deliverables.map((item, index) => (
                <div key={index} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                  <span>• {item}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 text-destructive"
                    onClick={() => removeDeliverable(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
              {formData.deliverables.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">No deliverables added.</p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Tab 4: Pricing & Services */}
        <TabsContent value="pricing" className="space-y-4 mt-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Estimation Items *</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={addItem} className="h-7 text-xs">
                  <Plus className="w-3 h-3 mr-1" /> Add Cost Item
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addMonthlyItem}
                  className="h-7 text-xs border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                >
                  <Plus className="w-3 h-3 mr-1" /> Add Monthly Charge
                </Button>
              </div>
            </div>
            <div className="space-y-2 max-h-[160px] overflow-y-auto">
              {formData.items.map((item, index) => {
                const isMonthly = checkIsMonthly(item);
                return (
                  <div key={index} className="grid grid-cols-12 gap-2 items-start p-2 border rounded-lg bg-muted/20">
                    <div className="col-span-5 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <Label className="text-[9px]">Service / Module</Label>
                        <button
                          type="button"
                          onClick={() => toggleItemMonthly(index)}
                          className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-all cursor-pointer border ${
                            isMonthly
                              ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                              : "bg-muted text-muted-foreground border-border hover:border-slate-400"
                          }`}
                        >
                          {isMonthly ? "✓ Monthly" : "+ Set Monthly"}
                        </button>
                      </div>
                      <Input
                        placeholder="Service / Deliverable Name"
                        value={item.service}
                        onChange={(e) => handleItemChange(index, "service", e.target.value)}
                        required
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-3 space-y-0.5">
                      <Label className="text-[9px]">Price (₹)</Label>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={item.price || ""}
                        onChange={(e) => handleItemChange(index, "price", e.target.value === "" ? 0 : Number(e.target.value))}
                        required
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-2 space-y-0.5">
                      <Label className="text-[9px]">Qty</Label>
                      <Input
                        type="number"
                        placeholder="Qty"
                        value={item.quantity || ""}
                        onChange={(e) => handleItemChange(index, "quantity", e.target.value === "" ? 1 : Number(e.target.value))}
                        required
                        className="h-7 text-xs"
                      />
                    </div>
                    <div className="col-span-1 text-right pt-4">
                      <div className="text-xs font-bold">{formatCurrency(item.amount)}{isMonthly ? "/mo" : ""}</div>
                    </div>
                    <div className="col-span-1 pt-3 text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-2 border-t pt-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-semibold">Additional Services / Annual Maintenance (AMC)</Label>
              <span className="text-[10px] text-muted-foreground">(Optional / Optional Add-ons)</span>
            </div>
            <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
              <Input
                value={newAddServiceName}
                onChange={(e) => setNewAddServiceName(e.target.value)}
                placeholder="Custom Hosting, AMC, Domain, etc."
                className="h-7 text-xs flex-1"
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addAdditionalService(false); } }}
              />
              <Input
                type="number"
                value={newAddServicePrice || ""}
                onChange={(e) => setNewAddServicePrice(e.target.value === "" ? 0 : Number(e.target.value))}
                placeholder="Price"
                className="w-20 h-7 text-xs"
              />
              <Button type="button" size="sm" onClick={() => addAdditionalService(false)} className="h-7 text-xs bg-orange-600 hover:bg-orange-700 text-white whitespace-nowrap">
                Add Cost
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => addAdditionalService(true)}
                className="h-7 text-xs border-orange-500/50 text-orange-500 hover:bg-orange-500/10 whitespace-nowrap"
              >
                + Monthly Charge
              </Button>
            </div>
            <div className="border rounded-md p-2 space-y-1 bg-muted/20 max-h-[100px] overflow-y-auto">
              {formData.additionalServices.map((service, index) => {
                const isMonthly = checkIsMonthly(service);
                return (
                  <div key={index} className="flex items-center justify-between text-xs py-1 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span>{service.service}</span>
                      <button
                        type="button"
                        onClick={() => toggleAdditionalServiceMonthly(index)}
                        className={`text-[9px] px-1.5 py-0.5 rounded font-semibold transition-all cursor-pointer border ${
                          isMonthly
                            ? "bg-orange-500 text-white border-orange-600 shadow-sm"
                            : "bg-muted text-muted-foreground border-border hover:border-slate-400"
                        }`}
                      >
                        {isMonthly ? "✓ Monthly" : "+ Set Monthly"}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 font-bold">
                      <span>{formatCurrency(service.price)}{isMonthly ? " / mo" : ""}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-destructive"
                        onClick={() => removeAdditionalService(index)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              {formData.additionalServices.length === 0 && (
                <p className="text-[11px] text-muted-foreground text-center py-2">No additional or AMC services added.</p>
              )}
            </div>
          </div>

          {/* Real-time Pricing Summary Banner */}
          <div className="flex justify-between items-center bg-muted/30 p-2.5 rounded-lg border border-border mt-3">
            <div>
              <p className="text-[10px] text-muted-foreground">Items Base Total</p>
              <p className="text-sm font-semibold">{formatCurrency(formData.totalAmount)}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Total Quoted Investment</p>
              <p className="text-base font-bold text-primary">{formatCurrency(formData.totalAmount)}</p>
            </div>
          </div>
        </TabsContent>

        {/* Tab 5: Terms, Status, Notes */}
        <TabsContent value="terms" className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Payment Terms Schedule</Label>
              <div className="flex gap-2">
                <Input
                  value={newPaymentTerm}
                  onChange={(e) => setNewPaymentTerm(e.target.value)}
                  placeholder="e.g. 50% mobilization advance"
                  className="h-7 text-xs"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addPaymentTerm(); } }}
                />
                <Button type="button" size="sm" onClick={addPaymentTerm} className="h-7 text-xs">Add</Button>
              </div>
              <div className="border rounded-md p-2 space-y-1 bg-muted/20 max-h-[110px] overflow-y-auto">
                {formData.paymentTerms.map((term, index) => (
                  <div key={index} className="flex items-center justify-between text-xs py-0.5 border-b border-border/50 last:border-0">
                    <span className="truncate pr-1">• {term}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => removePaymentTerm(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {formData.paymentTerms.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-2">No payment terms added.</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Terms & Conditions</Label>
              <div className="flex gap-2">
                <Input
                  value={newTC}
                  onChange={(e) => setNewTC(e.target.value)}
                  placeholder="e.g. Handover upon full payment"
                  className="h-7 text-xs"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTC(); } }}
                />
                <Button type="button" size="sm" onClick={addTC} className="h-7 text-xs">Add</Button>
              </div>
              <div className="border rounded-md p-2 space-y-1 bg-muted/20 max-h-[110px] overflow-y-auto">
                {formData.termsAndConditions.map((item, index) => (
                  <div key={index} className="flex items-center justify-between text-xs py-0.5 border-b border-border/50 last:border-0">
                    <span className="truncate pr-1">• {item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive"
                      onClick={() => removeTC(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
                {formData.termsAndConditions.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-2">No terms added.</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center border-t pt-3">
            <div className="space-y-1">
              <Label className="text-xs">Quotation Status</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                <SelectTrigger className="w-[140px] h-7 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Accepted">Accepted</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                  <SelectItem value="Expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground">Total Quoted Amount</p>
              <p className="text-lg font-bold text-primary">{formatCurrency(formData.totalAmount)}</p>
            </div>
          </div>

          <div className="space-y-1 border-t pt-3">
            <Label className="text-xs">Additional Internal Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional comments or instructions..."
              rows={2}
              className="text-xs"
            />
          </div>
        </TabsContent>
      </Tabs>
    );
  };

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle={`${quotations.length} total quotations`}
        actions={
          <Button onClick={() => { resetForm(""); setIsCreateDialogOpen(true); }}>
            <Plus className="w-4 h-4 mr-2" />
            Create Quotation
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by quote #, project, or lead..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Status Filter Tabs */}
          <div className="flex flex-wrap gap-1">
            {["all", "Draft", "Sent", "Accepted", "Rejected", "Expired"].map((st) => (
              <Button
                key={st}
                type="button"
                variant={statusFilter === st ? "default" : "outline"}
                size="sm"
                className="h-8 text-xs capitalize"
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </Button>
            ))}
          </div>
        </div>

        {/* Quotations Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filteredQuotations.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No quotations found</h3>
            <p className="text-sm text-muted-foreground mb-6">
              {search || statusFilter !== "all" ? "No quotations match your search criteria." : "Start by creating your first quotation."}
            </p>
            <Button onClick={() => { resetForm(""); setIsCreateDialogOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Create Quotation
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Quotation #</TableHead>
                    <TableHead className="font-bold py-4">Project Name</TableHead>
                    <TableHead className="font-bold py-4">Type</TableHead>
                    <TableHead className="font-bold py-4">Lead</TableHead>
                    <TableHead className="font-bold py-4">Date</TableHead>
                    <TableHead className="font-bold py-4">Total Amount</TableHead>
                    <TableHead className="font-bold py-4">Status</TableHead>
                    <TableHead className="font-bold py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedQuotations.map((q: any) => (
                    <TableRow key={q._id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-3.5 tracking-tight">
                        {q.quotationNo}
                      </TableCell>
                      <TableCell className="text-sm py-3.5 font-semibold">
                        {q.projectName || "N/A"}
                      </TableCell>
                      <TableCell className="text-xs py-3.5 text-muted-foreground">
                        {q.projectType || "General"}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        {q.leadId?.leadName || (typeof q.leadId === 'string' ? "Lead Record" : "N/A")}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        {formatDate(q.date)}
                      </TableCell>
                      <TableCell className="text-sm font-bold py-3.5 text-primary">
                        {formatCurrency(q.totalAmount)}
                      </TableCell>
                      <TableCell className="py-3.5">
                        {getStatusBadge(q.status)}
                      </TableCell>
                      <TableCell className="text-right py-3.5">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => setViewingQuotation(q)}
                            title="View Quotation"
                          >
                            <Eye className="h-4 w-4 text-emerald-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-orange-500"
                            onClick={() => handleOpenEmailDialog(q)}
                            title="Send via Email"
                          >
                            <Mail className="h-4 w-4 text-orange-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => generateQuotationPDF(q)}
                            title="Download PDF"
                          >
                            <FileDown className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditClick(q)}
                            title="Edit Quotation"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setQuotationToDelete(q)}
                            title="Delete Quotation"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              totalItems={sortedQuotations.length}
              itemsPerPage={itemsPerPage}
              itemName="quotations"
            />
          </div>
        )}
      </div>

      {/* View Quotation Preview Modal */}
      <Dialog open={!!viewingQuotation} onOpenChange={() => setViewingQuotation(null)}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex justify-between items-center pr-6">
              <DialogTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Quotation {viewingQuotation?.quotationNo}
              </DialogTitle>
              {viewingQuotation && getStatusBadge(viewingQuotation.status)}
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Review full estimation parameters, pricing breakdown, and terms.
            </DialogDescription>
          </DialogHeader>

          {viewingQuotation && (
            <div className="space-y-4 text-sm mt-2">
              {/* Header Info Banner */}
              <div className="grid grid-cols-2 gap-3 p-3 bg-muted/30 rounded-lg border">
                <div>
                  <p className="text-[11px] text-muted-foreground">Client / Lead</p>
                  <p className="font-semibold text-foreground">{viewingQuotation.leadId?.leadName || "Valued Client"}</p>
                  {viewingQuotation.leadId?.email && (
                    <p className="text-xs text-muted-foreground">{viewingQuotation.leadId.email}</p>
                  )}
                  {viewingQuotation.leadId?.contactNumber && (
                    <p className="text-xs text-muted-foreground">Ph: {viewingQuotation.leadId.contactNumber}</p>
                  )}
                </div>
                <div className="text-right space-y-0.5">
                  <p className="text-[11px] text-muted-foreground">Project Title</p>
                  <p className="font-semibold text-foreground">{viewingQuotation.projectName}</p>
                  <p className="text-xs text-primary font-medium">{viewingQuotation.projectType || "General Services"}</p>
                  <p className="text-xs text-muted-foreground">Date: {formatDate(viewingQuotation.date)}</p>
                </div>
              </div>

              {/* Scope of Work */}
              {viewingQuotation.scopeOfWork && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary" /> Scope of Work
                  </p>
                  <div className="p-2.5 bg-muted/20 rounded-md border text-xs whitespace-pre-line text-muted-foreground">
                    {viewingQuotation.scopeOfWork}
                  </div>
                </div>
              )}

              {/* Modules / Screens (If present) */}
              {(viewingQuotation.websitePages?.length > 0 || viewingQuotation.adminPanelFeatures?.length > 0) && (
                <div className="grid grid-cols-2 gap-3 border rounded-lg p-3 bg-muted/10">
                  {viewingQuotation.websitePages?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1">Screens & Pages</p>
                      <ul className="space-y-1 max-h-[120px] overflow-y-auto text-xs text-muted-foreground">
                        {viewingQuotation.websitePages.map((p: any, idx: number) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className={p.included !== false ? "text-emerald-500 font-bold" : "text-muted-foreground"}>✓</span>
                            <span className={p.included !== false ? "" : "line-through opacity-60"}>{p.page || p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {viewingQuotation.adminPanelFeatures?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold mb-1">Administrative Modules</p>
                      <ul className="space-y-1 max-h-[120px] overflow-y-auto text-xs text-muted-foreground">
                        {viewingQuotation.adminPanelFeatures.map((f: any, idx: number) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className={f.included !== false ? "text-emerald-500 font-bold" : "text-muted-foreground"}>✓</span>
                            <span className={f.included !== false ? "" : "line-through opacity-60"}>{f.feature || f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Cost Items Table */}
              <div className="space-y-1.5">
                <p className="text-xs font-semibold flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-primary" /> Investment Breakdown
                </p>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/40">
                      <TableRow className="h-7 text-xs">
                        <TableHead className="py-1">Service / Deliverable</TableHead>
                        <TableHead className="py-1 text-center w-16">Qty</TableHead>
                        <TableHead className="py-1 text-right w-24">Unit Cost</TableHead>
                        <TableHead className="py-1 text-right w-24">Subtotal</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(viewingQuotation.items || []).map((it: any, idx: number) => (
                        <TableRow key={idx} className="h-8 text-xs">
                          <TableCell className="py-1 font-medium">{it.service || "Service Module"}</TableCell>
                          <TableCell className="py-1 text-center">{it.quantity || 1}</TableCell>
                          <TableCell className="py-1 text-right">{formatCurrency(it.price || 0)}</TableCell>
                          <TableCell className="py-1 text-right font-bold text-primary">
                            {formatCurrency(it.amount || (it.quantity || 1) * (it.price || 0))}{it.isMonthly ? "/mo" : ""}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Additional Services (Only if non-empty) */}
              {Array.isArray(viewingQuotation.additionalServices) && viewingQuotation.additionalServices.filter((s: any) => s.service?.trim()).length > 0 && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold">Additional / AMC Services</p>
                  <div className="border rounded-md p-2 bg-muted/20 space-y-1 text-xs">
                    {viewingQuotation.additionalServices.map((as: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center text-muted-foreground">
                        <span>• {as.service}</span>
                        <span className="font-semibold text-foreground">{formatCurrency(as.price)}{as.isMonthly ? "/mo" : ""}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total Card */}
              <div className="flex justify-between items-center p-3 bg-primary/10 rounded-lg border border-primary/20">
                <span className="font-semibold text-sm">Total Quoted Investment</span>
                <span className="text-lg font-bold text-primary">{formatCurrency(viewingQuotation.totalAmount)}</span>
              </div>
            </div>
          )}

          <DialogFooter className="border-t pt-3 flex items-center justify-between">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => viewingQuotation && generateQuotationPDF(viewingQuotation)}
                className="text-xs"
              >
                <FileDown className="w-3.5 h-3.5 mr-1 text-blue-500" /> Download PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = viewingQuotation;
                  setViewingQuotation(null);
                  handleOpenEmailDialog(target);
                }}
                className="text-xs text-orange-600 border-orange-500/30 hover:bg-orange-500/10"
              >
                <Mail className="w-3.5 h-3.5 mr-1 text-orange-500" /> Send via Email
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const target = viewingQuotation;
                  setViewingQuotation(null);
                  handleEditClick(target);
                }}
                className="text-xs"
              >
                <Edit className="w-3.5 h-3.5 mr-1" /> Edit
              </Button>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setViewingQuotation(null)} className="text-xs">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Quotation via Email Dialog */}
      <Dialog open={!!emailQuotation} onOpenChange={() => setEmailQuotation(null)}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <Mail className="w-5 h-5 text-orange-500" />
              Send Quotation via Email
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Email this official quotation directly with a compiled PDF attachment.
            </DialogDescription>
          </DialogHeader>
          {emailQuotation && (
            <form onSubmit={handleSendEmailSubmit} className="space-y-4 mt-2">
              <div className="bg-muted/30 p-3 rounded-lg border text-xs space-y-1">
                <div className="flex justify-between font-semibold text-foreground">
                  <span>Quotation: {emailQuotation.quotationNo}</span>
                  <span className="text-primary">{formatCurrency(emailQuotation.totalAmount)}</span>
                </div>
                <p className="text-muted-foreground">Project: {emailQuotation.projectName}</p>
                <p className="text-muted-foreground">Lead: {emailQuotation.leadId?.leadName || "Valued Client"}</p>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Recipient Email *</Label>
                <Input
                  type="email"
                  value={emailForm.email}
                  onChange={(e) => setEmailForm({ ...emailForm, email: e.target.value })}
                  placeholder="client@example.com"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Subject Line *</Label>
                <Input
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })}
                  placeholder="Subject"
                  required
                  className="h-8 text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Cover Message</Label>
                <Textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
                  rows={4}
                  className="text-xs"
                />
              </div>

              <div className="flex items-center gap-2 p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md text-xs text-emerald-600 dark:text-emerald-400">
                <FileDown className="w-4 h-4 shrink-0" />
                <div className="truncate">
                  <strong>Attached PDF:</strong> {emailQuotation.quotationNo}.pdf will be automatically compiled and attached.
                </div>
              </div>

              <DialogFooter className="border-t pt-3">
                <Button type="button" variant="outline" size="sm" onClick={() => setEmailQuotation(null)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={sendQuotationEmail.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white"
                >
                  {sendQuotationEmail.isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Sending Email...
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 mr-1.5" /> Send Email
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Create Quotation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Quotation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateQuotation} className="space-y-4 mt-2">
            {renderQuotationForm()}
            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createQuotation.isPending}>
                {createQuotation.isPending ? "Creating..." : "Create Quotation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Quotation Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[750px] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Quotation</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateQuotation} className="space-y-4 mt-2">
            {renderQuotationForm()}
            <DialogFooter className="border-t pt-3">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateQuotation.isPending}>
                {updateQuotation.isPending ? "Updating..." : "Update Quotation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!quotationToDelete} onOpenChange={() => setQuotationToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete quotation <strong>{quotationToDelete?.quotationNo}</strong>.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteQuotation}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteQuotation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Quotations;
