export const metadata = {
  title: "Politique de confidentialité – Book Me Again",
  description: "Politique de confidentialité de l'application Book Me Again.",
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
        Dernière mise à jour : 18/11/2026
      </p>

      <p>
        La présente politique de confidentialité décrit comment l&apos;application{" "}
        <strong>Book Me Again</strong> (« l&apos;Application »), éditée par{" "}
        <strong>Jese Rasolondraibe</strong>, traite vos informations lorsque vous
        utilisez nos services.
      </p>

      <Section title="1. Données que nous collectons">
        <p>Nous collectons les informations suivantes lorsque vous utilisez l&apos;Application :</p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Informations de compte</strong> : adresse e-mail, nom
            d&apos;utilisateur.
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

      <Section title="3. Offres par email (client(e)s des prestataires)">
        <p>
          Lorsque vous réservez sur la page d&apos;un(e) prestataire, vous pouvez
          cocher la case « J&apos;accepte de recevoir les offres ». Cette case
          n&apos;est jamais cochée par défaut. Si vous la cochez, ce(tte)
          prestataire peut vous envoyer, via Book Me Again, des emails
          promotionnels : rappel quand il est temps de reprendre rendez-vous,
          message après une longue absence, créneaux de dernière minute à prix
          réduit, avec parfois un code de réduction.
        </p>
        <ul style={ulStyle}>
          <li style={liStyle}>
            <strong>Base légale</strong> : votre consentement, propre à chaque
            prestataire. Il n&apos;est pas nécessaire pour réserver.
          </li>
          <li style={liStyle}>
            <strong>Données utilisées</strong> : votre prénom, votre adresse email
            et l&apos;historique de vos rendez-vous chez ce(tte) prestataire
            (dates, prestations, montants), pour choisir le bon moment
            d&apos;envoi. Aucune donnée n&apos;est partagée avec d&apos;autres
            prestataires ni revendue.
          </li>
          <li style={liStyle}>
            <strong>Désinscription</strong> : chaque email contient un lien
            « Se désinscrire », effectif immédiatement. Les emails liés à vos
            rendez-vous (confirmation, rappel, modification) continuent
            d&apos;arriver.
          </li>
          <li style={liStyle}>
            <strong>Mesure</strong> : nous enregistrons l&apos;envoi de chaque
            email et, le cas échéant, la réservation qui en découle, pour indiquer
            au (à la) prestataire les résultats de ses offres. Notre prestataire
            d&apos;envoi (Resend) peut mesurer l&apos;ouverture des emails.
          </li>
          <li style={liStyle}>
            <strong>Conservation</strong> : votre consentement est conservé tant
            que vous ne vous désinscrivez pas, et au plus 3 ans après votre dernier
            rendez-vous chez ce(tte) prestataire.
          </li>
        </ul>
      </Section>

      <Section title="4. Partage des données">
        <p>
          Nous ne vendons pas vos données personnelles. Vos informations peuvent
          être partagées uniquement avec des prestataires techniques nécessaires
          au fonctionnement de l&apos;Application (hébergement, traitement des
          paiements le cas échéant), dans le respect de la réglementation
          applicable.
        </p>
      </Section>

      <Section title="5. Services tiers">
        <p>
          L&apos;Application s&apos;appuie sur les prestataires techniques
          suivants : Supabase (authentification, base de données et stockage),
          Vercel (hébergement de la page de réservation), Resend (envoi des
          emails de confirmation, de rappel et des offres), Stripe (paiement des
          abonnements et des acomptes, versés directement au (à la)
          prestataire), Expo (notifications push) et Google (connexion avec un
          compte Google, si vous la choisissez).
        </p>
      </Section>

      <Section title="6. Conservation des données">
        <p>
          Nous conservons vos données aussi longtemps que nécessaire pour fournir
          nos services ou pour répondre à nos obligations légales. Vous pouvez
          demander la suppression de vos données à tout moment en nous contactant.
        </p>
      </Section>

      <Section title="7. Vos droits">
        <p>
          Conformément au Règlement général sur la protection des données (RGPD),
          vous disposez d&apos;un droit d&apos;accès, de rectification, de
          suppression et de portabilité de vos données, ainsi que d&apos;un droit
          d&apos;opposition à leur traitement. Pour exercer ces droits,
          contactez-nous à l&apos;adresse indiquée ci-dessous.
        </p>
      </Section>

      <Section title="8. Sécurité">
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles
          raisonnables pour protéger vos données contre tout accès, divulgation ou
          destruction non autorisés.
        </p>
      </Section>

      <Section title="9. Enfants">
        <p>
          L&apos;Application ne s&apos;adresse pas aux enfants de moins de 13 ans
          et nous ne collectons pas sciemment de données les concernant.
        </p>
      </Section>

      <Section title="10. Modifications">
        <p>
          Cette politique peut être mise à jour ponctuellement. Toute modification
          sera publiée sur cette page avec une date de mise à jour actualisée.
        </p>
      </Section>

      <Section title="11. Contact">
        <p>
          Pour toute question concernant cette politique de confidentialité,
          contactez-nous à :{" "}
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
        © 2026 Jese Rasolondraibe. Tous droits réservés.
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
