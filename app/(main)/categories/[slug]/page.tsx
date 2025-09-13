import { Metadata } from 'next'
import CategoryPageClient from './category-page-client'

interface Category {
  id: string
  name: string
  description?: string | null
  image?: string | null
}

async function getCategoryData(slug: string): Promise<Category | null> {
  try {
    // Use Prisma directly instead of API call for better performance
    const { PrismaClient } = await import('@prisma/client')
    const prisma = new PrismaClient()
    
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
      },
      where: {
        isActive: true
      }
    })
    
    await prisma.$disconnect()
    
    // Try to find by ID first (if slug contains ID)
    let foundCategory = categories.find((cat: Category) => slug.includes(cat.id))
    
    // If not found by ID, try by slug
    if (!foundCategory) {
      foundCategory = categories.find((cat: Category) => {
        const categorySlug = cat.name.toLowerCase()
          .replace(/ç/g, 'c')
          .replace(/ğ/g, 'g')
          .replace(/ı/g, 'i')
          .replace(/ö/g, 'o')
          .replace(/ş/g, 's')
          .replace(/ü/g, 'u')
          .replace(/ə/g, 'e')  // ə -> e
          .replace(/ı/g, 'i')  // ı -> i
          .replace(/\s+/g, '-')
        
        console.log(`🔍 Comparing: "${categorySlug}" === "${slug}"`)
        return categorySlug === slug
      })
    }
    
    return foundCategory || null
  } catch (error) {
    console.error('Error fetching category:', error)
    return null
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  console.log('🔍 Generating metadata for slug:', params.slug)
  
  const category = await getCategoryData(params.slug)
  console.log('📊 Found category:', category)
  
  if (!category) {
    console.log('❌ Category not found, using default metadata')
    return {
      title: 'Kateqoriya tapılmadı - Sahib Parfumeriya',
      description: 'Axtardığınız kateqoriya mövcud deyil.',
    }
  }

  const metadata = {
    title: `${category.name} - Sahib Parfumeriya`,
    description: category.description || `${category.name} kateqoriyasında ən yaxşı parfümləri kəşf edin. Premium markalar, sərfəli qiymətlər.`,
    keywords: `${category.name}, parfüm, kateqoriya, Sahib Parfumeriya, premium parfümlər`,
    openGraph: {
      title: `${category.name} - Sahib Parfumeriya`,
      description: category.description || `${category.name} kateqoriyasında ən yaxşı parfümləri kəşf edin.`,
      type: 'website' as const,
      url: `https://sahibparfum.az/categories/${params.slug}`,
      images: category.image ? [
        {
          url: category.image,
          width: 800,
          height: 600,
          alt: `${category.name} kateqoriyası`,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title: `${category.name} - Sahib Parfumeriya`,
      description: category.description || `${category.name} kateqoriyasında ən yaxşı parfümləri kəşf edin.`,
      images: category.image ? [category.image] : [],
    },
    alternates: {
      canonical: `https://sahibparfum.az/categories/${params.slug}`,
    },
  }
  
  console.log('✅ Generated metadata:', metadata)
  return metadata
}

export default function CategoryPage() {
  return <CategoryPageClient />
}