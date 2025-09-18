import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email ünvanı tələb olunur' }, { status: 400 })
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json({ 
        success: true, 
        message: 'Əgər bu email ünvanı sistemdə qeydiyyatdadırsa, şifrə sıfırlama linki göndəriləcək' 
      })
    }

    // Generate reset token
    const resetToken = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    // Send reset email
    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/auth/reset-password?token=${resetToken}`
    
    const emailHtml = `
      <!DOCTYPE html>
      <html lang="az">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Şifrə Sıfırlama</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
          }
          .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #e9ecef;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .button {
            display: inline-block;
            background: #2563eb;
            color: white;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e9ecef;
            color: #6b7280;
            font-size: 14px;
          }
          .warning {
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            padding: 15px;
            border-radius: 6px;
            margin: 20px 0;
            color: #856404;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">SAHIB PARFUMERIYA</div>
            <p>Premium Parfüm Mağazası</p>
          </div>

          <h2>Hörmətli ${user.name || 'Müştəri'},</h2>
          <p>Hesabınız üçün şifrə sıfırlama tələbi aldıq. Əgər bu siz deyilsinizsə, bu email-i görmezdən gəlin.</p>

          <p>Şifrənizi sıfırlamaq üçün aşağıdakı düyməyə klik edin:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Şifrəni Sıfırla</a>
          </div>

          <div class="warning">
            <strong>Diqqət:</strong> Bu link 1 saat müddətində etibarlıdır. Müddət bitdikdən sonra yenidən şifrə sıfırlama tələbi göndərməlisiniz.
          </div>

          <p>Əgər düymə işləmirsə, aşağıdakı linki browser-ə kopyalayın:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>

          <div class="footer">
            <p>Bu email-i siz tələb etməmisinizsə, təhlükəsizlik üçün hesabınızın şifrəsini dəyişdirin.</p>
            <p>📧 info@sahibparfumeriya.az | 📞 +994 50 123 45 67</p>
            <p><strong>Sahib Parfumeriya Komandası</strong></p>
          </div>
        </div>
      </body>
      </html>
    `

    const { data, error } = await resend.emails.send({
      from: 'Sahib Parfumeriya <onboarding@resend.dev>',
      to: [email],
      subject: 'Şifrə Sıfırlama - Sahib Parfumeriya',
      html: emailHtml,
    })

    if (error) {
      console.error('Password reset email error:', error)
      return NextResponse.json({ error: 'Email göndərilərkən xəta baş verdi' }, { status: 500 })
    }

    console.log('Password reset email sent:', data)

    return NextResponse.json({ 
      success: true, 
      message: 'Şifrə sıfırlama linki email ünvanınıza göndərildi' 
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
