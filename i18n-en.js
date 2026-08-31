/*
  Bolt Paint · i18n ES → EN (runtime)
  ------------------------------------
  Traductor en tiempo real que NO toca el código de la tienda: recorre el DOM
  (textos + placeholder/title/aria-label/alt) y traduce con el diccionario D.
  Un MutationObserver traduce todo lo que la tienda genere después (carrito,
  checkout, cotizador de Proyectos, presupuesto PDF, toasts…).
  - Español por defecto. El botón flotante 🌐 cambia a inglés y se recuerda en
    localStorage (bp_lang).
  - Números se normalizan a "#" para que "8 cubeta(s) 19 L" case con
    "# cubeta(s) # L" y se reinyecten en el mismo orden.
  - API: window.bpI18n = { lang, set(l), t(str), html(str), locale(), apply(el) }
  Para agregar/corregir traducciones: editar D (clave = texto exacto en español,
  espacios colapsados; números → "#").
*/
(function(){
  'use strict';

  // ===================== DICCIONARIO =====================
  var D = {
    // --- Marca / navegación / hero ---
    "Bolt Paint — Pintura BPaint Depot · Mexicali & San Felipe":"Bolt Paint — BPaint Depot Paint · Mexicali & San Felipe",
    "Distribuidor oficial:":"Official distributor:",
    "Distribuidor oficial BPaint Depot":"Official BPaint Depot distributor",
    "Mexicali · San Felipe · B.C.":"Mexicali · San Felipe · B.C.",
    "Inicio":"Home","Colores":"Colors","Proyectos":"Projects","Herramientas":"Tools","Carrito":"Cart","Admin":"Admin",
    "🛒 Carrito":"🛒 Cart","🛒 Tu orden":"🛒 Your order","Productos":"Products","Producto":"Product","Entrega":"Delivery","Pago":"Payment",
    "🎨 Pintura americana 100% acrílica":"🎨 American 100% acrylic paint",
    "Más de 100 colores BPaint Depot al precio de distribuidor. Selecciona, paga y recibe en Mexicali o San Felipe.":"Over 100 BPaint Depot colors at distributor prices. Pick, pay and get it delivered in Mexicali or San Felipe.",
    "Ver colores → comprar":"See colors → buy","💧 Impermeabilizante":"💧 Waterproofing","💧 IMPERM":"💧 WATERPROOF",
    "🚚 Entrega a tu domicilio · Mexicali & San Felipe":"🚚 Home delivery · Mexicali & San Felipe",
    "Elige tu color":"Choose your color","Elige tu color.":"Choose your color.","Agrega y paga":"Add & pay","Recibe en casa":"Home delivery",
    "Selecciona litros, galones o cubetas. Paga con tarjeta, transferencia o efectivo.":"Pick liters, gallons or buckets. Pay by card, bank transfer or cash.",
    "Entrega a tu domicilio en Mexicali. También en San Felipe.":"Home delivery in Mexicali. San Felipe too.",
    "Nosotros lo entregamos.":"We deliver it.",
    "Confirma tu orden — recibes tu número de pedido por WhatsApp.":"Confirm your order — you get your order number by WhatsApp.",
    "⚡ Proyectos a tu medida":"⚡ Projects built for you",
    "Acabados profesionales y duraderos, con mantenimiento garantizado para espacios corporativos.":"Professional, long-lasting finishes with guaranteed maintenance for corporate spaces.",
    "Acabados profesionales, duraderos y con mantenimiento garantizado para espacios corporativos.":"Professional, long-lasting finishes with guaranteed maintenance for corporate spaces.",
    "Protección y durabilidad de grandes superficies, con soluciones de alto rendimiento.":"Protection and durability for large surfaces, with high-performance solutions.",
    "Protección y durabilidad de grandes superficies, con soluciones personalizadas de alto rendimiento.":"Protection and durability for large surfaces, with custom high-performance solutions.",
    "Impermeabilizante acrílico fibratado: protege de humedad, goteras y calor.":"Fiber-reinforced acrylic waterproofing: protects against moisture, leaks and heat.",
    "Entrar a la sección →":"Open section →","Comercial y Oficinas":"Commercial & Offices","Comercial/Oficinas":"Commercial/Offices",
    "Industrial":"Industrial","Naves industriales":"Industrial buildings","Naves Industriales":"Industrial Buildings",
    "Impermeabilización":"Waterproofing","Techos y losas":"Roofs and slabs",

    // --- Catálogo ---
    "Catálogo BPaint Depot":"BPaint Depot Catalog","+100 tonos BPaint Depot. Busca por nombre o categoría.":"100+ BPaint Depot shades. Search by name or category.",
    "Buscar color: Baby Blue, Teja, Salmon, Mostaza...":"Search color: Baby Blue, Teja, Salmon, Mostaza...",
    "⭐ Todas":"⭐ All","Todas":"All","Todos":"All","Línea":"Line","Cualquier color":"Any color",
    "🔵 Azul":"🔵 Blue","☕ Café":"☕ Brown","🟢 Verde":"🟢 Green","🟠 Naranja":"🟠 Orange","🟣 Morado":"🟣 Purple","⬜ Blanco":"⬜ White","🟤 Beige":"🟤 Beige","🩶 Gris":"🩶 Gray","🩷 Rosa":"🩷 Pink","🟡 Amarillo":"🟡 Yellow","⬛ Negro":"⬛ Black","🟧 Terracota":"🟧 Terracotta",
    "Azul":"Blue","azul":"blue","Café":"Brown","cafe":"brown","Verde":"Green","verde":"green","Naranja":"Orange","naranja":"orange","Morado":"Purple","morado":"purple","Blanco":"White","blanco":"white","Beige":"Beige","beige":"beige","Gris":"Gray","gris":"gray","Rosa":"Pink","rosa":"pink","Amarillo":"Yellow","amarillo":"yellow","Negro":"Black","negro":"black","Terracota":"Terracotta",
    "🔥 MAS VENDIDO":"🔥 BEST SELLER","🔥 Más Vendido":"🔥 Best Seller","💎 Premium":"💎 Premium","💎 PREMIUM":"💎 PREMIUM","🥇 Superior":"🥇 Superior","🥇 SUPERIOR":"🥇 SUPERIOR","🏷 Depot":"🏷 Depot","🏷 DEPOT":"🏷 DEPOT",
    "Litro":"Liter","Litros":"Liters","Litro (1L)":"Liter (1L)","Galón":"Gallon","Galones":"Gallons","Galón (~3.78L)":"Gallon (~3.78L)","Cubeta":"Bucket","Cubetas 19L":"19L Buckets","Cubeta (19L)":"Bucket (19L)","Cubeta (19 L)":"Bucket (19 L)",
    "Cubeta 19L · $1,109 c/u":"19L Bucket · $1,109 each","Galón 3.78L · $498 c/u":"3.78L Gallon · $498 each",
    "Litro 1L":"1L Liter","Galón 3.78L":"3.78L Gallon","Cubeta 19L":"19L Bucket","Cubeta 19 L":"19 L Bucket",
    "Ver todos →":"See all →","Colores en acción":"Colors in action","Colores Intensos":"Bold Colors","Colores Alternativos":"Alternative Colors","Color Mazapán":"Marzipan Color",
    "Tu carrito está vacío. Elige colores del catálogo.":"Your cart is empty. Pick colors from the catalog.",
    "Tu carrito está vacío.":"Your cart is empty.","Elige colores del catálogo.":"Pick colors from the catalog.",
    "Agrega colores del catálogo para comenzar.":"Add colors from the catalog to get started.",

    // --- Ficha técnica / impermeabilizante ---
    "Características Técnicas":"Technical Specifications","Ver hoja técnica →":"View data sheet →","Ver ficha técnica →":"View data sheet →",
    "100% acrílica vinílica base agua":"100% water-based vinyl acrylic",
    ", acabado satinado para interior y exterior. Resistente a la humedad, lavable y tallable, con excelente cobertura y nivelación para un acabado perfecto.":", satin finish for interior and exterior. Moisture resistant, washable and scrubbable, with excellent coverage and leveling for a perfect finish.",
    "🪣 Tipo de resina":"🪣 Resin type","100% Acrílica":"100% Acrylic","✨ Acabado / Brillo":"✨ Finish / Sheen","✨ Acabado":"✨ Finish","Satinado · 15–25":"Satin · 15–25","Satinado":"Satin",
    "🛢 Cobertura":"🛢 Coverage","40–45 m²/gal":"40–45 m²/gal","🌿 COV (bajo olor)":"🌿 VOC (low odor)","< 5 g/l":"< 5 g/l","⏱ Secado al tacto":"⏱ Touch dry","1 hora":"1 hour","🎨 Repintado":"🎨 Recoat","2 horas":"2 hours",
    "🏠 Interior y exterior":"🏠 Interior & exterior","💧 Resistente a la humedad":"💧 Moisture resistant","🧽 100% lavable y tallable":"🧽 100% washable & scrubbable","💪 Resistente a la abrasión":"💪 Abrasion resistant",
    "Superficies recomendadas":"Recommended surfaces","Metal · Madera · Concreto · Yeso · PVC · Ladrillo · Mampostería · Aluminio":"Metal · Wood · Concrete · Plaster · PVC · Brick · Masonry · Aluminum",
    "📄 Descargar hoja técnica (PDF)":"📄 Download data sheet (PDF)","📄 Descargar ficha técnica (PDF)":"📄 Download data sheet (PDF)","Ficha PT0030 · BPaint Satin":"Data sheet PT0030 · BPaint Satin",
    "Impermeabilizante acrílico fibratado base agua":"Water-based fiber-reinforced acrylic waterproofing",
    "(IMPERMASTER · No. IMP001), elaborado con resinas acrílicas y fibras sintéticas. Impermeabilidad y elasticidad para techos y losas: resiste movimientos normales de la construcción evitando filtraciones de humedad, y retarda la corrosión en superficies metálicas debidamente preparadas. Para cualquier tipo de clima.":"(IMPERMASTER · No. IMP001), made with acrylic resins and synthetic fibers. Waterproofing and elasticity for roofs and slabs: withstands normal building movement preventing moisture leaks, and slows corrosion on properly prepared metal surfaces. For any climate.",
    "🛢 Rendimiento (19 L)":"🛢 Coverage (19 L)","16–18 m² con tela":"16–18 m² with mesh","20 m² sin tela de refuerzo":"20 m² without reinforcing mesh","🤸 Elongación":"🤸 Elongation","2–3 horas":"2–3 hours","🎨 Recubrimiento":"🎨 Recoat","6–24 horas":"6–24 hours",
    "💧 Protege de humedad y goteras":"💧 Protects against moisture and leaks","🌡 Reduce la transmisión de calor (blanco)":"🌡 Reduces heat transfer (white)","☀️ Buena reflectividad a rayos UV (blanco)":"☀️ Good UV reflectivity (white)","🖌 Fácil de aplicar":"🖌 Easy to apply","🌿 Bajo VOC":"🌿 Low VOC",
    "Colores disponibles":"Available colors","Presentación y precio":"Size and price","🪣 Cubeta (19 L) —":"🪣 Bucket (19 L) —","Blanco · Gris · Terracota · disponible solo en cubeta de 19 L":"White · Gray · Terracotta · available only in 19 L bucket",
    "Usos recomendados":"Recommended uses",
    "Techos y losas de viviendas, oficinas, escuelas y edificios comerciales · Concreto · Lámina galvanizada · Fibrocemento · Ladrillo · Ductos. Se recomienda tela de refuerzo para garantizar el recubrimiento.":"Roofs and slabs of homes, offices, schools and commercial buildings · Concrete · Galvanized sheet · Fiber cement · Brick · Ducts. Reinforcing mesh is recommended to guarantee the coating.",
    "🛒 Comprar cubeta — $1,109":"🛒 Buy bucket — $1,109","🧮 Cotizar aplicación →":"🧮 Quote application →","Ficha IMP001 · Impermeabilizante Acrílico Fibratado":"Data sheet IMP001 · Fiber-Reinforced Acrylic Waterproofing","Ficha IMP001":"Data sheet IMP001",

    // --- Calculadora / comparador ---
    "📐 Calculadora":"📐 Calculator","¿Cuánta pintura necesitas?":"How much paint do you need?","Ancho (m)":"Width (m)","Largo (m)":"Length (m)","Alto (m)":"Height (m)","Ptas+Vents":"Doors+Windows",
    "Manos de pintura":"Coats of paint","1 mano":"1 coat","2 manos ✓":"2 coats ✓","3 manos":"3 coats","m² totales":"total m²","Sugerencia de compra":"Suggested purchase",
    "💰 Comparador de precios":"💰 Price comparison","¿Tu proveedor cobra más? Ingresa su precio y encuentra la mejor opción en Bolt Paint.":"Does your supplier charge more? Enter their price and find the best option at Bolt Paint.",
    "Precio de tu proveedor actual (ej: 350)":"Your current supplier's price (e.g. 350)","⚡ Comparar y ver opciones":"⚡ Compare and see options",
    "📌 Tu proveedor":"📌 Your supplier","🏆 Mejor precio":"🏆 Best price","🎨 Bolt Paint":"🎨 Bolt Paint","MXN por litro":"MXN per liter","MXN por galón":"MXN per gallon","MXN por cubeta 19L":"MXN per 19L bucket",
    "por litro":"per liter","por galón":"per gallon","por cubeta 19L":"per 19L bucket","Agregar al carrito →":"Add to cart →","🐾 Con":"🐾 With","ahorras":"you save",
    "por litro. 🚚 Entrega a tu domicilio · Mexicali & San Felipe.":"per liter. 🚚 Home delivery · Mexicali & San Felipe.",
    "por galón. 🚚 Entrega a tu domicilio · Mexicali & San Felipe.":"per gallon. 🚚 Home delivery · Mexicali & San Felipe.",
    "por cubeta 19L. 🚚 Entrega a tu domicilio · Mexicali & San Felipe.":"per 19L bucket. 🚚 Home delivery · Mexicali & San Felipe.",
    "⚠️ Ingresa el precio de tu proveedor":"⚠️ Enter your supplier's price","⚠️ Precio no disponible":"⚠️ Price not available",

    // --- Carrito / checkout ---
    "Continuar — Datos de entrega →":"Continue — Delivery details →","📍 Datos de entrega":"📍 Delivery details","Nombre completo *":"Full name *","WhatsApp / Teléfono *":"WhatsApp / Phone *","Dirección completa *":"Full address *",
    "Notas: horario, referencias, color favorito...":"Notes: schedule, landmarks, favorite color...","Entrega local":"Local delivery","Ir a pago →":"Go to payment →","← Volver":"← Back",
    "💳 Método de pago":"💳 Payment method","💳 Tarjeta":"💳 Card","🏦 Transf.":"🏦 Transfer","🏦 Transferencia bancaria":"🏦 Bank transfer","💵 Efectivo":"💵 Cash","💵 Efectivo / OXXO Pay":"💵 Cash / OXXO Pay",
    "Encriptación SSL. No guardamos datos de tarjeta.":"SSL encryption. We don't store card data.","Titular":"Cardholder","Vence":"Expires","MM/AA":"MM/YY",
    "Banco":"Bank","Monto exacto":"Exact amount","Copiar":"Copy",
    "① Transfiere el monto exacto a la CLABE indicada.":"① Transfer the exact amount to the CLABE shown.","② En el concepto escribe tu":"② In the reference write your","Número de Orden":"Order Number","③ 📲 Envía comprobante por WhatsApp al":"③ 📲 Send the receipt by WhatsApp to",
    "Deposita en cualquier OXXO con tu número de pedido.":"Pay at any OXXO with your order number.","Envía comprobante al (686) 262-5119. Preparamos tu pedido en 24h.":"Send the receipt to (686) 262-5119. We prepare your order within 24h.",
    "🧾 ¿Necesitas factura (CFDI)?":"🧾 Need an invoice (CFDI)?","Razón social":"Company name","Email para CFDI":"Email for CFDI","⚡ Confirmar orden":"⚡ Confirm order",
    "¡Pedido confirmado!":"Order confirmed!","Bolt Paint recibió tu orden. Te contactamos por WhatsApp para coordinar la entrega.":"Bolt Paint received your order. We'll contact you by WhatsApp to arrange delivery.",
    "📄 Descargar PDF del pedido":"📄 Download order PDF","Hacer otro pedido":"Place another order","📦 Ver mis pedidos":"📦 View my orders",
    "Orden":"Order","Cliente":"Customer","Dirección":"Address","Factura":"Invoice","Total":"Total","TOTAL":"TOTAL","Notas":"Notes","sin notas":"no notes",
    "Enviar mi orden por WhatsApp":"Send my order by WhatsApp",
    "⚠️ Completa nombre, teléfono y dirección":"⚠️ Fill in name, phone and address","⚠️ Carrito vacío":"⚠️ Cart is empty","⚠️ Completa el pago con tarjeta":"⚠️ Complete the card payment",
    "⚠️ Escribe el nombre del titular":"⚠️ Enter the cardholder name","⚠️ Número de tarjeta inválido":"⚠️ Invalid card number","⚠️ Fecha de vencimiento inválida":"⚠️ Invalid expiration date","⚠️ CVV inválido":"⚠️ Invalid CVV",
    "⚠️ Agrega al menos un color":"⚠️ Add at least one color","⚠️ Llama al (686) 262-5119 para precio":"⚠️ Call (686) 262-5119 for pricing","⚠️ Activa ventanas emergentes para el PDF":"⚠️ Allow pop-ups to open the PDF",
    "El pago no fue procesado. Intenta de nuevo.":"The payment was not processed. Please try again.","Tu pago está pendiente de confirmación. Te notificaremos por WhatsApp.":"Your payment is pending confirmation. We'll notify you by WhatsApp.",
    "Error al procesar el pago. Intenta de nuevo.":"Error processing the payment. Please try again.","Error de conexión. Intenta de nuevo.":"Connection error. Please try again.",
    "Tarjeta MP ✓":"MP Card ✓","Tarjeta MP":"MP Card","Tarjeta MP confirmado":"MP Card confirmed","Transferencia":"Bank transfer","Efectivo/OXXO":"Cash/OXXO","Tarjeta":"Card",

    // --- Rastreo / pedidos ---
    "📦 Rastrear pedido":"📦 Track order","📦 Rastrea tu pedido":"📦 Track your order","Ingresa tu nombre o número de pedido para ver el estado de tu orden.":"Enter your name or order number to see your order status.",
    "BPD-123456 o tu nombre":"BPD-123456 or your name","Rastrear":"Track","Buscar":"Search","⚠️ Escribe tu nombre o número de pedido":"⚠️ Enter your name or order number","🔄 Buscando...":"🔄 Searching...",
    "❌ No encontramos ningún pedido.":"❌ We couldn't find any order.","Verifica tu número de pedido o nombre.":"Check your order number or name.","Estado del pedido":"Order status",
    "Orden levantada":"Order placed","Levantada":"Placed","Validando":"Validating","Lista":"Ready","Listas":"Ready","Entregado":"Delivered","Entregadas":"Delivered","Nueva":"New","Nuevas":"New","Lista para entrega":"Ready for delivery",
    "🟠 Nueva":"🟠 New","🟡 Validando":"🟡 Validating","🟢 Lista":"🟢 Ready","🟢 Lista para entrega":"🟢 Ready for delivery","✅ Entregado":"✅ Delivered","✅ Entregada":"✅ Delivered","🟠 Nuevas":"🟠 New","🟢 Listas":"🟢 Ready","✅ Entregadas":"✅ Delivered",
    "📄 Descargar comprobante PDF":"📄 Download receipt PDF","✅ Entrega confirmada":"✅ Delivery confirmed","📭 No hay pedidos.":"📭 No orders.","No hay pedidos.":"No orders.",
    "Validar":"Validate","Validar disponibilidad →":"Validate availability →","Marcar lista para entrega →":"Mark ready for delivery →","✅ Entregar":"✅ Deliver","¿Confirmar entrega de":"Confirm delivery of","? Se registrará la fecha y hora.":"? Date and time will be recorded.",
    "📍 Datos de entrega":"📍 Delivery details","🎨 Productos":"🎨 Products","Color":"Color","Cant.":"Qty.","Subtotal":"Subtotal","Bolt Paint — Distribuidora BPaint Depot · Gracias por su preferencia":"Bolt Paint — BPaint Depot Distributor · Thank you for your business",
    "Distribuidor BPaint Depot · Mexicali & San Felipe · (686) 262-5119":"BPaint Depot Distributor · Mexicali & San Felipe · (686) 262-5119",

    // --- Admin dentro de la tienda ---
    "⚙️ Acceso Admin":"⚙️ Admin Access","Contraseña de administrador":"Administrator password","Acceder":"Sign in","❌ Contraseña incorrecta":"❌ Wrong password","⚙️ Panel Admin · Bolt Paint":"⚙️ Admin Panel · Bolt Paint","✕ Salir":"✕ Exit",
    "📋 Pedidos":"📋 Orders","💰 Precios":"💰 Prices","📊 Resumen":"📊 Summary","Total pedidos":"Total orders","Ingresos":"Revenue","Órdenes":"Orders",
    "💰 Precios actuales":"💰 Current prices","Edita directamente. Guarda para aplicar.":"Edit directly. Save to apply.","💾 Guardar precios":"💾 Save prices","✅ Actualizado":"✅ Updated",
    "📁 Subir lista de precios":"📁 Upload price list","Sube el CSV maestro. Los precios se actualizan al instante.":"Upload the master CSV. Prices update instantly.","Arrastra o toca para subir":"Drag or tap to upload",".csv · .xlsx · .xls":".csv · .xlsx · .xls",
    "🕐 Historial de actualizaciones":"🕐 Update history","No hay actualizaciones registradas.":"No updates recorded.","⚠️ Archivo vacío":"⚠️ Empty file","⚠️ Sin productos válidos":"⚠️ No valid products","NOMBRE":"NAME",
    "🔍 Buscar nombre, ID o teléfono...":"🔍 Search name, ID or phone...",

    // --- Cotizador de Proyectos ---
    "Paint · Proyectos":"Paint · Projects","✕ Volver a la tienda":"✕ Back to store","Arma tu cotización":"Build your quote",
    "Impermeabilizante acrílico fibratado (Ficha IMP001) para techos y losas: protección contra humedad, goteras y calor, con o sin tela de refuerzo.":"Fiber-reinforced acrylic waterproofing (Data sheet IMP001) for roofs and slabs: protection against moisture, leaks and heat, with or without reinforcing mesh.",
    "Selección y compra de pintura":"Paint selection and purchase","precio de línea":"list price","precio ref.":"ref. price",
    "Busca tu color; la calculadora te dice cuántas cubetas, galones y litros necesitas. Puedes agregar varios tonos.":"Find your color; the calculator tells you how many buckets, gallons and liters you need. You can add several shades.",
    "Buscar color por nombre…":"Search color by name…","Seleccionado:":"Selected:","🧮 Calculadora de pintura":"🧮 Paint calculator","Área (m²)":"Area (m²)","Manos":"Coats","Rendimiento (m²/L)":"Coverage (m²/L)",
    "+ Agregar este tono":"+ Add this shade","Preselección:":"Preselection:","cubeta(s) ·":"bucket(s) ·","galón(es) ·":"gallon(s) ·","cubeta(s) 19 L →":"19 L bucket(s) →",
    "litro(s) (cubre ~8.6 L) →":"liter(s) (covers ~8.6 L) →","· 40 m² × 2 manos ≈":"· 40 m² × 2 coats ≈","manos ≈":"coats ≈",
    "Impermeabilizante acrílico fibratado":"Fiber-reinforced acrylic waterproofing",
    "Elige color y sistema; la calculadora estima cuántas cubetas de 19 L necesitas para tu techo o losa. Disponible en cubeta de 19 L ($1,109 c/u) en Blanco, Gris y Terracota.":"Choose color and system; the calculator estimates how many 19 L buckets you need for your roof or slab. Available in 19 L bucket ($1,109 each) in White, Gray and Terracotta.",
    "Con tela de refuerzo (recomendado · rinde 16–18 m² por cubeta)":"With reinforcing mesh (recommended · covers 16–18 m² per bucket)","🧮 Calculadora de impermeabilizante":"🧮 Waterproofing calculator","Área de techo / losa (m²)":"Roof / slab area (m²)",
    "+ Agregar impermeabilizante":"+ Add waterproofing","· 80 m² · con tela de refuerzo ≈":"· 80 m² · with reinforcing mesh ≈","· 80 m² · sin tela de refuerzo ≈":"· 80 m² · without reinforcing mesh ≈",
    "Impermeabilizante Blanco":"White Waterproofing","Impermeabilizante Gris":"Gray Waterproofing","Impermeabilizante Terracota":"Terracotta Waterproofing",
    "· 100 m² · 6 cub · con tela":"· 100 m² · 6 bkt · with mesh","· 100 m² · 6 cub · sin tela":"· 100 m² · 6 bkt · without mesh","· 60 m² · 3 gal + 1 L":"· 60 m² · 3 gal + 1 L",
    "por cotizar (precio de lista próximamente)":"to be quoted (list price coming soon)","Por cotizar":"To be quoted","— por cotizar":"— to be quoted",
    "Servicio de aplicación":"Application service","Mano de obra por m². Sujeto a inspección. Se suma a la misma cotización.":"Labor per m². Subject to inspection. Added to the same quote.",
    "Incluir servicio de aplicación":"Include application service","Usar los m² de la calculadora (":"Use the calculator's m² (","m²)":"m²)","$/m² (fijo)":"$/m² (fixed)","$/m²":"$/m²","Subtotal:":"Subtotal:",
    "Resanación de superficies":"Surface repair","Estima áreas/secciones, detalla por tipo y deja comentarios. Se suma a la cotización.":"Estimate areas/sections, detail by type and leave comments. Added to the quote.",
    "Áreas / secciones estimadas":"Estimated areas / sections","Grietas y fisuras":"Cracks and fissures","Humedad y manchas":"Moisture and stains","Desconches y golpes":"Chips and dents","Juntas, molduras y plafón":"Joints, moldings and ceiling","Resane de yeso / tablaroca":"Plaster / drywall repair",
    "$120 c/u":"$120 each","$180 c/u":"$180 each","$90 c/u":"$90 each","$140 c/u":"$140 each","$160 c/u":"$160 each","c/u":"each",
    "Comentarios":"Comments","Ej. Humedad en muro norte, grietas en columna…":"E.g. Moisture on north wall, cracks in column…","reparaciones":"repairs",
    "Planes de mantenimiento":"Maintenance plans","¿Te interesa un plan con póliza de pintura? Se suma a la cotización.":"Interested in a plan with a paint warranty policy? Added to the quote.","Sí, me interesa un plan":"Yes, I'm interested in a plan",
    "Básico Anual":"Basic Annual","Corporativo":"Corporate","Premium":"Premium","Solo pintura.":"Paint only.","Pintura + servicio de pintado.":"Paint + painting service.","Pintura + pintado + aislamiento.":"Paint + painting + insulation.",
    "−15% pintura":"−15% paint","−15% pintura, aplicación":"−15% paint, application","−15% pintura, aplicación, aislamiento":"−15% paint, application, insulation",
    "Recubrimiento de aislamiento (Premium)":"Insulation coating (Premium)","Área aislamiento (m²)":"Insulation area (m²)",
    "Solicitud / igualación de pintura especial":"Special paint request / color matching","Solicita la igualación de uno o más tonos. Entre más datos, mejor iguala BPaint Depot.":"Request matching of one or more shades. The more details, the better BPaint Depot matches it.",
    "Nombre del tono":"Shade name","Ej. Azul Corporativo BP-Steel":"E.g. Corporate Blue BP-Steel","¿Otra marca?":"Another brand?","Ej. Comex / Sherwin":"E.g. Comex / Sherwin","Código en esa marca":"Code in that brand","Ej. 8021":"E.g. 8021",
    "Color aproximado":"Approximate color","¿Para qué se requiere? (selección múltiple)":"What is it for? (multiple selection)","Fachada / exterior":"Facade / exterior","Muros interiores":"Interior walls","Plafón / techo":"Ceiling / roof","Piso / tránsito":"Floor / traffic",
    "Estructura metálica":"Steel structure","Herrería / esmaltado":"Ironwork / enamel","Señalética / marcado":"Signage / marking","Zonas húmedas":"Wet areas","Otros":"Other","Otros: especifica…":"Other: specify…",
    "Durabilidad":"Durability","Estándar":"Standard","Alta":"High","Muy alta":"Very high","Intemperie severa":"Severe weather","Ubicación":"Location","Interior":"Interior","Exterior":"Exterior","Interior y exterior":"Interior and exterior",
    "Tipo de pintura":"Paint type","Vinílica":"Vinyl","Esmalte":"Enamel","No estoy seguro":"Not sure","Otros datos para BPaint Depot":"Other details for BPaint Depot","Acabado, brillo, resistencia química, etc.":"Finish, sheen, chemical resistance, etc.","+ Agregar solicitud":"+ Add request",
    "sin equivalencia":"no equivalent","durab.":"durab.","uso:":"use:",
    "Nota:":"Note:","importes de referencia. En el sitio, la cotización la revisa el administrador y el pago se valida en el servidor. La pre-propuesta no es comprobante fiscal.":"reference amounts. The quote is reviewed by the administrator and payment is validated on the server. The pre-proposal is not a tax receipt.",
    "Resumen de cotización":"Quote summary","Aún no agregas nada.":"Nothing added yet.","Total estimado":"Estimated total","Pintura":"Paint","Impermeabilizante":"Waterproofing","Aplicación":"Application","Resanación":"Repair","Aislamiento":"Insulation",
    "Desc. pintura":"Paint disc.","Desc. aplicación":"Application disc.","Desc. aislamiento":"Insulation disc.","Descuento plan":"Plan discount","rep.":"rep.",
    "Nombre / empresa":"Name / company","Requerido":"Required","WhatsApp / teléfono":"WhatsApp / phone","Requerido · 10 dígitos":"Required · 10 digits",
    "📝 Solicitar cotización + PDF":"📝 Request quote + PDF","💬 Enviar por WhatsApp":"💬 Send by WhatsApp","💬 WhatsApp":"💬 WhatsApp","⬇️ Descargar PDF":"⬇️ Download PDF",
    "Nombre y WhatsApp son obligatorios. Al enviar por WhatsApp se descarga el PDF del presupuesto para adjuntarlo al chat. Los precios son estimados y pueden variar según la visita de inspección en sitio. El pago con tarjeta/OXXO/SPEI se habilita al confirmar.":"Name and WhatsApp are required. When sending by WhatsApp the quote PDF is downloaded so you can attach it to the chat. Prices are estimates and may vary after the on-site inspection. Card/OXXO/SPEI payment is enabled upon confirmation.",
    "⚠️ Escribe tu nombre o empresa para la cotización.":"⚠️ Enter your name or company for the quote.","⚠️ Escribe un WhatsApp/teléfono válido (10 dígitos).":"⚠️ Enter a valid WhatsApp/phone (10 digits).",
    "⚠️ No se pudo guardar en la nube. Revisa tu conexión o envíala por WhatsApp.":"⚠️ Couldn't save to the cloud. Check your connection or send it by WhatsApp.","⚠️ Firebase no está listo aún; recarga la página e intenta de nuevo.":"⚠️ Firebase isn't ready yet; reload the page and try again.",
    "⚠️ Error al guardar:":"⚠️ Error saving:","⚠️ No se pudo generar el PDF automático; usa \"Solicitar cotización + PDF\".":"⚠️ Couldn't generate the PDF automatically; use \"Request quote + PDF\".",
    "Agrega al menos una pintura, impermeabilizante o servicio.":"Add at least one paint, waterproofing or service.","Agrega algo a la cotización primero.":"Add something to the quote first.","Indica un área mayor a 0.":"Enter an area greater than 0.","El área es muy pequeña; ajusta los m².":"The area is too small; adjust the m².",
    "enviada ✓ (ya aparece en tu admin)":"sent ✓ (already visible in your admin)","📎 PDF descargado:":"📎 PDF downloaded:","— adjúntalo en el chat de WhatsApp":"— attach it in the WhatsApp chat",
    "Sin plan":"No plan","Cotización (por definir)":"Quote (to be defined)","(Cotización de proyecto)":"(Project quote)",

    // --- Documento: Presupuesto / Pre-orden ---
    "PRESUPUESTO · PRE-ORDEN DE COMPRA":"QUOTE · PRE-PURCHASE ORDER","Documento no fiscal · sujeto a validación en sitio":"Non-tax document · subject to on-site validation",
    "Folio":"Folio","Fecha":"Date","Proyecto":"Project","Plan":"Plan","WhatsApp cliente":"Customer WhatsApp","Vigencia":"Valid for","15 días":"15 days",
    "1 · Partidas del presupuesto":"1 · Quote items","TOTAL EST.":"EST. TOTAL","Pago al confirmar":"Payment upon confirmation","Tarjeta · OXXO · SPEI":"Card · OXXO · SPEI","Igualaciones (por cotizar)":"Color matches (to be quoted)",
    "2 · Checklist de validación de área":"2 · Area validation checklist","Se completa en la visita de inspección; confirma m² y condiciones reales.":"Completed during the inspection visit; confirms actual m² and conditions.",
    "Medición real del área (m²)":"Actual area measurement (m²)","declarado: 120 m² · medido en sitio: ____ m²":"declared: 120 m² · measured on site: ____ m²",
    "Tipo de superficie":"Surface type","concreto · lámina galvanizada · fibrocemento · ladrillo · yeso/tablaroca · otro":"concrete · galvanized sheet · fiber cement · brick · plaster/drywall · other",
    "Estado general de la superficie":"General surface condition","limpia y firme · con recubrimiento anterior · requiere lavado/raspado":"clean and sound · previously coated · needs washing/scraping",
    "Pendientes y desagües funcionando":"Slopes and drains working","sin encharcamientos permanentes (techos y losas)":"no standing water (roofs and slabs)",
    "Humedad atrapada o filtraciones activas":"Trapped moisture or active leaks","requiere secado antes de aplicar":"must dry before application",
    "Accesos y altura de trabajo":"Access and working height","escalera · andamio · equipo de seguridad":"ladder · scaffold · safety equipment",
    "Instalaciones en el área":"Installations in the area","tinacos, minisplits, ductos, mobiliario a proteger o mover":"water tanks, mini-splits, ducts, furniture to protect or move",
    "Clima previsto para la aplicación":"Expected weather for application","sin lluvia en las siguientes 24 h · temperatura mayor a 10 °C":"no rain in the next 24 h · temperature above 10 °C",
    "3 · Validación de áreas a mejorar / resanar":"3 · Validation of areas to improve / repair","Lo declarado se valida en la inspección; el costo final del servicio se ajusta con esta tabla.":"Declared items are validated at inspection; the final service cost is adjusted with this table.",
    "Concepto":"Item","Declarado":"Declared","En sitio":"On site","$ ref.":"Ref. $","__ por validar":"__ to validate","1 (cliente)":"1 (customer)","Comentarios del cliente:":"Customer comments:",
    "Aviso:":"Notice:","los precios de este presupuesto son":"the prices in this quote are","estimados":"estimates","y pueden variar según la visita de inspección en sitio. El costo del servicio se confirma al llenar y firmar esta validación.":"and may vary after the on-site inspection visit. The service cost is confirmed once this validation is filled in and signed.",
    "El material impermeabilizante marcado \"por cotizar\" no está incluido en el total; te confirmaremos su precio con la lista vigente.":"Waterproofing material marked \"to be quoted\" is not included in the total; we will confirm its price with the current list.",
    "🛡 CARTA DE GARANTÍA":"🛡 SERVICE WARRANTY","DEL SERVICIO":"LETTER","Bolt Paint":"Bolt Paint",
    "garantiza el servicio de aplicación amparado por este folio, con base en las especificaciones técnicas de los productos utilizados:":"guarantees the application service covered by this folio, based on the technical specifications of the products used:",
    "Impermeabilización (Ficha IMP001 · IMPERMASTER):":"Waterproofing (Data sheet IMP001 · IMPERMASTER):",
    "impermeabilizante acrílico fibratado, elongación > 200 %, rendimiento 16–18 m²/cubeta con tela de refuerzo. Garantía de":"fiber-reinforced acrylic waterproofing, elongation > 200 %, coverage 16–18 m²/bucket with reinforcing mesh. Warranty of",
    "5 años con tela de refuerzo":"5 years with reinforcing mesh","3 años sin tela":"3 years without mesh","5 años":"5 years","3 años":"3 years","1 año":"1 year",
    ", contra filtraciones de humedad y desprendimiento del recubrimiento.":", against moisture leaks and coating detachment.",
    "Pintura (Ficha PT0030 · BPaint Satin):":"Paint (Data sheet PT0030 · BPaint Satin):",
    "100 % acrílica base agua, lavable y tallable, resistente a humedad y abrasión. Garantía de":"100 % water-based acrylic, washable and scrubbable, resistant to moisture and abrasion. Warranty of",
    "contra desprendimiento, caleo y desvanecimiento prematuro en aplicación a 2 manos.":"against peeling, chalking and premature fading with a 2-coat application.",
    "Servicio de aplicación:":"Application service:","mano de obra garantizada por":"labor guaranteed for","contra defectos de aplicación, utilizando materiales que cumplan la ficha técnica del fabricante.":"against application defects, using materials that meet the manufacturer's data sheet.",
    "Condiciones de validez:":"Conditions of validity:","Superficie preparada y resanes ejecutados según las secciones 2 y 3 de este documento.":"Surface prepared and repairs carried out according to sections 2 and 3 of this document.",
    "Aplicación realizada por personal de Bolt Paint respetando los tiempos de secado de ficha técnica (IMP001: 2–3 h al tacto, recubrimiento 6–24 h · PT0030: repintado a 2 h).":"Application performed by Bolt Paint staff respecting the data-sheet drying times (IMP001: 2–3 h touch dry, recoat 6–24 h · PT0030: recoat at 2 h).",
    "No cubre daños estructurales, movimientos de construcción que excedan la elongación del producto, granizo severo, ni modificaciones posteriores hechas por terceros.":"Does not cover structural damage, building movement exceeding the product's elongation, severe hail, or later modifications by third parties.",
    "Bolt Paint · Responsable del servicio":"Bolt Paint · Service manager","Cliente · Conformidad":"Customer · Acceptance",
    "Pre-orden sujeta a inspección y validación en sitio · Vigencia 15 días.":"Pre-order subject to on-site inspection and validation · Valid for 15 days.","¡Gracias por elegir Bolt Paint!":"Thank you for choosing Bolt Paint!","WhatsApp: 686 262 5119":"WhatsApp: 686 262 5119",

    // --- WhatsApp (cotizador) ---
    "*Bolt Paint · PRESUPUESTO / PRE-ORDEN DE COMPRA*":"*Bolt Paint · QUOTE / PRE-PURCHASE ORDER*","Total estimado:":"Estimated total:","Igualaciones:":"Color matches:",
    "Impermeabilizante: precio de material por confirmar (no incluido en el total).":"Waterproofing: material price to be confirmed (not included in the total).",
    "✅ Checklist de validación de área: pendiente (visita de inspección)":"✅ Area validation checklist: pending (inspection visit)","🔧 Resanes por validar en sitio para confirmar el costo del servicio":"🔧 Repairs to be validated on site to confirm the service cost",
    "🛡 Incluye carta de garantía del servicio":"🛡 Includes service warranty letter","con tela /":"with mesh /","sin tela":"without mesh","con tela":"with mesh",
    "📎 Adjunta a este chat el PDF descargado:":"📎 Attach the downloaded PDF to this chat:","Nota: precios estimados; pueden variar según la visita de inspección en sitio.":"Note: estimated prices; may vary after the on-site inspection visit.",
    "Cliente:":"Customer:","Folio:":"Folio:","Proyecto:":"Project:",

    // --- Misc / toasts ---
    "⏱ Validación en 1–2 horas hábiles · casteljesus77@gmail.com":"⏱ Validation within 1–2 business hours · casteljesus77@gmail.com",
    "Igualaciones":"Color matches","Cambiar a español":"Cambiar a español",
    "Cubeta agregado":"Bucket added","Galón agregado":"Gallon added","Litro agregado":"Liter added","agregado":"added","Agregado":"Added",
    "más caro":"more expensive","menos":"less","más":"more","Ahorras ↓":"You save ↓","x":"x"
  };

  // Reglas por patrón (textos con nombres de producto o folios variables)
  var RULES = [
    [/^✅ (.+) — (Cubeta|Galón|Litro) agregado$/, function(m){return '✅ '+m[1]+' — '+({Cubeta:'Bucket',Galón:'Gallon',Litro:'Liter'})[m[2]]+' added'}],
    [/^✅ (.+) agregado$/, function(m){return '✅ '+m[1]+' added'}],
    [/^Cotización (BP-[A-Z0-9]+) enviada ✓ \(ya aparece en tu admin\)$/, function(m){return 'Quote '+m[1]+' sent ✓ (already visible in your admin)'}],
    [/^📎 PDF descargado: (\S+) — adjúntalo en el chat de WhatsApp$/, function(m){return '📎 PDF downloaded: '+m[1]+' — attach it in the WhatsApp chat'}],
    [/^📎 Adjunta a este chat el PDF descargado: (\S+)$/, function(m){return '📎 Attach the downloaded PDF to this chat: '+m[1]}],
    [/^🎨 (\d+) solicitud\(es\) de igualación \(por cotizar\)$/, function(m){return '🎨 '+m[1]+' color match request(s) (to be quoted)'}],
    [/^Ahorras ↓ (\$[\d.,]+)$/, function(m){return 'You save ↓ '+m[1]}],
    [/^(\$[\d.,]+) más caro$/, function(m){return m[1]+' more expensive'}],
    [/^(\d+)% (menos|más)$/, function(m){return m[1]+'% '+(m[2]==='menos'?'less':'more')}],
    [/^(\d+) cubetas?( \+ \d+ gal(?:ón|ones))?$/, function(m){return m[1]+' bucket'+(m[1]==='1'?'':'s')+(m[2]?m[2].replace(/gal(ón|ones)/,'gal'):'')}],
    [/^(\d+) gal(ón|ones)$/, function(m){return m[1]+' gallon'+(m[1]==='1'?'':'s')}],
    [/^(\d+) litros?$/, function(m){return m[1]+' liter'+(m[1]==='1'?'':'s')}],
    [/^(\d+) galónes$/, function(m){return m[1]+' gallons'}],
    [/^(.+) x (\d+)$/, function(m){return m[1]+' x '+m[2]}],
    [/^(\d+) × (Cubeta 19L|Litro 1L|Galón)$/, function(m){return m[1]+' × '+({'Cubeta 19L':'19L Bucket','Litro 1L':'1L Liter','Galón':'Gallon'})[m[2]]}],
    [/^(\d+) x (Cubeta 19L|Litro 1L|Galón)$/, function(m){return m[1]+' x '+({'Cubeta 19L':'19L Bucket','Litro 1L':'1L Liter','Galón':'Gallon'})[m[2]]}],
    [/^📲 Te contactamos al (.+?) en breve\. \(686\) 262-5119 · Entrega a tu domicilio · Mexicali & San Felipe\.$/, function(m){return '📲 We\'ll contact you at '+m[1]+' shortly. (686) 262-5119 · Home delivery · Mexicali & San Felipe.'}],
    [/^📋 Te contactamos al (.+?) en breve\. \(686\) 262-5119 · Entrega a tu domicilio · Mexicali & San Felipe\.$/, function(m){return '📋 We\'ll contact you at '+m[1]+' shortly. (686) 262-5119 · Home delivery · Mexicali & San Felipe.'}],
    [/^Impermeabilizante (Blanco|Gris|Terracota)$/, function(m){return ({Blanco:'White',Gris:'Gray',Terracota:'Terracotta'})[m[1]]+' Waterproofing'}],
    [/^Impermeabilizante IMP001 (Blanco|Gris|Terracota)$/, function(m){return 'Waterproofing IMP001 '+({Blanco:'White',Gris:'Gray',Terracota:'Terracotta'})[m[1]]}],
    [/^(\d+) (ene|feb|mar|abr|may|jun|jul|ago|sep|oct|nov|dic) (\d{4})$/, function(m){return ({ene:'Jan',feb:'Feb',mar:'Mar',abr:'Apr',may:'May',jun:'Jun',jul:'Jul',ago:'Aug',sep:'Sep',oct:'Oct',nov:'Nov',dic:'Dec'})[m[2]]+' '+m[1]+', '+m[3]}],
    [/^· (\d+) m² · con tela de refuerzo ≈$/, function(m){return '· '+m[1]+' m² · with reinforcing mesh ≈'}],
    [/^· (\d+) m² · sin tela de refuerzo ≈$/, function(m){return '· '+m[1]+' m² · without reinforcing mesh ≈'}],
    [/^· (\d+) m² · (\d+) cub · (con|sin) tela$/, function(m){return '· '+m[1]+' m² · '+m[2]+' bkt · '+(m[3]==='con'?'with':'without')+' mesh'}],
    [/^(\d+) cub · (\d+) m²$/, function(m){return m[1]+' bkt · '+m[2]+' m²'}],
    [/^(\d+) cub · (\d+) m² · (con|sin) tela de refuerzo · \$([\d.,]+) c\/u$/, function(m){return m[1]+' bkt · '+m[2]+' m² · '+(m[3]==='con'?'with':'without')+' reinforcing mesh · $'+m[4]+' each'}],
    [/^(Litro 1L|Galón 3\.78L|Cubeta 19L) · \$([\d.,]+) c\/u$/, function(m){return ({'Litro 1L':'1L Liter','Galón 3.78L':'3.78L Gallon','Cubeta 19L':'19L Bucket'})[m[1]]+' · $'+m[2]+' each'}],
    [/^(Pintura|Impermeabilizante|Aplicación|Resanación|Aislamiento) · (.+)$/, function(m){return ({Pintura:'Paint',Impermeabilizante:'Waterproofing',Aplicación:'Application',Resanación:'Repair',Aislamiento:'Insulation'})[m[1]]+' · '+m[2].replace(/\bcub\b/g,'bkt')}],
    [/^(\d+\/\d+\/\d+) · (.+)$/, function(m){var t=translateText(m[2]);return m[1]+' · '+(t===null?m[2]:t)}],
    [/^¿Confirmar entrega de (.+)\? Se registrará la fecha y hora\.$/, function(m){return 'Confirm delivery of '+m[1]+'? Date and time will be recorded.'}],
    [/^Hola Bolt Paint, acabo de realizar mi pedido:$/, function(){return 'Hi Bolt Paint, I just placed my order:'}],
    [/^Orden: (.+)$/, function(m){return 'Order: '+m[1]}],
    [/^Dirección: (.+)$/, function(m){return 'Address: '+m[1]}],
    [/^Pago: Tarjeta MP confirmado$/, function(){return 'Payment: MP Card confirmed'}],
    [/^Total: (.+)$/, function(m){return 'Total: '+m[1]}],
    [/^Tarjeta ••••(\S+)$/, function(m){return 'Card ••••'+m[1]}],
    [/^(lunes|martes|miércoles|jueves|viernes|sábado|domingo), (\d+) de (enero|febrero|marzo|abril|mayo|junio|julio|agosto|septiembre|octubre|noviembre|diciembre) de (\d{4})$/, function(m){
      var D7={lunes:'Monday',martes:'Tuesday','miércoles':'Wednesday',jueves:'Thursday',viernes:'Friday','sábado':'Saturday',domingo:'Sunday'};
      var M12={enero:'January',febrero:'February',marzo:'March',abril:'April',mayo:'May',junio:'June',julio:'July',agosto:'August',septiembre:'September',octubre:'October',noviembre:'November',diciembre:'December'};
      return D7[m[1]]+', '+M12[m[3]]+' '+m[2]+', '+m[4]}]
  ];

  // ===================== MOTOR =====================
  var NUM = /\d+(?:[.,]\d+)*/g;
  function collapse(s){return s.replace(/\s+/g,' ').trim()}
  function normKey(s){return collapse(s).replace(NUM,'#')}
  var DN = {};
  Object.keys(D).forEach(function(k){DN[normKey(k)] = D[k]});

  function translateText(raw){
    if(!raw) return null;
    var s = collapse(raw);
    if(!s || !/[A-Za-zÁÉÍÓÚáéíóúñÑ]/.test(s)) return null;
    // 1) exacto
    if(D.hasOwnProperty(s)) return D[s];
    // 2) normalizado por números
    var nk = normKey(s);
    if(DN.hasOwnProperty(nk)){
      var nums = s.match(NUM) || [];
      var out = DN[nk].replace(NUM,'#');
      var i = 0;
      out = out.replace(/#/g, function(){ return i < nums.length ? nums[i++] : '#'; });
      if(nums.length === (DN[nk].replace(NUM,'#').match(/#/g)||[]).length) return out;
      return DN[nk]; // conteo distinto: usar traducción tal cual
    }
    // 3) reglas
    for(var r=0;r<RULES.length;r++){
      var rule = RULES[r]; if(!rule[1]) continue;
      var m = s.match(rule[0]); if(m) return rule[1](m);
    }
    // 4) sufijo/prefijo de puntuación (":" o "…")
    var m2 = s.match(/^(.*?)([:…]+)$/);
    if(m2 && D.hasOwnProperty(m2[1])) return D[m2[1]]+m2[2];
    // 5) segmentos separados por " · " (p. ej. "Vinílica · Interior · durab. Estándar · uso: —")
    if(s.indexOf(' · ') > -1){
      var segs = s.split(' · '), changed = false;
      for(var k=0;k<segs.length;k++){ var ts = translateText(segs[k]); if(ts !== null && ts !== segs[k]){ segs[k] = ts; changed = true; } }
      if(changed) return segs.join(' · ');
    }
    return null;
  }

  // Traducir un string preservando espacios de borde
  function tr(raw){
    var t = translateText(raw); if(t === null) return null;
    var lead = (raw.match(/^\s*/)||[''])[0], tail = (raw.match(/\s*$/)||[''])[0];
    return lead + t + tail;
  }

  var lang = 'es';
  try { lang = localStorage.getItem('bp_lang') || 'es'; } catch(e){}
  var textMem = new WeakMap();  // textNode -> {es, en}
  var attrMem = new WeakMap();  // element -> {attr: {es, en}}
  var ATTRS = ['placeholder','title','aria-label','alt','data-tip'];
  var SKIP = {SCRIPT:1,STYLE:1,NOSCRIPT:1,TEMPLATE:1,CODE:1,PRE:1};

  function applyTextNode(n){
    var v = n.nodeValue; if(!v) return;
    var mem = textMem.get(n);
    if(lang === 'en'){
      if(mem && v === mem.en) return;            // ya traducido
      var src = (mem && v === mem.es) ? mem.es : v; // app cambió el texto → nuevo origen
      var t = tr(src); if(t === null) return;
      textMem.set(n,{es:src,en:t}); n.nodeValue = t;
    } else {
      if(mem && v === mem.en){ n.nodeValue = mem.es; }
    }
  }
  function applyAttrs(el){
    var mem = attrMem.get(el);
    for(var i=0;i<ATTRS.length;i++){
      var a = ATTRS[i]; if(!el.hasAttribute(a)) continue;
      var v = el.getAttribute(a); var am = mem && mem[a];
      if(lang === 'en'){
        if(am && v === am.en) continue;
        var src = (am && v === am.es) ? am.es : v;
        var t = tr(src); if(t === null) continue;
        if(!mem){mem = {}; attrMem.set(el,mem);} mem[a] = {es:src,en:t}; el.setAttribute(a,t);
      } else if(am && v === am.en){ el.setAttribute(a,am.es); }
    }
    if(el.tagName === 'INPUT' && (el.type === 'button' || el.type === 'submit') && el.value){
      var vm = mem && mem.__value;
      if(lang === 'en'){ if(!(vm && el.value === vm.en)){ var src2 = (vm && el.value === vm.es)?vm.es:el.value; var t2 = tr(src2); if(t2 !== null){ if(!mem){mem={};attrMem.set(el,mem);} mem.__value={es:src2,en:t2}; el.value = t2; } } }
      else if(vm && el.value === vm.en){ el.value = vm.es; }
    }
  }
  function applyTree(root){
    if(!root) return;
    if(root.nodeType === 3){ if(root.parentNode && !SKIP[root.parentNode.nodeName]) applyTextNode(root); return; }
    if(root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
    if(root.nodeType === 1){ if(SKIP[root.nodeName]) return; applyAttrs(root); }
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, null);
    var n;
    while((n = w.nextNode())){
      if(n.nodeType === 1){ if(SKIP[n.nodeName]) continue; applyAttrs(n); }
      else if(n.parentNode && !SKIP[n.parentNode.nodeName]) applyTextNode(n);
    }
  }
  var titleMem = null;
  function applyTitle(){
    if(lang === 'en'){ var t = translateText(document.title); if(t){ titleMem = {es:document.title,en:t}; document.title = t; } }
    else if(titleMem && document.title === titleMem.en){ document.title = titleMem.es; }
  }
  function applyAll(){
    document.documentElement.lang = lang;
    applyTitle();
    applyTree(document.body);
    updateButton();
  }

  // Observer: traduce lo que la tienda genera después
  var obs = null;
  function startObserver(){
    if(obs || !window.MutationObserver) return;
    obs = new MutationObserver(function(recs){
      if(lang !== 'en') return;
      for(var i=0;i<recs.length;i++){
        var r = recs[i];
        if(r.type === 'childList'){ for(var j=0;j<r.addedNodes.length;j++) applyTree(r.addedNodes[j]); }
        else if(r.type === 'characterData'){ applyTextNode(r.target); }
        else if(r.type === 'attributes'){ if(r.target.nodeType === 1) applyAttrs(r.target); }
      }
    });
    obs.observe(document.documentElement, {childList:true, subtree:true, characterData:true, attributes:true, attributeFilter:ATTRS});
  }

  // ===================== BOTÓN =====================
  var btn = null;
  function updateButton(){
    if(!btn) return;
    btn.textContent = lang === 'en' ? '🌐 ES' : '🌐 EN';
    btn.title = lang === 'en' ? 'Cambiar a español' : 'Switch to English';
    btn.setAttribute('aria-label', btn.title);
  }
  function mountButton(){
    if(btn || !document.body) return;
    var st = document.createElement('style');
    st.textContent = '#bpLangBtn{position:fixed;left:14px;bottom:78px;z-index:950;background:#0B0B0C;color:#fff;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:9px 14px;font:700 13px/1 "Archivo",system-ui,sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.35);letter-spacing:.3px;transition:transform .12s,background .12s}#bpLangBtn:hover{background:#F47A00;color:#1a0f00;transform:translateY(-1px)}@media print{#bpLangBtn{display:none!important}}';
    document.head.appendChild(st);
    btn = document.createElement('button');
    btn.id = 'bpLangBtn'; btn.type = 'button';
    btn.setAttribute('data-i18n-skip','1');
    btn.onclick = function(){ setLang(lang === 'en' ? 'es' : 'en'); };
    document.body.appendChild(btn);
    updateButton();
  }

  function setLang(l){
    lang = (l === 'en') ? 'en' : 'es';
    try { localStorage.setItem('bp_lang', lang); } catch(e){}
    applyAll();
    if(lang === 'en') startObserver();
    try { window.dispatchEvent(new CustomEvent('bp:lang', {detail:{lang:lang}})); } catch(e){}
  }

  // ===================== API =====================
  window.bpI18n = {
    get lang(){ return lang; },
    set: setLang,
    t: function(s){ if(lang !== 'en') return s; var t = tr(String(s)); return t === null ? s : t; },
    html: function(htmlStr){
      if(lang !== 'en') return htmlStr;
      var tpl = document.createElement('template'); tpl.innerHTML = htmlStr;
      applyTree(tpl.content); return tpl.innerHTML;
    },
    apply: function(el){ if(lang === 'en') applyTree(el || document.body); },
    locale: function(){ return lang === 'en' ? 'en-US' : 'es-MX'; },
    dict: D
  };
  // atajo global para alerts/mensajes
  window.bpT = window.bpI18n.t;

  function init(){
    mountButton();
    if(lang === 'en'){ applyAll(); startObserver(); }
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
