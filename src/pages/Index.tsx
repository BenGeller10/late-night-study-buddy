import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CampusConnectApp from "@/components/CampusConnectApp";

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

  return <CampusConnectApp />;
};

export default Index;
