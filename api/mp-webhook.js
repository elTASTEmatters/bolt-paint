export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { type, data } = req.body || {};

    if (type === "payment" && data?.id) {
      const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${data.id}`, {
        headers: {
          "Authorization": "Bearer " + process.env.MP_ACCESS_TOKEN
        }
      });
      const payment = await mpResponse.json();
      console.log("MP Webhook payment:", payment.status, payment.external_reference);
    }

    return res.status(200).json({ received: true });

  } catch (err) {
    console.error("MP Webhook error:", err);
    return res.status(200).json({ received: true });
  }
}
