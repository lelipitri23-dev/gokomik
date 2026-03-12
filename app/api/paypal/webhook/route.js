import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    // TODO: Verifikasi webhook signature PayPal (Opsional namun sangat direkomendasikan di Production)
    // Untuk referensi: https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature_post

    // Kita hanya mendengarkan event sukses pembayaran
    if (payload.event_type !== 'CHECKOUT.ORDER.APPROVED' && payload.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return NextResponse.json({ received: true });
    }

    const resource = payload.resource;
    const purchaseUnits = resource.purchase_units || [];
    
    if (purchaseUnits.length > 0) {
      const customId = purchaseUnits[0].custom_id; // Merupakan userId / UID dari pembeli
      const amount = purchaseUnits[0].amount.value; // USD Value "3.20", "6.40"
      const desc = purchaseUnits[0].description; // "Premium Paket 1 Tahun..."

      console.log(`✅ [PAYPAL WEBHOOK] Processing Payment for User: ${customId}`);
      console.log(`Amount: $${amount} | Desc: ${desc}`);

      // ==========================================
      // TODO: IMPLEMENTASI UPDATE KE DATABASE 
      // Contoh pseudocode:
      // await db.collection('users').doc(customId).update({
      //   isPremium: true,
      //   premiumExpiresAt: calculateNewExpiry(desc) 
      // });
      // ==========================================
    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('❌ [PAYPAL WEBHOOK ERROR]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
