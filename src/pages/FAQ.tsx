import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ArrowLeft, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FAQ = () => {
  const navigate = useNavigate();

  const faqData = [
    {
      question: "How do I book a tutoring session?",
      answer: "Simply browse tutors in the Discover section, find one that matches your needs, and click 'Book Session'. You can choose between direct booking with payment or using the calendar widget for scheduling."
    },
    {
      question: "How much does tutoring cost?",
      answer: "Tutors set their own rates between $30-60 per hour. The platform adds an 8% service fee to the total. All payments are processed securely through Stripe."
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept all major credit and debit cards through our secure Stripe payment system. Payments are processed immediately when you book a session."
    },
    {
      question: "Can I cancel or reschedule a session?",
      answer: "Yes! You can cancel sessions up to 24 hours in advance for a full refund. For cancellations within 24 hours, please contact support as fees may apply."
    },
    {
      question: "How do I become a tutor?",
      answer: "Switch to tutor mode in your profile, add your subjects and hourly rates, set your availability, and complete your profile. Students will then be able to find and book sessions with you."
    },
    {
      question: "Are tutoring sessions online or in-person?",
      answer: "Both! Tutors can offer online sessions via Zoom or meet in-person on campus. Check each tutor's preferences when booking."
    },
    {
      question: "How do I message a tutor before booking?",
      answer: "Click 'Start Chat' on any tutor's profile to send them a message. This is great for asking questions about their teaching style or availability."
    },
    {
      question: "What subjects are available?",
      answer: "We cover all major college subjects including Math, Science, English, Business, Computer Science, and more. Use the search function to find tutors for specific courses."
    },
    {
      question: "How do I update my profile?",
      answer: "Go to your Profile page and click the settings icon. You can update your photo, bio, major, graduation year, and other information."
    },
    {
      question: "Is my personal information secure?",
      answer: "Absolutely! We take privacy seriously and use industry-standard encryption. Payment information is handled securely by Stripe and never stored on our servers."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team through the Support page in the app, or email us directly at support@campusconnect.com. We typically respond within 24 hours."
    },
    {
      question: "Can I get a refund?",
      answer: "Refunds are available for sessions cancelled at least 24 hours in advance. For other situations, please contact support and we'll review your case individually."
    }
  ];

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
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold">
              Frequently Asked Questions
            </CardTitle>
            <p className="text-muted-foreground">
              Find answers to common questions about Campus Connect
            </p>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              {faqData.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <div className="mt-8 p-6 bg-muted/20 rounded-lg text-center">
              <h3 className="font-semibold mb-2">Still have questions?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Can't find what you're looking for? Our support team is here to help!
              </p>
              <Button onClick={() => navigate('/support')}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FAQ;