const API = 'http://192.168.178.133:8087';
const POLL_MS = 4000;

// ---------------- icons (vector glyphs, no fonts/emoji) ----------------
const GLYPHS = {
  home: `<path d="M14 30 L32 15 L50 30" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 27v21h26V27" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><rect x="28" y="36" width="8" height="12" fill="currentColor"/>`,
  flame: `<path d="M32 14c5 9 11 13 11 23a11 11 0 1 1-22 0c0-5 3-9 5-12 1 5 3 6 5-3z" fill="currentColor"/>`,
  bolt: `<path d="M35 12 L20 37 H29 L26 52 L46 25 H35 Z" fill="currentColor"/>`,
  wind: `<path d="M13 23h26a5 5 0 1 0-5-6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M13 32h30a5 5 0 1 1-5 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M13 41h20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  sun: `<circle cx="32" cy="32" r="9" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M32 12v6"/><path d="M32 46v6"/><path d="M12 32h6"/><path d="M46 32h6"/><path d="M18 18l4 4"/><path d="M42 42l4 4"/><path d="M46 18l-4 4"/><path d="M22 42l-4 4"/></g>`,
  thermo: `<rect x="27" y="14" width="10" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="44" r="8" fill="currentColor"/><line x1="32" y1="22" x2="32" y2="40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  chart: `<rect x="16" y="34" width="9" height="16" fill="currentColor"/><rect x="28" y="24" width="9" height="26" fill="currentColor"/><rect x="40" y="16" width="9" height="34" fill="currentColor"/>`,
  battery: `<rect x="12" y="22" width="36" height="20" rx="4" fill="none" stroke="currentColor" stroke-width="4"/><rect x="50" y="28" width="5" height="8" fill="currentColor"/><rect x="17" y="27" width="12" height="10" fill="currentColor"/>`,
  grid: `<path d="M22 12v14M42 12v14" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><rect x="17" y="26" width="30" height="17" rx="4" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 43v9" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  drop: `<path d="M32 12c9 12 15 20 15 28a15 15 0 1 1-30 0c0-8 6-16 15-28z" fill="currentColor"/>`,
  gas: `<circle cx="32" cy="34" r="16" fill="none" stroke="currentColor" stroke-width="4"/><path d="M32 22v-8M24 24l-5-6M40 24l5-6" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
};
function icon(kind, size){
  const s = size||24;
  return `<svg viewBox="0 0 64 64" style="width:${s}px;height:${s}px">${GLYPHS[kind]||GLYPHS.chart}</svg>`;
}

const NAV = [
  { kind:'home',   hash:'uebersicht', label:'Home' },
  { kind:'flame',  hash:'heizung',    label:'Heizung' },
  { kind:'bolt',   hash:'pv',         label:'PV' },
  { kind:'wind',   hash:'lueftung',   label:'Lüftung' },
  { kind:'sun',    hash:'solar',      label:'Solar' },
  { kind:'thermo', hash:'klima',      label:'Klima' },
  { kind:'chart',  hash:'statistik',  label:'Stats' },
];

// ---------------- formatting ----------------
function fmt(raw, digits, unit){
  if (raw === null || raw === undefined || raw === '' || raw === 'null') return '–';
  const n = Number(raw);
  if (Number.isNaN(n)) return String(raw);
  return n.toLocaleString('de-DE',{minimumFractionDigits:digits,maximumFractionDigits:digits}) + (unit?(' '+unit):'');
}

// ---------------- generic component builders ----------------
function val(oid, opts={}){
  const { digits=1, unit='', color='', size='', prepend='' } = opts;
  const style = color ? ` style="color:${color}"` : '';
  const cls = 'tile-value'+(size==='lg'?' lg':'');
  return `<span class="${cls}" data-oid="${oid}" data-digits="${digits}" data-unit="${unit}" data-prepend="${prepend}"${style}>–</span>`;
}
function tile(oid, label, opts={}){ return `<div><div class="tile-label">${label}</div>${val(oid,opts)}</div>`; }
function row(cols, tiles){ return `<div class="row c${cols}">${tiles.join('')}</div>`; }
function subLine(label, oid, opts={}){
  const color = opts.color ? ` style="color:${opts.color}"` : '';
  return `<div class="sub-line"><span class="l">${label}</span><span class="v" data-oid="${oid}" data-digits="${opts.digits??1}" data-unit="${opts.unit||''}"${color}>–</span></div>`;
}
function card(title, accent, inner, accent2){
  return `<div class="card" style="--accent:${accent};--accent2:${accent2||accent}"><h2>${title}</h2>${inner}</div>`;
}
function switchRow(label, oid){ return `<div class="switch-row"><span class="l">${label}</span><button class="sw" data-oid="${oid}"></button></div>`; }
function sliderRow(label, oid, min=0, max=100){
  return `<div class="slider-row"><div class="l"><span>${label}</span><span data-oid="${oid}" data-digits="0" data-unit="%">–</span></div>
    <input type="range" min="${min}" max="${max}" step="1" data-slider-oid="${oid}"></div>`;
}
function iframeBlock(src, height){ return `<div class="iframe-wrap"><iframe src="${src}" height="${height}" loading="lazy"></iframe></div>`; }
function header(kind, title, outsideOid){
  return `<div class="header"><div><div class="eyebrow">Haus-Dashboard</div><h1>${title}</h1></div>${outsideOid?
    `<div class="out">Draußen<b>${val(outsideOid,{digits:1,unit:'°'})}</b></div>`:''}</div>`;
}

// ring gauge: generic circular arc, min/max mapped to 0-100% of the stroke
function ringGauge(oid, opts={}){
  const { size=100, min=0, max=100, unit='%', color='var(--green)', strokeWidth=10, textSize=20 } = opts;
  const r = 50 - strokeWidth/2 - 2;
  const c = +(2*Math.PI*r).toFixed(2);
  return `<svg viewBox="0 0 100 100" style="width:${size}px;height:${size}px">
    <circle cx="50" cy="50" r="${r}" stroke="rgba(255,255,255,.08)" stroke-width="${strokeWidth}" fill="none"/>
    <circle class="ring-fg" data-ring-oid="${oid}" data-ring-min="${min}" data-ring-max="${max}" data-ring-c="${c}"
      cx="50" cy="50" r="${r}" stroke="${color}" stroke-width="${strokeWidth}" fill="none" stroke-linecap="round"
      stroke-dasharray="${c}" stroke-dashoffset="${c}" transform="rotate(-90 50 50)" style="transition:stroke-dashoffset .6s ease"/>
    <text x="50" y="${50+textSize*0.32}" text-anchor="middle" data-oid="${oid}" data-digits="0" data-unit="${unit}" style="font-size:${textSize}px;font-weight:800;fill:var(--text)">–</text>
  </svg>`;
}

// ==================================================================
// BENTO TILES (Home)
// ==================================================================
function flowHero(){
  const nodes = [
    { x:50, y:11, bg:'linear-gradient(135deg,#ffb020,#ff7a45)', label:'Sonne', kind:'sun', oid:'sonnen.0.status.production', unit:'W' },
    { x:13, y:76, bg:'linear-gradient(135deg,#34d399,#10b981)', label:'Batterie', kind:'battery', oid:'sonnen.0.status.userSoc', unit:'%' },
    { x:87, y:76, bg:'linear-gradient(135deg,#60a5fa,#3b82f6)', label:'Netz', kind:'grid', oid:'sonoff.0.Smartmeter.SENSOR.LK13BE.power', unit:'W' },
    { x:50, y:56, bg:'linear-gradient(135deg,#7c6cff,#4fd1ff)', label:'Haus', kind:'home', oid:'sonnen.0.status.consumption', unit:'W' },
  ];
  const lines = `
    <path class="flow-line" style="stroke:#ffb020" d="M50,14 L50,53"/>
    <path class="flow-line" style="stroke:#34d399;animation-delay:.25s" d="M16,73 L45,58"/>
    <path class="flow-line" style="stroke:#60a5fa;animation-delay:.5s" d="M84,73 L55,58"/>`;
  const overlays = nodes.map(n=>`
    <div style="position:absolute;left:${n.x}%;top:${n.y}%;transform:translate(-50%,-50%);text-align:center;width:74px;">
      <div style="width:38px;height:38px;border-radius:50%;background:${n.bg};display:flex;align-items:center;justify-content:center;margin:0 auto 4px;box-shadow:0 4px 14px rgba(0,0,0,.45);color:#fff;">${icon(n.kind,19)}</div>
      <div class="flow-label">${n.label}</div>
      <div class="flow-value" data-oid="${n.oid}" data-digits="0" data-unit="${n.unit}">–</div>
    </div>`).join('');
  return `<div class="t span2 glass flow-tile">
    <div class="t-label">Energiefluss · jetzt</div>
    <div class="flow-wrap">
      <svg class="flow-svg" viewBox="0 0 100 100" preserveAspectRatio="none">${lines}</svg>
      ${overlays}
    </div>
  </div>`;
}
function battTile(){
  return `<div class="t glass batt-tile">
    <div class="t-label" style="align-self:flex-start;">Speicher</div>
    ${ringGauge('sonnen.0.status.userSoc',{size:104,min:0,max:100,unit:'%',color:'var(--green)',strokeWidth:9,textSize:22})}
    <div class="batt-sub">Prognose ${val('0_userdata.0.SolarGraph.EnergieMaxHeute',{digits:1,unit:'kWh'})} heute</div>
  </div>`;
}
function climateTile(rooms){
  return `<div class="t glass climate-tile">
    <div class="t-label">Raumklima</div>
    <div class="t-big" style="color:var(--blue)">${val('openweathermap.0.forecast.current.temperature',{digits:1,unit:'°'})}</div>
    <div class="t-small">draußen gerade</div>
    <div class="rooms-mini">${rooms.map(r=>`
      <div class="rm"><div class="dot">${r.name}</div><div class="t" data-oid="${r.t}" data-digits="0" data-unit="°">–</div></div>
    `).join('')}</div>
  </div>`;
}
function miniStatTile(label, oid, unit, digits, iconKind, color, subLabel, subOid, subUnit){
  return `<div class="t glass">
    <div class="t-icon" style="background:${color}">${icon(iconKind,18)}</div>
    <div class="t-label">${label}</div>
    <div class="t-big">${val(oid,{digits,unit})}</div>
    ${subOid?`<div class="t-small">${subLabel} ${val(subOid,{digits:1,unit:subUnit,color:'var(--sub)'})}</div>`:''}
  </div>`;
}
function actionChip(label, oid){
  return `<button class="actionchip" data-oid="${oid}"><span class="dot"></span><span>${label}</span></button>`;
}

// ==================================================================
// ROOM CAROUSEL (Klima)
// ==================================================================
function roomCard(name, tOid, hOid, mmOid){
  return `<div class="room-card glass">
    <div class="rname">${name}</div>
    ${ringGauge(tOid,{size:92,min:14,max:28,unit:'°',color:'var(--blue)',strokeWidth:8,textSize:18})}
    <div class="room-meta"><span>Feuchte</span><b data-oid="${hOid}" data-digits="0" data-unit="%">–</b></div>
    <div class="room-mm">↑ <span data-oid="${mmOid}.dayMax" data-digits="1" data-unit="°">–</span> &nbsp;·&nbsp; ↓ <span data-oid="${mmOid}.dayMin" data-digits="1" data-unit="°">–</span></div>
  </div>`;
}

// ==================================================================
// BAR CHARTS + LEADERBOARD (Statistik)
// ==================================================================
function barRow(rowId, label, src, unit, digits, totalOid, color){
  const periods=[['H','day'],['W','week'],['M','month'],['Q','quarter'],['J','year']];
  const bars = periods.map(([lbl,p])=>{
    const oid = `statistics.0.temp.sumDelta.${src}.${p}`;
    return `<div class="bc-bar"><div class="fill" data-bar-oid="${oid}" data-bar-group="${rowId}" style="height:4%;--accent:${color}"></div>
      <div class="lbl">${lbl}</div><div class="val" data-oid="${oid}" data-digits="${digits}">–</div></div>`;
  }).join('');
  return `<div class="bc-row">
    <div class="bc-head"><span class="bc-name">${label}</span>${totalOid?`<span class="bc-total">Gesamt ${val(totalOid,{digits:digits+1,unit})}</span>`:''}</div>
    <div class="bc-bars">${bars}</div>
  </div>`;
}
function leaderboard(items){
  return `<div class="leaderboard">${items.map(([name,oid],i)=>`
    <div class="lb-row">
      <div class="lb-rank">${i+1}</div>
      <div class="lb-name">${name}</div>
      <div class="lb-bar-track"><div class="lb-bar-fill" data-lb-oid="${oid}" data-lb-group="verbraucher" style="width:2%"></div></div>
      <div class="lb-val">${val(oid,{digits:1,unit:'kWh'})}</div>
    </div>`).join('')}</div>`;
}

// ---------------- shared data ----------------
const OUTSIDE = 'ebus.1.broadcast.messages.outsidetemp.fields.temp2.value';
const ROOMS = [
  { name:'DG', t:'shelly.1.shellyhtg3#d885ac1414f0#1.Temperature0.Celsius', h:'shelly.1.shellyhtg3#d885ac1414f0#1.Humidity0.Relative', mm:'statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac1414f0#1.Temperature0.Celsius' },
  { name:'OG', t:'sonoff.0.HT-OG.SENSOR.AM2301.Temperature', h:'shelly.1.shellyhtg3#80b54e3563a0#1.Humidity0.Relative', mm:'statistics.0.temp.minmax.shelly.1.shellyhtg3#80b54e3563a0#1.Temperature0.Celsius' },
  { name:'EG', t:'shelly.1.shellyhtg3#d885ac1298d8#1.Temperature0.Celsius', h:'shelly.1.shellyhtg3#d885ac1298d8#1.Humidity0.Relative', mm:'statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac1298d8#1.Temperature0.Celsius' },
  { name:'KG', t:'sonoff.0.HT-KG.SENSOR.AM2301.Temperature', h:'shelly.1.shellyhtg3#d885ac141500#1.Humidity0.Relative', mm:'statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac141500#1.Temperature0.Celsius' },
];

// ==================================================================
// PAGES
// ==================================================================
const PAGES = {

  // ---- HOME: bento grid, energy-flow hero, quick actions ----
  uebersicht(){
    return header('home','Übersicht',OUTSIDE) +
      `<div class="bento">
        ${flowHero()}
        ${battTile()}
        ${climateTile(ROOMS)}
        ${miniStatTile('Gas heute','statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C1.day','m³',3,'gas','linear-gradient(135deg,#fbbf24,#f59e0b)')}
        ${miniStatTile('Wasser heute','statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C2.day','m³',3,'drop','linear-gradient(135deg,#60a5fa,#3b82f6)')}
      </div>
      <div class="glass" style="padding:16px;margin-top:12px;">
        <div class="t-label">Schnellzugriff</div>
        <div class="chiprow">
          ${actionChip('Lüftung','sonoff.0.Lueftung.POWER')}
          ${actionChip('Lüften 30m','0_userdata.0.Recovair.VentCmd')}
          ${actionChip('Intensiv 15m','0_userdata.0.Recovair.BoostCmd')}
          ${actionChip('Beschattung','0_userdata.0.ShutterControl.SunProtect')}
          ${actionChip('USV-Link','nut.0.info.connection')}
        </div>
      </div>
      <div class="card" style="margin-top:12px;--accent:var(--blue);--accent2:var(--accentA)">
        <h2>Solarthermie &amp; Zähler</h2>
        ${row(3,[
          tile('ebus.1.sc.messages.Coll1Sensor.fields.temp.value','Kollektor',{digits:1,unit:'°',color:'var(--amber)'}),
          tile('ebus.1.sc.messages.Storage1Sensor3.fields.temp.value','Speicher oben',{digits:1,unit:'°'}),
          tile('ebus.1.sc.messages.Storage2Sensor3.fields.temp.value','Speicher unten',{digits:1,unit:'°'}),
        ])}
        ${subLine('Gesamt Einspeisung','0_userdata.0.Smartmeter.LK13BE.total_out',{digits:0,unit:'kWh'})}
        ${subLine('Gesamt Bezug','0_userdata.0.Smartmeter.LK13BE.total_in',{digits:0,unit:'kWh',color:'var(--sub)'})}
        ${subLine('USV Batterie','nut.0.battery.charge',{digits:0,unit:'%'})}
      </div>`;
  },

  heizung(){
    return header('flame','Heizung',OUTSIDE) +
      card('Heizkreis 1 (Mischer)','#f97316', row(2,[
        tile('ebus.1.mc.messages.FlowTemp.fields.temp.value','Vorlauf Ist',{digits:1,unit:'°'}),
        tile('ebus.1.mc.messages.FlowTempDesired.fields.temp1.value','Vorlauf Soll',{digits:1,unit:'°',color:'var(--sub)'}),
      ]) + subLine('Status','ebus.1.mc.messages.Status.fields.3.value',{digits:0,unit:''})) +
      card('Kessel','#f97316', row(3,[
        tile('ebus.1.bai.messages.FlowTemp.fields.temp.value','Vorlauf Ist',{digits:1,unit:'°'}),
        tile('ebus.1.bai.messages.FlowTempDesired.fields.temp.value','Vorlauf Soll',{digits:1,unit:'°',color:'var(--sub)'}),
        tile('ebus.1.bai.messages.WaterPressure.fields.press.value','Wasserdruck',{digits:2,unit:'bar',color:'var(--blue)'}),
      ])) +
      card('Wärmeerzeuger (KM200)','#f97316',
        subLine('Betriebsart','km200.0.heatingCircuits.hc1.operationMode',{digits:0,unit:''}) +
        subLine('Status','km200.0.heatingCircuits.hc1.status',{digits:0,unit:''}) +
        row(2,[
          tile('km200.0.system.heatSources.hs1.actualPower','Leistung',{digits:0,unit:'W'}),
          tile('km200.0.system.sensors.temperatures.chimney','Abgastemp.',{digits:1,unit:'°',color:'var(--amber)'}),
        ])) +
      card('Solarspeicher (Warmwasser)','var(--amber)', row(2,[
        tile('ebus.1.sc.messages.Storage1Sensor3.fields.temp.value','Oben',{digits:1,unit:'°'}),
        tile('ebus.1.sc.messages.Storage2Sensor3.fields.temp.value','Unten',{digits:1,unit:'°'}),
      ])) +
      card('Gaszähler','#f97316',
        row(2,[
          tile('0_userdata.0.Total.TotalGasLasDiff','Verbrauch (Diff)',{digits:3,unit:'m³'}),
          tile('0_userdata.0.Total.TotalGas','Zählerstand',{digits:2,unit:'m³',color:'var(--sub)'}),
        ]) +
        row(3,[
          tile('0_userdata.0.Total.TotalGasActual','Verbrauch %',{digits:1,unit:'%'}),
          tile('0_userdata.0.Total.TotalGasProz','Ø-Vergleich',{digits:1,unit:'%'}),
          tile('0_userdata.0.Total.TotalGasLast','Vorjahr',{digits:2,unit:'m³',color:'var(--sub)'}),
        ])) +
      iframeBlock('http://192.168.178.133:3000/d/pLVPM4ZRz/vaillant-heizung?orgId=1&refresh=10s', 280);
  },

  pv(){
    return header('bolt','Photovoltaik',OUTSIDE) +
      iframeBlock('http://192.168.178.133:8082/energiefluss/index.html?instance=0', 260) +
      iframeBlock('http://192.168.178.133:3000/d/nmigVjjWz/photovoltaik?orgId=1&refresh=10s', 280) +
      card('Sonnen Wechselrichter','#eab308', row(2,[
        tile('sonnen.0.status.acFrequency','Frequenz',{digits:2,unit:'Hz'}),
        tile('sonnen.0.status.acVoltage','Spannung',{digits:1,unit:'V',color:'var(--sub)'}),
      ]) +
        subLine('Vollladung seit','sonnen.0.latestData.secondsSinceFullCharge',{digits:0,unit:'s'}) +
        subLine('Software','sonnen.0.configurations.DE_Software',{digits:0,unit:'',color:'var(--sub)'})) +
      card('Relais-Steuerung','#eab308',
        switchRow('Verbindung','sonnen.0.info.connection') +
        switchRow('Verbrauch Relay','sonnen.0.ios.DO_12') +
        switchRow('Reduktion 1 Relay','sonnen.0.ios.DO_13') +
        switchRow('Reduktion 2 Relay','sonnen.0.ios.DO_14'));
  },

  lueftung(){
    return header('wind','Lüftung') +
      card('Luftströme','#38bdf8', row(2,[
        tile('ebus.0.recov.messages.TempOutsideAir.fields.temp.value','Frischluft',{digits:1,unit:'°',color:'var(--blue)'}),
        tile('ebus.0.recov.messages.TempInletAir.fields.temp.value','Zuluft',{digits:1,unit:'°'}),
      ]) + row(2,[
        tile('ebus.0.recov.messages.TempWasteAir.fields.temp.value','Abluft',{digits:1,unit:'°'}),
        tile('ebus.0.recov.messages.TempOutgoingAir.fields.temp.value','Fortluft',{digits:1,unit:'°',color:'var(--red)'}),
      ])) +
      card('Betrieb','#38bdf8', row(2,[
        tile('ebus.0.recov.messages.HumiWasteAir.fields.percent.value','Feuchte (Abluft)',{digits:1,unit:'%'}),
        tile('ebus.0.recov.messages.FlowActual.fields.0.value','Volumenstrom',{digits:0,unit:'m³/h',color:'var(--sub)'}),
      ]) +
        subLine('Verbrauch','sonoff.0.Lueftung.SENSOR.ENERGY.Power',{digits:0,unit:'W'}) +
        subLine('Gesamt','sonoff.0.Lueftung.SENSOR.ENERGY.Total',{digits:1,unit:'kWh',color:'var(--sub)'})) +
      card('Steuerung','#38bdf8',
        switchRow('Start / Betrieb','sonoff.0.Lueftung.POWER') +
        switchRow('Lüften (30m)','0_userdata.0.Recovair.VentCmd') +
        switchRow('Intensivlüften (15m)','0_userdata.0.Recovair.BoostCmd') +
        switchRow('Automatischer Stop','0_userdata.0.Recovair.AutoStopCmd') +
        switchRow('Nachlaufzeit aktiv','0_userdata.0.Recovair.DelayTime') +
        sliderRow('Ziel Feuchtigkeit','0_userdata.0.Recovair.SetpointRecov',0,100)) +
      card('Klima','var(--green)',
        subLine('Außen · Temp','openweathermap.0.forecast.current.temperature',{digits:1,unit:'°'}) +
        subLine('Außen · abs. Feuchte','0_userdata.0.absFeuchte.absFeuchteAussen',{digits:1,unit:'g/m³',color:'var(--blue)'}) +
        subLine('Innen · Temp','mqtt.0.ESP09.Keller.Temperature',{digits:1,unit:'°'}) +
        subLine('Innen · abs. Feuchte','0_userdata.0.absFeuchte.absFeuchteInnen',{digits:1,unit:'g/m³',color:'var(--blue)'}));
  },

  solar(){
    return header('sun','Solaranlage','ebus.1.sc.messages.Coll1Sensor.fields.temp.value') +
      card('Kollektor','#fb923c', row(2,[
        tile('ebus.1.sc.messages.Coll1Sensor.fields.temp.value','Temperatur',{digits:1,unit:'°',color:'var(--amber)'}),
        tile('ebus.1.sc.messages.SolCollPumpED1.fields.percent0.value','Pumpe',{digits:0,unit:'%',color:'var(--blue)'}),
      ])) +
      card('Speicher','#fb923c', row(2,[
        tile('ebus.1.sc.messages.Storage1Sensor3.fields.temp.value','Oben',{digits:1,unit:'°'}),
        tile('ebus.1.sc.messages.Storage2Sensor3.fields.temp.value','Unten',{digits:1,unit:'°'}),
      ])) +
      card('Speicher laden erzwingen','#fb923c', switchRow('Aktiv','0_userdata.0.Solaranlage.CmdLoadStorage')) +
      card('Regelung','#fb923c',
        subLine('Speicher Max (PWM off)','0_userdata.0.Solaranlage.TempHigh',{digits:1,unit:'°'}) +
        subLine('Kolländerung / 1min','0_userdata.0.Solaranlage.DifferenceMax',{digits:1,unit:'°'}) +
        subLine('Hysterese Speicher Max','0_userdata.0.Solaranlage.HystereseStorageMax',{digits:1,unit:'°'}) +
        subLine('Mittelwert Kollektor (5m)','0_userdata.0.Solaranlage.MittelwertCollValue',{digits:1,unit:'°'}) +
        subLine('Einschaltdifferenz','0_userdata.0.Solaranlage.DifferenzStart',{digits:1,unit:'°'}) +
        subLine('Deadband','0_userdata.0.Solaranlage.Deadband',{digits:1,unit:'°'}) +
        subLine('Hysterese-Rampe','0_userdata.0.Solaranlage.HystereseRampe',{digits:1,unit:'°'}) +
        subLine('Hysterese','0_userdata.0.Solaranlage.Hysterese',{digits:1,unit:'°'})) +
      iframeBlock('http://192.168.178.133:3000/d/CTus57WRk/vaillant-solaranlage?orgId=1&refresh=10s', 280);
  },

  // ---- KLIMA: horizontal room carousel instead of list ----
  klima(){
    return header('thermo','Temperatur','openweathermap.0.forecast.current.temperature') +
      `<div class="t-label" style="margin:4px 0 8px 2px;">Räume</div>
      <div class="room-scroller">${ROOMS.map(r=>roomCard(r.name,r.t,r.h,r.mm)).join('')}</div>` +
      card('Außen / Innen · abs. Feuchte','var(--blue)',
        subLine('Außen','openweathermap.0.forecast.current.temperature',{digits:1,unit:'°'}) +
        subLine('Außen · abs. Feuchte','0_userdata.0.absFeuchte.absFeuchteAussen',{digits:1,unit:'g/m³',color:'var(--blue)'}) +
        subLine('Innen · abs. Feuchte','0_userdata.0.absFeuchte.absFeuchteInnen',{digits:1,unit:'g/m³',color:'var(--blue)'})) +
      card('Steuerung','var(--green)',
        switchRow('Lüften (Feuchte-Trigger)','0_userdata.0.absFeuchte.Lueften') +
        switchRow('Multimedia','sonoff.0.Multimedia.POWER')) +
      iframeBlock('http://192.168.178.133:3000/d/-_mGMnzgz/raumtemperatur?orgId=1&from=now-1h&to=now&refresh=10s', 220) +
      iframeBlock('http://192.168.178.133:3000/d/07b2e3d8-3c6b-4c93-9213-3afbc67483d5/humidity?orgId=1&from=now-1h&to=now&refresh=10s', 220);
  },

  // ---- STATISTIK: real bar charts + leaderboard instead of tables ----
  statistik(){
    const geraete = [
      ['Kühlschrank','statistics.0.save.sumDelta.sonoff.0.Kühlschrank.SENSOR.ENERGY.Total.month'],
      ['Kühlschrank Keller','statistics.0.save.sumDelta.sonoff.0.Kühlschrank Keller.SENSOR.ENERGY.Total.month'],
      ['Spülmaschine','statistics.0.save.sumDelta.sonoff.0.Spülmaschine.SENSOR.ENERGY.Total.month'],
      ['Trockner','statistics.0.save.sumDelta.sonoff.0.Trockner.SENSOR.ENERGY.Total.month'],
      ['Waschmaschine','statistics.0.save.sumDelta.sonoff.0.Waschmaschine.SENSOR.ENERGY.Total.month'],
      ['Therme','statistics.0.save.sumDelta.sonoff.0.Therme.SENSOR.ENERGY.Total.month'],
      ['Lüftung','statistics.0.save.sumDelta.sonoff.0.Lueftung.SENSOR.ENERGY.Total.month'],
    ];
    return header('chart','Statistik') +
      card('Strom · kWh je Zeitraum','var(--green)', `<div class="barchart">` +
        barRow('strom-prod','Produktion','fronius.0.inverter.1.TOTAL_ENERGY','kWh',1,'fronius.0.inverter.1.TOTAL_ENERGY','var(--green)') +
        barRow('strom-ein','Einspeisung','0_userdata.0.Smartmeter.LK13BE.total_out','kWh',1,'0_userdata.0.Smartmeter.LK13BE.total_out','var(--blue)') +
        barRow('strom-bez','Bezug','0_userdata.0.Smartmeter.LK13BE.total_in','kWh',1,'0_userdata.0.Smartmeter.LK13BE.total_in','var(--red)') +
      `</div>`) +
      card('Erdgas · m³ je Zeitraum','var(--amber)', `<div class="barchart">` +
        barRow('gas','Verbrauch','sonoff.0.GasMeter.SENSOR.COUNTER.C1','m³',2,'0_userdata.0.Total.TotalGas','var(--amber)') +
      `</div>`) +
      card('Wasser · m³ je Zeitraum','var(--blue)', `<div class="barchart">` +
        barRow('wasser','Verbrauch','sonoff.0.GasMeter.SENSOR.COUNTER.C2','m³',2,'0_userdata.0.Total.TotalWater','var(--blue)') +
      `</div>`) +
      card('Top Verbraucher · Monat','#a78bfa', leaderboard(geraete));
  },
};

// ---------------- router ----------------
const rendered = {};
function positionPill(hash){
  const link = document.querySelector(`nav.tabbar a[data-hash="${hash}"]`);
  const pill = document.querySelector('nav.tabbar .pill');
  if (!link || !pill) return;
  pill.style.left = link.offsetLeft + 'px';
  pill.style.width = link.offsetWidth + 'px';
}
function mount(hash){
  if (!PAGES[hash]) hash = 'uebersicht';
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('nav.tabbar a').forEach(a=>a.classList.toggle('active', a.dataset.hash===hash));
  let section = document.getElementById('page-'+hash);
  if (!rendered[hash]){ section.innerHTML = PAGES[hash](); rendered[hash] = true; }
  section.classList.add('active');
  positionPill(hash);
  poll();
}
window.addEventListener('hashchange', ()=> mount(location.hash.slice(1)));
window.addEventListener('resize', ()=> positionPill((location.hash||'#uebersicht').slice(1)));

// ---------------- data polling / hydration ----------------
async function poll(){
  const active = document.querySelector('.page.active');
  if (!active) return;
  const nodes = Array.from(active.querySelectorAll('[data-oid]'));
  const sliders = Array.from(active.querySelectorAll('[data-slider-oid]'));
  const rings = Array.from(active.querySelectorAll('[data-ring-oid]'));
  const bars = Array.from(active.querySelectorAll('[data-bar-oid]'));
  const lbs = Array.from(active.querySelectorAll('[data-lb-oid]'));
  const oids = [...new Set([
    ...nodes.map(n=>n.dataset.oid),
    ...sliders.map(n=>n.dataset.sliderOid),
    ...rings.map(n=>n.dataset.ringOid),
    ...bars.map(n=>n.dataset.barOid),
    ...lbs.map(n=>n.dataset.lbOid),
  ])];
  if (!oids.length) return;
  const values = {};
  await Promise.all(oids.map(async id=>{
    try{ const r = await fetch(`${API}/getPlainValue/${encodeURIComponent(id)}`); values[id] = await r.text(); }
    catch(e){ values[id] = null; }
  }));

  nodes.forEach(n=>{
    const oid = n.dataset.oid;
    if (n.tagName === 'BUTTON'){ n.classList.toggle('on', values[oid] === 'true' || values[oid] === '1'); }
    else { n.textContent = (n.dataset.prepend||'') + fmt(values[oid], Number(n.dataset.digits??1), n.dataset.unit||''); }
  });

  rings.forEach(ringEl=>{
    const raw = Number(values[ringEl.dataset.ringOid]);
    const min = Number(ringEl.dataset.ringMin), max = Number(ringEl.dataset.ringMax), c = Number(ringEl.dataset.ringC);
    if (!Number.isNaN(raw)){
      const pct = Math.max(0, Math.min(1, (raw-min)/(max-min)));
      ringEl.style.strokeDashoffset = c * (1 - pct);
    }
  });

  // bar charts: normalize each group's bars against that group's own max
  const barGroups = {};
  bars.forEach(b=>{ (barGroups[b.dataset.barGroup] ||= []).push(b); });
  Object.values(barGroups).forEach(group=>{
    const nums = group.map(b=>Number(values[b.dataset.barOid])).filter(n=>!Number.isNaN(n));
    const max = Math.max(1, ...nums);
    group.forEach(b=>{
      const n = Number(values[b.dataset.barOid]);
      const pct = Number.isNaN(n) ? 2 : Math.max(4, Math.round(n/max*100));
      b.style.height = pct+'%';
    });
  });

  // leaderboard bars: normalize across the whole group
  const lbGroups = {};
  lbs.forEach(b=>{ (lbGroups[b.dataset.lbGroup] ||= []).push(b); });
  Object.values(lbGroups).forEach(group=>{
    const nums = group.map(b=>Number(values[b.dataset.lbOid])).filter(n=>!Number.isNaN(n));
    const max = Math.max(1, ...nums);
    group.forEach(b=>{
      const n = Number(values[b.dataset.lbOid]);
      const pct = Number.isNaN(n) ? 2 : Math.max(3, Math.round(n/max*100));
      b.style.width = pct+'%';
    });
  });

  sliders.forEach(s=>{
    const v = Number(values[s.dataset.sliderOid]);
    if (!Number.isNaN(v) && document.activeElement !== s) s.value = v;
  });

  window._lastValues = values;
  const st = document.getElementById('status');
  if (st) st.textContent = 'aktualisiert ' + new Date().toLocaleTimeString('de-DE');
}
setInterval(poll, POLL_MS);

// ---------------- switch / actionchip / slider write-back ----------------
document.addEventListener('click', async (e)=>{
  const btn = e.target.closest('.sw, .actionchip');
  if (!btn) return;
  const oid = btn.dataset.oid;
  const current = btn.classList.contains('on');
  const next = !current;
  btn.classList.toggle('on', next); // optimistic
  try{ await fetch(`${API}/set/${encodeURIComponent(oid)}?value=${next}`); }catch(err){}
});
document.addEventListener('change', async (e)=>{
  const slider = e.target.closest('[data-slider-oid]');
  if (!slider) return;
  const oid = slider.dataset.sliderOid;
  try{ await fetch(`${API}/set/${encodeURIComponent(oid)}?value=${slider.value}`); }catch(err){}
});

// ---------------- build nav + page shells, then boot ----------------
function buildShell(){
  const nav = document.getElementById('tabbar');
  nav.innerHTML = '<div class="pill"></div>' + NAV.map(n=>
    `<a href="#${n.hash}" data-hash="${n.hash}" aria-label="${n.label}">${icon(n.kind,21)}</a>`).join('');
  const app = document.getElementById('app');
  app.innerHTML = Object.keys(PAGES).map(h=>`<section class="page" id="page-${h}"></section>`).join('') +
    '<div class="status" id="status"></div>';
}
buildShell();
mount((location.hash||'#uebersicht').slice(1));
