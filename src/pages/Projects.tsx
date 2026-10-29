import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import StatusSelect from "@/components/StatusSelect";
import { Button } from "@/components/ui/button";
import { Plus, Search, Calendar, Users as UsersIcon, Trash2, Eye, Building2, History, Edit } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { useProjects, useCreateProject, useDeleteProject, useUpdateProject } from "@/hooks/useProjects";
import { useClients } from "@/hooks/useClients";
import { useEmployees } from "@/hooks/useEmployees";
import { useToast } from "@/hooks/use-toast";
import TablePagination from "@/components/TablePagination";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/utils/dateUtils";
import { DatePicker } from "@/components/ui/date-picker";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

const Projects = () => {
  const [search, setSearch] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get("create") === "true") {
      setIsCreateDialogOpen(true);
      // Remove the param after opening to prevent re-opening on refresh
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("create");
      setSearchParams(newParams);
    }
  }, [searchParams, setSearchParams]);

  const [formData, setFormData] = useState({
    projectName: "",
    client: "",
    description: "",
    status: "New" as "New" | "In Progress" | "On Hold" | "Completed",
    totalAmount: "",
    startDate: "",
    endDate: "",
    assignedTeam: [] as string[],
  });

  const { data: projects = [], isLoading } = useProjects();
  const { data: clients = [] } = useClients();
  const { data: employees = [] } = useEmployees();
  const { toast } = useToast();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ? true :
      statusFilter === "active" ? p.status !== "Completed" :
      p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Newest added at top
  const sortedProjects = [...filteredProjects].sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt || a.startDate || 0).getTime();
    const dateB = new Date(b.createdAt || b.startDate || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;
    return 0;
  });

  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage);
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.assignedTeam && formData.assignedTeam.length > 0) {
      const hasInactive = employees.some((emp: any) => formData.assignedTeam.includes(emp.id) && emp.status === 'inactive');
      if (hasInactive) {
        toast({
          title: "Inactive Employee",
          description: "Cannot assign project to an inactive employee.",
          variant: "destructive",
        });
        return;
      }
    }
    try {
      await createProject.mutateAsync({
        ...formData,
        totalAmount: Number(formData.totalAmount),
      });
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProject) return;
    if (formData.assignedTeam && formData.assignedTeam.length > 0) {
      const hasInactive = employees.some((emp: any) => formData.assignedTeam.includes(emp.id) && emp.status === 'inactive');
      if (hasInactive) {
        toast({
          title: "Inactive Employee",
          description: "Cannot assign project to an inactive employee.",
          variant: "destructive",
        });
        return;
      }
    }
    try {
      await updateProject.mutateAsync({
        id: selectedProject.id,
        data: {
          ...formData,
          totalAmount: Number(formData.totalAmount),
        },
      });
      setIsEditDialogOpen(false);
      setSelectedProject(null);
      resetForm();
    } catch (error) {
      // Error handled by hook
    }
  };

  const resetForm = () => {
    setFormData({
      projectName: "",
      client: "",
      description: "",
      status: "New",
      totalAmount: "",
      startDate: "",
      endDate: "",
      assignedTeam: [],
    });
  };

  const handleViewProject = (project: any) => {
    setSelectedProject(project);
    setIsViewDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "bg-green-500/10 text-green-500 border-green-500/20";
      case "In Progress": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      case "On Hold": return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "New": return "bg-slate-500/10 text-slate-500 border-slate-500/20";
      default: return "bg-slate-500/10 text-slate-500 border-slate-500/20";
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle={`${projects.length} total projects`}
        actions={
          <Button onClick={() => { resetForm(); setIsCreateDialogOpen(true); }} size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 h-9">
            <Plus className="w-4 h-4 mr-1.5" /> New Project
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Search & Filter */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search projects..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 bg-card border-border"
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px] h-9 bg-card border-border text-xs">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active Only</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="On Hold">On Hold</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Projects Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No projects found</h3>
            <p className="text-sm text-muted-foreground mb-6">Start by adding your first project.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> New Project
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Project Name</TableHead>
                    <TableHead className="font-bold py-4">Client</TableHead>
                    <TableHead className="font-bold py-4">Budget</TableHead>
                    <TableHead className="font-bold py-4">Deadline</TableHead>
                    <TableHead className="font-bold py-4">Status</TableHead>
                    <TableHead className="font-bold py-4 w-[150px]">Progress</TableHead>
                    <TableHead className="font-bold py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedProjects.map((project: any) => (
                    <TableRow key={project.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium py-3.5 italic-text tracking-tight">
                        {project.name}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
                          {project.client}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-semibold py-3.5 mono">
                        {formatCurrency(project.budget)}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(project.deadline)}
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5">
                        <StatusSelect
                          value={project.status || "New"}
                          onChange={async (newStatus) => {
                            try {
                              await updateProject.mutateAsync({
                                id: project.id,
                                data: { status: newStatus }
                              });
                            } catch (err) {}
                          }}
                        />
                      </TableCell>
                      <TableCell className="py-3.5">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-medium text-muted-foreground">
                            <span>{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-3.5">
                        <div className="flex justify-end gap-1 opacity-100 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleViewProject(project)} title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => {
                              setSelectedProject(project);
                              setFormData({
                                projectName: project.name,
                                client: project.clientId || "",
                                description: project.description || "",
                                status: project.status,
                                totalAmount: project.budget.toString(),
                                startDate: project.startDate?.split('T')[0] || "",
                                endDate: project.deadline?.split('T')[0] || "",
                                assignedTeam: Array.isArray(project.assignedTeam)
                                  ? project.assignedTeam.map((m: any) => typeof m === 'object' ? (m._id || m.id) : m)
                                  : [],
                              });
                              setIsEditDialogOpen(true);
                            }} title="Edit Project">
                              <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => deleteProject.mutate(project.id)} title="Delete Project">
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
              totalItems={sortedProjects.length}
              itemsPerPage={itemsPerPage}
              itemName="projects"
            />
          </div>
        )}
      </div>

      {/* Create Project Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="projectName">Project Name *</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                placeholder="E-commerce Platform"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={formData.client}
                  onValueChange={(value) => setFormData({ ...formData, client: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.clientId ? `[${client.clientId}] ` : ''}{client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalAmount">Total Amount *</Label>
                <Input
                  id="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  placeholder="100000"
                  required
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="On Hold">On Hold</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Deadline</Label>
                  <DatePicker 
                    date={formData.endDate} 
                    setDate={(v) => setFormData({ ...formData, endDate: v })} 
                    placeholder="Select deadline"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedTeam">Assigned Employee (Optional)</Label>
                <Select
                  value={formData.assignedTeam?.[0] || "none"}
                  onValueChange={(val) => setFormData({ ...formData, assignedTeam: val === "none" ? [] : [val] })}
                >
                  <SelectTrigger id="assignedTeam">
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">None / Unassigned</SelectItem>
                    {employees
                      .filter((emp: any) => emp.status !== 'inactive')
                      .map((emp: any) => (
                        <SelectItem key={emp.id} value={emp.id}>
                          {emp.name} ({emp.role})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Project details..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createProject.isPending}>
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-projectName">Project Name *</Label>
              <Input
                id="edit-projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-client">Client *</Label>
                <Select
                  value={formData.client}
                  onValueChange={(value) => setFormData({ ...formData, client: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.clientId ? `[${client.clientId}] ` : ''}{client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-totalAmount">Total Amount *</Label>
                <Input
                  id="edit-totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="On Hold">On Hold</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-endDate">Deadline</Label>
                <DatePicker 
                  date={formData.endDate} 
                  setDate={(v) => setFormData({ ...formData, endDate: v })} 
                  placeholder="Select deadline"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-assignedTeam">Assigned Employee (Optional)</Label>
              <Select
                value={formData.assignedTeam?.[0] || "none"}
                onValueChange={(val) => setFormData({ ...formData, assignedTeam: val === "none" ? [] : [val] })}
              >
                <SelectTrigger id="edit-assignedTeam">
                  <SelectValue placeholder="Select team member" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None / Unassigned</SelectItem>
                  {employees
                    .filter((emp: any) => emp.status !== 'inactive')
                    .map((emp: any) => (
                      <SelectItem key={emp.id} value={emp.id}>
                        {emp.name} ({emp.role})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={updateProject.isPending}>
                {updateProject.isPending ? "Updating..." : "Update Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Project Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedProject?.name}</DialogTitle>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <Building2 className="w-3.5 h-3.5 mr-1.5" />
              {selectedProject?.client}
            </div>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-card border border-border rounded-xl p-4">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold mb-1">Total Budget</p>
                <p className="text-lg font-bold">{formatCurrency(selectedProject?.budget || 0)}</p>
              </div>
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4">
                <p className="text-[10px] text-primary/70 uppercase tracking-wider font-bold mb-1">Total Paid</p>
                <p className="text-lg font-bold text-primary">{formatCurrency(selectedProject?.totalPaid || 0)}</p>
              </div>
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
                <p className="text-[10px] text-destructive/70 uppercase tracking-wider font-bold mb-1">Total Due</p>
                <p className="text-lg font-bold text-destructive">{formatCurrency(selectedProject?.dueAmount || 0)}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <History className="w-4 h-4" />
                Transaction History
              </h3>

              {!selectedProject?.invoices || selectedProject.invoices.length === 0 ? (
                <div className="text-center py-8 bg-muted/30 rounded-xl border border-dashed border-border border-2">
                  <p className="text-xs text-muted-foreground">No invoices recorded for this project.</p>
                </div>
              ) : (
                <div className="border rounded-xl overflow-hidden shadow-sm bg-background">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="text-[10px] uppercase font-bold">Invoice #</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold">Date</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-right">Amount</TableHead>
                        <TableHead className="text-[10px] uppercase font-bold text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedProject.invoices.map((invoice: any) => (
                        <TableRow key={invoice.id} className="cursor-default">
                          <TableCell className="text-xs py-2.5">{invoice.number}</TableCell>
                          <TableCell className="text-xs py-2.5">{formatDate(invoice.issueDate)}</TableCell>
                          <TableCell className="text-xs font-bold py-2.5 text-right">{formatCurrency(invoice.amount)}</TableCell>
                          <TableCell className="py-2.5 text-center">
                            <StatusBadge status={invoice.status} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Description</h4>
                <p className="text-xs leading-relaxed text-foreground/80">{selectedProject?.description || "No description provided."}</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Project Timeline</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Start Date</p>
                    <p className="text-xs font-semibold">{formatDate(selectedProject?.startDate)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-muted-foreground uppercase font-medium">Deadline</p>
                    <p className="text-xs font-semibold">{formatDate(selectedProject?.deadline)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Projects;
