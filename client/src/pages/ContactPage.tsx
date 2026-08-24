import { useState } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { usePageSeo } from "@/lib/usePageSeo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Clock, KeyRound, CreditCard, BookOpenCheck, LifeBuoy } from "lucide-react";
import { Link } from "wouter";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "sonner";

export default function ContactPage() {
  usePageSeo("/contact");
  const { contactEmail: CONTACT_EMAIL, brandName } = useHostSpecialty();
  const mailtoHref = `mailto:${CONTACT_EMAIL}?subject=Atlas%20Review%20inquiry`;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiRequest("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, subject, message }),
      });
      toast.success("Message sent. We will get back to you soon.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to send message.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <div className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <header className="mb-10 space-y-5 text-center sm:text-left">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">
              We Are Here To Help
            </p>
            <h1 className="text-4xl font-bold leading-snug tracking-tight gradient-text sm:text-5xl">
              Contact
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-muted-foreground sm:mx-0">
              Whether you are onboarding your first study block or troubleshooting access, start
              with the tips below, then reach out if you still need us. We read every message and
              route it to the right person on our small team.
            </p>
          </header>

          <Card className="mb-8 border-primary/25 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-xl">Send Message</CardTitle>
              <CardDescription>
                This reaches our support inbox and you will receive a response within two business days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="grid gap-2">
                    <label htmlFor="contact-name" className="text-sm font-medium">
                      Name
                    </label>
                    <Input
                      id="contact-name"
                      name="name"
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="contact-email" className="text-sm font-medium">
                      Email
                    </label>
                    <Input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="contact-subject" className="text-sm font-medium">
                    Subject
                  </label>
                  <Input
                    id="contact-subject"
                    name="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Account, billing, content, partnerships…"
                    disabled={isSubmitting}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="contact-message" className="text-sm font-medium">
                    Message
                  </label>
                  <Textarea
                    id="contact-message"
                    name="message"
                    rows={6}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={isSubmitting}
                    className="resize-y"
                  />
                </div>
                <Button type="submit" size="lg" disabled={isSubmitting} className="sm:self-start">
                  {isSubmitting ? "Sending…" : "Send Message"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="mb-10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <Mail className="h-6 w-6 text-primary" aria-hidden />
                Email Us Directly
              </CardTitle>
              <CardDescription>
                Prefer your own mail app? You can still write us at the address below.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <a
                href={mailtoHref}
                className="break-all text-lg font-semibold text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              <Button asChild size="lg" variant="outline" className="shrink-0">
                <a href={mailtoHref}>Open In Email App</a>
              </Button>
            </CardContent>
          </Card>

          <section className="mb-6" aria-labelledby="tips-heading">
            <h2 id="tips-heading" className="mb-6 flex items-center gap-2 text-2xl font-semibold">
              <LifeBuoy className="h-7 w-7 text-primary" aria-hidden />
              Helpful Tips Before You Write
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <KeyRound className="h-5 w-5 text-secondary" aria-hidden />
                    Account & Sign-In
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  Try a password reset from the login page if you cannot sign in. Use the same email
                  you registered with, and check spam for messages from our auth provider. If you
                  changed institutions, mention your old and new email so we can find your account.
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CreditCard className="h-5 w-5 text-secondary" aria-hidden />
                    Billing & Access
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  Include the email on the subscription and any charge date or receipt text. If
                  access looks wrong after payment, say whether you are on web or mobile and what
                  you see on the home screen. We resolve most billing mismatches quickly with that
                  context. For current list prices and plan lengths, see our{" "}
                  <Link href="/pricing" className="font-medium text-primary hover:underline">
                    Pricing
                  </Link>{" "}
                  page.
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <BookOpenCheck className="h-5 w-5 text-secondary" aria-hidden />
                    Study Workflow
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  Tell us your goal (in-service, boards, or maintenance of knowledge) and how many
                  weeks you have. We are happy to suggest how to mix the question bank, mock exams,
                  spaced repetition, and oral practice in{" "}
                  <Link href="/the-atlas-way" className="font-medium text-primary hover:underline">
                    The Atlas Way
                  </Link>
                  .
                </CardContent>
              </Card>
              <Card variant="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="h-5 w-5 text-secondary" aria-hidden />
                    Response Times
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-sm leading-relaxed text-muted-foreground">
                  We typically reply within one to two business days, often faster. Peak board season
                  can add a little delay. For urgent access issues, put &quot;urgent access&quot; in the
                  subject line so we can triage.
                </CardContent>
              </Card>
            </div>
          </section>

          <p className="text-center text-sm text-muted-foreground sm:text-left">
            Learn more about our product philosophy on the{" "}
            <Link href="/about" className="font-medium text-primary hover:underline">
              About
            </Link>{" "}
            page.
          </p>
        </div>
      </main>
    </MarketingShell>
  );
}
