// Generator for vis-views.json — v2 "modern HTML" skin, iPhone X (375x812) optimized.
// Same confirmed real object IDs as v1, completely reskinned: glass cards, gradient
// accents, emoji-chip icons (as inline SVG data-URIs), floating pill nav — nothing
// reused from the classic-vis look (no /icons-mfd-svg/, no amber divider bars).
const fs = require('fs');

// ---------- design tokens ----------
const W = 375; // iPhone X logical width (points)
const SAFE_TOP = 12;   // small extra breathing room below the status bar (vis runs in Safari, not full native chrome)
const SAFE_BOTTOM = 28; // above home-indicator
const COL = {
  bg1:'#0b0c12', bg2:'#14171f',
  glass:'rgba(255,255,255,0.055)', glassBorder:'rgba(255,255,255,0.09)',
  text:'#f2f4f8', sub:'#8b93a6',
  accentA:'#7c6cff', accentB:'#4fd1ff',
  green:'#34d399', red:'#fb7185', blue:'#60a5fa', amber:'#fbbf24',
};
const FONT = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif";

function grad(a,b,deg){ return `linear-gradient(${deg||135}deg, ${a}, ${b})`; }

function view(name){
  return { settings:{ style:{ 'background-color':COL.bg1, background: `radial-gradient(1200px 600px at 20% -10%, ${COL.bg2}, ${COL.bg1} 60%)` }, theme:'redmond', sizex:String(W), sizey:'1200', gridSize:'10', useBackground:false, snapType:0 }, widgets:{}, name, filterList:[] };
}

function addW(v, tpl, x,y,w,h, data, style, widgetSet){
  const keys = Object.keys(v.widgets);
  const id = 'e' + String(keys.length+1).padStart(5,'0');
  v.widgets[id] = { tpl, data: data||{}, style: Object.assign({left:x+'px', top:y+'px', width:w+'px', height:h+'px'}, style||{}), widgetSet: widgetSet||'basic' };
  return id;
}

function text(v,x,y,w,h,html,opts={}){
  return addW(v,'tplHtml',x,y,w,h,{ html }, Object.assign({ color:opts.color||COL.text, 'font-size':opts.size||'14px', 'font-family':FONT, 'font-weight':opts.weight||'400', 'text-align':opts.align||'left', 'line-height':opts.lh||'1.35', 'white-space':'pre-line', 'letter-spacing':opts.ls||'normal' }, opts.style||{}));
}

// page header: icon chip + title + optional right-aligned live value
function header(v, emoji, titleText, rightOid, rightUnit){
  addW(v,'tplHtml',16,SAFE_TOP,44,44,{html:`<div style="width:44px;height:44px;border-radius:14px;background:${grad(COL.accentA,COL.accentB)};display:flex;align-items:center;justify-content:center;font-size:22px;box-shadow:0 6px 16px rgba(124,108,255,0.35)">${emoji}</div>`},{ 'background-color':'transparent' });
  text(v,68,SAFE_TOP+2,180,44,titleText,{size:'22px', weight:'700', lh:'44px'});
  if (rightOid){
    addW(v,'tplValueFloat',W-16-110,SAFE_TOP+2,110,44,{ oid:rightOid, is_comma:true, factor:'1', digits:'1', html_append_plural:' '+(rightUnit||'°C'), html_append_singular:' '+(rightUnit||'°C') },{ color:COL.text,'font-size':'22px','font-weight':'700','font-family':FONT,'text-align':'right','line-height':'44px'});
  }
  return SAFE_TOP+44+18;
}

function cardBg(v,x,y,w,h,accent){
  addW(v,'tplHtml',x,y,w,h,{html:''},{ background:COL.glass, border:`1px solid ${COL.glassBorder}`, 'border-radius':'20px', 'box-shadow':'0 8px 24px rgba(0,0,0,0.35)', 'backdrop-filter':'blur(14px)', 'z-index':0 });
  addW(v,'tplHtml',x+18,y,32,4,{html:''},{ background:grad(accent||COL.accentA, accent||COL.accentB,90), 'border-radius':'4px', 'z-index':1 });
}

function cardTitle(v,x,y,label){
  return text(v,x,y+10,W-2*x-24,18,label,{size:'12px', weight:'700', color:COL.sub, ls:'0.6px', style:{'text-transform':'uppercase'}});
}

function value(v,x,y,w,h,oid,opts={}){
  const data = { oid, is_comma:true, factor: opts.factor||'1', digits: opts.digits!=null?String(opts.digits):'1',
    html_prepend: opts.prepend||'', html_append_plural: opts.unit?(' '+opts.unit):'', html_append_singular: opts.unit?(' '+opts.unit):'' };
  return addW(v,'tplValueFloat',x,y,w,h,data,{ color:opts.color||COL.text, 'font-size':opts.size||'17px', 'font-weight':opts.weight||'700', 'font-family':FONT, 'text-align':opts.align||'right', 'letter-spacing':'-0.2px' });
}

function stringValue(v,x,y,w,h,oid,opts={}){
  const data = { oid, html_prepend: opts.prepend||'', html_append: opts.append||'' };
  return addW(v,'tplValueString',x,y,w,h,data,{ color:opts.color||COL.text, 'font-size':opts.size||'13px', 'font-family':FONT, 'text-align':opts.align||'right' });
}

function listValue(v,x,y,w,h,oid,opts={}){
  return addW(v,'tplValueList',x,y,w,h,{ oid }, { color:opts.color||COL.text, 'font-size':opts.size||'13px', 'font-family':FONT, 'text-align':opts.align||'right' });
}

function lastChange(v,x,y,w,h,oid,opts={}){
  return addW(v,'tplValueLastchange',x,y,w,h,{ oid, lc_format:'' }, { color:opts.color||COL.sub, 'font-size':opts.size||'11px', 'font-family':FONT, 'text-align':opts.align||'left' });
}

function label(v,x,y,w,h,text_,opts={}){
  return text(v,x,y,w,h,text_,Object.assign({size:'12px',color:COL.sub},opts));
}

// tile: icon-free stat tile used inside grid rows (label above, big value below)
function tileLabel(v,x,y,w,label_){
  return label(v,x,y,w,14,label_,{size:'11px', weight:'600', style:{'text-transform':'uppercase'}, ls:'0.4px'});
}

function tileGrid(v, x0, y, w, cols, items, rowH){
  const gap = 10;
  const colW = (w - (cols-1)*gap)/cols;
  items.forEach((it,i)=>{
    const cx = x0 + (i%cols)*(colW+gap);
    const cy = y + Math.floor(i/cols)*rowH;
    tileLabel(v, cx, cy, colW, it.label);
    value(v, cx, cy+16, colW, 26, it.oid, Object.assign({ size:'19px', align:'left' }, it));
  });
  return y + Math.ceil(items.length/cols)*rowH;
}

function divider(v,x,y,w){ /* deprecated visually — kept as no-op spacer for layout compat */ return null; }

function emojiIcon(emoji, bg){
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'><rect width='64' height='64' rx='18' fill='${bg}'/><text x='32' y='43' font-size='30' text-anchor='middle'>${emoji}</text></svg>`;
  return 'data:image/svg+xml,' + encodeURIComponent(svg);
}

function iconNav(v,x,y,size,emoji,bg,nav_view){
  const src = emojiIcon(emoji, bg);
  return addW(v,'tplJquiIconNav',x,y,size,size,{ src, nav_view }, { 'border-width':'0', 'border-style':'none', background:'transparent', 'border-radius':'14px' }, 'jqui');
}

function iframe(v,x,y,w,h,src){
  return addW(v,'tplIFrame',x,y,w,h,{ src, seamless:'true', refreshInterval:'0' },{ border:'none', 'border-radius':'20px', overflow:'hidden', 'box-shadow':'0 8px 24px rgba(0,0,0,0.35)' });
}

function navInclude(v, y){
  return addW(v,'tplContainerView',0,y,W,90,{ contains_view:'navigation' },{ background:'transparent' });
}

function mdSwitch(v,x,y,w,h,oid){
  const data = { oid, toggleType:'boolean', stateIfNotTrueValue:'on', vibrateOnMobilDevices:'50', clickSoundVolume:'0.5',
    labelPosition:'right', labelClickActive:'true',
    valueFontFamily:'#mdwTheme:vis-materialdesign.0.fonts.switch.value', valueFontSize:'#mdwTheme:vis-materialdesign.0.fontSizes.switch.value',
    colorSwitchThumb:'#mdwTheme:vis-materialdesign.0.colors.switch.off', colorSwitchTrack:'#mdwTheme:vis-materialdesign.0.colors.switch.track',
    colorSwitchTrue: COL.accentA, colorSwitchHover:'#mdwTheme:vis-materialdesign.0.colors.switch.off_hover',
    colorSwitchHoverTrue:'#mdwTheme:vis-materialdesign.0.colors.switch.on_hover', labelColorFalse:'#mdwTheme:vis-materialdesign.0.colors.switch.text_off',
    labelColorTrue:'#mdwTheme:vis-materialdesign.0.colors.switch.text_on', autoLockAfter:'10', lockIconTop:'5', lockIconLeft:'5',
    lockIconColor:'#mdwTheme:vis-materialdesign.0.colors.switch.lock_icon', lockFilterGrayscale:'30', valueOff:'', valueOn:'' };
  return addW(v,'tplVis-materialdesign-Switch',x,y,w,h,data,{},'materialdesign');
}

function mdSlider(v,x,y,w,h,oid){
  const data = { oid, orientation:'horizontal', knobSize:'knobSmall', step:'1', vibrateOnMobilDevices:'50', showTicks:'no',
    colorThumb: COL.accentA, showValueLabel:'true', valueLabelStyle:'sliderValue', valueLabelWidth:'50', showThumbLabel:'no' };
  return addW(v,'tplVis-materialdesign-Vuetify-Slider',x,y,w,h,data,{},'materialdesign');
}

function mdProgressCircular(v,x,y,size,oid,opts={}){
  const data = { oid, colorProgress: opts.color||COL.accentA, innerColor:'transparent', showValueLabel:'true', valueLabelStyle:'progressPercent', textColor:COL.text };
  return addW(v,'tplVis-materialdesign-Progress-Circular',x,y,size,size,data,{},'materialdesign');
}

function row3(v, y, oids, labels, opts={}){
  const colW = (W-32-20)/3;
  labels.forEach((l,i)=> tileLabel(v, 16+i*(colW+10), y, colW, l));
  oids.forEach((o,i)=> value(v, 16+i*(colW+10), y+16, colW, 26, o.oid, Object.assign({align:'left', size:'19px', color:o.color||COL.text, unit:o.unit, digits:o.digits},opts)));
}

module.exports = { view, addW, text, header, cardBg, cardTitle, value, stringValue, listValue, lastChange, label, tileLabel, tileGrid, divider, iconNav, emojiIcon, iframe, navInclude, mdSwitch, mdSlider, mdProgressCircular, row3, W, COL, FONT, SAFE_TOP, SAFE_BOTTOM };
