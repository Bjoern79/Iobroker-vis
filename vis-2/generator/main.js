const fs = require('fs');
const H = require('./build.js');
const { view, addW, text, header, cardBg, cardTitle, value, stringValue, listValue, lastChange, label, tileLabel, tileGrid, iconNav, vectorIcon, iframe, navInclude, mdSwitch, mdSlider, mdProgressCircular, row3, W, COL, FONT, SAFE_TOP, SAFE_BOTTOM } = H;

const project = {};
const OUTSIDE = 'ebus.1.broadcast.messages.outsidetemp.fields.temp2.value';

// ===================================================================
// NAVIGATION — floating glass pill, hand-drawn vector icons (no old vis assets,
// no emoji/font rendering — see build.js GLYPHS)
// ===================================================================
{
  const v = view('navigation');
  v.settings.sizex = String(W); v.settings.sizey = '96';
  addW(v,'tplHtml',10,6,W-20,80,{html:''},{ background:'rgba(20,23,31,0.75)', 'backdrop-filter':'blur(18px)', border:`1px solid ${COL.glassBorder}`, 'border-radius':'26px', 'box-shadow':'0 10px 30px rgba(0,0,0,0.45)' });
  const items = [
    ['home', 'index', 'Home', COL.accentA],
    ['flame', 'viewHeizung', 'Heizung', '#f97316'],
    ['bolt', 'viewPhotovoltaik', 'PV', '#eab308'],
    ['wind', 'viewRecovair', 'Lüftung', '#38bdf8'],
    ['sun', 'viewSolaranlage', 'Solar', '#fb923c'],
    ['thermo', 'viewTemperatur', 'Klima', '#34d399'],
    ['chart', 'viewStatistics', 'Stats', '#a78bfa'],
  ];
  const colW = (W-20)/items.length;
  items.forEach(([kind,nav,cap,bg],i)=>{
    iconNav(v, 10 + i*colW + colW/2 - 19, 13, 38, kind, bg, nav);
    text(v, 10+i*colW, 56, colW, 16, cap, {size:'11px', align:'center', color:'#c7ccd6', weight:'700'});
  });
  project['navigation'] = v;
}

function endPage(v,y){ navInclude(v); v.settings.sizey = String(y + 8 + 110); }

// ===================================================================
// INDEX (Übersicht)
// ===================================================================
{
  const v = view('index');
  let y = header(v, 'home', 'Übersicht', OUTSIDE);

  cardBg(v,16,y,W-32,108,COL.green); cardTitle(v,16,y,'Fronius · Jetzt');
  row3(v, y+38, [
    {oid:'sonnen.0.status.production', unit:'W', digits:0, color:COL.green},
    {oid:'sonoff.0.Smartmeter.SENSOR.LK13BE.power', unit:'W', digits:0, color:COL.blue},
    {oid:'sonnen.0.status.consumption', unit:'W', digits:0, color:COL.red},
  ], ['Erzeugung','Einspeisung','Verbrauch']);
  y += 120;

  cardBg(v,16,y,W-32,168,COL.accentA); cardTitle(v,16,y,'Sonnenbatterie · Heute');
  mdProgressCircular(v, W-16-58, y+30, 54, 'sonnen.0.status.userSoc', {color:COL.green});
  row3(v, y+38, [
    {oid:'fronius.0.inverter.1.DAY_ENERGY', unit:'kWh', digits:2, color:COL.green},
    {oid:'0_userdata.0.Total.PowerDay', unit:'kWh', digits:2, color:COL.red},
  ], ['Produktion','Verbrauch']);
  tileLabel(v,16,y+94,150,'Prognose heute / morgen');
  value(v, 16, y+110, 90, 22, '0_userdata.0.SolarGraph.EnergieMaxHeute', {unit:'kWh', digits:1, align:'left', size:'15px'});
  value(v, 110, y+110, 90, 22, '0_userdata.0.SolarGraph.EnergieMaxMorgen', {unit:'kWh', digits:1, align:'left', size:'15px', color:COL.sub});
  y += 180;

  cardBg(v,16,y,W-32,150,COL.blue); cardTitle(v,16,y,'Logarex · Zähler');
  row3(v, y+38, [
    {oid:'statistics.0.temp.sumDelta.0_userdata.0.Smartmeter.LK13BE.total_out.day', unit:'kWh', digits:2, color:COL.green},
    {oid:'statistics.0.temp.sumDelta.0_userdata.0.Smartmeter.LK13BE.total_in.day', unit:'kWh', digits:2, color:COL.red},
  ], ['Einspeisung heute','Bezug heute']);
  tileLabel(v,16,y+94,150,'Gesamt Einspeisung / Bezug');
  value(v, 16, y+110, 90, 22, '0_userdata.0.Smartmeter.LK13BE.total_out', {unit:'kWh', digits:0, align:'left', size:'15px'});
  value(v, 110, y+110, 90, 22, '0_userdata.0.Smartmeter.LK13BE.total_in', {unit:'kWh', digits:0, align:'left', size:'15px', color:COL.sub});
  lastChange(v,16,y+134,W-48,12,'0_userdata.0.Smartmeter.LK13BE.total_in',{});
  y += 166;

  const halfW = (W-32-12)/2;
  cardBg(v,16,y,halfW,116,COL.amber); cardTitle(v,16,y,'Gas');
  value(v,16,y+38,halfW-16,28,'statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C1.day',{unit:'m³',digits:3,align:'left',size:'17px'});
  tileLabel(v,16,y+70,halfW-16,'Heute');
  value(v,16,y+86,halfW-16,18,'0_userdata.0.Total.TotalGas',{unit:'m³ ges.',digits:1,align:'left',size:'11px',color:COL.sub});

  cardBg(v,16+halfW+12,y,halfW,116,COL.blue); cardTitle(v,16+halfW+12,y,'Wasser');
  value(v,16+halfW+12,y+38,halfW-16,28,'statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C2.day',{unit:'m³',digits:3,align:'left',size:'17px'});
  tileLabel(v,16+halfW+12,y+70,halfW-16,'Heute');
  value(v,16+halfW+12,y+86,halfW-16,18,'0_userdata.0.Total.TotalWater',{unit:'m³ ges.',digits:1,align:'left',size:'11px',color:COL.sub});
  y += 132;

  cardBg(v,16,y,W-32,108,COL.amber); cardTitle(v,16,y,'Solarthermie');
  row3(v, y+38, [
    {oid:'ebus.1.sc.messages.Coll1Sensor.fields.temp.value', unit:'°C', digits:1, color:COL.amber},
    {oid:'ebus.1.sc.messages.Storage1Sensor3.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.1.sc.messages.Storage2Sensor3.fields.temp.value', unit:'°C', digits:1},
  ], ['Kollektor','Speicher oben','Speicher unten']);
  y += 120;

  const rooms = [
    ['DG','shelly.1.shellyhtg3#d885ac1414f0#1.Temperature0.Celsius','shelly.1.shellyhtg3#d885ac1414f0#1.Humidity0.Relative','statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac1414f0#1.Temperature0.Celsius'],
    ['OG','sonoff.0.HT-OG.SENSOR.AM2301.Temperature','shelly.1.shellyhtg3#80b54e3563a0#1.Humidity0.Relative','statistics.0.temp.minmax.shelly.1.shellyhtg3#80b54e3563a0#1.Temperature0.Celsius'],
    ['EG','shelly.1.shellyhtg3#d885ac1298d8#1.Temperature0.Celsius','shelly.1.shellyhtg3#d885ac1298d8#1.Humidity0.Relative','statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac1298d8#1.Temperature0.Celsius'],
    ['KG','sonoff.0.HT-KG.SENSOR.AM2301.Temperature','shelly.1.shellyhtg3#d885ac141500#1.Humidity0.Relative','statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac141500#1.Temperature0.Celsius'],
  ];
  cardBg(v,16,y,W-32, 30+rooms.length*44, COL.green); cardTitle(v,16,y,'Raumklima');
  let ry = y + 38;
  rooms.forEach(([name,tOid,hOid,mmBase])=>{
    text(v,16,ry+6,34,32,name,{size:'15px', weight:'700'});
    value(v, 56, ry, 92, 26, tOid, {unit:'°C', digits:1, size:'18px', align:'left'});
    value(v, W-16-58, ry+2, 50, 22, hOid, {unit:'%', digits:0, size:'13px', align:'right', color:COL.blue});
    value(v, 152, ry+22, 100, 14, mmBase+'.dayMax', {unit:'°C',digits:1,size:'10px',align:'left', prepend:'↑', color:COL.sub});
    ry += 44;
  });
  y += 30+rooms.length*44 + 16;

  cardBg(v,16,y,W-32,166,'#38bdf8'); cardTitle(v,16,y,'Lüftung · Schnellzugriff');
  label(v,16,y+38,150,20,'Anlage',{}); mdSwitch(v, W-16-64, y+30, 56, 30, 'sonoff.0.Lueftung.POWER');
  label(v,16,y+76,150,20,'Lüften (30m)',{}); mdSwitch(v, W-16-64, y+68, 56, 30, '0_userdata.0.Recovair.VentCmd');
  label(v,16,y+114,150,20,'Intensiv (15m)',{}); mdSwitch(v, W-16-64, y+106, 56, 30, '0_userdata.0.Recovair.BoostCmd');
  y += 182;

  cardBg(v,16,y,W-32,92,COL.sub); cardTitle(v,16,y,'USV');
  label(v,16,y+38,90,20,'Verbindung',{}); mdSwitch(v, W-16-64, y+30, 56, 30, 'nut.0.info.connection');
  label(v,16,y+66,90,20,'Batterie',{}); value(v,W-16-100,y+62,88,20,'nut.0.battery.charge',{unit:'%',digits:0,size:'14px'});
  y += 108;

  cardBg(v,16,y,W-32,60,COL.amber); cardTitle(v,16,y,'Beschattung');
  label(v,16,y+38,150,20,'Sonnenschutz aktiv',{}); mdSwitch(v, W-16-64, y+30, 56, 30, '0_userdata.0.ShutterControl.SunProtect');
  y += 76;

  endPage(v,y);
  project['index'] = v;
}

// ===================================================================
// INDEX HTML — prototype: fixed vis nav bar + full-bleed iframe running a
// self-contained HTML/CSS/JS page (own live data via simple-api, no vis
// widgets at all for the content area). Test view, doesn't touch 'index'.
// ===================================================================
{
  const v = view('indexHtml');
  v.settings.sizey = String(812); // fixed to one screen — the iframe scrolls its own content internally
  addW(v,'tplIFrame',0,0,W,812,{
    src:'http://192.168.178.133:8082/vis-2-beta.0/uebersicht.html', seamless:'true', refreshInterval:'0'
  },{ border:'none', position:'fixed', top:'0px', left:'0px', width:'100%', height:'100%', 'z-index':1 });
  navInclude(v);
  project['indexHtml'] = v;
}

// ===================================================================
// VIEW HEIZUNG
// ===================================================================
{
  const v = view('viewHeizung');
  let y = header(v, 'flame', 'Heizung', OUTSIDE);

  cardBg(v,16,y,W-32,120,'#f97316'); cardTitle(v,16,y,'Heizkreis 1 (Mischer)');
  row3(v,y+38,[
    {oid:'ebus.1.mc.messages.FlowTemp.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.1.mc.messages.FlowTempDesired.fields.temp1.value', unit:'°C', digits:1, color:COL.sub},
  ],['Vorlauf Ist','Vorlauf Soll']);
  tileLabel(v,16,y+94,150,'Status');
  listValue(v,16,y+110,200,20,'ebus.1.mc.messages.Status.fields.3.value',{size:'13px', align:'left'});
  y += 136;

  cardBg(v,16,y,W-32,108,'#f97316'); cardTitle(v,16,y,'Kessel');
  row3(v,y+38,[
    {oid:'ebus.1.bai.messages.FlowTemp.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.1.bai.messages.FlowTempDesired.fields.temp.value', unit:'°C', digits:1, color:COL.sub},
    {oid:'ebus.1.bai.messages.WaterPressure.fields.press.value', unit:'bar', digits:2, color:COL.blue},
  ],['Vorlauf Ist','Vorlauf Soll','Wasserdruck']);
  y += 124;

  cardBg(v,16,y,W-32,140,'#f97316'); cardTitle(v,16,y,'Wärmeerzeuger (KM200)');
  tileLabel(v,16,y+38,150,'Betriebsart');
  listValue(v,16,y+54,200,20,'km200.0.heatingCircuits.hc1.operationMode',{size:'13px',align:'left'});
  tileLabel(v,16,y+78,150,'Status');
  listValue(v,16,y+94,200,20,'km200.0.heatingCircuits.hc1.status',{size:'13px',align:'left'});
  row3(v,y+118,[
    {oid:'km200.0.system.heatSources.hs1.actualPower', unit:'W', digits:0},
    {oid:'km200.0.system.sensors.temperatures.chimney', unit:'°C', digits:1, color:COL.amber},
  ],['Leistung','Abgastemp.']);
  y += 176;

  cardBg(v,16,y,W-32,92,COL.amber); cardTitle(v,16,y,'Solarspeicher (Warmwasser)');
  row3(v,y+38,[
    {oid:'ebus.1.sc.messages.Storage1Sensor3.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.1.sc.messages.Storage2Sensor3.fields.temp.value', unit:'°C', digits:1},
  ],['Oben','Unten']);
  y += 108;

  cardBg(v,16,y,W-32,180,'#f97316'); cardTitle(v,16,y,'Gaszähler');
  row3(v,y+38,[
    {oid:'0_userdata.0.Total.TotalGasLasDiff', unit:'m³', digits:3},
    {oid:'0_userdata.0.Total.TotalGas', unit:'m³', digits:2, color:COL.sub},
  ],['Verbrauch (Diff)','Zählerstand']);
  row3(v,y+96,[
    {oid:'0_userdata.0.Total.TotalGasActual', unit:'%', digits:1},
    {oid:'0_userdata.0.Total.TotalGasProz', unit:'%', digits:1},
    {oid:'0_userdata.0.Total.TotalGasLast', unit:'m³', digits:2, color:COL.sub},
  ],['Verbrauch %','Ø-Vergleich','Vorjahr']);
  y += 196;

  iframe(v,16,y,W-32,280,'http://192.168.178.133:3000/d/pLVPM4ZRz/vaillant-heizung?orgId=1&refresh=10s');
  y += 296;

  endPage(v,y);
  project['viewHeizung'] = v;
}

// ===================================================================
// VIEW PHOTOVOLTAIK
// ===================================================================
{
  const v = view('viewPhotovoltaik');
  let y = header(v, 'bolt', 'Photovoltaik', OUTSIDE);

  iframe(v,16,y,W-32,240,'http://192.168.178.133:8082/energiefluss/index.html?instance=0');
  y += 256;
  iframe(v,16,y,W-32,280,'http://192.168.178.133:3000/d/nmigVjjWz/photovoltaik?orgId=1&refresh=10s');
  y += 296;

  cardBg(v,16,y,W-32,140,'#eab308'); cardTitle(v,16,y,'Sonnen Wechselrichter');
  row3(v,y+38,[
    {oid:'sonnen.0.status.acFrequency', unit:'Hz', digits:2},
    {oid:'sonnen.0.status.acVoltage', unit:'V', digits:1, color:COL.sub},
  ],['Frequenz','Spannung']);
  tileLabel(v,16,y+94,150,'Vollladung seit / Software');
  value(v, 16, y+110, 90, 22, 'sonnen.0.latestData.secondsSinceFullCharge', {unit:'s', digits:0, align:'left', size:'13px'});
  stringValue(v, 110, y+112, 150, 20, 'sonnen.0.configurations.DE_Software', {size:'12px', align:'left', color:COL.sub});
  y += 156;

  cardBg(v,16,y,W-32,168,'#eab308'); cardTitle(v,16,y,'Relais-Steuerung');
  label(v,16,y+38,140,20,'Verbindung',{}); mdSwitch(v,W-16-64,y+30,56,30,'sonnen.0.info.connection');
  label(v,16,y+76,140,20,'Verbrauch Relay',{}); mdSwitch(v,W-16-64,y+68,56,30,'sonnen.0.ios.DO_12');
  label(v,16,y+114,140,20,'Reduktion 1 Relay',{}); mdSwitch(v,W-16-64,y+106,56,30,'sonnen.0.ios.DO_13');
  label(v,16,y+152,140,20,'Reduktion 2 Relay',{}); mdSwitch(v,W-16-64,y+144,56,30,'sonnen.0.ios.DO_14');
  y += 184;

  endPage(v,y);
  project['viewPhotovoltaik'] = v;
}

// ===================================================================
// VIEW RECOVAIR (Lüftung)
// ===================================================================
{
  const v = view('viewRecovair');
  let y = header(v, 'wind', 'Lüftung');

  cardBg(v,16,y,W-32,116,'#38bdf8'); cardTitle(v,16,y,'Luftströme');
  row3(v,y+38,[
    {oid:'ebus.0.recov.messages.TempOutsideAir.fields.temp.value', unit:'°C', digits:1, color:COL.blue},
    {oid:'ebus.0.recov.messages.TempInletAir.fields.temp.value', unit:'°C', digits:1},
  ],['Frischluft','Zuluft']);
  row3(v,y+82,[
    {oid:'ebus.0.recov.messages.TempWasteAir.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.0.recov.messages.TempOutgoingAir.fields.temp.value', unit:'°C', digits:1, color:COL.red},
  ],['Abluft','Fortluft']);
  y += 132;

  cardBg(v,16,y,W-32,128,'#38bdf8'); cardTitle(v,16,y,'Betrieb');
  row3(v,y+38,[
    {oid:'ebus.0.recov.messages.HumiWasteAir.fields.percent.value', unit:'%', digits:1},
    {oid:'ebus.0.recov.messages.FlowActual.fields.0.value', unit:'m³/h', digits:0, color:COL.sub},
  ],['Feuchte (Abluft)','Volumenstrom']);
  tileLabel(v,16,y+92,150,'Verbrauch');
  value(v,16,y+108,80,20,'sonoff.0.Lueftung.SENSOR.ENERGY.Power',{unit:'W',digits:0,align:'left',size:'14px'});
  value(v,110,y+108,100,20,'sonoff.0.Lueftung.SENSOR.ENERGY.Total',{unit:'kWh',digits:1,align:'left',size:'14px',color:COL.sub});
  y += 144;

  cardBg(v,16,y,W-32,182,'#38bdf8'); cardTitle(v,16,y,'Steuerung');
  const ctrls = [
    ['Start / Betrieb','sonoff.0.Lueftung.POWER'],
    ['Lüften (30m)','0_userdata.0.Recovair.VentCmd'],
    ['Intensivlüften (15m)','0_userdata.0.Recovair.BoostCmd'],
    ['Automatischer Stop','0_userdata.0.Recovair.AutoStopCmd'],
    ['Nachlaufzeit aktiv','0_userdata.0.Recovair.DelayTime'],
  ];
  ctrls.forEach(([n,oid],i)=>{
    label(v,16,y+38+i*30,180,20,n,{});
    mdSwitch(v,W-16-64,y+30+i*30,56,26,oid);
  });
  y += 44+ctrls.length*30;
  tileLabel(v,16,y,150,'Ziel Feuchtigkeit');
  mdSlider(v,140,y-6,W-16-152,28,'0_userdata.0.Recovair.SetpointRecov');
  y += 40;

  cardBg(v,16,y,W-32,100,COL.green); cardTitle(v,16,y,'Klima');
  tileLabel(v,16,y+38,60,'Außen'); value(v,70,y+34,60,22,'openweathermap.0.forecast.current.temperature',{unit:'°C',digits:1,size:'14px',align:'left'});
  value(v,140,y+34,110,22,'0_userdata.0.absFeuchte.absFeuchteAussen',{unit:'g/m³',digits:1,size:'14px',align:'left',color:COL.blue});
  tileLabel(v,16,y+64,60,'Innen'); value(v,70,y+60,60,22,'mqtt.0.ESP09.Keller.Temperature',{unit:'°C',digits:1,size:'14px',align:'left'});
  value(v,140,y+60,110,22,'0_userdata.0.absFeuchte.absFeuchteInnen',{unit:'g/m³',digits:1,size:'14px',align:'left',color:COL.blue});
  y += 116;

  endPage(v,y);
  project['viewRecovair'] = v;
}

// ===================================================================
// VIEW SOLARANLAGE
// ===================================================================
{
  const v = view('viewSolaranlage');
  let y = header(v, 'sun', 'Solaranlage', 'ebus.1.sc.messages.Coll1Sensor.fields.temp.value');

  cardBg(v,16,y,W-32,92,'#fb923c'); cardTitle(v,16,y,'Kollektor');
  row3(v,y+38,[
    {oid:'ebus.1.sc.messages.Coll1Sensor.fields.temp.value', unit:'°C', digits:1, color:COL.amber},
    {oid:'ebus.1.sc.messages.SolCollPumpED1.fields.percent0.value', unit:'%', digits:0, color:COL.blue},
  ],['Temperatur','Pumpe']);
  y += 108;

  cardBg(v,16,y,W-32,92,'#fb923c'); cardTitle(v,16,y,'Speicher');
  row3(v,y+38,[
    {oid:'ebus.1.sc.messages.Storage1Sensor3.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.1.sc.messages.Storage2Sensor3.fields.temp.value', unit:'°C', digits:1},
  ],['Oben','Unten']);
  y += 108;

  cardBg(v,16,y,W-32,58,'#fb923c'); cardTitle(v,16,y,'Speicher laden erzwingen');
  mdSwitch(v,W-16-64,y+18,56,30,'0_userdata.0.Solaranlage.CmdLoadStorage');
  y += 74;

  cardBg(v,16,y,W-32,266,'#fb923c'); cardTitle(v,16,y,'Regelung');
  const regel = [
    ['Speicher Max (PWM off)','0_userdata.0.Solaranlage.TempHigh'],
    ['Kolländerung / 1min','0_userdata.0.Solaranlage.DifferenceMax'],
    ['Hysterese Speicher Max','0_userdata.0.Solaranlage.HystereseStorageMax'],
    ['Mittelwert Kollektor (5m)','0_userdata.0.Solaranlage.MittelwertCollValue'],
    ['Einschaltdifferenz','0_userdata.0.Solaranlage.DifferenzStart'],
    ['Deadband','0_userdata.0.Solaranlage.Deadband'],
    ['Hysterese-Rampe','0_userdata.0.Solaranlage.HystereseRampe'],
    ['Hysterese','0_userdata.0.Solaranlage.Hysterese'],
  ];
  regel.forEach(([n,oid],i)=>{
    label(v,16,y+38+i*27,190,18,n,{});
    value(v,W-16-84,y+35+i*27,72,18,oid,{unit:'°C',digits:1,size:'13px'});
  });
  y += 48+regel.length*27;

  iframe(v,16,y,W-32,280,'http://192.168.178.133:3000/d/CTus57WRk/vaillant-solaranlage?orgId=1&refresh=10s');
  y += 296;

  endPage(v,y);
  project['viewSolaranlage'] = v;
}

// ===================================================================
// VIEW TEMPERATUR
// ===================================================================
{
  const v = view('viewTemperatur');
  let y = header(v, 'thermo', 'Temperatur', 'openweathermap.0.forecast.current.temperature');

  const rooms = [
    ['EG','shelly.1.shellyhtg3#d885ac1298d8#1'],
    ['KG','shelly.1.shellyhtg3#d885ac141500#1'],
    ['DG','shelly.1.shellyhtg3#d885ac1414f0#1'],
    ['OG','shelly.1.shellyhtg3#80b54e3563a0#1'],
  ];
  cardBg(v,16,y,W-32, 30+rooms.length*70, COL.green); cardTitle(v,16,y,'Räume (Shelly H&T)');
  let ry = y+38;
  rooms.forEach(([name,base])=>{
    text(v,16,ry+8,40,30,name,{size:'16px',weight:'700'});
    value(v, 60, ry, 92, 28, base+'.Temperature0.Celsius', {unit:'°C', digits:1, size:'20px', align:'left'});
    value(v, W-16-64, ry+2, 52, 24, base+'.Humidity0.Relative', {unit:'%', digits:0, size:'14px', align:'right', color:COL.blue});
    value(v,60,ry+30,60,14,'statistics.0.temp.minmax.'+base+'.Temperature0.Celsius.dayMax',{unit:'°C',digits:1,size:'10px',prepend:'↑ ',color:COL.sub,align:'left'});
    value(v,130,ry+30,60,14,'statistics.0.temp.minmax.'+base+'.Temperature0.Celsius.dayMin',{unit:'°C',digits:1,size:'10px',prepend:'↓ ',color:COL.sub,align:'left'});
    value(v, W-16-64, ry+30, 52, 14, base+'.DevicePower0.BatteryPercent', {unit:'% 🔋', digits:0, size:'10px', color:COL.sub, align:'right'});
    ry += 70;
  });
  y = ry+16;

  cardBg(v,16,y,W-32,92,COL.blue); cardTitle(v,16,y,'Außen / Innen · abs. Feuchte');
  tileLabel(v,16,y+38,60,'Außen'); value(v,70,y+34,60,22,'openweathermap.0.forecast.current.temperature',{unit:'°C',digits:1,size:'14px',align:'left'});
  value(v,140,y+34,110,22,'0_userdata.0.absFeuchte.absFeuchteAussen',{unit:'g/m³',digits:1,size:'14px',align:'left',color:COL.blue});
  tileLabel(v,16,y+64,60,'Innen');
  value(v,140,y+60,110,22,'0_userdata.0.absFeuchte.absFeuchteInnen',{unit:'g/m³',digits:1,size:'14px',align:'left',color:COL.blue});
  y += 108;

  cardBg(v,16,y,W-32,92,COL.green); cardTitle(v,16,y,'Steuerung');
  label(v,16,y+38,180,20,'Lüften (Feuchte-Trigger)',{}); mdSwitch(v,W-16-64,y+30,56,30,'0_userdata.0.absFeuchte.Lueften');
  label(v,16,y+66,180,20,'Multimedia',{}); mdSwitch(v,W-16-64,y+58,56,30,'sonoff.0.Multimedia.POWER');
  y += 108;

  iframe(v,16,y,W-32,220,'http://192.168.178.133:3000/d/-_mGMnzgz/raumtemperatur?orgId=1&from=now-1h&to=now&refresh=10s');
  y += 236;
  iframe(v,16,y,W-32,220,'http://192.168.178.133:3000/d/07b2e3d8-3c6b-4c93-9213-3afbc67483d5/humidity?orgId=1&from=now-1h&to=now&refresh=10s');
  y += 236;

  endPage(v,y);
  project['viewTemperatur'] = v;
}

// ===================================================================
// VIEW STATISTICS
// ===================================================================
{
  const v = view('viewStatistics');
  let y = header(v, 'chart', 'Statistik');

  const periods = [['H','day'],['W','week'],['M','month'],['Q','quarter'],['J','year']];
  const colW = (W-32-90)/5;

  function statBlock(cardTitleText, rows, cardH, accent){
    cardBg(v,16,y,W-32,cardH,accent); cardTitle(v,16,y,cardTitleText);
    periods.forEach(([p],i)=> label(v, 90+i*colW, y+34, colW-4, 14, p, {align:'right', size:'10px'}));
    let ry = y+50;
    rows.forEach(([rowLabel, src, unit, digits, totalOid])=>{
      text(v,16,ry+4,64,18,rowLabel,{size:'12px', weight:'600'});
      periods.forEach(([,p],i)=>{
        value(v, 90+i*colW, ry, colW-4, 18, `statistics.0.temp.sumDelta.${src}.${p}`, {unit:'', digits, size:'10px', align:'right'});
      });
      if (totalOid) { label(v,16,ry+20,64,14,'Gesamt',{size:'9px'}); value(v,90,ry+20,W-32-90-4,14,totalOid,{unit,digits:digits+1,size:'9px',align:'left',color:COL.sub}); ry+=38; }
      else ry += 26;
    });
    y += cardH + 16;
  }

  statBlock('Strom', [
    ['Produktion','fronius.0.inverter.1.TOTAL_ENERGY','kWh',1,'fronius.0.inverter.1.TOTAL_ENERGY'],
    ['Einspeisung','0_userdata.0.Smartmeter.LK13BE.total_out','kWh',1,'0_userdata.0.Smartmeter.LK13BE.total_out'],
    ['Bezug','0_userdata.0.Smartmeter.LK13BE.total_in','kWh',1,'0_userdata.0.Smartmeter.LK13BE.total_in'],
  ], 172, COL.green);

  statBlock('Erdgas', [
    ['Verbrauch','sonoff.0.GasMeter.SENSOR.COUNTER.C1','m³',2,'0_userdata.0.Total.TotalGas'],
  ], 82, COL.amber);

  statBlock('Wasser', [
    ['Verbrauch','sonoff.0.GasMeter.SENSOR.COUNTER.C2','m³',2,'0_userdata.0.Total.TotalWater'],
  ], 82, COL.blue);

  const geraete = [
    ['Kühlschrank','sonoff.0.Kühlschrank.SENSOR.ENERGY.Total'],
    ['Kühlschrank Keller','sonoff.0.Kühlschrank Keller.SENSOR.ENERGY.Total'],
    ['Spülmaschine','sonoff.0.Spülmaschine.SENSOR.ENERGY.Total'],
    ['Trockner','sonoff.0.Trockner.SENSOR.ENERGY.Total'],
    ['Waschmaschine','sonoff.0.Waschmaschine.SENSOR.ENERGY.Total'],
    ['Therme','sonoff.0.Therme.SENSOR.ENERGY.Total'],
    ['Lüftung','sonoff.0.Lueftung.SENSOR.ENERGY.Total'],
  ];
  cardBg(v,16,y,W-32, 40+geraete.length*24, '#a78bfa'); cardTitle(v,16,y,'Top Verbraucher · Monat');
  let gy = y+40;
  geraete.forEach(([n,oid])=>{
    label(v,16,gy,220,18,n,{size:'12px'});
    value(v,W-16-100,gy,88,18,`statistics.0.save.sumDelta.${oid}.month`,{unit:'kWh',digits:1,size:'12px'});
    gy += 24;
  });
  y += 50+geraete.length*24;

  endPage(v,y);
  project['viewStatistics'] = v;
}

// ---------------------------------------------------------------------
const outDir = '..';
fs.writeFileSync(outDir+'/vis-views.json', JSON.stringify(project, null, 2));
let total = 0;
Object.entries(project).forEach(([name,vv])=>{ const n = Object.keys(vv.widgets).length; total+=n; console.log(name.padEnd(20), n, 'widgets, sizey', vv.settings.sizey); });
console.log('TOTAL widgets:', total);

module.exports = { project };
