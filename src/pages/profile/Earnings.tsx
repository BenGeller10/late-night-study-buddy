import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Calendar, TrendingUp, Clock, User, CreditCard, ArrowUpRight, AlertCircle, CheckCircle } from "lucide-react";

interface Earning {
  id: string;
  session_id: string;
  amount: number;
  date: string;
  student_name: string;
  subject: string;
  status: 'completed' | 'pending' | 'paid';
}

interface Payout {
  id: string;
  amount: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requested_at: string;
  processed_at?: string;
}

interface ConnectStatus {
  has_account: boolean;
  onboarding_completed: boolean;
  payouts_enabled: boolean;
}

interface EarningsProps {
  user: any;
  onBack: () => void;
}

const Earnings = ({ user, onBack }: EarningsProps) => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [connectStatus, setConnectStatus] = useState<ConnectStatus>({
    has_account: false,
    onboarding_completed: false,
    payouts_enabled: false,
  });
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutLoading, setPayoutLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user?.id) {
      fetchEarnings();
      fetchPayouts();
      checkConnectStatus();
    }
  }, [user]);

  const fetchEarnings = async () => {
    if (!user?.id) return;

    try {
      // Fetch real earnings from sessions table
      const { data: sessions, error } = await supabase
        .from('sessions')
        .select(`
          id,
          total_amount,
          created_at,
          payment_status,
          status,
          profiles!sessions_student_id_fkey(display_name),
          subjects(name)
        `)
        .eq('tutor_id', user.id)
        .in('payment_status', ['paid', 'pending'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      const earningsData: Earning[] = (sessions || []).map(session => ({
        id: session.id,
        session_id: session.id,
        amount: session.total_amount || 0,
        date: session.created_at.split('T')[0],
        student_name: session.profiles?.display_name || 'Unknown Student',
        subject: session.subjects?.name || 'Unknown Subject',
        status: session.payment_status === 'paid' ? 'paid' : (session.status === 'completed' ? 'completed' : 'pending')
      }));

      setEarnings(earningsData);
      
      const total = earningsData
        .filter(e => e.status === 'paid')
        .reduce((sum, e) => sum + e.amount, 0);
      
      const thisMonth = earningsData
        .filter(e => e.status === 'paid' && new Date(e.date).getMonth() === new Date().getMonth())
        .reduce((sum, e) => sum + e.amount, 0);

      setTotalEarnings(total);
      setThisMonthEarnings(thisMonth);
      
      // Calculate available balance after payouts
      const totalPayouts = payouts.reduce((sum, payout) => 
        payout.status === 'completed' || payout.status === 'processing' ? sum + payout.amount : sum, 0);
      setAvailableBalance(total - totalPayouts);
    } catch (error: any) {
      console.error('Error fetching earnings:', error);
      toast({
        title: "Error loading earnings",
        description: "Failed to load your earnings data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayouts = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('payouts')
        .select('*')
        .eq('tutor_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      
      // Map and type cast the payouts data
      const payoutsData: Payout[] = (data || []).map(payout => ({
        id: payout.id,
        amount: payout.amount,
        status: payout.status as 'pending' | 'processing' | 'completed' | 'failed',
        requested_at: payout.requested_at,
        processed_at: payout.processed_at,
      }));
      
      setPayouts(payoutsData);
    } catch (error) {
      console.error('Error fetching payouts:', error);
    }
  };

  const checkConnectStatus = async () => {
    if (!user?.id) return;

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('check-connect-status', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) throw error;
      setConnectStatus(data);
    } catch (error) {
      console.error('Error checking connect status:', error);
    }
  };

  const handleSetupAccount = async () => {
    try {
      setPayoutLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('create-connect-account', {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      // Open Stripe Connect onboarding in new tab
      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: "Opening Stripe setup",
          description: "Complete your account setup to start receiving payouts.",
        });
      }
    } catch (error: any) {
      // Check for Connect not enabled error
      if (error.message?.includes('signed up for Connect')) {
        toast({
          title: "Stripe Connect Required",
          description: "Please enable Stripe Connect in your Stripe dashboard first. Visit stripe.com/docs/connect for setup instructions.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Setup failed",
          description: error.message,
          variant: "destructive",
        });
      }
    } finally {
      setPayoutLoading(false);
    }
  };

  const handleRequestPayout = async () => {
    const amount = parseFloat(payoutAmount);
    if (!amount || amount < 10) {
      toast({
        title: "Invalid amount",
        description: "Minimum payout amount is $10.",
        variant: "destructive",
      });
      return;
    }

    try {
      setPayoutLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke('request-payout', {
        body: { amount },
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
        },
      });
      
      if (error) throw error;
      
      toast({
        title: "Payout requested!",
        description: `$${amount} payout is being processed.`,
      });
      
      setPayoutAmount('');
      fetchPayouts();
      fetchEarnings(); // Refresh to update available balance
    } catch (error: any) {
      toast({
        title: "Payout failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setPayoutLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-purple-100 text-purple-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="animate-fade-in p-6">
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in h-screen flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20 p-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            ← Back
          </Button>
          <div>
            <h1 className="text-xl font-bold">Earnings</h1>
            <p className="text-sm text-muted-foreground">
              Track your tutoring income and payments
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-20">
        {/* Earnings Overview */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="glass-card border-green-200 dark:border-green-800">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-green-600">
                ${totalEarnings}
              </div>
              <div className="text-sm text-muted-foreground">
                Total Earnings
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-purple-200 dark:border-purple-800">
            <CardContent className="p-6 text-center">
              <ArrowUpRight className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-purple-600">
                ${availableBalance.toFixed(2)}
              </div>
              <div className="text-sm text-muted-foreground">
                Available to Withdraw
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-primary">
                {earnings.filter(e => e.status === 'paid').length}
              </div>
              <div className="text-xs text-muted-foreground">Paid Sessions</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-yellow-500">
                {earnings.filter(e => e.status === 'pending').length}
              </div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </CardContent>
          </Card>
          <Card className="text-center">
            <CardContent className="p-4">
              <div className="text-lg font-bold text-accent">
                ${Math.round(totalEarnings / Math.max(earnings.filter(e => e.status === 'paid').length, 1))}
              </div>
              <div className="text-xs text-muted-foreground">Avg/Session</div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Setup & Request */}
        <Card className="glass-card border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <CreditCard className="w-5 h-5" />
              Withdraw Earnings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!connectStatus.has_account ? (
              <div className="text-center py-4">
                <AlertCircle className="w-12 h-12 text-blue-500 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Set up payouts</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect your bank account to receive your earnings via direct deposit.
                </p>
                <Button 
                  onClick={handleSetupAccount}
                  disabled={payoutLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {payoutLoading ? 'Setting up...' : 'Set up payouts'}
                </Button>
              </div>
            ) : !connectStatus.onboarding_completed ? (
              <div className="text-center py-4">
                <Clock className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Complete account setup</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Finish setting up your account to start receiving payouts.
                </p>
                <Button 
                  onClick={handleSetupAccount}
                  disabled={payoutLoading}
                  variant="outline"
                >
                  {payoutLoading ? 'Opening...' : 'Complete setup'}
                </Button>
              </div>
            ) : connectStatus.payouts_enabled && availableBalance >= 10 ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Ready to receive payouts</span>
                </div>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Amount to withdraw"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    min="10"
                    max={availableBalance}
                    step="0.01"
                  />
                  <Button 
                    onClick={handleRequestPayout}
                    disabled={payoutLoading || !payoutAmount || parseFloat(payoutAmount) < 10}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {payoutLoading ? 'Processing...' : 'Withdraw'}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum withdrawal: $10 • Available: ${availableBalance.toFixed(2)}
                </p>
              </div>
            ) : (
              <div className="text-center py-4">
                <DollarSign className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="font-medium mb-2">Insufficient balance</h3>
                <p className="text-sm text-muted-foreground">
                  You need at least $10 to request a payout.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="glass-card border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Clock className="w-5 h-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Payouts are processed securely through Stripe within 1-2 business days</p>
              <p>• Students pay with credit/debit cards during booking</p>
              <p>• Platform takes 8% commission, you receive 92% of session fee</p>
              <p>• Direct deposits go straight to your connected bank account</p>
            </div>
          </CardContent>
        </Card>

        {/* Payout History */}
        {payouts.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Payout History</h2>
            {payouts.map(payout => (
              <Card key={payout.id} className="glass-card hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <ArrowUpRight className="w-5 h-5 text-purple-600" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-medium">Payout Request</div>
                        <div className="text-sm text-muted-foreground">
                          Requested {formatDate(payout.requested_at)}
                        </div>
                        {payout.processed_at && (
                          <div className="text-xs text-muted-foreground">
                            Processed {formatDate(payout.processed_at)}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-lg font-bold text-purple-600">
                        ${payout.amount.toFixed(2)}
                      </div>
                      <Badge className={getStatusColor(payout.status)}>
                        {payout.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Recent Earnings */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Recent Earnings</h2>
          
          {earnings.length === 0 ? (
            <Card className="text-center p-8">
              <DollarSign className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
              <h3 className="font-medium mb-2">No earnings yet</h3>
              <p className="text-sm text-muted-foreground">
                Complete your first tutoring session to start earning!
              </p>
            </Card>
          ) : (
            earnings.map(earning => (
              <Card key={earning.id} className="glass-card hover-scale">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="font-medium">{earning.student_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {earning.subject}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(earning.date)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right space-y-2">
                      <div className="text-lg font-bold text-green-600">
                        ${earning.amount}
                      </div>
                      <Badge className={getStatusColor(earning.status)}>
                        {earning.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Export/Download Options */}
        <Card>
          <CardHeader>
            <CardTitle>Export Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Download your earnings report for tax purposes or personal records.
            </p>
            <div className="flex gap-2">
              <Button variant="outline">Download CSV</Button>
              <Button variant="outline">Download PDF</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Earnings;