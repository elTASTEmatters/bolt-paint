export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { items, payer } = req.body;

    const mpResponse = await fetch("https://api.mercadopago.com/checkout/preferences", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + process.env.MP_ACCESS_TOKEN
      },
      body: JSON.stringify({
        items,
        payer,
        notification_url: "https://bolt-paint.vercel.app/api/mp-webhook",
        external_reference: "BOLTPAINT-" + Date.now(),
        back_urls: {
          success: "https://eltastematters.github.io/bolt-paint/",
          failure: "https://eltastematters.github.io/bolt-paint/",
          pending: "https://eltastematters.github.io/bolt-paint/"
        },
        auto_return: "approved"
      })
    });

    const data = await mpResponse.json();
    return res.status(200).json({ init_point: data.init_point, id: data.id });

  } catch (err) {
    console.error("MP Preference error:", err);
    return res.status(500).json({ error: "Error interno" });
  }
}
