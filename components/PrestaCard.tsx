import { Presta } from "./BookingFlow";
import { PhoneIcon, CheckIcon } from "./icons";

// Colonne de gauche : l'identité du presta. La photo n'apparaît que si avatar_url
// est renseignée — pas de placeholder quand elle manque.
export default function PrestaCard({ presta }: { presta: Presta }) {
  return (
    <aside className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
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

        {presta.phone && (
          <div className="mt-5 pt-5 border-t border-stone-100">
            <a href={`tel:${presta.phone}`} className="flex items-center gap-3 text-sm text-stone-700 hover:text-accent-600 transition-colors">
              <PhoneIcon className="text-stone-400" />
              {presta.phone}
            </a>
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
