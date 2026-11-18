import Unsubscribe from "./Unsubscribe";

// Lien « Se désinscrire » des emails marketing. La désinscription se fait au
// clic sur le bouton (et non à l'ouverture) : les antivirus des messageries
// ouvrent les liens tout seuls.
export const metadata = { title: "Désinscription · Book Me Again", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return (
    <main className="flex-1 min-h-screen bg-stone-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl p-8 text-center shadow-sm">
        <Unsubscribe token={token} />
      </div>
    </main>
  );
}
