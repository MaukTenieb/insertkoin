#!/usr/bin/env python3
"""Contrôle de la borne : cinq fenêtres, mêmes chiffres avant et après chaque lot.

Usage : python3 borne-controle.py <url de la borne> <dossier de sortie> [--court]
Sortie : controle.json (chiffres par fenêtre) et des captures : arrivée, visite, chaque programme ouvert.
Chiffres :
- accueil : écran entier à l'arrivée, texte sous 12 px, cibles tactiles sous 44 px, débordement horizontal, images par seconde ;
- visite : de 6 à 21 s (court) ou 6 à 46 s, défilement de la page et part du temps où l'écran reste entier ;
- geste : après une molette du visiteur, la visite se fige 3,5 s au moins puis reprend où elle en était (décision de Mauk Tenieb) ;
- psychopompe et bulle hors des commandes : rangée du bas, touches du panneau, son, PL et afficheur du fronton ; la commande que la visite montre (classe sweep) reste hors du compte ;
- jeu : Korong!, 3615, Erratik, Katabatik ouverts ; barre et Baku Boom dans la fenêtre, Baku Boom hors de l'écran de jeu, écran de jeu dans la fenêtre ;
- erreurs de la page.
"""
import asyncio, json, sys, os
from playwright.async_api import async_playwright

FEN = [(1920, 1080, False), (1366, 768, False), (820, 1180, True), (390, 844, True), (844, 390, True)]
JEUX = ("puck", "terminal", "erratic", "katabatik")

MESURE = """(()=>{
  const H=innerHeight,W=innerWidth,s=document.querySelector('.b-screen'),r=s?s.getBoundingClientRect():null;
  const vis=e=>{const q=e.getBoundingClientRect();if(q.width<1||q.height<1||q.bottom<0||q.top>H)return null;const c=getComputedStyle(e);if(c.visibility==='hidden'||c.display==='none'||+c.opacity===0)return null;return q};
  const cache=e=>{for(let x=e;x;x=x.parentElement){const k=getComputedStyle(x);if(+k.opacity===0||k.visibility==='hidden'||(k.clipPath||'').includes('inset(50%')||(k.clip||'').startsWith('rect(0'))return true}return false};
  const zone=(e,q)=>{let w=q.width,h=q.height;for(const ps of ['::before','::after']){const k=getComputedStyle(e,ps);if(k.content==='none'||k.position!=='absolute'||k.pointerEvents==='none')continue;const t=-parseFloat(k.top)||0,b=-parseFloat(k.bottom)||0,l=-parseFloat(k.left)||0,r=-parseFloat(k.right)||0;w=Math.max(w,q.width+Math.max(0,l)+Math.max(0,r));h=Math.max(h,q.height+Math.max(0,t)+Math.max(0,b));}return [w,h]};
  let petit=0,ex=[];
  for(const e of document.querySelectorAll('body *')){if(!e.childNodes.length)continue;let t='';for(const n of e.childNodes)if(n.nodeType===3)t+=n.textContent.trim();if(!t)continue;
    if(e.closest('iframe,svg,.guide,.gtip'))continue;const q=vis(e);if(!q||cache(e))continue;const f=parseFloat(getComputedStyle(e).fontSize);if(f<12){petit++;if(ex.length<6)ex.push(t.slice(0,24)+' '+f+'px')}}
  let cible=0,cx=[];
  for(const e of document.querySelectorAll('a,button,[role=button],input,select,.cab,#radio-toggle')){const q0=vis(e);if(!q0||cache(e))continue;const [zw,zh]=zone(e,q0);const q={width:zw,height:zh};if(Math.min(q.width,q.height)<44*(W<900?1:0.6)){cible++;if(cx.length<6)cx.push((e.textContent||e.className||'').toString().trim().slice(0,18)+' '+Math.round(q.width)+'x'+Math.round(q.height))}}
  return {ecran:r?[Math.round(r.top),Math.round(r.bottom)]:null,ecranEntier:!!r&&r.top>=0&&r.bottom<=H,
    debordeX:document.documentElement.scrollWidth>W+1,hauteurPage:document.documentElement.scrollHeight,
    textePetit:petit,textePetitEx:ex,ciblesPetites:cible,ciblesEx:cx}
})()"""

JEU = """(()=>{const W=innerWidth,H=innerHeight,R=s=>{const e=document.querySelector(s);if(!e||!e.getClientRects().length)return null;return e.getBoundingClientRect()};
  const f=R('.b-bezelfoot'),b=R('.b-bezelfoot .b-boom'),g=R('.b-glass');
  const dans=q=>!!q&&q.left>=-1&&q.top>=-1&&q.right<=W+1&&q.bottom<=H+1;
  const sur=(a,c)=>!!a&&!!c&&Math.min(a.right,c.right)-Math.max(a.left,c.left)>4&&Math.min(a.bottom,c.bottom)-Math.max(a.top,c.top)>4;
  return {ouvert:!!document.documentElement.dataset.prog,barreDansFenetre:dans(f),boomDansFenetre:dans(b),boomSurEcran:sur(b,g),ecranDansFenetre:dans(g)}})()"""

GUIDE = """(()=>{const Z=[...document.querySelectorAll('.b-bezelfoot,.b-row2 nav a,.bar .dock #radio-toggle,.bar .dock button,.b-pfx .b-px')].filter(x=>!x.closest('.sweep')&&!x.querySelector('.sweep')).map(x=>x.getBoundingClientRect()).filter(r=>r.width>0);const hit=q=>Z.some(r=>Math.min(q.right,r.right)-Math.max(q.left,r.left)>4&&Math.min(q.bottom,r.bottom)-Math.max(q.top,r.top)>4);
  const g=document.querySelector('.guide'),t=document.querySelector('.gtip.on');return ((g&&g.getClientRects().length&&hit(g.getBoundingClientRect()))||(t&&hit(t.getBoundingClientRect())))?1:0})()"""

FPS = "()=>new Promise(r=>{let n=0,t0=performance.now();function f(){n++;if(performance.now()-t0<3000)requestAnimationFrame(f);else r(Math.round(n/3*10)/10)}requestAnimationFrame(f)})"

def verdict(j):
    if "erreur" in j: return "erreur"
    if not j["ouvert"]: return "fermé"
    d = [k for k in ("barreDansFenetre", "boomDansFenetre", "ecranDansFenetre") if not j[k]] + (["boomSurEcran"] if j["boomSurEcran"] else [])
    return "ok" if not d else "DÉFAUT " + ",".join(d)

async def fenetre(b, url, out, w, h, mob, court):
    ctx = await b.new_context(viewport={"width": w, "height": h}, is_mobile=mob, has_touch=mob)
    await ctx.add_init_script("try{localStorage.setItem('ik.koins','40')}catch(e){}")
    pg = await ctx.new_page(); err = []
    pg.on("pageerror", lambda e: err.append(str(e)[:160]))
    await pg.goto(url, wait_until="load"); await pg.wait_for_timeout(6000)
    R = {"fenetre": f"{w}x{h}", "arrivee": await pg.evaluate(MESURE)}
    await pg.screenshot(path=os.path.join(out, f"{w}x{h}-arrivee.png"))
    R["fpsAccueil"] = await pg.evaluate(FPS)
    ys, entier = [], 0
    for i in range(30 if court else 80):
        await pg.wait_for_timeout(500)
        y, e = await pg.evaluate("(()=>{const r=document.querySelector('.b-screen').getBoundingClientRect();return [Math.round(scrollY),r.top>=0&&r.bottom<=innerHeight]})()")
        ys.append(y); entier += e
        if i == 14: await pg.screenshot(path=os.path.join(out, f"{w}x{h}-visite.png"))
    R["visite"] = {"mouvements": sum(abs(a - c) > 4 for a, c in zip(ys, ys[1:])), "trajetPx": sum(abs(a - c) for a, c in zip(ys, ys[1:])), "ecranEntier": f"{entier}/{len(ys)}"}
    # geste du visiteur (décision de Mauk Tenieb) : la visite se fige, puis reprend où elle en était ; ici, figée 3 s au moins (pas de mesure : 0,5 s), puis reprise
    await pg.mouse.move(w // 2, h - 30); await pg.mouse.wheel(0, 200); await pg.wait_for_timeout(300)
    y0 = await pg.evaluate("Math.round(scrollY)"); fige = 0; reprise = False
    for i in range(20):
        await pg.wait_for_timeout(500)
        st = await pg.evaluate("[Math.round(scrollY),!!window.__borneTour&&String(window.__borneTour)!=='0']")
        if not reprise and abs(st[0] - y0) <= 4 and not st[1]: fige = round(0.3 + (i + 1) * 0.5, 1)
        if st[1]: reprise = True
    R["geste"] = {"figeeS": fige, "reprise": reprise, "conforme": fige >= 3.0 and reprise}
    # psychopompe et bulle hors de la rangée de commandes (lieu de clarté absolue)
    sur = 0
    for i in range(20):
        await pg.wait_for_timeout(500)
        sur += await pg.evaluate(GUIDE)
    R["guideSurCommandes"] = f"{sur}/20"
    J = []
    for k in JEUX:
        try:
            await pg.evaluate("window.__ik.goHome&&window.__ik.goHome()"); await pg.wait_for_timeout(3000)
            await pg.evaluate(f"window.__ik.go('{k}')"); await pg.wait_for_timeout(5500)
            a = await pg.evaluate(JEU); a["programme"] = k; J.append(a)
            await pg.screenshot(path=os.path.join(out, f"{w}x{h}-jeu-{k}.png"))
        except Exception as e:
            J.append({"programme": k, "erreur": str(e)[:80]})
    R["jeu"] = J
    R["erreurs"] = err
    await ctx.close(); return R

async def main():
    url, out = sys.argv[1], sys.argv[2]; court = "--court" in sys.argv
    os.makedirs(out, exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch()
        res = [await fenetre(b, url, out, w, h, m, court) for w, h, m in FEN]  # une fenêtre à la fois : images par seconde comparables
        await b.close()
    json.dump(res, open(os.path.join(out, "controle.json"), "w"), ensure_ascii=False, indent=1)
    for r in res:
        a = r["arrivee"]
        print(f'{r["fenetre"]:>9}  écran entier à l\'arrivée {"oui" if a["ecranEntier"] else "NON"}  visite {r["visite"]["ecranEntier"]} ({r["visite"]["trajetPx"]} px)  '
              f'texte<12px {a["textePetit"]}  cibles<44px {a["ciblesPetites"]}  débord {"OUI" if a["debordeX"] else "non"}  {r["fpsAccueil"]} img/s  erreurs {len(r["erreurs"])}')
        print(f'{"":>9}  geste : {"figée puis reprise" if r["geste"]["conforme"] else "NON CONFORME"} ({r["geste"]["figeeS"]} s)  ;  guide sur les commandes {r["guideSurCommandes"]}  ;  jeu : ' + "  ".join(f'{j["programme"]} {verdict(j)}' for j in r["jeu"]))

asyncio.run(main())
