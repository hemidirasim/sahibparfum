const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createSettingsTable() {
  try {
    console.log('🔧 Creating Settings table in production database...')
    
    // Check if settings table exists
    const existingSettings = await prisma.settings.findFirst()
    
    if (existingSettings) {
      console.log('✅ Settings table already exists')
      console.log('Current settings:', {
        id: existingSettings.id,
        siteName: existingSettings.siteName,
        contactPhone: existingSettings.contactPhone,
        contactEmail: existingSettings.contactEmail
      })
    } else {
      console.log('❌ Settings table does not exist, creating...')
      
      // Create default settings
      const settings = await prisma.settings.create({
        data: {
          siteName: 'SAHIB perfumery & cosmetics',
          siteDescription: 'Premium Parfüm Mağazası',
          contactEmail: 'info@sahibparfum.az',
          contactPhone: '+994 51 366 66 63',
          address: 'Bakı şəhəri, Nərimanov rayonu',
          currency: 'AZN',
          taxRate: 18.0,
          deliveryCost: 10.0,
          freeDeliveryThreshold: 100.0,
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true
        }
      })
      
      console.log('✅ Settings table created successfully')
      console.log('Created settings:', {
        id: settings.id,
        siteName: settings.siteName,
        contactPhone: settings.contactPhone,
        contactEmail: settings.contactEmail
      })
    }
    
  } catch (error) {
    console.error('❌ Error creating settings table:', error)
    
    if (error.code === 'P2021') {
      console.log('🔧 Table does not exist, trying to create with raw SQL...')
      
      try {
        await prisma.$executeRaw`
          CREATE TABLE IF NOT EXISTS "settings" (
            "id" TEXT NOT NULL PRIMARY KEY,
            "siteName" TEXT NOT NULL DEFAULT 'Sahib Parfumeriya',
            "siteDescription" TEXT NOT NULL DEFAULT 'Premium Parfüm Mağazası',
            "contactEmail" TEXT NOT NULL DEFAULT 'info@sahibparfumeriya.az',
            "contactPhone" TEXT NOT NULL DEFAULT '+994 50 123 45 67',
            "address" TEXT NOT NULL DEFAULT 'Bakı şəhəri, Nərimanov rayonu',
            "currency" TEXT NOT NULL DEFAULT 'AZN',
            "taxRate" REAL NOT NULL DEFAULT 18.0,
            "deliveryCost" REAL NOT NULL DEFAULT 10.0,
            "freeDeliveryThreshold" REAL NOT NULL DEFAULT 100.0,
            "maintenanceMode" BOOLEAN NOT NULL DEFAULT false,
            "allowRegistration" BOOLEAN NOT NULL DEFAULT true,
            "requireEmailVerification" BOOLEAN NOT NULL DEFAULT true,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL
          )
        `
        
        console.log('✅ Settings table created with raw SQL')
        
        // Now create default settings
        const settings = await prisma.settings.create({
          data: {
            siteName: 'SAHIB perfumery & cosmetics',
            siteDescription: 'Premium Parfüm Mağazası',
            contactEmail: 'info@sahibparfum.az',
            contactPhone: '+994 51 366 66 63',
            address: 'Bakı şəhəri, Nərimanov rayonu',
            currency: 'AZN',
            taxRate: 18.0,
            deliveryCost: 10.0,
            freeDeliveryThreshold: 100.0,
            maintenanceMode: false,
            allowRegistration: true,
            requireEmailVerification: true
          }
        })
        
        console.log('✅ Default settings created')
        console.log('Settings ID:', settings.id)
        
      } catch (sqlError) {
        console.error('❌ SQL Error:', sqlError)
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

createSettingsTable()
  .then(() => {
    console.log('🎉 Settings table creation completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
