# Satturnex Hub

Portal central da Satturnex, construído com React 19, Vite, React Router e Lucide. A autenticação usa Supabase Auth; aplicações, notificações e algumas preferências ainda usam dados locais demonstrativos.

## Instalação

Requer Node.js e npm.

```bash
npm install
Copy-Item .env.example .env.local
npm run dev
```

Preencha `VITE_SUPABASE_URL` e `VITE_SUPABASE_PUBLISHABLE_KEY` no `.env.local` com a URL do projeto Supabase e a chave pública publishable. Projetos com a chave legada anon podem usar `VITE_SUPABASE_ANON_KEY` no lugar. O cliente aceita ambas e prioriza publishable. Esses valores são enviados ao navegador. Nunca use `service_role`, `sb_secret_` ou outro segredo privilegiado em uma variável `VITE_`.

## Autenticação e configuração do Supabase

O serviço em `src/services/authService.js` implementa cadastro, login por senha, restauração e observação de sessão, logout, recuperação de senha, redefinição e atualização de metadados de perfil. O nome e avatar são gravados em `user_metadata`; o Supabase controla o e-mail e sua confirmação. O cliente não atribui papéis privilegiados.

No painel Supabase, configure **Authentication → URL Configuration**:

- Site URL: endereço canônico do Hub.
- Redirect URLs: `http://localhost:5173/login`, `http://localhost:5173/reset-password` e cada URL de produção/homologação equivalente. Inclua curingas somente para hosts controlados.
- Configure confirmação de e-mail e SMTP conforme o ambiente. Em produção, use SMTP próprio/configurado para entrega confiável.

O link de cadastro retorna para `/login`. O fluxo de recuperação retorna para `/reset-password`. O formulário só concede sessão se o Supabase efetivamente retornar uma sessão; com confirmação obrigatória, o usuário deve confirmar o endereço antes de entrar.

O repositório não contém schema/migrações prévias nem conexão confirmada a um banco; a migração revisável `supabase/migrations/202610090001_authorization_roles_rls.sql` cria a fonte de autorização `public.profiles`, RLS e auditoria de mudanças de papel. Revise a existência de tabelas e policies no seu projeto antes de aplicar. O procedimento para atribuir o primeiro OWNER, as limitações funcionais e a matriz de homologação estão em [docs/autorizacao-administrativa.md](docs/autorizacao-administrativa.md). A interface nega falhas de leitura de papel, mas não substitui RLS.

## Rotas

- `/` — apresentação pública
- `/login` e `/register` — autenticação e cadastro
- `/recover-password` e `/reset-password` — recuperação e redefinição
- `/dashboard`, `/applications`, `/activities`, `/favorites`, `/notifications` e `/settings` — área autenticada
- `/admin/*` — requer papel OWNER ou ADMIN consultado em `public.profiles`; `/admin/permissions` exige OWNER. A rota continuará bloqueada enquanto a migração ou o perfil autorizado não estiverem disponíveis.

Rotas privadas aguardam a restauração de sessão e preservam caminho, query e hash ao redirecionar para login. O retorno do login só aceita caminhos internos.

## Validação local

```bash
npm run lint
npm run build
```

Os fluxos que dependem de chamadas reais exigem as variáveis de ambiente, URLs autorizadas e configuração de e-mail no projeto Supabase. A interface de preferências e algumas áreas do portal permanecem demonstrativas.

## Tema

Claro, escuro e sistema são suportados. A preferência visual permanece em `localStorage` sob `satturnex-theme`.
