// Mercado Pago — Checkout Pro
(function(){
  window.addEventListener("load", function(){
    var originalSetPay = window.setPay;
    window.setPay = function(m){
      if(originalSetPay) originalSetPay(m);
    };
    window.valPay = function(){ return true; };

    var originalCheckout = window.checkout;
    window.checkout = function(){
      var tot = (typeof cart !== "undefined") ? cart.reduce(function(s,i){ return s+(i.precio*i.qty); }, 0) : 100;
      var items = (typeof cart !== "undefined") ? cart.map(function(i){
        return {
          title: i.nombre || "Producto Bolt Paint",
          quantity: i.qty || 1,
          unit_price: i.precio || tot,
          currency_id: "MXN"
        };
      }) : [{ title: "Bolt Paint - Pedido", quantity: 1, unit_price: tot, currency_id: "MXN" }];

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
