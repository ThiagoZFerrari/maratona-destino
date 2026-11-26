#!/usr/bin/env python3
"""
Escreve a lista em HTML puro no index.html, pro Google ler sem JavaScript.
Uso: python scripts/gerar_lista_html.py  (rodar ao mudar data/lista.json)
"""
import html
import json
import os
import re

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARQ_LISTA = os.path.join(RAIZ, "data", "lista.json")
ARQ_HTML = os.path.join(RAIZ, "index.html")

# Mesmos nomes do BLOCOS em js/app.js
BLOCOS = {
    1: "Os primórdios, 2000 a 2007",
    2: "Nasce o MCU, 2008 a 2012",
    3: "Expansão, 2013 a 2016",
    4: "Rumo ao Thanos, 2017 a 2019",
    5: "O multiverso se abre, 2020 a 2022",
    6: "Reta final, 2023 a 2026",
    7: "A preparação definitiva, o aquecimento final",
}

with open(ARQ_LISTA, encoding="utf-8") as f:
    itens = json.load(f)

linhas = ['<div class="lista-estatica">',
          "<h2>Ordem completa da maratona antes de Vingadores: Doutor Destino</h2>"]
numero = 0
for bloco, nome in BLOCOS.items():
    do_bloco = [i for i in itens if i.get("bloco") == bloco]
    if not do_bloco:
        continue
    linhas.append(f"<h3>Bloco {bloco}: {html.escape(nome)}</h3>")
    linhas.append(f'<ol start="{numero + 1}">')
    for it in do_bloco:
        numero += 1
        tipo = "série" if it.get("tipo") == "serie" else "filme"
        linhas.append(f"<li>{html.escape(it['titulo'])} ({it['ano']}, {tipo})</li>")
    linhas.append("</ol>")
linhas.append("</div>")

with open(ARQ_HTML, encoding="utf-8") as f:
    pagina = f.read()

padrao = re.compile(r"(<!-- LISTA-ESTATICA:INICIO[^>]*-->\n).*?(<!-- LISTA-ESTATICA:FIM -->)", re.S)
if not padrao.search(pagina):
    raise SystemExit("Não achei as marcações LISTA-ESTATICA no index.html.")
pagina = padrao.sub(lambda m: m.group(1) + "\n".join(linhas) + "\n" + m.group(2), pagina)

# Dados estruturados (Schema.org) no <head>: nome do site e a lista em ordem
URL = "https://maratonamultiverso.com.br/"
schema = [
    {"@context": "https://schema.org", "@type": "WebSite",
     "name": "Maratona Multiverso", "alternateName": "Rumo ao Doutor Destino", "url": URL,
     "inLanguage": "pt-BR"},
    {"@context": "https://schema.org", "@type": "ItemList",
     "name": "Ordem dos filmes e séries Marvel antes de Vingadores: Doutor Destino",
     "itemListOrder": "https://schema.org/ItemListOrderAscending",
     "numberOfItems": numero,
     "itemListElement": [
         {"@type": "ListItem", "position": n,
          "item": {"@type": "TVSeries" if it.get("tipo") == "serie" else "Movie",
                   "name": it["titulo"], "dateCreated": str(it["ano"])}}
         for n, it in enumerate(
             [i for b in BLOCOS for i in itens if i.get("bloco") == b], start=1)]},
]
bloco_schema = ('<script type="application/ld+json">\n'
                + json.dumps(schema, ensure_ascii=False, separators=(",", ":")).replace("</", "<\\/")
                + "\n</script>")
padrao_schema = re.compile(r"(<!-- SCHEMA:INICIO[^>]*-->\n).*?(<!-- SCHEMA:FIM -->)", re.S)
if padrao_schema.search(pagina):
    pagina = padrao_schema.sub(lambda m: m.group(1) + bloco_schema + "\n" + m.group(2), pagina)
else:
    print("Aviso: não achei as marcações SCHEMA no index.html, pulei os dados estruturados.")

with open(ARQ_HTML, "w", encoding="utf-8") as f:
    f.write(pagina)
print(f"Lista com {numero} títulos escrita no index.html.")
