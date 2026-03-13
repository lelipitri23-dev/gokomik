import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const payload = JSON.parse(rawBody);

    if (payload.event_type !== 'CHECKOUT.ORDER.APPROVED' && payload.event_type !== 'PAYMENT.CAPTURE.COMPLETED') {
      return NextResponse.json({ received: true });
    }

    const resource = payload.resource;
    const purchaseUnits = resource.purchase_units || [];

    if (purchaseUnits.length > 0) {
      const customId = purchaseUnits[0].custom_id;
      const amount = purchaseUnits[0].amount.value;
      const desc = purchaseUnits[0].description;

      console.log(`✅ [PAYPAL WEBHOOK] Processing Payment for User: ${customId}`);
      console.log(`Amount: $${amount} | Desc: ${desc}`);

    }

    return NextResponse.json({ success: true, message: 'Webhook processed successfully' });
  } catch (err) {
    console.error('❌ [PAYPAL WEBHOOK ERROR]:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
