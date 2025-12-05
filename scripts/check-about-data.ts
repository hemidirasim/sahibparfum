import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkAboutData() {
  try {
    const settings = await prisma.settings.findFirst()
    
    if (!settings) {
      console.log('❌ Settings tapılmadı!')
      return
    }

    console.log('📊 About məlumatları:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('Hero Title:', settings.aboutHeroTitle || '(boş)')
    console.log('Hero Description:', settings.aboutHeroDescription || '(boş)')
    console.log('Story Title:', settings.aboutStoryTitle || '(boş)')
    console.log('Story Content:', settings.aboutStoryContent ? settings.aboutStoryContent.substring(0, 100) + '...' : '(boş)')
    console.log('Stat 1:', settings.aboutStat1Value, '-', settings.aboutStat1Label)
    console.log('Stat 2:', settings.aboutStat2Value, '-', settings.aboutStat2Label)
    console.log('Stat 3:', settings.aboutStat3Value, '-', settings.aboutStat3Label)
    console.log('Stat 4:', settings.aboutStat4Value, '-', settings.aboutStat4Label)
    console.log('Value 1:', settings.aboutValue1Title, '-', settings.aboutValue1Description?.substring(0, 50))
    console.log('Value 2:', settings.aboutValue2Title, '-', settings.aboutValue2Description?.substring(0, 50))
    console.log('Value 3:', settings.aboutValue3Title, '-', settings.aboutValue3Description?.substring(0, 50))
    console.log('CTA Title:', settings.aboutCtaTitle || '(boş)')
    console.log('CTA Description:', settings.aboutCtaDescription || '(boş)')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
  } catch (error) {
    console.error('❌ Xəta:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkAboutData()

