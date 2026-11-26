#!/usr/bin/env python3
"""
Gera a página essenciais-doutor-destino/index.html com os títulos marcados
como "essencial" no data/lista.json e os textos do data/essenciais.json.
Uso: python scripts/gerar_essenciais.py  (rodar ao mudar a lista ou os textos)
"""
import html
import json
import os

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
URL_SITE = "https://maratonamultiverso.com.br/"
PASTA = "essenciais-doutor-destino"
URL_PAGINA = URL_SITE + PASTA + "/"

with open(os.path.join(RAIZ, "data", "lista.json"), encoding="utf-8") as f:
    itens = json.load(f)
with open(os.path.join(RAIZ, "data", "essenciais.json"), encoding="utf-8") as f:
    textos = json.load(f)

ess = [(n, it) for n, it in enumerate(itens, start=1) if it.get("essencial")]
faltando = [it["id"] for _, it in ess if it["id"] not in textos]
if faltando:
    raise SystemExit("Falta texto no essenciais.json pra: " + ", ".join(faltando))
total = len(ess)
e = html.escape

cards = []
for pos, (n, it) in enumerate(ess, start=1):
    tipo = "Série" if it.get("tipo") == "serie" else "Filme"
    cards.append(
        f'<li class="ess-item" data-id="{e(it["id"])}">\n'
        f'  <div class="ess-num">{pos}</div>\n'
        f'  <div class="ess-corpo">\n'
        f'    <h2>{e(it["titulo"])} <span class="ess-meta">{it["ano"]} · {tipo} · #{n:02d} na lista completa</span></h2>\n'
        f'    <p>{e(textos[it["id"]])}</p>\n'
        f'    <span class="ess-visto" hidden>✓ Você já viu</span>\n'
        f'  </div>\n'
        f'</li>'
    )

schema = [
    {"@context": "https://schema.org", "@type": "ItemList",
     "name": f"Os {total} essenciais pra ver antes de Vingadores: Doutor Destino",
     "itemListOrder": "https://schema.org/ItemListOrderAscending",
     "numberOfItems": total,
     "itemListElement": [
         {"@type": "ListItem", "position": pos,
          "item": {"@type": "TVSeries" if it.get("tipo") == "serie" else "Movie",
                   "name": it["titulo"], "dateCreated": str(it["ano"])}}
         for pos, (_, it) in enumerate(ess, start=1)]},
    {"@context": "https://schema.org", "@type": "BreadcrumbList",
     "itemListElement": [
         {"@type": "ListItem", "position": 1, "name": "Maratona Multiverso", "item": URL_SITE},
         {"@type": "ListItem", "position": 2, "name": "Essenciais", "item": URL_PAGINA}]},
]
json_ld = json.dumps(schema, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")

titulo = f"O que assistir antes de Vingadores: Doutor Destino ({total} essenciais)"
descricao = (f"Sem tempo pra maratona inteira? Os {total} filmes e séries essenciais pra ver antes de "
             "Vingadores: Doutor Destino, em ordem, com o motivo de cada um. Sem spoilers.")

pagina = f"""<!DOCTYPE html>
<!-- Gerado por scripts/gerar_essenciais.py, não edite à mão -->
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'sha256-l+ZBOgG9XQFpON9zBxxrb5eDIZBZk0mXDshOBV8iYR8='; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://image.tmdb.org; object-src 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>{e(titulo)}</title>
<meta name="description" content="{e(descricao)}">
<link rel="canonical" href="{URL_PAGINA}">
<meta property="og:type" content="article">
<meta property="og:url" content="{URL_PAGINA}">
<meta property="og:site_name" content="Maratona Multiverso">
<meta property="og:title" content="{e(titulo)}">
<meta property="og:description" content="{e(descricao)}">
<meta property="og:locale" content="pt_BR">
<meta property="og:image" content="{URL_SITE}img/og-image.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Os {total} essenciais antes de Vingadores: Doutor Destino">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#E23636">
<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/img/icon-192.png" type="image/png" sizes="192x192">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bangers&family=Archivo:wght@400;600;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/style.css">
<script type="application/ld+json">
{json_ld}
</script>
</head>
<body>

<div class="topbar">
  <div class="wrap">
    <a class="marca" href="/">Maratona Destino</a>
    <a class="btn pequeno" href="/">Lista completa (77)</a>
  </div>
</div>

<header class="hero">
  <div class="wrap">
    <div class="panel">
      <div class="balao">Sem tempo pra ver tudo?</div>
      <h1>Os {total} essenciais antes de Doutor Destino</h1>
      <p class="lede">A maratona completa tem 77 filmes e séries. Se o tempo estiver curto, estes são os {total} que mais importam pra chegar na estreia de <b>Vingadores: Doutor Destino</b>, em 17 de dezembro, entendendo quem é quem. Estão na ordem de lançamento, com o motivo de cada um e sem spoilers do filme novo.</p>
      <p class="ess-progresso" id="essProgresso" hidden></p>
      <div class="acoes">
        <a class="btn alt" href="/?filtro=essenciais">Marcar os essenciais no checklist</a>
        <a class="btn" href="/">Ver a lista completa</a>
      </div>
    </div>
  </div>
</header>

<main class="wrap">
<ol class="ess-lista">
{chr(10).join(cards)}
</ol>

<section class="faq">
  <h2>Por que só {total}?</h2>
  <p class="ess-nota">São os títulos que apresentam os personagens, os grupos e as regras do multiverso que movem a reta final da Saga do Multiverso. O resto da lista ajuda a aproveitar mais o filme, mas não é obrigatório. Se sobrar tempo depois desses, volte pra <a href="/">lista completa</a> e continue de onde parou: o progresso é o mesmo.</p>
</section>
</main>

<footer class="rodape">
  <div class="wrap">
    <p>Site de fã, sem fins lucrativos e sem vínculo com Marvel Studios, Disney, Sony ou Netflix.</p>
    <p class="criador">Criado por <b>Thiago Ferrari</b>, <a href="https://www.instagram.com/thiagoz_ferrari/" target="_blank" rel="noopener">@thiagoz_ferrari</a> no Instagram.</p>
  </div>
</footer>

<script>
// Mostra o que a pessoa já marcou no checklist (mesmo progresso salvo no navegador)
try {{
  var e = JSON.parse(localStorage.getItem("maratona-destino-v2")) || {{}}, v = e.vistos || {{}}, n = 0;
  document.querySelectorAll(".ess-item").forEach(function (li) {{
    if (Object.prototype.hasOwnProperty.call(v, li.dataset.id)) {{
      li.classList.add("visto"); li.querySelector(".ess-visto").hidden = false; n++;
    }}
  }});
  if (n) {{ var p = document.getElementById("essProgresso"); p.textContent = "Você já viu " + n + " de {total} essenciais."; p.hidden = false; }}
}} catch (_) {{}}
</script>
</body>
</html>
"""

os.makedirs(os.path.join(RAIZ, PASTA), exist_ok=True)
with open(os.path.join(RAIZ, PASTA, "index.html"), "w", encoding="utf-8") as f:
    f.write(pagina)
print(f"Página dos essenciais gerada com {total} títulos em {PASTA}/index.html.")
