import type { Metadata } from "next";
import { Suspense } from "react";
import BillingPage from "./BillingPage";

export const metadata: Metadata = {
  title: "Mon abonnement – Book Me Again",
  description: "Gérer ton abonnement Book Me Again.",
};

export default function Page() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}
