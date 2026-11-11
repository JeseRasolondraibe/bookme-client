import type { Metadata } from "next";
import { Suspense } from "react";
import BillingPage from "./BillingPage";

export const metadata: Metadata = {
  title: "Mon abonnement – BookMe",
  description: "Gérer ton abonnement BookMe.",
};

export default function Page() {
  return (
    <Suspense>
      <BillingPage />
    </Suspense>
  );
}
