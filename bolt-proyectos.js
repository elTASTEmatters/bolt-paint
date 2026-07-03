/*
  Bolt Paint · Proyectos (Comercial / Industrial) — Fase 2
  --------------------------------------------------------
  Pieza AISLADA que se engancha al sitio sin tocar la tienda ni el checkout.
  - Lee el catálogo real window.DP (colores + precios litro/galon/cubeta).
  - Precios de servicio embebidos en PRECIOS_SERVICIOS (editables; en una fase
    posterior se alimentan desde el panel admin, igual que DP).
  - Cliente arma su cotización y genera una PRE-PROPUESTA (PDF) o la envía por
    WhatsApp. (Guardado en Firestore = Fase 3; pago Mercado Pago = Fase 4.)
  Expone: window.bpOpen('comercial'|'industrial'), window.bpClose()
*/
(function(){
  'use strict';

  // ===== Precios de servicio (referencia · editar aquí o vía admin más adelante) =====
  var PRECIOS_SERVICIOS = {
    aplicacion:{comercial:45, industrial:38},
    aislamiento:65,
    resanacion:[
      {k:'grietas',n:'Grietas y fisuras',p:120},
      {k:'humedad',n:'Humedad y manchas',p:180},
      {k:'desconches',n:'Desconches y golpes',p:90},
      {k:'juntas',n:'Juntas, molduras y plafón',p:140},
      {k:'yeso',n:'Resane de yeso / tablaroca',p:160}
    ],
    planes:{
      basico:{n:'Básico Anual',dP:0.15,dA:0,dI:0},
      corporativo:{n:'Corporativo',dP:0.15,dA:0.15,dI:0},
      premium:{n:'Premium',dP:0.15,dA:0.15,dI:0.15}
    },
    parametros:{rendimiento:10, cap_cubeta:19, cap_galon:3.785, cap_litro:1, manos:2}
  };
  var WA_NUMBER='526862625119';

  var MODE_TXT={
    comercial:{eye:'Comercial y Oficinas',rate:PRECIOS_SERVICIOS.aplicacion.comercial,doc:'oficinas y espacios comerciales',
      lead:'Acabados profesionales, duraderos y con mantenimiento garantizado para espacios corporativos.'},
    industrial:{eye:'Naves Industriales',rate:PRECIOS_SERVICIOS.aplicacion.industrial,doc:'naves industriales y superficies de alto rendimiento',
      lead:'Protección y durabilidad de grandes superficies, con soluciones personalizadas de alto rendimiento.'}
  };

  var money=function(n){return '$'+Math.round(n).toLocaleString('es-MX')};
  function DPcat(){return (window.DP||[]).map(function(p){return {n:p.nombre,h:p.hex,c:p.cat,litro:p.litro,galon:p.galon,cubeta:p.cubeta}})}

  var state={mode:'comercial',color:0,search:'',cat:'Todos',paints:[],res:{},plan:'ninguno',planInterest:false,igType:'Vinílica',igualaciones:[]};
  PRECIOS_SERVICIOS.resanacion.forEach(function(r){state.res[r.k]=0});

  // ===== CSS (scoped .bp-) =====
  var CSS=''+
  '#bpOverlay{position:fixed;inset:0;z-index:600;background:#F3F2EE;color:#191D26;overflow-y:auto;display:none;font-family:"Archivo",system-ui,sans-serif}'+
  '#bpOverlay.bp-open{display:block}'+
  '#bpOverlay[data-mode="industrial"]{background:#101217;color:#E9ECF1}'+
  '#bpOverlay .bp-vars{--panel:#fff;--panel2:#F6F4EF;--muted:#5C6473;--line:#E4E0D8;--blue:#2F6FE0;--bsoft:#EAF1FF;--chip:#F0EDE6;--acc:#F47A00}'+
  '#bpOverlay[data-mode="industrial"] .bp-vars{--panel:#1B2029;--panel2:#161A22;--muted:#959DAB;--line:#2A3038;--blue:#3C7BC0;--bsoft:#14304F;--chip:#222833;--acc:#F47A00}'+
  '.bp-top{position:sticky;top:0;z-index:5;background:#0B0B0C;color:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:12px 18px;border-bottom:1px solid rgba(255,255,255,.08)}'+
  '.bp-top .bp-b{font-family:"Syne","Archivo",sans-serif;font-weight:800;font-size:20px}.bp-top .bp-b em{color:#F47A00;font-style:normal}'+
  '.bp-seg{display:flex;gap:6px;background:#17171a;border:1px solid #2a2a2e;border-radius:999px;padding:5px}'+
  '.bp-seg button{border:none;background:transparent;color:#aaa;font-weight:700;font-size:13px;padding:8px 16px;border-radius:999px;cursor:pointer}'+
  '.bp-seg button[aria-pressed="true"]{background:linear-gradient(135deg,#F47A00,#FF9A3D);color:#1a0f00}'+
  '.bp-close{background:#1c1c1f;border:1px solid #2e2e33;color:#fff;border-radius:999px;padding:8px 14px;font-weight:700;font-size:13px;cursor:pointer}'+
  '.bp-wrap{max-width:1180px;margin:0 auto;padding:18px 18px 80px}'+
  '.bp-hero{border:1px solid var(--line);border-radius:16px;background:var(--panel);padding:24px;margin-bottom:18px}'+
  '.bp-eye{display:inline-block;font-weight:700;font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:var(--acc);background:rgba(244,122,0,.12);border-radius:999px;padding:6px 12px}'+
  '.bp-hero h2{font-family:"Syne","Archivo",sans-serif;font-weight:800;font-size:clamp(24px,4vw,38px);margin:12px 0 6px;text-transform:none}'+
  '.bp-hero p{color:var(--muted);margin:0;font-size:15px;max-width:640px}'+
  '.bp-builder{display:grid;grid-template-columns:1fr 340px;gap:18px;align-items:start}'+
  '@media(max-width:900px){.bp-builder{grid-template-columns:1fr}}'+
  '.bp-steps{display:flex;flex-direction:column;gap:14px}'+
  '.bp-step{background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:20px}'+
  '.bp-sh{display:flex;align-items:center;gap:10px;margin-bottom:4px}'+
  '.bp-idx{font-family:"Syne","Archivo",sans-serif;font-weight:800;font-size:12px;color:var(--acc);border:1px solid var(--acc);border-radius:8px;padding:3px 9px}'+
  '.bp-step h3{font-size:17px;margin:0;font-weight:800}'+
  '.bp-desc{color:var(--muted);font-size:13px;margin:2px 0 0;line-height:1.5}'+
  '.bp-ref{font-size:10px;font-weight:700;color:var(--blue);background:var(--bsoft);border-radius:6px;padding:2px 7px;margin-left:6px}'+
  '.bp-srch{display:flex;align-items:center;gap:8px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin-top:12px}'+
  '.bp-srch input{border:none;background:transparent;color:inherit;font-size:14px;width:100%;outline:none;font-family:inherit}'+
  '.bp-cats{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}'+
  '.bp-cat{font-size:12px;font-weight:600;border:1px solid var(--line);background:var(--panel2);color:var(--muted);border-radius:999px;padding:6px 11px;cursor:pointer;text-transform:capitalize}'+
  '.bp-cat[aria-pressed="true"]{border-color:var(--acc);color:var(--acc)}'+
  '.bp-sel{display:flex;align-items:center;gap:10px;margin-top:12px;font-size:13px;color:var(--muted)}.bp-sel b{color:inherit}'+
  '.bp-selsw{width:24px;height:24px;border-radius:6px;box-shadow:0 0 0 1px var(--line)}'+
  '.bp-sws{display:grid;grid-template-columns:repeat(auto-fill,minmax(38px,1fr));gap:8px;margin-top:10px;max-height:170px;overflow:auto;padding:4px;border:1px solid var(--line);border-radius:10px;background:var(--panel2)}'+
  '.bp-sw{aspect-ratio:1;border-radius:8px;border:2px solid transparent;cursor:pointer;position:relative;box-shadow:0 0 0 1px var(--line)}'+
  '.bp-sw[aria-pressed="true"]{border-color:var(--acc);box-shadow:0 0 0 2px var(--acc)}'+
  '.bp-sw .bp-tip{position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);font-size:10px;white-space:nowrap;background:#111;color:#fff;padding:3px 7px;border-radius:6px;opacity:0;pointer-events:none;z-index:9}'+
  '.bp-sw:hover .bp-tip{opacity:1}'+
  '.bp-calc{margin-top:14px;background:var(--panel2);border:1px solid var(--line);border-radius:12px;padding:14px}'+
  '.bp-row{display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end}'+
  '.bp-f{display:flex;flex-direction:column;gap:5px}.bp-f label{font-size:12px;color:var(--muted);font-weight:600}'+
  '.bp-f input,.bp-f select,.bp-f textarea{background:var(--panel);border:1px solid var(--line);border-radius:8px;padding:9px 10px;color:inherit;font-family:inherit;font-weight:600;font-size:14px}'+
  '.bp-f input{width:96px}.bp-f textarea{width:100%;min-height:60px;font-weight:400;resize:vertical}'+
  '.bp-prev{margin-top:12px;font-size:13px;background:var(--panel);border:1px dashed var(--line);border-radius:10px;padding:12px}.bp-prev b{color:var(--acc)}'+
  '.bp-add{font-weight:700;font-size:13px;border:1px solid var(--acc);color:var(--acc);background:transparent;border-radius:10px;padding:10px 16px;cursor:pointer;font-family:inherit}'+
  '.bp-add:hover{background:var(--acc);color:#1a0f00}'+
  '.bp-list{margin-top:12px;display:flex;flex-direction:column;gap:7px}'+
  '.bp-li{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:9px;padding:8px 12px;font-size:13px}'+
  '.bp-li .bp-dot{width:13px;height:13px;border-radius:4px;display:inline-block;margin-right:8px;vertical-align:-2px;box-shadow:0 0 0 1px var(--line)}'+
  '.bp-li small{color:var(--muted)}.bp-li button{background:none;border:none;color:#c0392b;cursor:pointer;font-size:15px;font-weight:700}'+
  '.bp-tog{display:flex;align-items:center;gap:10px;margin-top:8px;cursor:pointer;font-size:14px}.bp-tog input{width:18px;height:18px;accent-color:var(--acc)}'+
  '.bp-out{margin-top:12px;font-size:13px;color:var(--muted)}.bp-out b{font-family:"Syne","Archivo",sans-serif;font-weight:800;font-size:20px;color:var(--acc)}'+
  '.bp-rep{margin-top:12px;display:flex;flex-direction:column;gap:8px}'+
  '.bp-item{display:flex;align-items:center;justify-content:space-between;gap:10px;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:8px 10px 8px 14px}'+
  '.bp-item .bp-pr{font-size:11px;color:var(--muted);margin-left:6px}'+
  '.bp-stp{display:flex;align-items:center;gap:8px}.bp-stp button{width:30px;height:30px;border-radius:8px;border:1px solid var(--line);background:var(--panel);color:inherit;font-size:16px;cursor:pointer;font-weight:700}'+
  '.bp-stp button:hover{border-color:var(--acc);color:var(--acc)}.bp-stp .bp-v{min-width:22px;text-align:center;font-weight:800}'+
  '.bp-plans{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px;margin-top:12px}'+
  '.bp-plan{border:1px solid var(--line);border-radius:12px;padding:14px;cursor:pointer;background:var(--panel2)}'+
  '.bp-plan[aria-pressed="true"]{border-color:var(--acc);box-shadow:0 0 0 2px rgba(244,122,0,.35) inset}'+
  '.bp-plan .bp-pn{font-weight:800;font-size:14px}.bp-plan .bp-inc{font-size:12px;color:var(--muted);margin-top:5px;line-height:1.4}'+
  '.bp-plan .bp-disc{margin-top:9px;font-size:11px;font-weight:700;color:var(--blue);background:var(--bsoft);border-radius:6px;padding:3px 8px;display:inline-block}'+
  '.bp-pw{display:none}.bp-pw.bp-show{display:block}'+
  '.bp-ais{margin-top:12px;background:var(--panel2);border:1px dashed var(--line);border-radius:10px;padding:14px;display:none}.bp-ais.bp-show{display:block}'+
  '.bp-g2{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:520px){.bp-g2{grid-template-columns:1fr}}.bp-full{grid-column:1/-1}'+
  '.bp-crow{display:flex;align-items:center;gap:10px}.bp-crow input[type=color]{padding:3px;height:40px;width:60px;border:1px solid var(--line);border-radius:8px;background:var(--panel)}.bp-crow .bp-cp{flex:1;height:40px;border-radius:8px;border:1px solid var(--line)}'+
  '.bp-uses{display:flex;flex-wrap:wrap;gap:8px;margin-top:4px}'+
  '.bp-uchip{display:flex;align-items:center;gap:7px;border:1px solid var(--line);background:var(--panel);border-radius:999px;padding:7px 12px;font-size:13px;cursor:pointer}.bp-uchip input{accent-color:var(--acc)}'+
  '.bp-segb{display:flex;gap:8px;flex-wrap:wrap}.bp-segb button{font-weight:700;font-size:13px;border:1px solid var(--line);background:var(--panel);color:var(--muted);border-radius:9px;padding:9px 14px;cursor:pointer;font-family:inherit}.bp-segb button[aria-pressed="true"]{border-color:var(--acc);color:var(--acc)}'+
  '.bp-igc{display:flex;gap:10px;align-items:flex-start;justify-content:space-between;background:var(--panel2);border:1px solid var(--line);border-radius:10px;padding:10px 12px;font-size:13px}.bp-igc .bp-sw2{width:32px;height:32px;border-radius:8px;box-shadow:0 0 0 1px var(--line);flex:none}.bp-igc .bp-info b{font-size:14px}.bp-igc small{color:var(--muted);display:block;margin-top:2px}.bp-igc button{background:none;border:none;color:#c0392b;cursor:pointer;font-size:15px;font-weight:700}'+
  '.bp-sum{position:sticky;top:74px;background:var(--panel);border:1px solid var(--line);border-radius:16px;padding:18px}'+
  '.bp-sum h4{font-weight:800;font-size:15px;margin:0 0 4px}'+
  '.bp-sl{display:flex;justify-content:space-between;gap:10px;font-size:13px;padding:8px 0;border-bottom:1px dashed var(--line)}.bp-sl .bp-lbl{color:var(--muted)}.bp-sl.bp-d{color:var(--blue)}'+
  '.bp-empty{color:var(--muted);font-size:13px;padding:12px 0}'+
  '.bp-total{display:flex;justify-content:space-between;align-items:baseline;margin-top:12px}.bp-total .bp-t{font-family:"Syne","Archivo",sans-serif;font-weight:800;font-size:28px;color:var(--acc)}'+
  '.bp-note{margin-top:10px;font-size:12px;color:var(--muted);background:var(--panel2);border-radius:8px;padding:8px 10px}'+
  '.bp-cta{margin-top:14px;display:flex;flex-direction:column;gap:8px}'+
  '.bp-btn{font-weight:700;font-size:14px;border-radius:11px;padding:13px;cursor:pointer;border:1px solid transparent;font-family:inherit;text-align:center}'+
  '.bp-solid{background:linear-gradient(135deg,#F47A00,#FF9A3D);color:#1a0f00}.bp-wa{background:#25d366;color:#fff;text-decoration:none;display:block}.bp-lineb{background:transparent;border:1px solid var(--line);color:inherit}'+
  '.bp-hint{font-size:11px;color:var(--muted);margin-top:6px;text-align:center}'+
  '.bp-pnote{margin-top:20px;font-size:12px;color:var(--muted);border-left:3px solid var(--blue);padding:10px 14px;background:var(--panel2);border-radius:0 10px 10px 0}'+
  // modal receipt
  '#bpModal{position:fixed;inset:0;background:rgba(0,0,0,.6);display:none;align-items:flex-start;justify-content:center;padding:26px 14px;z-index:700;overflow:auto}#bpModal.bp-open{display:flex}'+
  '.bp-rc{background:#fff;color:#111;max-width:420px;width:100%;border-radius:12px;padding:24px;box-shadow:0 30px 80px rgba(0,0,0,.5);font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.5}'+
  '.bp-rc .bp-rch{text-align:center;margin-bottom:8px}.bp-rc .bp-rlogo{font-family:"Syne","Archivo",sans-serif;font-weight:800;font-size:24px}.bp-rc .bp-rlogo em{color:#F47A00;font-style:normal}'+
  '.bp-rc .bp-rsub{font-size:11px;color:#555}.bp-rc .bp-rtype{margin-top:8px;font-weight:600;letter-spacing:1px;background:#111;color:#fff;display:inline-block;padding:3px 10px;border-radius:4px;font-size:11px}'+
  '.bp-rc hr{border:none;border-top:1px dashed #999;margin:11px 0}.bp-rc .bp-rr{display:flex;justify-content:space-between;gap:10px}.bp-rc .bp-rr.bp-s{font-size:11px;color:#555}'+
  '.bp-rc .bp-rit{margin:5px 0}.bp-rc .bp-rit .bp-l1{display:flex;justify-content:space-between;font-weight:600}.bp-rc .bp-rit .bp-l2{font-size:11px;color:#666}'+
  '.bp-rc .bp-rtot{display:flex;justify-content:space-between;font-family:"Syne","Archivo",sans-serif;font-weight:800;font-size:21px;margin-top:6px}.bp-rc .bp-rtot b{color:#F47A00}'+
  '.bp-rc .bp-rfoot{text-align:center;font-size:11px;color:#555;margin-top:11px}.bp-rc .bp-rbar{display:flex;gap:10px;justify-content:center;margin-bottom:12px;flex-wrap:wrap}'+
  '.bp-rc .bp-rbar button,.bp-rc .bp-rbar a{font-family:"Archivo",sans-serif;font-weight:700;font-size:12px;border-radius:8px;padding:8px 12px;cursor:pointer;border:1px solid #ddd;background:#fff;color:#111;text-decoration:none}'+
  '.bp-rc .bp-rbar .bp-pdf{background:#F47A00;border-color:#F47A00;color:#1a0f00}.bp-rc .bp-rbar .bp-wag{background:#25d366;border-color:#25d366;color:#fff}'+
  '@media print{body>*{visibility:hidden!important}#bpModal,#bpModal *{visibility:visible!important}#bpModal{position:absolute;background:#fff;padding:0}.bp-rbar{display:none!important}.bp-rc{box-shadow:none}}';

  // ===== overlay HTML =====
  var HTML=''+
  '<div class="bp-vars">'+
  '<div class="bp-top">'+
    '<div class="bp-b">Bolt <em>⚡</em> Paint · Proyectos</div>'+
    '<div class="bp-seg"><button id="bpTcom" aria-pressed="true" onclick="bpOpen(\'comercial\')">Comercial y Oficinas</button><button id="bpTind" aria-pressed="false" onclick="bpOpen(\'industrial\')">Industrial</button></div>'+
    '<button class="bp-close" onclick="bpClose()">✕ Volver a la tienda</button>'+
  '</div>'+
  '<div class="bp-wrap">'+
    '<div class="bp-hero"><span class="bp-eye" id="bpEye">Comercial y Oficinas</span><h2>Arma tu cotización</h2><p id="bpLead"></p></div>'+
    '<div class="bp-builder"><div class="bp-steps">'+

    // A
    '<div class="bp-step"><div class="bp-sh"><span class="bp-idx">A</span><h3>Selección y compra de pintura <span class="bp-ref">precio de línea</span></h3></div>'+
    '<p class="bp-desc">Busca tu color; la calculadora te dice cuántas cubetas, galones y litros necesitas. Puedes agregar varios tonos.</p>'+
    '<div class="bp-srch">🔎 <input id="bpSearch" placeholder="Buscar color por nombre…" oninput="bpOnSearch(this.value)"></div>'+
    '<div class="bp-cats" id="bpCats"></div>'+
    '<div class="bp-sel">Seleccionado: <span class="bp-selsw" id="bpSelSw"></span> <b id="bpSelName">—</b></div>'+
    '<div class="bp-sws" id="bpSws"></div>'+
    '<div class="bp-calc"><div style="font-weight:800;font-size:13px;margin-bottom:6px">🧮 Calculadora de pintura</div>'+
    '<div class="bp-row"><div class="bp-f"><label>Área (m²)</label><input type="number" id="bpArea" value="40" min="0" oninput="bpCalcPrev()"></div>'+
    '<div class="bp-f"><label>Manos</label><input type="number" id="bpCoats" value="2" min="1" oninput="bpCalcPrev()"></div>'+
    '<div class="bp-f"><label>Rendimiento (m²/L)</label><input type="number" id="bpYield" value="10" min="1" oninput="bpCalcPrev()"></div></div>'+
    '<div class="bp-prev" id="bpPrev"></div>'+
    '<div style="margin-top:12px"><button class="bp-add" onclick="bpAddPaint()">+ Agregar este tono</button></div></div>'+
    '<div class="bp-list" id="bpPaintList"></div></div>'+

    // B
    '<div class="bp-step"><div class="bp-sh"><span class="bp-idx">B</span><h3>Servicio de aplicación <span class="bp-ref">precio ref.</span></h3></div>'+
    '<p class="bp-desc">Mano de obra por m². Sujeto a inspección. Se suma a la misma cotización.</p>'+
    '<label class="bp-tog"><input type="checkbox" id="bpAplOn" onchange="bpRecompute()"> Incluir servicio de aplicación</label>'+
    '<label class="bp-tog"><input type="checkbox" id="bpAplCalc" onchange="bpUpdateAplArea()"> Usar los m² de la calculadora (<span id="bpAreaTot">0</span> m²)</label>'+
    '<div class="bp-row"><div class="bp-f"><label>Área (m²)</label><input type="number" id="bpAplArea" value="120" min="0" oninput="bpRecompute()"></div>'+
    '<div class="bp-f"><label>$/m²</label><input type="number" id="bpAplRate" value="45" min="0" oninput="bpRecompute()"></div></div>'+
    '<div class="bp-out">Subtotal: <b id="bpAplOut">$0</b></div></div>'+

    // C
    '<div class="bp-step"><div class="bp-sh"><span class="bp-idx">C</span><h3>Resanación de superficies <span class="bp-ref">precio ref.</span></h3></div>'+
    '<p class="bp-desc">Estima áreas/secciones, detalla por tipo y deja comentarios. Se suma a la cotización.</p>'+
    '<div class="bp-row"><div class="bp-f"><label>Áreas / secciones estimadas</label><input type="number" id="bpResSec" value="0" min="0"></div></div>'+
    '<div class="bp-rep" id="bpRepList"></div>'+
    '<div class="bp-f" style="margin-top:12px"><label>Comentarios</label><textarea id="bpResCom" placeholder="Ej. Humedad en muro norte, grietas en columna…"></textarea></div>'+
    '<div class="bp-out">Subtotal: <b id="bpResOut">$0</b> · <span id="bpResCount">0</span> reparaciones</div></div>'+

    // D
    '<div class="bp-step"><div class="bp-sh"><span class="bp-idx">D</span><h3>Planes de mantenimiento</h3></div>'+
    '<p class="bp-desc">¿Te interesa un plan con póliza de pintura? Se suma a la cotización.</p>'+
    '<label class="bp-tog"><input type="checkbox" id="bpPlanInt" onchange="bpTogglePlan()"> Sí, me interesa un plan</label>'+
    '<div class="bp-pw" id="bpPw"><div class="bp-plans" id="bpPlans"></div>'+
    '<div class="bp-ais" id="bpAis"><b>Recubrimiento de aislamiento (Premium)</b>'+
    '<div class="bp-row"><div class="bp-f"><label>Área aislamiento (m²)</label><input type="number" id="bpAisArea" value="0" min="0" oninput="bpRecompute()"></div>'+
    '<div class="bp-f"><label>$/m²</label><input type="number" id="bpAisRate" value="65" min="0" oninput="bpRecompute()"></div></div>'+
    '<div class="bp-out">Subtotal: <b id="bpAisOut">$0</b></div></div></div></div>'+

    // E
    '<div class="bp-step"><div class="bp-sh"><span class="bp-idx">E</span><h3>Solicitud / igualación de pintura especial</h3></div>'+
    '<p class="bp-desc">Solicita la igualación de uno o más tonos. Entre más datos, mejor iguala BPaint Depot.</p>'+
    '<div class="bp-calc"><div class="bp-g2">'+
    '<div class="bp-f bp-full"><label>Nombre del tono</label><input type="text" id="bpIgName" placeholder="Ej. Azul Corporativo BP-Steel" style="width:100%"></div>'+
    '<div class="bp-f"><label>¿Otra marca?</label><input type="text" id="bpIgBrand" placeholder="Ej. Comex / Sherwin" style="width:100%"></div>'+
    '<div class="bp-f"><label>Código en esa marca</label><input type="text" id="bpIgCode" placeholder="Ej. 8021" style="width:100%"></div>'+
    '<div class="bp-f bp-full"><label>Color aproximado</label><div class="bp-crow"><input type="color" id="bpIgColor" value="#2F6FE0" oninput="document.getElementById(\'bpIgPrev\').style.background=this.value"><div class="bp-cp" id="bpIgPrev" style="background:#2F6FE0"></div></div></div>'+
    '<div class="bp-f bp-full"><label>¿Para qué se requiere? (selección múltiple)</label><div class="bp-uses" id="bpIgUses">'+
      ['Fachada / exterior','Muros interiores','Plafón / techo','Piso / tránsito','Estructura metálica','Herrería / esmaltado','Señalética / marcado','Zonas húmedas'].map(function(u){return '<label class="bp-uchip"><input type="checkbox" value="'+u+'"> '+u+'</label>'}).join('')+
      '<label class="bp-uchip"><input type="checkbox" value="Otros" id="bpIgOtherChk" onchange="document.getElementById(\'bpIgOther\').style.display=this.checked?\'block\':\'none\'"> Otros</label></div>'+
      '<input type="text" id="bpIgOther" placeholder="Otros: especifica…" style="width:100%;margin-top:8px;display:none"></div>'+
    '<div class="bp-f"><label>Durabilidad</label><select id="bpIgDur"><option>Estándar</option><option>Alta</option><option>Muy alta</option><option>Intemperie severa</option></select></div>'+
    '<div class="bp-f"><label>Ubicación</label><select id="bpIgLoc"><option>Interior</option><option>Exterior</option><option>Interior y exterior</option></select></div>'+
    '<div class="bp-f bp-full"><label>Tipo de pintura</label><div class="bp-segb" id="bpIgType"><button data-t="Vinílica" aria-pressed="true" onclick="bpIgSetType(\'Vinílica\')">Vinílica</button><button data-t="Esmalte" aria-pressed="false" onclick="bpIgSetType(\'Esmalte\')">Esmalte</button><button data-t="No estoy seguro" aria-pressed="false" onclick="bpIgSetType(\'No estoy seguro\')">No estoy seguro</button></div></div>'+
    '<div class="bp-f bp-full"><label>Otros datos para BPaint Depot</label><textarea id="bpIgNotes" placeholder="Acabado, brillo, resistencia química, etc."></textarea></div>'+
    '</div><div style="margin-top:12px"><button class="bp-add" onclick="bpAddIg()">+ Agregar solicitud</button></div></div>'+
    '<div class="bp-list" id="bpIgList"></div></div>'+

    '<div class="bp-pnote"><b>Nota:</b> importes de referencia. En el sitio, la cotización la revisa el administrador y el pago se valida en el servidor. La pre-propuesta no es comprobante fiscal.</div>'+
    '</div>'+

    // resumen
    '<aside class="bp-sum"><h4>Resumen de cotización</h4><div id="bpSumLines"><div class="bp-empty">Aún no agregas nada.</div></div>'+
    '<div class="bp-total"><span class="bp-lbl" style="color:var(--muted);font-size:13px">Total estimado</span><span class="bp-t" id="bpTotal">$0</span></div>'+
    '<div class="bp-note" id="bpSpNote" style="display:none"></div>'+
    '<div class="bp-f" style="margin-top:12px"><label>Nombre / empresa</label><input id="bpCliente" type="text" placeholder="Para tu cotización" style="width:100%"></div>'+
    '<div class="bp-f" style="margin-top:8px"><label>WhatsApp / teléfono</label><input id="bpTel" type="text" placeholder="Para darte seguimiento" style="width:100%"></div>'+
    '<div class="bp-cta"><button class="bp-btn bp-solid" onclick="bpProposal()">📝 Solicitar cotización + PDF</button>'+
    '<a class="bp-btn bp-wa" id="bpWaBtn" href="#" target="_blank" onclick="return bpWhats()">💬 Enviar por WhatsApp</a></div>'+
    '<div class="bp-hint">La cotización genera una pre-propuesta. El pago con tarjeta/OXXO/SPEI se habilita al confirmar.</div></aside>'+

    '</div></div></div>'+
  '<div id="bpModal" onclick="if(event.target===this)bpCloseModal()"><div id="bpModalInner"></div></div>';

  // ===== mount =====
  function mount(){
    if(document.getElementById('bpOverlay'))return;
    var st=document.createElement('style');st.id='bp-styles';st.textContent=CSS;document.head.appendChild(st);
    var ov=document.createElement('div');ov.id='bpOverlay';ov.setAttribute('data-mode','comercial');ov.innerHTML=HTML;document.body.appendChild(ov);
    bpBuildCats();bpBuildReps();bpBuildPlans();
  }

  // ===== nav =====
  window.bpOpen=function(mode){
    mount();
    var ov=document.getElementById('bpOverlay');
    ov.classList.add('bp-open');ov.setAttribute('data-mode',mode);
    state.mode=mode;var t=MODE_TXT[mode];
    document.getElementById('bpEye').textContent=t.eye;
    document.getElementById('bpLead').textContent=t.lead;
    document.getElementById('bpAplRate').value=t.rate;
    document.getElementById('bpTcom').setAttribute('aria-pressed',mode==='comercial');
    document.getElementById('bpTind').setAttribute('aria-pressed',mode==='industrial');
    document.body.style.overflow='hidden';
    state.colors=DPcat();if(state.color>=state.colors.length)state.color=0;
    bpBuildCats();bpBuildSws();bpRecompute();
    ov.scrollTop=0;
  };
  window.bpClose=function(){document.getElementById('bpOverlay').classList.remove('bp-open');document.body.style.overflow=''};

  // ===== A =====
  function bpBuildCats(){
    var cats=['Todos'];bpColors().forEach(function(c){if(cats.indexOf(c.c)===-1)cats.push(c.c)});
    var el=document.getElementById('bpCats');el.innerHTML='';
    cats.forEach(function(cat){var b=document.createElement('button');b.className='bp-cat';b.textContent=cat;b.setAttribute('aria-pressed',state.cat===cat);b.onclick=function(){state.cat=cat;bpBuildCats();bpBuildSws()};el.appendChild(b)});
  }
  function bpColors(){if(!state.colors||!state.colors.length)state.colors=DPcat();return state.colors}
  function bpFiltered(){return bpColors().map(function(c,i){return {c:c,i:i}}).filter(function(o){var okc=state.cat==='Todos'||o.c.c===state.cat;var oks=!state.search||o.c.n.toLowerCase().indexOf(state.search.toLowerCase())>-1;return okc&&oks})}
  window.bpOnSearch=function(v){state.search=v;bpBuildSws()};
  function bpBuildSws(){
    var arr=bpFiltered(),el=document.getElementById('bpSws');if(!el)return;el.innerHTML='';
    arr.forEach(function(o){var c=o.c;var b=document.createElement('button');b.className='bp-sw';b.style.background=c.h;b.setAttribute('aria-pressed',o.i===state.color);b.innerHTML='<span class="bp-tip">'+c.n+'</span>';b.onclick=function(){state.color=o.i;bpBuildSws();bpCalcPrev()};el.appendChild(b)});
    bpSyncSel();
  }
  function bpSyncSel(){var all=bpColors(),c=all[state.color]||all[0];if(!c)return;document.getElementById('bpSelSw').style.background=c.h;document.getElementById('bpSelName').textContent=c.n+' · '+c.c}
  function bpContainers(L){
    var P=PRECIOS_SERVICIOS.parametros,CUB=P.cap_cubeta,GAL=P.cap_galon;
    L=Math.max(0,Math.ceil(L));var cub=Math.floor(L/CUB),rem=L-cub*CUB;var gal=Math.floor(rem/GAL),rem2=rem-gal*GAL;var lit=Math.max(0,Math.ceil(rem2-1e-6));
    if(lit>=3){gal+=1;lit=0}if(gal>=5){cub+=1;gal-=5}return {cub:cub,gal:gal,lit:lit,litros:cub*CUB+gal*GAL+lit,need:L};
  }
  function bpCurrentCalc(){
    var all=bpColors(),col=all[state.color]||all[0]||{litro:0,galon:0,cubeta:0,n:'',h:'#ccc'};
    var area=+document.getElementById('bpArea').value||0,coats=Math.max(1,+document.getElementById('bpCoats').value||1),yld=Math.max(1,+document.getElementById('bpYield').value||10);
    var L=area*coats/yld,b=bpContainers(L);var cost=b.cub*col.cubeta+b.gal*col.galon+b.lit*col.litro;
    return {col:col,area:area,coats:coats,L:b.need,b:b,cost:cost,provided:b.litros.toFixed(1)};
  }
  window.bpCalcPrev=function(){
    var r=bpCurrentCalc();
    document.getElementById('bpPrev').innerHTML='<span class="bp-dot" style="background:'+r.col.h+'"></span><b>'+r.col.n+'</b> · '+r.area+' m² × '+r.coats+' manos ≈ <b>'+r.L+' L</b><br>Preselección: <b>'+r.b.cub+'</b> cubeta(s) · <b>'+r.b.gal+'</b> galón(es) · <b>'+r.b.lit+'</b> litro(s) (cubre ~'+r.provided+' L) → <b>'+money(r.cost)+'</b>';
  };
  window.bpAddPaint=function(){var r=bpCurrentCalc();if(r.cost<=0){alert('Indica un área mayor a 0.');return}state.paints.push({n:r.col.n,h:r.col.h,area:r.area,cub:r.b.cub,gal:r.b.gal,lit:r.b.lit,cost:r.cost});bpRenderPaints();bpRecompute()};
  window.bpRemovePaint=function(i){state.paints.splice(i,1);bpRenderPaints();bpRecompute()};
  function bpRenderPaints(){var el=document.getElementById('bpPaintList');el.innerHTML='';state.paints.forEach(function(p,i){var det=[];if(p.cub)det.push(p.cub+' cub');if(p.gal)det.push(p.gal+' gal');if(p.lit)det.push(p.lit+' L');el.innerHTML+='<div class="bp-li"><span><span class="bp-dot" style="background:'+p.h+'"></span>'+p.n+' <small>· '+p.area+' m² · '+det.join(' + ')+'</small></span><span style="display:flex;gap:12px;align-items:center"><b>'+money(p.cost)+'</b><button onclick="bpRemovePaint('+i+')">✕</button></span></div>'})}
  function bpAreaTot(){return state.paints.reduce(function(a,p){return a+p.area},0)}

  // ===== B =====
  window.bpUpdateAplArea=function(){var use=document.getElementById('bpAplCalc').checked,inp=document.getElementById('bpAplArea');if(use){inp.value=bpAreaTot();inp.disabled=true}else{inp.disabled=false}bpRecompute()};

  // ===== C =====
  function bpBuildReps(){var el=document.getElementById('bpRepList');el.innerHTML='';PRECIOS_SERVICIOS.resanacion.forEach(function(r){el.innerHTML+='<div class="bp-item"><span>'+r.n+'<span class="bp-pr">'+money(r.p)+' c/u</span></span><div class="bp-stp"><button onclick="bpStep(\''+r.k+'\',-1)">−</button><span class="bp-v" id="bpv-'+r.k+'">'+state.res[r.k]+'</span><button onclick="bpStep(\''+r.k+'\',1)">+</button></div></div>'})}
  window.bpStep=function(k,d){state.res[k]=Math.max(0,state.res[k]+d);document.getElementById('bpv-'+k).textContent=state.res[k];bpRecompute()};

  // ===== D =====
  function bpBuildPlans(){var el=document.getElementById('bpPlans');el.innerHTML='';var pl=PRECIOS_SERVICIOS.planes;var inc={basico:'Solo pintura.',corporativo:'Pintura + servicio de pintado.',premium:'Pintura + pintado + aislamiento.'};
    Object.keys(pl).forEach(function(k){var p=pl[k];var d=[];if(p.dP)d.push('pintura');if(p.dA)d.push('aplicación');if(p.dI)d.push('aislamiento');el.innerHTML+='<div class="bp-plan" data-plan="'+k+'" aria-pressed="false" onclick="bpSetPlan(\''+k+'\')"><div class="bp-pn">'+p.n+'</div><div class="bp-inc">'+inc[k]+'</div><div class="bp-disc">−15% '+d.join(', ')+'</div></div>'})}
  window.bpTogglePlan=function(){state.planInterest=document.getElementById('bpPlanInt').checked;document.getElementById('bpPw').classList.toggle('bp-show',state.planInterest);if(!state.planInterest){state.plan='ninguno';document.querySelectorAll('#bpPlans .bp-plan').forEach(function(el){el.setAttribute('aria-pressed','false')});document.getElementById('bpAis').classList.remove('bp-show')}bpRecompute()};
  window.bpSetPlan=function(p){state.plan=p;document.querySelectorAll('#bpPlans .bp-plan').forEach(function(el){el.setAttribute('aria-pressed',el.dataset.plan===p)});document.getElementById('bpAis').classList.toggle('bp-show',p==='premium');if(p==='premium')document.getElementById('bpAplOn').checked=true;bpRecompute()};

  // ===== E =====
  window.bpIgSetType=function(t){state.igType=t;document.querySelectorAll('#bpIgType button').forEach(function(b){b.setAttribute('aria-pressed',b.dataset.t===t)})};
  window.bpAddIg=function(){
    var name=document.getElementById('bpIgName').value.trim();if(!name){document.getElementById('bpIgName').focus();return}
    var uses=[];document.querySelectorAll('#bpIgUses input:checked').forEach(function(c){uses.push(c.value)});
    var otro=document.getElementById('bpIgOther').value.trim();if(otro){var i=uses.indexOf('Otros');if(i>-1)uses[i]='Otros: '+otro;else uses.push('Otros: '+otro)}
    if(!uses.length)uses=['—'];
    state.igualaciones.push({name:name,brand:document.getElementById('bpIgBrand').value.trim(),code:document.getElementById('bpIgCode').value.trim(),color:document.getElementById('bpIgColor').value,uses:uses,dur:document.getElementById('bpIgDur').value,loc:document.getElementById('bpIgLoc').value,type:state.igType,notes:document.getElementById('bpIgNotes').value.trim()});
    ['bpIgName','bpIgBrand','bpIgCode','bpIgNotes','bpIgOther'].forEach(function(id){document.getElementById(id).value=''});
    document.querySelectorAll('#bpIgUses input:checked').forEach(function(c){c.checked=false});document.getElementById('bpIgOther').style.display='none';
    bpRenderIg();bpRecompute();
  };
  window.bpRemoveIg=function(i){state.igualaciones.splice(i,1);bpRenderIg();bpRecompute()};
  function bpRenderIg(){var el=document.getElementById('bpIgList');el.innerHTML='';state.igualaciones.forEach(function(s,i){var brand=s.brand?(s.brand+(s.code?' · '+s.code:'')):'sin equivalencia';el.innerHTML+='<div class="bp-igc"><div class="bp-sw2" style="background:'+s.color+'"></div><div class="bp-info"><b>'+s.name+'</b><small>'+brand+'</small><small>'+s.type+' · '+s.loc+' · durab. '+s.dur+' · uso: '+s.uses.join(', ')+'</small>'+(s.notes?'<small>📝 '+s.notes+'</small>':'')+'</div><button onclick="bpRemoveIg('+i+')">✕</button></div>'})}

  // ===== cálculo =====
  function bpCalcAll(){
    var pintura=state.paints.reduce(function(a,p){return a+p.cost},0);
    var cub=state.paints.reduce(function(a,p){return a+p.cub},0),gal=state.paints.reduce(function(a,p){return a+p.gal},0),lit=state.paints.reduce(function(a,p){return a+p.lit},0);
    var aplOn=document.getElementById('bpAplOn').checked;
    var aplArea=+document.getElementById('bpAplArea').value||0,aplRate=+document.getElementById('bpAplRate').value||0;var aplicacion=aplOn?aplArea*aplRate:0;
    var resan=PRECIOS_SERVICIOS.resanacion.reduce(function(a,r){return a+state.res[r.k]*r.p},0);
    var aisArea=+document.getElementById('bpAisArea').value||0,aisRate=+document.getElementById('bpAisRate').value||0;var aislamiento=state.plan==='premium'?aisArea*aisRate:0;
    var pl=PRECIOS_SERVICIOS.planes[state.plan]||{dP:0,dA:0,dI:0};
    var dPint=pintura*pl.dP,dApl=aplicacion*pl.dA,dAis=aislamiento*pl.dI;
    var total=pintura+aplicacion+resan+aislamiento-dPint-dApl-dAis;
    return {pintura:pintura,cub:cub,gal:gal,lit:lit,aplOn:aplOn,aplicacion:aplicacion,aplArea:aplArea,resan:resan,aislamiento:aislamiento,aisArea:aisArea,dPint:dPint,dApl:dApl,dAis:dAis,total:total};
  }
  window.bpRecompute=function(){
    bpCalcPrev();document.getElementById('bpAreaTot').textContent=bpAreaTot();
    if(document.getElementById('bpAplCalc').checked)document.getElementById('bpAplArea').value=bpAreaTot();
    var c=bpCalcAll();
    document.getElementById('bpAplOut').textContent=money(c.aplicacion);
    document.getElementById('bpResOut').textContent=money(c.resan);
    document.getElementById('bpAisOut').textContent=money(c.aislamiento);
    var rc=PRECIOS_SERVICIOS.resanacion.reduce(function(a,r){return a+state.res[r.k]},0);document.getElementById('bpResCount').textContent=rc;
    var L=[];
    if(c.pintura>0){var det=[];if(c.cub)det.push(c.cub+' cub');if(c.gal)det.push(c.gal+' gal');if(c.lit)det.push(c.lit+' L');L.push(['Pintura · '+det.join(' + '),money(c.pintura),false])}
    if(c.aplOn&&c.aplicacion>0)L.push(['Aplicación · '+c.aplArea+' m²',money(c.aplicacion),false]);
    if(c.resan>0)L.push(['Resanación · '+rc+' rep.',money(c.resan),false]);
    if(c.aislamiento>0)L.push(['Aislamiento · '+c.aisArea+' m²',money(c.aislamiento),false]);
    if(c.dPint>0)L.push(['Desc. pintura','−'+money(c.dPint),true]);
    if(c.dApl>0)L.push(['Desc. aplicación','−'+money(c.dApl),true]);
    if(c.dAis>0)L.push(['Desc. aislamiento','−'+money(c.dAis),true]);
    document.getElementById('bpSumLines').innerHTML=L.length?L.map(function(r){return '<div class="bp-sl'+(r[2]?' bp-d':'')+'"><span class="bp-lbl">'+r[0]+'</span><span>'+r[1]+'</span></div>'}).join(''):'<div class="bp-empty">Aún no agregas nada.</div>';
    document.getElementById('bpTotal').textContent=money(c.total);
    var sp=document.getElementById('bpSpNote');if(state.igualaciones.length){sp.style.display='block';sp.innerHTML='🎨 '+state.igualaciones.length+' solicitud(es) de igualación (por cotizar)'}else{sp.style.display='none'}
  };

  // ===== salida =====
  function bpFolio(){var s='BP-',ch='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';for(var i=0;i<6;i++)s+=ch[Math.floor(Math.random()*ch.length)];return s}
  function bpItems(c){var it=[];if(c.pintura>0){var d=[];if(c.cub)d.push(c.cub+' cub');if(c.gal)d.push(c.gal+' gal');if(c.lit)d.push(c.lit+' L');it.push(['Pintura',money(c.pintura),d.join(' + ')])}if(c.aplOn&&c.aplicacion>0)it.push(['Aplicación',money(c.aplicacion),c.aplArea+' m²']);if(c.resan>0)it.push(['Resanación',money(c.resan),'']);if(c.aislamiento>0)it.push(['Aislamiento',money(c.aislamiento),c.aisArea+' m²']);var dd=c.dPint+c.dApl+c.dAis;if(dd>0)it.push(['Descuento plan','−'+money(dd),'']);return it}
  var lastFolio=null;
  function bpItemsNum(c){
    var it=[];
    if(c.pintura>0){var d=[];if(c.cub)d.push(c.cub+' cub');if(c.gal)d.push(c.gal+' gal');if(c.lit)d.push(c.lit+' L');it.push({nombre:'Pintura ('+d.join(' + ')+')',qty:1,pr:Math.round(c.pintura)})}
    if(c.aplOn&&c.aplicacion>0)it.push({nombre:'Aplicación · '+c.aplArea+' m²',qty:1,pr:Math.round(c.aplicacion)});
    if(c.resan>0)it.push({nombre:'Resanación',qty:1,pr:Math.round(c.resan)});
    if(c.aislamiento>0)it.push({nombre:'Aislamiento · '+c.aisArea+' m²',qty:1,pr:Math.round(c.aislamiento)});
    var dd=c.dPint+c.dApl+c.dAis;if(dd>0)it.push({nombre:'Descuento plan',qty:1,pr:-Math.round(dd)});
    return it;
  }
  function bpBuildPedido(folio,c,planN){
    var name=(document.getElementById('bpCliente')&&document.getElementById('bpCliente').value.trim())||'(Cotización de proyecto)';
    var tel=(document.getElementById('bpTel')&&document.getElementById('bpTel').value.trim())||'';
    return {
      id:folio, tipo:'cotizacion', origen:'proyecto', modo:state.mode,
      nombre:name, telefono:tel,
      direccion:'Cotización '+(state.mode==='comercial'?'Comercial/Oficinas':'Industrial'),
      total:Math.round(c.total), fecha:new Date().toLocaleDateString('es-MX'),
      items:bpItemsNum(c), status:'nueva', pago:'Cotización (por definir)',
      plan:planN,
      paints:state.paints.slice(),
      igualaciones:state.igualaciones.slice(),
      resanacionComentarios:(document.getElementById('bpResCom')&&document.getElementById('bpResCom').value.trim())||'',
      notas:'Cotización de proyecto '+state.mode
    };
  }
  function bpPlanName(){return {ninguno:'Sin plan',basico:'Básico Anual',corporativo:'Corporativo',premium:'Premium'}[state.plan]}
  function bpSaveKey(c){try{return JSON.stringify({m:state.mode,p:state.paints,r:state.res,pl:state.plan,ap:document.getElementById('bpAplOn').checked,aa:document.getElementById('bpAplArea').value,ig:state.igualaciones,cl:(document.getElementById('bpCliente')||{}).value,te:(document.getElementById('bpTel')||{}).value,t:c.total})}catch(e){return Math.random()+''}}
  function bpEnsureSaved(c,cb){
    var key=bpSaveKey(c);
    if(state.savedKey===key&&state.savedFolio){cb(state.savedFolio);return}
    var folio=bpFolio();
    var pedido=bpBuildPedido(folio,c,bpPlanName());
    try{pedido=JSON.parse(JSON.stringify(pedido))}catch(e){}
    if(window.saveOrderToFirebase){
      window.saveOrderToFirebase(pedido).then(function(fbId){
        if(fbId){state.savedKey=key;state.savedFolio=folio;bpToast('Cotización '+folio+' enviada ✓ (ya aparece en tu admin)')}
        else{bpToast('⚠️ No se pudo guardar en la nube. Revisa tu conexión o envíala por WhatsApp.')}
      }).catch(function(err){console.error('bolt-proyectos guardado:',err);bpToast('⚠️ Error al guardar: '+((err&&err.message)||err))});
    }else{bpToast('⚠️ Firebase no está listo aún; recarga la página e intenta de nuevo.')}
    cb(folio);
  }
  window.bpProposal=function(){
    var c=bpCalcAll();if(c.total<=0&&!state.igualaciones.length){alert('Agrega al menos una pintura o servicio.');return}
    var fecha=new Date().toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'});
    var planN=bpPlanName();
    bpEnsureSaved(c,function(folio){
      lastFolio=folio;
      var rows=bpItems(c).map(function(it){return '<div class="bp-rit"><div class="bp-l1"><span>'+it[0]+'</span><span>'+it[1]+'</span></div>'+(it[2]?'<div class="bp-l2">'+it[2]+'</div>':'')+'</div>'}).join('');
      var igu=state.igualaciones.length?'<hr><div class="bp-rr bp-s"><b>Igualaciones (por cotizar)</b></div>'+state.igualaciones.map(function(s){return '<div class="bp-rr bp-s"><span>• '+s.name+'</span><span>'+s.type+'</span></div>'}).join(''):'';
      var waHref=bpWaLink(folio,c);
      document.getElementById('bpModalInner').innerHTML='<div class="bp-rc">'+
        '<div class="bp-rbar"><button class="bp-pdf" onclick="window.print()">⬇️ Descargar PDF</button><a class="bp-wag" href="'+waHref+'" target="_blank">💬 WhatsApp</a><button onclick="bpCloseModal()">✕</button></div>'+
        '<div class="bp-rch"><div class="bp-rlogo">BOLT <em>⚡</em> PAINT</div><div class="bp-rsub">Distribuidor oficial BPaint Depot<br>Mexicali &amp; San Felipe, B.C.</div><div class="bp-rtype">PRE-PROPUESTA · NO FISCAL</div></div>'+
        '<hr><div class="bp-rr bp-s"><span>Folio</span><span>'+folio+'</span></div><div class="bp-rr bp-s"><span>Fecha</span><span>'+fecha+'</span></div>'+
        '<div class="bp-rr bp-s"><span>Proyecto</span><span>'+(state.mode==='comercial'?'Comercial/Oficinas':'Industrial')+'</span></div><div class="bp-rr bp-s"><span>Plan</span><span>'+planN+'</span></div>'+
        '<hr>'+rows+igu+'<hr><div class="bp-rtot"><span>TOTAL EST.</span><b>'+money(c.total)+'</b></div>'+
        '<div class="bp-rr bp-s" style="margin-top:6px"><span>Pago</span><span>Tarjeta · OXXO · SPEI</span></div>'+
        '<div class="bp-rfoot">Sujeta a inspección y validación. Vigencia 15 días.<br>¡Gracias por elegir Bolt Paint!<br>WhatsApp: 686 262 5119</div></div>';
      document.getElementById('bpModal').classList.add('bp-open');
    });
  };
  function bpToast(msg){
    var t=document.getElementById('bpToast');
    if(!t){t=document.createElement('div');t.id='bpToast';t.style.cssText='position:fixed;left:50%;bottom:24px;transform:translateX(-50%);background:#16181d;color:#fff;border:1px solid #2a2f37;border-radius:12px;padding:13px 18px;font-family:Archivo,system-ui,sans-serif;font-size:14px;z-index:800;box-shadow:0 18px 40px rgba(0,0,0,.5);max-width:92vw';document.body.appendChild(t)}
    t.textContent=msg;t.style.opacity='1';clearTimeout(t._h);t._h=setTimeout(function(){t.style.opacity='0'},4000);
  }
  window.bpCloseModal=function(){document.getElementById('bpModal').classList.remove('bp-open')};

  function bpWaLink(folio,c){
    var lines=['*Bolt Paint · Solicitud de cotización*','Folio: '+folio,'Proyecto: '+(state.mode==='comercial'?'Comercial/Oficinas':'Industrial')];
    bpItems(c).forEach(function(it){lines.push('• '+it[0]+(it[2]?' ('+it[2]+')':'')+': '+it[1])});
    lines.push('Total estimado: '+money(c.total));
    if(state.igualaciones.length)lines.push('Igualaciones: '+state.igualaciones.map(function(s){return s.name}).join(', '));
    lines.push('(Sujeto a inspección)');
    return 'https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(lines.join('\n'));
  }
  window.bpWhats=function(){var c=bpCalcAll();if(c.total<=0&&!state.igualaciones.length){alert('Agrega algo a la cotización primero.');return false}bpEnsureSaved(c,function(folio){document.getElementById('bpWaBtn').href=bpWaLink(folio,c)});return true};

  // auto-montaje (estilos + overlay oculto) al cargar, para que los botones del hero tengan estilo
  if(document.readyState==='loading'){document.addEventListener('DOMContentLoaded',mount);}else{mount();}

})();
