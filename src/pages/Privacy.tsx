import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
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
              Privacy Policy
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us, such as when you create an account, book sessions, or communicate with other users.
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>Account information (name, email, profile details)</li>
                <li>Academic information (major, graduation year, subjects)</li>
                <li>Communication data (messages, session notes)</li>
                <li>Payment information (processed securely by Stripe)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
              <p>We use the information we collect to:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Provide and improve our tutoring platform</li>
                <li>Match students with appropriate tutors</li>
                <li>Process payments and send confirmations</li>
                <li>Communicate about sessions and platform updates</li>
                <li>Ensure platform safety and prevent misuse</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
              <p>
                We do not sell your personal information. We may share information in limited circumstances:
              </p>
              <ul className="list-disc ml-6 mt-2">
                <li>With tutors/students for session coordination</li>
                <li>With service providers (Stripe for payments)</li>
                <li>When required by law or to protect platform integrity</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
              <p>
                We implement appropriate security measures to protect your information, including encryption, secure servers, and regular security audits.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
              <p>You have the right to:</p>
              <ul className="list-disc ml-6 mt-2">
                <li>Access and update your personal information</li>
                <li>Delete your account and associated data</li>
                <li>Control communication preferences</li>
                <li>Request data portability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
              <p>
                We use cookies and similar technologies to improve your experience, remember preferences, and analyze platform usage.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">7. Student Privacy (FERPA Compliance)</h2>
              <p>
                We are committed to protecting student educational records in accordance with FERPA guidelines and maintain strict confidentiality.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">8. Changes to Privacy Policy</h2>
              <p>
                We may update this privacy policy from time to time. We will notify users of significant changes via email or platform notifications.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
              <p>
                If you have questions about this privacy policy or our data practices, please contact us at:
              </p>
              <p className="mt-2">
                Email: privacy@campusconnect.com<br />
                Address: [Your business address]<br />
                Phone: [Your contact number]
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Privacy;