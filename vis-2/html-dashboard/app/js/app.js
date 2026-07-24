const API = 'http://192.168.178.133:8087';
const POLL_MS = 4000;

// ---------------- icons (same vector glyphs as the vis-2 build, no fonts/emoji) ----------------
const GLYPHS = {
  home: `<path d="M14 30 L32 15 L50 30" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 27v21h26V27" fill="none" stroke="currentColor" stroke-width="4" stroke-linejoin="round"/><rect x="28" y="36" width="8" height="12" fill="currentColor"/>`,
  flame: `<path d="M32 14c5 9 11 13 11 23a11 11 0 1 1-22 0c0-5 3-9 5-12 1 5 3 6 5-3z" fill="currentColor"/>`,
  bolt: `<path d="M35 12 L20 37 H29 L26 52 L46 25 H35 Z" fill="currentColor"/>`,
  wind: `<path d="M13 23h26a5 5 0 1 0-5-6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M13 32h30a5 5 0 1 1-5 6" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/><path d="M13 41h20" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  sun: `<circle cx="32" cy="32" r="9" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M32 12v6"/><path d="M32 46v6"/><path d="M12 32h6"/><path d="M46 32h6"/><path d="M18 18l4 4"/><path d="M42 42l4 4"/><path d="M46 18l-4 4"/><path d="M22 42l-4 4"/></g>`,
  thermo: `<rect x="27" y="14" width="10" height="26" rx="5" fill="none" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="44" r="8" fill="currentColor"/><line x1="32" y1="22" x2="32" y2="40" stroke="currentColor" stroke-width="4" stroke-linecap="round"/>`,
  chart: `<rect x="16" y="34" width="9" height="16" fill="currentColor"/><rect x="28" y="24" width="9" height="26" fill="currentColor"/><rect x="40" y="16" width="9" height="34" fill="currentColor"/>`,
};
function icon(kind){ return `<svg viewBox="0 0 64 64">${GLYPHS[kind]||GLYPHS.chart}</svg>`; }

const NAV = [
  { kind:'home',   hash:'uebersicht', label:'Home',     bg:'#7c6cff' },
  { kind:'flame',  hash:'heizung',    label:'Heizung',  bg:'#f97316' },
  { kind:'bolt',   hash:'pv',         label:'PV',       bg:'#eab308' },
  { kind:'wind',   hash:'lueftung',   label:'Lüftung',  bg:'#38bdf8' },
  { kind:'sun',    hash:'solar',      label:'Solar',    bg:'#fb923c' },
  { kind:'thermo', hash:'klima',      label:'Klima',    bg:'#34d399' },
  { kind:'chart',  hash:'statistik',  label:'Stats',    bg:'#a78bfa' },
];

// ---------------- generic component builders ----------------
function fmt(raw, digits, unit){
  if (raw === null || raw === undefined || raw === '' || raw === 'null') return '–';
  const n = Number(raw);
  if (Number.isNaN(n)) return String(raw);
  return n.toLocaleString('de-DE',{minimumFractionDigits:digits,maximumFractionDigits:digits}) + (unit?(' '+unit):'');
}
function val(oid, opts={}){
  const { digits=1, unit='', color='', size='', prepend='' } = opts;
  const style = color ? ` style="color:${color}"` : '';
  const cls = 'tile-value'+(size==='lg'?' lg':'');
  return `<span class="${cls}" data-oid="${oid}" data-digits="${digits}" data-unit="${unit}" data-prepend="${prepend}"${style}>–</span>`;
}
function tile(oid, label, opts={}){
  return `<div><div class="tile-label">${label}</div>${val(oid,opts)}</div>`;
}
function row(cols, tiles){ return `<div class="row c${cols}">${tiles.join('')}</div>`; }
function subLine(label, oid, opts={}){
  const color = opts.color ? ` style="color:${opts.color}"` : '';
  return `<div class="sub-line"><span class="l">${label}</span><span class="v" data-oid="${oid}" data-digits="${opts.digits??1}" data-unit="${opts.unit||''}"${color}>–</span></div>`;
}
function card(title, accent, inner, accent2){
  return `<div class="card" style="--accent:${accent};--accent2:${accent2||accent}"><h2>${title}</h2>${inner}</div>`;
}
function switchRow(label, oid){
  return `<div class="switch-row"><span class="l">${label}</span><button class="sw" data-oid="${oid}"></button></div>`;
}
function sliderRow(label, oid, min=0, max=100){
  return `<div class="slider-row"><div class="l"><span>${label}</span><span data-oid="${oid}" data-digits="0" data-unit="%">–</span></div>
    <input type="range" min="${min}" max="${max}" step="1" data-slider-oid="${oid}"></div>`;
}
function roomRow(name, tOid, hOid, mmOid){
  return `<div class="room"><div class="name">${name}</div>
    <div class="temp" data-oid="${tOid}" data-digits="1" data-unit="°C">–</div>
    <div class="hum" data-oid="${hOid}" data-digits="0" data-unit="%">–</div>
    <div class="mm" data-oid="${mmOid}.dayMax" data-digits="1" data-unit="°C" data-prepend="↑ ">–</div></div>`;
}
function iframeBlock(src, height){
  return `<div class="iframe-wrap"><iframe src="${src}" height="${height}" loading="lazy"></iframe></div>`;
}
function ring(oid, color){
  return `<svg class="ring" viewBox="0 0 54 54">
    <circle cx="27" cy="27" r="23" fill="none" stroke="#2a2e36" stroke-width="5"/>
    <circle class="ring-fg" data-ring-oid="${oid}" cx="27" cy="27" r="23" fill="none" stroke="${color}" stroke-width="5"
      stroke-linecap="round" stroke-dasharray="144.5" stroke-dashoffset="0" transform="rotate(-90 27 27)"/>
    <text x="27" y="31" text-anchor="middle" data-oid="${oid}" data-digits="0" data-unit="%">–</text>
  </svg>`;
}
function header(kind, title, outsideOid){
  return `<div class="header"><div class="chip">${icon(kind)}</div><h1>${title}</h1>${outsideOid?`<div class="out">${val(outsideOid,{digits:1,unit:'°C'})}</div>`:''}</div>`;
}

// ---------------- pages ----------------
const OUTSIDE = 'ebus.1.broadcast.messages.outsidetemp.fields.temp2.value';

const ROOMS = [
  { name:'DG', t:'shelly.1.shellyhtg3#d885ac1414f0#1.Temperature0.Celsius', h:'shelly.1.shellyhtg3#d885ac1414f0#1.Humidity0.Relative', mm:'statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac1414f0#1.Temperature0.Celsius' },
  { name:'OG', t:'sonoff.0.HT-OG.SENSOR.AM2301.Temperature', h:'shelly.1.shellyhtg3#80b54e3563a0#1.Humidity0.Relative', mm:'statistics.0.temp.minmax.shelly.1.shellyhtg3#80b54e3563a0#1.Temperature0.Celsius' },
  { name:'EG', t:'shelly.1.shellyhtg3#d885ac1298d8#1.Temperature0.Celsius', h:'shelly.1.shellyhtg3#d885ac1298d8#1.Humidity0.Relative', mm:'statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac1298d8#1.Temperature0.Celsius' },
  { name:'KG', t:'sonoff.0.HT-KG.SENSOR.AM2301.Temperature', h:'shelly.1.shellyhtg3#d885ac141500#1.Humidity0.Relative', mm:'statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac141500#1.Temperature0.Celsius' },
];

const PAGES = {
  uebersicht(){
    return header('home','Übersicht',OUTSIDE) +
      card('Fronius · Jetzt', 'var(--green)', row(3,[
        tile('sonnen.0.status.production','Erzeugung',{digits:0,unit:'W',color:'var(--green)'}),
        tile('sonoff.0.Smartmeter.SENSOR.LK13BE.power','Einspeisung',{digits:0,unit:'W',color:'var(--blue)'}),
        tile('sonnen.0.status.consumption','Verbrauch',{digits:0,unit:'W',color:'var(--red)'}),
      ]), 'var(--blue)') +
      card('Sonnenbatterie · Heute', 'var(--accentA)',
        `<div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="flex:1;margin-right:12px;">${row(2,[
            tile('fronius.0.inverter.1.DAY_ENERGY','Produktion',{digits:2,unit:'kWh',color:'var(--green)'}),
            tile('0_userdata.0.Total.PowerDay','Verbrauch',{digits:2,unit:'kWh',color:'var(--red)'}),
          ])}</div>
          ${ring('sonnen.0.status.userSoc','var(--green)')}
        </div>
        ${subLine('Prognose heute','0_userdata.0.SolarGraph.EnergieMaxHeute',{digits:1,unit:'kWh'})}
        ${subLine('Prognose morgen','0_userdata.0.SolarGraph.EnergieMaxMorgen',{digits:1,unit:'kWh',color:'var(--sub)'})}`,
        'var(--accentB)') +
      card('Logarex · Zähler', 'var(--blue)', row(2,[
        tile('statistics.0.temp.sumDelta.0_userdata.0.Smartmeter.LK13BE.total_out.day','Einspeisung heute',{digits:2,unit:'kWh',color:'var(--green)'}),
        tile('statistics.0.temp.sumDelta.0_userdata.0.Smartmeter.LK13BE.total_in.day','Bezug heute',{digits:2,unit:'kWh',color:'var(--red)'}),
      ]) +
        subLine('Gesamt Einspeisung','0_userdata.0.Smartmeter.LK13BE.total_out',{digits:0,unit:'kWh'}) +
        subLine('Gesamt Bezug','0_userdata.0.Smartmeter.LK13BE.total_in',{digits:0,unit:'kWh',color:'var(--sub)'}),
        'var(--accentB)') +
      `<div class="card-row">
        ${card('Gas','var(--amber)', val('statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C1.day',{digits:3,unit:'m³',size:'lg'}) +
          subLine('Gesamt','0_userdata.0.Total.TotalGas',{digits:1,unit:'m³ ges.',color:'var(--sub)'}))}
        ${card('Wasser','var(--blue)', val('statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C2.day',{digits:3,unit:'m³',size:'lg'}) +
          subLine('Gesamt','0_userdata.0.Total.TotalWater',{digits:1,unit:'m³ ges.',color:'var(--sub)'}))}
      </div>` +
      card('Solarthermie', 'var(--amber)', row(3,[
        tile('ebus.1.sc.messages.Coll1Sensor.fields.temp.value','Kollektor',{digits:1,unit:'°C',color:'var(--amber)'}),
        tile('ebus.1.sc.messages.Storage1Sensor3.fields.temp.value','Speicher oben',{digits:1,unit:'°C'}),
        tile('ebus.1.sc.messages.Storage2Sensor3.fields.temp.value','Speicher unten',{digits:1,unit:'°C'}),
      ])) +
      card('Raumklima', 'var(--green)', ROOMS.map(r=>roomRow(r.name,r.t,r.h,r.mm)).join('')) +
      card('Lüftung · Schnellzugriff', '#38bdf8',
        switchRow('Anlage','sonoff.0.Lueftung.POWER') +
        switchRow('Lüften (30m)','0_userdata.0.Recovair.VentCmd') +
        switchRow('Intensiv (15m)','0_userdata.0.Recovair.BoostCmd')) +
      card('USV', 'var(--sub)',
        switchRow('Verbindung','nut.0.info.connection') +
        subLine('Batterie','nut.0.battery.charge',{digits:0,unit:'%'})) +
      card('Beschattung', 'var(--amber)', switchRow('Sonnenschutz aktiv','0_userdata.0.ShutterControl.SunProtect'));
  },

  heizung(){
    return header('flame','Heizung',OUTSIDE) +
      card('Heizkreis 1 (Mischer)','#f97316', row(2,[
        tile('ebus.1.mc.messages.FlowTemp.fields.temp.value','Vorlauf Ist',{digits:1,unit:'°C'}),
        tile('ebus.1.mc.messages.FlowTempDesired.fields.temp1.value','Vorlauf Soll',{digits:1,unit:'°C',color:'var(--sub)'}),
      ]) + subLine('Status','ebus.1.mc.messages.Status.fields.3.value',{digits:0,unit:''})) +
      card('Kessel','#f97316', row(3,[
        tile('ebus.1.bai.messages.FlowTemp.fields.temp.value','Vorlauf Ist',{digits:1,unit:'°C'}),
        tile('ebus.1.bai.messages.FlowTempDesired.fields.temp.value','Vorlauf Soll',{digits:1,unit:'°C',color:'var(--sub)'}),
        tile('ebus.1.bai.messages.WaterPressure.fields.press.value','Wasserdruck',{digits:2,unit:'bar',color:'var(--blue)'}),
      ])) +
      card('Wärmeerzeuger (KM200)','#f97316',
        subLine('Betriebsart','km200.0.heatingCircuits.hc1.operationMode',{digits:0,unit:''}) +
        subLine('Status','km200.0.heatingCircuits.hc1.status',{digits:0,unit:''}) +
        row(2,[
          tile('km200.0.system.heatSources.hs1.actualPower','Leistung',{digits:0,unit:'W'}),
          tile('km200.0.system.sensors.temperatures.chimney','Abgastemp.',{digits:1,unit:'°C',color:'var(--amber)'}),
        ])) +
      card('Solarspeicher (Warmwasser)','var(--amber)', row(2,[
        tile('ebus.1.sc.messages.Storage1Sensor3.fields.temp.value','Oben',{digits:1,unit:'°C'}),
        tile('ebus.1.sc.messages.Storage2Sensor3.fields.temp.value','Unten',{digits:1,unit:'°C'}),
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
        tile('ebus.0.recov.messages.TempOutsideAir.fields.temp.value','Frischluft',{digits:1,unit:'°C',color:'var(--blue)'}),
        tile('ebus.0.recov.messages.TempInletAir.fields.temp.value','Zuluft',{digits:1,unit:'°C'}),
      ]) + row(2,[
        tile('ebus.0.recov.messages.TempWasteAir.fields.temp.value','Abluft',{digits:1,unit:'°C'}),
        tile('ebus.0.recov.messages.TempOutgoingAir.fields.temp.value','Fortluft',{digits:1,unit:'°C',color:'var(--red)'}),
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
        subLine('Außen · Temp','openweathermap.0.forecast.current.temperature',{digits:1,unit:'°C'}) +
        subLine('Außen · abs. Feuchte','0_userdata.0.absFeuchte.absFeuchteAussen',{digits:1,unit:'g/m³',color:'var(--blue)'}) +
        subLine('Innen · Temp','mqtt.0.ESP09.Keller.Temperature',{digits:1,unit:'°C'}) +
        subLine('Innen · abs. Feuchte','0_userdata.0.absFeuchte.absFeuchteInnen',{digits:1,unit:'g/m³',color:'var(--blue)'}));
  },

  solar(){
    return header('sun','Solaranlage','ebus.1.sc.messages.Coll1Sensor.fields.temp.value') +
      card('Kollektor','#fb923c', row(2,[
        tile('ebus.1.sc.messages.Coll1Sensor.fields.temp.value','Temperatur',{digits:1,unit:'°C',color:'var(--amber)'}),
        tile('ebus.1.sc.messages.SolCollPumpED1.fields.percent0.value','Pumpe',{digits:0,unit:'%',color:'var(--blue)'}),
      ])) +
      card('Speicher','#fb923c', row(2,[
        tile('ebus.1.sc.messages.Storage1Sensor3.fields.temp.value','Oben',{digits:1,unit:'°C'}),
        tile('ebus.1.sc.messages.Storage2Sensor3.fields.temp.value','Unten',{digits:1,unit:'°C'}),
      ])) +
      card('Speicher laden erzwingen','#fb923c', switchRow('Aktiv','0_userdata.0.Solaranlage.CmdLoadStorage')) +
      card('Regelung','#fb923c',
        subLine('Speicher Max (PWM off)','0_userdata.0.Solaranlage.TempHigh',{digits:1,unit:'°C'}) +
        subLine('Kolländerung / 1min','0_userdata.0.Solaranlage.DifferenceMax',{digits:1,unit:'°C'}) +
        subLine('Hysterese Speicher Max','0_userdata.0.Solaranlage.HystereseStorageMax',{digits:1,unit:'°C'}) +
        subLine('Mittelwert Kollektor (5m)','0_userdata.0.Solaranlage.MittelwertCollValue',{digits:1,unit:'°C'}) +
        subLine('Einschaltdifferenz','0_userdata.0.Solaranlage.DifferenzStart',{digits:1,unit:'°C'}) +
        subLine('Deadband','0_userdata.0.Solaranlage.Deadband',{digits:1,unit:'°C'}) +
        subLine('Hysterese-Rampe','0_userdata.0.Solaranlage.HystereseRampe',{digits:1,unit:'°C'}) +
        subLine('Hysterese','0_userdata.0.Solaranlage.Hysterese',{digits:1,unit:'°C'})) +
      iframeBlock('http://192.168.178.133:3000/d/CTus57WRk/vaillant-solaranlage?orgId=1&refresh=10s', 280);
  },

  klima(){
    return header('thermo','Temperatur','openweathermap.0.forecast.current.temperature') +
      card('Räume (Shelly H&T)', 'var(--green)', ROOMS.map(r=>roomRow(r.name,r.t,r.h,r.mm)).join('')) +
      card('Außen / Innen · abs. Feuchte','var(--blue)',
        subLine('Außen','openweathermap.0.forecast.current.temperature',{digits:1,unit:'°C'}) +
        subLine('Außen · abs. Feuchte','0_userdata.0.absFeuchte.absFeuchteAussen',{digits:1,unit:'g/m³',color:'var(--blue)'}) +
        subLine('Innen · abs. Feuchte','0_userdata.0.absFeuchte.absFeuchteInnen',{digits:1,unit:'g/m³',color:'var(--blue)'})) +
      card('Steuerung','var(--green)',
        switchRow('Lüften (Feuchte-Trigger)','0_userdata.0.absFeuchte.Lueften') +
        switchRow('Multimedia','sonoff.0.Multimedia.POWER')) +
      iframeBlock('http://192.168.178.133:3000/d/-_mGMnzgz/raumtemperatur?orgId=1&from=now-1h&to=now&refresh=10s', 220) +
      iframeBlock('http://192.168.178.133:3000/d/07b2e3d8-3c6b-4c93-9213-3afbc67483d5/humidity?orgId=1&from=now-1h&to=now&refresh=10s', 220);
  },

  statistik(){
    const periods = [['Heute','day'],['Woche','week'],['Monat','month'],['Quartal','quarter'],['Jahr','year']];
    function statTable(rows){
      let html = `<table class="stat"><thead><tr><th></th>${periods.map(p=>`<th>${p[0]}</th>`).join('')}</tr></thead><tbody>`;
      rows.forEach(([label, src, unit, digits, totalOid])=>{
        html += `<tr><td>${label}</td>${periods.map(p=>`<td data-oid="statistics.0.temp.sumDelta.${src}.${p[1]}" data-digits="${digits}">–</td>`).join('')}</tr>`;
        if (totalOid) html += `<tr class="total"><td>Gesamt</td><td colspan="5" data-oid="${totalOid}" data-digits="${digits+1}" data-unit="${unit}">–</td></tr>`;
      });
      return html + '</tbody></table>';
    }
    const geraete = [
      ['Kühlschrank','sonoff.0.Kühlschrank.SENSOR.ENERGY.Total'],
      ['Kühlschrank Keller','sonoff.0.Kühlschrank Keller.SENSOR.ENERGY.Total'],
      ['Spülmaschine','sonoff.0.Spülmaschine.SENSOR.ENERGY.Total'],
      ['Trockner','sonoff.0.Trockner.SENSOR.ENERGY.Total'],
      ['Waschmaschine','sonoff.0.Waschmaschine.SENSOR.ENERGY.Total'],
      ['Therme','sonoff.0.Therme.SENSOR.ENERGY.Total'],
      ['Lüftung','sonoff.0.Lueftung.SENSOR.ENERGY.Total'],
    ];
    return header('chart','Statistik') +
      card('Strom','var(--green)', statTable([
        ['Produktion','fronius.0.inverter.1.TOTAL_ENERGY','kWh',1,'fronius.0.inverter.1.TOTAL_ENERGY'],
        ['Einspeisung','0_userdata.0.Smartmeter.LK13BE.total_out','kWh',1,'0_userdata.0.Smartmeter.LK13BE.total_out'],
        ['Bezug','0_userdata.0.Smartmeter.LK13BE.total_in','kWh',1,'0_userdata.0.Smartmeter.LK13BE.total_in'],
      ])) +
      card('Erdgas','var(--amber)', statTable([
        ['Verbrauch','sonoff.0.GasMeter.SENSOR.COUNTER.C1','m³',2,'0_userdata.0.Total.TotalGas'],
      ])) +
      card('Wasser','var(--blue)', statTable([
        ['Verbrauch','sonoff.0.GasMeter.SENSOR.COUNTER.C2','m³',2,'0_userdata.0.Total.TotalWater'],
      ])) +
      card('Top Verbraucher · Monat','#a78bfa', geraete.map(([n,oid])=>
        subLine(n, `statistics.0.save.sumDelta.${oid}.month`, {digits:1,unit:'kWh'})).join(''));
  },
};

// ---------------- router ----------------
const rendered = {};
function mount(hash){
  if (!PAGES[hash]) hash = 'uebersicht';
  document.querySelectorAll('.page').forEach(el=>el.classList.remove('active'));
  document.querySelectorAll('nav.tabbar a').forEach(a=>a.classList.toggle('active', a.dataset.hash===hash));
  let section = document.getElementById('page-'+hash);
  if (!rendered[hash]){ section.innerHTML = PAGES[hash](); rendered[hash] = true; }
  section.classList.add('active');
  poll(); // immediate refresh on page switch
}
window.addEventListener('hashchange', ()=> mount(location.hash.slice(1)));

// ---------------- data polling / hydration ----------------
async function poll(){
  const active = document.querySelector('.page.active');
  if (!active) return;
  const nodes = Array.from(active.querySelectorAll('[data-oid]'));
  const sliders = Array.from(active.querySelectorAll('[data-slider-oid]'));
  const oids = [...new Set([...nodes.map(n=>n.dataset.oid), ...sliders.map(n=>n.dataset.sliderOid)])];
  if (!oids.length) return;
  const values = {};
  await Promise.all(oids.map(async id=>{
    try{
      const r = await fetch(`${API}/getPlainValue/${encodeURIComponent(id)}`);
      values[id] = await r.text();
    }catch(e){ values[id] = null; }
  }));
  nodes.forEach(n=>{
    const oid = n.dataset.oid;
    if (n.tagName === 'BUTTON'){ // .sw
      const on = values[oid] === 'true' || values[oid] === '1';
      n.classList.toggle('on', on);
    } else if (n.hasAttribute('data-ring-oid')) {
      // handled below together with its paired text
    } else {
      n.textContent = (n.dataset.prepend||'') + fmt(values[oid], Number(n.dataset.digits??1), n.dataset.unit||'');
    }
  });
  active.querySelectorAll('.ring-fg').forEach(ringEl=>{
    const soc = Number(values[ringEl.dataset.ringOid]);
    if (!Number.isNaN(soc)){
      const c = 2*Math.PI*23;
      ringEl.style.strokeDasharray = c;
      ringEl.style.strokeDashoffset = c * (1 - soc/100);
    }
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

// ---------------- switch / slider write-back ----------------
document.addEventListener('click', async (e)=>{
  const btn = e.target.closest('.sw');
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
  nav.innerHTML = NAV.map(n=>`<a href="#${n.hash}" data-hash="${n.hash}"><div class="chip" style="background:${n.bg}">${icon(n.kind)}</div><span>${n.label}</span></a>`).join('');
  const app = document.getElementById('app');
  app.innerHTML = Object.keys(PAGES).map(h=>`<section class="page" id="page-${h}"></section>`).join('') +
    '<div class="status" id="status"></div>';
}
buildShell();
mount((location.hash||'#uebersicht').slice(1));
