#!/usr/bin/env python3
"""
Escreve a lista dos títulos em HTML puro dentro do index.html, entre as marcações
LISTA-ESTATICA:INICIO e LISTA-ESTATICA:FIM.

Pra que serve: o Google e as prévias de link (WhatsApp, Instagram) nem sempre
rodam JavaScript. Com a lista no HTML, eles enxergam os 77 títulos. Quem abre o
site normalmente não vê essa lista: o CSS esconde e o app.js troca pelos cards.

Uso (na pasta do projeto), sempre que mudar o data/lista.json:
    python scripts/gerar_lista_html.py
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

with open(ARQ_HTML, "w", encoding="utf-8") as f:
    f.write(pagina)
print(f"Lista com {numero} títulos escrita no index.html.")
