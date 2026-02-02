import { Pricing } from "@/components/sections/Pricing";
import { FAQ } from "@/components/sections/FAQ";
import { CTA } from "@/components/sections/CTA";

export const metadata = {
  title: "Pricing",
  description: "Simple, transparent pricing for teams of all sizes. Start your free trial today.",
};

export default function PricingPage() {
  return (
    <main className="min-h-screen pt-16">
      <Pricing />
      <FAQ />
      <CTA
        title="Ready to Get Started?"
        description="Choose a plan and start organizing your media today."
      />
    </main>
  );
}
