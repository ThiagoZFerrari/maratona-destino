window.MARATONA_CONFIG = {

  // Endereço do site (link do e-mail de login e card dos stories)
  siteUrl: "https://maratonamultiverso.com.br/",

  // Supabase (Project Settings > API). A anon key pode ser pública: quem protege é o schema.sql
  supabaseUrl: "https://zmfkmzyhwcpoqzrkgcjm.supabase.co",
  supabaseAnonKey: "sb_publishable_RjVt8zfYR4QPIXTUzDYSsQ_7Piy4nfI",

  // Cloudflare Turnstile (anti-robô no login): só a Site Key, que é pública. Vazio desliga.
  // A Secret Key vai no Supabase (Authentication > Attack Protection), nunca aqui
  turnstileSiteKey: "0x4AAAAAAGUpWTaHD4vmm1Ta",

  // GoatCounter: só o código do painel (ex.: "maratona")
  goatcounter: "",

  // Pix copia e cola (chave aleatória, sem valor). Vazio esconde o botão
  pixCopiaECola: "00020126580014BR.GOV.BCB.PIX0136843f32bc-6298-4341-889f-baad685d900d5204000053039865802BR5924Thiago Zimermann Ferrari6009SAO PAULO62140510dlf3NPc2uZ6304DE32",

  // Google Tag Manager. Só carrega se aceitar os cookies; vazio desliga
  gtm: "GTM-PH8SFDGN",

  // Trilha por bloco: musica = MP3 em /musica, spotify = link de playlist ou álbum
  blocos: {
    1: { musica: "", spotify: "" },
    2: { musica: "", spotify: "" },
    3: { musica: "", spotify: "" },
    4: { musica: "", spotify: "" },
    5: { musica: "", spotify: "" },
    6: { musica: "", spotify: "" },
    7: { musica: "", spotify: "" }
  }
};
