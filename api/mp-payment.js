exports.handler = async function(event, context) {

  // Solo aceptar POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  // CORS headers
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json"
  };

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const body = JSON.parse(event.body);
    const {
      token,
      transaction_amount,
      description,
      installments,
      payment_method_id,
      payer
    } = body;

    // Validar campos requeridos
    if (!token || !transaction_amount || !payment_method_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Faltan datos requeridos" })
      };
    }

    // Llamar a la API de MercadoPago
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
        payer: {
          email: payer?.email || "cliente@boltpaint.mx"
        }
      })
    });

    const data = await mpResponse.json();

    // Regresar solo lo necesario al frontend
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        status: data.status,
        status_detail: data.status_detail,
        id: data.id,
        transaction_amount: data.transaction_amount
      })
    };

  } catch (err) {
    console.error("MP Payment error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Error interno del servidor" })
    };
  }
};
