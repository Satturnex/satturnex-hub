-- Satturnex Hub: fonte de papel e controles mínimos de perfil.
-- Revisão de segurança: executar somente após inspecionar objetos preexistentes.
begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  avatar_url text not null default '',
  role text not null default 'USER' check (role in ('OWNER', 'ADMIN', 'USER')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('ROLE_GRANTED', 'ROLE_REVOKED')),
  target_user_id uuid not null,
  previous_role text check (previous_role in ('OWNER', 'ADMIN', 'USER')),
  new_role text check (new_role in ('OWNER', 'ADMIN', 'USER')),
  created_at timestamptz not null default now()
);

-- RLS deve ser ativada antes das policies. Não usar FORCE RLS: funções abaixo
-- pertencem a postgres e precisam ler/escrever sem recursão de policy.
alter table public.profiles enable row level security;
alter table public.admin_audit_log enable row level security;

-- Uma policy permissiva preexistente pode ampliar acesso. Remova todas as
-- policies destas duas tabelas e instale o conjunto fechado desta migração.
do $$
declare p record;
begin
  for p in select schemaname, tablename, policyname from pg_catalog.pg_policies
           where schemaname = 'public' and tablename in ('profiles', 'admin_audit_log')
  loop
    execute format('drop policy %I on %I.%I', p.policyname, p.schemaname, p.tablename);
  end loop;
end;
$$;

create or replace function public.current_app_role()
returns text
language sql
stable
security definer
set search_path = pg_catalog, public
as $$
  select p.role from public.profiles as p where p.id = (select auth.uid())
$$;
alter function public.current_app_role() owner to postgres;
revoke all on function public.current_app_role() from public, anon;
grant execute on function public.current_app_role() to authenticated;

create policy profiles_read_self_or_admin
on public.profiles for select to authenticated
using (id = (select auth.uid()) or public.current_app_role() in ('OWNER', 'ADMIN'));

create policy profiles_update_self_personal_fields
on public.profiles for update to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', ''),
    'USER'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
alter function public.create_profile_for_new_user() owner to postgres;
revoke all on function public.create_profile_for_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- Backfill idempotente: nunca promove linhas existentes.
insert into public.profiles (id, full_name, avatar_url, role)
select u.id,
       coalesce(u.raw_user_meta_data ->> 'full_name', ''),
       coalesce(u.raw_user_meta_data ->> 'avatar_url', ''),
       'USER'
from auth.users as u
on conflict (id) do nothing;

create policy admin_audit_read_admin
on public.admin_audit_log for select to authenticated
using (public.current_app_role() in ('OWNER', 'ADMIN'));
revoke all on public.admin_audit_log from public, anon, authenticated;
grant select on public.admin_audit_log to authenticated;

create or replace function public.set_managed_user_role(p_target_user_id uuid, p_new_role text)
returns void
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_previous_role text;
  v_actor_id uuid := auth.uid();
begin
  if v_actor_id is null or public.current_app_role() is distinct from 'OWNER' then
    raise exception 'not authorized' using errcode = '42501';
  end if;
  if p_target_user_id is null or p_new_role is null or p_new_role not in ('USER', 'ADMIN') then
    raise exception 'invalid target role' using errcode = '22023';
  end if;

  select p.role into v_previous_role
    from public.profiles as p where p.id = p_target_user_id for update;
  if not found then raise exception 'profile not found' using errcode = 'P0002'; end if;
  if v_previous_role = 'OWNER' then
    raise exception 'owner role is protected' using errcode = '42501';
  end if;

  -- Idempotência sem evento espúrio nem alteração de updated_at.
  if v_previous_role = p_new_role then return; end if;

  update public.profiles set role = p_new_role, updated_at = now()
    where id = p_target_user_id;
  insert into public.admin_audit_log (actor_id, action, target_user_id, previous_role, new_role)
  values (v_actor_id,
          case when p_new_role = 'ADMIN' then 'ROLE_GRANTED' else 'ROLE_REVOKED' end,
          p_target_user_id, v_previous_role, p_new_role);
end;
$$;
alter function public.set_managed_user_role(uuid, text) owner to postgres;
revoke all on function public.set_managed_user_role(uuid, text) from public, anon;
grant execute on function public.set_managed_user_role(uuid, text) to authenticated;

commit;
