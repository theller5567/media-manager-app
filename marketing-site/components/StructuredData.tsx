export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mediamanager.app";
  
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Media Manager App",
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: "AI-powered media management platform for organizations",
    sameAs: [
      // Add social media links when available
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Media Manager App",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "29",
      priceCurrency: "USD",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "150",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
    </>
  );
}
