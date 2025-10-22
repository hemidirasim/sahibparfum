import { Metadata } from 'next'
import { PrismaClient } from '@prisma/client'
import CategoriesPageClient from './categories-page-client'

const prisma = new PrismaClient()

interface Category {
  id: string
  name: string
  description: string | null
  image: string | null
  isActive: boolean
  productCount: number
}

async function getCategoriesData(): Promise<Category[]> {
  try {
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        image: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            products: {
              where: {
                isActive: true
              }
            }
          }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    await prisma.$disconnect()

    return categories
      .filter(category => category.isActive && category._count.products > 0)
      .map(category => ({
        ...category,
        productCount: category._count.products
      }))
  } catch (error) {
    console.error('Error fetching categories:', error)
    await prisma.$disconnect()
    return []
  }
}

export async function generateMetadata({ searchParams }: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}): Promise<Metadata> {
  
  const categories = await getCategoriesData()
  const categoryIds = searchParams.categoryIds as string | string[]
  const search = searchParams.search as string
  const filter = searchParams.filter as string
  const brand = searchParams.brand as string
  const newProducts = searchParams.new as string
  const sale = searchParams.sale as string
  const category = searchParams.category as string

  let title = 'Bütün Məhsullar - Sahib Parfumeriya'
  let description = 'Bütün parfüm kolleksiyamızı kəşf edin. Premium parfüm markalarını sərfəli qiymətlərlə təqdim edən etibarlı platforma.'
  let keywords = 'parfüm, ətir, sahib parfumeriya, online mağaza, parfüm alış-verişi'

  // Handle categoryIds parameter
  if (categoryIds) {
    const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
    const categoryNames = ids
      .map(id => categories.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ')
    
    if (categoryNames) {
      title = `${categoryNames} - Kateqoriya Məhsulları | Sahib Parfumeriya`
      description = `${categoryNames} kateqoriyasında premium parfümlər. ${categoryNames} üçün geniş seçim və sərfəli qiymətlər.`
      keywords = `${categoryNames}, parfüm, ətir, kateqoriya, sahib parfumeriya, online mağaza`
    }
  }
  // Handle other filters
  else if (search) {
    title = `"${search}" üçün nəticələr - Sahib Parfumeriya`
    description = `"${search}" axtarış nəticələri. Premium parfüm markalarında geniş seçim və sərfəli qiymətlər.`
    keywords = `${search}, axtarış, parfüm, ətir, sahib parfumeriya`
  }
  else if (filter) {
    title = `"${filter}" hərfi ilə başlayan məhsullar - Sahib Parfumeriya`
    description = `"${filter}" hərfi ilə başlayan parfümlər. Premium markalarda geniş seçim və sərfəli qiymətlər.`
    keywords = `${filter}, parfüm, ətir, hərf, sahib parfumeriya`
  }
  else if (brand) {
    title = `"${brand}" markası üçün məhsullar - Sahib Parfumeriya`
    description = `"${brand}" markasının premium parfümləri. Geniş seçim və sərfəli qiymətlər.`
    keywords = `${brand}, marka, parfüm, ətir, sahib parfumeriya`
  }
  else if (newProducts === 'true') {
    title = 'Yeni Məhsullar - Sahib Parfumeriya'
    description = 'Yeni gələn parfümlər və ətirlər. Ən son kolleksiyalar və trend məhsullar.'
    keywords = 'yeni məhsullar, yeni parfüm, yeni ətir, trend, kolleksiya, sahib parfumeriya'
  }
  else if (sale === 'true') {
    title = 'Endirimli Məhsullar - Sahib Parfumeriya'
    description = 'Endirimli parfümlər və ətirlər. Premium markalarda böyük endirimlər və sərfəli qiymətlər.'
    keywords = 'endirimli məhsullar, endirim, parfüm, ətir, sərfəli qiymət, sahib parfumeriya'
  }
  else if (category) {
    title = `${category} kateqoriyası - Sahib Parfumeriya`
    description = `${category} kateqoriyasında premium parfümlər. Geniş seçim və sərfəli qiymətlər.`
    keywords = `${category}, kateqoriya, parfüm, ətir, sahib parfumeriya`
  }

  const canonicalUrl = `https://sahibparfum.az/categories${Object.keys(searchParams).length > 0 ? '?' + new URLSearchParams(searchParams as Record<string, string>).toString() : ''}`

  return {
    title,
    description,
    keywords,
    authors: [{ name: 'Sahib Parfumeriya' }],
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'Sahib Parfumeriya',
      type: 'website',
      locale: 'az_AZ',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  }
}

export default async function CategoriesPage({ 
  searchParams 
}: { 
  searchParams: { [key: string]: string | string[] | undefined } 
}) {
  const categories = await getCategoriesData()
  
  // Generate page title and description
  const categoryIds = searchParams.categoryIds as string | string[]
  const search = searchParams.search as string
  const filter = searchParams.filter as string
  const brand = searchParams.brand as string
  const newProducts = searchParams.new as string
  const sale = searchParams.sale as string
  const category = searchParams.category as string

  let pageTitle = 'Bütün Məhsullar'
  let pageDescription = 'Bütün parfüm kolleksiyamızı kəşf edin'

  // Handle categoryIds parameter
  if (categoryIds) {
    const ids = Array.isArray(categoryIds) ? categoryIds : [categoryIds]
    const categoryNames = ids
      .map(id => categories.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ')
    
    if (categoryNames) {
      pageTitle = `${categoryNames} kateqoriyası`
      pageDescription = `${categoryNames} kateqoriyasında premium parfümlər`
    }
  }
  else if (search) {
    pageTitle = `"${search}" üçün nəticələr`
    pageDescription = 'Axtarış nəticələriniz'
  }
  else if (filter) {
    pageTitle = `"${filter}" hərfi ilə başlayan məhsullar`
    pageDescription = 'Axtarış nəticələriniz'
  }
  else if (brand) {
    pageTitle = `"${brand}" markası üçün məhsullar`
    pageDescription = 'Axtarış nəticələriniz'
  }
  else if (newProducts === 'true') {
    pageTitle = 'Yeni Məhsullar'
    pageDescription = 'Yeni gələn parfümlər və ətirlər'
  }
  else if (sale === 'true') {
    pageTitle = 'Endirimli Məhsullar'
    pageDescription = 'Endirimli parfümlər və ətirlər'
  }
  else if (category) {
    pageTitle = `${category} kateqoriyası`
    pageDescription = 'Axtarış nəticələriniz'
  }

  return (
    <CategoriesPageClient 
      initialCategories={categories}
      pageTitle={pageTitle}
      pageDescription={pageDescription}
    />
  )
}

export const dynamic = 'force-dynamic'
