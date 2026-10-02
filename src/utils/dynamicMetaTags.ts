import { ProductBundle } from '../types';

/**
 * Dynamically updates document meta tags, OpenGraph, Twitter Cards, Canonical URL,
 * and Schema.org JSON-LD structured data for the active product bundle to boost SEO.
 */
export function updateBundleMetaTags(bundle: ProductBundle) {
  if (typeof document === 'undefined') return;

  const pageTitle = `${bundle.title} – Dyusar Super Reconstrução Capilar Oficial`;
  const metaDescription = `Compre o ${bundle.title} por R$ ${bundle.price.toFixed(2).replace('.', ',')} em 12x de R$ ${bundle.installmentValue.toFixed(2).replace('.', ',')} com Frete Grátis. ${bundle.tagline}.`;
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://dyusar.com.br';
  const canonicalUrl = `${origin}/#${bundle.id}`;
  const cleanImage = bundle.image.split('?')[0];
  const imageUrl = bundle.image.startsWith('http') ? bundle.image : `${origin}${cleanImage}`;

  // 1. Update Document Title
  document.title = pageTitle;

  // 2. Helper to set or create meta tag
  const setMetaTag = (attrName: 'name' | 'property', attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`) as HTMLMetaElement | null;
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.content = content;
  };

  // Standard Meta Description
  setMetaTag('name', 'description', metaDescription);

  // OpenGraph Tags
  setMetaTag('property', 'og:title', pageTitle);
  setMetaTag('property', 'og:description', metaDescription);
  setMetaTag('property', 'og:url', canonicalUrl);
  setMetaTag('property', 'og:image', imageUrl);
  setMetaTag('property', 'og:image:secure_url', imageUrl);

  // Twitter Card Tags
  setMetaTag('name', 'twitter:title', pageTitle);
  setMetaTag('name', 'twitter:description', metaDescription);
  setMetaTag('name', 'twitter:image', imageUrl);

  // Canonical Link
  const canonicalEl = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (canonicalEl) {
    canonicalEl.href = canonicalUrl;
  }

  // Schema.org Structured Data
  let schemaScript = document.getElementById('schema-bundle-jsonld') as HTMLScriptElement | null;
  if (!schemaScript) {
    schemaScript = document.createElement('script');
    schemaScript.id = 'schema-bundle-jsonld';
    schemaScript.type = 'application/ld+json';
    document.head.appendChild(schemaScript);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': `${bundle.title} – Dyusar Haute Performance`,
    'image': imageUrl,
    'description': `${bundle.tagline}. ${bundle.itemsIncluded.join(', ')}.`,
    'brand': {
      '@type': 'Brand',
      'name': 'Dyusar Cosméticos'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '1284',
      'bestRating': '5',
      'worstRating': '1'
    },
    'offers': {
      '@type': 'Offer',
      'price': bundle.price.toFixed(2),
      'priceCurrency': 'BRL',
      'availability': 'https://schema.org/InStock',
      'url': canonicalUrl,
      'seller': {
        '@type': 'Organization',
        'name': 'Dyusar Cosméticos Loja Oficial'
      }
    }
  };

  schemaScript.textContent = JSON.stringify(structuredData);
}
