// Mercado Pago — Checkout Pro
(function(){
  window.addEventListener("load", function(){

    // Detectar regreso desde Mercado Pago
    var urlParams = new URLSearchParams(window.location.search);
    var mpStatus = urlParams.get("status");
    var mpPaymentId = urlParams.get("payment_id");

    if(mpStatus){
      window.history.replaceState({}, document.title, window.location.pathname);

      if(mpStatus === "approved"){
        var pendingOrder = localStorage.getItem("bpd_pending_order");
        if(pendingOrder){
          var ord = JSON.parse(pendingOrder);
          ord.pago = "Tarjeta MP \u2713";
          ord.mpPaymentId = mpPaymentId;
          ord.status = "nueva";

          var orders = JSON.parse(localStorage.getItem("bpd_ord")||"[]");
          orders.unshift(ord);
          localStorage.setItem("bpd_ord", JSON.stringify(orders));
          localStorage.removeItem("bpd_pending_order");

          if(window.saveOrderToFirebase){
            window.saveOrderToFirebase(ord).then(function(fbId){
              if(fbId){
                ord.fbId = fbId;
                orders[0].fbId = fbId;
                localStorage.setItem("bpd_ord", JSON.stringify(orders));
              }
            });
          }

          setTimeout(function(){
            if(typeof updCounters === "function") updCounters();

            var fact = ord.factura || null;
            var fRow = fact
              ? '<div class="succ-row"><span>Factura</span><strong>'+fact.rfc+'</strong></div>'
              : '';

            // Mensaje WhatsApp prellenado
            var waMsg = encodeURIComponent(
              "Hola Bolt Paint, acabo de realizar mi pedido:\n" +
              "Orden: " + ord.id + "\n" +
              "Total: $" + ord.total.toLocaleString() + " MXN\n" +
              "Dirección: " + ord.direccion + "\n" +
              "Pago: Tarjeta MP confirmado"
            );
            var waUrl = "https://wa.me/526862625119?text=" + waMsg;

            document.getElementById("succCard").innerHTML =
              '<div class="succ-row"><span>Orden</span><strong>'+ord.id+'</strong></div>'+
              '<div class="succ-row"><span>Cliente</span><strong>'+ord.nombre+'</strong></div>'+
              '<div class="succ-row"><span>WhatsApp</span><strong>'+ord.telefono+'</strong></div>'+
              '<div class="succ-row"><span>Dirección</span><strong>'+ord.direccion+'</strong></div>'+
              '<div class="succ-row"><span>Pago</span><strong style="color:var(--gn)">'+ord.pago+'</strong></div>'+
              fRow+
              '<div class="succ-row"><span>Total</span><strong style="color:var(--or);font-size:16px">$'+ord.total.toLocaleString()+' MXN</strong></div>'+
              '<div style="margin-top:10px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.2);border-radius:10px;padding:9px;font-size:11px;color:var(--gn);line-height:1.5;">'+
              '📋 Te contactamos al '+ord.telefono+' en breve. (686) 262-5119 · Entrega a tu domicilio · Mexicali & San Felipe.</div>'+
              '<a href="'+waUrl+'" target="_blank" style="display:flex;align-items:center;justify-content:center;gap:8px;background:#25d366;border-radius:10px;padding:11px;text-decoration:none;font-size:14px;font-weight:500;color:#fff;margin-top:10px;">'+
              '<svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>'+
              'Enviar mi orden por WhatsApp</a>';

            if(typeof closeCart === "function") closeCart();
            document.getElementById("succScreen").classList.add("open");

            if(typeof cart !== "undefined") cart.length = 0;
            if(typeof szMap !== "undefined") szMap.length = 0;
            if(typeof updCart === "function") updCart();

          }, 500);
        }

      } else if(mpStatus === "failure"){
        setTimeout(function(){
          alert("El pago no fue procesado. Intenta de nuevo.");
        }, 500);

      } else if(mpStatus === "pending"){
        setTimeout(function(){
          alert("Tu pago está pendiente de confirmación. Te notificaremos por WhatsApp.");
        }, 500);
      }
    }

    var originalSetPay = window.setPay;
    window.setPay = function(m){
      if(originalSetPay) originalSetPay(m);
    };
    window.valPay = function(){ return true; };

    window.checkout = function(){
      var nom = (document.getElementById("fNombre")||{}).value||"";
      var tel = (document.getElementById("fTel")||{}).value||"";
      var dir = (document.getElementById("fDir")||{}).value||"";

      if(!nom||!tel||!dir){
        if(typeof toast==="function") toast("⚠️ Completa nombre, teléfono y dirección");
        return;
      }
      if(!cart||!cart.length){
        if(typeof toast==="function") toast("⚠️ Carrito vacío");
        return;
      }

      var tot = cart.reduce(function(s,i){ return s+(i.pr*i.qty); }, 0);
      var oid = "BPD-"+Date.now().toString().slice(-6);
      var ciudad = (document.getElementById("fCiudad")||{}).value||"Mexicali";

      var ord = {
        id: oid,
        nombre: nom,
        telefono: tel,
        direccion: dir+", "+ciudad,
        total: tot,
        fecha: new Date().toLocaleDateString("es-MX"),
        items: cart.slice(),
        status: "pendiente",
        pago: "Tarjeta MP"
      };
      localStorage.setItem("bpd_pending_order", JSON.stringify(ord));

      var items = cart.map(function(i){
        return {
          title: String(i.nombre || "Producto Bolt Paint"),
          quantity: Number(i.qty) || 1,
          unit_price: Number(i.pr) || 100,
          currency_id: "MXN"
        };
      });

      fetch("https://bolt-paint.vercel.app/api/mp-preference", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ items: items })
      })
      .then(function(r){ return r.json(); })
      .then(function(data){
        if(data.init_point){
          window.location.href = data.init_point;
        } else {
          alert("Error al procesar el pago. Intenta de nuevo.");
        }
      })
      .catch(function(e){
        console.error("MP Error:", e);
        alert("Error de conexión. Intenta de nuevo.");
      });
    };
  });
})();
