import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import CampusFeed from "@/components/social/CampusFeed";
import PageTransition from "@/components/layout/PageTransition";
import { supabase } from "@/integrations/supabase/client";

const CampusFeedPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="p-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="hover:bg-muted/50"
              >
                <ArrowLeft className="h-6 w-6" />
              </Button>
              
              <div className="flex-1 text-center">
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent flex items-center justify-center gap-2">
                  <Users className="w-6 h-6" />
                  Campus Feed
                </h1>
                <p className="text-sm text-muted-foreground">
                  What's happening on campus
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Feed Content */}
        <div className="p-4">
          <CampusFeed userId={user.id} />
        </div>
      </div>
    </PageTransition>
  );
};

export default CampusFeedPage;