import Link from "next/link";
import { SectionWrapper } from "@/components/ui/SectionWrapper";

export default function TermsAndConditionsPage() {
  return (
    <SectionWrapper>
      <p className="text-xs tracking-[0.2em] text-[#8f6f3e]">KIAN RETREATS & EVENTS</p>
      <h1 className="mt-3 text-4xl text-[#1f1a15] md:text-5xl">Retreats & Events — Terms & Conditions</h1>
      <p className="mt-4 max-w-4xl text-sm text-[#6f6251]">
        The policies on this page apply to KIAN Retreats and Events bookings only — not to KIAN Privé concierge memberships,
        services, or packages.
      </p>
      <p className="mt-3 max-w-4xl text-sm text-[#6f6251]">
        For membership, payment, gratuity, financing, and medical disclaimer information, see{" "}
        <Link href="/payment-policies" className="text-[#8f6f3e] underline underline-offset-2">
          KIAN Privé Payment & Policies
        </Link>{" "}
        or{" "}
        <Link href="/pricing" className="text-[#8f6f3e] underline underline-offset-2">
          Membership Pricing
        </Link>
        .
      </p>
      <p className="mt-4 max-w-4xl text-sm text-[#6f6251]">
        Welcome to the KIAN Retreats website. By accessing and using this website for retreats and events, you agree to be
        bound by these Terms and Conditions.
      </p>

      <div className="mt-10 space-y-8 text-[#4f4335]">
        <section className="rounded-3xl border border-[#b78d4b2d] bg-white p-6 shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)]">
          <h2 className="text-2xl text-[#1f1a15]">1. General Use</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>You must be 18 years of age or older to use this website.</li>
            <li>You are responsible for maintaining the confidentiality of your account information and password.</li>
            <li>You may not use this website for any illegal or unauthorized purpose.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] p-6">
          <h2 className="text-2xl text-[#1f1a15]">2. Booking and Payment</h2>
          <h3 className="mt-4 text-lg text-[#8f6f3e]">Retreat Package Payment Policy</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>KIAN Retreats package rates are in USD per person.</li>
            <li>After confirmation, a courtesy hold requires payment within 3 days (72 hours) to secure the reservation.</li>
            <li>If there is a waitlist, a 24-hour to 6-hour courtesy hold may be offered.</li>
            <li>
              Payments are accepted via international bank transfer in USD only. No other currencies are accepted for bank transfers.
            </li>
            <li>Visa/Mastercard payments include a 3% online merchant processing fee and are accepted in USD only.</li>
            <li>
              Overseas bank transfers and credit card payments may include additional international transaction fees from your institution.
            </li>
            <li>You are responsible for all banking fees so the full package rate is received.</li>
            <li>For bookings made within 15-30 days of retreat start date, full payment is required to reserve your space.</li>
            <li>
              If you reschedule while holding a space with a deposit, the original rate lock is forfeited. The deposit is applied to current
              published rates at rebooking.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] p-6">
          <h2 className="text-2xl text-[#1f1a15]">3. Cancellations and Refunds</h2>
          <h3 className="mt-4 text-lg text-[#8f6f3e]">Cancellation Policy</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>To book a retreat, you must provide accurate and complete contact information.</li>
            <li>We accept various payment methods, subject to change. Booking confirmation is sent by email.</li>
            <li>
              We reserve the right to cancel or modify bookings. If KIAN Retreats cancels a retreat date (other than non-disclosure of
              pre-existing conditions), you may transfer full payment to another retreat or request a full refund.
            </li>
            <li>
              KIAN Retreats is not responsible for additional expenses from cancellation, including flights, loss of work, or other trip
              preparation costs.
            </li>
          </ul>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">Guest Cancellation Policy</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>KIAN Retreats does not offer refunds for guest cancellation (change or postponement) for any reason.</li>
            <li>
              At KIAN&apos;s discretion, a portion of payment or deposit may be offered as credit for another retreat/event at current rates.
            </li>
            <li>Credit may be transferred to another person arranged by you.</li>
          </ul>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">Credit and Forfeiture Schedule</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>More than 90 days before start date: 100% credit may be applied to another retreat.</li>
            <li>60-89 days before start date: 75% credit; 25% forfeited.</li>
            <li>15-59 days before start date: 40% credit; 60% forfeited.</li>
            <li>14 days or less before start date: entire payment forfeited.</li>
            <li>Any cancellation credit is applied to current rates at the time of rebooking.</li>
          </ul>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">Travel Insurance</h3>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Travel insurance coverage is mandatory to attend a KIAN Retreat.</li>
            <li>Insurance should cover relevant activities including action sports (where applicable).</li>
            <li>
              KIAN Retreats recommends coverage for trip interruption/cancellation due to unforeseen circumstances and last-minute changes.
            </li>
            <li>Please refer to the specific retreat page for detailed cancellation and refund terms.</li>
          </ul>
        </section>

        <section className="rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] p-6">
          <h2 className="text-2xl text-[#1f1a15]">4. Disclaimers and Limitations</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>KIAN Retreats is not responsible for damages or losses arising from website use or retreat participation.</li>
            <li>No warranties, express or implied, are made regarding accuracy or completeness of website information.</li>
            <li>
              You agree to hold KIAN Retreats harmless from claims or damages arising from website use or participation in retreats.
            </li>
            <li>
              If Panama&apos;s borders close and prevent attendance, your payment remains as credit for a future retreat date. Your travel
              insurance should cover travel interruption costs.
            </li>
          </ul>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">Pre-Existing Condition Disclosure Policy</h3>
          <p className="mt-3 leading-relaxed">
            KIAN Retreats is a holistic wellness retreat and not a medical or rehabilitation facility. If you have pre-existing substance
            dependence, eating disorders, psychological conditions, or significant medical conditions, you must disclose them at booking.
            If non-disclosure later creates a situation where adequate care cannot be provided for you or others, KIAN Retreats retains the
            right to cancel your retreat without refund or credit.
          </p>
        </section>

        <section className="rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] p-6">
          <h2 className="text-2xl text-[#1f1a15]">5. Governing Law and Jurisdiction</h2>
          <ul className="mt-4 list-disc space-y-2 pl-6">
            <li>These Terms are governed by the laws of the State of Florida.</li>
            <li>
              Any legal action arising from these Terms shall be brought exclusively in courts of the State of Florida.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] p-6">
          <h2 className="text-3xl text-[#1f1a15]">Privacy Policy</h2>
          <h3 className="mt-4 text-lg text-[#8f6f3e]">1. Information Collection</h3>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>We collect your name, contact info, booking date, retreat/event name, and retreat/event date when you book.</li>
            <li>Additional information may be collected through surveys or email campaigns.</li>
          </ul>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">2. Data Security</h3>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>We take reasonable measures to protect information from unauthorized access, disclosure, alteration, or destruction.</li>
            <li>We use secure servers and data encryption to protect information.</li>
          </ul>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">3. Data Sharing</h3>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>
              We do not sell or share personal information with third parties except service providers (for example payment processors)
              under confidentiality obligations.
            </li>
            <li>We may share information with law enforcement or government officials where required by law.</li>
          </ul>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">4. Marketing Opt-In</h3>
          <ul className="mt-2 list-disc space-y-2 pl-6">
            <li>By booking a retreat, you opt in to receive marketing communications by email and SMS.</li>
            <li>
              You can unsubscribe at any time by using the unsubscribe link in email or replying STOP to SMS communications.
            </li>
          </ul>
        </section>

        <section className="rounded-3xl border border-[#b78d4b2d] bg-white shadow-[0_14px_35px_-30px_rgba(66,45,14,0.35)] p-6">
          <h2 className="text-3xl text-[#1f1a15]">Event Guarantees</h2>
          <h3 className="mt-4 text-lg text-[#8f6f3e]">1. Accommodation</h3>
          <p className="mt-2 leading-relaxed">
            We guarantee the availability and quality of booked accommodations based on descriptions and specifications on our website.
            If unforeseen circumstances prevent this, we will provide a comparable or upgraded alternative.
          </p>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">2. Activities</h3>
          <p className="mt-2 leading-relaxed">
            We guarantee the availability and quality of advertised retreat activities. If an activity cannot be provided due to unforeseen
            circumstances, we will offer a reasonable substitution.
          </p>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">3. Speakers and Experts</h3>
          <p className="mt-2 leading-relaxed">
            We guarantee participation of advertised speakers and experts. If one is unable to attend due to unforeseen circumstances, we
            provide a substitute of equal caliber or an alternative session with similar content.
          </p>

          <h3 className="mt-6 text-lg text-[#8f6f3e]">4. Overall Experience</h3>
          <p className="mt-2 leading-relaxed">
            We guarantee a safe, respectful, and enriching retreat environment aligned with the purpose and description of your selected
            retreat and strive to deliver a transformative experience.
          </p>
        </section>
      </div>
    </SectionWrapper>
  );
}
