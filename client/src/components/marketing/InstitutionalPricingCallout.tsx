import { Button } from "@/components/ui/button";
import { GraduationCap, Instagram, Mail } from "lucide-react";
import { cn } from "@/lib/utils";
import { useHostSpecialty } from "@/hooks/useSpecialty";

type InstitutionalPricingCalloutProps = {
  className?: string;
};

export function InstitutionalPricingCallout({ className }: InstitutionalPricingCalloutProps) {
  const specialty = useHostSpecialty();
  const contactEmail = specialty.contactEmail;
  const programLabel =
    specialty.id === "ortho"
      ? "orthopaedic surgery residency and fellowship programs"
      : "plastic and reconstructive surgery residency and fellowship programs";

  return (
    <section
      aria-labelledby="institutional-pricing-heading"
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-sm",
        className,
      )}
    >
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground"
          aria-hidden
        >
          <GraduationCap className="h-7 w-7" />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Residency & fellowship programs
            </p>
            <h2
              id="institutional-pricing-heading"
              className="text-balance text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
            >
              Institutional Pricing? No Problem!
            </h2>
          </div>
          <p className="text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            We partner with {programLabel} across the country and internationally to offer bulk
            pricing for full access to the {specialty.brandName} platform. Send us an email at{" "}
            <a
              href={`mailto:${contactEmail}`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {contactEmail}
            </a>
            , or reach out to us on Instagram and we will get back to you within 24 hours on how to
            provide access to all of your residents and fellows.
          </p>
          <div className="flex flex-wrap gap-2 pt-1">
            <Button size="lg" asChild>
              <a href={`mailto:${contactEmail}?subject=Institutional%20pricing%20inquiry`}>
                <Mail className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                Email Us
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border bg-card"
              asChild
            >
              <a href={specialty.instagramUrl} target="_blank" rel="noopener noreferrer">
                <Instagram className="mr-2 h-4 w-4 shrink-0" aria-hidden />
                Message Us
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
