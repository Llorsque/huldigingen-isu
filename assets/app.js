
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
  function readData(onderdeel){
    // Onderdeel keys are typically already UPPERCASE (see form.html), but we keep it generic.
    const k = keyFor(onderdeel);
    try{
      const raw = localStorage.getItem(k);
      let parsed = {};
      if(raw){
        parsed = JSON.parse(raw||'{}')||{};
        if(parsed && Object.keys(parsed).length){ return parsed; }
      }
      // If nothing (or only an empty object) exists under the current key, try legacy keys
      // and migrate found data to the new key.
      const base = String(onderdeel||'');
      const variants = new Set([base]);

      const swaps = [
        ['TEAM SPRINT','TEAM PURSUIT'],
        ['WOMEN','VROUWEN'],
        ['MEN','MANNEN']
      ];
      // generate combinations
      for(const [from,to] of swaps){
        const cur = Array.from(variants);
        for(const v of cur){
          if(v.includes(from)) variants.add(v.split(from).join(to));
        }
      }

      for(const v of variants){
        if(v===base) continue;
        const r = localStorage.getItem(keyFor(v));
        if(!r) continue;
        const d = JSON.parse(r||'{}')||{};
        if(d && Object.keys(d).length){
          // migrate
          localStorage.setItem(k, JSON.stringify(d));
          return d;
        }
      }
      return parsed||{};
    }catch(e){
      return {};
    }
  }
  function writeData(onderdeel,data){ localStorage.setItem(keyFor(onderdeel), JSON.stringify(data||{})); }
  
  // --- Onderdelen (editable + shareable via JSON export/import on onderdelen.html) ---
  const ONDERDELEN_KEY = 'onderdelen:list';

  function defaultOnderdelen(){
    return [
      "500 Meter WOMEN",
      "1000 Meter WOMEN",
      "1500 Meter WOMEN",
      "3000 Meter WOMEN",
      "5000 Meter WOMEN",
      "Mass Start WOMEN",
      "500 Meter MEN",
      "1000 Meter MEN",
      "1500 Meter MEN",
      "5000 Meter MEN",
      "10000 Meter MEN",
      "Mass Start MEN",
      "Team Sprint MEN",
      "Team Sprint WOMEN"
    ];
  }

  function normalizeOnderdeelName(name){
    let s = String(name||'').trim().replace(/\s+/g,' ');
    if(!s) return '';
    // normalize labels
    s = s.replace(/\bteam\s+pursuit\b/ig,'Team Sprint');
    s = s.replace(/\bvrouwen\b/ig,'WOMEN').replace(/\bmannen\b/ig,'MEN');
    s = s.replace(/\bVROUWEN\b/g,'WOMEN').replace(/\bMANNEN\b/g,'MEN');
    // clean double spaces after replacements
    s = s.replace(/\s+/g,' ').trim();
    return s;
  }

  function uniqPreserve(arr){
    const seen = new Set();
    const out = [];
    for(const x of arr){
      if(!x) continue;
      const k = x;
      if(seen.has(k)) continue;
      seen.add(k);
      out.push(x);
    }
    return out;
  }

  function getOnderdelen(){
    try{
      const raw = localStorage.getItem(ONDERDELEN_KEY);
      if(!raw) return defaultOnderdelen();
      const arr = JSON.parse(raw);
      if(!Array.isArray(arr)) return defaultOnderdelen();
      const cleaned = uniqPreserve(arr.map(normalizeOnderdeelName).filter(Boolean));
      return cleaned.length ? cleaned : defaultOnderdelen();
    }catch(e){
      return defaultOnderdelen();
    }
  }

  function setOnderdelen(list){
    const arr = (Array.isArray(list) ? list : [])
      .map(normalizeOnderdeelName)
      .filter(Boolean);
    const cleaned = uniqPreserve(arr);
    localStorage.setItem(ONDERDELEN_KEY, JSON.stringify(cleaned.length ? cleaned : defaultOnderdelen()));
    return getOnderdelen();
  }

  function resetOnderdelen(){
    localStorage.removeItem(ONDERDELEN_KEY);
    return getOnderdelen();
  }

function allOnderdeelKeys(){ return getOnderdelen(); }
  return {getBundleTexts,setBundleTexts,format,formatRich,keyFor,readData,writeData,allOnderdeelKeys,getOnderdelen,setOnderdelen,resetOnderdelen,defaultOnderdelen,normalizeOnderdeelName};
})();
