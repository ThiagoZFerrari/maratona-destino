// ============================================================
//  CONFIGURAÇÃO DO SITE — é só este arquivo que você precisa editar
//  Tudo aqui é opcional: o que ficar vazio, o site só esconde.
// ============================================================
window.MARATONA_CONFIG = {

  // Endereço final do site (usado no link do e-mail de login e no card dos stories)
  // Ex.: "https://seuusuario.github.io/maratona-destino/"
  siteUrl: "",

  // ---- Supabase (login + salvar conquistas na nuvem + estatísticas da comunidade)
  // Pegue em: Supabase > Project Settings > API
  // A "anon key" pode ficar pública, a segurança é feita pelas regras do schema.sql
  supabaseUrl: "",
  supabaseAnonKey: "",

  // ---- GoatCounter (contador de acessos)
  // Se o seu painel é https://maratona.goatcounter.com, coloque só "maratona"
  goatcounter: "",

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
