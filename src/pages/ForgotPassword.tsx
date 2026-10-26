import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState<'admin' | 'employee' | 'intern'>('admin');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const cleanEmail = email.trim();
        if (!cleanEmail) {
            toast.error('Please enter your registered email');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post(
                API_ENDPOINTS.AUTH_FORGOT_PASSWORD, 
                { email: cleanEmail, role },
                { timeout: 45000 } // Allow up to 45s for email delivery
            );
            toast.success(response.data.message || 'OTP sent to your email');
            const targetRole = response.data.role || role;
            // Navigate to OTP verification page and pass email/role in state
            navigate('/verify-otp', { state: { email: cleanEmail, role: targetRole } });
        } catch (error: any) {
            let errorMessage = 'Failed to send OTP';
            if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                errorMessage = 'Server is taking longer than usual to send email. Please check your inbox or try again.';
            } else if (!error.response) {
                errorMessage = 'Network error: Please verify your connection or ensure backend is running.';
            }
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--primary)_0%,_transparent_15%)] opacity-20 blur-3xl pointer-events-none" />

            <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl relative z-10 shadow-2xl">
                <CardHeader className="space-y-4 pb-8">
                    <div className="flex justify-center mb-2">
                        <img src="/webflora-logo.webp" alt="Webflora" className="h-16 object-contain" />
                    </div>
                    <CardTitle className="text-2xl text-center">Forgot Password</CardTitle>
                    <CardDescription className="text-center text-muted-foreground">
                        Enter your email to receive a 6-digit verification code
                    </CardDescription>

                    <div className="grid grid-cols-3 gap-2 mt-4">
                        {(['admin', 'employee', 'intern'] as const).map((r) => (
                            <Button
                                key={r}
                                variant={role === r ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => setRole(r)}
                                className="capitalize text-[11px] h-8 font-bold"
                                type="button"
                            >
                                {r}
                            </Button>
                        ))}
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder={`your.${role}@webflora.com`}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isLoading}
                                className="bg-background/50 border-white/10"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full premium-gradient font-bold" disabled={isLoading}>
                            {isLoading ? 'Sending OTP...' : 'Send OTP'}
                        </Button>
                        <Button
                            variant="ghost"
                            type="button"
                            className="w-full text-xs"
                            onClick={() => navigate('/login')}
                        >
                            Back to Login
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default ForgotPassword;
