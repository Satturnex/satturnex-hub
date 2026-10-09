# Autorização administrativa (Etapa 4)

## Estado auditado

O repositório não contém migrações, schema exportado ou integração com banco além de Supabase Auth. O README anterior registra que não há tabela de perfis conhecida. O código só acessa Auth; aplicações, atividades e notificações são dados locais/demonstrativos. O `AdminCenter` também contém placeholders e não executa operações administrativas. A única rota `/admin/:section` era redirecionada ao dashboard. O nome/avatar vêm de `user_metadata`, que é editável pelo usuário, e agora continuam sendo usados apenas para apresentação; nenhum privilégio é derivado deles. Nenhuma tabela ou política atualmente implantada pôde ser inspecionada sem acesso ao projeto Supabase.

## Migração

Arquivo `supabase/migrations/202610090001_authorization_roles_rls.sql` (revisado, ainda não aplicado). Antes de aplicar, confirme no painel SQL Editor ou em `Database → Tables` se `public.profiles` e `public.admin_audit_log` já existem e inspecione colunas, constraints, grants, policies, funções e triggers. `CREATE TABLE IF NOT EXISTS` não adapta tabelas antigas: divergências de estrutura podem interromper a transação. A migração remove todas as policies dessas duas tabelas para reinstalar o conjunto fechado descrito aqui; avalie dependências de policies existentes antes de aplicar. Ela também substitui o trigger de mesmo nome em `auth.users`. Não aplique em banco divergente sem um patch específico revisado.

1. Fazer backup/export do schema e revisar conflitos com tabelas e triggers já existentes.
2. Aplicar a migração em projeto de desenvolvimento/homologação.
3. Rodar a matriz de validação abaixo usando contas de teste separadas.
4. Só então aplicar manualmente em produção, após revisão e janela autorizada.
5. Conceder o primeiro OWNER pelo procedimento abaixo.

A migração cria perfis vinculados por FK a `auth.users`, atribui `USER` por padrão, cria perfis para usuários existentes sem elevar ninguém, restringe atualização do cliente aos campos `full_name` e `avatar_url`, e usa RLS para limitar leituras. As três funções `SECURITY DEFINER` têm `search_path` fixo, proprietária `postgres` e execução direta revogada de `PUBLIC`/`anon` (a RPC de papel só é executável por `authenticated`). `current_app_role()` evita policy recursiva. A RPC só permite ao OWNER atribuir/revogar ADMIN (ou retornar a USER), valida NULL explicitamente, não altera OWNER e não grava auditoria nem atualiza timestamp quando o papel já é o solicitado. Não há política de insert/delete de perfil para clientes. O trigger cria novos perfis como USER mesmo que o cadastro forneça metadados arbitrários. A migração não cria uma função de bootstrap público.

O log é somente leitura para OWNER/ADMIN; clientes não podem inserir, atualizar ou apagar eventos. Nesta etapa apenas concessão/revogação de papel gera eventos, pois as outras áreas não têm operações backend reais conectadas.

## Primeiro OWNER

Não há UUID confirmado neste repositório, e a atribuição não foi executada. Confirme com o proprietário a conta exata antes de continuar.

1. No Supabase Dashboard do projeto correto, abra `Authentication → Users`, localize a conta confirmada por e-mail junto ao proprietário e copie o UUID. Não use e-mail como identificador nem cole UUID em formulário público.
2. Confirme no Dashboard que o UUID pertence à conta aprovada. Execute o bloco abaixo em SQL Editor confiável com papel `postgres`, substituindo o parâmetro pelo UUID verificado. O bloco sempre falha se encontrar mais de um OWNER. Se encontrar exatamente um, só termina com sucesso sem alterações se ele for o UUID esperado; com zero OWNER, promove o alvo somente se ele estiver como USER.
3. Verifique em SQL Editor que o mesmo UUID aparece como OWNER e que há exatamente um OWNER.

```sql
begin;
-- Serializa bootstrap concorrente; use somente em SQL Editor confiável como postgres.
select pg_advisory_xact_lock(7319042101);
do $$
declare
  target_id uuid := '<UUID_CONFIRMADO_DO_PROPRIETARIO>'::uuid;
  owner_count integer;
  target_role text;
begin
  select count(*) into owner_count from public.profiles where role = 'OWNER';
  if owner_count > 1 then
    raise exception 'Mais de um OWNER já existe; bootstrap interrompido para investigação';
  end if;

  select role into target_role from public.profiles where id = target_id for update;
  if target_role is null then raise exception 'UUID não possui perfil; confirme a migração e a conta'; end if;

  if owner_count = 1 then
    if target_role = 'OWNER' then
      return; -- Reexecução segura: o único OWNER já é o esperado.
    end if;
    raise exception 'Já existe outro OWNER; bootstrap interrompido';
  end if;

  if target_role <> 'USER' then raise exception 'Com zero OWNER, o alvo precisa estar como USER'; end if;
  if target_role = 'USER' then
    update public.profiles set role = 'OWNER', updated_at = now() where id = target_id;
    insert into public.admin_audit_log (actor_id, action, target_user_id, previous_role, new_role)
    values (null, 'ROLE_GRANTED', target_id, 'USER', 'OWNER');
  end if;
end $$;
commit;
```

O lock evita que duas sessões deste procedimento observem simultaneamente zero OWNER. Confira o UUID e o projeto antes de executar; não exponha este bloco em endpoint ou cliente.

### Inspeção prévia do schema no Supabase

Execute as consultas em SQL Editor somente para leitura e salve os resultados junto à revisão. A existência de nomes iguais não confirma compatibilidade: compare definições, ownership e privilégios com a migração. Não aplique enquanto houver divergência sem patch revisado.

```sql
-- Relações, schema e dono
select n.nspname as schema_name, c.relname, c.relkind,
       pg_get_userbyid(c.relowner) as owner,
       c.relrowsecurity as rls_enabled, c.relforcerowsecurity as force_rls
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public' and c.relname in ('profiles', 'admin_audit_log');

-- Colunas e defaults
select table_name, ordinal_position, column_name, data_type, is_nullable, column_default
from information_schema.columns
where table_schema = 'public' and table_name in ('profiles', 'admin_audit_log')
order by table_name, ordinal_position;

-- Constraints, incluindo validação e definição
select conrelid::regclass as table_name, conname, contype, convalidated,
       pg_get_constraintdef(oid) as definition
from pg_constraint
where conrelid in ('public.profiles'::regclass, 'public.admin_audit_log'::regclass)
order by conrelid::regclass::text, conname;

-- Triggers das tabelas alvo e trigger de criação de perfil em auth.users
select tgrelid::regclass as table_name, tgname, tgenabled,
       pg_get_triggerdef(oid) as definition
from pg_trigger
where not tgisinternal and
      (tgrelid in ('public.profiles'::regclass, 'public.admin_audit_log'::regclass)
       or (tgrelid = 'auth.users'::regclass and tgname = 'on_auth_user_created_profile'))
order by 1, 2;

-- Policies atuais (inclui comando, roles, USING e WITH CHECK)
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where schemaname = 'public' and tablename in ('profiles', 'admin_audit_log')
order by tablename, policyname;

-- Grants de tabela/coluna (inclui privilégios herdados explicitamente atribuídos)
select table_schema, table_name, grantee, privilege_type, is_grantable
from information_schema.table_privileges
where table_schema = 'public' and table_name in ('profiles', 'admin_audit_log')
order by table_name, grantee, privilege_type;
select table_name, column_name, grantee, privilege_type, is_grantable
from information_schema.column_privileges
where table_schema = 'public' and table_name = 'profiles'
order by column_name, grantee, privilege_type;

-- Definição, dono, SECURITY DEFINER, search_path e ACL das funções
select p.oid::regprocedure as function_name, pg_get_userbyid(p.proowner) as owner,
       p.prosecdef as security_definer, p.proconfig as function_settings,
       p.proacl, pg_get_functiondef(p.oid) as definition
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname in
  ('current_app_role', 'create_profile_for_new_user', 'set_managed_user_role')
order by 1;
```

Checklist de aprovação: [ ] relações/colunas/defaults correspondem; [ ] PK/FK/CHECK estão validadas e corretas; [ ] RLS ligada e `FORCE RLS` compatível com o desenho; [ ] policies antigas foram inventariadas e o impacto de removê-las foi aceito; [ ] triggers duplicados/concorrentes foram investigados; [ ] grants não concedem escrita de papel nem escrita de auditoria a clientes; [ ] funções têm dono `postgres`, `SECURITY DEFINER` apenas onde previsto e `search_path` fixo; [ ] ACL revoga `PUBLIC`/`anon` e só concede EXECUTE de acordo com a migração; [ ] não há outras funções/triggers capazes de conceder papel.

O catálogo acima não comprova, sozinho, o comportamento efetivo de RLS. Isso requer executar os testes abaixo como as roles autenticadas com JWT real.

Verificação:

```sql
select id, role from public.profiles where role = 'OWNER';
select count(*) as owner_count from public.profiles where role = 'OWNER';
```

O resultado esperado é o UUID confirmado e contagem `1`. Se qualquer etapa divergir, pare e investigue; não repita com outro usuário até confirmar com o proprietário.

## Rotas e limites funcionais

`AuthContext` consulta `profiles.role` após restauração/alteração da sessão. Falha ou perfil inexistente significa negar acesso. `/admin/:section` requer OWNER ou ADMIN, e `/admin/permissions` requer OWNER. `/acesso-negado` é a página de recusa. O cadastro não oferece papel. Nenhum serviço privilegiado nem `service_role` foi adicionado ao navegador.

As telas administrativas permanecem demonstrativas: diretório de usuários, convites, telemetria, configurações e ações não têm tabelas nem serviço backend existentes e não foram ativados como operações. Para gerir usuários do Auth, criar uma Edge Function com validação de JWT e papel OWNER lido do banco, validação estrita do alvo/operação e auditoria; guardar `service_role` somente como secret da função. Para novas tabelas públicas, criar policies explícitas por operação antes de expor consultas. A UI por si só não autoriza chamadas diretas.

## Testes de RLS e chamadas diretas com JWT

Não executada: este workspace não tem credenciais/ligação confirmada ao banco, e não há Supabase CLI, ambiente de teste ou contas de papéis disponíveis. Lint/build validam apenas o frontend; não validam SQL, permissões efetivas ou RLS no PostgreSQL. Não classificar o sistema como pronto para produção antes de executar e guardar evidência dos testes seguintes em projeto descartável/homologação.

### Preparação

Estes testes são somente para projeto descartável/homologação depois da aplicação autorizada da migração. Use três contas distintas cujos perfis tenham OWNER, ADMIN e USER, mais um alvo USER e outro ADMIN. Obtenha um access token de cada sessão de teste pelo fluxo normal de login. Não copie tokens para commits/logs. `SUPABASE_URL`, chave pública e tokens são placeholders locais; não use `service_role` para simular usuário, pois ela contorna o modelo que se quer testar.

Exemplo de chamada REST direta (bash; repetir trocando `JWT` por cada token real):

```bash
export SUPABASE_URL='https://<project-ref>.supabase.co'
export SUPABASE_PUBLISHABLE_KEY='<chave-publica>'
export JWT='<access-token-do-usuario-de-teste>'

# SELECT de perfis: USER deve receber somente o próprio; ADMIN/OWNER podem ler todos.
curl -i "$SUPABASE_URL/rest/v1/profiles?select=id,role" \
  -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Authorization: Bearer $JWT"

# Tentativa de promoção via PATCH: deve falhar/afetar zero linhas para qualquer cliente.
curl -i -X PATCH "$SUPABASE_URL/rest/v1/profiles?id=eq.<uuid-alvo>" \
  -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' -H 'Prefer: return=representation' \
  -d '{"role":"OWNER"}'

# RPC direta: OWNER deve conseguir alterar USER<->ADMIN; ADMIN/USER devem receber 42501.
curl -i -X POST "$SUPABASE_URL/rest/v1/rpc/set_managed_user_role" \
  -H "apikey: $SUPABASE_PUBLISHABLE_KEY" -H "Authorization: Bearer $JWT" \
  -H 'Content-Type: application/json' \
  -d '{"p_target_user_id":"<uuid-user-alvo>","p_new_role":"ADMIN"}'
```

### Casos por papel

| Papel/token | Teste direto esperado |
|---|---|
| Sem JWT (anon) | `profiles` e `admin_audit_log` não retornam dados; RPCs `current_app_role` e `set_managed_user_role` não são executáveis. Verifique HTTP/status e corpo, não apenas a UI. |
| USER | SELECT em `profiles` retorna apenas a própria linha. PATCH `role`, INSERT/DELETE em `profiles` e qualquer INSERT/UPDATE/DELETE no log são negados. RPC `set_managed_user_role` retorna `42501`. |
| ADMIN | SELECT em perfis e log retorna linhas permitidas pelas policies. PATCH de role e escrita no log são negados. RPC `set_managed_user_role` retorna `42501`, inclusive ao tentar alterar a si mesmo, outro USER ou OWNER. |
| OWNER | SELECT em perfis/log é permitido. PATCH direto de role e escrita no log continuam negados. RPC pode transformar USER em ADMIN e ADMIN em USER; não pode alterar OWNER, promover a OWNER, aceitar role inválido ou NULL. |

### Casos de integridade e regressão

1. Para cada token, capture SELECT de perfil próprio/alheio e log; confirme escopo e status/corpo esperados. Para policy de leitura, zero linhas pode ser resposta correta, sem erro HTTP.
2. Com OWNER, promova um USER a ADMIN pela RPC. Confirme papel e uma linha de auditoria; repita o mesmo pedido e confirme nenhuma nova auditoria nem mudança de `updated_at`.
3. Rebaixe ADMIN a USER pela RPC; confirme `ROLE_REVOKED`. Repita e confirme idempotência.
4. Como ADMIN e USER, chame RPC diretamente para alvos diferentes, incluindo OWNER. Deve retornar SQLSTATE `42501` e não alterar papel/log.
5. Como OWNER, tente alvo OWNER, role OWNER/valor inválido/NULL e UUID inexistente. Espere respectivamente proteção `42501`, validação `22023` ou ausência `P0002`; confira que nenhum estado foi alterado.
6. Tente PATCH `role`, INSERT/DELETE em `profiles` e escrita direta em `admin_audit_log` com os três JWTs. Confira grants e policies, inclusive ausência de eventos espúrios.
7. Cadastre usuário de teste com `user_metadata.role=OWNER`; trigger deve criar perfil USER. Confirme trigger e linha após cadastro.
8. Revogue um papel pelo fluxo autorizado mantendo a sessão/JWT anterior ativo; chamadas REST/RPC subsequentes devem refletir o papel atual no banco. A interface não é parte da prova.
9. No bootstrap, valide em transação descartável: zero OWNER + alvo USER promove; um OWNER esperado repete sem alterar dados; um OWNER diferente aborta; mais de um OWNER aborta mesmo quando o alvo está entre eles; alvo ausente/outro papel aborta. Roleback é obrigatório nos ensaios.
10. Faça duas tentativas simultâneas de bootstrap somente em ambiente descartável e confirme serialização do advisory lock, rollback da perdedora e contagem final. O lock não protege contra outros caminhos privilegiados que não o utilizem.

Guarde request, papel do token, status/código SQLSTATE, linhas retornadas e contagens antes/depois, removendo JWTs dos registros. A autorização da UI e o lint/build não substituem estas verificações.

## Verificação estática do arquivo SQL

O SQL da migração foi lido diretamente do arquivo em texto UTF-8 nesta revisão. A busca por entidades HTML (`&amp;`, `&lt;`, `&gt;`, entidades numéricas), escapes literais de formatação (`\n`, `\t`, `\uXXXX`) e blocos Markdown foi feita no arquivo SQL; não foram encontrados esses padrões. Os acentos estão em comentários/documentação, não há delimitadores de markdown envolvendo o SQL, e os delimitadores `$$` estão balanceados visualmente. Isso é uma inspeção estática, não prova de parse/execução: ainda é necessário validar sintaxe em PostgreSQL e testar a migração em banco descartável antes de qualquer aplicação real.
