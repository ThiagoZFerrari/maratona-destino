-- Banco da Maratona Destino (rodar no SQL Editor do Supabase)

-- Uma linha por usuário com o progresso e as conquistas
create table if not exists public.progresso (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  vistos        jsonb not null default '{}'::jsonb,   -- { "homem-de-ferro": 1727700000000, ... }
  conquistas    jsonb not null default '{}'::jsonb,   -- { "primeiro-passo": 1727700000000, ... }
  eventos       jsonb not null default '{}'::jsonb,   -- { "compartilhou": ..., "nuvem": ... }
  atualizado_em timestamptz not null default now()
);

-- Segurança: cada pessoa só lê e escreve a própria linha
alter table public.progresso enable row level security;

drop policy if exists "ler o próprio progresso" on public.progresso;
create policy "ler o próprio progresso" on public.progresso
  for select using (auth.uid() = user_id);

drop policy if exists "criar o próprio progresso" on public.progresso;
create policy "criar o próprio progresso" on public.progresso
  for insert with check (auth.uid() = user_id);

drop policy if exists "atualizar o próprio progresso" on public.progresso;
create policy "atualizar o próprio progresso" on public.progresso
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Estatísticas públicas (só números agregados)
create or replace function public.estatisticas(total int default 77)
returns json
language sql
security definer
set search_path = public
stable
as $$
  select json_build_object(
    'maratonistas', (select count(*) from progresso),
    'completaram',  (select count(*) from progresso p
                      where (select count(*) from jsonb_object_keys(p.vistos)) >= total),
    'por_item',     coalesce((select json_object_agg(k, c) from (
                        select k, count(*) as c from progresso, jsonb_object_keys(vistos) as k group by k
                      ) s), '{}'::json),
    'por_conquista', coalesce((select json_object_agg(k, c) from (
                        select k, count(*) as c from progresso, jsonb_object_keys(conquistas) as k group by k
                      ) s), '{}'::json)
  );
$$;

revoke all on function public.estatisticas(int) from public;
grant execute on function public.estatisticas(int) to anon, authenticated;

-- LGPD: apaga a conta de quem está logado e, em cascata, o progresso
create or replace function public.apagar_minha_conta()
returns void
language sql
security definer
set search_path = ''
as $$
  delete from auth.users where id = auth.uid();
$$;

revoke all on function public.apagar_minha_conta() from public, anon;
grant execute on function public.apagar_minha_conta() to authenticated;

-- Limite de tamanho pra ninguém lotar o banco
alter table public.progresso drop constraint if exists progresso_tamanho;
alter table public.progresso add constraint progresso_tamanho check (
  pg_column_size(vistos) < 16384 and pg_column_size(conquistas) < 16384 and pg_column_size(eventos) < 8192
);

-- O site não usa a rls_auto_enable do Supabase
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public, anon, authenticated;
  end if;
end $$;
