# Tableau de bord d'Insert Koin : mesures chiffrées sur huit formats, à chaque lot, avant toute mise en ligne.
# usage : python3 tools/borne-mesures.py http://localhost:8092/insertkoin/ <dossier>
# ecran_pct : part de la fenêtre occupée par l'image de l'écran ; ecran_axe, fente_axe : écart à l'axe du meuble en px ;
# lore_sur_plaque : part de l'autocollant posée sur la plaque ; bandeau_anim : défilement du titre ; fronton_g_d : largeurs des boîtes gauche et droite ;
# erreurs : erreurs de console ; csp : blocages par la politique de sécurité.
import asyncio,sys,json
from playwright.async_api import async_playwright
URL=sys.argv[1]; O=sys.argv[2]; TAG='m'
SZ=[(1920,1080,False),(1440,900,False),(1366,768,False),(1180,820,True),(820,1180,True),(390,844,True),(360,740,True),(844,390,True)]
JS="""(()=>{const R=s=>{const e=document.querySelector(s);return e&&e.offsetWidth?e.getBoundingClientRect():null};
const g=R('.b-glass'),w=R('.wrap'),p=R('#home .b-panel'),s=R('.b-slot'),l=R('.b-lore'),t=R('#radio-toggle'),bell=R('.b-bell');
const ov=(a,b)=>a&&b?Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left))*Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)):0;
const tk=document.querySelector('#radio-toggle .motel-l .b-tk');
return {ecran_pct:g?+(100*g.width*g.height/(innerWidth*innerHeight)).toFixed(1):null,
 ecran_axe:g&&w?Math.round(g.left+g.width/2-(w.left+w.width/2)):null,
 fente_axe:s&&p?Math.round(s.left+s.width/2-(p.left+p.width/2)):null,
 lore_sur_plaque:l&&s?+(ov(l,s)/(l.width*l.height)).toFixed(2):null,
 bandeau_anim:tk?getComputedStyle(tk).animationName:null,
 fronton_g_d:t&&bell?[Math.round(t.width),Math.round(bell.width)]:null}})()"""
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(); out={}
    for W,H,M in SZ:
      c=await b.new_context(viewport={'width':W,'height':H},is_mobile=M,has_touch=M); await c.add_init_script("try{localStorage.setItem('borne.psy','0')}catch(e){}")
      g=await c.new_page(); err=[]
      g.on('pageerror',lambda x:err.append(str(x)[:90])); g.on('console',lambda m:err.append(m.text[:90]) if m.type=='error' and 'ERR_TUNNEL' not in m.text and 'Failed to load resource' not in m.text else None)
      await g.goto(URL); await g.wait_for_timeout(7000)
      r=await g.evaluate(JS); r['erreurs']=len(err); r['csp']=sum('Content Security Policy' in x for x in err); out[f'{W}x{H}']=r; print(W,H,r)
      await g.screenshot(path=f'{O}/{TAG}-home-{W}x{H}.png',full_page=True); await c.close()
    json.dump(out,open(f'{O}/{TAG}-mesures.json','w'),indent=1); await b.close()
asyncio.run(main())
