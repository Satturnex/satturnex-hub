-- Satturnex Hub — diagnóstico read-only para revisão pré-migração.
-- Execute no SQL Editor do projeto explicitamente selecionado. Não altera objetos.
-- Compatível com PostgreSQL/Supabase; não expõe e-mails nem tokens.

-- 1. Existência, tipo, dono e estado RLS das relações-alvo (inclusive ausentes).
with wanted(schema_name, object_name) as (
  values ('public', 'profiles'), ('public', 'admin_audit_log')
)
select w.schema_name, w.object_name, c.relkind,
       pg_get_userbyid(c.relowner) as owner,
       c.relrowsecurity as rls_enabled,
       c.relforcerowsecurity as force_rls
from wanted w
left join pg_namespace n on n.nspname = w.schema_name
left join pg_class c on c.relnamespace = n.oid and c.relname = w.object_name
order by w.object_name;

-- 2. Colunas, tipos, nulabilidade e defaults.
select table_name, ordinal_position, column_name, data_type,
       udt_schema, udt_name, is_nullable, column_default
from information_schema.columns
where table_schema = 'public'
  and table_name in ('profiles', 'admin_audit_log')
order by table_name, ordinal_position;

-- 3. Constraints e índices das tabelas caso existam.
select n.nspname || '.' || c.relname as table_name,
       con.conname, con.contype, con.convalidated,
       pg_get_constraintdef(con.oid, true) as definition
from pg_constraint con
join pg_class c on c.oid = con.conrelid
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles', 'admin_audit_log')
order by table_name, con.conname;

select n.nspname || '.' || t.relname as table_name,
       i.relname as index_name, ix.indisprimary, ix.indisunique,
       pg_get_indexdef(i.oid) as definition
from pg_index ix
join pg_class t on t.oid = ix.indrelid
join pg_class i on i.oid = ix.indexrelid
join pg_namespace n on n.oid = t.relnamespace
where n.nspname = 'public' and t.relname in ('profiles', 'admin_audit_log')
order by table_name, index_name;

-- 4. Triggers ativos/inativos em auth.users e nas tabelas relacionadas.
-- A consulta revela todos os triggers em auth.users para detectar colisões.
select n.nspname || '.' || c.relname as table_name, t.tgname,
       t.tgenabled, pg_get_userbyid(p.proowner) as function_owner,
       p.prosecdef as function_security_definer,
       pg_get_triggerdef(t.oid, true) as definition
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
join pg_namespace n on n.oid = c.relnamespace
join pg_proc p on p.oid = t.tgfoid
where not t.tgisinternal
  and ((n.nspname = 'auth' and c.relname = 'users')
       or (n.nspname = 'public' and c.relname in ('profiles', 'admin_audit_log')))
order by table_name, t.tgname;

-- 5. Policies: papel-alvo, permissividade, comando e expressões.
select schemaname, tablename, policyname, permissive, roles, cmd,
       qual as using_expression, with_check as with_check_expression
from pg_policies
where schemaname = 'public' and tablename in ('profiles', 'admin_audit_log')
order by tablename, policyname;

-- 6. Grants explícitos em tabela e coluna; inclua PUBLIC como grantee.
select table_schema, table_name, grantee, privilege_type, is_grantable
from information_schema.table_privileges
where table_schema = 'public' and table_name in ('profiles', 'admin_audit_log')
order by table_name, grantee, privilege_type;

select table_schema, table_name, column_name, grantee,
       privilege_type, is_grantable
from information_schema.column_privileges
where table_schema = 'public' and table_name in ('profiles', 'admin_audit_log')
order by table_name, column_name, grantee, privilege_type;

-- 7. Dono, ACL efetiva (inclusive ACL padrão), SECURITY DEFINER e search_path
-- para funções com os nomes da migração em qualquer schema.
select n.nspname as function_schema,
       p.oid::regprocedure as function_identity,
       pg_get_userbyid(p.proowner) as owner,
       p.prosecdef as security_definer,
       p.proconfig as function_settings,
       p.proacl as explicit_acl,
       coalesce(p.proacl, acldefault('f', p.proowner)) as effective_acl,
       pg_get_functiondef(p.oid) as definition
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname in ('current_app_role', 'create_profile_for_new_user',
                    'set_managed_user_role')
order by n.nspname, function_identity::text;

-- 8. Outros objetos com nomes usados pela migração em todos os schemas.
select n.nspname as schema_name, c.relname as object_name,
       c.relkind as object_kind, pg_get_userbyid(c.relowner) as owner
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relname in ('profiles', 'admin_audit_log')
order by c.relname, n.nspname;

select n.nspname as schema_name, p.proname as function_name,
       p.oid::regprocedure as function_identity,
       pg_get_userbyid(p.proowner) as owner, p.prosecdef as security_definer
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where p.proname in ('current_app_role', 'create_profile_for_new_user',
                    'set_managed_user_role')
order by p.proname, n.nspname, function_identity::text;

-- 9. Permissões do schema public relevantes para resolução segura de nomes.
select n.nspname, pg_get_userbyid(n.nspowner) as owner,
       coalesce(bool_or(a.grantee = 0 and a.privilege_type = 'USAGE'), false) as public_usage_grant,
       coalesce(bool_or(a.grantee = 0 and a.privilege_type = 'CREATE'), false) as public_create_grant,
       has_schema_privilege('anon', n.oid, 'USAGE') as anon_usage,
       has_schema_privilege('anon', n.oid, 'CREATE') as anon_create,
       has_schema_privilege('authenticated', n.oid, 'USAGE') as authenticated_usage,
       has_schema_privilege('authenticated', n.oid, 'CREATE') as authenticated_create
from pg_namespace n
left join lateral aclexplode(coalesce(n.nspacl, acldefault('n', n.nspowner))) a on true
where n.nspname in ('public', 'auth')
group by n.nspname, n.nspowner, n.oid
order by n.nspname;

-- 10. Distribuição agregada dos papéis e inconsistências, sem identificadores.
-- Execute esta seção somente se os catálogos acima confirmarem ambas as tabelas.
select role, count(*) as profile_count
from public.profiles
group by role
order by role;

select count(*) as auth_user_count from auth.users;

select count(*) as profiles_without_auth_user
from public.profiles p
left join auth.users u on u.id = p.id
where u.id is null;

-- 11. Disponibilidade das roles Supabase esperadas.
select rolname, rolsuper, rolcreaterole, rolcanlogin
from pg_roles
where rolname in ('anon', 'authenticated', 'service_role', 'postgres')
order by rolname;
