import HotTopicsFeed from "@/components/gamification/HotTopicsFeed";
import WeeklyLeaderboard from "@/components/gamification/WeeklyLeaderboard";
import StudyStreak from "@/components/gamification/StudyStreak";
import PageTransition from "@/components/layout/PageTransition";

const Trends = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20"> {/* Added bottom padding for navigation */}
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
        <div className="p-4">
          <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Campus Trends 🔥
          </h1>
          <p className="text-sm text-muted-foreground">
            See what's hot on your campus
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6">
        {/* User's Personal Stats */}
        <StudyStreak userId="mock-user-id" compact />
        
        {/* Campus Trends Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <HotTopicsFeed />
          <WeeklyLeaderboard />
        </div>

        {/* Coming Soon Section */}
        <div className="glass-card p-6 rounded-2xl text-center space-y-3">
          <span className="text-4xl">📊</span>
          <h3 className="text-lg font-semibold">More Trends Coming Soon!</h3>
          <p className="text-muted-foreground text-sm">
            Campus activity feed, study group trends, and more insights
          </p>
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default Trends;