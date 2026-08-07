import type { ReactNode } from "react";
import { MarketingShell } from "@/components/marketing/MarketingShell";
import { usePageSeo } from "@/lib/usePageSeo";
import { useHostSpecialty } from "@/hooks/useSpecialty";
import { Link } from "wouter";

const SITE_NAME = "Atlas Review";

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

export default function TermsOfUsePage() {
  usePageSeo("/terms");
  /** Legal entity + contact differ per domain, so the terms shown match the site you bought on. */
  const { canonicalOrigin: SITE_URL, legalEntity: LEGAL_ENTITY, contactEmail: CONTACT_EMAIL } =
    useHostSpecialty();

  return (
    <MarketingShell>
      <main className="flex min-w-0 flex-col">
        <article className="container mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
          <header className="mb-10 space-y-3 border-b border-border/60 pb-8">
            <p className="text-sm font-medium tracking-tight text-muted-foreground">{LEGAL_ENTITY}</p>
            <h1 className="text-4xl font-bold leading-snug tracking-tight gradient-text sm:text-5xl">
              Terms Of Use
            </h1>
            <p className="text-sm text-muted-foreground">Last modified: April 16, 2026</p>
            <p className="pt-2 text-base leading-relaxed text-muted-foreground">
              This user agreement (&quot;Agreement&quot;) is a contract between you and {LEGAL_ENTITY} and applies
              to your subscription to and use of products and services available through{" "}
              <a
                href={SITE_URL}
                className="font-medium text-primary underline-offset-4 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                {SITE_URL}
              </a>{" "}
              (collectively, the &quot;Services&quot;). Purchase or use of the Services indicates that you agree to
              these Terms of Use. If you do not agree or do not intend to abide by them, please do not purchase or
              use {SITE_NAME}.
            </p>
          </header>

          <Section id="user-agreement" title="User Agreement">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Requirements Before You Subscribe</h3>
            <p>
              You must read, agree with, and accept all of the terms and conditions in this Agreement and our{" "}
              <Link href="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                Privacy Policy
              </Link>{" "}
              before you become a subscriber to and user of {SITE_NAME}&apos;s Services.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Changes To This Agreement</h3>
            <p>
              We may amend this Agreement at any time by posting the amended terms on the site. Except as stated
              below, amended terms shall be effective thirty (30) days after they are initially posted. Upcoming
              changes may also be summarized on this page.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Definitions</h3>
            <p>
              In this Agreement, &quot;you&quot; or &quot;your&quot; means any person or entity subscribing to and/or using the
              Services (&quot;users&quot;). Unless otherwise stated, &quot;{SITE_NAME},&quot; &quot;we,&quot; or &quot;our&quot; refers to {LEGAL_ENTITY}{" "}
              and the {SITE_NAME} product.
            </p>
          </Section>

          <Section id="age" title="Age Restriction">
            <p>To use {SITE_NAME}, you must:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Be at least thirteen (13) years of age; and</li>
              <li>
                Have the power to enter binding agreement(s) with us without being restricted by any applicable laws.
              </li>
            </ul>
          </Section>

          <Section id="license" title="License">
            <p>
              In consideration of your payment of the appropriate subscription fee for the Services you subscribe
              to, and your agreement to and compliance with this Agreement, {LEGAL_ENTITY} grants you a
              non-exclusive, non-sublicensable, non-transferable license and right to use and access {SITE_NAME}{" "}
              content and features (the &quot;Licensed Materials&quot;) through supported web browsers from multiple
              devices or locations with <strong className="text-foreground">Non-Concurrent</strong> login access. You
              may not access the Licensed Materials from multiple devices or locations concurrently (at the same
              time). Concurrent access from multiple sessions will be treated as account sharing and may result in
              action under the &quot;Restriction Against Transfer&quot; section below.
            </p>
          </Section>

          <Section id="system" title="System Requirements">
            <p>
              You must use a current, supported web browser and maintain a reasonable Internet connection. System
              requirements may be updated to reflect changes in technology. We reserve the right to discontinue
              support for any browser or platform at any time. We do not compensate for inability to use the Services
              on discontinued or unsupported systems or devices.
            </p>
          </Section>

          <Section id="technical-use" title="Technical Use And Content Protection">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Technical Controls In The Service</h3>
            <p>
              {SITE_NAME} is a web-based application. We may employ technical controls intended to protect proprietary
              content and the integrity of study and exam modes, which can include limitations on copy, paste,
              printing, context menus, or certain capture-related shortcuts while you are using the Services. You
              agree not to circumvent or interfere with these controls or attempt to access the Licensed Materials
              through unauthorized means.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Compatibility And Assumption Of Risk</h3>
            <p>
              We use reasonable efforts to support common configurations; however, we do not guarantee error-free
              operation on every device or browser. You accept that use of the Services on your system is at your own
              risk to the extent permitted by this Agreement.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Confidentiality Of Study And Exam Data
            </h3>
            <p>
              We keep your account study and exam performance information confidential and do not provide it to third
              parties without your consent, except as described in our Privacy Policy or as required by law. If an
              educational institution pays for your access, that institution may request performance information
              from us only with your written consent.
            </p>
          </Section>

          <Section id="export" title="Export Restrictions On International Sales">
            <p>
              In accordance with applicable U.S. export restrictions, software or downloadable materials we provide
              may not be purchased or used by individuals in embargoed jurisdictions where such restrictions apply.
              If you reside in a restricted jurisdiction, you may not purchase a subscription or use the Services in
              violation of applicable law.
            </p>
          </Section>

          <Section id="access" title="Access To Content">
            <p>
              You may use only the courses, topics, and features included in the subscription or access tier you
              have purchased or been granted. You may not access content or features outside your entitlements.
            </p>
          </Section>

          <Section id="reasonable-use" title="Reasonable Use">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Intended Individual Use</h3>
            <p>
              {SITE_NAME} products are intended for individual self-study and exam preparation and are offered as
              subscriptions. They are designed for careful review of content over time. Usage that is inconsistent
              with individual self-study—including, for example, automated scraping, bulk downloading not expressly
              permitted, patterns suggesting shared or commercial use of a personal subscription, or other use that
              materially exceeds what a typical individual subscriber would reasonably require—may be investigated.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Review And Enforcement</h3>
            <p>
              We may contact you to clarify usage that appears inconsistent with this section. We may suspend or
              terminate access where we reasonably determine that use violates this Agreement or harms the Services or
              other users.
            </p>
          </Section>

          <Section id="orders" title="Orders And Billing">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Registration And Checkout Data</h3>
            <p>
              Information collected during registration and checkout is used to process orders and provide access.
              When you pay by card, you may be asked for card number, expiration, security code, name, and billing
              address. Payment details are processed by our payment processors; we share only what is necessary for
              authorization and fraud prevention as described in our Privacy Policy.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Authorizations, Declines, And Receipts</h3>
            <p>
              Your card issuer may place a temporary authorization or pending charge when you attempt a transaction.
              Declined or failed attempts may still show as pending for several days per issuer policies. Successful
              charges are confirmed in the product flow where applicable, and you may contact us for receipts or
              billing questions at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=Billing%20question`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </Section>

          <Section id="refunds" title="Refunds">
            <p>
              Except as required by law or as we expressly offer in writing at checkout, refunds, cancellations, or
              subscription changes may be limited. We reserve the right to refuse a refund if you are in breach of
              this Agreement or if a refund would be inconsistent with fair use of the Services.
            </p>
          </Section>

          <Section id="account" title="Member Account, Password, And Security">
            <p>
              You must complete registration with current, complete, and accurate information. You are responsible for
              maintaining the confidentiality of your password and for all activity under your account. Notify us
              promptly at {CONTACT_EMAIL} if you suspect unauthorized use. We are not liable for losses caused by
              unauthorized use of your account, but you may be liable for losses we or others incur due to such use.
            </p>
          </Section>

          <Section id="ownership" title="Ownership">
            <p>
              The Licensed Materials, including all intellectual property rights, are the exclusive property of{" "}
              {LEGAL_ENTITY} or its licensors. Accepting these terms does not transfer ownership to you; you receive
              only the limited license in this Agreement.
            </p>
          </Section>

          <Section id="subscription-term" title="Subscription Term">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Scope Of Access And Product Changes</h3>
            <p>
              Your right to access the Licensed Materials continues for the subscription period you purchase unless
              terminated earlier under this Agreement. Features, question counts, and oral-coach capabilities may
              evolve during a term to keep content relevant; material terms of your purchase are as described on the
              applicable product or pricing pages at the time of purchase.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Activation And Non-Pausable Time</h3>
            <p>
              Subscription time generally begins when access is activated unless we agree otherwise in writing before
              you use the Licensed Materials. Subscriptions are not typically pausable for unused time unless we state
              otherwise in writing.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Renewal, Termination, And Study Tools</h3>
            <p>
              When your subscription ends, your access to the Licensed Materials ends unless you renew under then
              current terms. We may terminate this Agreement and access if you fail to comply with any material term.
              In-product tools that reset study progress, if any, are offered as described in the application and
              may change from time to time.
            </p>
          </Section>

          <Section id="permitted" title="Permitted Uses">
            <p>
              Where the product expressly allows export or printing (for example, certain reports or notes), you may
              use those outputs for your personal, non-commercial education, including an appropriate reference to{" "}
              {SITE_NAME} and copyright notices where shown. Unless expressly allowed in the interface, you may not
              print, reproduce, or redistribute question text or explanations outside the license granted here.
            </p>
          </Section>

          <Section id="prohibitions" title="Prohibitions">
            <p>You may not:</p>
            <ul className="list-disc space-y-2 pl-5">
              <li>Copy, reverse engineer, decompile, or modify the Licensed Materials except as law permits;</li>
              <li>
                Resell, sublicense, publicly perform, or redistribute Licensed Materials or use them to train
                machine learning models without our prior written consent;
              </li>
              <li>Use bots, scrapers, or automated means to access the Services except through documented APIs we
                provide;</li>
              <li>Interfere with the proper working of the site or other users&apos; access; or</li>
              <li>Share your password or use another user&apos;s account.</li>
            </ul>
          </Section>

          <Section id="transfer" title="Restriction Against Transfer">
            <p>
              You may not assign, share, sell, rent, lease, or otherwise transfer your rights under this Agreement.
              Accounts may be monitored for concurrent or abusive use. If we reasonably believe an account is shared in
              violation of this Agreement, we may suspend or terminate the account without refund and pursue other
              remedies available at law.
            </p>
          </Section>

          <Section id="violations" title="Violations">
            <p>
              If you breach this Agreement, we may terminate your access and your subscription without refund and may
              pursue any remedies available at law or in equity.
            </p>
          </Section>

          <Section id="marks" title="Marks">
            <p>
              Trademarks, logos, and service marks displayed on the site are the property of {LEGAL_ENTITY} or third
              parties. You may not use our marks without prior written permission. Site content is protected by
              copyright and other laws.
            </p>
          </Section>

          <Section id="affiliation" title="Affiliation">
            <p>
              {SITE_NAME} is an independent commercial educational resource. We are not affiliated with, endorsed by,
              or sponsored by the National Board of Medical Examiners (NBME®), the Association of American Medical
              Colleges (AAMC), the American Council of Academic Plastic Surgeons (ACAPS), the American Society of
              Plastic Surgeons (ASPS), or any examination or certifying body, unless we clearly state otherwise in
              writing.
            </p>
          </Section>

          <Section id="no-warranties" title="No Warranties">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Disclaimer Of Warranties</h3>
            <p>
              THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER
              EXPRESS, IMPLIED, OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
              PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT, TO THE MAXIMUM EXTENT PERMITTED BY LAW.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">
              Third-Party Content And Clinical Disclaimer
            </h3>
            <p>
              We do not endorse and are not responsible for the accuracy of third-party content linked from the site.
              Information in {SITE_NAME} is not a substitute for independent clinical judgment or individualized
              patient assessment.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Changes, Availability, And Pro-Rata Refunds</h3>
            <p>
              We may withdraw or modify the Services where reasonably necessary. If we permanently discontinue paid
              access through no fault of yours, your remedy for prepaid unused time will be a pro-rata refund of
              amounts paid for the unused portion of your current subscription term, unless applicable law requires
              otherwise.
            </p>
          </Section>

          <Section id="liability" title="Limitation Of Liability">
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Exclusion Of Certain Damages</h3>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, {LEGAL_ENTITY} WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES, OR DAMAGES FOR LOSS OF PROFITS, GOODWILL, OR DATA,
              ARISING OUT OF OR RELATED TO YOUR USE OF THE SERVICES OR THIS AGREEMENT, EVEN IF ADVISED OF THE
              POSSIBILITY OF SUCH DAMAGES.
            </p>
            <h3 className="text-xl font-semibold tracking-tight text-foreground">Cap On Liability</h3>
            <p>
              OUR AGGREGATE LIABILITY FOR CLAIMS ARISING OUT OF OR RELATED TO THE SERVICES OR THIS AGREEMENT WILL NOT
              EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US FOR THE SERVICES IN THE TWELVE (12) MONTHS BEFORE THE
              EVENT GIVING RISE TO LIABILITY OR (B) ONE HUNDRED U.S. DOLLARS (US $100), EXCEPT WHERE LIMITATION IS
              PROHIBITED BY LAW.
            </p>
          </Section>

          <Section id="communications" title="Confidentiality Of User Communications">
            <p>
              Except as required by law or as stated in our Privacy Policy, we treat direct communications you send us
              that contain personal information in accordance with reasonable security practices. Public postings you
              make on any forum or community feature we offer are not confidential, and we may use or moderate them
              as described in site rules.
            </p>
          </Section>

          <Section id="search" title="Search Engines And Web Crawlers">
            <p>
              Public portions of the site may be indexed by search engines. Do not post content you consider
              confidential if you do not want it discoverable through search.
            </p>
          </Section>

          <Section id="linked-sites" title="Linked Internet Sites">
            <p>
              We are not responsible for third-party websites linked from the Services. Access is at your own risk. You
              may link to our home page as long as the link is not misleading.
            </p>
          </Section>

          <Section id="postings" title="User Postings">
            <p>
              We are under no obligation to monitor user postings. We may remove content that we determine violates law
              or site rules, including unlawful, abusive, infringing, or spam content, impersonation, unauthorized
              solicitations, or repeated disruptive posts.
            </p>
          </Section>

          <Section id="dmca" title="DMCA Notices">
            <p>
              If you believe material on the site infringes your copyright, send a notice to{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}?subject=DMCA%20Notice`}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                {CONTACT_EMAIL}
              </a>{" "}
              with the subject line &quot;DMCA Notice&quot; and include the information described in 17 U.S.C. § 512(c)(3),
              including identification of the work, identification of the material and its location, your contact
              information, a good-faith statement, and a statement under penalty of perjury regarding authority and
              accuracy.
            </p>
          </Section>

          <Section id="governing-law" title="Governing Law">
            <p>
              This Agreement is the entire agreement between you and us regarding its subject matter and supersedes
              prior understandings on the same subject. It is governed by the laws of the State of Wyoming, USA,
              excluding conflict-of-law rules. You agree that exclusive jurisdiction for disputes arising under this
              Agreement lies in the state or federal courts located in Wyoming, except where prohibited by law. If
              any provision is invalid, the remaining provisions remain in effect. No waiver is deemed a further waiver
              unless in writing.
            </p>
          </Section>

          <p className="border-t border-border/60 pt-8 text-sm text-muted-foreground">
            Questions about this Agreement? Contact{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Terms%20of%20Use`}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </article>
      </main>
    </MarketingShell>
  );
}
