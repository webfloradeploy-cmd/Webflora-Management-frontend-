import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "@/components/PageHeader";
import StatusBadge from "@/components/StatusBadge";
import { Button } from "@/components/ui/button";
import { Plus, Mail, Building2, Search, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from "@/hooks/useClients";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import TablePagination from "@/components/TablePagination";
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

const Clients = () => {
  const [search, setSearch] = useState("");
  const [selectedClient, setSelectedClient] = useState<any | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any | null>(null);
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
    clientName: "",
    email: "",
    contactNumber: "",
    address: "",
    referenceNo: "",
  });

  const { data: clients = [], isLoading, error } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();
  const { toast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const filteredClients = clients.filter(
    (c: any) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.clientId && c.clientId.toLowerCase().includes(search.toLowerCase())) ||
      (c.referenceNo && c.referenceNo.toLowerCase().includes(search.toLowerCase())) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase())) ||
      (c.phone && c.phone.includes(search))
  );

  // Recent added at the top
  const sortedClients = [...filteredClients].sort((a: any, b: any) => {
    const numA = parseInt((a.clientId || a.referenceNo || "").replace(/\D/g, "") || "0", 10);
    const numB = parseInt((b.clientId || b.referenceNo || "").replace(/\D/g, "") || "0", 10);
    if (numA && numB && numA !== numB) return numB - numA;

    const dateA = new Date(a.createdAt || a.joinDate || 0).getTime();
    const dateB = new Date(b.createdAt || b.joinDate || 0).getTime();
    if (dateA !== dateB) return dateB - dateA;

    return 0;
  });

  const totalPages = Math.ceil(sortedClients.length / itemsPerPage);
  const paginatedClients = sortedClients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createClient.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      setFormData({
        clientName: "",
        email: "",
        contactNumber: "",
        address: "",
        referenceNo: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create client",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (client: any) => {
    setFormData({
      clientName: client.name,
      email: client.email || "",
      contactNumber: client.phone || "",
      address: client.address || "",
      referenceNo: client.referenceNo || "",
    });
    setSelectedClient(client);
    setIsEditDialogOpen(true);
  };

  const handleUpdateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;

    try {
      await updateClient.mutateAsync({
        id: selectedClient.id,
        data: formData,
      });
      setIsEditDialogOpen(false);
      setSelectedClient(null);
      setFormData({
        clientName: "",
        email: "",
        contactNumber: "",
        address: "",
        referenceNo: "",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update client",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClient = async () => {
    if (!clientToDelete) return;

    try {
      await deleteClient.mutateAsync(clientToDelete.id);
      setClientToDelete(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete client",
        variant: "destructive",
      });
    }
  };

  if (error) {
    return (
      <div>
        <PageHeader title="Clients" subtitle="Error loading clients" />
        <div className="p-6">
          <div className="bg-destructive/10 text-destructive p-4 rounded-lg">
            Failed to load clients. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`${clients.length} total clients`}
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search clients by name, customer ID, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Clients Table */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 rounded-xl" />
            ))}
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-border rounded-xl">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-1">No clients found</h3>
            <p className="text-sm text-muted-foreground mb-6">Start by adding your first client.</p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" /> Add Client
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="font-bold py-4">Customer ID</TableHead>
                    <TableHead className="font-bold py-4">Client Name</TableHead>
                    <TableHead className="font-bold py-4">Email</TableHead>
                    <TableHead className="font-bold py-4">Contact Number</TableHead>
                    <TableHead className="font-bold py-4">Total Billed</TableHead>
                    <TableHead className="font-bold py-4">Projects</TableHead>
                    <TableHead className="font-bold py-4 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClients.map((client: any) => (
                    <TableRow key={client.id} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="py-3.5">
                        <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 whitespace-nowrap">
                          {client.clientId || client.referenceNo || "—"}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium py-3.5 tracking-tight">
                        {client.name}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                          {client.email}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        {client.phone}
                      </TableCell>
                      <TableCell className="text-sm font-semibold py-3.5 mono">
                        {formatCurrency(client.totalBilled)}
                      </TableCell>
                      <TableCell className="text-sm py-3.5">
                        <Badge variant="secondary" className="font-medium">
                          {client.projects} Projects
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-3.5">
                        <div className="flex justify-end gap-1 opacity-100 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleEditClick(client)} title="Edit Client">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setClientToDelete(client)} title="Delete Client">
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
              totalItems={sortedClients.length}
              itemsPerPage={itemsPerPage}
              itemName="clients"
            />
          </div>
        )}
      </div>

      {/* Create Client Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateClient} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name *</Label>
              <Input
                id="clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactNumber">Contact Number *</Label>
              <Input
                id="contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="Enter contact number"
                required
              />
            </div>

            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="City, State"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="referenceNo">Reference Number</Label>
                <Input
                  id="referenceNo"
                  value={formData.referenceNo}
                  onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                  placeholder="WT-REF-0001"
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
              <Button type="submit" disabled={createClient.isPending}>
                {createClient.isPending ? "Creating..." : "Create Client"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdateClient} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="edit-clientName">Client Name *</Label>
              <Input
                id="edit-clientName"
                value={formData.clientName}
                onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                placeholder="Enter client name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contactNumber">Contact Number *</Label>
              <Input
                id="edit-contactNumber"
                value={formData.contactNumber}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
                placeholder="9876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-address">Address *</Label>
              <Input
                id="edit-address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, State"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-referenceNo">Reference Number</Label>
              <Input
                id="edit-referenceNo"
                value={formData.referenceNo}
                onChange={(e) => setFormData({ ...formData, referenceNo: e.target.value })}
                placeholder="WT-REF-0001"
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
              <Button type="submit" disabled={updateClient.isPending}>
                {updateClient.isPending ? "Updating..." : "Update Client"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!clientToDelete} onOpenChange={() => setClientToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{clientToDelete?.name}</strong> and all associated data.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteClient}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteClient.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
