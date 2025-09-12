import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check if address belongs to user
    const address = await prisma.address.findFirst({
      where: {
        id: params.id,
        userId: user.id
      }
    })

    if (!address) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 })
    }

    // Unset all other default addresses
    await prisma.address.updateMany({
      where: {
        userId: user.id,
        isDefault: true
      },
      data: {
        isDefault: false
      }
    })

    // Set this address as default
    const updatedAddress = await prisma.address.update({
      where: { id: params.id },
      data: {
        isDefault: true
      }
    })

    return NextResponse.json(updatedAddress)
  } catch (error) {
    console.error('Set default address error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
