import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CampusConnectApp from "@/components/CampusConnectApp";
import BottomNavigation from "@/components/layout/BottomNavigation";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = localStorage.getItem('campus-connect-onboarded');
    
    if (hasCompletedOnboarding === 'true') {
      // Redirect to discover page if onboarding is complete
      navigate('/discover');
    }
  }, [navigate]);

  return (
    <div>
      <CampusConnectApp />
      <BottomNavigation />
    </div>
  );
};

export default Index;
