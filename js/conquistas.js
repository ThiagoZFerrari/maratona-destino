// ============================================================
//  CONQUISTAS
//  Para criar uma nova: copie uma linha, mude o id (único!), o ícone,
//  o nome, a descrição, a categoria e a regra (check).
//  Uma conquista desbloqueada nunca é perdida, mesmo se desmarcar filmes.
// ============================================================
window.CONQUISTAS = (() => {
  const todos = ids => c => ids.every(id => c.vistos.has(id));
  const qtd = n => c => c.vistos.size >= n;
  const grupo = filtro => c => {
    const ids = c.itens.filter(filtro).map(i => i.id);
    return ids.length > 0 && ids.every(id => c.vistos.has(id));
  };
  const bloco = b => grupo(i => i.bloco === b);

  const diaDe = ts => { const d = new Date(ts); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const maxNoDia = c => {
    const m = {};
    for (const id of c.vistos) { const k = diaDe(c.ts[id]); m[k] = (m[k] || 0) + 1; }
    return Math.max(0, ...Object.values(m));
  };
  const maiorSequencia = c => {
    const dias = [...new Set([...c.vistos].map(id => diaDe(c.ts[id])))].sort((a, b) => a - b);
    let melhor = 0, atual = 0, anterior = null;
    for (const d of dias) {
      atual = anterior !== null && Math.round((d - anterior) / 86400000) === 1 ? atual + 1 : 1;
      melhor = Math.max(melhor, atual);
      anterior = d;
    }
    return melhor;
  };

  return [
    // ---------- MARCOS ----------
    { id: "primeiro-passo", icone: "🎬", cat: "Marcos", nome: "Primeiro Passo", desc: "Marque seu primeiro filme ou série.", check: qtd(1) },
    { id: "esquentando", icone: "🔥", cat: "Marcos", nome: "Esquentando os Motores", desc: "Marque 5 itens.", check: qtd(5) },
    { id: "dez", icone: "🔟", cat: "Marcos", nome: "Dez na Conta", desc: "Marque 10 itens.", check: qtd(10) },
    { id: "recruta", icone: "🎖️", cat: "Marcos", nome: "Recruta de Elite", desc: "Marque 20 itens.", check: qtd(20) },
    { id: "metade", icone: "🫰", cat: "Marcos", nome: "Metade do Universo", desc: "Chegue à metade da maratona. Um estalo e pronto.", check: c => c.vistos.size >= Math.ceil(c.itens.length / 2) },
    { id: "sessenta", icone: "🚀", cat: "Marcos", nome: "Quase Lá, Vingador", desc: "Marque 60 itens.", check: qtd(60) },
    { id: "tudo", icone: "👑", cat: "Marcos", nome: "Pronto pro Destino", desc: "Complete a maratona inteira.", check: c => c.vistos.size >= c.itens.length },

    // ---------- BLOCOS ----------
    { id: "bloco-1", icone: "📼", cat: "Blocos", nome: "Raiz dos Anos 2000", desc: "Complete o Bloco 1.", check: bloco(1) },
    { id: "bloco-2", icone: "🛡️", cat: "Blocos", nome: "Iniciativa Completa", desc: "Complete o Bloco 2.", check: bloco(2) },
    { id: "bloco-3", icone: "🌍", cat: "Blocos", nome: "Universo em Expansão", desc: "Complete o Bloco 3.", check: bloco(3) },
    { id: "bloco-4", icone: "💎", cat: "Blocos", nome: "Sobrevivi ao Estalo", desc: "Complete o Bloco 4.", check: bloco(4) },
    { id: "bloco-5", icone: "🌀", cat: "Blocos", nome: "Sobrevivente do Multiverso", desc: "Complete o Bloco 5.", check: bloco(5) },
    { id: "bloco-6", icone: "🏁", cat: "Blocos", nome: "Reta Final", desc: "Complete o Bloco 6.", check: bloco(6) },
    { id: "bloco-7", icone: "🎟️", cat: "Blocos", nome: "Aquecimento Final", desc: "Complete o Bloco 7.", check: bloco(7) },

    // ---------- FRANQUIAS ----------
    { id: "fr-xmen", icone: "🧬", cat: "Franquias", nome: "Mutante de Carteirinha", desc: "Veja todos os X-Men da Fox.", check: grupo(i => i.franquia === "xmen") },
    { id: "fr-sony", icone: "🕸️", cat: "Franquias", nome: "Teia Completa", desc: "Veja todos os filmes da Sony.", check: grupo(i => i.franquia === "sony") },
    { id: "fr-netflix", icone: "🌃", cat: "Franquias", nome: "Cozinha do Inferno", desc: "Veja todo o Demolidor da Netflix e Os Defensores.", check: grupo(i => i.franquia === "netflix") },
    { id: "fr-mcu-filmes", icone: "🎞️", cat: "Franquias", nome: "Cinéfilo do MCU", desc: "Veja todos os filmes do MCU.", check: grupo(i => i.franquia === "mcu" && i.tipo === "filme") },
    { id: "fr-series", icone: "🛋️", cat: "Franquias", nome: "Maratonista de Sofá", desc: "Veja todas as séries da lista.", check: grupo(i => i.tipo === "serie") },

    // ---------- SAGAS ----------
    { id: "saga-vingadores", icone: "⚡", cat: "Sagas", nome: "Vingadores, Avante!", desc: "Veja os quatro filmes dos Vingadores.", check: todos(["os-vingadores", "era-de-ultron", "guerra-infinita", "ultimato"]) },
    { id: "saga-ferro", icone: "🦾", cat: "Sagas", nome: "Gênio, Bilionário, Filantropo", desc: "Veja a trilogia Homem de Ferro.", check: todos(["homem-de-ferro", "homem-de-ferro-2", "homem-de-ferro-3"]) },
    { id: "saga-thor", icone: "🔨", cat: "Sagas", nome: "Digno do Martelo", desc: "Veja os quatro filmes do Thor.", check: todos(["thor", "thor-mundo-sombrio", "thor-ragnarok", "amor-e-trovao"]) },
    { id: "saga-capitao", icone: "🫡", cat: "Sagas", nome: "Aguento o Dia Todo", desc: "Veja os quatro filmes do Capitão América.", check: todos(["capitao-america-primeiro-vingador", "capitao-america-soldado-invernal", "guerra-civil", "admiravel-mundo-novo"]) },
    { id: "saga-guardioes", icone: "🌱", cat: "Sagas", nome: "Nós Somos Groot", desc: "Veja a trilogia Guardiões da Galáxia.", check: todos(["guardioes-da-galaxia", "guardioes-da-galaxia-2", "guardioes-da-galaxia-3"]) },
    { id: "saga-formiga", icone: "🐜", cat: "Sagas", nome: "Tamanho Não É Documento", desc: "Veja a trilogia Homem-Formiga.", check: todos(["homem-formiga", "homem-formiga-e-a-vespa", "quantumania"]) },
    { id: "saga-pantera", icone: "🐾", cat: "Sagas", nome: "Rei de Wakanda", desc: "Veja os dois filmes do Pantera Negra.", check: todos(["pantera-negra", "wakanda-para-sempre"]) },
    { id: "saga-estranho", icone: "🔮", cat: "Sagas", nome: "Artes Místicas", desc: "Veja os dois filmes do Doutor Estranho.", check: todos(["doutor-estranho", "multiverso-da-loucura"]) },
    { id: "saga-deadpool", icone: "🌮", cat: "Sagas", nome: "Quarta Parede Quebrada", desc: "Veja os três filmes do Deadpool.", check: todos(["deadpool", "deadpool-2", "deadpool-wolverine"]) },
    { id: "saga-wolverine", icone: "🗡️", cat: "Sagas", nome: "Garras de Adamantium", desc: "Veja os quatro filmes solo do Wolverine.", check: todos(["x-men-origens-wolverine", "wolverine-imortal", "logan", "deadpool-wolverine"]) },
    { id: "saga-raimi", icone: "🍕", cat: "Sagas", nome: "Grandes Poderes", desc: "Veja a trilogia do Tobey Maguire.", check: todos(["homem-aranha", "homem-aranha-2", "homem-aranha-3"]) },
    { id: "saga-espetacular", icone: "🛹", cat: "Sagas", nome: "Espetacular", desc: "Veja os dois Espetacular Homem-Aranha.", check: todos(["espetacular-homem-aranha", "espetacular-homem-aranha-2"]) },
    { id: "saga-holland", icone: "🎒", cat: "Sagas", nome: "Amigão da Vizinhança", desc: "Veja os quatro Homem-Aranha do MCU.", check: todos(["de-volta-ao-lar", "longe-de-casa", "sem-volta-para-casa", "um-novo-dia"]) },
    { id: "saga-tres-aranhas", icone: "👉", cat: "Sagas", nome: "Três Aranhas", desc: "Veja um filme de cada Homem-Aranha e o Sem Volta para Casa.", check: todos(["homem-aranha", "espetacular-homem-aranha", "sem-volta-para-casa"]) },
    { id: "saga-venom", icone: "👅", cat: "Sagas", nome: "Nós Somos Venom", desc: "Veja a trilogia Venom.", check: todos(["venom", "venom-carnificina", "venom-ultima-rodada"]) },
    { id: "saga-loki", icone: "🐍", cat: "Sagas", nome: "Deus da Trapaça", desc: "Veja as duas temporadas de Loki.", check: todos(["loki-t1", "loki-t2"]) },
    { id: "saga-whatif", icone: "👁️", cat: "Sagas", nome: "E Se...?", desc: "Veja as três temporadas de What If...?.", check: todos(["what-if-t1", "what-if-t2", "what-if-t3"]) },
    { id: "saga-demolidor", icone: "⚖️", cat: "Sagas", nome: "O Homem Sem Medo", desc: "Veja todo o Demolidor, incluindo o Renascido.", check: todos(["demolidor-t1", "demolidor-t2", "demolidor-t3", "demolidor-renascido-t1"]) },
    { id: "saga-xmen-classicos", icone: "🎓", cat: "Sagas", nome: "Escola Xavier", desc: "Veja a trilogia original dos X-Men.", check: todos(["x-men", "x-men-2", "x-men-confronto-final"]) },
    { id: "ultimato-duplo", icone: "♾️", cat: "Sagas", nome: "Ultimato Duplo", desc: "Veja o Ultimato original e o Encore.", check: todos(["ultimato", "ultimato-encore"]) },

    // ---------- DESAFIOS ----------
    { id: "raiz", icone: "🍿", cat: "Desafios", nome: "Maratonista Raiz", desc: "Marque 3 itens no mesmo dia.", check: c => maxNoDia(c) >= 3 },
    { id: "virada", icone: "🌅", cat: "Desafios", nome: "Virada Heroica", desc: "Marque 5 itens no mesmo dia.", check: c => maxNoDia(c) >= 5 },
    { id: "semana", icone: "📅", cat: "Desafios", nome: "Semana Heroica", desc: "Marque pelo menos 1 item por 7 dias seguidos.", check: c => maiorSequencia(c) >= 7 },
    { id: "quinzena", icone: "🗓️", cat: "Desafios", nome: "Disciplina de Soldado", desc: "Marque pelo menos 1 item por 14 dias seguidos.", check: c => maiorSequencia(c) >= 14 },
    { id: "compartilhou", icone: "📣", cat: "Desafios", nome: "Espalhando a Palavra", desc: "Gere seu card pros stories.", check: c => !!c.eventos.compartilhou },
    { id: "nuvem", icone: "☁️", cat: "Desafios", nome: "Agente Registrado", desc: "Entre na sua conta pra salvar na nuvem.", check: c => !!c.eventos.nuvem },
    { id: "antes-estreia", icone: "⏰", cat: "Desafios", nome: "Pontualidade Asgardiana", desc: "Complete tudo antes da estreia de 17/12.", check: c => c.vistos.size >= c.itens.length && Math.max(...[...c.vistos].map(id => c.ts[id])) < c.estreia },

    // ---------- SECRETAS ----------
    { id: "coruja", icone: "🦉", cat: "Secretas", secreta: true, nome: "Vigilante Noturno", desc: "Marque algo entre meia-noite e 5 da manhã.", check: c => [...c.vistos].some(id => new Date(c.ts[id]).getHours() < 5) },
    { id: "coragem", icone: "🫣", cat: "Secretas", secreta: true, nome: "Coragem de Vingador", desc: "Sobreviva a Morbius, Madame Teia e Kraven.", check: todos(["morbius", "madame-teia", "kraven"]) },
    { id: "na-ordem", icone: "📏", cat: "Secretas", secreta: true, nome: "Na Ordem Certinha", desc: "Marque os 20 primeiros itens exatamente na ordem da lista.", check: c => {
        const p = c.itens.slice(0, 20);
        if (!p.every(i => c.vistos.has(i.id))) return false;
        for (let k = 1; k < p.length; k++) if (c.ts[p[k].id] < c.ts[p[k - 1].id]) return false;
        return true;
      } },
    { id: "fora-da-ordem", icone: "🔀", cat: "Secretas", secreta: true, nome: "Variante Rebelde", desc: "Marque um item antes de algum anterior a ele na lista.", check: c =>
        c.itens.some((it, k) => c.vistos.has(it.id) && c.itens.slice(0, k).some(p => !c.vistos.has(p.id) || c.ts[p.id] > c.ts[it.id])) },
    { id: "fim-de-semana", icone: "🛏️", cat: "Secretas", secreta: true, nome: "Fim de Semana Perdido", desc: "Marque 6 itens num único fim de semana.", check: c => {
        const m = {};
        for (const id of c.vistos) {
          const d = new Date(c.ts[id]); const dia = d.getDay();
          if (dia !== 0 && dia !== 6) continue;
          const sab = new Date(d); sab.setHours(0, 0, 0, 0); if (dia === 0) sab.setDate(sab.getDate() - 1);
          m[sab.getTime()] = (m[sab.getTime()] || 0) + 1;
        }
        return Math.max(0, ...Object.values(m)) >= 6;
      } }
  ];
})();
