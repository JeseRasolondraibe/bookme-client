export const metadata = {
  title: "Privacy Policy – BookMe",
  description: "Privacy policy for the BookMe application.",
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
        Last updated: June 23, 2026
      </p>

      <p>
        This privacy policy describes how the <strong>BookMe</strong> application
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

      <Section title="3. Data sharing">
        <p>
          We do not sell your personal data. Your information may be shared only
          with technical service providers necessary for the operation of the App
          (hosting, payment processing where applicable), in compliance with
          applicable regulations.
        </p>
      </Section>

      <Section title="4. Third-party services">
        <p>
          The App uses Supabase for authentication, storage, and data management,
          in compliance with applicable regulations.
        </p>
      </Section>

      <Section title="5. Data retention">
        <p>
          We retain your data for as long as necessary to provide our services or
          to meet our legal obligations. You may request the deletion of your data
          at any time by contacting us.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          In accordance with the General Data Protection Regulation (GDPR), you
          have the right to access, rectify, delete, and port your data, as well as
          the right to object to its processing. To exercise these rights, contact
          us at the address indicated below.
        </p>
      </Section>

      <Section title="7. Security">
        <p>
          We implement reasonable technical and organizational measures to protect
          your data against unauthorized access, disclosure, or destruction.
        </p>
      </Section>

      <Section title="8. Children">
        <p>
          The App is not intended for children under the age of 13, and we do not
          knowingly collect data concerning them.
        </p>
      </Section>

      <Section title="9. Changes">
        <p>
          This policy may be updated from time to time. Any changes will be posted
          on this page with an updated revision date.
        </p>
      </Section>

      <Section title="10. Contact">
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
