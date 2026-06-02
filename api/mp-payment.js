export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { token, transaction_amount, description, installments, payment_method_id, payer } = req.body;

    if (!token || !transaction_amount || !payment_method_id) {
      return res.status(400).json({ error: "Faltan datos requeridos" });
    }

    const mpResponse = await fetch("https://api.mercadopago.com/v1/payments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.MP_ACCESS_TOKEN,
        "X-Idempotency-Key": token + "-" + Date.now()
      },
      body: JSON.stringify({
        token,
        transaction_amount: Number(transaction_amount),
        description: description || "Bolt Paint - Pedido",
        installments: installments || 1,
        payment_method_id,
        payer: { email: payer?.email || "cliente@boltpaint.mx" }
      })
    });

    const data = await mpResponse.json();
    return res.status(200).json({
      status: data.status,
      status_detail: data.status_detail,
      id: data.id,
      transaction_amount: data.transaction_amount
    });

  } catch (err) {
    console.error("MP Payment error:", err);
    return res.status(500).json({ error: "Error interno del servidor" });
  }
}
