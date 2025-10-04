const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function addMetaColumns() {
  try {
    console.log('🔧 Adding meta columns to settings table...')
    
    // Check current settings
    const currentSettings = await prisma.settings.findFirst()
    
    if (currentSettings) {
      console.log('📊 Current settings found:', {
        id: currentSettings.id,
        siteName: currentSettings.siteName,
        hasMetaTitle: !!currentSettings.metaTitle,
        hasMetaDescription: !!currentSettings.metaDescription
      })
      
      // Update existing settings with default meta values
      const updatedSettings = await prisma.settings.update({
        where: { id: currentSettings.id },
        data: {
          metaTitle: currentSettings.metaTitle || 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
          metaDescription: currentSettings.metaDescription || 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət. Online parfüm alış-verişi üçün etibarlı platforma.',
          metaKeywords: currentSettings.metaKeywords || 'parfüm, ətir, sahib parfumeriya, online mağaza, parfüm alış-verişi',
          metaAuthor: currentSettings.metaAuthor || 'SAHIB perfumery & cosmetics',
          ogTitle: currentSettings.ogTitle || 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
          ogDescription: currentSettings.ogDescription || 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
          ogLocale: currentSettings.ogLocale || 'az_AZ',
          ogType: currentSettings.ogType || 'website',
          twitterCard: currentSettings.twitterCard || 'summary',
          twitterTitle: currentSettings.twitterTitle || 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
          twitterDescription: currentSettings.twitterDescription || 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.'
        }
      })
      
      console.log('✅ Settings updated with meta data')
      console.log('Updated settings:', {
        id: updatedSettings.id,
        metaTitle: updatedSettings.metaTitle,
        metaDescription: updatedSettings.metaDescription?.substring(0, 50) + '...',
        ogTitle: updatedSettings.ogTitle,
        twitterTitle: updatedSettings.twitterTitle
      })
      
    } else {
      console.log('❌ No settings found')
    }
    
  } catch (error) {
    console.error('❌ Error adding meta columns:', error)
    
    if (error.code === 'P2021') {
      console.log('🔧 Column does not exist, trying to add with raw SQL...')
      
      try {
        // Add meta columns with raw SQL
        await prisma.$executeRaw`
          ALTER TABLE "settings" 
          ADD COLUMN IF NOT EXISTS "metaTitle" TEXT,
          ADD COLUMN IF NOT EXISTS "metaDescription" TEXT,
          ADD COLUMN IF NOT EXISTS "metaKeywords" TEXT,
          ADD COLUMN IF NOT EXISTS "metaAuthor" TEXT,
          ADD COLUMN IF NOT EXISTS "ogTitle" TEXT,
          ADD COLUMN IF NOT EXISTS "ogDescription" TEXT,
          ADD COLUMN IF NOT EXISTS "ogLocale" TEXT,
          ADD COLUMN IF NOT EXISTS "ogType" TEXT,
          ADD COLUMN IF NOT EXISTS "twitterCard" TEXT,
          ADD COLUMN IF NOT EXISTS "twitterTitle" TEXT,
          ADD COLUMN IF NOT EXISTS "twitterDescription" TEXT
        `
        
        console.log('✅ Meta columns added with raw SQL')
        
        // Now update settings with default values
        const settings = await prisma.settings.findFirst()
        if (settings) {
          await prisma.settings.update({
            where: { id: settings.id },
            data: {
              metaTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
              metaDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət. Online parfüm alış-verişi üçün etibarlı platforma.',
              metaKeywords: 'parfüm, ətir, sahib parfumeriya, online mağaza, parfüm alış-verişi',
              metaAuthor: 'SAHIB perfumery & cosmetics',
              ogTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
              ogDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.',
              ogLocale: 'az_AZ',
              ogType: 'website',
              twitterCard: 'summary',
              twitterTitle: 'SAHIB perfumery & cosmetics - Premium Parfüm Mağazası',
              twitterDescription: 'Ən yaxşı parfüm markaları, sərfəli qiymətlər və keyfiyyətli xidmət.'
            }
          })
          
          console.log('✅ Default meta values added')
        }
        
      } catch (sqlError) {
        console.error('❌ SQL Error:', sqlError)
      }
    }
  } finally {
    await prisma.$disconnect()
  }
}

addMetaColumns()
  .then(() => {
    console.log('🎉 Meta columns addition completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
