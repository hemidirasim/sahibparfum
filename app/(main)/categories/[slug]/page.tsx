import { Metadata } from 'next'
import CategoryPageClient from './category-page-client'

interface Category {
  id: string
  name: string
  description?: string
  image?: string
}

async function getCategoryData(slug: string): Promise<Category | null> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/categories`, {
      cache: 'no-store'
    })
    
    if (!response.ok) {
      return null
    }
    
    const categories = await response.json()
    
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
          .replace(/\s+/g, '-')
        
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
  const category = await getCategoryData(params.slug)
  
  if (!category) {
    return {
      title: 'Kateqoriya tapılmadı - Sahib Parfumeriya',
      description: 'Axtardığınız kateqoriya mövcud deyil.',
    }
  }

  return {
    title: `${category.name} - Sahib Parfumeriya`,
    description: category.description || `${category.name} kateqoriyasında ən yaxşı parfümləri kəşf edin. Premium markalar, sərfəli qiymətlər.`,
    keywords: `${category.name}, parfüm, kateqoriya, Sahib Parfumeriya, premium parfümlər`,
    openGraph: {
      title: `${category.name} - Sahib Parfumeriya`,
      description: category.description || `${category.name} kateqoriyasında ən yaxşı parfümləri kəşf edin.`,
      type: 'website',
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
      card: 'summary_large_image',
      title: `${category.name} - Sahib Parfumeriya`,
      description: category.description || `${category.name} kateqoriyasında ən yaxşı parfümləri kəşf edin.`,
      images: category.image ? [category.image] : [],
    },
    alternates: {
      canonical: `https://sahibparfum.az/categories/${params.slug}`,
    },
  }
}

export default function CategoryPage() {
  return <CategoryPageClient />
}