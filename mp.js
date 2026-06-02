// Mercado Pago — script separado
// No modifica el index.html original
(function(){
  var MP_PUBLIC_KEY = "APP_USR-203cf0c4-bb9f-4efe-a0a4-d5dc36e187af";
  window.mpToken = null;
  window.mpLastFour = null;
  window.mpBrick = null;

  // Cargar SDK de Mercado Pago
  var sdkScript = document.createElement("script");
  sdkScript.src = "https://sdk.mercadopago.com/js/v2";
  sdkScript.onload = function(){ console.log("MP SDK listo"); };
  document.head.appendChild(sdkScript);

  function initMP(){
    if(typeof MercadoPago === "undefined") return;
    var psCard = document.getElementById("ps-card");
    if(!psCard) return;

    // Reemplazar contenido de la sección de tarjeta con el brick de MP
    psCard.innerHTML =
      '<div id="mp-loading" style="padding:14px;text-align:center;font-size:12px;color:var(--txt3)">Cargando formulario seguro...</div>' +
      '<div id="mp-brick-container"></div>' +
      '<div class="ssl-row" style="margin-top:8px"><span>🔒</span><span>Pago seguro · Mercado Pago</span></div>';

    if(window.mpBrick){ try{ window.mpBrick.unmount(); }catch(e){} window.mpBrick = null; }

    var tot = (typeof cart !== "undefined") ? cart.reduce(function(s,i){ return s+(i.precio*i.qty); }, 0) : 1;

    new MercadoPago(MP_PUBLIC_KEY, {locale:"es-MX"}).bricks().create("cardPayment","mp-brick-container",{
      initialization: { amount: tot||1 },
      customization: {
        visual: { style: { theme: "dark" } },
        paymentMethods: { creditCard: "all", debitCard: "all" }
      },
      callbacks: {
        onReady: function(){
          var l = document.getElementById("mp-loading");
          if(l) l.style.display = "none";
        },
        onSubmit: function(d){
          return new Promise(function(ok, fail){
            window.mpToken = d.token;
            window.mpLastFour = d.last_four_digits || "****";

            var tot2 = (typeof cart !== "undefined") ? cart.reduce(function(s,i){ return s+(i.precio*i.qty); }, 0) : 1;

            fetch("https://bolt-paint-5n2zvz10w-boltpaint.vercel.app/api/mp-payment", {
              method: "POST",
              headers: {"Content-Type":"application/json"},
              body: JSON.stringify({
                token: d.token,
                transaction_amount: tot2,
                description: "Bolt Paint - Pedido",
                installments: d.installments || 1,
                payment_method_id: d.payment_method_id,
                payer: { email: d.payer ? d.payer.email : "cliente@boltpaint.mx" }
              })
            })
            .then(function(r){ return r.json(); })
            .then(function(res){
              if(res.status === "approved" || res.status === "pending"){
                ok();
                if(typeof checkout === "function") checkout();
              } else {
                fail(new Error(res.status_detail || "rejected"));
              }
            })
            .catch(function(e){ fail(e); });
          });
        },
        onError: function(e){ console.error("MP:", e); }
      }
    }).then(function(b){ window.mpBrick = b; });
  }

  // Esperar a que la página cargue y luego interceptar setPay
  window.addEventListener("load", function(){
    var originalSetPay = window.setPay;
    window.setPay = function(m){
      if(originalSetPay) originalSetPay(m);
      if(m === "card"){
        window.mpToken = null;
        setTimeout(initMP, 300);
      }
    };
    // Parchar valPay para no validar campos manuales
    window.valPay = function(){ return true; };
  });
})();
