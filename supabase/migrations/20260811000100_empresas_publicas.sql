create table if not exists public.empresas_publicas (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  nome text not null,
  sigla text not null default '',
  cidade text not null default '',
  descricao text not null default '',
  banner text,
  rotas jsonb not null default '[]'::jsonb,
  horarios jsonb not null default '[]'::jsonb,
  frota jsonb not null default '[]'::jsonb,
  servicos jsonb not null default '[]'::jsonb,
  telefone text not null default '',
  whatsapp text not null default '',
  contato_email text not null default '',
  atualizado_em timestamptz not null default now()
);

create unique index if not exists empresas_publicas_email_lower_idx
  on public.empresas_publicas (lower(email));

alter table public.empresas_publicas enable row level security;

drop policy if exists "Public can read published company profiles" on public.empresas_publicas;
create policy "Public can read published company profiles"
  on public.empresas_publicas for select
  using (true);

drop policy if exists "Owners can insert their company profile" on public.empresas_publicas;
create policy "Owners can insert their company profile"
  on public.empresas_publicas for insert
  to authenticated
  with check (auth.uid() = user_id and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

drop policy if exists "Owners can update their company profile" on public.empresas_publicas;
create policy "Owners can update their company profile"
  on public.empresas_publicas for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id and lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

create or replace function public.touch_empresas_publicas_atualizado_em()
returns trigger
language plpgsql
as $$
begin
  new.atualizado_em = now();
  return new;
end;
$$;

drop trigger if exists empresas_publicas_touch on public.empresas_publicas;
create trigger empresas_publicas_touch
before update on public.empresas_publicas
for each row execute function public.touch_empresas_publicas_atualizado_em();
