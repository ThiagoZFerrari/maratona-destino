#!/usr/bin/env python3
"""
Gera data/filmes.json a partir de data/lista.json usando a API do TMDB.
Busca cartaz, imagem de fundo, sinopse, duração e onde assistir no Brasil.

Uso (na pasta do projeto):
    python scripts/gerar_dados.py SUA_CHAVE_DO_TMDB

Aceita tanto a "Chave da API" (v3) quanto o "Token de leitura" (v4).
Rode de novo sempre que quiser atualizar o "onde assistir".
"""
import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request

BASE = "https://api.themoviedb.org/3"
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHAVE = os.environ.get("TMDB_KEY") or (sys.argv[1] if len(sys.argv) > 1 else "")

if not CHAVE:
    sys.exit("Faltou a chave. Use: python scripts/gerar_dados.py SUA_CHAVE_DO_TMDB")


def get(caminho, **params):
    params.setdefault("language", "pt-BR")
    headers = {"accept": "application/json"}
    if CHAVE.startswith("eyJ"):
        headers["Authorization"] = f"Bearer {CHAVE}"
    else:
        params["api_key"] = CHAVE
    url = f"{BASE}{caminho}?{urllib.parse.urlencode(params)}"
    for _ in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=headers), timeout=20) as r:
                return json.load(r)
        except urllib.error.HTTPError as e:
            if e.code == 401:
                sys.exit("Chave do TMDB inválida. Confira em themoviedb.org > Configurações > API.")
            if e.code == 404:
                return None
            if e.code == 429:
                time.sleep(2)
                continue
            raise
        except urllib.error.URLError:
            time.sleep(2)
    return None


cache_busca = {}


def buscar_id(item):
    if item.get("tmdb"):
        return item["tmdb"]
    tipo = "tv" if item["tipo"] == "serie" else "movie"
    ano = item.get("busca_ano", item["ano"])
    chave = (tipo, item["en"], ano)
    if chave in cache_busca:
        return cache_busca[chave]
    campo_ano = "first_air_date_year" if tipo == "tv" else "year"
    res = get(f"/search/{tipo}", query=item["en"], **{campo_ano: ano}, language="en-US")
    resultados = (res or {}).get("results") or []
    if not resultados:
        res = get(f"/search/{tipo}", query=item["en"], language="en-US")
        resultados = (res or {}).get("results") or []
    tmdb_id = resultados[0]["id"] if resultados else None
    cache_busca[chave] = tmdb_id
    return tmdb_id


def onde_assistir(bloco):
    br = ((bloco or {}).get("results") or {}).get("BR") or {}
    streaming = [{"nome": p["provider_name"], "logo": p.get("logo_path")} for p in br.get("flatrate", [])]
    return {"streaming": streaming, "aluguel": bool(br.get("rent") or br.get("buy")), "link": br.get("link")}


def sinopse_em_ingles(caminho):
    d = get(caminho, language="en-US") or {}
    return d.get("overview") or ""


def enriquecer(item):
    tmdb_id = buscar_id(item)
    if not tmdb_id:
        return None
    novo = dict(item)
    novo["tmdb"] = tmdb_id
    if item["tipo"] == "serie":
        serie = get(f"/tv/{tmdb_id}", append_to_response="watch/providers") or {}
        temp = get(f"/tv/{tmdb_id}/season/{item.get('temporada', 1)}") or {}
        novo["poster"] = temp.get("poster_path") or serie.get("poster_path")
        novo["backdrop"] = serie.get("backdrop_path")
        novo["sinopse"] = temp.get("overview") or serie.get("overview") or sinopse_em_ingles(f"/tv/{tmdb_id}")
        novo["episodios"] = len(temp.get("episodes") or []) or None
        novo["onde"] = onde_assistir(serie.get("watch/providers"))
    else:
        filme = get(f"/movie/{tmdb_id}", append_to_response="watch/providers") or {}
        novo["poster"] = filme.get("poster_path")
        novo["backdrop"] = filme.get("backdrop_path")
        novo["sinopse"] = filme.get("overview") or sinopse_em_ingles(f"/movie/{tmdb_id}")
        novo["duracao"] = filme.get("runtime") or None
        novo["onde"] = onde_assistir(filme.get("watch/providers"))
    return {k: v for k, v in novo.items() if v not in (None, "")}


def main():
    with open(os.path.join(RAIZ, "data", "lista.json"), encoding="utf-8") as f:
        lista = json.load(f)
    saida, faltando = [], []
    for n, item in enumerate(lista, 1):
        print(f"[{n:02d}/{len(lista)}] {item['titulo']}", end=" ... ", flush=True)
        novo = enriquecer(item)
        if novo:
            nomes = ", ".join(p["nome"] for p in novo.get("onde", {}).get("streaming", [])) or "sem streaming"
            print(f"ok ({nomes})")
            saida.append(novo)
        else:
            print("NÃO ENCONTRADO")
            faltando.append(item["titulo"])
            saida.append(item)
        time.sleep(0.1)
    with open(os.path.join(RAIZ, "data", "filmes.json"), "w", encoding="utf-8") as f:
        json.dump(saida, f, ensure_ascii=False, indent=1)
    print(f"\nPronto! data/filmes.json gerado com {len(saida)} itens.")
    if faltando:
        print("Não achei estes (coloque o número do TMDB no campo \"tmdb\" em lista.json e rode de novo):")
        for t in faltando:
            print("  -", t)


if __name__ == "__main__":
    main()
