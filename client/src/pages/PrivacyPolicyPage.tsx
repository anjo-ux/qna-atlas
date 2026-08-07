import type { ReactNode } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { usePageSeo } from "@/lib/usePageSeo";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import { Link } from "wouter";

const SITE_NAME = "Atlas Review";
const SUPPORT_EMAIL = "support@prsatlas.com";
const mailto = (subject: string) =>
  `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}`;

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10 scroll-mt-28" id={id} aria-labelledby={`${id}-heading`}>
      <h2 id={`${id}-heading`} className="mb-4 flex items-center gap-2 text-2xl font-semibold text-foreground">
        {title}
      </h2>
      <div className="space-y-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  usePageSeo("/privacy");
  const { canonicalOrigin: SITE_URL, legalEntity: LEGAL_ENTITY } = useHostSpecialty();

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <article className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <header className="mb-10 space-y-3 border-b border-border/60 pb-8">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">{LEGAL_ENTITY}</p>
            <h1 className="text-4xl font-bold leading-snug tracking-tight gradient-text sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="text-sm text-muted-foreground">Updated on April 16, 2026</p>
            <p className="pt-2 text-base leading-relaxed text-muted-foreground">
              {LEGAL_ENTITY} respects the privacy of people who use our website (
              <a
                href={SITE_URL}
                className="font-medium text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE_URL}
              </a>
              ) and related {SITE_NAME} services (collectively, the &quot;Service&quot;). This privacy statement
              (&quot;Policy&quot;) describes our current information practices. If we change this Policy, we will post
              the updated version on this page and revise the date above. For rules governing use of the Service, see
              our{" "}
              <Link href="/terms" className="font-medium text-primary underline-offset-4 hover:underline">
                Terms
              </Link>
              .
            </p>
            <p className="text-base leading-relaxed text-muted-foreground">
              In this Policy, &quot;you&quot; and &quot;your&quot; refer to any person or entity that subscribes to or uses the
              Service (&quot;Users&quot;). Unless otherwise stated, &quot;{SITE_NAME},&quot; &quot;we,&quot; and &quot;our&quot; refer to{" "}
              {LEGAL_ENTITY}.
            </p>
          </header>

          <Section id="collect" title="Information We Collect">
            <p>
              We collect information when you visit our site, create an account, subscribe, study in the application,
              pay for access, or otherwise interact with the Service.
            </p>
            <p>Depending on your choices and use of the Service, the categories may include:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Identifiers</strong>, such as name, email address, online
                identifiers, IP address, or account identifiers.
              </li>
              <li>
                <strong className="text-foreground">Personal And Account Information</strong>, such as institutional
                affiliation or similar details you provide at registration, and payment-related information processed
                by our payment providers.
              </li>
              <li>
                <strong className="text-foreground">Professional Or Education-Related Information</strong> you
                choose to provide (for example, training program or institution).
              </li>
              <li>
                <strong className="text-foreground">Commercial Information</strong>, such as subscriptions purchased,
                renewal history, and promotional codes applied.
              </li>
              <li>
                <strong className="text-foreground">Internet Or Similar Network Activity</strong>, such as device and
                browser type, general log data, pages or features accessed, referring URLs, and timestamps.
              </li>
              <li>
                <strong className="text-foreground">Approximate Geolocation</strong> derived from IP address (for
                example, region or country), not precise GPS from the Service unless we clearly disclose otherwise.
              </li>
              <li>
                <strong className="text-foreground">Service Content And Study Data</strong> you generate in the
                product, such as question responses, notes, bookmarks, spaced-repetition state, mock exam attempts, and
                oral-board coach interactions where you use those features.
              </li>
              <li>
                <strong className="text-foreground">Inferences</strong> drawn from the above to operate, secure, and
                improve the Service (for example, product analytics aggregated across users or recommendations based on
                study patterns).
              </li>
            </ul>
            <p>
              We do not ask you to provide sensitive classification information (such as race, ethnicity, or health
              conditions) to use the core Service. If you voluntarily send us such information (for example in a
              support email), we treat it in accordance with this Policy and only use it for the purpose you contacted
              us about, unless law requires otherwise.
            </p>
          </Section>

          <Section id="sources" title="How Information Is Collected">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Information You Provide</h3>
            <p>
              When you register, subscribe, or contact us, we collect the information you enter into forms or send by
              email—such as name, email, password (stored using secure hashing), institutional affiliation where
              requested, and messages you send to support. Payment card details are collected and processed by our
              payment processors; we generally receive limited billing metadata (for example, last four digits,
              expiration, and transaction identifiers), not your full card number stored on our own servers.
            </p>
            <p>
              You may choose to submit additional information that we do not request. You are responsible for what you
              voluntarily provide.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Information Collected Automatically</h3>
            <p>
              Our servers and vendors may automatically log information such as IP address, browser type, operating
              system, referring site, access times, and request paths. In the signed-in application we also process
              technical and usage data needed to authenticate you, prevent abuse, and improve reliability and
              performance.
            </p>
          </Section>

          <Section id="use" title="How We Use Collected Information">
            <p>We use information, including personal information, to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Provide, operate, maintain, and secure the Service you requested;</li>
              <li>Process payments, prevent fraud, and enforce our agreements;</li>
              <li>Improve and develop features, content, and study tools;</li>
              <li>Communicate with you about the Service, including transactional and (where permitted) promotional
                messages;</li>
              <li>Comply with law and respond to lawful requests;</li>
              <li>Protect the rights, safety, and property of {LEGAL_ENTITY}, our users, and third parties.</li>
            </ul>
            <p>We may also use personal information for reasonable business purposes under applicable law, including
              to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Maintain the security and integrity of our networks and applications;</li>
              <li>Debug and repair errors that impair intended functionality;</li>
              <li>Verify or maintain the quality and safety of the Service; and</li>
              <li>Provide customer support and account administration.</li>
            </ul>
            <p>
              If you provide a telephone number, we will use it only for purposes related to your account or orders, or
              when you have asked us to call you back, unless you have opted in to other uses where permitted by law.
            </p>
          </Section>

          <Section id="share" title="How Information Is Shared">
            <p>We may share information as follows:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                <strong className="text-foreground">Service Providers.</strong> With vendors and contractors who help us
                host the Service, process payments, send email, analyze aggregated usage, prevent fraud, and perform
                similar functions. They are authorized to use information only as needed to provide services to us.
              </li>
              <li>
                <strong className="text-foreground">Corporate Transactions.</strong> In connection with a merger,
                acquisition, financing, reorganization, or sale of assets, information may be transferred as part of
                that transaction, subject to standard confidentiality arrangements.
              </li>
              <li>
                <strong className="text-foreground">Legal And Safety.</strong> When we believe disclosure is required by
                law, regulation, legal process, or governmental request, or to protect the rights, property, or safety of{" "}
                {LEGAL_ENTITY}, our users, or others.
              </li>
              <li>
                <strong className="text-foreground">With Your Direction Or Consent.</strong> When you ask us to share
                information or agree in a specific context (for example, sharing performance information with an
                institution as described in our Terms of Use).
              </li>
            </ul>
            <p>
              We do not sell your personal information. We do not share personal information with third parties for their own independent
              marketing without appropriate consent where required.
            </p>
            <p>
              Some service providers may process data in the United States or other countries. Where we transfer
              personal information across borders, we take steps designed to provide appropriate safeguards consistent
              with applicable law.
            </p>
            <p className="text-sm">
              For transparency under the CCPA, during the preceding twelve (12) months we may have collected, used, or
              disclosed categories of personal information consistent with the lists above, including identifiers,
              personal and account information, commercial information, internet activity, geolocation derived from IP,
              and inferences, each as applicable to our actual operations.
            </p>
          </Section>

          <Section id="storage" title="Storage, Security, And Retention">
            <p>
              We use reputable hosting and infrastructure providers, primarily in the United States, with technical and
              organizational measures intended to protect personal information. No method of transmission or storage is
              completely secure; we cannot guarantee absolute security.
            </p>
            <p>
              <strong className="text-foreground">Retention.</strong> We retain personal information for as long as
              needed to provide the Service, comply with legal obligations, resolve disputes, and enforce our
              agreements. Account and subscription records may be retained for a period after closure to meet accounting,
              tax, and legal requirements. Study data may be retained while your account is active and for a reasonable
              period afterward unless you request deletion subject to legal exceptions.
            </p>
            <p>
              If access is provided through an organization (for example, an institutional license), retention of
              certain records may be coordinated with that organization&apos;s administrator as described in your
              agreement with them.
            </p>
          </Section>

          <Section id="cookies" title="Cookies And Similar Technologies">
            <p>
              We and our service providers use cookies and similar technologies to keep you signed in, remember
              preferences, measure basic traffic and errors, and protect the Service. Some cookies are essential; if you
              disable cookies in your browser, parts of the Service (such as staying logged in) may not work correctly.
            </p>
            <p>
              If we use optional analytics or advertising cookies in the future, we will describe them here and, where
              required, obtain consent. Industry resources about online advertising choices include{" "}
              <a
                href="https://youradchoices.com/"
                className="font-medium text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                youradchoices.com
              </a>
              . If we run remarketing campaigns through providers such as Google, you may be able to adjust ad
              personalization through your Google account or similar vendor tools; links and options may change over
              time.
            </p>
          </Section>

          <Section id="dnt" title="Do Not Track And Third-Party Collection">
            <p>
              The Service is not designed to respond to &quot;Do Not Track&quot; browser signals, and there is no consistent
              industry standard for how to interpret them. Third-party sites (including social networks) linked from
              our marketing pages may collect information about you under their own policies when you interact with
              them.
            </p>
          </Section>

          <Section id="international" title="International Transfers">
            <p>
              By using the Service and submitting information, you understand that your information may be processed in
              the United States and other countries where we or our processors operate, which may have different data
              protection rules than your home jurisdiction, as necessary to provide the Service.
            </p>
          </Section>

          <Section id="rights" title="How To Control Your Information">
            <p>Depending on where you live, you may have rights to:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Access the personal information we hold about you;</li>
              <li>Request correction of inaccurate information;</li>
              <li>Request deletion of personal information, subject to legal exceptions;</li>
              <li>Opt out of certain processing (such as marketing emails); and</li>
              <li>Not be discriminated against for exercising privacy rights where prohibited by law.</li>
            </ul>
            <p>
              To submit a request, email{" "}
              <a href={mailto("Privacy request")} className="font-medium text-primary underline-offset-4 hover:underline">
                {SUPPORT_EMAIL}
              </a>{" "}
              from the address associated with your account, or use our{" "}
              <Link href="/contact" className="font-medium text-primary underline-offset-4 hover:underline">
                Contact
              </Link>{" "}
              page and describe your request. We may need to verify your identity before fulfilling certain requests.
            </p>
            <p>
              <strong className="text-foreground">Updating Your Account.</strong> You can review and update certain
              profile information in the application through{" "}
              <strong className="text-foreground">Settings</strong> (or equivalent profile area), when signed in.
            </p>
            <p>
              <strong className="text-foreground">Marketing Opt-Out.</strong> Promotional emails include an unsubscribe
              link where required. You may also write to {SUPPORT_EMAIL} if preferences do not update correctly.
            </p>
          </Section>

          <Section id="other" title="Other Privacy Information">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Confidentiality Of Direct Communications
            </h3>
            <p>
              We treat personal information you send directly to us (for example, support emails) as confidential in line
              with this Policy, except where disclosure is required by law or you have posted information in a public
              area we operate, in which case it may not be confidential.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Children</h3>
            <p>
              The Service is not directed to children under thirteen (13), and we do not knowingly collect personal
              information from children under 13. If you believe we have collected such information, contact{" "}
              <a href={mailto("Under 13 privacy")} className="font-medium text-primary underline-offset-4 hover:underline">
                {SUPPORT_EMAIL}
              </a>{" "}
              and we will take appropriate steps to delete it.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Policy Changes</h3>
            <p>
              We may update this Policy from time to time. Material changes will be posted on this page with an
              updated date, and where appropriate we may notify you by email or an in-product notice. Continued use of
              the Service after the effective date constitutes acceptance of the updated Policy unless law requires
              additional steps. If you disagree with material changes, you should stop using the Service and contact us;
              refunds, if any, are handled according to our Terms of Use and applicable law.
            </p>
          </Section>

          <Section id="california" title="California Privacy Rights">
            <p>
              If you are a California resident, the California Consumer Privacy Act (CCPA), as amended, may provide you
              with additional rights regarding personal information we collect. This section supplements the rest of this
              Policy.
            </p>
            <p>
              We collect and use personal information for the business and commercial purposes described in this Policy.
              We do not sell personal information as defined under the CCPA. We may use cookies and similar technologies
              as described in the &quot;Cookies And Similar Technologies&quot; section.
            </p>
            <p>
              Subject to exceptions under law, you may have the right to request access to specific pieces of personal
              information we have collected about you, to know categories of information collected and disclosed, to
              request deletion, and to opt out of any sale of personal information (we do not sell personal information
              as defined by the CCPA). We will not discriminate against you for exercising these rights.
            </p>
            <p>
              To exercise these rights, follow the instructions under &quot;How To Control Your Information.&quot; We may verify
              your request using information associated with your account. You may designate an authorized agent to
              submit a request on your behalf where the CCPA permits; we may require proof of the agent&apos;s authority.
            </p>
          </Section>

          <Section id="contact" title="Contact Us">
            <p>
              Questions or suggestions about this Privacy Policy? Contact {LEGAL_ENTITY} at{" "}
              <a href={mailto("Privacy Policy question")} className="font-medium text-primary underline-offset-4 hover:underline">
                {SUPPORT_EMAIL}
              </a>
              .
            </p>
          </Section>
        </article>
      </main>
    </MarketingShell>
  );
}
