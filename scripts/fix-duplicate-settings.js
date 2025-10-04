const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function fixDuplicateSettings() {
  try {
    console.log('🔍 Checking for duplicate settings records...')
    
    // Get all settings records
    const allSettings = await prisma.settings.findMany()
    
    console.log(`📊 Found ${allSettings.length} settings records:`)
    
    allSettings.forEach((setting, index) => {
      console.log(`${index + 1}. ID: ${setting.id}`)
      console.log(`   Site Name: ${setting.siteName}`)
      console.log(`   Phone: ${setting.contactPhone}`)
      console.log(`   Email: ${setting.contactEmail}`)
      console.log(`   Created: ${setting.createdAt}`)
      console.log(`   Updated: ${setting.updatedAt}`)
      console.log('---')
    })
    
    if (allSettings.length <= 1) {
      console.log('✅ No duplicates found. Only one settings record exists.')
      return
    }
    
    // Find the most recent/complete settings record
    const mostRecent = allSettings.reduce((latest, current) => {
      if (current.updatedAt > latest.updatedAt) {
        return current
      }
      return latest
    })
    
    console.log(`🎯 Keeping the most recent record: ${mostRecent.id}`)
    console.log(`   Updated: ${mostRecent.updatedAt}`)
    
    // Delete all other settings records
    const idsToDelete = allSettings
      .filter(setting => setting.id !== mostRecent.id)
      .map(setting => setting.id)
    
    if (idsToDelete.length > 0) {
      console.log(`🗑️ Deleting ${idsToDelete.length} duplicate records: ${idsToDelete.join(', ')}`)
      
      const deleteResult = await prisma.settings.deleteMany({
        where: {
          id: {
            in: idsToDelete
          }
        }
      })
      
      console.log(`✅ Deleted ${deleteResult.count} duplicate records`)
    }
    
    // Verify final result
    const finalSettings = await prisma.settings.findMany()
    console.log(`✅ Final result: ${finalSettings.length} settings record(s) remaining`)
    
    if (finalSettings.length === 1) {
      const remaining = finalSettings[0]
      console.log('📋 Remaining settings:')
      console.log(`   ID: ${remaining.id}`)
      console.log(`   Site Name: ${remaining.siteName}`)
      console.log(`   Phone: ${remaining.contactPhone}`)
      console.log(`   Email: ${remaining.contactEmail}`)
      console.log(`   Delivery Cost: ${remaining.deliveryCost}`)
      console.log(`   Free Delivery Threshold: ${remaining.freeDeliveryThreshold}`)
    }
    
  } catch (error) {
    console.error('❌ Error fixing duplicate settings:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixDuplicateSettings()
  .then(() => {
    console.log('🎉 Duplicate settings cleanup completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Fatal error:', error)
    process.exit(1)
  })
