import Link from "next/link";
import { Check } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/month",
    description: "Perfect for small teams getting started",
    features: [
      "Up to 1,000 media items",
      "AI auto-tagging",
      "Basic search",
      "5 custom media types",
      "Email support",
    ],
    cta: "Start Free Trial",
    href: "/demo",
    popular: false,
  },
  {
    name: "Professional",
    price: "$99",
    period: "/month",
    description: "For growing teams and organizations",
    features: [
      "Up to 10,000 media items",
      "Advanced AI tagging",
      "Semantic search",
      "Unlimited media types",
      "Priority support",
      "Team collaboration",
      "Custom integrations",
    ],
    cta: "Start Free Trial",
    href: "/demo",
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    description: "For large organizations with specific needs",
    features: [
      "Unlimited media items",
      "Advanced AI & ML features",
      "Dedicated support",
      "Custom SLA",
      "On-premise deployment",
      "Advanced security",
      "Custom training",
    ],
    cta: "Contact Sales",
    href: "/demo",
    popular: false,
  },
];

export function Pricing() {
  return (
    <section id="pricing" className="py-20 px-4 bg-slate-900">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Choose the plan that fits your team. All plans include a 14-day free trial.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-slate-800 rounded-lg border p-8 ${
                plan.popular
                  ? "border-cyan-500 ring-2 ring-cyan-500/20 scale-105"
                  : "border-slate-700"
              }`}
            >
              {plan.popular && (
                <div className="text-center mb-4">
                  <span className="bg-cyan-500 text-white text-sm font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </span>
                </div>
              )}
              <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
              <p className="text-slate-400 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-5xl font-bold text-white">{plan.price}</span>
                {plan.period && (
                  <span className="text-slate-400 ml-2">{plan.period}</span>
                )}
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300">{feature}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block w-full text-center font-semibold py-3 px-6 rounded-lg transition-colors ${
                  plan.popular
                    ? "bg-cyan-500 hover:bg-cyan-600 text-white"
                    : "bg-slate-700 hover:bg-slate-600 text-white"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
