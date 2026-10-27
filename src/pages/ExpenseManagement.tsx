import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import expenseService from "@/services/api/expense";
import { ExpenseBackend } from "@/types/api";
import TablePagination from "@/components/TablePagination";
import { Button } from "@/components/ui/button";
import { Plus, Table as TableIcon, Calendar as CalendarIcon, Trash2, Eye } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExpenseCalendar from "@/components/ExpenseCalendar";
import AddExpenseDialog from "@/components/AddExpenseDialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ExpenseManagement = () => {
    const [isAddOpen, setIsAddOpen] = useState(false);
    const { user } = useAuth();
    const { toast } = useToast();
    const [returnStatusFilter, setReturnStatusFilter] = useState<string>("all");

    const { data: expenses, isLoading, refetch } = useQuery({
        queryKey: ["expenses", returnStatusFilter],
        queryFn: () => expenseService.getExpenses(returnStatusFilter !== "all" ? { returnStatus: returnStatusFilter } : undefined),
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        setCurrentPage(1);
    }, [returnStatusFilter]);

    // Recent added at top
    const sortedExpenses = [...(expenses || [])].sort((a: any, b: any) => {
        const dateA = new Date(a.date || a.createdAt || 0).getTime();
        const dateB = new Date(b.date || b.createdAt || 0).getTime();
        if (dateA !== dateB) return dateB - dateA;
        return 0;
    });

    const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
    const paginatedExpenses = sortedExpenses.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleDelete = async (id: string) => {
        try {
            await expenseService.deleteExpense(id);
            toast({ title: "Success", description: "Expense deleted successfully" });
            refetch();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete expense",
                variant: "destructive",
            });
        }
    };

    const handleToggleReturnStatus = async (id: string, currentStatus: string) => {
        try {
            const newStatus = currentStatus === "Pending" ? "Returned" : "Pending";
            await expenseService.updateReturnStatus(id, newStatus);
            toast({ title: "Success", description: `Marked as ${newStatus}` });
            refetch();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update return status",
                variant: "destructive",
            });
        }
    };

    if (isLoading) return <div className="p-8 text-center">Loading expenses...</div>;

    return (
        <div className="container mx-auto p-6 space-y-6 animate-in fade-in duration-500">
            <PageHeader
                title="Expense Management"
                subtitle="Track and manage company and founder expenses"
                actions={
                    <Button onClick={() => setIsAddOpen(true)} className="gap-2">
                        <Plus className="h-4 w-4" /> Add Expense
                    </Button>
                }
            />

            <Tabs defaultValue="calendar" className="w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <TabsList className="grid w-[400px] grid-cols-2">
                        <TabsTrigger value="calendar" className="gap-2">
                            <CalendarIcon className="h-4 w-4" /> Calendar View
                        </TabsTrigger>
                        <TabsTrigger value="table" className="gap-2">
                            <TableIcon className="h-4 w-4" /> Table View
                        </TabsTrigger>
                    </TabsList>

                    <Select value={returnStatusFilter} onValueChange={setReturnStatusFilter}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Returned">Returned</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <TabsContent value="calendar" className="mt-6">
                    <ExpenseCalendar 
                        expenses={expenses || []} 
                        onToggleStatus={(id, currentStatus) => user?.role === "admin" && handleToggleReturnStatus(id, currentStatus)}
                    />
                </TabsContent>

                <TabsContent value="table" className="mt-6">
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Paid From</TableHead>
                                    <TableHead>Return Status</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>To</TableHead>
                                    <TableHead>Recorded By</TableHead>
                                    <TableHead>Photo</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {paginatedExpenses.map((exp: any) => (
                                    <TableRow key={exp._id}>
                                        <TableCell>{format(new Date(exp.date), "dd MMM yyyy")}</TableCell>
                                        <TableCell className="font-medium">{exp.description}</TableCell>
                                        <TableCell><Badge variant="secondary">{exp.category}</Badge></TableCell>
                                        <TableCell><Badge variant="outline">{exp.type}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={exp.moneySource === "Company Money" ? "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20" : "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"}>
                                                {exp.moneySource}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <Badge 
                                                    variant={exp.returnStatus === "Returned" ? "default" : "outline"}
                                                    className={`cursor-pointer ${exp.returnStatus === "Returned" ? "bg-green-500 hover:bg-green-600 w-fit" : "text-yellow-600 border-yellow-600 w-fit"}`}
                                                    onClick={() => user?.role === "admin" && handleToggleReturnStatus(exp._id, exp.returnStatus)}
                                                >
                                                    {exp.returnStatus}
                                                </Badge>
                                                {exp.returnStatus === "Returned" && exp.returnDate && (
                                                    <span className="text-[10px] text-green-600 font-medium">
                                                        {format(new Date(exp.returnDate), "dd MMM, HH:mm")}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-bold">₹{exp.amount}</TableCell>
                                        <TableCell>{exp.recipientName || "-"}</TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-semibold">{exp.recordedBy?.name || "Unknown"}</span>
                                                <span className="text-[10px] text-muted-foreground capitalize">{exp.recordedBy?.role}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {exp.receiptImage ? (
                                                <Button variant="ghost" size="icon" asChild>
                                                    <a href={exp.receiptImage} target="_blank" rel="noopener noreferrer">
                                                        <Eye className="h-4 w-4 text-blue-500" />
                                                    </a>
                                                </Button>
                                            ) : "No Photo"}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            {user?.role === "admin" && (
                                                <AlertDialog>
                                                    <AlertDialogTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </AlertDialogTrigger>
                                                    <AlertDialogContent>
                                                        <AlertDialogHeader>
                                                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                            <AlertDialogDescription>
                                                                This action cannot be undone. This will permanently delete the expense record and its proof.
                                                            </AlertDialogDescription>
                                                        </AlertDialogHeader>
                                                        <AlertDialogFooter>
                                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                            <AlertDialogAction onClick={() => handleDelete(exp._id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                                Delete
                                                            </AlertDialogAction>
                                                        </AlertDialogFooter>
                                                    </AlertDialogContent>
                                                </AlertDialog>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {sortedExpenses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                                            No expenses found.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            totalItems={sortedExpenses.length}
                            itemsPerPage={itemsPerPage}
                            itemName="expenses"
                        />
                    </div>
                </TabsContent>
            </Tabs>

            <AddExpenseDialog
                isOpen={isAddOpen}
                onOpenChange={setIsAddOpen}
                onSuccess={() => refetch()}
            />
        </div>
    );
};

export default ExpenseManagement;
