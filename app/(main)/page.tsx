import { HeroSection } from '@/components/sections/hero-section'
import { SaleProducts } from '@/components/sections/sale-products'
import { NewProducts } from '@/components/sections/new-products'
import { CategoriesSection } from '@/components/sections/categories-section'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <CategoriesSection />
      <SaleProducts />
      <NewProducts />
    </div>
  )
}
