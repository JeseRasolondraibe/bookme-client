export const metadata = {
  title: "Politique de confidentialité – BookMe",
  description: "Politique de confidentialité de l'application BookMe.",
};

export default function PrivacyPage() {
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
        Politique de confidentialité
      </h1>
      <p style={{ color: "#6e6e73", fontSize: "0.9rem", marginBottom: 40 }}>
        Dernière mise à jour : [DATE]
      </p>

      <p>
        La présente politique de confidentialité décrit comment l&apos;application{" "}
        <strong>BookMe</strong> (« l&apos;Application »), éditée par{" "}
        <strong>[NOM_EDITEUR]</strong>, traite vos informations lorsque vous
        utilisez nos services.
      </p>

      <Section title="1. Données que nous collectons">
        <p>Nous collectons les informations suivantes lorsque vous utilisez l&apos;Application :</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Informations de compte</strong> : adresse e-mail, nom
            d&apos;utilisateur (supprimez si non applicable).
          </li>
          <li style={liStyle}>
            <strong>Données de réservation</strong> : informations liées aux
            réservations que vous effectuez via l&apos;Application.
          </li>
          <li style={liStyle}>
            <strong>Données d&apos;utilisation</strong> : informations techniques
            sur la façon dont vous interagissez avec l&apos;Application.
          </li>
        </ul>
      </Section>

      <Section title="2. Utilisation des données">
        <p>Les données collectées servent uniquement à :</p>
        <ul style={ulStyle}>
          <li style={liStyle}>fournir et maintenir le bon fonctionnement de l&apos;Application ;</li>
          <li style={liStyle}>gérer vos réservations et votre compte ;</li>
          <li style={liStyle}>améliorer l&apos;expérience utilisateur et corriger les anomalies ;</li>
          <li style={liStyle}>répondre à vos demandes de support.</li>
        </ul>
      </Section>

      <Section title="3. Partage des données">
        <p>
          Nous ne vendons pas vos données personnelles. Vos informations peuvent
          être partagées uniquement avec des prestataires techniques nécessaires
          au fonctionnement de l&apos;Application (hébergement, traitement des
          paiements le cas échéant), dans le respect de la réglementation
          applicable.
        </p>
      </Section>

      <Section title="4. Services tiers">
        <p>
          L&apos;Application peut utiliser des services tiers susceptibles de
          collecter des informations. [Listez-les si applicable, par ex. :
          Firebase, Stripe, Supabase, etc. — sinon supprimez cette section.]
        </p>
      </Section>

      <Section title="5. Conservation des données">
        <p>
          Nous conservons vos données aussi longtemps que nécessaire pour fournir
          nos services ou pour répondre à nos obligations légales. Vous pouvez
          demander la suppression de vos données à tout moment en nous contactant.
        </p>
      </Section>

      <Section title="6. Vos droits">
        <p>
          Conformément au Règlement général sur la protection des données (RGPD),
          vous disposez d&apos;un droit d&apos;accès, de rectification, de
          suppression et de portabilité de vos données, ainsi que d&apos;un droit
          d&apos;opposition à leur traitement. Pour exercer ces droits,
          contactez-nous à l&apos;adresse indiquée ci-dessous.
        </p>
      </Section>

      <Section title="7. Sécurité">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles
          raisonnables pour protéger vos données contre tout accès, divulgation ou
          destruction non autorisés.
        </p>
      </Section>

      <Section title="8. Enfants">
        <p>
          L&apos;Application ne s&apos;adresse pas aux enfants de moins de 13 ans
          et nous ne collectons pas sciemment de données les concernant.
        </p>
      </Section>

      <Section title="9. Modifications">
        <p>
          Cette politique peut être mise à jour ponctuellement. Toute modification
          sera publiée sur cette page avec une date de mise à jour actualisée.
        </p>
      </Section>

      <Section title="10. Contact">
        <p>
          Pour toute question concernant cette politique de confidentialité,
          contactez-nous à :{" "}
          <a href="mailto:[EMAIL_CONTACT]" style={{ color: "#0066cc" }}>
            [EMAIL_CONTACT]
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
        © [ANNEE] [NOM_EDITEUR]. Tous droits réservés.
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
