#!/usr/bin/env python3
"""Tire de skoporhogo.html le code des 18 Masks (corps 3D de SkopoRhogo) et l'écrit dans skopo-figs.js.

Musik et tout autre lieu du motel montrent ainsi les mêmes corps que SkopoRhogo, sans copie à la main :
relancer ce script après toute retouche des personnages dans skoporhogo.html.
Usage : python3 tools/skopo-figs.py
"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'skoporhogo.html').read_text(encoding='utf-8')

def span(start_mark, end_mark):
    a = src.find(start_mark)
    b = src.find(end_mark, a)
    if a < 0 or b < 0:
        sys.exit('repère introuvable : %r / %r' % (start_mark, end_mark))
    return src[a:b]

rng = span('let seed=1337;', '// ---------- portraits')
mat = span('const toC=', '// =========================================================\n//  PLANTS')
chars = span('function eyes(', '// ---------- sprites: Zzz')
for need in ('const TX={', 'function mk(', 'function human(', 'const CHAR='):
    if need not in mat + chars:
        sys.exit('bloc manquant : ' + need)

out = """/* skopo-figs.js — généré par tools/skopo-figs.py depuis skoporhogo.html ; ne pas retoucher à la main.
   Les 18 Masks de SkopoRhogo (corps 3D, three.js r128) pour les autres lieux du motel : Musik d'abord.
   15 nov. 2026 (Mauk Tenieb : « il faut ici non pas les noms, qui sont verbeux, mais les figurines 3D de Skoporhogo ») */
(function(){'use strict';
if(window.SkopoFigs||!window.THREE)return;
const THREE=window.THREE, scene=null, CS=1.25, PI=Math.PI;
""" + rng + "\n" + mat + "\n" + chars + """
const key=k=>String(k||'').toLowerCase().replace(/[^a-z0-9]/g,'');
const BY={};CHAR.forEach(d=>{BY[key(d.k)]=d});
window.SkopoFigs={keys:CHAR.map(d=>key(d.k)),build(mask){const d=BY[key(mask)];if(!d)return null;
  const g=new THREE.Group(),figs=d.build();figs.forEach(f=>g.add(f.g));return {g,figs,d}}};
})();
"""
(ROOT / 'skopo-figs.js').write_text(out, encoding='utf-8')
print('skopo-figs.js', len(out), 'octets')
