import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Terms = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/10">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">
              Terms of Service
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using this tutoring platform ("Service"), you accept and agree to be bound by the terms and provision of this agreement.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. Platform Description</h2>
              <p>
                Our platform connects students with qualified tutors for academic support. We facilitate bookings, payments, and communications between users.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
              <p>
                Users must provide accurate information when creating accounts. You are responsible for maintaining the confidentiality of your account credentials.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Payments and Fees</h2>
              <p>
                All payments are processed securely through Stripe. The platform charges an 8% service fee on all transactions. Tutors set their own hourly rates within our range of $30-60 per hour.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Cancellation Policy</h2>
              <p>
                Sessions may be cancelled up to 24 hours in advance for a full refund. Cancellations within 24 hours may be subject to fees.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. User Conduct</h2>
              <p>
                Users must behave respectfully and professionally. Harassment, inappropriate content, or misuse of the platform may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Privacy</h2>
              <p>
                We are committed to protecting your privacy. Please review our Privacy Policy to understand how we collect and use your information.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
              <p>
                The platform serves as an intermediary between students and tutors. We are not responsible for the quality of tutoring services or outcomes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Users will be notified of significant changes via email or platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
              <p>
                For questions about these terms, please contact us at legal@campusconnect.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Terms;