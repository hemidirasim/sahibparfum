import { MetadataRoute } from 'next'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://sahibparfum.az'
  
  try {
    // Fetch all active categories
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      select: { id: true, name: true, updatedAt: true }
    })

    // Fetch all active products
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, updatedAt: true }
    })

    // Fetch all active brands
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      select: { id: true, name: true, updatedAt: true }
    })

    await prisma.$disconnect()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/about`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/contact`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/auth/signin`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      {
        url: `${baseUrl}/auth/signup`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
      // Special category pages
      {
        url: `${baseUrl}/categories?new=true`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/categories?sale=true`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
    ]

    // Category pages with categoryIds
    const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
      url: `${baseUrl}/categories?categoryIds=${category.id}`,
      lastModified: category.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

    // Category pages with slug (for existing slug-based routes)
    const categorySlugPages: MetadataRoute.Sitemap = categories.map((category) => {
      const slug = category.name.toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u')
        .replace(/ə/g, 'e')
        .replace(/\s+/g, '-')
      
      return {
        url: `${baseUrl}/categories/${slug}`,
        lastModified: category.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }
    })

    // Product pages
    const productPages: MetadataRoute.Sitemap = products.map((product) => ({
      url: `${baseUrl}/products/${product.id}`,
      lastModified: product.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

    // Brand pages
    const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
      url: `${baseUrl}/categories?brand=${encodeURIComponent(brand.name)}`,
      lastModified: brand.updatedAt,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    }))

    // Alphabetical filter pages
    const alphabetPages: MetadataRoute.Sitemap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({
      url: `${baseUrl}/categories?filter=${letter}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.5,
    }))

    return [
      ...staticPages,
      ...categoryPages,
      ...categorySlugPages,
      ...productPages,
      ...brandPages,
      ...alphabetPages,
    ]

  } catch (error) {
    console.error('Error generating sitemap:', error)
    await prisma.$disconnect()
    
    // Fallback sitemap with just static pages
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1,
      },
      {
        url: `${baseUrl}/categories`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/products`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
    ]
  }
}
