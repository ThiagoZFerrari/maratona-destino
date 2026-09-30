# Maratona Destino

Checklist da maratona até **Vingadores: Doutor Destino** (17/12), com cartazes, onde assistir, conquistas, progresso na nuvem, trilha por bloco, card pros stories e contador de acessos.

O site funciona desde o primeiro passo. Cada etapa abaixo só liga mais uma função, então dá pra lançar e ir incrementando.

## Pastas

```
index.html            página principal
css/style.css         visual
js/config.js          ÚNICO arquivo que você precisa editar
js/conquistas.js      lista de conquistas (dá pra criar mais)
js/app.js             lógica do site
data/lista.json       os 77 itens, na ordem
data/filmes.json      gerado pelo script do TMDB (cartazes, sinopses, onde assistir)
scripts/gerar_dados.py
supabase/schema.sql   banco de dados
musica/               coloque aqui os MP3 da trilha
```

## 1. Testar no seu computador

O navegador não carrega a lista se você abrir o `index.html` com dois cliques. Abra um terminal na pasta do projeto e rode:

```
python -m http.server 8000
```

Depois acesse `http://localhost:8000`.

## 2. Cartazes e onde assistir (TMDB)

1. Crie uma conta grátis em themoviedb.org.
2. Vá em **Configurações > API**, peça uma chave de uso pessoal e sem fins lucrativos.
3. Na pasta do projeto, rode:
   ```
   python scripts/gerar_dados.py SUA_CHAVE
   ```
4. Ele cria o `data/filmes.json`. Se algum item não for encontrado, o script avisa: pegue o número dele na URL do site do TMDB (ex.: `themoviedb.org/movie/299534` → `299534`), coloque `"tmdb": 299534` naquele item do `lista.json` e rode de novo.

Rode o script de novo de tempos em tempos pra atualizar o "onde assistir". O crédito ao TMDB e ao JustWatch no rodapé é obrigatório, não remova.

## 3. Colocar no ar (GitHub Pages)

1. Crie uma conta em github.com e um repositório **público** chamado `maratona-destino`.
2. Clique em **Add file > Upload files** e arraste todos os arquivos e pastas do projeto.
3. Vá em **Settings > Pages**, em "Branch" escolha `main` e `/ (root)`, e salve.
4. Em 1 ou 2 minutos o site estará em `https://SEUUSUARIO.github.io/maratona-destino/`.
5. Coloque esse endereço em `siteUrl` no `js/config.js`.

## 4. Salvar conquistas na nuvem (Supabase)

1. Crie uma conta em supabase.com e um projeto novo (plano gratuito).
2. Abra o **SQL Editor**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. Em **Project Settings > API**, copie a **Project URL** e a **anon public key** para `supabaseUrl` e `supabaseAnonKey` no `config.js`.
4. Em **Authentication > URL Configuration**, coloque o endereço do seu site em **Site URL** e também em **Redirect URLs**.

O login é por link no e-mail, sem senha. Atenção: o envio de e-mail grátis do Supabase tem limite baixo por hora. Se o site bombar, configure um SMTP gratuito (Brevo ou Resend) em **Authentication > Emails > SMTP Settings**.

Com isso ligado, o site mostra quantos maratonistas existem, quantas pessoas marcaram cada filme e a raridade de cada conquista.

## 5. Contador de acessos (GoatCounter)

1. Crie uma conta grátis em goatcounter.com escolhendo um código (ex.: `maratonadestino`).
2. Coloque esse código em `goatcounter` no `config.js`.
3. Pra mostrar o número de visitas no próprio site, ative em **Settings** a opção de permitir contadores públicos de visitas.

No painel do GoatCounter você vê acessos por dia, cidade, aparelho e de qual rede social a pessoa veio.

## 6. Trilha sonora por bloco

Nunca use MP3 das trilhas oficiais: é pirataria e o GitHub pode derrubar o site. Duas opções:

- **MP3 livre de direitos:** baixe músicas épicas no Pixabay Music, salve como `musica/bloco1.mp3`, `musica/bloco2.mp3` etc. e preencha o campo `musica` de cada bloco no `config.js`. Um botão "Ligar trilha" aparece no canto, e a música troca sozinha conforme a pessoa rola pelos blocos.
- **Spotify:** cole o link de uma playlist ou álbum no campo `spotify` do bloco. Aparece um player "Trilha do bloco" que a pessoa abre quando quiser.

Deixe os MP3 leves (até uns 3 MB cada) pra não pesar no celular.

## Criando novas conquistas

Abra `js/conquistas.js`, copie uma linha parecida e mude o `id` (tem que ser único), o ícone, o nome, a descrição e a regra. Exemplos de regra prontos no arquivo: `qtd(30)`, `bloco(3)`, `todos(["thor", "thor-ragnarok"])`.

Não mude o `id` de itens que já estão no ar (em `lista.json`), porque é por ele que o progresso das pessoas fica salvo.
