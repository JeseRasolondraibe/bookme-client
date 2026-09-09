import { Presta } from "./BookingFlow";
import { PhoneIcon, LocationIcon, InstagramIcon, TiktokIcon, GlobeIcon, LinkIcon, CheckIcon } from "./icons";

// Colonne de gauche, sticky : toute l'identité du presta (photo, nom, bio,
// téléphone, adresse, réseaux) réunie au même endroit, plutôt qu'éclatée entre
// le haut et le bas de la page. Chaque ligne n'apparaît que si le champ
// correspondant est renseigné — pas de placeholder grisé pour les champs vides.
// Instagram/TikTok n'affichent que le pseudo (pas de lien de redirection).
export default function PrestaCard({ presta }: { presta: Presta }) {
  const links = [
    presta.website    && { href: presta.website,    label: "Site web",  Icon: GlobeIcon },
    presta.other_link && { href: presta.other_link, label: "Autre lien", Icon: LinkIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: typeof GlobeIcon }[];

  return (
    <aside className="lg:sticky lg:top-6 bg-white rounded-2xl border border-stone-200 overflow-hidden">
      {presta.avatar_url && (
        <img
          src={presta.avatar_url}
          alt={presta.name}
          className="w-full aspect-[4/3] object-cover bg-stone-100"
        />
      )}

      <div className="p-5">
        <h2 className="text-xl font-semibold text-stone-900">{presta.name}</h2>
        {presta.bio && <p className="text-sm text-stone-500 mt-2 leading-relaxed">{presta.bio}</p>}

        {(presta.phone || presta.address || presta.instagram || presta.tiktok || links.length > 0) && (
          <div className="flex flex-col gap-3 mt-5 pt-5 border-t border-stone-100">
            {presta.phone && (
              <a href={`tel:${presta.phone}`} className="flex items-center gap-3 text-sm text-stone-700 hover:text-accent-600 transition-colors">
                <PhoneIcon className="text-stone-400" />
                {presta.phone}
              </a>
            )}

            {presta.address && (
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <LocationIcon className="text-stone-400" />
                {presta.address}
              </div>
            )}

            {presta.instagram && (
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <InstagramIcon className="text-stone-400" />
                {presta.instagram}
              </div>
            )}

            {presta.tiktok && (
              <div className="flex items-center gap-3 text-sm text-stone-700">
                <TiktokIcon className="text-stone-400" />
                {presta.tiktok}
              </div>
            )}

            {links.map(({ href, label, Icon }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 text-sm text-stone-700 hover:text-accent-600 transition-colors">
                <Icon className="text-stone-400" />
                {label}
              </a>
            ))}
          </div>
        )}

        <ul className="flex flex-col gap-3 mt-5 pt-5 border-t border-stone-100">
          {["Confirmation immédiate", "Rappel avant le rendez-vous", "Sans création de compte"].map(item => (
            <li key={item} className="flex items-center gap-3 text-sm text-stone-600">
              <CheckIcon className="w-3.5 h-3.5 text-accent-600" />
              {item}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
