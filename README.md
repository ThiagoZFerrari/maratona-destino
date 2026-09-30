# 🛡️ Maratona Multiverso

Criei este site pra organizar a minha maratona de filmes e séries antes de **Vingadores: Doutor Destino**, que estreia em 17 de dezembro de 2026, e resolvi abrir pra qualquer fã que queira maratonar junto.

🔗 **Acesse:** [maratonamultiverso.com.br](https://maratonamultiverso.com.br)

## O que o site faz

- Lista os 77 filmes e séries do MCU, dos X-Men da Fox, do Homem-Aranha da Sony e do Demolidor, na ordem de lançamento
- Mostra cartaz, sinopse, duração e onde assistir cada título no Brasil
- Tem 51 conquistas pra desbloquear, incluindo algumas secretas
- Salva o progresso e as conquistas na nuvem com login por e-mail, sem senha
- Mostra estatísticas da comunidade, como quantas pessoas já marcaram cada filme e a raridade de cada conquista
- Gera um card personalizado pra postar nos stories
- Conta regressiva até a estreia
- Trilha sonora que muda a cada bloco da maratona

## Tecnologias

- **HTML, CSS e JavaScript** puros, sem framework
- **GitHub Pages** pra hospedagem
- **Supabase** (PostgreSQL) pro login e pra salvar o progresso, com Row Level Security garantindo que cada pessoa só acessa os próprios dados
- **API do TMDB** pros cartazes, sinopses e dados de streaming
- **Python** no script que busca os dados do TMDB
- **GoatCounter** pro contador de acessos, sem cookies

## Estrutura

index.html página principal
css/style.css visual inspirado em quadrinhos
js/config.js configurações do site
js/conquistas.js regras das conquistas
js/app.js lógica principal
data/lista.json os 77 títulos na ordem da maratona
data/filmes.json dados gerados a partir do TMDB
scripts/gerar_dados.py script que busca os dados no TMDB
supabase/schema.sql estrutura do banco de dados
musica/ trilhas livres de direitos


## Como rodar na sua máquina

O navegador bloqueia o carregamento da lista se o `index.html` for aberto direto, então é preciso subir um servidor local na pasta do projeto:

python -m http.server 8000


Depois é só acessar `http://localhost:8000`.

## Como atualizar os dados do TMDB

Com uma chave gratuita da API do TMDB, rode:

python scripts/gerar_dados.py SUA_CHAVE


O script gera o `data/filmes.json` com cartazes, sinopses e onde assistir. Se algum título não for encontrado automaticamente, dá pra colocar o ID do TMDB manualmente no `lista.json` e rodar de novo. Vale rodar de tempos em tempos, porque os catálogos de streaming mudam bastante.

## Banco de dados

O `supabase/schema.sql` cria a tabela de progresso, as regras de segurança e uma função que calcula as estatísticas da comunidade usando só números agregados, sem expor dados de ninguém.

## Criando conquistas novas

As conquistas ficam em `js/conquistas.js`. Pra criar uma nova, basta adicionar uma linha com id único, ícone, nome, descrição e a regra. Já deixei algumas funções prontas pra facilitar, como `qtd(30)`, `bloco(3)` e `todos(["thor", "thor-ragnarok"])`.

Uma regra importante: os ids dos títulos no `lista.json` não podem ser alterados depois de publicados, porque é por eles que o progresso de cada pessoa fica salvo.

## Créditos

- Cartazes, sinopses e dados de filmes: [TMDB](https://www.themoviedb.org). Este produto usa a API do TMDB, mas não é endossado ou certificado pelo TMDB.
- Disponibilidade nos streamings: [JustWatch](https://www.justwatch.com/br)
- Site de fã, sem fins lucrativos e sem vínculo com Marvel Studios, Disney, Sony ou Netflix.

---

🤖 Este site foi desenvolvido com a ajuda de inteligência artificial (Claude, da Anthropic), que me auxiliou na programação, na estrutura do banco de dados e na configuração da hospedagem.

Feito por **Thiago Ferrari** 🍿
