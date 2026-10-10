#!/usr/bin/env python3
"""prose-lint: flags the stock patterns of machine-written prose, in English and French, and checks the house rules:
facts that answer who, what, when, where, why; present indicative; affirmations only; active voice only.

Built from Wikipedia's "Signs of AI writing" (WP:AISIGNS, read October 2026) and its words-to-watch lists,
adapted to French. A hit is not a verdict: it is a place to reread and, usually, to cut.
Usage: python3 prose-lint.py FILE [FILE...]   (Markdown, HTML or text; exit code 1 when anything is found)
Copyright © Mauk Tenieb & Korhogo. This file is under the MIT licence..
"""
import re, sys, html

W = r'\b'
RULES = [
 # --- puffery: significance, legacy, broader trends (WP:AISIGNS "Undue emphasis on significance") ---
 ('puffery', r'(stands?|serves?) as|is a (testament|reminder)|(crucial|pivotal|vital|significant|key) (role|moment)|underscores?|highlights? (its|the) (importance|significance)|reflects? (a )?broader|symboliz|setting the stage|marks? a (shift|turning point)|evolving landscape|focal point|indelible|deeply rooted|rich (history|heritage|tapestry)|tapestry|testament'),
 ('puffery-fr', r"t[ée]moigne(nt)? de|incarne(nt)?|un (r[ôo]le|moment) (cl[ée]|crucial|essentiel|d[ée]cisif|charni[èe]re)|marque(nt)? un tournant|s'inscri(t|vent) dans (une|un|le|la) (dynamique|mouvement|tendance)|au c(œ|oe)ur de|riche (patrimoine|histoire|h[ée]ritage)|v[ée]ritable (joyau|pilier|r[ée]volution)|ancr[ée]e? (profond[ée]ment)?|in[ée]dit et|pierre angulaire|[àa] la crois[ée]e des chemins"),
 # --- superficial analysis tacked on with a participle (", highlighting ...") ---
 ('ing-tail', r',\s+(highlighting|underscoring|emphasizing|ensuring|reflecting|symbolizing|contributing to|fostering|cultivating|showcasing|enhancing|encompassing|making it|offering)\b'),
 ('participe-fr', r',\s+(soulignant|t[ée]moignant|refl[ée]tant|illustrant|renfor[çc]ant|garantissant|contribuant|offrant|permettant ainsi|faisant de)\b'),
 # --- AI vocabulary (2023-2026 eras) ---
 ('ai-word', W+r'(additionally|align(s|ed)? with|boasts?|bolster(ed)?|crucial|deep dive|delve|enduring|enhance[ds]?|foster(ing|s)?|garner|interplay|intricat\w*|landscape|meticulous\w*|pivotal|robust|showcas\w*|underscor\w*|valuable|vibrant|leverage|multifaceted|seamless(ly)?|quietly|nuanced|navigate|realm|holistic|game.?changer|unlock|empower\w*)'+W),
 ('mot-ia-fr', W+r"(crucial|essentiel(le)?s?|incontournable|dynamique|riche|levier|enjeux?|plonger|explorer|naviguer|robuste|fluide|optimis\w+|harmonieu\w+|holistique|synergie|fa[çc]onn\w+|captivant\w*|fascinant\w*|passionnant\w*|immersi\w+|r[ée]volutionn\w+|novateur|innovant\w*|unique en son genre)"+W),
 # --- negative parallelism and its reverse ---
 ('not-x-but-y', r"\bnot (just|only|merely|simply)\b.{0,60}\bbut\b|\b(it'?s|this is|that'?s|is) not\b.{0,50}[,;—–-]\s*(it'?s|this is|but)\b|\bno [^.]{1,30}, no [^.]{1,30}, just\b|\brather than\b"),
 ('pas-x-mais-y', r"\b(non (pas )?seulement|pas seulement|pas uniquement|pas simplement)\b.{0,60}\bmais\b|\bce n'est pas\b.{0,60}[,;—–]\s*c'est\b|\bpas (un|une|des|le|la|les)\b[^.]{1,40}[,:]\s*(mais )?(un|une|des|le|la|les)\b[^.]{1,40}\.|\bplut[ôo]t que\b|\bmoins\b[^.]{1,40}\bque\b[^.]{1,40}\bplus\b|\bplus qu'?un\w*\b[^.]{1,30}[,:]\s*un"),
 # --- rule of three as a tic ("X, Y and Z" of adjectives or short phrases) ---
 ('triad', r'\b(\w+), (\w+),? (and|et) (\w+)\b'),
 # --- vague attributions ---
 ('weasel', r'\b(experts|observers|critics|scholars|researchers|industry reports|many|some) (say|argue|note|believe|have (noted|cited|argued))\b|\bwidely (regarded|considered|recognized)\b'),
 ('attribution-fr', r"\b(les experts|les observateurs|certains|beaucoup|nombreux sont ceux qui) (estiment|soulignent|affirment|consid[èe]rent)\b|\bil est (largement )?(reconnu|admis) que\b"),
 # --- editorialising, signposting, summaries ---
 ('signpost', r"\b(it'?s (important|worth|crucial|critical) to (note|remember|consider)|worth noting|in summary|in conclusion|overall,|ultimately,|in essence|at its core|here'?s the thing|the bottom line|let'?s (dive|explore|unpack))\b"),
 ('balise-fr', r"\b(il (est|convient) (important|essentiel|crucial) de (noter|souligner|rappeler)|il convient de noter|notons que|force est de constater|en somme|en conclusion|en d[ée]finitive|au final|en fin de compte|pour r[ée]sumer|au fond,|concr[èe]tement,|en clair,|bref,)\b"),
 # --- challenges / future prospects formula ---
 ('challenges', r'\bdespite (its|these|the)\b.{0,60}\bchallenges\b|\bfuture (outlook|prospects)\b|\bcontinues? to (thrive|evolve)\b'),
 ('defis-fr', r"\bmalgr[ée] (ses|ces|les)\b.{0,60}\bd[ée]fis\b|\bperspectives d'avenir\b|\bcontinue d'[ée]voluer\b"),
 # --- promotional tone ---
 ('promo', r'\b(nestled|in the heart of|breathtaking|stunning|renowned|groundbreaking|diverse array|commitment to|world-class|cutting-edge|state-of-the-art|unparalleled|must-see)\b'),
 ('promo-fr', r"\b(niché|[ée]poustouflant\w*|incontournable|de renom|de pointe|sans pr[ée]c[ée]dent|exceptionnel\w*|remarquable\w*|[àa] couper le souffle)\b"),
 # --- chat residue ---
 ('chat', r"\b(i hope this helps|certainly!|of course!|great question|you'?re absolutely right|let me know|would you like|feel free to|happy to help)\b"),
 ('chat-fr', r"\b(j'esp[èe]re que cela|n'h[ée]site[sz]? pas|bonne question|tu as (tout [àa] fait|parfaitement) raison|avec plaisir|je reste [àa] (ta|votre) disposition)\b"),
 # --- hedging disclaimers ---
 ('hedge', r'\b(while specific details are (limited|scarce)|not widely (documented|available)|based on available information)\b'),
 # --- typography of machine text ---
 ('em-dash', r'\s—\s'),
 ('emoji', '[\U0001F300-\U0001FAFF☀-➿]'),
 ('bold-label-list', r'^\s*[-*]\s+\*\*[^*]{1,40}\*\*\s*[:—–-]'),
]

# --- house rules of Mauk Tenieb (10 Oct 2026): facts, the 5 W, present indicative, affirmation only, active voice only ---
RULES += [
 ('negation', r"\b(not|no|never|none|nothing|nobody|nowhere|neither|nor|cannot|without)\b|n't\b"),
 ('negation-fr', r"\b(ne|n')\s*\w+[^.]{0,40}\b(pas|plus|jamais|rien|aucun\w*|personne|gu[èe]re|point)\b|\b(jamais|aucun\w*|nul(le)?|ni|sans)\b"),
 ('passive', r"\b(is|are|was|were|be|been|being|gets|got)\s+(not\s+)?(\w+ly\s+)?(\w{3,}ed|built|made|done|given|taken|shown|seen|written|known|found|held|kept|left|sent|set|put|read|run|cut|drawn|chosen|hidden|broken|spoken)\b"),
 ('passif-fr', r"\b(est|sont|[ée]tait|[ée]taient|a [ée]t[ée]|ont [ée]t[ée]|sera|seront|soit|soient|[êe]tre)\s+(\w+ment\s+)?\w{2,}(é|ée|és|ées|is|ise|ises|it|ite|its|ites|u|ue|us|ues|ert|erte|erts|ertes)\b"),
 ('tense', r"\b(was|were|had|did|will|would|shall|used to)\b"),
 ('temps-fr', r"\b(a|ai|as|avons|avez|ont|avait|avaient|aura|auront)\s+(\w+ment\s+)?\w+(é|ée|és|ées|is|it|u|us|ert)\b|\b([ée]tait|[ée]taient|fut|furent|sera|seront)\b|\b\w{3,}(erai|eras|erons|erez|eront|irai|iront)\b"),
]
# words of the copula avoided ("serves as" for "is"), only in English
RULES.append(('copula-dodge', r'\b(serves|functions|operates|stands) as (a|an|the)\b|\bboasts (a|an)\b'))

def text_of(path):
    s = open(path, encoding='utf-8', errors='replace').read()
    if path.endswith(('.html', '.htm')):
        s = re.sub(r'<(script|style|code|pre)[^>]*>.*?</\1>', ' ', s, flags=re.S | re.I)
        s = html.unescape(re.sub(r'<[^>]+>', ' ', s))
    else:
        s = re.sub(r'```.*?```', ' ', s, flags=re.S)
        s = re.sub(r'`[^`]*`', ' ', s)
    return s

FR_WORDS = set('le la les des une un est et dans du au aux sur pour avec qui que se il elle ce cette ces son sa ses'.split())
EN_WORDS = set('the and of is in to a an on for with that it its this these from by at as'.split())
def lang(line):
    w = re.findall(r"[a-zà-ÿ']+", line.lower())
    return 'fr' if sum(x in FR_WORDS for x in w) > sum(x in EN_WORDS for x in w) else 'en'

def applies(name, lg):
    fr = name.endswith('-fr') or name in ('pas-x-mais-y', 'mot-ia-fr', 'passif-fr', 'temps-fr', 'negation-fr')
    generic = name in ('triad', 'em-dash', 'emoji', 'bold-label-list')
    return generic or (fr == (lg == 'fr'))

def lint(path):
    s = text_of(path); n = 0
    lines = s.split('\n')
    for i, line in enumerate(lines, 1):
        lg = lang(line)
        for name, rx in RULES:
            if not applies(name, lg): continue
            for m in re.finditer(rx, line, re.I | (re.M if name == 'bold-label-list' else 0)):
                if name == 'triad' and not looks_like_triad(m): continue
                n += 1
                print(f'{path}:{i}: [{name}] …{line[max(0, m.start()-30):m.end()+30].strip()}…')
    # sentence rhythm: GPT-6-era prose holds sentences between 8 and 20 words; flag long runs of it
    sents = [x for x in re.split(r'(?<=[.!?])\s+', re.sub(r'\s+', ' ', s)) if len(x.split()) > 2]
    lens = [len(x.split()) for x in sents]
    run = 0
    for L in lens:
        run = run + 1 if 8 <= L <= 20 else 0
        if run == 8:
            n += 1; print(f'{path}: [metronome] eight sentences in a row of 8-20 words: vary the length')
    return n

def looks_like_triad(m):
    # only short words in a bare list of three: "fast, clean and cheap"; skip numbers and code-ish tokens
    a, b, _, c = m.groups()
    return all(w.isalpha() and len(w) > 2 for w in (a, b, c))

if __name__ == '__main__':
    total = sum(lint(p) for p in sys.argv[1:])
    print(f'{total} place(s) to reread')
    sys.exit(1 if total else 0)
