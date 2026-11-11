"""Vérification en ligne : les 16 chaînes de la TV, une capture par chaîne."""
import json
from playwright.sync_api import sync_playwright
R = {}
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={'width': 1280, 'height': 800}); err = []; pg.on('pageerror', lambda x: err.append(str(x)[:160]))
    pg.goto('https://mauktenieb.github.io/insertkoin/habillages/tv.html'); pg.wait_for_timeout(5000)
    for i in range(17):
        pg.wait_for_timeout(4500)
        R[f'ch{i:02d}'] = pg.evaluate("(document.querySelector('#lcd')||{}).textContent||''")
        pg.screenshot(path=f'tv-{i:02d}.png', clip={'x': 0, 'y': 0, 'width': 1280, 'height': 800}, scale='css')
        pg.click('#lcd')
    R['erreurs'] = err
json.dump(R, open('voir.json', 'w'), ensure_ascii=False, indent=1)
