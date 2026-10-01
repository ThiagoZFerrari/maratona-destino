#!/usr/bin/env python3
"""
Procura no Spotify o álbum da trilha sonora de cada título de data/lista.json
e salva o resultado em data/spotify.json.

Uso (na pasta do projeto):
    python scripts/gerar_spotify.py CLIENT_ID CLIENT_SECRET

Pra corrigir um álbum errado: abra data/spotify.json e troque o link do título
pelo link do álbum certo (Spotify > ... > Compartilhar > Copiar link do álbum).
Itens marcados com "manual": true nunca são sobrescritos pelo script.
"""
import base64
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ARQ_LISTA = os.path.join(RAIZ, "data", "lista.json")
ARQ_SAIDA = os.path.join(RAIZ, "data", "spotify.json")

if len(sys.argv) < 3:
    sys.exit("Use: python scripts/gerar_spotify.py CLIENT_ID CLIENT_SECRET")
CLIENT_ID, CLIENT_SECRET = sys.argv[1], sys.argv[2]


def pegar_token():
    cred = base64.b64encode(f"{CLIENT_ID}:{CLIENT_SECRET}".encode()).decode()
    req = urllib.request.Request(
        "https://accounts.spotify.com/api/token",
        data=b"grant_type=client_credentials",
        headers={"Authorization": f"Basic {cred}", "Content-Type": "application/x-www-form-urlencoded"},
    )
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return json.load(r)["access_token"]
    except urllib.error.HTTPError:
        sys.exit("Client ID ou Client Secret inválidos. Confira no painel do Spotify.")


TOKEN = pegar_token()


def buscar(q):
    url = "https://api.spotify.com/v1/search?" + urllib.parse.urlencode(
        {"q": q, "type": "album", "limit": 10, "market": "BR"})
    for _ in range(4):
        try:
            req = urllib.request.Request(url, headers={"Authorization": f"Bearer {TOKEN}"})
            with urllib.request.urlopen(req, timeout=20) as r:
                return json.load(r).get("albums", {}).get("items", [])
        except urllib.error.HTTPError as e:
            if e.code == 429:
                time.sleep(int(e.headers.get("Retry-After", "2")) + 1)
                continue
            raise
        except urllib.error.URLError:
            time.sleep(2)
    return []


def norm(s):
    s = unicodedata.normalize("NFKD", s).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9 ]+", " ", s).split()


RUIM = {"inspired", "karaoke", "lullaby", "lullabies", "piano", "tribute", "cover", "covers",
        "remix", "remixes", "kids", "orchestra", "guitar", "8", "bit", "chiptune", "relax", "sleep"}
BOM = {"soundtrack", "score", "motion", "picture", "original", "music"}


def pontuar(album, item):
    nome = norm(album["name"])
    titulo = [p for p in norm(item["en"]) if p not in {"the", "of", "and", "a"}]
    pts = 0
    if titulo and all(p in nome for p in titulo):
        pts += 6
    else:
        pts += 2 * sum(p in nome for p in titulo) / max(1, len(titulo))
    pts += 2 * len(BOM & set(nome))
    pts -= 6 * len(RUIM & set(nome))
    ano = item.get("ano")
    data = album.get("release_date", "")[:4]
    if data.isdigit() and ano and abs(int(data) - int(ano)) <= 1:
        pts += 3
    temp = item.get("temporada")
    if temp:
        if "season" in nome and str(temp) in nome:
            pts += 4
        elif "season" in nome:
            pts -= 3
    return pts


def melhor_album(item):
    consultas = [f"{item['en']} soundtrack", f"{item['en']} original score", item["en"]]
    if item.get("temporada"):
        consultas.insert(0, f"{item['en']} season {item['temporada']} soundtrack")
    vistos, candidatos = set(), []
    for q in consultas:
        for a in buscar(q):
            if a["id"] in vistos:
                continue
            vistos.add(a["id"])
            candidatos.append((pontuar(a, item), a))
        time.sleep(0.15)
    if not candidatos:
        return None
    pts, a = max(candidatos, key=lambda x: x[0])
    if pts < 6:
        return None
    return {"spotify": a["external_urls"]["spotify"], "album": a["name"]}


def main():
    with open(ARQ_LISTA, encoding="utf-8") as f:
        lista = json.load(f)
    atual = {}
    if os.path.exists(ARQ_SAIDA):
        with open(ARQ_SAIDA, encoding="utf-8") as f:
            atual = json.load(f)
    saida, faltando = {}, []
    for n, item in enumerate(lista, 1):
        anterior = atual.get(item["id"])
        if anterior and anterior.get("manual"):
            saida[item["id"]] = anterior
            print(f"[{n:02d}] {item['titulo']} ... mantido (manual)")
            continue
        achado = melhor_album(item)
        if achado:
            saida[item["id"]] = achado
            print(f"[{n:02d}] {item['titulo']} ... {achado['album']}")
        else:
            faltando.append(item["titulo"])
            print(f"[{n:02d}] {item['titulo']} ... NÃO ENCONTRADO")
    with open(ARQ_SAIDA, "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print(f"\nPronto! data/spotify.json com {len(saida)} trilhas.")
    if faltando:
        print("Sem trilha (dá pra colocar o link manualmente no spotify.json):")
        for t in faltando:
            print("  -", t)


if __name__ == "__main__":
    main()