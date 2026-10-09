"""fr.html = index.html with French head metadata and window.IK_LANG='fr'. Run after every edit of index.html."""
import os
def sub(s,a,b,n=1,label=''):
    c=s.count(a)
    if c!=n: raise SystemExit(f'[{label}] expected {n} match, got {c}: {a[:90]!r}')
    return s.replace(a,b)
D=os.path.dirname(os.path.abspath(__file__))+'/'
s=open(D+'index.html',encoding='utf8').read()
EN_DESC='Insert Koin, an arcade ritual in the browser, by Mauk Tenieb. Puck You! against the eighteen Masks of the Fauna, Fauna Chess, Erratik, Faunarratik, Katabatik, 3615.'
FR_DESC='Insert Koin, un rituel d&#x27;arcade dans le navigateur, de Mauk Tenieb. Puck You! contre les dix-huit Masks de la Fauna, Fauna Chess, Erratik, Faunarratik, Katabatik, 3615.'
s=sub(s,'<html lang="en">','<html lang="fr">',1,'lang')
s=sub(s,'<meta charset="utf-8">','<meta charset="utf-8">\n<script>window.IK_LANG="fr"</script>',1,'iklang')
s=sub(s,f'<meta name="description" content="{EN_DESC}">',f'<meta name="description" content="{FR_DESC}">',1,'desc')
s=sub(s,'<link rel="canonical" href="https://mauktenieb.github.io/insertkoin/">','<link rel="canonical" href="https://mauktenieb.github.io/insertkoin/fr.html">',1,'canon')
s=sub(s,'<meta property="og:locale" content="en_US"><meta property="og:locale:alternate" content="fr_FR">','<meta property="og:locale" content="fr_FR"><meta property="og:locale:alternate" content="en_US">',1,'oglocale')
s=sub(s,f'<meta property="og:description" content="{EN_DESC}"><meta property="og:url" content="https://mauktenieb.github.io/insertkoin/">',
      f'<meta property="og:description" content="{FR_DESC}"><meta property="og:url" content="https://mauktenieb.github.io/insertkoin/fr.html">',1,'ogdesc')
open(D+'fr.html','w',encoding='utf8').write(s); print('fr.html built',len(s))
