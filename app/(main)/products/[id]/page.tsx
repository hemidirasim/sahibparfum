import { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'
import { notFound } from 'next/navigation'
import ProductDetailClient from './product-detail-client'

interface ProductVariant {
  id: string
  volume: string
  price: number
  salePrice?: number
  stock: number
  sku: string
  isActive: boolean
}

interface ProductAttribute {
  id: string
  name: string
  value: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  salePrice?: number
  images: string[]
  inStock: boolean
  stockCount: number
  sku: string
  brand?: {
    name: string
  }
  volume?: string
  averageRating: number
  reviewCount: number
  isOnSale?: boolean
  category: {
    name: string
  }
  variants: ProductVariant[]
  attributes: ProductAttribute[]
  reviews: {
    id: string
    rating: number
    comment?: string
    user: {
      name: string
    }
    createdAt: string
  }[]
}

const prisma = new PrismaClient()

async function getProductData(id: string): Promise<Product | null> {
  try {
    console.log(`🔍 Fetching product data for ID: ${id}`)
    
    const product = await prisma.product.findUnique({
      where: { 
        id,
        isActive: true
      },
      include: {
        brand: {
          select: {
            name: true
          }
        },
        category: {
          select: {
            name: true
          }
        },
        variants: {
          where: {
            isActive: true
          }
        },
        attributes: true,
        reviews: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })

    if (!product) {
      console.log(`❌ Product not found for ID: ${id}`)
      return null
    }

    console.log(`✅ Found product: ${product.name}`)
    await prisma.$disconnect()
    
    return {
      ...product,
      images: typeof product.images === 'string' ? [product.images] : (product.images || []),
      reviews: product.reviews.map(review => ({
        ...review,
        comment: review.comment || undefined,
        user: {
          name: review.user.name || 'Anonymous'
        },
        createdAt: review.createdAt.toISOString()
      }))
    } as Product
  } catch (error) {
    console.error('Error fetching product:', error)
    await prisma.$disconnect()
    return null
  }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  console.log(`🔍 Generating metadata for product ID: ${params.id}`)
  
  const product = await getProductData(params.id)
  
  if (!product) {
    console.log(`❌ Product not found for metadata generation`)
    return {
      title: 'Məhsul tapılmadı - Sahib Parfumeriya',
      description: 'Axtardığınız məhsul mövcud deyil.',
    }
  }

  console.log(`📊 Found product for metadata: ${product.name}`)

  const currentPrice = product.salePrice || product.price
  const originalPrice = product.salePrice ? product.price : undefined
  const priceText = originalPrice 
    ? `${currentPrice.toFixed(2)} ₼ (əvvəl ${originalPrice.toFixed(2)} ₼)` 
    : `${currentPrice.toFixed(2)} ₼`

  const brandText = product.brand?.name ? ` - ${product.brand.name}` : ''
  const categoryText = product.category.name ? ` | ${product.category.name}` : ''
  
  const metadata: Metadata = {
    title: `${product.name}${brandText} - Sahib Parfumeriya`,
    description: `${product.name}${brandText} - ${product.description.substring(0, 150)}... Qiymət: ${priceText}. Premium parfüm keyfiyyəti, sərfəli qiymətlər.`,
    keywords: [
      product.name,
      product.brand?.name || '',
      product.category.name,
      'parfüm',
      'ətir',
      'sahib parfumeriya',
      'online mağaza',
      'parfüm alış-verişi',
      priceText
    ].filter(Boolean).join(', '),
    authors: [{ name: 'Sahib Parfumeriya' }],
    openGraph: {
      title: `${product.name}${brandText} - Sahib Parfumeriya`,
      description: `${product.name}${brandText} - ${product.description.substring(0, 150)}... Qiymət: ${priceText}.`,
      type: 'website' as const,
      url: `https://sahibparfum.az/products/${product.id}`,
      images: product.images && product.images.length > 0 ? [
        {
          url: product.images[0],
          width: 800,
          height: 600,
          alt: product.name,
        }
      ] : [],
      siteName: 'Sahib Parfumeriya',
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${product.name}${brandText} - Sahib Parfumeriya`,
      description: `${product.name}${brandText} - ${product.description.substring(0, 150)}... Qiymət: ${priceText}.`,
      images: product.images && product.images.length > 0 ? [product.images[0]] : [],
    },
    alternates: {
      canonical: `https://sahibparfum.az/products/${product.id}`,
    },
  }

  console.log(`✅ Generated metadata for product: ${product.name}`)
  return metadata
}

export default async function ProductDetail({ params }: { params: { id: string } }) {
  const product = await getProductData(params.id)
  
  if (!product) {
    notFound()
  }

  return <ProductDetailClient initialProduct={product} />
}

// Force dynamic rendering
export const dynamic = 'force-dynamic'
