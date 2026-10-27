import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import TablePagination from "@/components/TablePagination";
import StatusBadge from "@/components/StatusBadge";
import StatusSelect from "@/components/StatusSelect";
import { Button } from "@/components/ui/button";
import { Plus, Search, Edit, Trash2, Eye, Key, Github, Globe, UserCheck, GraduationCap, Server } from "lucide-react";
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
import { useHandovers, useCreateHandover, useUpdateHandover, useDeleteHandover } from "@/hooks/useHandovers";
import { useProjects } from "@/hooks/useProjects";
import { useEmployees } from "@/hooks/useEmployees";
import { useInterns } from "@/hooks/useInterns";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDate } from "@/utils/dateUtils";
import { DatePicker } from "@/components/ui/date-picker";

import { useAuth } from "@/contexts/AuthContext";

const Handovers = () => {
    const { user } = useAuth();
    const isAdmin = user?.role === 'admin';
    const [search, setSearch] = useState("");
    const [selectedHandover, setSelectedHandover] = useState<any | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [handoverToDelete, setHandoverToDelete] = useState<any | null>(null);
    const [formData, setFormData] = useState({
        projectId: "",
        assigneeId: "",
        assigneeModel: "employee" as "employee" | "intern",
        handoverDate: new Date().toISOString().split('T')[0],
        deadline: "",
        instructions: "",
        status: "In Progress" as any,
        credentials: {
            adminUrl: "",
            adminUser: "",
            adminPass: "",
            dbUrl: "",
            serverIp: "",
            ftpHost: "",
            ftpUser: "",
            ftpPass: "",
            githubUrl: "",
        }
    });

    const { data: handovers = [], isLoading } = useHandovers();
    const { data: projects = [] } = useProjects();
    const { data: employees = [] } = useEmployees({ enabled: isAdmin });
    const { data: interns = [] } = useInterns({ enabled: isAdmin });
    const createHandover = useCreateHandover();
    const updateHandover = useUpdateHandover();
    const deleteHandover = useDeleteHandover();
    const { toast } = useToast();

    const [statusFilter, setStatusFilter] = useState("all");

    // Filter out completed projects for handover assignment (do not show completed projects)
    const assignableProjects = projects
        .filter((p: any) => p.status !== 'Completed' || (isEditDialogOpen && p.id === formData.projectId))
        .sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Combine employees and interns into a single list (only active personnel can be assigned)
    const allAssignees = [...employees, ...interns]
        .filter((a: any) => a.status !== 'inactive')
        .sort((a, b) => a.name.localeCompare(b.name));

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter]);

    const filteredHandovers = handovers.filter((h: any) => {
        const matchesSearch =
            h.projectName?.toLowerCase().includes(search.toLowerCase()) ||
            h.assigneeName?.toLowerCase().includes(search.toLowerCase());
        const matchesStatus =
            statusFilter === "all" ? true :
            statusFilter === "active" ? h.status !== "Completed" :
            h.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Recent added at top
    const sortedHandovers = [...filteredHandovers].sort((a: any, b: any) => {
        const dateA = new Date(a.createdAt || a.handoverDate || 0).getTime();
        const dateB = new Date(b.createdAt || b.handoverDate || 0).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return 0;
    });

    const totalPages = Math.ceil(sortedHandovers.length / itemsPerPage);
    const paginatedHandovers = sortedHandovers.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleCreateHandover = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await createHandover.mutateAsync(formData);
            setIsCreateDialogOpen(false);
            resetForm();
        } catch (error) { }
    };

    const handleUpdateHandover = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHandover) return;
        try {
            await updateHandover.mutateAsync({ id: selectedHandover.id, data: formData });
            setIsEditDialogOpen(false);
            resetForm();
        } catch (error) { }
    };

    const handleDeleteHandover = async () => {
        if (!handoverToDelete) return;
        try {
            await deleteHandover.mutateAsync(handoverToDelete.id);
            setHandoverToDelete(null);
        } catch (error) { }
    };

    const resetForm = () => {
        setFormData({
            projectId: "",
            assigneeId: "",
            assigneeModel: "employee",
            handoverDate: new Date().toISOString().split('T')[0],
            deadline: "",
            instructions: "",
            status: "In Progress",
            credentials: {
                adminUrl: "",
                adminUser: "",
                adminPass: "",
                dbUrl: "",
                serverIp: "",
                ftpHost: "",
                ftpUser: "",
                ftpPass: "",
                githubUrl: "",
            }
        });
        setSelectedHandover(null);
    };

    const handleEditClick = (handover: any) => {
        setSelectedHandover(handover);
        setFormData({
            projectId: handover.projectId,
            assigneeId: handover.assigneeId,
            assigneeModel: handover.assigneeModel,
            handoverDate: handover.handoverDate.split('T')[0],
            deadline: handover.deadline ? handover.deadline.split('T')[0] : "",
            instructions: handover.instructions || "",
            status: handover.status,
            credentials: { ...handover.credentials }
        });
        setIsEditDialogOpen(true);
    };

    const handleAssigneeChange = (value: string) => {
        const selected = allAssignees.find(a => a.id === value);
        if (selected && selected.type === 'employee' && selected.status === 'inactive') {
            toast({
                title: "Employee Inactive",
                description: "Cannot assign handovers or work to an inactive employee.",
                variant: "destructive",
            });
            return;
        }
        if (selected) {
            setFormData({
                ...formData,
                assigneeId: value,
                assigneeModel: selected.type as "employee" | "intern"
            });
        }
    };

    return (
        <div>
            <PageHeader
                title="Project Handovers"
                subtitle="Manage and track project handovers to employees and interns"
                actions={
                    isAdmin && (
                        <Button onClick={() => setIsCreateDialogOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Handover
                        </Button>
                    )
                }
            />

            <div className="p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                    <div className="relative max-w-md w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search handovers..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-[160px] h-10">
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

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-16 rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="responsive-table-container custom-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Assignee</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Handover Date</TableHead>
                                    <TableHead>Deadline</TableHead>
                                    <TableHead>Status</TableHead>
                                    {isAdmin && <TableHead className="text-right">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedHandovers.map((handover: any) => (
                                    <TableRow key={handover.id}>
                                        <TableCell className="font-medium">{handover.projectName}</TableCell>
                                        <TableCell>{handover.assigneeName}</TableCell>
                                        <TableCell>
                                            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                {handover.assigneeModel === 'employee' ?
                                                    <><UserCheck className="w-3 h-3 text-blue-500" /> Employee</> :
                                                    <><GraduationCap className="w-3 h-3 text-purple-500" /> Intern</>
                                                }
                                            </span>
                                        </TableCell>
                                        <TableCell>{formatDate(handover.handoverDate)}</TableCell>
                                        <TableCell>{formatDate(handover.deadline)}</TableCell>
                                        <TableCell>
                                            {isAdmin ? (
                                                <StatusSelect
                                                    value={handover.status || "In Progress"}
                                                    onChange={async (newStatus) => {
                                                        try {
                                                            await updateHandover.mutateAsync({
                                                                id: handover.id,
                                                                data: { status: newStatus }
                                                            });
                                                        } catch (error) {}
                                                    }}
                                                />
                                            ) : (
                                                <StatusBadge status={handover.status} />
                                            )}
                                        </TableCell>
                                        {isAdmin ? (
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="ghost" title="View Credentials" onClick={() => { setSelectedHandover(handover); setIsViewDialogOpen(true); }}>
                                                        <Eye className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" title="Edit Handover" onClick={() => handleEditClick(handover)}>
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="ghost" title="Revoke access" onClick={() => setHandoverToDelete(handover)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        ) : (
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="outline" onClick={() => { setSelectedHandover(handover); setIsViewDialogOpen(true); }}>
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                                {sortedHandovers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">No handovers found.</TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={sortedHandovers.length}
                            itemsPerPage={itemsPerPage}
                            itemName="handovers"
                        />
                    </div>
                )}
            </div>

            {/* Create/Edit Handover Dialog */}
            <Dialog
                open={isCreateDialogOpen || isEditDialogOpen}
                onOpenChange={(open) => { if (!open) { setIsCreateDialogOpen(false); setIsEditDialogOpen(false); resetForm(); } }}
            >
                <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{isEditDialogOpen ? "Edit Handover" : "Project Handover"}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={isEditDialogOpen ? handleUpdateHandover : handleCreateHandover} className="space-y-6 mt-4">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Project *</Label>
                                <Select value={formData.projectId} onValueChange={(v) => setFormData({ ...formData, projectId: v })} required>
                                    <SelectTrigger><SelectValue placeholder="Select Project" /></SelectTrigger>
                                    <SelectContent>
                                        {assignableProjects.length === 0 ? (
                                            <div className="p-3 text-xs text-muted-foreground text-center">
                                                No active projects available
                                            </div>
                                        ) : (
                                            assignableProjects.map((p: any) => (
                                                <SelectItem key={p.id} value={p.id}>
                                                    {p.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Assignee *</Label>
                                <Select value={formData.assigneeId} onValueChange={handleAssigneeChange} required>
                                    <SelectTrigger><SelectValue placeholder="Select Employee or Intern" /></SelectTrigger>
                                    <SelectContent>
                                        {allAssignees.map((a: any) => (
                                            <SelectItem key={a.id} value={a.id}>
                                                <div className="flex items-center gap-2">
                                                    {a.type === 'employee' ?
                                                        <UserCheck className="w-3.5 h-3.5 text-blue-500" /> :
                                                        <GraduationCap className="w-3.5 h-3.5 text-purple-500" />
                                                    }
                                                    <span>{a.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase opacity-70 ml-1">
                                                        ({a.type})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label>Handover Date</Label>
                                <DatePicker 
                                    date={formData.handoverDate} 
                                    setDate={(v) => setFormData({ ...formData, handoverDate: v })} 
                                    placeholder="Select handover date"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Deadline</Label>
                                <DatePicker 
                                    date={formData.deadline} 
                                    setDate={(v) => setFormData({ ...formData, deadline: v })} 
                                    placeholder="Set deadline (optional)"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v })}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="New">New</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="On Hold">On Hold</SelectItem>
                                        <SelectItem value="Handed Over">Handed Over</SelectItem>
                                        <SelectItem value="Revoked">Revoked</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold flex items-center gap-2 border-b pb-2"><Key className="w-4 h-4" /> Credentials & Server Details</h3>
                            <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg bg-secondary/20">
                                <div className="space-y-2">
                                    <Label className="text-xs">Admin URL</Label>
                                    <Input value={formData.credentials.adminUrl} onChange={(e) => setFormData({ ...formData, credentials: { ...formData.credentials, adminUrl: e.target.value } })} placeholder="https://..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">GitHub Repo</Label>
                                    <Input value={formData.credentials.githubUrl} onChange={(e) => setFormData({ ...formData, credentials: { ...formData.credentials, githubUrl: e.target.value } })} placeholder="https://github.com/..." />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Username / DB Tool</Label>
                                    <Input value={formData.credentials.adminUser} onChange={(e) => setFormData({ ...formData, credentials: { ...formData.credentials, adminUser: e.target.value } })} />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs">Password / DB Key</Label>
                                    <Input value={formData.credentials.adminPass} onChange={(e) => setFormData({ ...formData, credentials: { ...formData.credentials, adminPass: e.target.value } })} />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label className="text-xs">Database / Server IP</Label>
                                    <Input value={formData.credentials.dbUrl} onChange={(e) => setFormData({ ...formData, credentials: { ...formData.credentials, dbUrl: e.target.value } })} placeholder="Connecting string or IP..." />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Instructions</Label>
                            <Textarea
                                value={formData.instructions}
                                onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                                placeholder="Specific tasks, branching info, or login notes..."
                                className="h-24"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => { setIsCreateDialogOpen(false); setIsEditDialogOpen(false); resetForm(); }}>Cancel</Button>
                            <Button type="submit" disabled={createHandover.isPending || updateHandover.isPending}>
                                {isEditDialogOpen ? (updateHandover.isPending ? "Updating..." : "Update Handover") : (createHandover.isPending ? "Creating..." : "Create Handover")}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* View Details Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader><DialogTitle>Handover Credentials</DialogTitle></DialogHeader>
                    {selectedHandover && (
                        <div className="space-y-6 mt-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-bold text-lg text-primary">{selectedHandover.projectName}</h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                                        Assigned to: <span className="text-foreground font-medium">{selectedHandover.assigneeName}</span>
                                        ({selectedHandover.assigneeModel})
                                    </p>
                                </div>
                                <StatusBadge status={selectedHandover.status} />
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <Card className="bg-secondary/10 border-none">
                                    <CardHeader className="py-3 px-4 flex flex-row items-center gap-2"><Globe className="w-4 h-4 text-blue-500" /><CardTitle className="text-sm">Admin Panel</CardTitle></CardHeader>
                                    <CardContent className="py-0 px-4 pb-4 space-y-2">
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <span className="text-muted-foreground">URL:</span>
                                            {selectedHandover.credentials?.adminUrl ? (
                                                <a href={selectedHandover.credentials.adminUrl} target="_blank" className="text-blue-500 hover:underline truncate">{selectedHandover.credentials.adminUrl}</a>
                                            ) : <span>N/A</span>}
                                            <span className="text-muted-foreground">User:</span>
                                            <span className="font-mono">{selectedHandover.credentials?.adminUser || 'N/A'}</span>
                                            <span className="text-muted-foreground">Pass:</span>
                                            <span className="font-mono">{selectedHandover.credentials?.adminPass || 'N/A'}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-secondary/10 border-none">
                                    <CardHeader className="py-3 px-4 flex flex-row items-center gap-2"><Server className="w-4 h-4 text-green-500" /><CardTitle className="text-sm">Server / DB</CardTitle></CardHeader>
                                    <CardContent className="py-0 px-4 pb-4 space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-2">
                                            <span className="text-muted-foreground">Host/IP:</span>
                                            <span className="font-mono truncate">{selectedHandover.credentials?.dbUrl || 'N/A'}</span>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card className="bg-secondary/10 border-none">
                                    <CardHeader className="py-3 px-4 flex flex-row items-center gap-2"><Github className="w-4 h-4 text-purple-500" /><CardTitle className="text-sm">Repository</CardTitle></CardHeader>
                                    <CardContent className="py-0 px-4 pb-4 space-y-2 text-sm">
                                        <span className="text-muted-foreground mr-2">Link:</span>
                                        {selectedHandover.credentials?.githubUrl ? (
                                            <a href={selectedHandover.credentials.githubUrl} target="_blank" className="text-blue-500 hover:underline truncate">{selectedHandover.credentials.githubUrl}</a>
                                        ) : <span>N/A</span>}
                                    </CardContent>
                                </Card>

                                {selectedHandover.instructions && (
                                    <div className="p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg border border-orange-200 dark:border-orange-950/50">
                                        <Label className="text-xs text-orange-600 dark:text-orange-400 font-bold uppercase">Instructions</Label>
                                        <p className="text-sm mt-1 whitespace-pre-wrap">{selectedHandover.instructions}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation */}
            <AlertDialog open={!!handoverToDelete} onOpenChange={() => setHandoverToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Revoke Handover?</AlertDialogTitle>
                        <AlertDialogDescription>This will delete the handover record and credentials. Inform the {handoverToDelete?.assigneeModel} if access is being revoked.</AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteHandover} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default Handovers;
