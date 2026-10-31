#!/usr/bin/env python3
# Écart E21 : prouve qu'un lot de code est « sans effet » ou chiffre ses effets.
# Usage : borne-style-diff.py <url_avant> <url_apres> <dossier>   -> <dossier>/diff.json + verdict
# Deux pages, un navigateur ; aléas figés des deux côtés (Math.random à graine, date figée, animations coupées).
import asyncio, json, os, sys, subprocess, time
os.environ.setdefault("PLAYWRIGHT_BROWSERS_PATH", "/opt/pw-browsers")
from playwright.async_api import async_playwright

FORMATS = [(1920,1080,False),(1440,900,False),(1366,768,False),(1180,820,True),(820,1180,True),(390,844,True),(360,740,True),(844,390,True)]
PROGS = [("accueil",None,None),("puck","go","puck"),("chess","go","chess"),("fi","kata","fi"),("faunarratics","go","faunarratics"),("erratic","kata","erratic"),
 ("c4","kata","c4"),("hang","kata","hang"),("mm","kata","mm"),("fauneye","go","fauneye"),("vhs","go","vhs"),("photo","go","photo"),("bb","kata","bb"),
 ("diktat","kata","diktat"),("terminal","go","terminal"),("skopo","go","skopo"),("repo","go","repo"),("tor","go","tor")]
PROPS = ["display","position","top","right","bottom","left","width","height","margin","padding","font-size","font-weight","color","background-color",
 "background-image","border","border-radius","box-shadow","opacity","transform","z-index","visibility","filter","mix-blend-mode"]
LOG = "/tmp/claude-0/-home-claude/fcc5eb7c-825c-58a3-83eb-a7df32d09e71/scratchpad/live.log"

INIT = """(()=>{
 let s=123456789;Math.random=function(){s|=0;s=s+0x6D2B79F5|0;let t=Math.imul(s^s>>>15,1|s);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const T0=1767268800000,RD=Date;
 class FD extends RD{constructor(...a){a.length?super(...a):super(T0)}static now(){return T0}}
 window.Date=FD;
 try{localStorage.setItem('ik.koins','40');localStorage.setItem('borne.psy','0')}catch(e){}
 const st=()=>{const e=document.createElement('style');e.textContent='*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important;scroll-behavior:auto!important}';(document.head||document.documentElement).appendChild(e)};
 if(document.head)st();else document.addEventListener('DOMContentLoaded',st);
})()"""

RELEVE = """(props)=>{
 const out={};
 const seg=e=>{const t=e.tagName.toLowerCase();if(e.id)return t+'#'+e.id;let n=1;for(let x=e.previousElementSibling;x;x=x.previousElementSibling)if(x.tagName===e.tagName)n++;
  return t+(e.classList[0]?'.'+e.classList[0]:'')+':nth-of-type('+n+')'};
 const path=e=>{const s=[];for(let x=e;x&&x.nodeType===1;x=x.parentElement){s.unshift(seg(x));if(x.id)break}return s.join('>')};
 for(const e of document.querySelectorAll('body, body *')){
  if(e.closest('svg')&&e.tagName.toLowerCase()!=='svg')continue;
  if(/^(SCRIPT|STYLE|NOSCRIPT|LINK|META)$/.test(e.tagName))continue;
  const r=e.getBoundingClientRect();if(r.width<1||r.height<1)continue;
  const cs=getComputedStyle(e);if(cs.display==='none'||cs.visibility==='hidden')continue;
  const o={};for(const p of props)o[p]=cs.getPropertyValue(p);
  o.rect=[Math.round(r.left),Math.round(r.top),Math.round(r.width),Math.round(r.height)].join(',');
  let k=path(e);if(out[k]){let i=2;while(out[k+'~'+i])i++;k=k+'~'+i}
  out[k]=o}
 return out}"""

def log(m):
    try: h = subprocess.run(["date", "+%H:%M"], capture_output=True, text=True).stdout.strip()
    except Exception: h = time.strftime("%H:%M")
    with open(LOG, "a") as f: f.write(f"{h} sonde style : {m}\n")

async def releve(b, url, w, h, mob, kind, k):
    c = await b.new_context(viewport={"width": w, "height": h}, is_mobile=mob, has_touch=mob)
    await c.add_init_script(INIT)
    g = await c.new_page()
    try:
        await g.goto(url, wait_until="load"); await g.wait_for_timeout(5000)
        if kind:
            ok = await g.evaluate("([a,v])=>{const e=document.querySelector(`[data-${a}=\"${v}\"]`);if(!e)return false;e.click();return true}", [kind, k])
            if not ok: return {"_absent": {"programme": "introuvable"}}
            await g.wait_for_timeout(8000)
        res = {}
        for i, fr in enumerate(g.frames):
            try:
                if fr != g.main_frame and not fr.url.startswith(url.split("/")[0] + "//" + url.split("/")[2]): continue
                d = await fr.evaluate(RELEVE, PROPS)
                pre = "" if fr == g.main_frame else f"[frame{i}]"
                for key, v in d.items(): res[pre + key] = v
            except Exception: pass
        return res
    finally:
        await c.close()

def comparer(a, b):
    ec = []
    for k in sorted(set(a) | set(b)):
        if k not in a: ec.append({"element": k, "propriete": "presence", "avant": None, "apres": "present"}); continue
        if k not in b: ec.append({"element": k, "propriete": "presence", "avant": "present", "apres": None}); continue
        for p in a[k]:
            if a[k][p] != b[k].get(p): ec.append({"element": k, "propriete": p, "avant": a[k][p], "apres": b[k].get(p)})
    return ec

async def main():
    if len(sys.argv) < 4: sys.exit(__doc__)
    ua, ub, dossier = sys.argv[1:4]
    os.makedirs(dossier, exist_ok=True)
    diff, total = {}, 0
    log(f"départ avant={ua} après={ub}")
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--autoplay-policy=no-user-gesture-required"])
        for w, h, m in FORMATS:
            f = f"{w}x{h}"; diff[f] = {}
            for nom, kind, k in PROGS:
                try:
                    ra, rb = await asyncio.gather(releve(b, ua, w, h, m, kind, k), releve(b, ub, w, h, m, kind, k))
                    ec = comparer(ra, rb); n = len(ec)
                    diff[f][nom] = {"n": n, "elements_avant": len(ra), "elements_apres": len(rb), "ecarts": ec}
                except Exception as e:
                    n = 1; diff[f][nom] = {"n": 1, "erreur": str(e)[:160], "ecarts": []}
                total += n
                print(f"{f} x {nom} : {n} écarts" if n else f"{f} x {nom} : 0 écart", flush=True)
            log(f"{f} fait, total {total}")
        await b.close()
    diff["_total"] = total
    json.dump(diff, open(os.path.join(dossier, "diff.json"), "w"), ensure_ascii=False, indent=1)
    print(f"TOTAL : {total} écarts" if total else "TOTAL : 0 écart = sans effet")
    log(f"fin, total {total}")

asyncio.run(main())
