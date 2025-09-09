import { HeroSection } from '@/components/sections/hero-section'
import { FeaturedProducts } from '@/components/sections/featured-products'
import { CategoriesSection } from '@/components/sections/categories-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
    </div>
  )
}
