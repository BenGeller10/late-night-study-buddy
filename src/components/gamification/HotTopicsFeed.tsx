import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Flame, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface HotTopic {
  subject: string;
  searches: number;
  trend: 'up' | 'down' | 'stable';
  emoji?: string;
}

const HotTopicsFeed = () => {
  const [hotTopics, setHotTopics] = useState<HotTopic[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotTopics();
  }, []);

  const fetchHotTopics = async () => {
    try {
      // Use mock data for now since tables may not exist yet
      setHotTopics([
        { subject: "ECON 203", searches: 47, trend: 'up', emoji: "📈" },
        { subject: "CALC 251", searches: 32, trend: 'up', emoji: "🧮" },
        { subject: "CHEM 101", searches: 28, trend: 'stable', emoji: "⚗️" },
        { subject: "PHYS 201", searches: 23, trend: 'down', emoji: "🔬" },
        { subject: "HIST 150", searches: 19, trend: 'up', emoji: "🏛️" }
      ]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSubjectEmoji = (subject: string) => {
    const lower = subject.toLowerCase();
    if (lower.includes('econ')) return '📈';
    if (lower.includes('calc') || lower.includes('math')) return '🧮';
    if (lower.includes('chem')) return '⚗️';
    if (lower.includes('phys')) return '🔬';
    if (lower.includes('hist')) return '🏛️';
    if (lower.includes('eng')) return '📝';
    if (lower.includes('bio')) return '🧬';
    if (lower.includes('cs') || lower.includes('comp')) return '💻';
    if (lower.includes('psyc')) return '🧠';
    return '📚';
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-success" />;
      case 'down': return <TrendingUp className="w-3 h-3 text-muted-foreground rotate-180" />;
      default: return <div className="w-3 h-3 rounded-full bg-muted-foreground/50" />;
    }
  };

  if (loading) {
    return (
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Hot Topics This Week
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-500" />
          Hot Topics This Week
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {hotTopics.map((topic, index) => (
            <div 
              key={topic.subject}
              className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors group cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary text-sm font-bold">
                  {index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">{topic.emoji}</span>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {topic.subject}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {topic.searches} searches
                </Badge>
                {getTrendIcon(topic.trend)}
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-3 border-t border-border/50">
          <p className="text-xs text-muted-foreground text-center flex items-center justify-center gap-1">
            <BookOpen className="w-3 h-3" />
            These subjects are trending on your campus
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default HotTopicsFeed;