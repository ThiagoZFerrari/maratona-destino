// Tema de Natal: luzinhas, neve, enfeites, trenó e explosão de presentes ao marcar um filme.
// Pra desligar o tema, é só tirar as linhas do natal.css e do natal.js no index.html
(() => {
  const html = document.documentElement;
  html.classList.add("natal");

  const $ = s => document.querySelector(s);
  const sorteio = (a, b) => a + Math.random() * (b - a);
  const escolher = lista => lista[Math.floor(Math.random() * lista.length)];
  const reduzirMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const PREF = "maratona-natal-neve";
  const lerPref = () => { try { const v = localStorage.getItem(PREF); return v === null ? !reduzirMovimento : v === "1"; } catch (_) { return !reduzirMovimento; } };
  const salvarPref = v => { try { localStorage.setItem(PREF, v ? "1" : "0"); } catch (_) {} };

  function criar(tag, classe, conteudo) {
    const el = document.createElement(tag);
    if (classe) el.className = classe;
    if (conteudo) el.innerHTML = conteudo;
    return el;
  }

  function aviso(msg) {
    const box = $("#toasts");
    if (!box) return;
    const el = criar("div", "toast");
    el.setAttribute("role", "status");
    el.textContent = msg;
    box.appendChild(el);
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("show")));
    setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 2800);
  }

  // luzinhas penduradas embaixo da barra do topo
  function luzes() {
    const barra = $(".topbar");
    if (!barra) return;
    const fio = criar("div", "natal-luzes");
    fio.setAttribute("aria-hidden", "true");
    const montar = () => {
      const n = Math.ceil(barra.clientWidth / 38) + 1;
      if (fio.childElementCount !== n) fio.innerHTML = "<i></i>".repeat(n);
    };
    montar();
    barra.appendChild(fio);
    let espera;
    addEventListener("resize", () => { clearTimeout(espera); espera = setTimeout(montar, 150); });
  }

  // gorro de Papai Noel na marca
  function gorro() {
    const marca = $(".marca");
    if (!marca) return;
    const g = criar("span", "natal-gorro", `<svg viewBox="0 0 64 56" aria-hidden="true">
      <path d="M8 44C12 22 26 6 44 8c10 1 16 10 14 22-4-6-10-8-14-4-4 6-4 14-2 18Z" fill="#E23636" stroke="#161A3A" stroke-width="3" stroke-linejoin="round"/>
      <rect x="4" y="40" width="44" height="12" rx="6" fill="#fff" stroke="#161A3A" stroke-width="3"/>
      <circle cx="57" cy="33" r="7" fill="#fff" stroke="#161A3A" stroke-width="3"/></svg>`);
    g.setAttribute("aria-hidden", "true");
    marca.prepend(g);
  }

  // bolas de Natal e brilhinhos no painel vermelho
  function enfeites() {
    const painel = $(".hero .panel");
    if (!painel) return;
    const bolas = [
      { right: "6%", l: "54px", s: "38px", c: "#F5B82E", t: "2.8s", d: "0s" },
      { right: "15%", l: "26px", s: "30px", c: "#2F7FD8", t: "3.4s", d: "-1.2s" },
      { right: "24%", l: "70px", s: "34px", c: "#1F8A4C", t: "3.1s", d: "-.6s" },
      { right: "33%", l: "38px", s: "26px", c: "#fff", t: "2.6s", d: "-1.8s" }
    ];
    const brilhos = [
      { left: "48%", top: "18%", s: "20px", d: "0s" }, { left: "70%", top: "62%", s: "16px", d: "-.8s" },
      { left: "88%", top: "78%", s: "22px", d: "-1.6s" }, { left: "58%", top: "40%", s: "14px", d: "-2s" },
      { left: "93%", top: "45%", s: "15px", d: "-1.1s" }
    ];
    const box = criar("div", "natal-enfeites");
    box.setAttribute("aria-hidden", "true");
    box.innerHTML =
      bolas.map(b => `<span class="bola" style="right:${b.right};--l:${b.l};--s:${b.s};--c:${b.c};--t:${b.t};--d:${b.d}"></span>`).join("") +
      brilhos.map(b => `<span class="brilho" style="left:${b.left};top:${b.top};--s:${b.s};--d:${b.d}">✦</span>`).join("");
    painel.prepend(box);
  }

  // quantos dias faltam pro Natal, ao lado da contagem da estreia
  function contagemNatal() {
    const primeiro = $(".hero .stat");
    if (!primeiro) return;
    const hoje = new Date(); hoje.setHours(0, 0, 0, 0);
    const natal = new Date(hoje.getFullYear(), 11, 25);
    const dias = Math.round((natal - hoje) / 86400000);
    if (dias < 0) return;
    const stat = criar("div", "stat natal-stat");
    stat.innerHTML = dias === 0 ? "<b>🎄</b><span>Feliz Natal!</span>" : `<b>${dias}</b><span>${dias === 1 ? "dia" : "dias"} pro Natal 🎄</span>`;
    primeiro.after(stat);

    const final = $(".final .panel");
    if (final) final.appendChild(criar("p", "natal-presente", "🎁 Este ano o presente de Natal chega 8 dias mais cedo!"));
  }

  // presentes e flocos voando de um ponto da tela
  function explosao(x, y, emojis, n = 16) {
    if (reduzirMovimento) return;
    for (let i = 0; i < n; i++) {
      const p = criar("span", "natal-particula");
      p.textContent = escolher(emojis);
      p.style.left = x + "px";
      p.style.top = y + "px";
      p.setAttribute("aria-hidden", "true");
      document.body.appendChild(p);
      const ang = -Math.PI / 2 + sorteio(-1, 1) * Math.PI * 0.6;
      const vel = sorteio(70, 190);
      const dx = Math.cos(ang) * vel, dy = Math.sin(ang) * vel, giro = sorteio(-260, 260);
      p.animate([
        { transform: "translate(-50%,-50%) scale(.3)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1.15) rotate(${giro / 2}deg)`, opacity: 1, offset: 0.55 },
        { transform: `translate(calc(-50% + ${dx * 1.25}px), calc(-50% + ${dy + 120}px)) scale(.7) rotate(${giro}deg)`, opacity: 0 }
      ], { duration: sorteio(900, 1400), easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => p.remove();
    }
  }

  // ao marcar um filme como visto, solta presentes do botão
  document.addEventListener("click", e => {
    const b = e.target.closest('.marcar, [data-a="marcar"]');
    if (!b) return;
    const vaiMarcar = b.matches(".marcar") ? b.getAttribute("aria-pressed") !== "true" : !/desmarcar/i.test(b.textContent);
    if (!vaiMarcar) return;
    const r = b.getBoundingClientRect();
    explosao(r.left + r.width / 2, r.top + r.height / 2, ["🎁", "❄️", "⭐", "🎄", "✨", "🔔", "🍪"]);
  }, true);

  // neve caindo, que foge do mouse
  const Neve = (() => {
    let canvas, ctx, W = 0, H = 0, flocos = [], rodando = false, quadro = 0, mx = -9999, my = -9999;

    const novo = doTopo => {
      const estrela = Math.random() < 0.12;
      const r = estrela ? sorteio(4, 7) : sorteio(1.2, 3.4);
      return {
        x: Math.random() * W, y: doTopo ? sorteio(-40, -5) : Math.random() * H, r, estrela,
        vy: 0.35 + r * sorteio(0.18, 0.32), vx: 0, fase: Math.random() * 6.28, amp: sorteio(0.2, 0.7),
        rot: Math.random() * 6.28, vr: sorteio(-0.02, 0.02), alfa: sorteio(0.7, 1)
      };
    };

    function medir() {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      W = innerWidth; H = innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const alvo = Math.min(170, Math.round(W * H / 9000));
      while (flocos.length < alvo) flocos.push(novo(false));
      flocos.length = alvo;
    }

    function desenharEstrela(f) {
      ctx.save();
      ctx.translate(f.x, f.y);
      ctx.rotate(f.rot);
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3, c = Math.cos(a), s = Math.sin(a);
        ctx.moveTo(0, 0); ctx.lineTo(c * f.r, s * f.r);
        const m = f.r * 0.55, p = f.r * 0.3;
        ctx.moveTo(c * m, s * m); ctx.lineTo(c * m + Math.cos(a + 0.8) * p, s * m + Math.sin(a + 0.8) * p);
        ctx.moveTo(c * m, s * m); ctx.lineTo(c * m + Math.cos(a - 0.8) * p, s * m + Math.sin(a - 0.8) * p);
      }
      ctx.lineCap = "round";
      ctx.strokeStyle = "rgba(22,26,58,.28)"; ctx.lineWidth = 3; ctx.stroke();
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5; ctx.stroke();
      ctx.restore();
    }

    function passo(t) {
      if (!rodando) return;
      ctx.clearRect(0, 0, W, H);
      const vento = Math.sin(t / 5000) * 0.45;
      for (const f of flocos) {
        f.fase += 0.012;
        const dx = f.x - mx, dy = f.y - my, d2 = dx * dx + dy * dy;
        if (d2 < 8100) {
          const d = Math.sqrt(d2) || 1, forca = (90 - d) / 90;
          f.vx += dx / d * forca * 1.4;
          f.y += dy / d * forca * 0.8;
        }
        f.vx *= 0.93;
        f.x += Math.sin(f.fase) * f.amp + vento + f.vx;
        f.y += f.vy;
        f.rot += f.vr;
        if (f.y > H + 10) Object.assign(f, novo(true));
        if (f.x < -10) f.x = W + 10; else if (f.x > W + 10) f.x = -10;

        ctx.globalAlpha = f.alfa;
        if (f.estrela) desenharEstrela(f);
        else {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, 6.283);
          ctx.fillStyle = "#fff"; ctx.fill();
          ctx.strokeStyle = "rgba(22,26,58,.22)"; ctx.lineWidth = 0.8; ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      quadro = requestAnimationFrame(passo);
    }

    function ligar() {
      if (!canvas) {
        canvas = criar("canvas", "natal-neve");
        canvas.setAttribute("aria-hidden", "true");
        document.body.appendChild(canvas);
        ctx = canvas.getContext("2d");
        addEventListener("resize", () => canvas && !canvas.hidden && medir());
        addEventListener("pointermove", e => { mx = e.clientX; my = e.clientY; }, { passive: true });
        document.addEventListener("pointerleave", () => { mx = my = -9999; });
        document.addEventListener("visibilitychange", () => {
          if (canvas.hidden) return;
          if (document.hidden) { rodando = false; cancelAnimationFrame(quadro); }
          else if (!rodando) { rodando = true; quadro = requestAnimationFrame(passo); }
        });
      }
      canvas.hidden = false;
      medir();
      if (!rodando) { rodando = true; quadro = requestAnimationFrame(passo); }
    }

    function desligar() {
      rodando = false;
      cancelAnimationFrame(quadro);
      if (canvas) canvas.hidden = true;
    }

    return { ligar, desligar };
  })();

  // trenó do Papai Noel cruzando a tela de vez em quando; clicar nele solta presentes
  const Treno = (() => {
    let ativo = false, agendado = 0;

    function voar() {
      if (!ativo || document.hidden) return agendar();
      const t = criar("button", "natal-treno", "<span>🦌</span><span>🦌</span><span>🛷</span>");
      t.type = "button";
      t.setAttribute("aria-label", "Trenó do Papai Noel");
      document.body.appendChild(t);
      const y = innerHeight * sorteio(0.12, 0.38), duracao = sorteio(11000, 15000);
      const anim = t.animate([
        { transform: `translate(${innerWidth + 40}px, ${y}px)` },
        { transform: `translate(${innerWidth * 0.5}px, ${y - 40}px)`, offset: 0.5 },
        { transform: `translate(-200px, ${y + 10}px)` }
      ], { duration: duracao, easing: "linear" });

      const rastro = setInterval(() => {
        const r = t.getBoundingClientRect();
        const s = criar("span", "natal-rastro");
        s.textContent = escolher(["✨", "⭐", "❄️"]);
        s.style.left = (r.right - 10) + "px";
        s.style.top = (r.top + r.height / 2 + sorteio(-8, 8)) + "px";
        document.body.appendChild(s);
        s.animate([{ opacity: 1, transform: "scale(1)" }, { opacity: 0, transform: `translateY(${sorteio(20, 50)}px) scale(.3)` }],
          { duration: 1100, easing: "ease-out" }).onfinish = () => s.remove();
      }, 160);

      t.addEventListener("click", () => {
        const r = t.getBoundingClientRect();
        explosao(r.left + r.width / 2, r.top + r.height / 2, ["🎁", "🎁", "🍬", "🧸", "⭐"], 22);
        aviso("🎅 Ho ho ho! Feliz Natal, maratonista!");
      });

      anim.onfinish = () => { clearInterval(rastro); t.remove(); agendar(); };
    }

    function agendar(espera = sorteio(35000, 60000)) {
      clearTimeout(agendado);
      if (ativo) agendado = setTimeout(voar, espera);
    }

    return {
      ligar() { if (!ativo) { ativo = true; agendar(6000); } },
      desligar() { ativo = false; clearTimeout(agendado); }
    };
  })();

  // botão ❄️ no topo pra ligar e desligar a neve e o trenó
  function botaoNeve() {
    const acoes = $(".topbar-acoes");
    const b = criar("button", "btn pequeno natal-toggle", "❄️");
    b.type = "button";
    const aplicar = ligado => {
      b.setAttribute("aria-pressed", String(ligado));
      b.setAttribute("aria-label", ligado ? "Desligar a neve" : "Ligar a neve");
      b.title = b.getAttribute("aria-label");
      if (ligado) { Neve.ligar(); Treno.ligar(); } else { Neve.desligar(); Treno.desligar(); }
    };
    b.addEventListener("click", () => {
      const ligado = b.getAttribute("aria-pressed") !== "true";
      salvarPref(ligado);
      aplicar(ligado);
      if (ligado) { const r = b.getBoundingClientRect(); explosao(r.left + r.width / 2, r.top + r.height / 2, ["❄️", "✨"], 10); }
    });
    if (acoes) acoes.prepend(b);
    aplicar(lerPref());
  }

  luzes();
  gorro();
  enfeites();
  contagemNatal();
  botaoNeve();
})();
