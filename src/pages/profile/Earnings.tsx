import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Calendar, TrendingUp, Clock, User } from "lucide-react";

interface Earning {
  id: string;
  session_id: string;
  amount: number;
  date: string;
  student_name: string;
  subject: string;
  status: 'completed' | 'pending' | 'paid';
}

interface EarningsProps {
  user: any;
  onBack: () => void;
}

const Earnings = ({ user, onBack }: EarningsProps) => {
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [thisMonthEarnings, setThisMonthEarnings] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    fetchEarnings();
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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

          <Card className="glass-card border-blue-200 dark:border-blue-800">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <div className="text-3xl font-bold text-blue-600">
                ${thisMonthEarnings}
              </div>
              <div className="text-sm text-muted-foreground">
                This Month
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

        {/* Payment Status Info */}
        <Card className="glass-card border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700 dark:text-yellow-300">
              <Clock className="w-5 h-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p>• Payments are processed securely through Stripe within 24-48 hours</p>
              <p>• Students pay with credit/debit cards during booking</p>
              <p>• Platform takes 8% commission, you receive 92% of session fee</p>
              <p>• Earnings are automatically transferred to your bank account</p>
            </div>
          </CardContent>
        </Card>

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