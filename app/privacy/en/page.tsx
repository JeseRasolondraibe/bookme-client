export const metadata = {
  title: "Privacy Policy – Book Me Again",
  description: "Privacy policy for the Book Me Again application.",
};

export default function PrivacyPageEN() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "48px 24px 96px",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
        color: "#1d1d1f",
        lineHeight: 1.6,
      }}
    >
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 8 }}>
        Privacy Policy
      </h1>
      <p style={{ color: "#6e6e73", fontSize: "0.9rem", marginBottom: 40 }}>
        Last updated: November 18, 2026
      </p>

      <p>
        This privacy policy describes how the <strong>Book Me Again</strong> application
        (&quot;the App&quot;), published by <strong>Jese Rasolondraibe</strong>,
        handles your information when you use our services.
      </p>

      <Section title="1. Data we collect">
        <p>We collect the following information when you use the App:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Account information</strong>: email address, username.
          </li>
          <li style={liStyle}>
            <strong>Booking data</strong>: information related to the bookings you
            make through the App.
          </li>
          <li style={liStyle}>
            <strong>Usage data</strong>: technical information about how you
            interact with the App.
          </li>
        </ul>
      </Section>

      <Section title="2. Use of data">
        <p>The collected data is used solely to:</p>
        <ul style={ulStyle}>
          <li style={liStyle}>provide and maintain the proper functioning of the App;</li>
          <li style={liStyle}>manage your bookings and your account;</li>
          <li style={liStyle}>improve the user experience and fix issues;</li>
          <li style={liStyle}>respond to your support requests.</li>
        </ul>
      </Section>

      <Section title="3. Email offers (clients of service providers)">
        <p>
          When you book on a service provider&apos;s page, you can tick &quot;I
          agree to receive offers&quot;. This box is never pre-ticked. If you tick
          it, that provider may send you promotional emails through Book Me
          Again: a reminder when it is time to book again, a message after a long
          absence, or last-minute slots at a reduced price, sometimes with a
          discount code.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}><strong>Legal basis</strong>: your consent, given separately for each provider. It is not required to book.</li>
          <li style={liStyle}><strong>Data used</strong>: your first name, email address and your booking history with that provider (dates, services, amounts), to choose the right time to write. Nothing is shared with other providers or sold.</li>
          <li style={liStyle}><strong>Unsubscribe</strong>: every email contains an &quot;Unsubscribe&quot; link that takes effect immediately. Emails about your bookings (confirmation, reminder, changes) keep arriving.</li>
          <li style={liStyle}><strong>Measurement</strong>: we record each email sent and any booking that results from it, to show the provider the results of their offers. Our email provider (Resend) may measure email opens.</li>
          <li style={liStyle}><strong>Retention</strong>: your consent is kept until you unsubscribe, and at most 3 years after your last booking with that provider.</li>
        </ul>
      </Section>

      <Section title="4. Data sharing">
        <p>
          We do not sell your personal data. Your information may be shared only
          with technical service providers necessary for the operation of the App
          (hosting, payment processing where applicable), in compliance with
          applicable regulations.
        </p>
      </Section>

      <Section title="5. Third-party services">
        <p>
          The App relies on the following technical providers: Supabase
          (authentication, database and storage), Vercel (hosting of the booking
          page), Resend (confirmation, reminder and offer emails), Stripe
          (subscription payments and deposits, paid directly to the provider),
          Expo (push notifications) and Google (Sign in with Google, if you choose it).
        </p>
      </Section>

      <Section title="6. Data retention">
        <p>
          We retain your data for as long as necessary to provide our services or
          to meet our legal obligations. You may request the deletion of your data
          at any time by contacting us.
        </p>
      </Section>

      <Section title="7. Your rights">
        <p>
          In accordance with the General Data Protection Regulation (GDPR), you
          have the right to access, rectify, delete, and port your data, as well as
          the right to object to its processing. To exercise these rights, contact
          us at the address indicated below.
        </p>
      </Section>

      <Section title="8. Security">
        <p>
          We implement reasonable technical and organizational measures to protect
          your data against unauthorized access, disclosure, or destruction.
        </p>
      </Section>

      <Section title="9. Children">
        <p>
          The App is not intended for children under the age of 13, and we do not
          knowingly collect data concerning them.
        </p>
      </Section>

      <Section title="10. Changes">
        <p>
          This policy may be updated from time to time. Any changes will be posted
          on this page with an updated revision date.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          For any questions regarding this privacy policy, contact us at:{" "}
          <a href="mailto:jeserasolondraibe@gmail.com" style={{ color: "#0066cc" }}>
            jeserasolondraibe@gmail.com
          </a>
          .
        </p>
      </Section>

      <div
        style={{
          marginTop: 56,
          paddingTop: 24,
          borderTop: "1px solid #e5e5e7",
          color: "#6e6e73",
          fontSize: "0.875rem",
        }}
      >
        © 2026 Jese Rasolondraibe. All rights reserved.
      </div>
    </main>
  );
}

const ulStyle = { paddingLeft: 22 } as const;
const liStyle = { marginBottom: 6 } as const;

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 style={{ fontSize: "1.25rem", fontWeight: 600, marginTop: 40, marginBottom: 12 }}>
        {title}
      </h2>
      {children}
    </section>
  );
}
