# Protocole de capture d'Insert Koin (boucle PDCA, Check) : l'état réel du visiteur, chaque programme et sous-programme.
# usage : python3 tools/borne-captures.py <url> <dossier> [formats des programmes, défaut 1366x768,390x844,844x390]
# Accueil : 8 formats, visite des psychopompes en marche (état par défaut), vues à 4, 10 et 16 s, plus la page entière.
# Programmes : un contexte neuf par programme ; ouverture par sa touche (data-go ou data-kata), comme le visiteur ; vue à 8 s.
import asyncio, sys, os, json
from playwright.async_api import async_playwright
URL, O = sys.argv[1], sys.argv[2]
PF = sys.argv[3].split(',') if len(sys.argv) > 3 else ['1366x768', '390x844', '844x390']
HOME = [(1920,1080,False),(1440,900,False),(1366,768,False),(1180,820,True),(820,1180,True),(390,844,True),(360,740,True),(844,390,True)]
PROGS = [('go','puck'),('go','chess'),('kata','fi'),('go','faunarratics'),('kata','erratic'),('kata','c4'),('kata','hang'),('kata','mm'),
         ('go','fauneye'),('go','vhs'),('go','photo'),('kata','bb'),('kata','diktat'),('go','terminal'),('go','skopo'),('go','repo'),('go','tor')]
INIT = "try{localStorage.setItem('ik.koins','40')}catch(e){}"
async def ctx(b, W, H, M):
    c = await b.new_context(viewport={'width': W, 'height': H}, is_mobile=M, has_touch=M); await c.add_init_script(INIT); return c
async def main():
    os.makedirs(O, exist_ok=True); log = {}
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for W, H, M in HOME:
            c = await ctx(b, W, H, M); g = await c.new_page(); err = []
            g.on('pageerror', lambda x: err.append(str(x)[:100]))
            await g.goto(URL); t = 0
            for s in (4, 10, 16):
                await g.wait_for_timeout((s - t) * 1000); t = s
                await g.screenshot(path=f'{O}/accueil-{W}x{H}-{s:02d}s.png')
            await g.screenshot(path=f'{O}/accueil-{W}x{H}-page.png', full_page=True)
            log[f'accueil {W}x{H}'] = err; await c.close()
        for f in PF:
            W, H = map(int, f.split('x')); M = W < 1100
            for kind, k in PROGS:
                c = await ctx(b, W, H, M); g = await c.new_page(); err = []
                g.on('pageerror', lambda x: err.append(str(x)[:100]))
                await g.goto(URL); await g.wait_for_timeout(5000)
                ok = await g.evaluate(f"(()=>{{const e=document.querySelector('[data-{kind}=\"{k}\"]');if(!e)return false;e.click();return true}})()")
                await g.wait_for_timeout(8000)
                await g.screenshot(path=f'{O}/prog-{k}-{W}x{H}.png')
                log[f'{k} {W}x{H}'] = {'ouvert': ok, 'prog': await g.evaluate("document.documentElement.dataset.prog||''"), 'erreurs': err}
                await c.close()
        await b.close()
    json.dump(log, open(f'{O}/journal.json', 'w'), indent=1, ensure_ascii=False)
    print(json.dumps(log, ensure_ascii=False)[:3000])
asyncio.run(main())
