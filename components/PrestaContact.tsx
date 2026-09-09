import { Presta } from "./BookingFlow";
import { LocationIcon, InstagramIcon, TiktokIcon, GlobeIcon, LinkIcon } from "./icons";

// Section « Contact » en bas de la page publique : adresse + réseaux/liens du presta.
// Chaque icône n'apparaît que si le champ correspondant est renseigné — pas de
// placeholder grisé pour les champs vides.
export default function PrestaContact({ presta }: { presta: Presta }) {
  const links = [
    presta.instagram && { href: presta.instagram, label: "Instagram", Icon: InstagramIcon },
    presta.tiktok    && { href: presta.tiktok,    label: "TikTok",    Icon: TiktokIcon },
    presta.website   && { href: presta.website,   label: "Site web",  Icon: GlobeIcon },
    presta.other_link && { href: presta.other_link, label: "Autre lien", Icon: LinkIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof LocationIcon }[];

  if (!presta.address && links.length === 0) return null;

  return (
    <section className="mt-6 bg-white rounded-2xl border border-stone-200 p-5 sm:p-7">
      <h2 className="text-lg font-semibold text-stone-900 mb-4">Contact</h2>

      <div className="flex flex-col gap-3">
        {presta.address && (
          <div className="flex items-center gap-3 text-sm text-stone-700">
            <LocationIcon className="text-stone-400" />
            {presta.address}
          </div>
        )}

        {links.length > 0 && (
          <div className="flex items-center gap-3 mt-1">
            {links.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-500 hover:text-accent-600 hover:border-accent-400 transition-colors">
                <Icon className="w-4 h-4" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
