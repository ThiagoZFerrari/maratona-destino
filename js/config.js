window.MARATONA_CONFIG = {

  // Endereço final do site (usado no link do e-mail de login e no card dos stories)
  // Ex.: "https://seuusuario.github.io/maratona-destino/"
  siteUrl: "https://maratonamultiverso.com.br/",

  // ---- Supabase (login + salvar conquistas na nuvem + estatísticas da comunidade)
  // Pegue em: Supabase > Project Settings > API
  // A "anon key" pode ficar pública, a segurança é feita pelas regras do schema.sql
  supabaseUrl: "https://zmfkmzyhwcpoqzrkgcjm.supabase.co",
  supabaseAnonKey: "sb_publishable_RjVt8zfYR4QPIXTUzDYSsQ_7Piy4nfI",

  // ---- GoatCounter (contador de acessos)
  // Se o seu painel é https://maratona.goatcounter.com, coloque só "maratona"
  goatcounter: "",

  // ---- Doação por Pix (deixe vazio pra esconder o botão "Apoie a maratona")
  // Cole aqui o código "Pix copia e cola" gerado no app do banco, com CHAVE ALEATÓRIA e sem valor definido.
  // O QR Code é gerado automaticamente a partir desse código.
  pixCopiaECola: "00020126580014BR.GOV.BCB.PIX0136843f32bc-6298-4341-889f-baad685d900d5204000053039865802BR5924Thiago Zimermann Ferrari6009SAO PAULO62140510dlf3NPc2uZ6304DE32",

  // ---- Trilha de cada bloco
  // musica: arquivo MP3 livre de direitos dentro da pasta /musica (ex.: "musica/bloco1.mp3")
  // spotify: link de playlist/álbum do Spotify (ex.: "https://open.spotify.com/playlist/...")
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
