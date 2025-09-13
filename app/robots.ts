import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://sahibparfum.az'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '*.json',
          '/dashboard/',
          '/profile/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/wishlist/',
        ],
      },
      // Specific rules for search engines
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/profile/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/wishlist/',
        ],
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/profile/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/wishlist/',
        ],
      },
      {
        userAgent: 'YandexBot',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/auth/',
          '/_next/',
          '/private/',
          '/dashboard/',
          '/profile/',
          '/cart/',
          '/checkout/',
          '/orders/',
          '/wishlist/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
