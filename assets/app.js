
window.ScriptUtils=(function(){
  function getBundleTexts(){
    const defaults={
      prijsuitreiking:'PRIJSUITREIKING DAIKIN NK AFSTANDEN {{onderdeel}}.',
      brons_1:'DE BRONZEN MEDAILLE, MET EEN TIJD VAN {{tijd}}.',
      brons_2:'NAMENS {{team}}',
      brons_3:'{{naam}}',
      zilver_1:'DE ZILVEREN MEDAILLE, MET EEN TIJD VAN {{tijd}}.',
      zilver_2:'NAMENS {{team}}',
      zilver_3:'{{naam}}',
      goud_1:'EN HET GOUD VOOR DE WINNAAR VAN DEZE {{onderdeel}}.',
      goud_2:'MET EEN TIJD VAN {{tijd}}.',
      goud_3:'NAMENS {{team}}',
      goud_4:'{{naam}}',
      uit_medailles:'DE MEDAILLES WORDEN UITGEREIKT DOOR {{naam_functie}}.',
      uit_bloemen:'DE BLOEMEN EN CADEAUTJES WORDEN UITGEREIKT DOOR {{naam_functie}}.',
      volkslied:'THIALF, GAAT U STAAN EN GRAAG UW AANDACHT VOOR HET NATIONALE VOLKSLIED: HET WILHELMUS.',
      applaus:'GEEF ZE NOG EEN GROOT APPLAUS, HET PODIUM VAN DEZE {{onderdeel}}.',
      podium_3:'DERDE PLAATS: {{naam}}',
      podium_2:'TWEEDE PLAATS: {{naam}}',
      podium_1:'EERSTE PLAATS: {{naam}} (NEDERLANDS KAMPIOEN)'
    };
    try{const saved=JSON.parse(localStorage.getItem('bundle_texts')||'{}'); return Object.assign({},defaults,saved);}catch(e){return defaults;}
  }
  function setBundleTexts(obj){ localStorage.setItem('bundle_texts', JSON.stringify(obj||{})); }
  function format(tpl,map){ return tpl.replace(/{{\s*([\w_]+)\s*}}/g,(_,k)=>(map[k]??'')); }
  function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');}
  function formatRich(tpl,map){ const plain=format(tpl,map||{}); let html=escapeHtml(plain); html=html.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>'); html=html.replace(/__(.+?)__/g,'<strong>$1</strong>'); return html; }
  function keyFor(onderdeel){ return 'fields:'+onderdeel; }
  function readData(onderdeel){ try{ return JSON.parse(localStorage.getItem(keyFor(onderdeel))||'{}'); }catch(e){ return {getBundleTexts,setBundleTexts,format,formatRich,keyFor,readData,writeData,allOnderdeelKeys,getOnderdeelList,setOnderdeelList,resetOnderdeelList,normalizeOnderdeelName}; } }
  function writeData(onderdeel,data){ localStorage.setItem(keyFor(onderdeel), JSON.stringify(data||{})); }
  const ONDERDELEN_KEY='onderdelen_list';
  const DEFAULT_ONDERDELEN=["500 Meter WOMEN", "1000 Meter WOMEN", "1500 Meter WOMEN", "3000 Meter WOMEN", "5000 Meter WOMEN", "Mass Start WOMEN", "500 Meter MEN", "1000 Meter MEN", "1500 Meter MEN", "5000 Meter MEN", "10000 Meter MEN", "Mass Start MEN", "Team Sprint MEN", "Team Sprint WOMEN"];

  function normalizeOnderdeelName(name){
    if(name==null) return '';
    let s=String(name).trim().replace(/\s+/g,' ');
    // Enforce requested naming conventions
    s=s.replace(/\bVROUWEN\b/gi,'WOMEN').replace(/\bVrouwen\b/g,'WOMEN');
    s=s.replace(/\bMANNEN\b/gi,'MEN').replace(/\bMannen\b/g,'MEN');
    s=s.replace(/Team\s+Pursuit/gi,'Team Sprint');
    return s;
  }

  function normalizeOnderdeelList(list){
    const out=[];
    const seen=new Set();
    (Array.isArray(list)?list:[]).forEach(item=>{
      const s=normalizeOnderdeelName(item);
      if(!s) return;
      const key=s.toLowerCase();
      if(seen.has(key)) return;
      seen.add(key);
      out.push(s);
    });
    return out;
  }

  function migrateOnderdeelData(oldName,newName){
    try{
      if(!oldName||!newName||oldName===newName) return;
      const oldKey=keyFor(oldName);
      const newKey=keyFor(newName);
      const oldVal=localStorage.getItem(oldKey);
      if(oldVal==null) return;
      const newVal=localStorage.getItem(newKey);
      if(newVal==null) localStorage.setItem(newKey, oldVal);
    }catch(e){}
  }

  function migrateStandardOnderdelen(){
    const legacy = [
      ["500 Meter WOMEN","500 Meter WOMEN"],
      ["1000 Meter WOMEN","1000 Meter WOMEN"],
      ["1500 Meter WOMEN","1500 Meter WOMEN"],
      ["3000 Meter WOMEN","3000 Meter WOMEN"],
      ["5000 Meter WOMEN","5000 Meter WOMEN"],
      ["Mass Start WOMEN","Mass Start WOMEN"],
      ["500 Meter MEN","500 Meter MEN"],
      ["1000 Meter MEN","1000 Meter MEN"],
      ["1500 Meter MEN","1500 Meter MEN"],
      ["5000 Meter MEN","5000 Meter MEN"],
      ["10000 Meter MEN","10000 Meter MEN"],
      ["Mass Start MEN","Mass Start MEN"],
      ["Team Sprint MEN","Team Sprint MEN"],
      ["Team Sprint WOMEN","Team Sprint WOMEN"],
    ];
    legacy.forEach(([a,b])=>migrateOnderdeelData(a,b));
  }

  function getOnderdeelList(){
    migrateStandardOnderdelen();
    let list=null;
    try{ list=JSON.parse(localStorage.getItem(ONDERDELEN_KEY)||'null'); }catch(e){ list=null; }
    if(!Array.isArray(list)) list=DEFAULT_ONDERDELEN;
    const normalized=normalizeOnderdeelList(list);
    try{
      const asJson=JSON.stringify(normalized);
      if(localStorage.getItem(ONDERDELEN_KEY)!==asJson) localStorage.setItem(ONDERDELEN_KEY, asJson);
    }catch(e){}
    return normalized;
  }

  function setOnderdeelList(list){
    migrateStandardOnderdelen();
    const normalized=normalizeOnderdeelList(list);
    localStorage.setItem(ONDERDELEN_KEY, JSON.stringify(normalized));
    return normalized;
  }

  function resetOnderdeelList(){
    localStorage.setItem(ONDERDELEN_KEY, JSON.stringify(DEFAULT_ONDERDELEN));
    migrateStandardOnderdelen();
    return DEFAULT_ONDERDELEN.slice();
  }

  function allOnderdeelKeys(){ return getOnderdeelList(); }
  return {getBundleTexts,setBundleTexts,format,formatRich,keyFor,readData,writeData,allOnderdeelKeys};
})();
