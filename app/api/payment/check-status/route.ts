import { NextRequest, NextResponse } from 'next/server'
import { checkTransactionStatus } from '@/lib/united-payment-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { transactionId } = body

    if (!transactionId) {
      return NextResponse.json({ 
        error: 'Transaction ID is required' 
      }, { status: 400 })
    }

    
    const statusCheck = await checkTransactionStatus(transactionId)
    
    if (statusCheck.success) {
      return NextResponse.json({
        success: true,
        status: statusCheck.status,
        orderStatus: statusCheck.orderStatus,
        bankOrderId: statusCheck.bankOrderId,
        bankSessionId: statusCheck.bankSessionId
      })
    } else {
      return NextResponse.json({
        success: false,
        error: statusCheck.error
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Error checking transaction status:', error)
    return NextResponse.json({ 
      error: 'Failed to check transaction status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
