#!/usr/bin/env python3
# Builds the Notes of Insert Koin: notes/src/*.md -> notes/<slug>.html + notes/index.html.
# Each note: front matter (slug, title, title_fr, date, rep, description, links), English body, "## En français" body.
import glob, html, json, os, re, markdown

HERE = os.path.dirname(os.path.abspath(__file__))
BASE = 'https://mauktenieb.github.io/insertkoin/notes/'
AUTHOR = {'@type': 'Person', '@id': 'https://mauktenieb.github.io/#person', 'name': 'Mauk Tenieb', 'url': 'https://github.com/MaukTenieb',
          'sameAs': ['https://orcid.org/0009-0007-9096-8267', 'https://www.wikidata.org/wiki/Q141544315', 'https://mauktenieb.github.io/']}
CSS = """:root{--bg:#07060a;--fg:#e8e0c8;--dim:#9a917e;--ac:#c9a84c;--ac2:#ffe08a;--ln:rgba(201,168,76,.3)}
*{box-sizing:border-box}html,body{margin:0;background:var(--bg);color:var(--fg)}
body{font:17px/1.65 Georgia,'Times New Roman',serif;padding:0 16px}
main{max-width:46rem;margin:0 auto;padding:28px 0 56px}
.top{font:12px/1.4 'DM Mono',ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);display:flex;gap:12px;flex-wrap:wrap;align-items:center;border-bottom:1px solid var(--ln);padding:14px 0}
.top a{color:var(--ac2);text-decoration:none}
h1{font:400 clamp(30px,6vw,46px)/1.05 'Bebas Neue',Impact,sans-serif;letter-spacing:.03em;color:var(--ac2);margin:26px 0 8px}
h2{font:400 26px/1.1 'Bebas Neue',Impact,sans-serif;letter-spacing:.04em;color:var(--ac);margin:40px 0 8px;border-top:1px solid var(--ln);padding-top:22px}
.meta{font:13px/1.5 'DM Mono',ui-monospace,monospace;color:var(--dim);margin-bottom:22px}
.links{font:14px/1.6 'DM Mono',ui-monospace,monospace;margin:28px 0 0;padding-top:14px;border-top:1px solid var(--ln)}
a{color:var(--ac2)}p{margin:0 0 1em}
footer{font:12px/1.5 'DM Mono',ui-monospace,monospace;color:var(--dim);max-width:46rem;margin:0 auto;padding:18px 0 40px;border-top:1px solid var(--ln)}
ul.notes{list-style:none;padding:0}ul.notes li{margin:0 0 18px}ul.notes .d{font:12px 'DM Mono',monospace;color:var(--dim)}"""
FONTS = '<link rel="preconnect" href="https://fonts.googleapis.com"><link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono&display=swap" rel="stylesheet">'
FOOT = '<footer>Copyright © Mauk Tenieb &amp; Korhogo. All rights reserved. No use for training artificial intelligence. · <a href="../">Insert Koin</a> · <a href="https://mauktenieb.github.io/">mauktenieb.github.io</a></footer>'

def parse(path):
    raw = open(path, encoding='utf-8').read()
    m = re.match(r'---\n(.*?)\n---\n(.*)', raw, re.S)
    meta = dict(l.split(': ', 1) for l in m.group(1).split('\n') if ': ' in l)
    en, _, fr = m.group(2).partition('## En français')
    return meta, en.strip(), fr.strip()

def page(meta, en, fr):
    md = lambda s: markdown.markdown(s, extensions=['extra'])
    url = BASE + meta['slug'] + '.html'
    ld = {'@context': 'https://schema.org', '@type': 'TechArticle', 'headline': meta['title'], 'alternativeHeadline': meta['title_fr'],
          'description': meta['description'], 'datePublished': meta['date'], 'dateModified': meta['date'], 'inLanguage': ['en', 'fr'],
          'url': url, 'author': AUTHOR, 'publisher': AUTHOR,
          'isPartOf': {'@type': 'WebSite', 'name': 'Insert Koin', 'url': 'https://mauktenieb.github.io/insertkoin/'}}
    t = html.escape(meta['title'])
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{t} · Insert Koin notes</title>
<meta name="description" content="{html.escape(meta['description'])}">
<meta name="author" content="Mauk Tenieb">
<meta name="robots" content="index, follow, noimageindex, noai, noimageai">
<link rel="canonical" href="{url}">
<meta property="og:type" content="article"><meta property="og:title" content="{t}"><meta property="og:description" content="{html.escape(meta['description'])}"><meta property="og:url" content="{url}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
{FONTS}
<style>{CSS}</style>
</head>
<body>
<main>
<div class="top"><a href="../">Insert Koin</a><span>·</span><a href="./">Notes</a></div>
<article>
<h1>{t}</h1>
<div class="meta">{html.escape(meta['rep'])} · {meta['date']} · Mauk Tenieb</div>
{md(en)}
<section lang="fr">
<h2>{html.escape(meta['title_fr'])}</h2>
{md(fr)}
</section>
<div class="links">{md(meta.get('links', ''))}</div>
</article>
</main>
{FOOT}
</body>
</html>
"""

notes = []
for p in sorted(glob.glob(os.path.join(HERE, 'src', '*.md'))):
    meta, en, fr = parse(p)
    open(os.path.join(HERE, meta['slug'] + '.html'), 'w', encoding='utf-8').write(page(meta, en, fr))
    notes.append(meta)
notes.sort(key=lambda m: m['date'], reverse=True)
items = '\n'.join(f'<li><a href="{m["slug"]}.html">{html.escape(m["title"])}</a><br><span class="d">{html.escape(m["rep"])} · {m["date"]}</span><br>{html.escape(m["description"])}</li>' for m in notes)
ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': 'Insert Koin notes', 'url': BASE, 'author': AUTHOR,
      'hasPart': [{'@type': 'TechArticle', 'headline': m['title'], 'url': BASE + m['slug'] + '.html'} for m in notes]}
open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Insert Koin notes</title>
<meta name="description" content="How Insert Koin, the browser arcade of Mauk Tenieb's Korhogo Fauna, gets made: technical notes, in English and French.">
<meta name="robots" content="index, follow, noimageindex, noai, noimageai">
<link rel="canonical" href="{BASE}">
<script type="application/ld+json">{json.dumps(ld, ensure_ascii=False)}</script>
{FONTS}
<style>{CSS}</style>
</head>
<body>
<main>
<div class="top"><a href="../">Insert Koin</a><span>·</span><span>Notes</span></div>
<h1>Notes</h1>
<ul class="notes">
{items}
</ul>
</main>
{FOOT}
</body>
</html>
""")
print('built', [m['slug'] for m in notes])
