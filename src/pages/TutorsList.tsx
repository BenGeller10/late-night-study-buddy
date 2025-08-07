
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import TutorListItem from "@/components/discovery/TutorListItem";
import PageTransition from "@/components/layout/PageTransition";
import { useTutors } from "@/hooks/useTutors";

const TutorsList = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const className = searchParams.get('class') || '';
  
  // Use the real tutors hook with class search
  const { tutors: allTutors, loading, error } = useTutors();
  
  // Filter tutors for the specific class
  const tutorsForClass = allTutors.filter(tutor => 
    tutor.classes.includes(className)
  );

  const handleChat = (tutorId: string) => {
    console.log('Starting chat with tutor:', tutorId);
    navigate(`/chat/${tutorId}`);
  };

  const handleBook = (tutorId: string) => {
    console.log('Booking session with tutor:', tutorId);
  };

  const handleBackToDiscover = () => {
    navigate('/discover');
  };

  if (loading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background pb-20">
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
            <div className="p-4">
              <div className="flex items-center gap-3 mb-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBackToDiscover}
                  className="btn-smooth"
                >
                  <ArrowLeft className="h-5 w-5" />
                </Button>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    {className} Tutors
                  </h1>
                  <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background pb-20">
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <p className="text-red-500">Error loading tutors: {error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background pb-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/20">
          <div className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBackToDiscover}
                className="btn-smooth"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  {className} Tutors
                </h1>
                <p className="text-sm text-muted-foreground">
                  {tutorsForClass.length} tutor{tutorsForClass.length !== 1 ? 's' : ''} available
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {tutorsForClass.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center p-6">
              <div className="space-y-4">
                <span className="text-6xl">🔍</span>
                <h3 className="text-xl font-semibold">No tutors found</h3>
                <p className="text-muted-foreground">
                  We couldn't find any tutors for {className}. Try checking back later or encourage someone to become a tutor!
                </p>
                <Button onClick={handleBackToDiscover} className="mt-4">
                  Back to Discover
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Stats */}
              <div className="text-center p-4 bg-muted/20 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  Found <span className="font-semibold text-primary">{tutorsForClass.length}</span> tutor{tutorsForClass.length !== 1 ? 's' : ''} for <span className="font-semibold">{className}</span>
                </p>
              </div>

              {/* Tutors List */}
              <div className="space-y-3">
                {tutorsForClass.map((tutor) => (
                  <TutorListItem
                    key={tutor.id}
                    tutor={tutor}
                    onChat={() => handleChat(tutor.id)}
                    onBook={() => handleBook(tutor.id)}
                    className="animate-fade-in-up"
                  />
                ))}
              </div>

              {/* Back Button */}
              <div className="text-center pt-6">
                <Button 
                  variant="outline" 
                  onClick={handleBackToDiscover}
                  className="btn-smooth"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Discover
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default TutorsList;
