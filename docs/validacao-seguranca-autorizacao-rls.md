# Validação de segurança: autorização e RLS

**Estado: revisão estática concluída; nenhum comando de banco foi executado.** A migração não foi aplicada, o bootstrap não foi executado e nenhum dado, papel ou deploy foi alterado. Nenhum teste está aprovado: aprovação exige evidência de execução em banco descartável ou homologação confirmada.

## Inspeção do projeto

- Lidos integralmente a migração `supabase/migrations/202610090001_authorization_roles_rls.sql` e `docs/autorizacao-administrativa.md`.
- `src/services/authService.js` consulta `profiles.role` por UUID e aceita somente OWNER/ADMIN/USER. Falha ou papel inválido lança erro. `mapUser` usa metadados apenas para nome/avatar e define rótulo genérico, não privilégio. Cadastro só envia nome; não encontrei chamada frontend a `current_app_role()` nem `set_managed_user_role()`.
- `AuthContext` carrega o papel e marca erro em falha. `AdminRoute` nega acesso com papel nulo/erro; `/admin/:section` aceita ADMIN/OWNER e `/admin/permissions` exige OWNER. São barreiras de UI; a autorização efetiva depende do banco.
- `package.json` não tem runner de testes, configuração Supabase local ou scripts de integração. Não há configuração de homologação confirmada. Existe `.env.local`, mas seu conteúdo não foi lido. Nenhum token/chave foi consultado ou registrado.
- `git status --short --branch` falhou: a pasta não é reconhecida como repositório Git. Não foi possível confirmar branch ou alterações preexistentes.

## Riscos encontrados na migração e no bootstrap

Pontos positivos em inspeção estática: transação explícita; RLS habilitada; grants de UPDATE do perfil limitados a nome/avatar; ausência de escrita REST de perfil/log para clientes; papel verificado na RPC; OWNER protegido; trigger força USER; auditoria ocorre junto da mudança; funções definem search_path e qualificam tabelas.

Bloqueios e riscos que requerem resolução:

1. Não há ambiente de homologação confirmado. Não aplicar migração nem executar testes remotos antes de identificar o projeto e validar isolamento/backup.
2. CREATE TABLE IF NOT EXISTS não compara nem adapta schema existente. Divergência de colunas, defaults, constraints, índices ou owner deve interromper a migração e exigir patch revisado.
3. A migração apaga todas as policies dessas duas tabelas, independentemente de nome/finalidade; inventariar consumidores antes. Remove também trigger homônimo em auth.users; verificar sua definição e todos os triggers paralelos de criação de perfil.
4. Inspecionar funções preexistentes e overloads: CREATE OR REPLACE pode reutilizar assinatura compatível. Confirmar owner, definição, ACL efetiva e dependências.
5. SECURITY DEFINER requer confirmação de owner postgres, search_path, ACL incluindo defaults e permissões do schema. Verificar RLS/FORCE RLS e testar com JWT. A policy dá a ADMIN/OWNER leitura de todos os perfis e auditoria; confirmar que esse escopo é aprovado.
6. Não há unicidade geral de OWNER protegida pelo banco. A RPC comum não cria OWNER e protege alvo OWNER, mas SQL privilegiado e bootstrap são caminhos separados. `service_role`/superuser podem ignorar RLS.
7. Bootstrap documentado usa target_role IS NULL para detectar ausência e não testa target_id IS NULL antes da busca; corrija para validar explicitamente o UUID, usar FOUND para existência, exigir alvo USER quando não existe OWNER, permitir idempotência apenas se o único OWNER for o UUID esperado e abortar qualquer count >1. O advisory lock coordena somente execuções que usam o mesmo lock, não todos os caminhos privilegiados. Não executar o bloco atual.
8. Inspeção textual não prova parse/comportamento PostgreSQL. Migração, policies, RPC, concorrência e rollback precisam de ensaio local descartável.

## Consultas SQL somente leitura

As consultas estão em [`supabase/diagnostics/authorization_read_only.sql`](../supabase/diagnostics/authorization_read_only.sql). Inspecionam tabelas, colunas/defaults, constraints, índices, triggers de auth.users e relações-alvo, policies/expressões, grants de tabela e coluna, definições/owner/SECURITY DEFINER/search_path/ACL das funções, colisões de nomes, permissões do schema, distribuição agregada de papéis e contagens sem PII.

Execute apenas no projeto explicitamente confirmado. A seção final que consulta public.profiles só pode ser executada se a tabela existir. Interpretação: objeto ausente não autoriza migração; relação com tipo ou estrutura inesperada bloqueia; policy extra precisa de análise antes de ser removida; trigger/função concorrente ou homônimo divergente bloqueia; grants amplos, RLS desligada, FORCE RLS inesperada, ACL de função aberta, papel inválido, perfil sem Auth ou múltiplos OWNER requerem investigação. Catálogo não prova comportamento via PostgREST/JWT.

## Matriz de testes

Status inicial de todos: **Não executado**. Pré-condição geral: banco descartável ou homologação explicitamente confirmada, migration aplicada por autorização posterior, contas distintas OWNER/ADMIN/USER e alvos USER/ADMIN, tokens de login normais protegidos. Cada evidência deve remover JWT, PII e segredos.

| ID | Pré-condição e execução | Resultado esperado | Evidência |
|---|---|---|---|
| U1 | USER consulta profiles sem filtro | Só próprio perfil | HTTP/body e contagem |
| U2 | USER consulta UUID de outro usuário | Zero linhas/dados | request e resposta |
| U3 | USER tenta PATCH próprio role para ADMIN e OWNER | Negado ou zero linhas, papel intacto | status e papel antes/depois |
| U4 | USER tenta conceder papel a terceiro por REST/RPC | Negado; RPC SQLSTATE 42501 | status/SQLSTATE e estado |
| U5 | USER lê/escreve admin_audit_log | Leitura negada/vazia; escrita negada | status e contagem |
| U6 | USER chama RPC administrativa | 42501 | resposta RPC |
| U7 | USER tenta INSERT/DELETE direto em profiles | Negado | status e ausência de linha |
| A1 | ADMIN lista profiles e audit log | Acesso conforme policy documentada | linhas/contagens redigidas |
| A2 | ADMIN tenta RPC contra si, USER, ADMIN e OWNER | 42501, sem mudança | status e snapshot |
| A3 | ADMIN tenta promover a si mesmo a OWNER via REST/RPC | Negado | papel antes/depois |
| A4 | ADMIN tenta editar OWNER por REST/RPC | Negado; OWNER intacto | status e papel |
| A5 | ADMIN escreve diretamente no audit log | Negado | status/contagem |
| O1 | OWNER promove USER a ADMIN por RPC | Papel alterado e um evento auditado | resposta, papel e evento |
| O2 | OWNER rebaixa ADMIN a USER | ROLE_REVOKED auditado | papel e evento |
| O3 | OWNER repete papel já vigente | Sem novo evento nem mudança de updated_at | valores antes/depois |
| O4 | OWNER solicita papel OWNER/inválido/NULL | 22023; sem alteração | SQLSTATE e snapshot |
| O5 | OWNER tenta alterar alvo OWNER | 42501; sem alteração | SQLSTATE/papel |
| O6 | OWNER usa PATCH role ou escreve log diretamente | Negado; RPC é o único caminho comum | status/contagens |
| O7 | OWNER usa UUID inexistente | P0002; sem alteração | SQLSTATE e snapshot |
| S1 | Sem JWT, chave pública apenas | Sem dados privados; RPC não executável | HTTP/body sem chave |
| S2 | Perfil ausente ou leitura de papel falha | UI nega acesso | navegação/erro redigido |
| S3 | ADMIN revogado com sessão anterior ativa; fazer nova chamada | Banco aplica USER na nova chamada | papel e status REST/RPC |
| S4 | Signup com user_metadata.role=OWNER | Trigger cria perfil USER | papel final, payload redigido |
| S5 | UUID malformado, NULL, papel inválido | Erro controlado sem mutação | HTTP/código/estado |
| B1 | Zero OWNER e alvo USER em fixture | Só alvo confirmado vira único OWNER | contagem/papel/evento |
| B2 | Um OWNER é UUID esperado | Idempotência sem alterações | snapshot antes/depois |
| B3 | Um OWNER diferente | Abortado sem alterações | erro e snapshot |
| B4 | Mais de um OWNER | Sempre abortado sem alterações | erro e contagem |
| B5 | UUID NULL/ausente ou alvo não USER | Abortado sem alterações | erro e snapshot |
| B6 | Duas sessões concorrentes, somente banco local descartável | Serialização; sem segundo OWNER | resultados e contagem |

SQL catálogo é somente leitura e não prova RLS como cliente. SET ROLE/claims em SQL local pode apoiar RLS, mas chamadas REST com JWT real são necessárias para validar gateway/PostgREST, auth/signup e revogação de sessão. Nunca usar service_role como usuário. SELECT sob RLS pode resultar em HTTP 200 e lista vazia; verificar linhas e estado, não só status.

## Exemplos REST/RPC

Placeholders abaixo; cabeçalhos requeridos: `apikey: <chave-publica>`, `Authorization: Bearer <JWT-de-sessao>` e Content-Type JSON quando houver body. Não usar service_role e não ativar log de shell que exponha variáveis.

```bash
SUPABASE_URL='https://<project-ref>.supabase.co'
PUBLISHABLE_KEY='<chave-publica>'
JWT_USER='<token-de-sessao-USER>'
JWT_OWNER='<token-de-sessao-OWNER>'

# USER: perfil próprio; a consulta por outro UUID deve retornar [].
curl -i "$SUPABASE_URL/rest/v1/profiles?select=id,role" \
  -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $JWT_USER"
curl -i "$SUPABASE_URL/rest/v1/profiles?select=id,role&id=eq.<uuid-alheio>" \
  -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $JWT_USER"

# Todos os clientes devem ser impedidos de alterar role via REST.
curl -i -X PATCH "$SUPABASE_URL/rest/v1/profiles?id=eq.<uuid-alvo>" \
  -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $JWT_USER" \
  -H 'Content-Type: application/json' -H 'Prefer: return=representation' \
  -d '{"role":"OWNER"}'

# OWNER concede ADMIN por RPC; USER/ADMIN devem receber 42501.
curl -i -X POST "$SUPABASE_URL/rest/v1/rpc/set_managed_user_role" \
  -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $JWT_OWNER" \
  -H 'Content-Type: application/json' \
  -d '{"p_target_user_id":"<uuid-user>","p_new_role":"ADMIN"}'
```

OWNER com papel inválido espera SQLSTATE 22023; UUID válido inexistente, P0002; alvo OWNER, 42501. Envelope HTTP depende do PostgREST. PATCH pode resultar em coluna negada ou zero linhas; conferir papel depois. Não incluir token real nos artefatos/evidências.

## Automação e aprovação

Automação não é reproduzível ainda: não há runner, Supabase local nem fixtures. O SQL read-only está preparado; não foram adicionadas dependências nem testes que possam apontar por engano a um banco remoto. Próxima etapa recomendada: criar configuração local versionada/pinada, pgTAP para schema/grants/RLS/RPC com fixtures descartáveis e rollback, harness HTTP que exige localhost/allowlist e falha com service_role, testes React para papel carregando/falha/rotas, e teste concorrente do bootstrap corrigido. Não executar tudo até revisão/autorização da etapa apropriada.

Estados permitidos: **Aprovado com evidência**, **Reprovado**, **Bloqueado por pré-condição**, **Não executado**. Nenhum teste U1–B6 foi aprovado por inspeção estática.

| Critério | Estado atual | Evidência exigida |
|---|---|---|
| Ambiente de teste confirmado | Bloqueado por pré-condição | Identificação sem segredo e autorização para executar |
| Schema e conflitos revisados | Não executado | Saída de catálogo revisada |
| Migração testada em banco descartável | Não executado | Resultado PostgreSQL e estado final |
| RLS/API USER, ADMIN, OWNER e anon | Não executado | Requests, HTTP/SQLSTATE e estado posterior sem tokens |
| Auditoria/idempotência | Não executado | Evento e contagens antes/depois |
| Bootstrap corrigido e concorrência | Bloqueado por pré-condição | Revisão e ensaio local revertido |
| Fluxos React | Não executado | Resultado de runner e versão |
| Homologação | Bloqueado por pré-condição | Conflitos resolvidos, reviewer e rollback |
| Produção | Bloqueado por pré-condição | Revisão separada, backup verificado, janela e autorização explícita |

## Próximos passos

1. Revisar e corrigir o bootstrap documentado; não executar o bloco atual.
2. Confirmar se esta pasta deveria estar num repositório Git e identificar projeto Supabase descartável/local.
3. Revisar os resultados do SQL somente leitura e resolver conflitos antes de preparar patch.
4. Preparar harness local reproduzível e revisão independente.
5. Solicitar autorização explícita numa etapa posterior para executar contra homologação. Produção requer autorização/revisão/backup separados.
