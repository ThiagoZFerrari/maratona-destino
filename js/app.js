(() => {
"use strict";

const CFG = window.MARATONA_CONFIG || {};
const CONQ = window.CONQUISTAS || [];
const ESTREIA = new Date(2026, 11, 17);
const CHAVE = "maratona-destino-v2";
const IMG = "https://image.tmdb.org/t/p/";
const BLOCOS = {
  1: ["Os primórdios", "2000 a 2007"],
  2: ["Nasce o MCU", "2008 a 2012"],
  3: ["Expansão", "2013 a 2016"],
  4: ["Rumo ao Thanos", "2017 a 2019"],
  5: ["O multiverso se abre", "2020 a 2022"],
  6: ["Reta final", "2023 a 2026"],
  7: ["A preparação definitiva", "o aquecimento final"]
};
const FR = {
  mcu: { nome: "MCU", cor: "var(--red)" },
  xmen: { nome: "X-Men (Fox)", cor: "var(--gold)" },
  sony: { nome: "Sony", cor: "var(--blue)" },
  netflix: { nome: "Netflix", cor: "var(--purple)" }
};

const $ = s => document.querySelector(s);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmt = n => Number(n).toLocaleString("pt-BR");
const num = it => String(ITENS.indexOf(it) + 1).padStart(2, "0");

let ITENS = [];
const POR_ID = {};
let estado = carregarLocal();
let filtro = "todos";
const frOn = { mcu: true, xmen: true, sony: true, netflix: true };
let sb = null, sessao = null, sincronizado = false, stats = null, envioT = null;

// estado local
function carregarLocal() {
  try {
    const e = JSON.parse(localStorage.getItem(CHAVE));
    if (e && typeof e === "object") return { vistos: e.vistos || {}, conquistas: e.conquistas || {}, eventos: e.eventos || {} };
  } catch (_) {}
  return { vistos: {}, conquistas: {}, eventos: {} };
}
function salvarLocal() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (_) {} }
function persistir() { salvarLocal(); agendarEnvio(); }
const visto = id => Object.prototype.hasOwnProperty.call(estado.vistos, id);
const totalVistos = () => ITENS.filter(i => visto(i.id)).length;
const diasRestantes = () => { const h = new Date(); h.setHours(0, 0, 0, 0); return Math.round((ESTREIA - h) / 86400000); };

// dados
async function carregarDados() {
  for (const url of ["data/filmes.json", "data/lista.json"]) {
    try {
      const r = await fetch(url, { cache: "no-cache" });
      if (r.ok) { const d = await r.json(); if (Array.isArray(d) && d.length) return d; }
    } catch (_) {}
  }
  throw new Error("sem dados");
}

// textos auxiliares
function duracaoTxt(it) {
  if (it.duracao) { const h = Math.floor(it.duracao / 60), m = it.duracao % 60; return `, ${h ? h + "h" : ""}${String(m).padStart(h ? 2 : 1, "0")}min`; }
  if (it.episodios) return `, ${it.episodios} episódios`;
  return "";
}
function linkBusca(it) {
  const q = it.titulo.replace(/, \dª temporada$/, "").replace(/\*$/, "");
  return "https://www.justwatch.com/br/busca?q=" + encodeURIComponent(q);
}
function ondeCurto(it) {
  if (it.onde_fixo) return `<span class="plat">${esc(it.onde_fixo)}</span>`;
  const s = (it.onde && it.onde.streaming) || [];
  if (s.length) return `<span class="plat">${esc(s[0].nome)}</span>${s.length > 1 ? `<span class="mais">+${s.length - 1}</span>` : ""}`;
  if (it.onde && it.onde.aluguel) return `<span class="plat sem">Aluguel ou compra</span>`;
  return `<a href="${linkBusca(it)}" target="_blank" rel="noopener">Onde ver</a>`;
}
function textoComunidade(id) {
  if (!stats || !stats.por_item) return "";
  const n = stats.por_item[id] || 0;
  if (!n) return "";
  return `👥 ${fmt(n)} ${n === 1 ? "pessoa marcou" : "pessoas marcaram"}`;
}
function spotifyEmbed(url) {
  const m = String(url || "").match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track)\/([A-Za-z0-9]+)/);
  return m ? `https://open.spotify.com/embed/${m[1]}/${m[2]}?theme=0` : "";
}
function playerTrilha(it) {
  const src = spotifyEmbed(it.spotify);
  return src ? `<div class="player-trilha"><iframe src="${src}" title="Trilha sonora de ${esc(it.titulo)}" loading="lazy" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"></iframe></div>` : "";
}
async function carregarSpotify() {
  try {
    const r = await fetch("data/spotify.json", { cache: "no-cache" });
    if (!r.ok) return;
    const m = await r.json();
    ITENS.forEach(i => { if (m[i.id] && m[i.id].spotify) i.spotify = m[i.id].spotify; });
  } catch (_) {}
}

// lista
function render() {
  const main = $("#lista");
  main.innerHTML = "";
  let mostrados = 0;
  if (filtro === "essenciais") {
    const ess = ITENS.filter(i => i.essencial), feitos = ess.filter(i => visto(i.id)).length;
    const min = ess.filter(i => !visto(i.id)).reduce((t, i) => t + (i.duracao || (i.tipo === "serie" ? 300 : 0)), 0);
    const r = document.createElement("div");
    r.className = "resumo-essenciais";
    r.innerHTML = `<b>⭐ Maratona essencial: ${feitos} de ${ess.length} vistos</b>
      <span>É a lista oficial que a Marvel recomenda antes de Doutor Destino.${feitos < ess.length ? ` Faltam cerca de ${Math.round(min / 60)} horas.` : " Lição de casa feita! 🎉"}</span>`;
    main.appendChild(r);
  }
  for (const b of Object.keys(BLOCOS).map(Number)) {
    const doBloco = ITENS.filter(i => i.bloco === b);
    const vis = doBloco.filter(i => frOn[i.franquia] && (filtro === "todos" || (filtro === "essenciais" ? !!i.essencial : (filtro === "vistos") === visto(i.id))));
    if (!vis.length) continue;
    mostrados += vis.length;
    const sp = spotifyEmbed(((CFG.blocos || {})[b] || {}).spotify);
    const sec = document.createElement("section");
    sec.className = "bloco";
    sec.dataset.bloco = b;
    sec.innerHTML = `
      <div class="bloco-head">
        <h2>Bloco ${b}</h2>
        <p>${BLOCOS[b][0]}, ${BLOCOS[b][1]}</p>
        <span class="contagem" data-contagem="${b}"></span>
      </div>
      ${sp ? `<details class="trilha" data-src="${sp}"><summary>🎧 Trilha do bloco</summary></details>` : ""}
      <div class="grid"></div>`;
    const grid = sec.querySelector(".grid");
    vis.forEach(it => grid.appendChild(criarCard(it)));
    const det = sec.querySelector("details.trilha");
    if (det) det.addEventListener("toggle", () => {
      if (det.open && !det.querySelector("iframe")) {
        const f = document.createElement("iframe");
        f.src = det.dataset.src; f.title = `Trilha do bloco ${b}`; f.loading = "lazy";
        f.allow = "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture";
        det.appendChild(f);
      }
    });
    main.appendChild(sec);
  }
  if (!mostrados) {
    main.innerHTML = `<p class="vazio">${filtro === "vistos" ? "Nada marcado ainda. Comece pelo #01 e o primeiro carimbo aparece aqui." : filtro === "falta" ? "Você já viu tudo que está nesses filtros!" : "Nada pra mostrar com esses filtros. Ative mais franquias acima."}</p>`;
  }
  atualizarContagens();
  observarBlocos();
}

function criarCard(it) {
  const el = document.createElement("article");
  const v = visto(it.id);
  el.className = "card" + (v ? " visto" : "");
  el.id = "item-" + it.id;
  el.style.setProperty("--c", FR[it.franquia].cor);
  const gibi = `<span class="capa-gibi"><span class="titulo-gibi">${esc(it.titulo)}</span></span>`;
  el.innerHTML = `
    <button class="capa" type="button" aria-label="Detalhes de ${esc(it.titulo)}">
      ${it.poster ? `<img src="${IMG}w342${it.poster}" srcset="${IMG}w185${it.poster} 185w, ${IMG}w342${it.poster} 342w" sizes="(max-width:560px) 45vw, 170px" alt="Cartaz de ${esc(it.titulo)} (${it.ano})" loading="lazy" decoding="async">` : gibi}
      <span class="tags"><span class="tag">#${num(it)}${it.essencial ? " ⭐" : ""}</span><span class="tag fr">${it.tipo === "serie" ? "Série" : "Filme"}</span></span>
      <span class="carimbo" aria-hidden="true">VISTO!</span>
    </button>
    <div class="card-corpo">
      <h3>${esc(it.titulo)}</h3>
      <div class="meta">${FR[it.franquia].nome}, ${it.ano}</div>
      <div class="onde">${ondeCurto(it)}</div>
      <div class="comunidade" data-com="${it.id}">${textoComunidade(it.id)}</div>
      <button class="marcar" type="button" aria-pressed="${v}">${v ? "Desmarcar" : "Marcar como visto"}</button>
    </div>`;
  const img = el.querySelector(".capa img");
  if (img) img.addEventListener("error", () => { img.outerHTML = gibi; }, { once: true });
  el.querySelector(".capa").addEventListener("click", () => abrirDetalhe(it.id));
  el.querySelector(".marcar").addEventListener("click", () => alternar(it.id));
  return el;
}

function atualizarCard(id) {
  const card = document.getElementById("item-" + id);
  if (!card) return;
  const v = visto(id);
  card.classList.toggle("visto", v);
  const b = card.querySelector(".marcar");
  b.setAttribute("aria-pressed", v);
  b.textContent = v ? "Desmarcar" : "Marcar como visto";
}

function atualizarContagens() {
  document.querySelectorAll("[data-contagem]").forEach(el => {
    const b = Number(el.dataset.contagem);
    const doBloco = ITENS.filter(i => i.bloco === b && (filtro !== "essenciais" || i.essencial));
    el.textContent = `${doBloco.filter(i => visto(i.id)).length} de ${doBloco.length}`;
  });
}

function atualizarPainel() {
  const v = totalVistos(), tot = ITENS.length, p = tot ? Math.round(v / tot * 100) : 0;
  $("#totalItens").textContent = tot;
  $("#vistosTxt").textContent = `${v} de ${tot} vistos`;
  $("#pct").textContent = p + "%";
  $("#barra").style.width = p + "%";
  $(".barra").setAttribute("aria-valuenow", p);
  const d = diasRestantes();
  $("#dias").textContent = d > 0 ? d : d === 0 ? "Hoje!" : "Estreou";
  $("#conqResumo").textContent = `${CONQ.filter(q => estado.conquistas[q.id]).length}/${CONQ.length}`;
  renderProxima();
}

function renderProxima() {
  const box = $("#proxima");
  const it = ITENS.find(i => !visto(i.id));
  const chave = it ? it.id : "fim";
  if (box.dataset.atual === chave) return;
  box.dataset.atual = chave;
  TrilhaFilme.atualizar(it || null);
  if (!it) {
    box.innerHTML = `<div class="wrap"><div class="proxima"><div class="prox-txt"><span class="prox-rotulo">Maratona completa</span><h2>Agora é só esperar o dia 17!</h2></div></div></div>`;
    return;
  }
  // No celular a imagem menor já basta e carrega mais rápido
  const tamFundo = window.innerWidth > 800 ? "w1280" : "w780";
  const bg = it.backdrop ? ` style="--bg:url('${IMG}${tamFundo}${it.backdrop}')"` : "";
  box.innerHTML = `
    <div class="wrap"><div class="proxima${it.backdrop ? " com-fundo" : ""}"${bg}>
      <div class="prox-txt">
        <span class="prox-rotulo">Próxima parada, #${num(it)}</span>
        <h2>${esc(it.titulo)}</h2>
        <p>${it.ano}, ${it.tipo === "serie" ? "série" : "filme"}${duracaoTxt(it)}</p>
        <div class="acoes">
          <button class="btn alt" type="button" data-a="marcar">Já vi esse</button>
          <button class="btn" type="button" data-a="detalhe">Detalhes</button>
        </div>
      </div>
    </div></div>`;
  box.querySelector('[data-a="marcar"]').onclick = () => alternar(it.id);
  box.querySelector('[data-a="detalhe"]').onclick = () => abrirDetalhe(it.id);
}

// marcar
function alternar(id) {
  if (visto(id)) delete estado.vistos[id];
  else estado.vistos[id] = Date.now();
  persistir();
  if (filtro === "todos" && frOn[POR_ID[id].franquia]) atualizarCard(id);
  else render();
  atualizarContagens();
  atualizarPainel();
  avaliarConquistas();
  if ($("#dlgDetalhe").open && detalheAtual === id) preencherDetalhe();
}

// detalhe
let detalheAtual = null;
function abrirDetalhe(id) {
  detalheAtual = id;
  preencherDetalhe();
  const d = $("#dlgDetalhe");
  if (!d.open) d.showModal();
}
function preencherDetalhe() {
  const it = POR_ID[detalheAtual];
  if (!it) return;
  const d = $("#dlgDetalhe");
  const v = visto(it.id);
  const provs = ((it.onde && it.onde.streaming) || []).map(p =>
    `<span class="prov">${p.logo ? `<img src="${IMG}w92${p.logo}" alt="" loading="lazy">` : ""}${esc(p.nome)}</span>`).join("");
  let ondeHtml;
  if (it.onde_fixo) ondeHtml = `<span class="prov sem">${esc(it.onde_fixo)}</span>`;
  else if (provs) ondeHtml = provs;
  else if (it.onde && it.onde.aluguel) ondeHtml = `<span class="prov sem">Disponível pra alugar ou comprar</span>`;
  else ondeHtml = `<span class="prov sem">Sem informação no momento</span>`;
  const bg = it.backdrop ? ` style="--bg:url('${IMG}w780${it.backdrop}')"` : "";
  d.innerHTML = `
    <div class="dlg-topo${it.backdrop ? " com-fundo" : ""}"${bg}>
      <button class="fechar" type="button" aria-label="Fechar">✕</button>
      <h2>${esc(it.titulo)}</h2>
      <p>#${num(it)}, ${FR[it.franquia].nome}, ${it.ano}${duracaoTxt(it)}</p>
    </div>
    <div class="dlg-corpo">
      ${it.sinopse ? `<p class="sinopse">${esc(it.sinopse)}</p>` : ""}
      <h3>Onde assistir</h3>
      <div class="provs">${ondeHtml}</div>
      <p class="links"><a href="${esc(/^https:\/\//i.test((it.onde && it.onde.link) || "") ? it.onde.link : linkBusca(it))}" target="_blank" rel="noopener noreferrer">Ver todas as opções</a></p>
      ${it.spotify ? `<h3>Trilha sonora</h3>${playerTrilha(it)}` : ""}
      ${textoComunidade(it.id) ? `<p class="comunidade">${textoComunidade(it.id)}</p>` : ""}
      <button class="btn grande ${v ? "" : "alt"}" type="button" data-a="marcar">${v ? "Desmarcar" : "Marcar como visto"}</button>
    </div>`;
  d.querySelector(".fechar").onclick = () => d.close();
  d.querySelector('[data-a="marcar"]').onclick = () => alternar(it.id);
}

// conquistas
function contexto() {
  return {
    vistos: new Set(ITENS.filter(i => visto(i.id)).map(i => i.id)),
    ts: estado.vistos, itens: ITENS, eventos: estado.eventos, estreia: ESTREIA.getTime()
  };
}
function avaliarConquistas(silencioso) {
  if (!ITENS.length) return;
  const c = contexto(), novas = [];
  for (const q of CONQ) {
    if (estado.conquistas[q.id]) continue;
    let ok = false;
    try { ok = !!q.check(c); } catch (_) {}
    if (ok) { estado.conquistas[q.id] = Date.now(); novas.push(q); }
  }
  if (!novas.length) return;
  persistir();
  atualizarPainel();
  if (!silencioso) novas.forEach(mostrarConquista);
  if ($("#dlgConquistas").open) renderConquistas();
}

const filaToast = [];
let mostrandoToast = false;
function mostrarConquista(q) { filaToast.push(q); if (!mostrandoToast) proximoToast(); }
function proximoToast() {
  const q = filaToast.shift();
  if (!q) { mostrandoToast = false; return; }
  mostrandoToast = true;
  const el = document.createElement("div");
  el.className = "conq-toast";
  el.setAttribute("role", "status");
  el.innerHTML = `<span class="conq-icone">${q.icone}</span><span><small>Conquista desbloqueada!</small><b>${esc(q.nome)}</b></span>`;
  $("#toasts").appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => { el.remove(); proximoToast(); }, 300); }, 3000);
}
function aviso(msg) {
  const el = document.createElement("div");
  el.className = "toast";
  el.setAttribute("role", "status");
  el.textContent = msg;
  $("#toasts").appendChild(el);
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 2800);
}

function renderConquistas() {
  const d = $("#dlgConquistas");
  const feitas = CONQ.filter(q => estado.conquistas[q.id]).length;
  const cats = [...new Set(CONQ.map(q => q.cat))];
  const raridade = id => (stats && stats.maratonistas > 0)
    ? Math.round((((stats.por_conquista || {})[id]) || 0) / stats.maratonistas * 100) : null;
  d.innerHTML = `
    <div class="dlg-cab">
      <button class="fechar" type="button" aria-label="Fechar">✕</button>
      <h2>Conquistas</h2>
      <p>${feitas} de ${CONQ.length} desbloqueadas</p>
    </div>
    <div class="dlg-corpo">
      ${cats.map(cat => `
        <h3>${esc(cat)}</h3>
        <div class="conq-grid">
          ${CONQ.filter(q => q.cat === cat).map(q => {
            const ok = !!estado.conquistas[q.id], oculta = q.secreta && !ok, r = raridade(q.id);
            return `<div class="conq${ok ? " ok" : ""}">
              <span class="conq-icone">${oculta ? "❔" : q.icone}</span>
              <div>
                <b>${oculta ? "???" : esc(q.nome)}</b>
                <p>${oculta ? "Conquista secreta. Continue maratonando." : esc(q.desc)}</p>
                ${ok ? `<small>Desbloqueada em ${new Date(estado.conquistas[q.id]).toLocaleDateString("pt-BR")}</small>` : ""}
                ${r !== null ? `<small class="rar">${r}% dos maratonistas têm</small>` : ""}
              </div>
            </div>`;
          }).join("")}
        </div>`).join("")}
    </div>`;
  d.querySelector(".fechar").onclick = () => d.close();
}

// nuvem (Supabase)
function iniciarNuvem() {
  if (!CFG.supabaseUrl || !CFG.supabaseAnonKey || !window.supabase) return;
  sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { flowType: "implicit", detectSessionInUrl: true, persistSession: true } });
  const erroLogin = new URLSearchParams(location.hash.slice(1) || location.search.slice(1)).get("error_description");
  // Mensagem fixa: o texto que vem na URL pode ser forjado por quem manda o link
  if (erroLogin) aviso("O link de acesso expirou ou já foi usado. Peça um novo em \"Entrar pra salvar\".");
  $("#contaBox").hidden = false;
  $("#btnConta").onclick = () => sessao ? sair() : abrirLogin();
  sb.auth.onAuthStateChange((_evento, s) => {
    sessao = s;
    atualizarConta();
    if (s && !sincronizado) setTimeout(sincronizarLogin, 0);
    if (!s) sincronizado = false;
  });
  carregarStats();
}
function atualizarConta() {
  $("#btnConta").textContent = sessao ? "Sair" : "Entrar pra salvar";
  if (!sessao) statusNuvem("");
}
function statusNuvem(t) { $("#nuvemStatus").textContent = t; }

async function sincronizarLogin() {
  if (!sessao || sincronizado) return;
  sincronizado = true;
  statusNuvem("Sincronizando...");
  const { data, error } = await sb.from("progresso").select("vistos, conquistas, eventos").eq("user_id", sessao.user.id).maybeSingle();
  if (error) { sincronizado = false; statusNuvem("Não sincronizou"); return; }
  const mesclar = (local, nuvem) => { for (const [k, v] of Object.entries(nuvem || {})) if (!(k in local) || v < local[k]) local[k] = v; };
  if (data) { mesclar(estado.vistos, data.vistos); mesclar(estado.conquistas, data.conquistas); mesclar(estado.eventos, data.eventos); }
  if (!estado.eventos.nuvem) estado.eventos.nuvem = Date.now();
  salvarLocal();
  render();
  atualizarPainel();
  avaliarConquistas();
  await enviarAgora();
  carregarStats();
}
function agendarEnvio() {
  if (!sb || !sessao || !sincronizado) return;
  clearTimeout(envioT);
  statusNuvem("Salvando...");
  envioT = setTimeout(enviarAgora, 1200);
}
async function enviarAgora() {
  if (!sb || !sessao) return;
  const { error } = await sb.from("progresso").upsert({
    user_id: sessao.user.id, vistos: estado.vistos, conquistas: estado.conquistas,
    eventos: estado.eventos, atualizado_em: new Date().toISOString()
  });
  if (error) { statusNuvem("Não salvou, tentando de novo"); clearTimeout(envioT); envioT = setTimeout(enviarAgora, 10000); }
  else statusNuvem("☁️ Salvo na nuvem");
}
async function sair() {
  await sb.auth.signOut();
  aviso("Você saiu. Seu progresso continua salvo neste aparelho.");
}
// LGPD: apaga a conta, o progresso na nuvem e os dados locais
async function apagarDados() {
  const tinhaConta = !!(sb && sessao);
  if (tinhaConta) {
    clearTimeout(envioT);
    const { error } = await sb.rpc("apagar_minha_conta");
    if (error) { aviso("Não consegui apagar sua conta agora. Tente de novo em alguns minutos."); return; }
    sincronizado = false; // impede que algum envio pendente recrie os dados
    try { await sb.auth.signOut({ scope: "local" }); } catch (_) {}
  }
  estado = { vistos: {}, conquistas: {}, eventos: {} };
  try { localStorage.removeItem(CHAVE); } catch (_) {}
  render();
  atualizarPainel();
  carregarStats();
  aviso(tinhaConta ? "Pronto! Sua conta e todos os seus dados foram apagados." : "Pronto! Seus dados foram apagados deste navegador.");
}
function abrirLogin() {
  const d = $("#dlgLogin");
  d.innerHTML = `
    <div class="dlg-cab">
      <button class="fechar" type="button" aria-label="Fechar">✕</button>
      <h2>Salvar na nuvem</h2>
      <p>Entre com seu e-mail e nunca perca suas conquistas, mesmo trocando de celular.</p>
    </div>
    <div class="dlg-corpo">
      <form class="form-login">
        <label for="email">Seu e-mail</label>
        <input id="email" type="email" required autocomplete="email" placeholder="voce@email.com">
        ${CFG.turnstileSiteKey ? `<div class="captcha"></div>` : ""}
        <button class="btn alt grande" type="submit">Enviar link de acesso</button>
        <p class="msg" aria-live="polite"></p>
      </form>
    </div>`;
  d.querySelector(".fechar").onclick = () => d.close();
  const form = d.querySelector("form"), msg = d.querySelector(".msg"), btn = form.querySelector("button");
  // Anti-robô: o botão só libera depois que o Turnstile confirma
  let captchaToken = "", widget = null;
  if (CFG.turnstileSiteKey) {
    btn.disabled = true;
    carregarTurnstile().then(() => {
      widget = window.turnstile.render(d.querySelector(".captcha"), {
        sitekey: CFG.turnstileSiteKey, language: "pt-br",
        callback: t => { captchaToken = t; btn.disabled = false; },
        "expired-callback": () => { captchaToken = ""; btn.disabled = true; },
        "error-callback": () => { msg.textContent = "A verificação anti-robô falhou. Recarregue a página."; }
      });
    }).catch(() => { msg.textContent = "Não consegui carregar a verificação anti-robô. Confira a internet e recarregue."; });
  }
  form.onsubmit = async e => {
    e.preventDefault();
    btn.disabled = true;
    msg.textContent = "Enviando...";
    const { error } = await sb.auth.signInWithOtp({
      email: form.email.value.trim(),
      options: { emailRedirectTo: CFG.siteUrl || location.origin + location.pathname, captchaToken: captchaToken || undefined }
    });
    // Cada token do Turnstile vale uma vez só
    if (widget !== null) { captchaToken = ""; window.turnstile.reset(widget); }
    else btn.disabled = false;
    msg.textContent = error
      ? "Não consegui enviar agora. Espere alguns minutos e tente de novo."
      : "Pronto! Abra o link que chegou no seu e-mail neste mesmo aparelho.";
  };
  d.showModal();
}
// Carrega o script do Turnstile só quando abre o login
let turnstileP = null;
function carregarTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (!turnstileP) turnstileP = new Promise((ok, erro) => {
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = ok;
    s.onerror = () => { turnstileP = null; erro(); };
    document.head.appendChild(s);
  });
  return turnstileP;
}
async function carregarStats() {
  if (!sb || !ITENS.length) return;
  const { data, error } = await sb.rpc("estatisticas", { total: ITENS.length });
  if (error || !data) return;
  stats = data;
  document.querySelectorAll("[data-com]").forEach(el => { el.innerHTML = textoComunidade(el.dataset.com); });
  if (stats.maratonistas) { $("#statMaratonistas").hidden = false; $("#maratonistas").textContent = fmt(stats.maratonistas); }
  if ($("#dlgConquistas").open) renderConquistas();
}

// contador de visitas (GoatCounter)
function iniciarVisitas() {
  const code = CFG.goatcounter;
  if (!code) return;
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://gc.zgo.at/count.js";
  s.dataset.goatcounter = `https://${code}.goatcounter.com/count`;
  document.head.appendChild(s);
  fetch(`https://${code}.goatcounter.com/counter/TOTAL.json`)
    .then(r => r.ok ? r.json() : null)
    .then(j => { if (j && j.count) { $("#statVisitas").hidden = false; $("#visitas").textContent = j.count; } })
    .catch(() => {});
}

// trilha sonora
const Som = (() => {
  const blocos = CFG.blocos || {};
  const ativo = Object.values(blocos).some(b => b && b.musica);
  const players = [new Audio(), new Audio()];
  players.forEach(p => { p.loop = true; p.preload = "none"; p.volume = 0; });
  let atual = 0, ligado = false, blocoAtual = null, btn = null;
  const VOL = 0.35;
  function fade(p, alvo, ms, fim) {
    const de = p.volume, t0 = performance.now();
    const passo = t => {
      const k = Math.min(1, (t - t0) / ms);
      p.volume = Math.max(0, Math.min(1, de + (alvo - de) * k));
      if (k < 1) requestAnimationFrame(passo); else if (fim) fim();
    };
    requestAnimationFrame(passo);
  }
  function tocar(b) {
    blocoAtual = b;
    atualizarBtn();
    if (!ligado) return;
    const src = (blocos[b] || {}).musica || "";
    const p = players[atual];
    if (p.dataset.src === src && !p.paused) return;
    if (!src) { fade(p, 0, 800, () => p.pause()); p.dataset.src = ""; return; }
    const prox = players[1 - atual];
    prox.dataset.src = src;
    prox.src = src;
    prox.volume = 0;
    prox.play().then(() => fade(prox, VOL, 1200)).catch(() => {});
    fade(p, 0, 1200, () => p.pause());
    atual = 1 - atual;
  }
  function alternarSom() {
    ligado = !ligado;
    if (ligado) { players[atual].dataset.src = ""; tocar(blocoAtual || 1); }
    else players.forEach(p => fade(p, 0, 500, () => p.pause()));
    atualizarBtn();
  }
  function atualizarBtn() {
    if (!btn) return;
    btn.textContent = ligado ? `🔊 Trilha do bloco ${blocoAtual || 1}` : "🔇 Ligar trilha";
    btn.setAttribute("aria-pressed", ligado);
  }
  function iniciar() {
    if (!ativo) return;
    btn = $("#somBtn");
    btn.hidden = false;
    btn.onclick = alternarSom;
    atualizarBtn();
  }
  return { iniciar, tocar, ativo };
})();

// trilha automática do filme (Spotify)
// O navegador só libera som depois de uma interação, por isso o primeiro clique.
const TrilhaFilme = (() => {
  const PREF = "maratona-trilha-auto";
  let ativo = false, ligado = false, controller = null, carregandoApi = false;
  let itemAtual = null, uriAtual = "", uriCarregada = "", tocarQuandoPronto = false, reservaT = null;

  const uriSpotify = url => {
    const m = String(url || "").match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(playlist|album|track)\/([A-Za-z0-9]+)/);
    return m ? `spotify:${m[1]}:${m[2]}` : "";
  };
  const lerPref = () => { try { return localStorage.getItem(PREF) === "1"; } catch (_) { return false; } };
  const salvarPref = v => { try { localStorage.setItem(PREF, v ? "1" : "0"); } catch (_) {} };

  function darPlay() {
    clearTimeout(reservaT);
    if (!ligado || !controller) return;
    tocarQuandoPronto = false;
    controller.play();
  }
  // Se o "ready" não vier, tenta tocar mesmo assim
  function playDeReserva() {
    clearTimeout(reservaT);
    reservaT = setTimeout(() => { if (tocarQuandoPronto) darPlay(); }, 2500);
  }

  function carregarApi() {
    if (controller || carregandoApi) return;
    carregandoApi = true;
    window.onSpotifyIframeApiReady = api => {
      api.createController($("#trilhaAlvo"), { uri: uriAtual, width: "100%", height: 80 }, c => {
        controller = c;
        uriCarregada = uriAtual;
        c.addListener("ready", () => { if (tocarQuandoPronto) darPlay(); });
        playDeReserva();
      });
    };
    const s = document.createElement("script");
    s.src = "https://open.spotify.com/embed/iframe-api/v1";
    s.async = true;
    s.onerror = () => { carregandoApi = false; aviso("Não consegui carregar o player do Spotify."); };
    document.body.appendChild(s);
  }

  function tocar() {
    if (!ligado || !uriAtual) return;
    tocarQuandoPronto = true;
    if (!controller) { carregarApi(); return; }
    if (uriCarregada !== uriAtual) {
      uriCarregada = uriAtual;
      controller.loadUri(uriAtual);
      playDeReserva();
    } else darPlay();
  }

  function atualizarUI() {
    const dock = $("#trilhaDock"), btn = $("#trilhaBtn");
    dock.dataset.ligado = ligado;
    btn.setAttribute("aria-pressed", ligado);
    btn.textContent = ligado ? "⏸ Desligar" : "🎧 Trilha automática";
    btn.hidden = ligado;
    $("#trilhaPlayer").hidden = !ligado;
  }

  function alternar() {
    ligado = !ligado;
    salvarPref(ligado);
    atualizarUI();
    if (ligado) tocar();
    else { tocarQuandoPronto = false; clearTimeout(reservaT); if (controller) controller.pause(); }
  }

  function atualizar(it) {
    itemAtual = it;
    uriAtual = it ? uriSpotify(it.spotify) : "";
    if (!ativo) return;
    atualizarUI();
    if (!uriAtual) { if (controller) controller.pause(); return; }
    if (ligado && controller) tocar();
  }

  function iniciar() {
    if (Som.ativo || !ITENS.some(i => i.spotify)) return; // MP3 do bloco tem prioridade
    ativo = true;
    $("#trilhaDock").hidden = false;
    $("#trilhaBtn").onclick = alternar;
    $("#trilhaFechar").onclick = alternar;
    ligado = lerPref();
    atualizarUI();
    if (ligado) {
      const primeiroToque = e => {
        document.removeEventListener("pointerdown", primeiroToque, true);
        document.removeEventListener("keydown", primeiroToque, true);
        if (e.target.closest && e.target.closest("#trilhaBtn, #trilhaFechar")) return;
        tocar();
      };
      document.addEventListener("pointerdown", primeiroToque, true);
      document.addEventListener("keydown", primeiroToque, true);
    }
  }

  return { iniciar, atualizar };
})();

let observador = null;
function observarBlocos() {
  if (!Som.ativo || !("IntersectionObserver" in window)) return;
  if (observador) observador.disconnect();
  observador = new IntersectionObserver(entradas => {
    entradas.forEach(e => { if (e.isIntersecting) Som.tocar(Number(e.target.dataset.bloco)); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  document.querySelectorAll(".bloco").forEach(s => observador.observe(s));
}

// Google Analytics (só com consentimento)
const PREF_ANALYTICS = "maratona-analytics";
function lerConsentimento() { try { return localStorage.getItem(PREF_ANALYTICS); } catch (_) { return null; } }
function salvarConsentimento(v) { try { localStorage.setItem(PREF_ANALYTICS, v); } catch (_) {} }
function carregarGTM() {
  if (window.__gtmCarregado) return;
  window.__gtmCarregado = true;
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  const s = document.createElement("script");
  s.async = true;
  s.src = "https://www.googletagmanager.com/gtm.js?id=" + encodeURIComponent(CFG.gtm);
  document.head.appendChild(s);
}
function apagarCookiesAnalytics() {
  const dominios = ["", location.hostname, "." + location.hostname.replace(/^www\./, "")];
  document.cookie.split(";").map(c => c.split("=")[0].trim()).filter(n => /^_ga|^_gid|^_gat/.test(n)).forEach(n => {
    dominios.forEach(d => { document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${d ? "; domain=" + d : ""}`; });
  });
}
function iniciarAnalytics() {
  if (!CFG.gtm) return;
  const caixa = $("#avisoCookies"), btnPref = $("#btnCookies");
  btnPref.hidden = false;
  const escolher = aceitou => {
    const antes = lerConsentimento();
    salvarConsentimento(aceitou ? "sim" : "nao");
    caixa.hidden = true;
    if (aceitou) { carregarGTM(); return; }
    apagarCookiesAnalytics();
    if (antes === "sim" && window.__gtmCarregado) { aviso("Pronto! O Google Analytics foi desligado."); setTimeout(() => location.reload(), 1200); }
  };
  $("#cookiesAceitar").onclick = () => escolher(true);
  $("#cookiesRecusar").onclick = () => escolher(false);
  $("#cookiesSaibaMais").onclick = e => { e.preventDefault(); const p = document.querySelector(".privacidade"); p.open = true; p.scrollIntoView({ behavior: "smooth", block: "center" }); };
  btnPref.onclick = () => { caixa.hidden = false; };
  const c = lerConsentimento();
  if (c === "sim") carregarGTM();
  else if (c !== "nao") caixa.hidden = false;
}

// apoie a maratona (Pix)
function iniciarApoio() {
  if (!CFG.pixCopiaECola) return;
  $("#btnApoiar").hidden = false;
  $("#btnApoiar").onclick = abrirApoio;
}
function abrirApoio() {
  const d = $("#dlgApoiar");
  d.innerHTML = `
    <div class="dlg-cab">
      <button class="fechar" type="button" aria-label="Fechar">✕</button>
      <h2>Apoie a maratona</h2>
      <p>O site é gratuito e feito por um fã.</p>
    </div>
    <div class="dlg-corpo apoio">
      <p>Se quiser ajudar, sua doação vai pra manter o site no ar (domínio e serviços) e pras próximas melhorias. Qualquer valor ajuda, e doar é totalmente opcional: o site continua igual pra todo mundo.</p>
      <div class="pix-qr" role="img" aria-label="QR Code do Pix"></div>
      <label for="pixCodigo">Pix copia e cola</label>
      <textarea id="pixCodigo" class="pix-codigo" readonly rows="3"></textarea>
      <button class="btn alt grande" type="button" data-a="copiar">Copiar código Pix</button>
      <p class="msg" aria-live="polite"></p>
      <p class="pix-nota">Na hora de confirmar, o app do banco mostra o nome de quem recebe. A doação não dá nenhuma vantagem no site.</p>
    </div>`;
  const codigo = CFG.pixCopiaECola;
  d.querySelector("#pixCodigo").value = codigo;
  try {
    const qr = qrcode(0, "M");
    qr.addData(codigo);
    qr.make();
    d.querySelector(".pix-qr").innerHTML = qr.createSvgTag({ cellSize: 4, margin: 3, scalable: true });
  } catch (_) { d.querySelector(".pix-qr").hidden = true; }
  const msg = d.querySelector(".msg");
  d.querySelector('[data-a="copiar"]').onclick = async () => {
    try { await navigator.clipboard.writeText(codigo); }
    catch (_) { const t = d.querySelector("#pixCodigo"); t.select(); document.execCommand("copy"); }
    msg.textContent = "Código copiado! Agora é só colar na área Pix do app do seu banco. Valeu demais! 🍿";
  };
  d.querySelector(".fechar").onclick = () => d.close();
  d.showModal();
}

// card pros stories
async function gerarCard() {
  try { await Promise.all([document.fonts.load("100px Bangers"), document.fonts.load("800 40px Archivo")]); } catch (_) {}
  if (!estado.eventos.compartilhou) { estado.eventos.compartilhou = Date.now(); persistir(); avaliarConquistas(); }
  const W = 1080, H = 1920, INK = "#161A3A", GOLD = "#F5B82E";
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const g = cv.getContext("2d");
  g.fillStyle = "#E23636"; g.fillRect(0, 0, W, H);
  g.fillStyle = "rgba(0,0,0,.16)";
  for (let y = 0; y < H; y += 28) for (let x = (y / 28 % 2) * 14; x < W; x += 28) {
    g.beginPath(); g.arc(x, y, 2 + 6 * (y / H), 0, Math.PI * 2); g.fill();
  }
  const caixa = (x, y, w, h, fundo, sombra) => {
    g.fillStyle = sombra; g.fillRect(x + 16, y + 16, w, h);
    g.fillStyle = fundo; g.fillRect(x, y, w, h);
    g.lineWidth = 8; g.strokeStyle = INK; g.strokeRect(x, y, w, h);
  };
  const texto = (t, x, y, tam, cor, o = {}) => {
    g.font = o.corpo ? `800 ${tam}px Archivo, Arial, sans-serif` : `${tam}px Bangers, Impact, sans-serif`;
    g.textAlign = o.alinhar || "center";
    g.lineJoin = "round";
    if (o.contorno) { g.lineWidth = o.contorno; g.strokeStyle = INK; g.strokeText(t, x, y, o.max); }
    g.fillStyle = cor; g.fillText(t, x, y, o.max);
  };
  const v = totalVistos(), tot = ITENS.length, p = tot ? v / tot : 0;
  texto("MINHA MARATONA", W / 2, 200, 96, "#fff", { contorno: 16 });
  texto("RUMO AO", W / 2, 350, 150, GOLD, { contorno: 20 });
  texto("DOUTOR DESTINO", W / 2, 500, 150, GOLD, { contorno: 20, max: W - 100 });
  caixa(90, 590, W - 180, 430, "#fff", INK);
  texto(`${v}/${tot}`, W / 2, 840, 240, INK);
  texto("filmes e séries vistos", W / 2, 910, 46, INK, { corpo: true });
  g.fillStyle = "#E9ECF5"; g.fillRect(160, 945, W - 320, 44);
  g.fillStyle = GOLD; g.fillRect(160, 945, (W - 320) * p, 44);
  g.lineWidth = 6; g.strokeStyle = INK; g.strokeRect(160, 945, W - 320, 44);
  const feitas = CONQ.filter(q => estado.conquistas[q.id]).sort((a, b) => estado.conquistas[b.id] - estado.conquistas[a.id]);
  caixa(90, 1090, W - 180, 540, INK, GOLD);
  texto(`${feitas.length} de ${CONQ.length} conquistas`, W / 2, 1185, 76, GOLD);
  if (feitas.length) {
    feitas.slice(0, 4).forEach((q, k) => {
      const y = 1290 + k * 92;
      g.font = "58px sans-serif"; g.textAlign = "left"; g.fillStyle = "#fff"; g.fillText(q.icone, 150, y + 8);
      texto(q.nome, 240, y, 48, "#fff", { corpo: true, alinhar: "left", max: W - 340 });
    });
  } else texto("A primeira está logo ali!", W / 2, 1360, 50, "#fff", { corpo: true });
  const d = diasRestantes();
  texto(d > 0 ? `Faltam ${d} dias pra estreia` : "Estreou! Bora pro cinema", W / 2, 1745, 70, "#fff", { contorno: 12 });
  const url = (CFG.siteUrl || location.origin + location.pathname).replace(/^https?:\/\//, "").replace(/\/$/, "");
  texto(url, W / 2, 1835, 42, "#fff", { corpo: true, max: W - 120 });

  const blob = await new Promise(r => cv.toBlob(r, "image/png"));
  if (!blob) { aviso("Não consegui gerar o card neste navegador."); return; }
  const arquivo = new File([blob], "minha-maratona.png", { type: "image/png" });
  if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
    try { await navigator.share({ files: [arquivo], title: "Minha maratona", text: `Bora maratonar comigo? ${CFG.siteUrl || location.href}` }); return; }
    catch (e) { if (e && e.name === "AbortError") return; }
  }
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "minha-maratona.png";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
  aviso("Card baixado! É só postar nos stories.");
}

// controles
function iniciarUI() {
  // link direto pra aba Essenciais (?filtro=essenciais), usado pela página dos essenciais
  if (new URLSearchParams(location.search).get("filtro") === "essenciais") {
    filtro = "essenciais";
    document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x.dataset.f === "essenciais"));
  }
  document.querySelectorAll(".seg button").forEach(b => b.addEventListener("click", () => {
    filtro = b.dataset.f;
    document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x === b));
    render();
  }));
  document.querySelectorAll(".chips button").forEach(b => b.addEventListener("click", () => {
    frOn[b.dataset.fr] = !frOn[b.dataset.fr];
    b.setAttribute("aria-pressed", frOn[b.dataset.fr]);
    render();
  }));
  $("#btnConquistas").onclick = () => { renderConquistas(); $("#dlgConquistas").showModal(); };
  $("#btnCard").onclick = gerarCard;
  $("#btnProximo").onclick = () => {
    const soEss = filtro === "essenciais";
    const it = ITENS.find(i => !visto(i.id) && (!soEss || i.essencial));
    if (!it) { aviso(soEss ? "Você já viu todos os essenciais!" : "Você já viu tudo!"); return; }
    if ((filtro !== "todos" && !soEss) || !frOn[it.franquia]) {
      filtro = "todos";
      Object.keys(frOn).forEach(k => { frOn[k] = true; });
      document.querySelectorAll(".seg button").forEach(x => x.setAttribute("aria-pressed", x.dataset.f === "todos"));
      document.querySelectorAll(".chips button").forEach(x => x.setAttribute("aria-pressed", true));
      render();
    }
    const el = document.getElementById("item-" + it.id);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    el.classList.remove("foco"); void el.offsetWidth; el.classList.add("foco");
  };
  let armado = false, armadoT;
  $("#btnReset").onclick = e => {
    const b = e.currentTarget;
    if (!armado) {
      armado = true; b.textContent = "Toque de novo pra desmarcar tudo";
      armadoT = setTimeout(() => { armado = false; b.textContent = "Recomeçar"; }, 3500);
      return;
    }
    clearTimeout(armadoT); armado = false; b.textContent = "Recomeçar";
    estado.vistos = {};
    persistir(); render(); atualizarPainel();
    aviso("Marcações apagadas. Suas conquistas continuam!");
  };
  let armadoApagar = false, armadoApagarT;
  $("#btnApagarDados").onclick = async e => {
    const b = e.currentTarget;
    if (!armadoApagar) {
      armadoApagar = true;
      b.textContent = sessao ? "Toque de novo pra apagar a conta e tudo" : "Toque de novo pra apagar tudo";
      armadoApagarT = setTimeout(() => { armadoApagar = false; b.textContent = "Apagar meus dados"; }, 4000);
      return;
    }
    clearTimeout(armadoApagarT); armadoApagar = false;
    b.disabled = true; b.textContent = "Apagando...";
    await apagarDados();
    b.disabled = false; b.textContent = "Apagar meus dados";
  };
  ["#dlgDetalhe", "#dlgConquistas", "#dlgLogin", "#dlgApoiar"].forEach(s => {
    const d = $(s);
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
  });
}

// início
async function iniciar() {
  iniciarUI();
  try { ITENS = await carregarDados(); }
  catch (_) {
    $("#lista").innerHTML = `<p class="vazio">Não consegui carregar a lista. Se abriu o arquivo direto do computador, rode um servidor local (veja o LEIA-ME).</p>`;
    return;
  }
  ITENS.forEach(i => { POR_ID[i.id] = i; });
  await carregarSpotify();
  render();
  atualizarPainel();
  avaliarConquistas(true);
  Som.iniciar();
  TrilhaFilme.iniciar();
  TrilhaFilme.atualizar(ITENS.find(i => !visto(i.id)) || null);
  observarBlocos();
  iniciarVisitas();
  iniciarApoio();
  iniciarAnalytics();
  iniciarNuvem();
}
iniciar();
})();
