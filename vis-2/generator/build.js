// Generator for vis-views.json (classic-vis / vis-2 compatible schema)
// Confirmed real object IDs are taken from the user's own exported views + CSV.
const fs = require('fs');

// ---------- design tokens ----------
const W = 400; // canvas width (portrait phone)
const COL = { bg:'#14171a', card:'#20242a', cardAlt:'#262b31', accent:'#f4b043',
  green:'#6fcf73', red:'#ff6b6b', blue:'#4dabf7', text:'#ffffff', sub:'#9aa1a9' };
const FONT = 'Segoe UI, Tahoma, Geneva, sans-serif';

function view(name){ return { settings:{ style:{ background_class:'', 'background-color':COL.bg }, theme:'redmond', sizex:String(W), sizey:'1200', gridSize:'10', useBackground:false, snapType:0 }, widgets:{}, name, filterList:[] }; }

function addW(v, tpl, x,y,w,h, data, style, widgetSet){
  const keys = Object.keys(v.widgets);
  const id = 'e' + String(keys.length+1).padStart(5,'0');
  v.widgets[id] = { tpl, data: data||{}, style: Object.assign({left:x+'px', top:y+'px', width:w+'px', height:h+'px'}, style||{}), widgetSet: widgetSet||'basic' };
  return id;
}

function text(v,x,y,w,h,html,opts={}){
  return addW(v,'tplHtml',x,y,w,h,{ html }, Object.assign({ color:opts.color||COL.text, 'font-size':opts.size||'small', 'font-family':FONT, 'font-weight':opts.weight||'normal', 'text-align':opts.align||'left', 'line-height':opts.lh||'1.4', 'white-space':'pre-line' }, opts.style||{}));
}

function title(v,x,y,text_,opts={}){
  return text(v,x,y,W-2*x,30,text_,Object.assign({size:'x-large',weight:'600'},opts));
}

function cardBg(v,x,y,w,h){
  return addW(v,'tplHtml',x,y,w,h,{html:''},{ 'background-color':COL.card, 'border-radius':'14px', 'box-shadow':'0 2px 8px rgba(0,0,0,0.35)', 'z-index':0 });
}

function cardTitle(v,x,y,label){
  return text(v,x,y,W-2*x-24,20,label,{size:'small',weight:'600',color:COL.accent,style:{'letter-spacing':'0.5px','text-transform':'uppercase'}});
}

function value(v,x,y,w,h,oid,opts={}){
  const data = { oid, is_comma:true, factor: opts.factor||'1', digits: opts.digits!=null?String(opts.digits):'1',
    html_prepend: opts.prepend||'', html_append_plural: opts.unit?(' '+opts.unit):'', html_append_singular: opts.unit?(' '+opts.unit):'' };
  return addW(v,'tplValueFloat',x,y,w,h,data,{ color:opts.color||COL.text, 'font-size':opts.size||'medium', 'font-weight':opts.weight||'600', 'font-family':FONT, 'text-align':opts.align||'right' });
}

function stringValue(v,x,y,w,h,oid,opts={}){
  const data = { oid, html_prepend: opts.prepend||'', html_append: opts.append||'' };
  return addW(v,'tplValueString',x,y,w,h,data,{ color:opts.color||COL.text, 'font-size':opts.size||'small', 'font-family':FONT, 'text-align':opts.align||'right' });
}

function listValue(v,x,y,w,h,oid,opts={}){
  return addW(v,'tplValueList',x,y,w,h,{ oid }, { color:opts.color||COL.text, 'font-size':opts.size||'small', 'font-family':FONT, 'text-align':opts.align||'right' });
}

function lastChange(v,x,y,w,h,oid,opts={}){
  return addW(v,'tplValueLastchange',x,y,w,h,{ oid, lc_format:'' }, { color:opts.color||COL.sub, 'font-size':opts.size||'x-small', 'font-family':FONT, 'text-align':opts.align||'left' });
}

function label(v,x,y,w,h,text_,opts={}){
  return text(v,x,y,w,h,text_,Object.assign({size:'x-small',color:COL.sub},opts));
}

function divider(v,x,y,w){
  return addW(v,'tplHtml',x,y,w,1,{html:''},{ 'background-color':COL.accent });
}

function iconNav(v,x,y,size,src,nav_view){
  return addW(v,'tplJquiIconNav',x,y,size,size,{ src, nav_view }, { 'border-width':'', 'border-style':'none', background:'rgba(100,100,100,0)' }, 'jqui');
}

function iframe(v,x,y,w,h,src){
  return addW(v,'tplIFrame',x,y,w,h,{ src, seamless:'true', refreshInterval:'0' },{ border:'none', 'border-radius':'14px', overflow:'hidden' });
}

function navInclude(v){
  return addW(v,'tplContainerView',0,W>0?1130:0,W,70,{ contains_view:'navigation' },{});
}

function mdSwitch(v,x,y,w,h,oid){
  const data = { oid, toggleType:'boolean', stateIfNotTrueValue:'on', vibrateOnMobilDevices:'50', clickSoundVolume:'0.5',
    labelPosition:'right', labelClickActive:'true',
    valueFontFamily:'#mdwTheme:vis-materialdesign.0.fonts.switch.value', valueFontSize:'#mdwTheme:vis-materialdesign.0.fontSizes.switch.value',
    colorSwitchThumb:'#mdwTheme:vis-materialdesign.0.colors.switch.off', colorSwitchTrack:'#mdwTheme:vis-materialdesign.0.colors.switch.track',
    colorSwitchTrue:'#mdwTheme:vis-materialdesign.0.colors.switch.on', colorSwitchHover:'#mdwTheme:vis-materialdesign.0.colors.switch.off_hover',
    colorSwitchHoverTrue:'#mdwTheme:vis-materialdesign.0.colors.switch.on_hover', labelColorFalse:'#mdwTheme:vis-materialdesign.0.colors.switch.text_off',
    labelColorTrue:'#mdwTheme:vis-materialdesign.0.colors.switch.text_on', autoLockAfter:'10', lockIconTop:'5', lockIconLeft:'5',
    lockIconColor:'#mdwTheme:vis-materialdesign.0.colors.switch.lock_icon', lockFilterGrayscale:'30', valueOff:'', valueOn:'' };
  return addW(v,'tplVis-materialdesign-Switch',x,y,w,h,data,{},'materialdesign');
}

function mdSlider(v,x,y,w,h,oid){
  const data = { oid, orientation:'horizontal', knobSize:'knobSmall', step:'1', vibrateOnMobilDevices:'50', showTicks:'no',
    tickTextColor:'#mdwTheme:vis-materialdesign.0.colors.slider.tick', colorThumb:'#mdwTheme:vis-materialdesign.0.colors.slider.control',
    showValueLabel:'true', valueLabelStyle:'sliderValue', valueLabelWidth:'50', showThumbLabel:'no' };
  return addW(v,'tplVis-materialdesign-Vuetify-Slider',x,y,w,h,data,{},'materialdesign');
}

function mdProgressCircular(v,x,y,size,oid,opts={}){
  const data = { oid, colorProgress: opts.color||'#f4b043', innerColor:'#20242a', showValueLabel:'true', valueLabelStyle:'progressPercent',
    textColor:'#ffffff' };
  return addW(v,'tplVis-materialdesign-Progress-Circular',x,y,size,size,data,{},'materialdesign');
}

// ---------- shared column helper: 3 stacked values with labels ----------
function row3(v, y, oids, labels, opts={}){
  const colW = (W-24)/3;
  labels.forEach((l,i)=> label(v, 12+i*colW, y, colW-6, 16, l, {align:'center'}));
  oids.forEach((o,i)=> value(v, 12+i*colW, y+16, colW-6, 26, o.oid, Object.assign({align:'center', size:'large', color:o.color||COL.text, unit:o.unit, digits:o.digits},opts)));
}

module.exports = { view, addW, text, title, cardBg, cardTitle, value, stringValue, listValue, lastChange, label, divider, iconNav, iframe, navInclude, mdSwitch, mdSlider, mdProgressCircular, row3, W, COL, FONT };
