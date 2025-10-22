import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  volume?: string
}

interface OrderEmailData {
  orderId: string
  customerName: string
  customerEmail: string
  orderItems: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  deliveryAddress: string
  orderDate: Date
}

export async function sendOrderConfirmationEmail(orderData: OrderEmailData) {
  try {
    const emailHtml = generateOrderEmailTemplate(orderData)
    
    const { data, error } = await resend.emails.send({
      from: 'Sahib Parfumeriya <onboarding@resend.dev>',
      to: [orderData.customerEmail],
      subject: `Sifarişiniz təsdiqləndi - #${orderData.orderId}`,
      html: emailHtml,
    })

    if (error) {
      console.error('Email sending error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending error:', error)
    return { success: false, error }
  }
}

function generateOrderEmailTemplate(orderData: OrderEmailData): string {
  const formattedDate = orderData.orderDate.toLocaleDateString('az-AZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })

  return `
    <!DOCTYPE html>
    <html lang="az">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sifariş Təsdiqi</title>
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
        .order-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        .order-items {
          margin: 30px 0;
        }
        .item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 0;
          border-bottom: 1px solid #e9ecef;
        }
        .item:last-child {
          border-bottom: none;
        }
        .item-info {
          flex: 1;
        }
        .item-name {
          font-weight: 600;
          color: #2d3748;
        }
        .item-details {
          font-size: 14px;
          color: #6b7280;
          margin-top: 4px;
        }
        .item-price {
          font-weight: 600;
          color: #2563eb;
        }
        .totals {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 30px 0;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 8px 0;
        }
        .total-row.final {
          border-top: 2px solid #e9ecef;
          margin-top: 15px;
          padding-top: 15px;
          font-weight: bold;
          font-size: 18px;
          color: #2563eb;
        }
        .delivery-info {
          background: #e3f2fd;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #2563eb;
        }
        .footer {
          text-align: center;
          margin-top: 40px;
          padding-top: 20px;
          border-top: 1px solid #e9ecef;
          color: #6b7280;
          font-size: 14px;
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
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">SAHIB PARFUMERIYA</div>
          <p>Premium Parfüm Mağazası</p>
        </div>

        <h2>Hörmətli ${orderData.customerName},</h2>
        <p>Sifarişiniz uğurla qəbul edildi və hazırlanma prosesi başladı. Sifarişinizin təfərrüatları aşağıdadır:</p>

        <div class="order-info">
          <h3>Sifariş Məlumatları</h3>
          <p><strong>Sifariş Nömrəsi:</strong> #${orderData.orderId}</p>
          <p><strong>Sifariş Tarixi:</strong> ${formattedDate}</p>
          <p><strong>Status:</strong> Təsdiqləndi</p>
        </div>

        <div class="order-items">
          <h3>Sifariş Edilən Məhsullar</h3>
          ${orderData.orderItems.map(item => `
            <div class="item">
              <div class="item-info">
                <div class="item-name">${item.name}</div>
                <div class="item-details">
                  ${item.volume ? `Həcm: ${item.volume} | ` : ''}
                  Miqdar: ${item.quantity} ədəd
                </div>
              </div>
              <div class="item-price">${(item.price * item.quantity).toFixed(2)} ₼</div>
            </div>
          `).join('')}
        </div>

        <div class="totals">
          <div class="total-row">
            <span>Ara cəm:</span>
            <span>${orderData.subtotal.toFixed(2)} ₼</span>
          </div>
          <div class="total-row">
            <span>Çatdırılma:</span>
            <span>${orderData.shipping === 0 ? 'Pulsuz' : `${orderData.shipping.toFixed(2)} ₼`}</span>
          </div>
          <div class="total-row final">
            <span>Ümumi məbləğ:</span>
            <span>${orderData.total.toFixed(2)} ₼</span>
          </div>
        </div>

        <div class="delivery-info">
          <h3>Çatdırılma Ünvanı</h3>
          <p>${orderData.deliveryAddress}</p>
          <p><strong>Təxmini çatdırılma müddəti:</strong> 1-3 iş günü</p>
        </div>

        <div style="text-align: center;">
          <a href="https://sahibparfum.az/orders" class="button">Sifarişimi İzlə</a>
        </div>

        <div class="footer">
          <p>Suallarınız varsa, bizimlə əlaqə saxlayın:</p>
          <p>📧 info@sahibparfumeriya.az | 📞 +994 50 123 45 67</p>
          <p>Bizi seçdiyiniz üçün təşəkkür edirik!</p>
          <p><strong>Sahib Parfumeriya Komandası</strong></p>
        </div>
      </div>
    </body>
    </html>
  `
}
