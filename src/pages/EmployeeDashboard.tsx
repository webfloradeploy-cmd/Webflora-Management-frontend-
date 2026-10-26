import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfile";
import StatCard from "@/components/StatCard";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
    Calendar,
    Banknote,
    Clock,
    Briefcase,
    CheckCircle2,
    History
} from "lucide-react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import AttendanceHistoryDialog from "@/components/AttendanceHistoryDialog";
import { useAttendance, useMarkAttendance } from "@/hooks/useAttendance";
import { handoverApi } from "@/services/api/handover";
import { useQuery } from "@tanstack/react-query";
import ActivityLogSection from "@/components/ActivityLogSection";
import { useMyPermissions } from "@/hooks/useSettings";
import { FolderKanban, FileText, Users, CreditCard } from "lucide-react";

const EmployeeDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { data: profile, isLoading: profileLoading } = useProfile();
    const { data: attendance = [], isLoading: attendanceLoading } = useAttendance();
    const markAttendance = useMarkAttendance();
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    // Fetch handovers for this specific employee
    const { data: handovers = [], isLoading: handoversLoading } = useQuery({
        queryKey: ['handovers', 'my'],
        queryFn: () => handoverApi.getAll(),
    });

    const { data: permData } = useMyPermissions();
    const permissions = permData?.permissions;

    const activeHandoversCount = handovers.filter((h: any) => h.status === 'pending').length;

    const today = new Date().toISOString().split('T')[0];
    const isMarkedToday = attendance.some((record: any) => record.date?.split('T')[0] === today);

    const handleMarkAttendance = async () => {
        try {
            await markAttendance.mutateAsync({
                date: new Date().toISOString(),
                status: 'present',
                timeIn: new Date().toISOString()
            });
        } catch (error) {
            // Error managed by hook
        }
    };

    const presentDays = attendance.filter((r: any) => r.status === 'present').length;

    const isLoading = profileLoading || attendanceLoading || handoversLoading;

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <Skeleton className="h-20 w-full rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[...Array(4)].map((_, i) => (
                        <Skeleton key={i} className="h-32 rounded-2xl" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="lg:col-span-2 h-96 rounded-[2.5rem]" />
                    <Skeleton className="h-96 rounded-[2.5rem]" />
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title={`Welcome back, ${profile?.name || user?.name || 'Employee'}`}
                subtitle="Here's what's happening with your work today."
            />

            <div className="p-6 space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Monthly Salary"
                        value={`₹${profile?.salary?.toLocaleString('en-IN') || '0'}`}
                        change="Base pay"
                        changeType="neutral"
                        icon={Banknote}
                        actions={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-[10px] font-bold uppercase tracking-wider h-7 hover:bg-success/5 hover:text-success border border-success/10"
                                onClick={() => navigate("/salaries")}
                            >
                                <History className="w-3 h-3 mr-1.5" />
                                View History
                            </Button>
                        }
                    />
                    <StatCard
                        title="Attendance"
                        value={`${presentDays} Days`}
                        change="This current month"
                        changeType="positive"
                        icon={Calendar}
                        iconColor="bg-success/10 border border-success/20 text-success"
                        actions={
                            <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-[10px] font-bold uppercase tracking-wider h-7 hover:bg-success/5 hover:text-success border border-success/10"
                                onClick={() => setIsHistoryOpen(true)}
                            >
                                <History className="w-3 h-3 mr-1.5" />
                                View History
                            </Button>
                        }
                    />
                    <StatCard
                        title="Active Handovers"
                        value={activeHandoversCount.toString()}
                        change="Pending action"
                        changeType={activeHandoversCount > 0 ? "negative" : "neutral"}
                        icon={Briefcase}
                    />
                    <StatCard
                        title="Today's Status"
                        value={isMarkedToday ? "Present" : "Not Marked"}
                        change={isMarkedToday ? "Check-in complete" : "Action required"}
                        changeType={isMarkedToday ? "positive" : "negative"}
                        icon={CheckCircle2}
                        iconColor={isMarkedToday ? "bg-success/10 border border-success/20 text-success" : "bg-destructive/10 border border-destructive/20 text-destructive"}
                    />
                </div>

                {/* Workspace Modules Enabled by Admin */}
                {((permissions?.projects) || (permissions?.clients) || (permissions?.leads) || (permissions?.invoices) || (permissions?.quotations) || (permissions?.agreements) || (permissions?.expenses)) && (
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                <FolderKanban className="w-4 h-4 text-primary" /> Workspace Access
                            </h3>
                            <span className="text-xs text-muted-foreground">Enabled by Administrator</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                            {permissions?.projects && (
                                <button onClick={() => navigate("/projects")} className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center text-center gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FolderKanban className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Projects</span>
                                </button>
                            )}
                            {permissions?.invoices && (
                                <button onClick={() => navigate("/invoices")} className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center text-center gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Invoices</span>
                                </button>
                            )}
                            {permissions?.clients && (
                                <button onClick={() => navigate("/clients")} className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center text-center gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Clients</span>
                                </button>
                            )}
                            {permissions?.leads && (
                                <button onClick={() => navigate("/leads")} className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center text-center gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Users className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Leads</span>
                                </button>
                            )}
                            {permissions?.quotations && (
                                <button onClick={() => navigate("/quotations")} className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center text-center gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Quotations</span>
                                </button>
                            )}
                            {permissions?.agreements && (
                                <button onClick={() => navigate("/agreements")} className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center text-center gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Agreements</span>
                                </button>
                            )}
                            {permissions?.expenses && (
                                <button onClick={() => navigate("/expenses")} className="p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all flex flex-col items-center text-center gap-2 group">
                                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-bold text-foreground">Expenses</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Dashboard grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Attendance Action */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="glass-card p-8 rounded-[3rem] border border-border/50 relative overflow-hidden group"
                    >
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

                        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                            <div className="w-20 h-20 rounded-[2.5rem] bg-primary/10 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform duration-500">
                                <Clock className="w-10 h-10 text-primary" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-black tracking-tight text-foreground">Mark Attendance</h3>
                                <p className="text-muted-foreground text-sm max-w-[200px] font-medium leading-relaxed">
                                    {isMarkedToday
                                        ? "You've already marked your attendance for today."
                                        : "Don't forget to mark your check-in for today's shift."}
                                </p>
                            </div>
                            <Button
                                size="lg"
                                className="w-full h-14 rounded-2xl font-bold text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98] transition-all"
                                onClick={handleMarkAttendance}
                                disabled={isMarkedToday || markAttendance.isPending}
                            >
                                {isMarkedToday ? "Already Marked" : markAttendance.isPending ? "Marking..." : "Mark Present Now"}
                            </Button>
                        </div>
                    </motion.div>

                    {/* Quick Info Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 glass-card p-8 rounded-[3rem] border border-border/50"
                    >
                        <h3 className="text-xl font-black tracking-tight text-foreground mb-6">Employee Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Full Name</p>
                                    <p className="text-lg font-black text-foreground">{profile?.name}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Email Address</p>
                                    <p className="font-bold text-foreground">{profile?.email}</p>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Designation</p>
                                    <p className="font-bold text-foreground capitalize">{profile?.role}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Department</p>
                                    <p className="font-bold text-foreground">{profile?.department || 'Operations'}</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Activity Logging Section */}
                <div className="pt-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Today's Activity Log</h2>
                            <p className="text-muted-foreground text-sm font-medium italic">What have you done today? Log it here.</p>
                        </div>
                    </div>
                    <ActivityLogSection />
                </div>
            </div>

            <AttendanceHistoryDialog
                isOpen={isHistoryOpen}
                onOpenChange={setIsHistoryOpen}
                isPersonal={true}
            />
        </div>
    );
};

export default EmployeeDashboard;
