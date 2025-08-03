import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MessageCircle, Calendar, Star, Clock, Award, Users } from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import BookingModal from "@/components/booking/BookingModal";
import BookingConfirmationModal from "@/components/booking/BookingConfirmationModal";
import BookingSuccessModal from "@/components/booking/BookingSuccessModal";

// Mock data - same as SwipeView for consistency
const mockTutors = [
  {
    id: "1",
    name: "Sarah Chen",
    profilePicture: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400&h=400&fit=crop&crop=face",
    classes: ["ECON 203", "ECON 101", "MATH 115"],
    tutorStyle: "I'll draw everything on a virtual whiteboard so it makes sense. I got you. 📝✨",
    hourlyRate: 25,
    isFree: false,
    rating: 4.9,
    totalSessions: 47,
    bio: "Hey! I'm Sarah, a junior studying Economics with a passion for helping fellow students understand complex concepts. I've been tutoring for 2 years and love breaking down difficult topics into simple, digestible pieces.",
    experience: "2 years",
    availability: ["Mon 2-6 PM", "Wed 3-7 PM", "Fri 1-5 PM"],
    specialties: ["Microeconomics", "Statistics", "Calculus"],
    achievements: ["Dean's List", "Economics Department Award", "Peer Tutor of the Month"]
  },
  {
    id: "2", 
    name: "Marcus Williams",
    profilePicture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face",
    classes: ["CS 101", "CS 150", "MATH 120"],
    tutorStyle: "Think of me as a Campus Connect tutor who already took the class. No pressure. 🤝",
    hourlyRate: 0,
    isFree: true,
    rating: 4.7,
    totalSessions: 23,
    bio: "Computer Science sophomore who loves coding and helping others get started with programming. I believe in learning through practice and making coding fun!",
    experience: "1 year",
    availability: ["Tue 4-8 PM", "Thu 2-6 PM", "Sat 10 AM-2 PM"],
    specialties: ["Python", "Java", "Data Structures"],
    achievements: ["Hackathon Winner", "CS Club President", "Open Source Contributor"]
  },
  {
    id: "3",
    name: "Emma Rodriguez", 
    profilePicture: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop&crop=face",
    classes: ["CHEM 201", "CHEM 101", "BIO 150"],
    tutorStyle: "Lab work can be confusing but I break it down step by step. We'll ace this together! 🧪💪",
    hourlyRate: 30,
    isFree: false,
    rating: 5.0,
    totalSessions: 31,
    bio: "Pre-med student with a strong background in chemistry and biology. I understand the challenges of science courses and I'm here to help you succeed!",
    experience: "3 years",
    availability: ["Mon 6-9 PM", "Wed 5-8 PM", "Sun 1-5 PM"],
    specialties: ["Organic Chemistry", "Biochemistry", "Lab Techniques"],
    achievements: ["Research Assistant", "Chemistry Tutor Award", "Pre-med Society VP"]
  },
  // Add more mock tutors with similar structure...
];

const TutorProfile = () => {
  const { tutorId } = useParams();
  const navigate = useNavigate();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<any>(null);
  
  const tutor = mockTutors.find(t => t.id === tutorId);

  if (!tutor) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center pb-20">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Tutor Not Found</h2>
            <Button onClick={() => navigate('/discover')}>
              Back to Discover
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const handleChat = () => {
    navigate(`/chat/${tutor.id}`);
  };

  const handleBook = () => {
    setShowBookingModal(true);
  };

  const handleBookingConfirm = (details: any) => {
    setBookingDetails(details);
    setShowBookingModal(false);
    setShowConfirmationModal(true);
  };

  const handlePaymentSuccess = () => {
    setShowConfirmationModal(false);
    setShowSuccessModal(true);
  };

  const handleStartChat = () => {
    setShowSuccessModal(false);
    navigate(`/chat/${tutor?.id}`);
  };

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
                className="btn-smooth"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-bold">Tutor Profile</h1>
            </div>
          </div>
        </div>

        <div className="p-4 max-w-2xl mx-auto space-y-6">
          {/* Profile Header */}
          <Card className="p-6">
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex-shrink-0">
                <img
                  src={tutor.profilePicture}
                  alt={tutor.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              </div>
              
              <div className="flex-1 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <h2 className="text-2xl font-bold">{tutor.name}</h2>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-primary/10 text-primary">
                      <Star className="w-3 h-3 mr-1" />
                      {tutor.rating} ({tutor.totalSessions} sessions)
                    </Badge>
                  </div>
                </div>
                
                <p className="text-muted-foreground">{tutor.bio}</p>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {tutor.experience} experience
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {tutor.totalSessions} students helped
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Pricing */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Pricing</h3>
            <div className="text-center p-4 bg-muted/20 rounded-xl">
              {tutor.isFree ? (
                <div>
                  <div className="text-2xl font-bold text-success">Free Tutoring! 🎉</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    This tutor offers free help to fellow students
                  </p>
                </div>
              ) : (
                <div>
                  <div className="text-3xl font-bold text-primary">${tutor.hourlyRate}/hr</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Flexible scheduling • Pay per session
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Classes & Subjects */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Classes I Can Help With</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.classes.map((className, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {className}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Specialties */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {tutor.specialties?.map((specialty, index) => (
                <Badge key={index} variant="secondary" className="text-sm">
                  {specialty}
                </Badge>
              ))}
            </div>
          </Card>

          {/* Teaching Style */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Teaching Style</h3>
            <p className="text-muted-foreground leading-relaxed">
              {tutor.tutorStyle}
            </p>
          </Card>

          {/* Availability */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Availability</h3>
            <div className="space-y-2">
              {tutor.availability?.map((time, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  {time}
                </div>
              ))}
            </div>
          </Card>

          {/* Achievements */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-3">Achievements</h3>
            <div className="space-y-2">
              {tutor.achievements?.map((achievement, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <Award className="w-4 h-4 text-primary" />
                  {achievement}
                </div>
              ))}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              size="lg"
              className="flex-1 btn-smooth"
              onClick={handleChat}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
            <Button
              variant="campus"
              size="lg"
              className="flex-1 btn-smooth"
              onClick={handleBook}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Book Session
            </Button>
          </div>

          {/* Booking Modals */}
          {tutor && (
            <>
              <BookingModal
                isOpen={showBookingModal}
                onClose={() => setShowBookingModal(false)}
                tutor={{
                  ...tutor,
                  venmoHandle: tutor.name.toLowerCase().replace(' ', '-')
                }}
                onConfirm={handleBookingConfirm}
              />

              <BookingConfirmationModal
                isOpen={showConfirmationModal}
                onClose={() => setShowConfirmationModal(false)}
                bookingDetails={bookingDetails}
                onSuccess={handlePaymentSuccess}
              />

              <BookingSuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                tutorName={tutor.name}
                onStartChat={handleStartChat}
              />
            </>
          )}
        </div>
      </div>
    </PageTransition>
  );
};

export default TutorProfile;