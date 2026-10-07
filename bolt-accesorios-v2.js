/*
  Bolt Paint · Productos y accesorios B-Roller (v2)
  -------------------------------------------------
  Módulo independiente: llena <section id="accesorios"> en index.html.
  - Catálogo: 17 productos / 64 claves de b-roller.com (fotos en /accesorios/*.webp).
  - Español e inglés: se dibuja en el idioma de window.bpI18n y se redibuja con el evento "bp:lang".
  - Compra: una clave CON precio se agrega al carrito normal del sitio (window.cart → Mercado Pago / SPEI).
  - Cotización: cualquier clave se puede mandar a cotizar; se guarda en Firestore con el mismo esquema
    de las cotizaciones de Proyectos (tipo:"cotizacion", origen:"accesorios") y se envía el PDF por WhatsApp.
  - PRECIOS: llenar el objeto PRICES (ID de la columna A del Excel → precio MXN por pieza).
    Clave sin precio = "Por cotizar" (solo cotización).
*/
(function(){
  'use strict';
  var WA_NUMBER='526862625119';
  var IMG_DIR='accesorios/';
  var PDF_LIB='html2pdf.bundle.min.js';

  /* ===================== PRECIOS (MXN por pieza) ===================== */
  var PRICES={
  };

  /* ===================== CATÁLOGO ===================== */
  var P=[{"id":"wp","cat":"rodillos","img":"white-premium","linea":{"es":"White Premium","en":"White Premium"},"nombre":{"es":"Rodillo White Premium","en":"White Premium Roller"},"sub":{"es":"Tejido de acrílico y nylon","en":"Woven acrylic and nylon blend"},"desc":{"es":"Felpa tejida de acrílico y nylon de alta calidad que suelta muy poca pelusa. La pintura fluye libre sobre la superficie, descarga más y deja el acabado más terso. Sus fibras acrílicas de alta densidad absorben más pintura y rinden más por pasada.","en":"High-quality woven acrylic and nylon blend that minimizes lint and gives a smoother finish. The fabric lets paint flow freely over the surface, releasing more paint and leaving the smoothest finish. Its high-density acrylic fibers absorb more paint for better productivity."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Largo","en":"Length"},{"es":"Felpa","en":"Nap"},{"es":"Superficie","en":"Surface"}],"vars":[{"clave":"3WV-1/4","cells":[{"es":"3\"","en":"3\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"3WV-1/4"},{"clave":"4WV-1/4","cells":[{"es":"4\"","en":"4\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"4WV-1/4"},{"clave":"9WV-1/4","cells":[{"es":"9\"","en":"9\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"9WV-1/4"},{"clave":"3WV-3/8","cells":[{"es":"3\"","en":"3\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"3WV-3/8"},{"clave":"4WV-3/8","cells":[{"es":"4\"","en":"4\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"4WV-3/8"},{"clave":"9WV-3/8","cells":[{"es":"9\"","en":"9\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"9WV-3/8"}]},{"id":"pw","cat":"rodillos","img":"poly-wool","linea":{"es":"Poly/Wool","en":"Poly/Wool"},"nombre":{"es":"Rodillo Poly/Wool","en":"Poly/Wool Roller"},"sub":{"es":"Mezcla de poliéster y lana","en":"Polyester and wool blend"},"desc":{"es":"Poliéster de alta densidad mezclado con lana de borrego: máximo rendimiento, gran capacidad de carga y excelente acabado. El poliéster da resistencia, la lana mejora el acabado y la absorción, y el núcleo de polipropileno lo hace muy durable.","en":"High-density polyester blended with sheep wool for maximum performance, huge capacity and an excellent finish. The polyester adds resistance, the wool improves finish and absorbency, and the polypropylene core provides high durability."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Largo","en":"Length"},{"es":"Felpa","en":"Nap"},{"es":"Superficie","en":"Surface"}],"vars":[{"clave":"3PW-3/8","cells":[{"es":"3\"","en":"3\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"3PW-3/8"},{"clave":"4PW-3/8","cells":[{"es":"4\"","en":"4\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"4PW-3/8"},{"clave":"9PW-3/8","cells":[{"es":"9\"","en":"9\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"9PW-3/8"},{"clave":"3PW-1/2","cells":[{"es":"3\"","en":"3\""},{"es":"1/2\"","en":"1/2\""},{"es":"Semirrugosa","en":"Semi-Rough"}],"sku":"3PW-1/2"},{"clave":"4PW-1/2","cells":[{"es":"4\"","en":"4\""},{"es":"1/2\"","en":"1/2\""},{"es":"Semirrugosa","en":"Semi-Rough"}],"sku":"4PW-1/2"},{"clave":"9PW-1/2","cells":[{"es":"9\"","en":"9\""},{"es":"1/2\"","en":"1/2\""},{"es":"Semirrugosa","en":"Semi-Rough"}],"sku":"9PW-1/2"}]},{"id":"mp","cat":"rodillos","img":"multiusos","linea":{"es":"Multipurpose","en":"Multipurpose"},"nombre":{"es":"Rodillo Multiusos","en":"Multipurpose Roller"},"sub":{"es":"Poliéster de alta densidad","en":"High-density polyester"},"desc":{"es":"Tela de poliéster de alta densidad que absorbe más pintura y cubre más superficie. Núcleo de polipropileno de alta resistencia. Para interiores y exteriores.","en":"High-density polyester fabric that absorbs more paint and covers more surface. High-strength polypropylene core. For interior and exterior use."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Largo","en":"Length"},{"es":"Felpa","en":"Nap"},{"es":"Superficie","en":"Surface"}],"vars":[{"clave":"3MP-1/4","cells":[{"es":"3\"","en":"3\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"3MP-1/4"},{"clave":"4MP-1/4","cells":[{"es":"4\"","en":"4\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"4MP-1/4"},{"clave":"9MP-1/4","cells":[{"es":"9\"","en":"9\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"9MP-1/4"},{"clave":"3MP-3/8","cells":[{"es":"3\"","en":"3\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"3MP-3/8"},{"clave":"4MP-3/8","cells":[{"es":"4\"","en":"4\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"4MP-3/8"},{"clave":"9MP-3/8","cells":[{"es":"9\"","en":"9\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"9MP-3/8"},{"clave":"3MP-1/2","cells":[{"es":"3\"","en":"3\""},{"es":"1/2\"","en":"1/2\""},{"es":"Semirrugosa","en":"Semi-Rough"}],"sku":"3MP-1/2"},{"clave":"4MP-1/2","cells":[{"es":"4\"","en":"4\""},{"es":"1/2\"","en":"1/2\""},{"es":"Semirrugosa","en":"Semi-Rough"}],"sku":"4MP-1/2"},{"clave":"9MP-1/2","cells":[{"es":"9\"","en":"9\""},{"es":"1/2\"","en":"1/2\""},{"es":"Semirrugosa","en":"Semi-Rough"}],"sku":"9MP-1/2"},{"clave":"3MP-3/4","cells":[{"es":"3\"","en":"3\""},{"es":"3/4\"","en":"3/4\""},{"es":"Rugosa","en":"Rough"}],"sku":"3MP-3/4"},{"clave":"4MP-3/4","cells":[{"es":"4\"","en":"4\""},{"es":"3/4\"","en":"3/4\""},{"es":"Rugosa","en":"Rough"}],"sku":"4MP-3/4"},{"clave":"9MP-3/4","cells":[{"es":"9\"","en":"9\""},{"es":"3/4\"","en":"3/4\""},{"es":"Rugosa","en":"Rough"}],"sku":"9MP-3/4"},{"clave":"9MP-1","cells":[{"es":"9\"","en":"9\""},{"es":"1\"","en":"1\""},{"es":"Extra rugosa","en":"Extra-Rough"}],"sku":"9MP-1"},{"clave":"9MP-1 1/4","cells":[{"es":"9\"","en":"9\""},{"es":"1 1/4\"","en":"1 1/4\""},{"es":"Extra rugosa","en":"Extra-Rough"}],"sku":"9MP-1 1/4"}]},{"id":"mpk","cat":"rodillos","img":"multipack","linea":{"es":"Multipacks","en":"Multipacks"},"nombre":{"es":"Multipack de rodillos","en":"Roller Multipack"},"sub":{"es":"Multiusos · Poly/Wool · White Premium","en":"Multipurpose · Poly/Wool · White Premium"},"desc":{"es":"Paquetes de repuestos de rodillo con felpa de 3/8\" para superficies semilisas, en las tres líneas: Multiusos, Poly/Wool y White Premium.","en":"Roller cover packs with 3/8\" nap for semi-smooth surfaces, in all three lines: Multipurpose, Poly/Wool and White Premium."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Largo","en":"Length"},{"es":"Felpa","en":"Nap"},{"es":"Línea","en":"Line"}],"vars":[{"clave":"3MP-382PK","sku":"3MP-382PK","cells":[{"es":"3\"","en":"3\""},{"es":"3/8\"","en":"3/8\""},{"es":"Multiusos","en":"Multipurpose"}]},{"clave":"4MP-382PK","sku":"4MP-382PK","cells":[{"es":"4\"","en":"4\""},{"es":"3/8\"","en":"3/8\""},{"es":"Multiusos","en":"Multipurpose"}]},{"clave":"9MP-383PK","sku":"9MP-383PK","cells":[{"es":"9\"","en":"9\""},{"es":"3/8\"","en":"3/8\""},{"es":"Multiusos","en":"Multipurpose"}]},{"clave":"9MP-386PK","sku":"9MP-386PK","cells":[{"es":"9\"","en":"9\""},{"es":"3/8\"","en":"3/8\""},{"es":"Multiusos","en":"Multipurpose"}]},{"clave":"9MP-383PK","sku":"9MP-383PK/PW","cells":[{"es":"9\"","en":"9\""},{"es":"3/8\"","en":"3/8\""},{"es":"Poly/Wool","en":"Poly/Wool"}]},{"clave":"9MP-383PK","sku":"9MP-383PK/WP","cells":[{"es":"9\"","en":"9\""},{"es":"3/8\"","en":"3/8\""},{"es":"White Premium","en":"White Premium"}]}]},{"id":"set","cat":"kits","img":"set-maneral-rodillo","linea":{"es":"Sets","en":"Sets"},"nombre":{"es":"Set maneral + rodillo","en":"Frame + Roller Set"},"sub":{"es":"Todas las medidas de felpa","en":"Every nap size"},"desc":{"es":"Maneral semiprofesional con rodillo de 9\", disponible en todas las felpas para cualquier superficie.","en":"Semi-professional frame with a 9\" roller, available in every nap for all surfaces."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Largo","en":"Length"},{"es":"Felpa","en":"Nap"},{"es":"Superficie","en":"Surface"}],"vars":[{"clave":"9MP-1425","cells":[{"es":"9\"","en":"9\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"9MP-1425"},{"clave":"9MP-1438","cells":[{"es":"9\"","en":"9\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"9MP-1438"},{"clave":"9MP-1412","cells":[{"es":"9\"","en":"9\""},{"es":"1/2\"","en":"1/2\""},{"es":"Semirrugosa","en":"Semi-Rough"}],"sku":"9MP-1412"},{"clave":"9MP-1434","cells":[{"es":"9\"","en":"9\""},{"es":"3/4\"","en":"3/4\""},{"es":"Rugosa","en":"Rough"}],"sku":"9MP-1434"},{"clave":"9MP-14100","cells":[{"es":"9\"","en":"9\""},{"es":"1\"","en":"1\""},{"es":"Extra rugosa","en":"Extra-Rough"}],"sku":"9MP-14100"},{"clave":"9MP-14114","cells":[{"es":"9\"","en":"9\""},{"es":"1 1/4\"","en":"1 1/4\""},{"es":"Extra rugosa","en":"Extra-Rough"}],"sku":"9MP-14114"}]},{"id":"k1","cat":"kits","img":"kit-multiusos","linea":{"es":"Kits","en":"Kits"},"nombre":{"es":"Kit Multiusos","en":"Multipurpose Kit"},"sub":{"es":"Muros interiores y exteriores","en":"Interior and exterior walls"},"desc":{"es":"Para muros interiores y exteriores en superficies semilisas, con pintura látex y acrílica. Núcleo resistente a solventes.","en":"Ideal for interior and exterior walls on semi-smooth surfaces, with latex and acrylic paint. Solvent-resistant core."},"incl":[{"es":"Rodillo 9\" × 3/8\" de poliéster 100 % de alta densidad","en":"9\" × 3/8\" nap roller cover, 100% high-density polyester"},{"es":"Maneral semiprofesional con aro metálico para rodillo de 9\"","en":"Semi-professional frame with metal ring for 9\" roller"},{"es":"Brocha de lujo de 2\", cerda natural y mango de plástico","en":"2\" luxury brush, natural bristle, plastic handle"},{"es":"Charola de plástico inyectado de alta resistencia para rodillo de 9\"","en":"High-resistance injected plastic tray for 9\" roller"}],"cols":[{"es":"Clave","en":"Part #"},{"es":"Medida","en":"Size"},{"es":"Uso","en":"Use"}],"vars":[{"clave":"BR-K001","cells":[{"es":"9\"","en":"9\""},{"es":"Muros interiores","en":"Interior walls"}],"sku":"BR-K001"}]},{"id":"k2","cat":"kits","img":"kit-economico","linea":{"es":"Kits","en":"Kits"},"nombre":{"es":"Kit Económico","en":"Economy Kit"},"sub":{"es":"Pinturas base agua","en":"Water-based paints"},"desc":{"es":"Para muros interiores y exteriores en superficies semilisas con pinturas base agua.","en":"Ideal for interior and exterior walls on semi-smooth surfaces with water-based paints."},"incl":[{"es":"Rodillo 9\" × 3/8\" de poliéster 100 % de alta densidad","en":"9\" × 3/8\" nap roller cover, 100% high-density polyester"},{"es":"Maneral semiprofesional con aro metálico para rodillo de 9\"","en":"Semi-professional frame with metal ring for 9\" roller"},{"es":"Brocha de 2\" de cerda natural con mango de madera","en":"2\" natural bristle brush with wood handle"},{"es":"Charola de plástico ligera para rodillo de 9\"","en":"Lightweight plastic tray for 9\" roller"}],"cols":[{"es":"Clave","en":"Part #"},{"es":"Medida","en":"Size"},{"es":"Uso","en":"Use"}],"vars":[{"clave":"BR-K002","cells":[{"es":"9\"","en":"9\""},{"es":"Muros interiores","en":"Interior walls"}],"sku":"BR-K002"}]},{"id":"k3","cat":"kits","img":"kit-imper","linea":{"es":"Kits","en":"Kits"},"tag":{"es":"Va con tu impermeabilizante","en":"Pairs with your waterproofing"},"nombre":{"es":"Kit Imper","en":"Imper Kit"},"sub":{"es":"Impermeabilizante, selladores y epóxicos","en":"Waterproofing, sealants and epoxy"},"desc":{"es":"Para impermeabilizar y aplicar selladores y epóxicos. En pintura, para superficies semilisas con todo tipo de pinturas.","en":"Ideal for waterproofing and applying sealants and epoxy. For paint, use on semi-smooth surfaces with all types of paint."},"incl":[{"es":"Rodillo 9\" × 3/4\" de mezcla poliéster y lana","en":"9\" × 3/4\" nap roller cover, polyester and wool blend"},{"es":"Maneral de uso rudo con aro metálico para rodillo de 9\"","en":"Heavy-duty frame with metal ring for 9\" roller"},{"es":"Rodillo 4\" × 3/8\" de mezcla poliéster y lana","en":"4\" × 3/8\" nap roller cover, polyester and wool blend"},{"es":"Maneral semiprofesional con aro metálico para rodillo de 4\"","en":"Semi-professional frame with metal ring for 4\" roller"},{"es":"Brocha de 2\" de cerda natural con mango de madera","en":"2\" natural bristle brush with wood handle"},{"es":"Charola de plástico inyectado de alta resistencia para rodillo de 9\"","en":"High-resistance injected plastic tray for 9\" roller"}],"cols":[{"es":"Clave","en":"Part #"},{"es":"Medida","en":"Size"},{"es":"Uso","en":"Use"}],"vars":[{"clave":"BR-K003","cells":[{"es":"9\"","en":"9\""},{"es":"Impermeabilizante","en":"Waterproofing"}],"sku":"BR-K003"}]},{"id":"k4","cat":"kits","img":"kit-epoxico","linea":{"es":"Kits","en":"Kits"},"nombre":{"es":"Kit Epóxico","en":"Epoxy Kit"},"sub":{"es":"Pisos y acabados lisos","en":"Floors and smooth finishes"},"desc":{"es":"Para pintar pisos, aplicar epóxicos o dar acabados lisos. Sirve con cualquier tipo de pintura y tintas.","en":"Ideal for painting floors, epoxy applications or smooth-finish paint. Works with any type of paint and stains."},"incl":[{"es":"Rodillo 9\" × 3/8\" de mezcla acrílico y nylon","en":"9\" × 3/8\" nap roller cover, acrylic and nylon blend"},{"es":"Maneral semiprofesional con aro metálico para rodillo de 9\"","en":"Semi-professional frame with metal ring for 9\" roller"},{"es":"Charola de plástico inyectado de alta resistencia para rodillo de 9\"","en":"High-resistance injected plastic tray for 9\" roller"}],"cols":[{"es":"Clave","en":"Part #"},{"es":"Medida","en":"Size"},{"es":"Uso","en":"Use"}],"vars":[{"clave":"BR-K004","cells":[{"es":"9\"","en":"9\""},{"es":"Pisos epóxicos","en":"Epoxy floors"}],"sku":"BR-K004"}]},{"id":"m1","cat":"mini","img":"mini-velour","linea":{"es":"Mini rodillos","en":"Mini rollers"},"nombre":{"es":"Mini rodillo Velour","en":"Velour Mini Roller"},"sub":{"es":"Lana pura 100 %","en":"100% pure wool"},"desc":{"es":"Mini rodillo de calidad profesional en velour de lana pura. Para barnizar y para pintar superficies pequeñas o de difícil acceso, como radiadores y orillas.","en":"Professional-quality mini roller made of 100% pure wool velour. For varnishing and for painting small or hard-to-reach surfaces such as radiators and edges."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Largo","en":"Length"},{"es":"Felpa","en":"Nap"},{"es":"Superficie","en":"Surface"}],"vars":[{"clave":"4VL-1/4MD","cells":[{"es":"4\"","en":"4\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"4VL-1/4MD"},{"clave":"4VL25-4M","cells":[{"es":"4\"","en":"4\""},{"es":"1/4\"","en":"1/4\""},{"es":"Lisa","en":"Smooth"}],"sku":"4VL25-4M"}]},{"id":"m2","cat":"mini","img":"mini-minigold","linea":{"es":"Mini rodillos","en":"Mini rollers"},"nombre":{"es":"Mini rodillo Minigold","en":"Minigold Mini Roller"},"sub":{"es":"Poliacrílico 100 %","en":"100% polyacrylic"},"desc":{"es":"Mini rodillo de calidad profesional en tela poliacrílica. Para muros y techos, y para superficies pequeñas o de difícil acceso, como radiadores y orillas.","en":"Professional-quality mini roller made of polyacrylic fabric. For walls and ceilings, and for small or hard-to-reach surfaces such as radiators and edges."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Largo","en":"Length"},{"es":"Felpa","en":"Nap"},{"es":"Superficie","en":"Surface"}],"vars":[{"clave":"4YS-3/8MD","cells":[{"es":"4\"","en":"4\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"4YS-3/8MD"},{"clave":"4YS38-4M","cells":[{"es":"4\"","en":"4\""},{"es":"3/8\"","en":"3/8\""},{"es":"Semilisa","en":"Semi-Smooth"}],"sku":"4YS38-4M"}]},{"id":"m3","cat":"mini","img":"mini-espuma","linea":{"es":"Mini rodillos","en":"Mini rollers"},"nombre":{"es":"Mini rodillo de espuma","en":"Hi-Density Foam Mini Roller"},"sub":{"es":"Espuma de alta densidad","en":"High-density foam"},"desc":{"es":"Mini rodillo de calidad profesional en espuma de alta densidad. Para todo tipo de pinturas, tintas y barnices.","en":"Professional-quality mini roller made of high-density foam. For all kinds of paints, stains and varnishes."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Largo","en":"Length"},{"es":"Felpa","en":"Nap"},{"es":"Superficie","en":"Surface"}],"vars":[{"clave":"4YF-3/8MD","cells":[{"es":"4\"","en":"4\""},{"es":"—","en":"—"},{"es":"Lisa","en":"Smooth"}],"sku":"4YF-3/8MD"},{"clave":"4YS38-4M","sku":"4YS38-4M/F","cells":[{"es":"4\"","en":"4\""},{"es":"—","en":"—"},{"es":"Lisa","en":"Smooth"}]}]},{"id":"b1","cat":"brochas","img":"brocha-economica","linea":{"es":"Brochas","en":"Brushes"},"nombre":{"es":"Brocha económica","en":"Economy Brush"},"sub":{"es":"Cerda pura, mango de madera","en":"Pure bristle, wood handle"},"desc":{"es":"Brocha de cerda pura para pintar y barnizar con pinturas acrílicas, barnices y lacas.","en":"Pure bristle paint brush for painting and varnishing with acrylic paints, varnishes and polishes."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Medida","en":"Size"}],"vars":[{"clave":"BRNB-10","cells":[{"es":"1\"","en":"1\""}],"sku":"BRNB-10"},{"clave":"BRNB-15","cells":[{"es":"1.5\"","en":"1.5\""}],"sku":"BRNB-15"},{"clave":"BRNB-20","cells":[{"es":"2\"","en":"2\""}],"sku":"BRNB-20"},{"clave":"BRNB-25","cells":[{"es":"2.5\"","en":"2.5\""}],"sku":"BRNB-25"},{"clave":"BRNB-30","cells":[{"es":"3\"","en":"3\""}],"sku":"BRNB-30"},{"clave":"BRNB-40","cells":[{"es":"4\"","en":"4\""}],"sku":"BRNB-40"}]},{"id":"b2","cat":"brochas","img":"brocha-lujo","linea":{"es":"Brochas","en":"Brushes"},"nombre":{"es":"Brocha de lujo","en":"Luxury Brush"},"sub":{"es":"Cerda 100 % natural, mango de plástico","en":"100% natural bristle, plastic handle"},"desc":{"es":"Cerda pura para esmaltar con pinturas acrílicas, barnices y lacas. El largo de su cerda la hace ideal para superficies planas y barnices.","en":"Pure bristles for enamelling with acrylic paints, varnishes and polishes. Its bristle length suits flat surfaces and varnishes."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Medida","en":"Size"},{"es":"Caja","en":"Pack"}],"vars":[{"clave":"BRPB-20","cells":[{"es":"2\"","en":"2\""},{"es":"12 pzas","en":"12 pcs"}],"sku":"BRPB-20"},{"clave":"BRPB-30","cells":[{"es":"3\"","en":"3\""},{"es":"12 pzas","en":"12 pcs"}],"sku":"BRPB-30"},{"clave":"BRPB-40","cells":[{"es":"4\"","en":"4\""},{"es":"12 pzas","en":"12 pcs"}],"sku":"BRPB-40"},{"clave":"BRPB-50","cells":[{"es":"5\"","en":"5\""},{"es":"12 pzas","en":"12 pcs"}],"sku":"BRPB-50"}]},{"id":"f1","cat":"manerales","img":"maneral-semiprofesional","linea":{"es":"Manerales","en":"Frames"},"nombre":{"es":"Maneral semiprofesional","en":"Semi-Professional Frame"},"sub":{"es":"Jaula de 4 alambres","en":"4-wire cage"},"desc":{"es":"Mango ergonómico para mejor control, armazón de acero galvanizado con mango de plástico, jaula de 4 alambres y base roscada para extensión.","en":"Ergonomic handle for better control, zinc-plated steel frame with plastic handle, 4-wire birdcage and screw-fit base for extension poles."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Rodillo","en":"Roller"},{"es":"Largo","en":"Length"}],"vars":[{"clave":"3BR-12","cells":[{"es":"3\"","en":"3\""},{"es":"12\"","en":"12\""}],"sku":"3BR-12"},{"clave":"4BR-12","cells":[{"es":"4\"","en":"4\""},{"es":"12\"","en":"12\""}],"sku":"4BR-12"},{"clave":"9BR-14","cells":[{"es":"9\"","en":"9\""},{"es":"14\"","en":"14\""}],"sku":"9BR-14"}]},{"id":"f2","cat":"manerales","img":"maneral-profesional","linea":{"es":"Manerales","en":"Frames"},"nombre":{"es":"Maneral profesional","en":"Professional Frame"},"sub":{"es":"Uso rudo, jaula de 5 alambres","en":"Heavy duty, 5-wire cage"},"desc":{"es":"Jaula de 5 alambres para mayor firmeza, varilla principal de 8 mm con recubrimiento contra el óxido, mango de plástico y base roscada para extensión.","en":"5-wire birdcage for added strength, plated 8 mm main rod for rust resistance, plastic handle and screw-fit base for extension poles."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Rodillo","en":"Roller"},{"es":"Largo","en":"Length"}],"vars":[{"clave":"9BR-14RR","cells":[{"es":"9\"","en":"9\""},{"es":"14\"","en":"14\""}],"sku":"9BR-14RR"}]},{"id":"t1","cat":"charolas","img":"charola","linea":{"es":"Charolas","en":"Trays"},"nombre":{"es":"Charola para rodillo de 9\"","en":"Tray for 9\" Roller"},"sub":{"es":"Económica y de alta resistencia","en":"Economy and high resistance"},"desc":{"es":"Charolas de plástico inyectado, resistentes a todo tipo de pinturas y solventes.","en":"Injection-molded plastic trays, resistant to all types of paints and solvents."},"cols":[{"es":"Clave","en":"Part #"},{"es":"Medida","en":"Size"},{"es":"Tipo","en":"Type"}],"vars":[{"clave":"9BR-PETC","cells":[{"es":"9\"","en":"9\""},{"es":"Sencilla","en":"Simple"}],"sku":"9BR-PETC"},{"clave":"9BR-PET","cells":[{"es":"9\"","en":"9\""},{"es":"Alta resistencia","en":"High resistance"}],"sku":"9BR-PET"}]}];

  var CATS=[
    ['todos',{es:'Todos',en:'All'}],
    ['rodillos',{es:'Rodillos',en:'Rollers'}],
    ['mini',{es:'Mini rodillos',en:'Mini rollers'}],
    ['brochas',{es:'Brochas',en:'Brushes'}],
    ['manerales',{es:'Manerales',en:'Frames'}],
    ['charolas',{es:'Charolas',en:'Trays'}],
    ['kits',{es:'Kits y sets',en:'Kits & sets'}]
  ];
  var FELPA=[
    ['1/4"',5,{es:'Lisa: yeso, tablaroca, puertas',en:'Smooth: plaster, drywall, doors'}],
    ['3/8"',8,{es:'Semilisa: muros interiores',en:'Semi-smooth: interior walls'}],
    ['1/2"',11,{es:'Semirrugosa: aplanado fino',en:'Semi-rough: fine stucco'}],
    ['3/4"',16,{es:'Rugosa: aplanado, block',en:'Rough: stucco, block'}],
    ['1" – 1 1/4"',26,{es:'Extra rugosa: tirol, losa, impermeabilizante',en:'Extra rough: textured ceilings, slab, waterproofing'}]
  ];
  var TX={
    es:{
      promoEye:'Nuevo · B-Roller',promoTitle:'Todo para aplicar tu pintura',promoSub:'Rodillos, brochas, manerales, charolas y kits. 17 productos en 64 medidas: cotízalos o agrégalos a tu pedido.',promoCta:'Ver accesorios →',
      title:'🖌️ Productos y accesorios',
      lead1:'Todo para aplicar tu pintura, en el mismo pedido.',
      lead2:'Rodillos, brochas, manerales, charolas y kits B-Roller. Elige la medida y agrégala a tu carrito o a tu cotización.',
      count:'{p} productos · {m} medidas',
      guide:'¿Qué felpa necesito? Entre más rugoso el muro, más larga la felpa',
      filter:'Filtrar por tipo',
      details:'Ver descripción y medidas',
      pick:'Elige la medida',single:'Presentación',
      tbq:'Por cotizar',
      addCart:'Agregar al carrito',addQuote:'Cotizar',
      each:'c/u',
      includes:'Incluye',sizes:'Medidas disponibles',price:'Precio',close:'Cerrar',
      seeDetails:'Ver detalles de',
      qTitle:'🧾 Cotización de accesorios',
      qBar:'Cotización de accesorios',
      qEmpty:'Tu cotización está vacía. Elige una medida y toca "Cotizar".',
      qSub:'Subtotal con precio',qPend:'{n} producto(s) por cotizar',qPieces:'{n} pieza(s)',
      fName:'Nombre o empresa',fTel:'WhatsApp (10 dígitos)',fCity:'Ciudad de entrega',fNotes:'Notas (opcional)',
      send:'📲 Enviar cotización por WhatsApp (PDF)',
      toCart:'🛒 Pasar todo al carrito y comprar',
      clear:'Vaciar',remove:'Quitar',
      qNote:'Guardamos tu cotización y te confirmamos precio y disponibilidad por WhatsApp. En celular se comparte el PDF; en computadora se descarga para que lo adjuntes al chat.',
      eName:'Escribe tu nombre o empresa.',eTel:'Escribe un WhatsApp válido de 10 dígitos.',
      working:'⏳ Generando el PDF de tu cotización…',
      okTitle:'Cotización {f} lista',
      okText:'Si WhatsApp no se abrió solo, usa estos botones y adjunta el PDF en el chat de Bolt Paint (686 262 5119).',
      okWa:'Abrir WhatsApp',okPdf:'Descargar PDF',okDone:'Listo',
      noPdf:'No se pudo generar el PDF; envía el detalle por WhatsApp con el botón.',
      tCart:'✅ {n} agregado al carrito',tQuote:'🧾 {n} agregado a tu cotización',tMoved:'✅ Accesorios pasados al carrito',
      docTitle:'COTIZACIÓN DE ACCESORIOS',docFolio:'Folio',docDate:'Fecha',docClient:'Cliente',docTel:'WhatsApp',docCity:'Entrega',docNotes:'Notas',
      docItem:'Producto',docQty:'Cant.',docUnit:'P. unit.',docAmt:'Importe',
      docTotal:'Total estimado',docTotalPart:'Subtotal de productos con precio',
      docWarn:'Los productos marcados "Por cotizar" aún no tienen precio de lista; Bolt Paint confirma precio y disponibilidad por WhatsApp. Este documento no es comprobante fiscal.',
      docBrand:'Bolt Paint · Distribuidor oficial BPaint Depot · Mexicali y San Felipe, B.C. · (686) 262-5119',
      waHead:'*Bolt Paint · COTIZACIÓN DE ACCESORIOS*',waClient:'Cliente',waTotal:'Total estimado',waPend:'por cotizar',
      waPdf:'📎 Te adjunto el PDF de la cotización',
      foot:'Accesorios marca B-Roller. Precios en pesos mexicanos por pieza.'
    },
    en:{
      promoEye:'New · B-Roller',promoTitle:'Everything to apply your paint',promoSub:'Rollers, brushes, frames, trays and kits. 17 products in 64 sizes: get a quote or add them to your order.',promoCta:'See accessories →',
      title:'🖌️ Products & accessories',
      lead1:'Everything you need to apply your paint, in the same order.',
      lead2:'B-Roller rollers, brushes, frames, trays and kits. Pick the size and add it to your cart or your quote.',
      count:'{p} products · {m} sizes',
      guide:'Which nap do I need? The rougher the wall, the longer the nap',
      filter:'Filter by type',
      details:'See description and sizes',
      pick:'Choose the size',single:'Presentation',
      tbq:'Quote only',
      addCart:'Add to cart',addQuote:'Quote',
      each:'each',
      includes:'Includes',sizes:'Available sizes',price:'Price',close:'Close',
      seeDetails:'See details for',
      qTitle:'🧾 Accessories quote',
      qBar:'Accessories quote',
      qEmpty:'Your quote is empty. Pick a size and tap "Quote".',
      qSub:'Subtotal of priced items',qPend:'{n} item(s) to be quoted',qPieces:'{n} piece(s)',
      fName:'Name or company',fTel:'WhatsApp (10 digits)',fCity:'Delivery city',fNotes:'Notes (optional)',
      send:'📲 Send quote by WhatsApp (PDF)',
      toCart:'🛒 Move everything to the cart and buy',
      clear:'Clear',remove:'Remove',
      qNote:'We save your quote and confirm price and availability by WhatsApp. On a phone the PDF is shared; on a computer it downloads so you can attach it to the chat.',
      eName:'Enter your name or company.',eTel:'Enter a valid 10-digit WhatsApp number.',
      working:'⏳ Generating your quote PDF…',
      okTitle:'Quote {f} ready',
      okText:'If WhatsApp did not open by itself, use these buttons and attach the PDF in the Bolt Paint chat (686 262 5119).',
      okWa:'Open WhatsApp',okPdf:'Download PDF',okDone:'Done',
      noPdf:'The PDF could not be generated; send the details by WhatsApp with the button.',
      tCart:'✅ {n} added to cart',tQuote:'🧾 {n} added to your quote',tMoved:'✅ Accessories moved to the cart',
      docTitle:'ACCESSORIES QUOTE',docFolio:'Quote #',docDate:'Date',docClient:'Customer',docTel:'WhatsApp',docCity:'Delivery',docNotes:'Notes',
      docItem:'Product',docQty:'Qty',docUnit:'Unit',docAmt:'Amount',
      docTotal:'Estimated total',docTotalPart:'Subtotal of priced items',
      docWarn:'Items marked "Quote only" have no list price yet; Bolt Paint confirms price and availability by WhatsApp. This document is not a tax invoice.',
      docBrand:'Bolt Paint · Official BPaint Depot distributor · Mexicali & San Felipe, B.C. · (686) 262-5119',
      waHead:'*Bolt Paint · ACCESSORIES QUOTE*',waClient:'Customer',waTotal:'Estimated total',waPend:'to be quoted',
      waPdf:'📎 The quote PDF is attached',
      foot:'B-Roller brand accessories. Prices in Mexican pesos per piece.'
    }
  };

  try{if(window.bpI18n&&window.bpI18n.dict){window.bpI18n.dict['🖌️ Accesorios']='🖌️ Accessories';if(!window.bpI18n.dict['Nuevo'])window.bpI18n.dict['Nuevo']='New'}}catch(e){}

  /* ===================== ESTADO / UTILIDADES ===================== */
  var state={cat:'todos',sel:{},quote:[],lastBlob:null,lastFolio:null,lastWa:null,ok:false};
  var SKU={};
  P.forEach(function(p){p.vars.forEach(function(v){SKU[v.sku]={p:p,v:v}})});
  try{var saved=JSON.parse(localStorage.getItem('bp_acc_quote')||'[]');if(saved&&saved.length)state.quote=saved.filter(function(q){return q&&SKU[q.sku]&&q.qty>0})}catch(e){}

  function lang(){return (window.bpI18n&&window.bpI18n.lang==='en')?'en':'es'}
  function locale(){return lang()==='en'?'en-US':'es-MX'}
  function t(k,o){var s=TX[lang()][k];if(s==null)s=k;if(o)for(var x in o)s=s.replace('{'+x+'}',o[x]);return s}
  function L(o){return (o&&typeof o==='object')?(o[lang()]||o.es):o}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function price(sku){var n=Number(PRICES[sku]);return n>0?n:0}
  function money(n){n=Number(n);return '$'+n.toLocaleString(locale(),{minimumFractionDigits:(n%1?2:0),maximumFractionDigits:2})}
  function $(id){return document.getElementById(id)}
  function detail(v){return v.cells.map(function(c){return L(c)}).join(' · ')}
  function vLabel(v){return v.clave+' · '+detail(v)}
  function fullName(p,v){return L(p.nombre)+' '+detail(v)}
  function selVar(p){return p.vars[state.sel[p.id]||0]||p.vars[0]}
  function saveQuote(){try{localStorage.setItem('bp_acc_quote',JSON.stringify(state.quote))}catch(e){}}
  function say(msg){if(typeof window.toast==='function')window.toast(msg)}
  function qCount(){return state.quote.reduce(function(s,q){return s+q.qty},0)}

  /* ===================== CSS ===================== */
  var CSS=''+
  '#accesorios{scroll-margin-top:70px}'+
  /* acceso desde la portada */
  '.hero .bpa-hero-btn{background:rgba(249,115,22,.22);border-color:var(--or);font-weight:800}'+
  '@media(min-width:1025px){.hero .hero-actions{max-width:calc(100% - min(56%,700px) - 24px)}}'+
  '.hero .bpa-hero-btn:hover{background:rgba(249,115,22,.38)}'+
  '.bpa-new{background:var(--yl);color:#17171a;font-size:9px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;border-radius:var(--r99);padding:3px 7px;line-height:1}'+
  '#bpaPromo{padding:20px 16px 0}'+
  '.bpa-promo{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:24px;align-items:center;background:linear-gradient(115deg,rgba(249,115,22,.2),var(--bg2) 60%);border:1.5px solid rgba(249,115,22,.5);border-radius:var(--r20);padding:22px 24px}'+
  '.bpa-promo-eye{font-size:11px;font-weight:800;letter-spacing:1.2px;text-transform:uppercase;color:var(--yl)}'+
  '.bpa-promo-t{font-family:"Syne",sans-serif;font-weight:800;font-size:26px;line-height:1.1;color:var(--txt);margin:6px 0 8px}'+
  '.bpa-promo-s{font-size:14px;line-height:1.5;color:var(--txt2);margin:0 0 16px;max-width:520px}'+
  '.bpa-promo .bpa-btn{padding:13px 22px;font-size:15px}'+
  '.bpa-tiles{display:grid;grid-template-columns:repeat(5,92px);gap:10px}'+
  '.bpa-tile{background:none;border:0;padding:0;cursor:pointer;display:flex;flex-direction:column;gap:6px;align-items:center;font:700 11px "Plus Jakarta Sans",sans-serif;color:var(--txt2);min-width:0;text-align:center;line-height:1.2}'+
  '.bpa-tile span.i{display:block;width:100%;aspect-ratio:1;background:#fff center/78% no-repeat;border-radius:var(--r12);border:2px solid transparent;transition:.15s}'+
  '.bpa-tile:hover{color:var(--txt)}.bpa-tile:hover span.i{border-color:var(--or);transform:translateY(-2px)}'+
  '@media(min-width:860px){#bpaPromo{padding:28px 32px 0}}'+
  '@media(max-width:900px){.bpa-promo{grid-template-columns:minmax(0,1fr);gap:18px;padding:18px 16px}.bpa-tiles{grid-template-columns:repeat(5,minmax(0,1fr));gap:8px}.bpa-promo-t{font-size:22px}.bpa-tile{font-size:10px}}'+
  '#accesorios .bpa-lead{font-size:14px;color:var(--txt2);line-height:1.55;max-width:640px;margin:0 0 18px}'+
  '#accesorios .bpa-lead b{color:var(--txt)}'+
  '#accesorios .bpa-count{font-size:12px;color:var(--txt3);font-weight:600;white-space:nowrap}'+
  '#accesorios .bpa-guia{background:var(--bg2);border:1px solid var(--brd);border-radius:var(--r16);padding:16px;margin-bottom:18px}'+
  '#accesorios .bpa-guia-t{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--txt3);margin-bottom:12px}'+
  '#accesorios .bpa-guia-row{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}'+
  '#accesorios .bpa-felpa{min-width:0}'+
  '#accesorios .bpa-felpa-bar{height:26px;display:flex;align-items:flex-end;margin-bottom:8px}'+
  '#accesorios .bpa-felpa-bar i{display:block;width:100%;background:repeating-linear-gradient(90deg,var(--or) 0 3px,transparent 3px 6px);border-bottom:3px solid var(--or2);border-radius:2px 2px 0 0}'+
  '#accesorios .bpa-felpa-n{font-weight:800;font-size:15px;color:var(--txt)}'+
  '#accesorios .bpa-felpa-s{font-size:12px;color:var(--txt2);line-height:1.3;margin-top:3px}'+
  '#accesorios .bpa-chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px}'+
  '#accesorios .bpa-chip{background:var(--sur);border:1.5px solid var(--brd);color:var(--txt2);border-radius:var(--r99);padding:8px 14px;font:700 13px "Plus Jakarta Sans",sans-serif;cursor:pointer;transition:.15s}'+
  '#accesorios .bpa-chip:hover{border-color:var(--or);color:var(--or)}'+
  '#accesorios .bpa-chip.on{background:var(--or);border-color:var(--or);color:#fff}'+
  '#accesorios .bpa-chip small{font-weight:600;opacity:.75;margin-left:5px}'+
  '#accesorios .bpa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:14px}'+
  '#accesorios .bpa-card{background:var(--bg2);border:1.5px solid var(--brd);border-radius:var(--r16);overflow:hidden;display:flex;flex-direction:column;min-width:0}'+
  '.bpa-foto{background:#fff;aspect-ratio:4/3;border:0;cursor:pointer;width:100%;position:relative;display:block;padding:0}'+
  '.bpa-foto img{position:absolute;left:14px;top:14px;width:calc(100% - 28px);height:calc(100% - 28px);object-fit:contain;transition:transform .25s}'+
  '.bpa-foto:hover img{transform:scale(1.04)}'+
  '.bpa-tag{position:absolute;left:10px;top:10px;z-index:1;background:#17171a;color:var(--yl);font-size:10px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;border-radius:var(--r99);padding:4px 9px}'+
  '#accesorios .bpa-body{padding:14px;display:flex;flex-direction:column;gap:10px;flex:1}'+
  '.bpa-linea{font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase;color:var(--or2)}'+
  '.bpa-name{font-family:"Syne",sans-serif;font-weight:800;font-size:17px;line-height:1.15;color:var(--txt);margin:2px 0 0}'+
  '.bpa-sub{font-size:12px;color:var(--txt2);margin:2px 0 0}'+
  '.bpa-link{background:none;border:0;color:var(--txt2);font:700 12px "Plus Jakarta Sans",sans-serif;cursor:pointer;padding:0;text-align:left;text-decoration:underline;text-underline-offset:3px}'+
  '.bpa-link:hover{color:var(--txt)}'+
  '#accesorios .bpa-field{display:flex;flex-direction:column;gap:4px;margin-top:auto}'+
  '.bpa-lbl{font-size:10px;font-weight:700;letter-spacing:.6px;text-transform:uppercase;color:var(--txt3)}'+
  '.bpa-sel,.bpa-inp{background:var(--bg3);border:1.5px solid var(--brd);color:var(--txt);border-radius:var(--r8);padding:9px 10px;font:600 13px "Plus Jakarta Sans",sans-serif;width:100%;min-width:0;box-sizing:border-box}'+
  '.bpa-inp:focus,.bpa-sel:focus{outline:none;border-color:var(--or)}'+
  '.bpa-unica{background:var(--bg3);border:1.5px dashed var(--brd);border-radius:var(--r8);padding:9px 10px;font-size:13px;font-weight:600;color:var(--txt2)}'+
  '#accesorios .bpa-buy{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}'+
  '.bpa-price{font-size:18px;font-weight:800;color:var(--txt)}.bpa-price sup{font-size:10px;color:var(--txt3);font-weight:700}'+
  '.bpa-tbq{font-size:12px;font-weight:700;color:var(--yl);border:1px dashed var(--yl);border-radius:var(--r8);padding:5px 8px}'+
  '.bpa-btns{display:flex;gap:6px;flex-wrap:wrap}'+
  '.bpa-btn{background:var(--or);color:#fff;border:0;border-radius:var(--r12);padding:10px 14px;font:800 13px "Plus Jakarta Sans",sans-serif;cursor:pointer;transition:.15s;text-decoration:none;display:inline-flex;align-items:center;justify-content:center;gap:6px}'+
  '.bpa-btn:hover{background:var(--or2)}'+
  '.bpa-btn.sec{background:var(--sur);color:var(--txt);border:1.5px solid var(--brd)}.bpa-btn.sec:hover{border-color:var(--or);color:var(--or);background:var(--sur)}'+
  '.bpa-btn.wa{background:#25d366;color:#fff}.bpa-btn.wide{width:100%;padding:13px 16px;font-size:14px}'+
  '.bpa-btn[disabled]{opacity:.55;cursor:wait}'+
  '#accesorios .bpa-foot{font-size:12px;color:var(--txt3);margin:18px 0 0}'+
  '.bpa-hide{display:none!important}'+
  /* barra flotante */
  '#bpaBar{position:fixed;right:14px;bottom:calc(78px + var(--safe,0px));z-index:250;background:var(--or);color:#fff;border:0;border-radius:var(--r99);padding:11px 16px;font:800 13px "Plus Jakarta Sans",sans-serif;cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.45);display:inline-flex;align-items:center;gap:8px;max-width:calc(100% - 110px)}'+
  '#bpaBar b{background:#17171a;color:#fff;border-radius:var(--r99);min-width:22px;height:22px;display:inline-grid;place-items:center;font-size:12px;padding:0 6px}'+
  /* diálogos */
  'dialog.bpa-dlg{margin:auto;background:var(--bg2);color:var(--txt);border:1.5px solid var(--brd);border-radius:var(--r16);padding:0;width:min(860px,calc(100% - 24px));max-height:calc(100% - 24px);font-family:"Plus Jakarta Sans",sans-serif}'+
  'dialog.bpa-dlg.q{width:min(560px,calc(100% - 24px))}'+
  'dialog.bpa-dlg::backdrop{background:rgba(0,0,0,.72)}'+
  '.bpa-d{display:grid;grid-template-columns:minmax(0,300px) minmax(0,1fr)}'+
  '.bpa-d-foto{background:#fff;display:grid;place-items:center;padding:20px;min-height:220px}'+
  '.bpa-d-foto img{max-width:100%;max-height:340px;object-fit:contain}'+
  '.bpa-d-body{padding:20px;display:flex;flex-direction:column;gap:14px;min-width:0}'+
  '.bpa-d-top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}'+
  '.bpa-d-top h2{font-family:"Syne",sans-serif;font-size:22px;line-height:1.1;margin:4px 0 0;color:var(--txt)}'+
  '.bpa-x{background:var(--bg3);border:1px solid var(--brd);color:var(--txt);border-radius:var(--r99);width:34px;height:34px;font-size:16px;cursor:pointer;flex:none}'+
  '.bpa-desc{color:var(--txt2);margin:0;font-size:14px;line-height:1.55}'+
  '.bpa-incl{margin:0;padding-left:18px;color:var(--txt2);font-size:13px;line-height:1.5}'+
  '.bpa-h4{font-size:11px;font-weight:700;letter-spacing:.7px;text-transform:uppercase;color:var(--txt3);margin:0}'+
  '.bpa-tw{overflow-x:auto;border:1px solid var(--brd);border-radius:var(--r12)}'+
  '.bpa-tw table{border-collapse:collapse;width:100%;font-size:13px}'+
  '.bpa-tw th{font-size:10px;letter-spacing:.6px;text-transform:uppercase;color:var(--txt3);text-align:left;padding:9px 12px;background:var(--bg3);white-space:nowrap}'+
  '.bpa-tw td{padding:9px 12px;border-top:1px solid var(--brd);white-space:nowrap;color:var(--txt)}'+
  '.bpa-tw td:first-child{font-weight:800}.bpa-tw td.pp{color:var(--yl);font-weight:700}.bpa-tw td.pr{font-weight:800}'+
  '.bpa-q{padding:18px;display:flex;flex-direction:column;gap:14px}'+
  '.bpa-q-top{display:flex;justify-content:space-between;align-items:center;gap:12px}'+
  '.bpa-q-top h2{font-family:"Syne",sans-serif;font-size:20px;margin:0;color:var(--txt)}'+
  '.bpa-q-list{display:flex;flex-direction:column;gap:8px}'+
  '.bpa-qi{display:grid;grid-template-columns:46px minmax(0,1fr) auto;gap:10px;align-items:center;background:var(--bg3);border:1px solid var(--brd);border-radius:var(--r12);padding:8px}'+
  '.bpa-qi-img{width:46px;height:46px;border-radius:var(--r8);background:#fff center/contain no-repeat}'+
  '.bpa-qi-n{font-size:13px;font-weight:700;color:var(--txt);line-height:1.25}'+
  '.bpa-qi-m{font-size:11px;color:var(--txt3);margin-top:2px}'+
  '.bpa-qi-r{display:flex;flex-direction:column;align-items:flex-end;gap:5px}'+
  '.bpa-step{display:inline-flex;align-items:center;gap:6px}'+
  '.bpa-step button{width:28px;height:28px;border-radius:var(--r8);border:1px solid var(--brd);background:var(--sur);color:var(--txt);font-size:15px;font-weight:800;cursor:pointer}'+
  '.bpa-step span{min-width:20px;text-align:center;font-weight:800;font-size:13px}'+
  '.bpa-qi-p{font-size:12px;font-weight:800;color:var(--txt)}.bpa-qi-p.pp{color:var(--yl)}'+
  '.bpa-tot{display:flex;justify-content:space-between;gap:10px;font-size:13px;color:var(--txt2);border-top:1px solid var(--brd);padding-top:10px}'+
  '.bpa-tot strong{color:var(--or);font-size:16px}'+
  '.bpa-form{display:grid;grid-template-columns:1fr 1fr;gap:10px}'+
  '.bpa-form .full{grid-column:1/-1}'+
  '.bpa-form label{display:flex;flex-direction:column;gap:4px}'+
  '.bpa-err{color:var(--rd);font-size:12px;font-weight:700;min-height:16px}'+
  '.bpa-note{font-size:11px;color:var(--txt3);line-height:1.5;margin:0}'+
  '.bpa-acts{display:flex;flex-direction:column;gap:8px}'+
  '.bpa-ok{background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.3);border-radius:var(--r12);padding:14px;display:flex;flex-direction:column;gap:10px}'+
  '.bpa-ok h3{margin:0;font-family:"Syne",sans-serif;font-size:17px;color:var(--gn)}.bpa-ok p{margin:0;font-size:12px;color:var(--txt2);line-height:1.5}'+
  '.bpa-empty{color:var(--txt3);font-size:13px;text-align:center;padding:18px 8px}'+
  '@media(max-width:640px){.bpa-d{grid-template-columns:minmax(0,1fr)}.bpa-d-foto img{max-height:200px}#accesorios .bpa-guia-row{grid-template-columns:repeat(2,minmax(0,1fr))}.bpa-form{grid-template-columns:1fr}#accesorios .bpa-grid{grid-template-columns:repeat(auto-fill,minmax(160px,1fr));gap:10px}#accesorios .bpa-body{padding:11px}.bpa-name{font-size:15px}}';

  /* ===================== RENDER: SECCIÓN ===================== */
  function buyHTML(p){
    var v=selVar(p),pr=price(v.sku);
    if(pr>0){
      return '<div class="bpa-price">'+money(pr)+'<sup> MXN</sup></div>'+
        '<div class="bpa-btns"><button type="button" class="bpa-btn" data-bpa-add="'+esc(p.id)+'">'+esc(t('addCart'))+'</button>'+
        '<button type="button" class="bpa-btn sec" data-bpa-quote="'+esc(p.id)+'">'+esc(t('addQuote'))+'</button></div>';
    }
    return '<span class="bpa-tbq">'+esc(t('tbq'))+'</span>'+
      '<div class="bpa-btns"><button type="button" class="bpa-btn" data-bpa-quote="'+esc(p.id)+'">＋ '+esc(t('addQuote'))+'</button></div>';
  }
  function cardHTML(p){
    var h='<article class="bpa-card">';
    h+='<button type="button" class="bpa-foto" data-bpa-open="'+esc(p.id)+'" aria-label="'+esc(t('seeDetails')+' '+L(p.nombre))+'">';
    if(p.tag)h+='<span class="bpa-tag">'+esc(L(p.tag))+'</span>';
    h+='<img src="'+IMG_DIR+esc(p.img)+'.webp" alt="'+esc(L(p.nombre))+' B-Roller" loading="lazy"></button>';
    h+='<div class="bpa-body"><div><div class="bpa-linea">B-Roller · '+esc(L(p.linea))+'</div>';
    h+='<h3 class="bpa-name">'+esc(L(p.nombre))+'</h3><p class="bpa-sub">'+esc(L(p.sub))+'</p></div>';
    h+='<button type="button" class="bpa-link" data-bpa-open="'+esc(p.id)+'">'+esc(t('details'))+'</button>';
    h+='<div class="bpa-field">';
    if(p.vars.length>1){
      h+='<label class="bpa-lbl" for="bpaSel-'+esc(p.id)+'">'+esc(t('pick'))+'</label><select class="bpa-sel" id="bpaSel-'+esc(p.id)+'" data-bpa-sel="'+esc(p.id)+'">';
      p.vars.forEach(function(v,i){h+='<option value="'+i+'"'+((state.sel[p.id]||0)===i?' selected':'')+'>'+esc(vLabel(v))+'</option>'});
      h+='</select>';
    }else{
      h+='<span class="bpa-lbl">'+esc(t('single'))+'</span><div class="bpa-unica">'+esc(vLabel(p.vars[0]))+'</div>';
    }
    h+='</div><div class="bpa-buy" id="bpaBuy-'+esc(p.id)+'">'+buyHTML(p)+'</div></div></article>';
    return h;
  }
  function renderSection(){
    var sec=$('accesorios');if(!sec)return;
    var list=P.filter(function(p){return state.cat==='todos'||p.cat===state.cat});
    var med=list.reduce(function(a,p){return a+p.vars.length},0);
    var h='<div class="sec-hd"><div class="sec-title">'+esc(t('title'))+'</div><span class="bpa-count">'+esc(t('count',{p:list.length,m:med}))+'</span></div>';
    h+='<p class="bpa-lead"><b>'+esc(t('lead1'))+'</b> '+esc(t('lead2'))+'</p>';
    h+='<div class="bpa-guia"><div class="bpa-guia-t">'+esc(t('guide'))+'</div><div class="bpa-guia-row">';
    FELPA.forEach(function(f){h+='<div class="bpa-felpa"><div class="bpa-felpa-bar"><i style="height:'+f[1]+'px"></i></div><div class="bpa-felpa-n">'+esc(f[0])+'</div><div class="bpa-felpa-s">'+esc(L(f[2]))+'</div></div>'});
    h+='</div></div>';
    h+='<div class="bpa-chips" role="group" aria-label="'+esc(t('filter'))+'">';
    CATS.forEach(function(c){
      var n=c[0]==='todos'?P.length:P.filter(function(p){return p.cat===c[0]}).length;
      h+='<button type="button" class="bpa-chip'+(state.cat===c[0]?' on':'')+'" data-bpa-cat="'+c[0]+'">'+esc(L(c[1]))+'<small>'+n+'</small></button>';
    });
    h+='</div><div class="bpa-grid">'+list.map(cardHTML).join('')+'</div>';
    h+='<p class="bpa-foot">'+esc(t('foot'))+'</p>';
    sec.innerHTML=h;
  }
  var PROMO=[['rodillos','white-premium'],['brochas','brocha-lujo'],['kits','kit-imper'],['manerales','maneral-profesional'],['charolas','charola']];
  function renderPromo(){
    var el=$('bpaPromo');if(!el)return;
    var h='<div class="bpa-promo"><div><div class="bpa-promo-eye">'+esc(t('promoEye'))+'</div><div class="bpa-promo-t">'+esc(t('promoTitle'))+'</div><p class="bpa-promo-s">'+esc(t('promoSub'))+'</p>';
    h+='<button type="button" class="bpa-btn" data-bpa-go="todos">'+esc(t('promoCta'))+'</button></div><div class="bpa-tiles">';
    PROMO.forEach(function(x){
      var c=CATS.filter(function(z){return z[0]===x[0]})[0];
      h+='<button type="button" class="bpa-tile" data-bpa-go="'+x[0]+'"><span class="i" style="background-image:url('+IMG_DIR+x[1]+'.webp)"></span>'+esc(L(c[1]))+'</button>';
    });
    el.innerHTML=h+'</div></div>';
  }
  function renderBar(){
    var b=$('bpaBar');if(!b)return;
    var n=qCount();
    b.className=n>0?'':'bpa-hide';
    b.innerHTML='🧾 <span>'+esc(t('qBar'))+'</span> <b>'+n+'</b>';
  }

  /* ===================== DETALLE ===================== */
  function openDetail(id){
    var p=P.filter(function(x){return x.id===id})[0];if(!p)return;
    var d=$('bpaDlg');
    var h='<div class="bpa-d"><div class="bpa-d-foto"><img src="'+IMG_DIR+esc(p.img)+'.webp" alt="'+esc(L(p.nombre))+' B-Roller"></div><div class="bpa-d-body">';
    h+='<div class="bpa-d-top"><div><div class="bpa-linea">B-Roller · '+esc(L(p.linea))+'</div><h2>'+esc(L(p.nombre))+'</h2><p class="bpa-sub">'+esc(L(p.sub))+'</p></div>';
    h+='<button type="button" class="bpa-x" data-bpa-close="bpaDlg" aria-label="'+esc(t('close'))+'">✕</button></div>';
    h+='<p class="bpa-desc">'+esc(L(p.desc))+'</p>';
    if(p.incl){h+='<p class="bpa-h4">'+esc(t('includes'))+'</p><ul class="bpa-incl">'+p.incl.map(function(i){return '<li>'+esc(L(i))+'</li>'}).join('')+'</ul>'}
    h+='<p class="bpa-h4">'+esc(t('sizes'))+'</p><div class="bpa-tw"><table><thead><tr>'+p.cols.map(function(c){return '<th>'+esc(L(c))+'</th>'}).join('')+'<th>'+esc(t('price'))+'</th><th></th></tr></thead><tbody>';
    p.vars.forEach(function(v){
      var pr=price(v.sku);
      h+='<tr><td>'+esc(v.clave)+'</td>'+v.cells.map(function(c){return '<td>'+esc(L(c))+'</td>'}).join('');
      h+=pr>0?'<td class="pr">'+money(pr)+'</td>':'<td class="pp">'+esc(t('tbq'))+'</td>';
      h+='<td>'+(pr>0?'<button type="button" class="bpa-btn" data-bpa-addsku="'+esc(v.sku)+'">'+esc(t('addCart'))+'</button>':'<button type="button" class="bpa-btn sec" data-bpa-quotesku="'+esc(v.sku)+'">＋ '+esc(t('addQuote'))+'</button>')+'</td></tr>';
    });
    h+='</tbody></table></div></div></div>';
    d.innerHTML=h;
    if(!d.open&&d.showModal)d.showModal();
  }

  /* ===================== CARRITO (compra) ===================== */
  function addCart(sku,qty,silent){
    var e=SKU[sku];if(!e)return false;
    var pr=price(sku);if(pr<=0)return false;
    if(!window.cart||typeof window.updCart!=='function')return false;
    var id='acc-'+sku;
    var ex=window.cart.filter(function(c){return c.id===id})[0];
    if(ex){ex.qty+=(qty||1)}
    else{window.cart.push({id:id,nombre:fullName(e.p,e.v),hex:'#fff url('+IMG_DIR+e.p.img+'.webp) center/contain no-repeat',sz:e.v.clave,szLbl:'B-Roller · '+e.v.clave,pr:pr,qty:qty||1,acc:true})}
    window.updCart();
    if(!silent)say(t('tCart',{n:fullName(e.p,e.v)}));
    return true;
  }

  /* ===================== COTIZACIÓN ===================== */
  function addQuote(sku){
    var e=SKU[sku];if(!e)return;
    var ex=state.quote.filter(function(q){return q.sku===sku})[0];
    if(ex)ex.qty++;else state.quote.push({sku:sku,qty:1});
    saveQuote();renderBar();
    say(t('tQuote',{n:fullName(e.p,e.v)}));
    var d=$('bpaQ');if(d&&d.open)renderQuote();
  }
  function quoteTotals(){
    var sub=0,pend=0;
    state.quote.forEach(function(q){var pr=price(q.sku);if(pr>0)sub+=pr*q.qty;else pend++});
    return {sub:sub,pend:pend,pieces:qCount()};
  }
  function keepForm(){
    var o={};['bpaNom','bpaTel','bpaCiu','bpaNot'].forEach(function(id){var el=$(id);if(el)o[id]=el.value});return o;
  }
  function renderQuote(okPanel){
    var d=$('bpaQ');if(!d)return;
    var keep=keepForm(),T=quoteTotals();
    var h='<div class="bpa-q"><div class="bpa-q-top"><h2>'+esc(t('qTitle'))+'</h2><button type="button" class="bpa-x" data-bpa-close="bpaQ" aria-label="'+esc(t('close'))+'">✕</button></div>';
    state.ok=!!okPanel;
    if(okPanel){
      h+='<div class="bpa-ok"><h3>✓ '+esc(t('okTitle',{f:state.lastFolio}))+'</h3><p>'+esc(state.lastBlob?t('okText'):t('noPdf'))+'</p>';
      h+='<a class="bpa-btn wa wide" href="'+esc(state.lastWa)+'" target="_blank" rel="noopener">'+esc(t('okWa'))+'</a>';
      if(state.lastBlob)h+='<button type="button" class="bpa-btn sec wide" data-bpa-dl="1">📎 '+esc(t('okPdf'))+'</button>';
      h+='<button type="button" class="bpa-btn sec wide" data-bpa-done="1">'+esc(t('okDone'))+'</button></div></div>';
      d.innerHTML=h;return;
    }
    if(!state.quote.length){
      h+='<div class="bpa-empty">'+esc(t('qEmpty'))+'</div></div>';d.innerHTML=h;return;
    }
    h+='<div class="bpa-q-list">';
    state.quote.forEach(function(q){
      var e=SKU[q.sku],pr=price(q.sku);
      h+='<div class="bpa-qi"><div class="bpa-qi-img" style="background-image:url('+IMG_DIR+esc(e.p.img)+'.webp)"></div>';
      h+='<div><div class="bpa-qi-n">'+esc(fullName(e.p,e.v))+'</div><div class="bpa-qi-m">B-Roller · '+esc(e.v.clave)+(pr>0?' · '+money(pr)+' '+esc(t('each')):'')+'</div></div>';
      h+='<div class="bpa-qi-r"><div class="bpa-step"><button type="button" data-bpa-qty="-1" data-sku="'+esc(q.sku)+'" aria-label="−">−</button><span>'+q.qty+'</span><button type="button" data-bpa-qty="1" data-sku="'+esc(q.sku)+'" aria-label="+">+</button></div>';
      h+='<div class="bpa-qi-p'+(pr>0?'':' pp')+'">'+(pr>0?money(pr*q.qty):esc(t('tbq')))+'</div></div></div>';
    });
    h+='</div>';
    h+='<div class="bpa-tot"><span>'+esc(t('qPieces',{n:T.pieces}))+(T.pend?' · '+esc(t('qPend',{n:T.pend})):'')+'</span>'+(T.sub>0?'<span>'+esc(t('qSub'))+': <strong>'+money(T.sub)+' MXN</strong></span>':'')+'</div>';
    h+='<div class="bpa-form">';
    h+='<label><span class="bpa-lbl">'+esc(t('fName'))+'</span><input class="bpa-inp" id="bpaNom" autocomplete="name" maxlength="80"></label>';
    h+='<label><span class="bpa-lbl">'+esc(t('fTel'))+'</span><input class="bpa-inp" id="bpaTel" type="tel" inputmode="tel" autocomplete="tel" maxlength="20"></label>';
    h+='<label class="full"><span class="bpa-lbl">'+esc(t('fCity'))+'</span><select class="bpa-sel" id="bpaCiu"><option>Mexicali, B.C.</option><option>San Felipe, B.C.</option></select></label>';
    h+='<label class="full"><span class="bpa-lbl">'+esc(t('fNotes'))+'</span><input class="bpa-inp" id="bpaNot" maxlength="200"></label>';
    h+='</div><div class="bpa-err" id="bpaErr" role="alert"></div>';
    h+='<div class="bpa-acts"><button type="button" class="bpa-btn wa wide" id="bpaSend" data-bpa-send="1">'+esc(t('send'))+'</button>';
    if(T.pend===0&&T.sub>0)h+='<button type="button" class="bpa-btn sec wide" data-bpa-tocart="1">'+esc(t('toCart'))+'</button>';
    h+='<button type="button" class="bpa-link" data-bpa-clear="1" style="align-self:center">'+esc(t('clear'))+'</button></div>';
    h+='<p class="bpa-note">'+esc(t('qNote'))+'</p></div>';
    d.innerHTML=h;
    for(var id in keep){var el=$(id);if(el&&keep[id])el.value=keep[id]}
  }
  function openQuote(){var d=$('bpaQ');if(!d)return;renderQuote();if(!d.open&&d.showModal)d.showModal()}

  function mkFolio(){var s='BP-',ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(var i=0;i<6;i++)s+=ch[Math.floor(Math.random()*ch.length)];return s}
  function docHTML(folio,c){
    var T=quoteTotals();
    var td='padding:6px 8px;border-bottom:1px solid #eee;font-size:11px;vertical-align:top';
    var rows=state.quote.map(function(q){
      var e=SKU[q.sku],pr=price(q.sku);
      return '<tr><td style="'+td+'"><b>'+esc(fullName(e.p,e.v))+'</b><br><span style="color:#666">B-Roller · '+esc(e.v.clave)+'</span></td>'+
        '<td style="'+td+';text-align:center">'+q.qty+'</td>'+
        '<td style="'+td+';text-align:right">'+(pr>0?money(pr):esc(t('tbq')))+'</td>'+
        '<td style="'+td+';text-align:right;font-weight:700">'+(pr>0?money(pr*q.qty):'—')+'</td></tr>';
    }).join('');
    var th='padding:6px 8px;background:#17171a;color:#fff;font-size:10px;text-transform:uppercase;letter-spacing:.4px';
    var row=function(a,b){return b?'<div style="display:flex;justify-content:space-between;gap:10px;font-size:11.5px;margin:2px 0"><span style="color:#666">'+esc(a)+'</span><b style="text-align:right">'+esc(b)+'</b></div>':''};
    return '<div style="font-family:Arial,Helvetica,sans-serif;color:#111;background:#fff;padding:14px">'+
      '<div style="border-bottom:3px solid #f97316;padding-bottom:8px;margin-bottom:10px"><div style="font-size:18px;font-weight:800;color:#f97316">BOLT PAINT</div>'+
      '<div style="font-size:12px;font-weight:700;letter-spacing:.5px">'+esc(t('docTitle'))+'</div></div>'+
      row(t('docFolio'),folio)+row(t('docDate'),c.fecha)+row(t('docClient'),c.nombre)+row(t('docTel'),c.tel)+row(t('docCity'),c.ciudad)+row(t('docNotes'),c.notas)+
      '<table style="width:100%;border-collapse:collapse;margin-top:10px"><thead><tr><th style="'+th+';text-align:left">'+esc(t('docItem'))+'</th><th style="'+th+'">'+esc(t('docQty'))+'</th><th style="'+th+';text-align:right">'+esc(t('docUnit'))+'</th><th style="'+th+';text-align:right">'+esc(t('docAmt'))+'</th></tr></thead><tbody>'+rows+'</tbody></table>'+
      (T.sub>0?'<div style="display:flex;justify-content:space-between;margin-top:10px;font-size:13px;font-weight:800"><span>'+esc(T.pend?t('docTotalPart'):t('docTotal'))+'</span><span style="color:#f97316">'+money(T.sub)+' MXN</span></div>':'')+
      (T.pend?'<div style="margin-top:6px;font-size:11.5px;font-weight:700">'+esc(t('qPend',{n:T.pend}))+'</div>':'')+
      '<div style="margin-top:10px;font-size:10px;line-height:1.45;border:1px dashed #bbb;border-radius:8px;padding:7px 9px;color:#333">'+esc(t('docWarn'))+'</div>'+
      '<div style="margin-top:10px;font-size:9.5px;color:#666;text-align:center">'+esc(t('docBrand'))+'</div></div>';
  }
  function waText(folio,c){
    var T=quoteTotals();
    var lines=[t('waHead'),t('docFolio')+': '+folio,t('waClient')+': '+c.nombre];
    state.quote.forEach(function(q){var e=SKU[q.sku],pr=price(q.sku);lines.push('• '+q.qty+' × '+fullName(e.p,e.v)+' ('+e.v.clave+')'+(pr>0?' · '+money(pr*q.qty):' · '+t('waPend')))});
    if(T.sub>0&&!T.pend)lines.push(t('waTotal')+': '+money(T.sub)+' MXN');
    lines.push(t('waPdf')+' (Cotizacion-'+folio+'.pdf).');
    return lines.join('\n');
  }
  function loadPdfLib(cb){
    if(window.html2pdf){cb(true);return}
    if(loadPdfLib._q){loadPdfLib._q.push(cb);return}
    loadPdfLib._q=[cb];
    var s=document.createElement('script');s.src=PDF_LIB;
    var fin=function(ok){var q=loadPdfLib._q;loadPdfLib._q=null;if(q)q.forEach(function(f){f(ok&&!!window.html2pdf)})};
    s.onload=function(){fin(true)};s.onerror=function(){fin(false)};
    document.head.appendChild(s);
  }
  function pdfBlob(html,cb){
    loadPdfLib(function(ok){
      if(!ok){cb(null);return}
      var stage=document.createElement('div');stage.setAttribute('data-i18n-skip','1');
      stage.style.cssText='position:absolute;left:-10000px;top:0;width:440px;background:#fff;z-index:-1';
      var n=document.createElement('div');n.innerHTML=html;stage.appendChild(n);document.body.appendChild(stage);
      var cleanup=function(){try{stage.remove()}catch(e){}};
      try{
        window.html2pdf().set({margin:[10,12,12,12],image:{type:'jpeg',quality:0.95},html2canvas:{scale:2,useCORS:true,scrollX:0,scrollY:0,windowWidth:document.documentElement.clientWidth},jsPDF:{unit:'mm',format:'a4',orientation:'portrait'},pagebreak:{mode:['css','legacy']}})
          .from(n).outputPdf('blob').then(function(b){cleanup();cb(b)}).catch(function(e){cleanup();console.error('bolt-accesorios pdf:',e);cb(null)});
      }catch(e){cleanup();console.error('bolt-accesorios pdf:',e);cb(null)}
    });
  }
  function downloadLast(){
    if(!state.lastBlob)return;
    try{var u=URL.createObjectURL(state.lastBlob);var a=document.createElement('a');a.href=u;a.download='Cotizacion-'+state.lastFolio+'.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000)}catch(e){}
  }
  function shareLast(text){
    var fname='Cotizacion-'+state.lastFolio+'.pdf',blob=state.lastBlob;
    var openWa=function(){try{window.open(state.lastWa,'_blank','noopener')}catch(e){}};
    if(!blob){openWa();return}
    var file=null;try{file=new File([blob],fname,{type:'application/pdf'})}catch(e){}
    if(file&&navigator.canShare&&navigator.canShare({files:[file]})&&navigator.share){
      navigator.share({files:[file],title:fname,text:text}).catch(function(err){if(err&&err.name==='AbortError')return;downloadLast();openWa()});
    }else{downloadLast();openWa()}
  }
  function sendQuote(){
    if(!state.quote.length)return;
    var nom=(($('bpaNom')||{}).value||'').trim(),tel=(($('bpaTel')||{}).value||'').trim();
    var err=$('bpaErr');
    if(nom.length<3){if(err)err.textContent=t('eName');if($('bpaNom'))$('bpaNom').focus();return}
    if(tel.replace(/\D/g,'').length<10){if(err)err.textContent=t('eTel');if($('bpaTel'))$('bpaTel').focus();return}
    if(err)err.textContent=t('working');
    var btn=$('bpaSend');if(btn)btn.disabled=true;
    var c={nombre:nom,tel:tel,ciudad:(($('bpaCiu')||{}).value||'Mexicali, B.C.'),notas:(($('bpaNot')||{}).value||'').trim(),
      fecha:new Date().toLocaleDateString(locale(),{day:'numeric',month:'short',year:'numeric'})};
    var folio=mkFolio(),T=quoteTotals(),doc=docHTML(folio,c),text=waText(folio,c);
    var pedido={
      id:folio,tipo:'cotizacion',origen:'accesorios',modo:'accesorios',
      nombre:nom,telefono:tel,direccion:'Cotización de accesorios · '+c.ciudad,
      total:Math.round(T.sub),fecha:new Date().toLocaleDateString('es-MX'),
      items:state.quote.map(function(q){var e=SKU[q.sku],pr=price(q.sku);return {id:'acc-'+q.sku,sku:q.sku,nombre:e.p.nombre.es+' '+e.v.cells.map(function(x){return x.es}).join(' · ')+' ('+e.v.clave+')'+(pr>0?'':' — por cotizar'),qty:q.qty,pr:pr}}),
      status:'nueva',pago:'Cotización (por definir)',
      notas:'Cotización de accesorios B-Roller'+(c.notas?' · '+c.notas:''),
      docHTML:doc
    };
    try{pedido=JSON.parse(JSON.stringify(pedido))}catch(e){}
    if(window.saveOrderToFirebase){try{window.saveOrderToFirebase(pedido)}catch(e){console.error('bolt-accesorios guardado:',e)}}
    state.lastFolio=folio;state.lastWa='https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(text);
    pdfBlob(doc,function(blob){
      state.lastBlob=blob;
      renderQuote(true);
      shareLast(text);
    });
  }
  function moveToCart(){
    var ok=true;
    state.quote.forEach(function(q){if(!addCart(q.sku,q.qty,true))ok=false});
    if(!ok)return;
    state.quote=[];saveQuote();renderBar();
    var d=$('bpaQ');if(d&&d.open)d.close();
    say(t('tMoved'));
    if(typeof window.openCart==='function')window.openCart();
  }

  /* ===================== EVENTOS ===================== */
  function closest(el,attr){while(el&&el.nodeType===1){if(el.hasAttribute(attr))return el;el=el.parentNode}return null}
  document.addEventListener('click',function(ev){
    var x=ev.target,e;
    if((e=closest(x,'data-bpa-go'))){state.cat=e.getAttribute('data-bpa-go');renderSection();var sc=$('accesorios');if(sc)sc.scrollIntoView({behavior:'smooth'});return}
    if((e=closest(x,'data-bpa-cat'))){state.cat=e.getAttribute('data-bpa-cat');renderSection();return}
    if((e=closest(x,'data-bpa-open'))){openDetail(e.getAttribute('data-bpa-open'));return}
    if((e=closest(x,'data-bpa-close'))){var d=$(e.getAttribute('data-bpa-close'));if(d&&d.open)d.close();return}
    if((e=closest(x,'data-bpa-add'))){var p=P.filter(function(z){return z.id===e.getAttribute('data-bpa-add')})[0];if(p)addCart(selVar(p).sku,1);return}
    if((e=closest(x,'data-bpa-quote'))){var p2=P.filter(function(z){return z.id===e.getAttribute('data-bpa-quote')})[0];if(p2)addQuote(selVar(p2).sku);return}
    if((e=closest(x,'data-bpa-addsku'))){addCart(e.getAttribute('data-bpa-addsku'),1);return}
    if((e=closest(x,'data-bpa-quotesku'))){addQuote(e.getAttribute('data-bpa-quotesku'));return}
    if((e=closest(x,'data-bpa-qty'))){
      var sku=e.getAttribute('data-sku'),dl=parseInt(e.getAttribute('data-bpa-qty'),10);
      var q=state.quote.filter(function(z){return z.sku===sku})[0];
      if(q){q.qty+=dl;if(q.qty<=0)state.quote=state.quote.filter(function(z){return z!==q})}
      saveQuote();renderBar();renderQuote();return;
    }
    if(closest(x,'data-bpa-send')){sendQuote();return}
    if(closest(x,'data-bpa-tocart')){moveToCart();return}
    if(closest(x,'data-bpa-clear')){state.quote=[];saveQuote();renderBar();renderQuote();return}
    if(closest(x,'data-bpa-dl')){downloadLast();return}
    if(closest(x,'data-bpa-done')){state.quote=[];state.lastBlob=null;saveQuote();renderBar();var dq=$('bpaQ');if(dq&&dq.open)dq.close();return}
    if(x&&x.id==='bpaBar'||closest(x,'data-bpa-bar')){openQuote();return}
    if(x&&(x.id==='bpaDlg'||x.id==='bpaQ')&&x.open){x.close();return}
  });
  document.addEventListener('change',function(ev){
    var e=ev.target;
    if(e&&e.hasAttribute&&e.hasAttribute('data-bpa-sel')){
      var id=e.getAttribute('data-bpa-sel');state.sel[id]=parseInt(e.value,10)||0;
      var p=P.filter(function(z){return z.id===id})[0],b=$('bpaBuy-'+id);
      if(p&&b)b.innerHTML=buyHTML(p);
    }
  });

  /* ===================== INICIO ===================== */
  function mount(){
    if(!$('accesorios'))return;
    if(!$('bp-acc-css')){var st=document.createElement('style');st.id='bp-acc-css';st.textContent=CSS;document.head.appendChild(st)}
    if(!$('bpaDlg')){var d=document.createElement('dialog');d.id='bpaDlg';d.className='bpa-dlg';document.body.appendChild(d)}
    if(!$('bpaQ')){var q=document.createElement('dialog');q.id='bpaQ';q.className='bpa-dlg q';document.body.appendChild(q)}
    if(!$('bpaBar')){var b=document.createElement('button');b.id='bpaBar';b.type='button';b.setAttribute('data-bpa-bar','1');b.className='bpa-hide';document.body.appendChild(b)}
    renderSection();renderBar();renderPromo();
  }
  window.addEventListener('bp:lang',function(){
    renderSection();renderBar();renderPromo();
    var q=$('bpaQ');if(q&&q.open)renderQuote(state.ok);
    var d=$('bpaDlg');if(d&&d.open)d.close();
  });
  window.bpAccesorios={open:function(){var s=$('accesorios');if(s)s.scrollIntoView({behavior:'smooth'})},quote:openQuote,prices:PRICES,catalog:P};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount);else mount();
})();
