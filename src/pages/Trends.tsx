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
          <h1 className="text-2xl font-bold bg-gradient-hero bg-clip-text text-transparent">
            What's buzzing on campus? 🔥
          </h1>
          <p className="text-sm text-muted-foreground">
            See what everyone's talking about & crushing in their studies
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
        <div className="glass-card-glow p-8 rounded-2xl text-center space-y-4">
          <div className="text-5xl animate-float">📊</div>
          <h3 className="text-xl font-semibold bg-gradient-hero bg-clip-text text-transparent">
            We're cooking up something special! 👨‍🍳
          </h3>
          <p className="text-muted-foreground">
            Campus activity feeds, study group vibes, grade analytics, and way more insights coming your way soon ✨
          </p>
        </div>
      </div>
      </div>
    </PageTransition>
  );
};

export default Trends;