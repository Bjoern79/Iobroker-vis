const fs = require('fs');
const H = require('./build.js');
const { view, addW, text, title, cardBg, cardTitle, value, stringValue, listValue, lastChange, label, divider, iconNav, iframe, navInclude, mdSwitch, mdSlider, mdProgressCircular, W, COL, FONT } = H;

const project = {};

// ===================================================================
// NAVIGATION (shared bottom bar, included via tplContainerView on every page)
// ===================================================================
{
  const v = view('navigation');
  v.settings.sizex = String(W); v.settings.sizey = '72';
  addW(v,'tplHtml',0,0,W,72,{html:''},{ 'background-color':'#1c2024', 'border-top':'1px solid #33383f' });
  const items = [
    ['/vis.0/main/edit_favorites.png','index','Übersicht'],
    ['/icons-mfd-svg/sani_heating.svg','viewHeizung','Heizung'],
    ['/icons-mfd-svg/measure_photovoltaic_inst.svg','viewPhotovoltaik','PV'],
    ['/icons-mfd-svg/vent_ventilation.svg','viewRecovair','Lüftung'],
    ['/icons-mfd-svg/sani_solar_temp.svg','viewSolaranlage','Solar'],
    ['/icons-mfd-svg/temp_inside.svg','viewTemperatur','Temperatur'],
    ['/vis.0/main/time_statistic.png','viewStatistics','Statistik'],
  ];
  const colW = W/items.length;
  items.forEach(([src,nav,cap],i)=>{
    iconNav(v, i*colW + colW/2 - 20, 4, 40, src, nav);
    text(v, i*colW+2, 46, colW-4, 16, cap, {size:'8px', align:'center', color:'#c8ccd1'});
  });
  project['navigation'] = v;
}

// ===================================================================
// INDEX (Übersicht)
// ===================================================================
{
  const v = view('index');
  let y = 10;
  title(v,12,y,'Übersicht'); value(v, W-140, y+2, 128, 30, 'ebus.1.broadcast.messages.outsidetemp.fields.temp2.value', {size:'x-large', unit:'°C', digits:1, align:'right'});
  y += 40; divider(v,12,y,W-24); y += 16;

  // Fronius - Jetzt
  cardBg(v,12,y,W-24,92); cardTitle(v,24,y+10,'Fronius · Jetzt');
  H.row3(v, y+34, [
    {oid:'sonnen.0.status.production', unit:'W', digits:0, color:COL.green},
    {oid:'sonoff.0.Smartmeter.SENSOR.LK13BE.power', unit:'W', digits:0, color:COL.blue},
    {oid:'sonnen.0.status.consumption', unit:'W', digits:0, color:COL.red},
  ], ['Erzeugung','Einspeisung','Verbrauch']);
  y += 104;

  // Sonnenbatterie - Heute
  cardBg(v,12,y,W-24,150); cardTitle(v,24,y+10,'Sonnenbatterie · Heute');
  mdProgressCircular(v, W-24-60, y+8, 56, 'sonnen.0.status.userSoc', {color:COL.green});
  H.row3(v, y+34, [
    {oid:'fronius.0.inverter.1.DAY_ENERGY', unit:'kWh', digits:2, color:COL.green},
    {oid:'0_userdata.0.Total.PowerDay', unit:'kWh', digits:2, color:COL.red},
  ], ['Produktion','Verbrauch'], {});
  // fix layout for 2 cols manually (row3 assumed 3 cols) -> override:
  label(v,24,y+82,'Prognose Heute',{});
  value(v, W-24-120, y+82, 108, 22, '0_userdata.0.SolarGraph.EnergieMaxHeute', {unit:'kWh', digits:1, align:'right', size:'medium'});
  label(v,24,y+108,'Prognose Morgen',{});
  value(v, W-24-120, y+108, 108, 22, '0_userdata.0.SolarGraph.EnergieMaxMorgen', {unit:'kWh', digits:1, align:'right', size:'medium'});
  y += 162;

  // Logarex (Smartmeter)
  cardBg(v,12,y,W-24,130); cardTitle(v,24,y+10,'Logarex · Zähler');
  H.row3(v, y+34, [
    {oid:'statistics.0.temp.sumDelta.0_userdata.0.Smartmeter.LK13BE.total_out.day', unit:'kWh', digits:2, color:COL.green},
    {oid:'statistics.0.temp.sumDelta.0_userdata.0.Smartmeter.LK13BE.total_in.day', unit:'kWh', digits:2, color:COL.red},
  ], ['Einspeisung heute','Bezug heute']);
  label(v,24,y+82,'Gesamt Einspeisung',{}); value(v,W-24-120,y+82,108,22,'0_userdata.0.Smartmeter.LK13BE.total_out',{unit:'kWh',digits:0,size:'medium'});
  label(v,24,y+104,'Gesamt Bezug',{}); value(v,W-24-120,y+104,108,22,'0_userdata.0.Smartmeter.LK13BE.total_in',{unit:'kWh',digits:0,size:'medium'});
  lastChange(v,24,y+126,W-48,14,'0_userdata.0.Smartmeter.LK13BE.total_in',{});
  y += 148;

  // Gas + Wasser (2 cards side by side)
  const halfW = (W-24-12)/2;
  cardBg(v,12,y,halfW,110); cardTitle(v,24,y+10,'Gas');
  label(v,24,y+38,'Heute',{}); value(v,24,y+54,halfW-24,26,'statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C1.day',{unit:'m³',digits:3,align:'left',size:'medium'});
  label(v,24,y+84,'Gesamt',{}); value(v,halfW/2,y+84,halfW/2-12,20,'0_userdata.0.Total.TotalGas',{unit:'m³',digits:2,align:'right',size:'small'});

  cardBg(v,12+halfW+12,y,halfW,110); cardTitle(v,24+halfW+12,y+10,'Wasser');
  label(v,24+halfW+12,y+38,'Heute',{}); value(v,24+halfW+12,y+54,halfW-24,26,'statistics.0.temp.sumDelta.sonoff.0.GasMeter.SENSOR.COUNTER.C2.day',{unit:'m³',digits:3,align:'left',size:'medium'});
  label(v,24+halfW+12,y+84,'Gesamt',{}); value(v,halfW+halfW/2+12,y+84,halfW/2-12,20,'0_userdata.0.Total.TotalWater',{unit:'m³',digits:2,align:'right',size:'small'});
  y += 122;

  // Solarthermie (Kollektor / Speicher)
  cardBg(v,12,y,W-24,92); cardTitle(v,24,y+10,'Solarthermie');
  H.row3(v, y+34, [
    {oid:'ebus.1.sc.messages.Coll1Sensor.fields.temp.value', unit:'°C', digits:1, color:COL.accent},
    {oid:'ebus.1.sc.messages.Storage1Sensor3.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.1.sc.messages.Storage2Sensor3.fields.temp.value', unit:'°C', digits:1},
  ], ['Kollektor','Speicher oben','Speicher unten']);
  y += 104;

  // Raumklima
  const rooms = [
    ['DG','shelly.1.shellyhtg3#d885ac1414f0#1.Temperature0.Celsius','shelly.1.shellyhtg3#d885ac1414f0#1.Humidity0.Relative','statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac1414f0#1.Temperature0.Celsius'],
    ['OG','sonoff.0.HT-OG.SENSOR.AM2301.Temperature','shelly.1.shellyhtg3#80b54e3563a0#1.Humidity0.Relative','statistics.0.temp.minmax.shelly.1.shellyhtg3#80b54e3563a0#1.Temperature0.Celsius'],
    ['EG','shelly.1.shellyhtg3#d885ac1298d8#1.Temperature0.Celsius','shelly.1.shellyhtg3#d885ac1298d8#1.Humidity0.Relative','statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac1298d8#1.Temperature0.Celsius'],
    ['KG','sonoff.0.HT-KG.SENSOR.AM2301.Temperature','shelly.1.shellyhtg3#d885ac141500#1.Humidity0.Relative','statistics.0.temp.minmax.shelly.1.shellyhtg3#d885ac141500#1.Temperature0.Celsius'],
  ];
  cardBg(v,12,y,W-24, 18+rooms.length*46); cardTitle(v,24,y+10,'Raumklima');
  let ry = y + 34;
  rooms.forEach(([name,tOid,hOid,mmBase])=>{
    label(v,24,ry+4,40,34, name, {size:'medium', color:COL.text, weight:'600', lh:'2.4'});
    label(v,68,ry, 90, 12, 'Max:', {size:'8px'});
    value(v,68,ry+11,90,12, mmBase+'.dayMax', {unit:'°C',digits:1,size:'8px',align:'left'});
    label(v,68,ry+22,90,12,'Min:',{size:'8px'});
    value(v,68,ry+33,90,12, mmBase+'.dayMin', {unit:'°C',digits:1,size:'8px',align:'left'});
    value(v, W-24-160, ry+8, 90, 26, tOid, {unit:'°C', digits:1, size:'large', align:'right'});
    value(v, W-24-64, ry+8, 52, 26, hOid, {unit:'%', digits:0, size:'small', align:'right', color:COL.blue});
    ry += 46;
  });
  y += 18+rooms.length*46 + 12;

  // Zusatz: Recovair Kurzsteuerung + USV + Beschattung (compact, real oids, from actual übersicht)
  cardBg(v,12,y,W-24,150); cardTitle(v,24,y+10,'Lüftung · Schnellzugriff');
  label(v,24,y+38,'Anlage',{}); mdSwitch(v, W-24-64, y+30, 56, 30, 'sonoff.0.Lueftung.POWER');
  label(v,24,y+72,'Lüften (30m)',{}); mdSwitch(v, W-24-64, y+64, 56, 30, '0_userdata.0.Recovair.VentCmd');
  label(v,24,y+106,'Intensiv (15m)',{}); mdSwitch(v, W-24-64, y+98, 56, 30, '0_userdata.0.Recovair.BoostCmd');
  y += 162;

  cardBg(v,12,y,W-24,86); cardTitle(v,24,y+10,'USV');
  label(v,24,y+38,'Verbindung',{}); mdSwitch(v, W-24-64, y+30, 56, 30, 'nut.0.info.connection');
  label(v,24,y+62,'Batterie',{}); value(v,W-24-100,y+58,88,20,'nut.0.battery.charge',{unit:'%',digits:0,size:'small'});
  y += 98;

  cardBg(v,12,y,W-24,58); cardTitle(v,24,y+10,'Beschattung');
  label(v,24,y+38,'Sonnenschutz aktiv',{}); mdSwitch(v, W-24-64, y+28, 56, 30, '0_userdata.0.ShutterControl.SunProtect');
  y += 70;

  navInclude(v);
  v.settings.sizey = String(y+90);
  project['index'] = v;
}

// ===================================================================
// VIEW HEIZUNG
// ===================================================================
{
  const v = view('viewHeizung');
  let y = 10;
  title(v,12,y,'Heizung'); value(v, W-140, y+2, 128, 30, 'ebus.1.broadcast.messages.outsidetemp.fields.temp2.value', {size:'x-large', unit:'°C', digits:1});
  y += 40; divider(v,12,y,W-24); y += 16;

  cardBg(v,12,y,W-24,110); cardTitle(v,24,y+10,'Heizkreis 1 (Mischer)');
  label(v,24,y+38,'Vorlauf Ist',{}); value(v,W-24-110,y+34,98,22,'ebus.1.mc.messages.FlowTemp.fields.temp.value',{unit:'°C',digits:1,size:'medium'});
  label(v,24,y+64,'Vorlauf Soll',{}); value(v,W-24-110,y+60,98,22,'ebus.1.mc.messages.FlowTempDesired.fields.temp1.value',{unit:'°C',digits:1,size:'medium'});
  label(v,24,y+90,'Status',{}); listValue(v,W-24-140,y+86,128,22,'ebus.1.mc.messages.Status.fields.3.value',{size:'small'});
  y += 122;

  cardBg(v,12,y,W-24,110); cardTitle(v,24,y+10,'Kessel');
  label(v,24,y+38,'Vorlauf Ist',{}); value(v,W-24-110,y+34,98,22,'ebus.1.bai.messages.FlowTemp.fields.temp.value',{unit:'°C',digits:1,size:'medium'});
  label(v,24,y+64,'Vorlauf Soll',{}); value(v,W-24-110,y+60,98,22,'ebus.1.bai.messages.FlowTempDesired.fields.temp.value',{unit:'°C',digits:1,size:'medium'});
  label(v,24,y+90,'Wasserdruck',{}); value(v,W-24-110,y+86,98,22,'ebus.1.bai.messages.WaterPressure.fields.press.value',{unit:'bar',digits:2,size:'medium'});
  y += 122;

  cardBg(v,12,y,W-24,138); cardTitle(v,24,y+10,'Wärmeerzeuger (KM200)');
  label(v,24,y+38,'Betriebsart',{}); listValue(v,W-24-140,y+34,128,22,'km200.0.heatingCircuits.hc1.operationMode',{size:'small'});
  label(v,24,y+64,'Status',{}); listValue(v,W-24-140,y+60,128,22,'km200.0.heatingCircuits.hc1.status',{size:'small'});
  label(v,24,y+90,'Leistung',{}); value(v,W-24-110,y+86,98,22,'km200.0.system.heatSources.hs1.actualPower',{unit:'W',digits:0,size:'medium'});
  label(v,24,y+116,'Abgastemperatur',{}); value(v,W-24-110,y+112,98,22,'km200.0.system.sensors.temperatures.chimney',{unit:'°C',digits:1,size:'medium'});
  y += 150;

  cardBg(v,12,y,W-24,86); cardTitle(v,24,y+10,'Solarspeicher (Warmwasser)');
  H.row3(v,y+34,[
    {oid:'ebus.1.sc.messages.Storage1Sensor3.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.1.sc.messages.Storage2Sensor3.fields.temp.value', unit:'°C', digits:1},
  ],['Speicher oben','Speicher unten']);
  y += 98;

  cardBg(v,12,y,W-24,178); cardTitle(v,24,y+10,'Gaszähler');
  label(v,24,y+38,'Verbrauch (Diff)',{}); value(v,W-24-110,y+34,98,22,'0_userdata.0.Total.TotalGasLasDiff',{unit:'m³',digits:3,size:'medium'});
  label(v,24,y+64,'Zählerstand',{}); value(v,W-24-110,y+60,98,22,'0_userdata.0.Total.TotalGas',{unit:'m³',digits:2,size:'medium'});
  label(v,24,y+90,'Verbrauch (%)',{}); value(v,W-24-110,y+86,98,22,'0_userdata.0.Total.TotalGasActual',{unit:'%',digits:1,size:'medium'});
  label(v,24,y+116,'Ø-Vergleich',{}); value(v,W-24-110,y+112,98,22,'0_userdata.0.Total.TotalGasProz',{unit:'%',digits:1,size:'medium'});
  label(v,24,y+142,'Vorjahr',{}); value(v,W-24-110,y+138,98,22,'0_userdata.0.Total.TotalGasLast',{unit:'m³',digits:2,size:'medium'});
  y += 190;

  iframe(v,12,y,W-24,300,'http://192.168.178.133:3000/d/pLVPM4ZRz/vaillant-heizung?orgId=1&refresh=10s');
  y += 316;

  navInclude(v); v.settings.sizey = String(y+90);
  project['viewHeizung'] = v;
}

// ===================================================================
// VIEW PHOTOVOLTAIK
// ===================================================================
{
  const v = view('viewPhotovoltaik');
  let y = 10;
  title(v,12,y,'Photovoltaik'); value(v, W-140, y+2, 128, 30, 'ebus.1.broadcast.messages.outsidetemp.fields.temp2.value', {size:'x-large', unit:'°C', digits:1});
  y += 40; divider(v,12,y,W-24); y += 16;

  iframe(v,12,y,W-24,260,'http://192.168.178.133:8082/energiefluss/index.html?instance=0');
  y += 276;
  iframe(v,12,y,W-24,300,'http://192.168.178.133:3000/d/nmigVjjWz/photovoltaik?orgId=1&refresh=10s');
  y += 316;

  cardBg(v,12,y,W-24,138); cardTitle(v,24,y+10,'Sonnen Wechselrichter');
  label(v,24,y+38,'Frequenz',{}); value(v,W-24-110,y+34,98,22,'sonnen.0.status.acFrequency',{unit:'Hz',digits:2,size:'medium'});
  label(v,24,y+64,'Spannung',{}); value(v,W-24-110,y+60,98,22,'sonnen.0.status.acVoltage',{unit:'V',digits:1,size:'medium'});
  label(v,24,y+90,'Vollladung seit',{}); value(v,W-24-140,y+86,128,22,'sonnen.0.latestData.secondsSinceFullCharge',{unit:'s',digits:0,size:'small'});
  label(v,24,y+116,'Software',{}); stringValue(v,W-24-140,y+112,128,22,'sonnen.0.configurations.DE_Software',{size:'small'});
  y += 150;

  cardBg(v,12,y,W-24,158); cardTitle(v,24,y+10,'Relais-Steuerung');
  label(v,24,y+38,'Verbindung',{}); mdSwitch(v,W-24-64,y+30,56,30,'sonnen.0.info.connection');
  label(v,24,y+72,'Verbrauch Relay',{}); mdSwitch(v,W-24-64,y+64,56,30,'sonnen.0.ios.DO_12');
  label(v,24,y+106,'Reduktion 1 Relay',{}); mdSwitch(v,W-24-64,y+98,56,30,'sonnen.0.ios.DO_13');
  label(v,24,y+140,'Reduktion 2 Relay',{}); mdSwitch(v,W-24-64,y+132,56,30,'sonnen.0.ios.DO_14');
  y += 170;

  navInclude(v); v.settings.sizey = String(y+90);
  project['viewPhotovoltaik'] = v;
}

// ===================================================================
// VIEW RECOVAIR (Lüftung)
// ===================================================================
{
  const v = view('viewRecovair');
  let y = 10;
  title(v,12,y,'Lüftung');
  y += 40; divider(v,12,y,W-24); y += 16;

  cardBg(v,12,y,W-24,150); cardTitle(v,24,y+10,'Luftströme');
  const streams = [
    ['Frischluft','ebus.0.recov.messages.TempOutsideAir.fields.temp.value'],
    ['Zuluft','ebus.0.recov.messages.TempInletAir.fields.temp.value'],
    ['Abluft','ebus.0.recov.messages.TempWasteAir.fields.temp.value'],
    ['Fortluft','ebus.0.recov.messages.TempOutgoingAir.fields.temp.value'],
  ];
  streams.forEach(([n,oid],i)=>{
    label(v,24,y+38+i*26,90,20,n,{});
    value(v,W-24-110,y+34+i*26,98,20,oid,{unit:'°C',digits:1,size:'medium'});
  });
  y += 162;

  cardBg(v,12,y,W-24,126); cardTitle(v,24,y+10,'Betrieb');
  label(v,24,y+38,'Feuchte (Abluft)',{}); value(v,W-24-110,y+34,98,22,'ebus.0.recov.messages.HumiWasteAir.fields.percent.value',{unit:'%',digits:1,size:'medium'});
  label(v,24,y+64,'Volumenstrom',{}); value(v,W-24-110,y+60,98,22,'ebus.0.recov.messages.FlowActual.fields.0.value',{unit:'m³/h',digits:0,size:'medium'});
  label(v,24,y+90,'Verbrauch',{}); value(v,W-24-160,y+86,60,22,'sonoff.0.Lueftung.SENSOR.ENERGY.Power',{unit:'W',digits:0,size:'small'});
  value(v,W-24-96,y+86,84,22,'sonoff.0.Lueftung.SENSOR.ENERGY.Total',{unit:'kWh',digits:1,size:'small',color:COL.sub});
  y += 138;

  cardBg(v,12,y,W-24,196); cardTitle(v,24,y+10,'Steuerung');
  const ctrls = [
    ['Start / Betrieb','sonoff.0.Lueftung.POWER'],
    ['Lüften (30m)','0_userdata.0.Recovair.VentCmd'],
    ['Intensivlüften (15m)','0_userdata.0.Recovair.BoostCmd'],
    ['Automatischer Stop','0_userdata.0.Recovair.AutoStopCmd'],
    ['Nachlaufzeit aktiv','0_userdata.0.Recovair.DelayTime'],
  ];
  ctrls.forEach(([n,oid],i)=>{
    label(v,24,y+38+i*30,150,20,n,{});
    mdSwitch(v,W-24-64,y+30+i*30,56,26,oid);
  });
  y += 46+ctrls.length*30;
  label(v,24,y,120,20,'Ziel Feuchtigkeit',{});
  mdSlider(v,150,y-4,W-24-160,28,'0_userdata.0.Recovair.SetpointRecov');
  y += 44;

  cardBg(v,12,y,W-24,110); cardTitle(v,24,y+10,'Klima');
  label(v,24,y+38,'Außen · Temp',{}); value(v,W-24-160,y+34,60,22,'openweathermap.0.forecast.current.temperature',{unit:'°C',digits:1,size:'small'});
  value(v,W-24-96,y+34,84,22,'0_userdata.0.absFeuchte.absFeuchteAussen',{unit:'g/m³',digits:1,size:'small',color:COL.blue});
  label(v,24,y+64,'Innen · Temp',{}); value(v,W-24-160,y+60,60,22,'mqtt.0.ESP09.Keller.Temperature',{unit:'°C',digits:1,size:'small'});
  value(v,W-24-96,y+60,84,22,'0_userdata.0.absFeuchte.absFeuchteInnen',{unit:'g/m³',digits:1,size:'small',color:COL.blue});
  y += 122;

  navInclude(v); v.settings.sizey = String(y+90);
  project['viewRecovair'] = v;
}

// ===================================================================
// VIEW SOLARANLAGE
// ===================================================================
{
  const v = view('viewSolaranlage');
  let y = 10;
  title(v,12,y,'Solaranlage'); value(v, W-140, y+2, 128, 30, 'ebus.1.sc.messages.Coll1Sensor.fields.temp.value', {size:'x-large', unit:'°C', digits:1});
  y += 40; divider(v,12,y,W-24); y += 16;

  cardBg(v,12,y,W-24,86); cardTitle(v,24,y+10,'Kollektor');
  label(v,24,y+38,'Temperatur',{}); value(v,W-24-110,y+34,98,22,'ebus.1.sc.messages.Coll1Sensor.fields.temp.value',{unit:'°C',digits:1,size:'medium'});
  label(v,24,y+64,'Pumpe',{}); value(v,W-24-110,y+60,98,22,'ebus.1.sc.messages.SolCollPumpED1.fields.percent0.value',{unit:'%',digits:0,size:'medium',color:COL.accent});
  y += 98;

  cardBg(v,12,y,W-24,86); cardTitle(v,24,y+10,'Speicher');
  H.row3(v,y+34,[
    {oid:'ebus.1.sc.messages.Storage1Sensor3.fields.temp.value', unit:'°C', digits:1},
    {oid:'ebus.1.sc.messages.Storage2Sensor3.fields.temp.value', unit:'°C', digits:1},
  ],['Oben','Unten']);
  label(v,24,y+38,'Speicher laden',{style:{display:'none'}});
  y += 98;

  cardBg(v,12,y,W-24,54); cardTitle(v,24,y+10,'Speicher laden erzwingen');
  mdSwitch(v,W-24-64,y+8,56,30,'0_userdata.0.Solaranlage.CmdLoadStorage');
  y += 66;

  cardBg(v,12,y,W-24,238); cardTitle(v,24,y+10,'Regelung');
  const regel = [
    ['Speicher Max (PWM off)','0_userdata.0.Solaranlage.TempHigh','°C',1],
    ['Kolländerung / 1min','0_userdata.0.Solaranlage.DifferenceMax','°C',1],
    ['Hysterese Speicher Max','0_userdata.0.Solaranlage.HystereseStorageMax','°C',1],
    ['Mittelwert Kollektor (5m)','0_userdata.0.Solaranlage.MittelwertCollValue','°C',1],
    ['Einschaltdifferenz','0_userdata.0.Solaranlage.DifferenzStart','°C',1],
    ['Deadband','0_userdata.0.Solaranlage.Deadband','°C',1],
    ['Hysterese-Rampe','0_userdata.0.Solaranlage.HystereseRampe','°C',1],
    ['Hysterese','0_userdata.0.Solaranlage.Hysterese','°C',1],
  ];
  regel.forEach(([n,oid,unit,digits],i)=>{
    label(v,24,y+38+i*24,180,18,n,{});
    value(v,W-24-90,y+35+i*24,78,18,oid,{unit,digits,size:'small'});
  });
  y += 46+regel.length*24;

  iframe(v,12,y,W-24,300,'http://192.168.178.133:3000/d/CTus57WRk/vaillant-solaranlage?orgId=1&refresh=10s');
  y += 316;

  navInclude(v); v.settings.sizey = String(y+90);
  project['viewSolaranlage'] = v;
}

// ===================================================================
// VIEW TEMPERATUR
// ===================================================================
{
  const v = view('viewTemperatur');
  let y = 10;
  title(v,12,y,'Temperatur'); value(v, W-140, y+2, 128, 30, 'openweathermap.0.forecast.current.temperature', {size:'x-large', unit:'°C', digits:1});
  y += 40; divider(v,12,y,W-24); y += 16;

  const rooms = [
    ['EG','shelly.1.shellyhtg3#d885ac1298d8#1'],
    ['KG','shelly.1.shellyhtg3#d885ac141500#1'],
    ['DG','shelly.1.shellyhtg3#d885ac1414f0#1'],
    ['OG','shelly.1.shellyhtg3#80b54e3563a0#1'],
  ];
  cardBg(v,12,y,W-24, 20+rooms.length*66); cardTitle(v,24,y+10,'Räume (Shelly H&T)');
  let ry = y+34;
  rooms.forEach(([name,base])=>{
    label(v,24,ry+6,36,30,name,{size:'medium',weight:'600',color:COL.text,lh:'2'});
    value(v, W-24-160, ry, 90, 26, base+'.Temperature0.Celsius', {unit:'°C', digits:1, size:'large'});
    value(v, W-24-64, ry, 52, 26, base+'.Humidity0.Relative', {unit:'%', digits:0, size:'small', color:COL.blue});
    label(v,70,ry+28,220,14,'', {});
    value(v,70,ry+28,60,14,'statistics.0.temp.minmax.'+base+'.Temperature0.Celsius.dayMax',{unit:'°C',digits:1,size:'8px',prepend:'Max: '});
    value(v,140,ry+28,60,14,'statistics.0.temp.minmax.'+base+'.Temperature0.Celsius.dayMin',{unit:'°C',digits:1,size:'8px',prepend:'Min: '});
    lastChange(v,70,ry+44,180,14,base+'.Temperature0.Celsius',{});
    value(v, W-24-64, ry+44, 52, 14, base+'.DevicePower0.BatteryPercent', {unit:'% Batt.', digits:0, size:'8px', color:COL.sub});
    ry += 66;
  });
  y = ry+12;

  cardBg(v,12,y,W-24,86); cardTitle(v,24,y+10,'Außen / Innen (abs. Feuchte)');
  label(v,24,y+38,'Außen',{}); value(v,W-24-160,y+34,60,22,'openweathermap.0.forecast.current.temperature',{unit:'°C',digits:1,size:'small'});
  value(v,W-24-96,y+34,84,22,'0_userdata.0.absFeuchte.absFeuchteAussen',{unit:'g/m³',digits:1,size:'small',color:COL.blue});
  label(v,24,y+64,'Innen',{}); value(v,W-24-96,y+60,84,22,'0_userdata.0.absFeuchte.absFeuchteInnen',{unit:'g/m³',digits:1,size:'small',color:COL.blue});
  y += 98;

  cardBg(v,12,y,W-24,86); cardTitle(v,24,y+10,'Steuerung');
  label(v,24,y+38,'Lüften (Feuchte-Trigger)',{}); mdSwitch(v,W-24-64,y+30,56,30,'0_userdata.0.absFeuchte.Lueften');
  label(v,24,y+64,'Multimedia',{}); mdSwitch(v,W-24-64,y+56,56,30,'sonoff.0.Multimedia.POWER');
  y += 98;

  iframe(v,12,y,W-24,240,'http://192.168.178.133:3000/d/-_mGMnzgz/raumtemperatur?orgId=1&from=now-1h&to=now&refresh=10s');
  y += 256;
  iframe(v,12,y,W-24,240,'http://192.168.178.133:3000/d/07b2e3d8-3c6b-4c93-9213-3afbc67483d5/humidity?orgId=1&from=now-1h&to=now&refresh=10s');
  y += 256;

  navInclude(v); v.settings.sizey = String(y+90);
  project['viewTemperatur'] = v;
}

// ===================================================================
// VIEW STATISTICS
// ===================================================================
{
  const v = view('viewStatistics');
  let y = 10;
  title(v,12,y,'Statistik');
  y += 40; divider(v,12,y,W-24); y += 16;

  const periods = [['Heute','day'],['Woche','week'],['Monat','month'],['Quartal','quarter'],['Jahr','year']];
  const colW = (W-24-90)/5;

  function statBlock(cardTitleText, rows, cardH){
    cardBg(v,12,y,W-24,cardH); cardTitle(v,24,y+10,cardTitleText);
    // header row
    periods.forEach(([p],i)=> label(v, 90+i*colW, y+30, colW-4, 14, p, {align:'right', size:'8px'}));
    let ry = y+46;
    rows.forEach(([rowLabel, src, unit, digits, totalOid])=>{
      label(v,24,ry+6,64,18,rowLabel,{size:'x-small'});
      periods.forEach(([,p],i)=>{
        value(v, 90+i*colW, ry, colW-4, 18, `statistics.0.temp.sumDelta.${src}.${p}`, {unit:'', digits, size:'8px', align:'right'});
      });
      if (totalOid) { label(v,24,ry+20,64,14,'Gesamt',{size:'8px'}); value(v,90,ry+20,W-24-90-4,14,totalOid,{unit,digits:digits+1,size:'8px',align:'left',color:COL.sub}); ry+=36; }
      else ry += 24;
    });
    y += cardH + 12;
  }

  statBlock('Strom', [
    ['Produktion','fronius.0.inverter.1.TOTAL_ENERGY','kWh',1,'fronius.0.inverter.1.TOTAL_ENERGY'],
    ['Einspeisung','0_userdata.0.Smartmeter.LK13BE.total_out','kWh',1,'0_userdata.0.Smartmeter.LK13BE.total_out'],
    ['Bezug','0_userdata.0.Smartmeter.LK13BE.total_in','kWh',1,'0_userdata.0.Smartmeter.LK13BE.total_in'],
  ], 158);

  statBlock('Erdgas', [
    ['Verbrauch','sonoff.0.GasMeter.SENSOR.COUNTER.C1','m³',2,'0_userdata.0.Total.TotalGas'],
  ], 74);

  statBlock('Wasser', [
    ['Verbrauch','sonoff.0.GasMeter.SENSOR.COUNTER.C2','m³',2,'0_userdata.0.Total.TotalWater'],
  ], 74);

  // Bonus: Top Verbraucher (monatlich, kWh) - confirmed via statistics.0.save.sumDelta...Total.month
  const geraete = [
    ['Kühlschrank','sonoff.0.Kühlschrank.SENSOR.ENERGY.Total'],
    ['Kühlschrank Keller','sonoff.0.Kühlschrank Keller.SENSOR.ENERGY.Total'],
    ['Spülmaschine','sonoff.0.Spülmaschine.SENSOR.ENERGY.Total'],
    ['Trockner','sonoff.0.Trockner.SENSOR.ENERGY.Total'],
    ['Waschmaschine','sonoff.0.Waschmaschine.SENSOR.ENERGY.Total'],
    ['Therme','sonoff.0.Therme.SENSOR.ENERGY.Total'],
    ['Lüftung','sonoff.0.Lueftung.SENSOR.ENERGY.Total'],
  ];
  cardBg(v,12,y,W-24, 30+geraete.length*22); cardTitle(v,24,y+10,'Top Verbraucher · Monat');
  let gy = y+34;
  geraete.forEach(([n,oid])=>{
    label(v,24,gy,220,18,n,{size:'x-small'});
    value(v,W-24-100,gy,88,18,`statistics.0.save.sumDelta.${oid}.month`,{unit:'kWh',digits:1,size:'x-small'});
    gy += 22;
  });
  y += 42+geraete.length*22;

  navInclude(v); v.settings.sizey = String(y+90);
  project['viewStatistics'] = v;
}

// ---------------------------------------------------------------------
const outDir = '..';
fs.writeFileSync(outDir+'/vis-views.json', JSON.stringify(project, null, 2));
let total = 0;
Object.entries(project).forEach(([name,vv])=>{ const n = Object.keys(vv.widgets).length; total+=n; console.log(name.padEnd(20), n, 'widgets, sizey', vv.settings.sizey); });
console.log('TOTAL widgets:', total);

module.exports = { project };
