# Pizzaria Nuclear

Fundação do delivery em **Next.js 16.3.8 / React 19.3 / TypeScript**, com catálogo preparado para **Supabase/PostgreSQL**. A identidade visual e a edição “SABOR QUE EXPLODE” foram preservadas.

## Estado desta fase

- App Router, renderização de página no servidor e componentes cliente apenas para interações.
- Catálogo único com 4 categorias/14 sabores migrados do HTML, busca, filtros e destaques.
- Carrinho React com IDs, quantidades limitadas e persistência versionada. Preços não são salvos no localStorage.
- Fontes locais e `next/image`; carrinho/menu com dialog nativo, foco e Escape.
- Cliente Supabase tipado, limitado à chave pública; validação Zod da resposta; sem fallback silencioso quando o banco falha.
- Migração de 21 tabelas, valores em centavos, snapshots, constraints, índices, RLS e grants explícitos.
- Seed apenas de homologação: loja visível, mas **pedidos e pagamentos desabilitados**.
- Testes unitários e SQL/RLS com PostgreSQL embarcado (PGlite); types gerados por introspecção.

**Ainda não é um delivery pronto para receber pagamentos.** Checkout, precificação transacional, Mercado Pago, autenticação/admin, edição de catálogo e acompanhamento são próximas fases. Não há endpoint público de criação de pedido ou alteração de pagamento. O WhatsApp atual permanece como consulta transitória da lista, sem registrar pedido no banco.

O projeto Supabase remoto não foi migrado automaticamente. A conexão exige URL/chave pública e a aplicação da migração no projeto de teste correto. Não confundir banco validado em testes com banco remoto provisionado.

## Desenvolvimento

Node.js 22 ou superior (validado com 24.11.0) e npm. Instalar com `npm ci`.

1. Copie `.env.example` para `.env.local` e mantenha `CATALOG_SOURCE=demo` para inspecionar a interface sem serviços externos.
2. Execute `npm run dev`.
3. Abra `http://localhost:3000`.

`demo` é um modo explícito de homologação, identificado na página. Em desenvolvimento sem variável configurada, ele é o padrão. Em build/runtime de produção, o padrão é `supabase`. A produção da Vercel rejeita `demo`.

Não sobrescreva um `.env`/`.env.local` existente com o exemplo. `.env.local` tem precedência sobre `.env`. Nunca commite credenciais ou as envie pelo chat. Esta fase **não utiliza** `SUPABASE_SECRET_KEY` nem `SUPABASE_SERVICE_ROLE_KEY`.

## Conectar o Supabase de teste

Preencha no arquivo de ambiente local:

```dotenv
CATALOG_SOURCE=supabase
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=SUA_CHAVE_PUBLICA
STORE_ID=10000000-0000-4000-8000-000000000001
```

`NEXT_PUBLIC_SUPABASE_ANON_KEY` é alternativa legada à publishable. Nunca usar chave secret/service_role nessas variáveis públicas. O catálogo renderiza no servidor com a chave pública e respeita RLS.

Antes de qualquer alteração remota, confira o nome do projeto e se está em TESTE. Inspecione tabelas e migrações existentes; não executar reset remoto. A migração contém CREATE TABLE e falhará em caso de colisões; nesse caso, reconciliar o schema existente.

No SQL Editor do **projeto de teste**, executar primeiro `supabase/migrations/20261003014810_foundation.sql` e depois `supabase/seed.sql`. Ambos são transacionais. O seed não sobrescreve preços/configurações existentes e pode ser reaplicado sem duplicar os IDs. Nunca inserir este catálogo fictício em produção sem validação comercial.

Para projetos administrados pela CLI, preferir `supabase login`, `supabase link --project-ref ...`, revisar `supabase db push --dry-run` e só então `supabase db push`. Não aplicar pela CLI uma migração já executada no SQL Editor sem reconciliar o histórico. Consulte `--help` da versão instalada antes de operar o ambiente remoto.

Depois: reiniciar Next.js, conferir 14 sabores, desativar um produto na unidade de teste e verificar que desaparece; restaurar a alteração. Confirmar que anon não consegue ler pedidos/clientes nem escrever em produtos. Essa verificação remota ainda está pendente.

## Banco local e segurança

`supabase/config.toml` e migrations são compatíveis com o fluxo local oficial. `npm run db:start` requer Docker disponível; `npm run db:reset` **apaga e recria somente o banco Supabase local** e aplica o seed. `npm run db:stop` encerra os containers. Esses serviços não são iniciados pelos testes SQL embarcados.

`npm run test:db` executa a migração em um PostgreSQL efêmero via PGlite, cria somente o contrato mínimo de `auth.users`/`auth.uid()` e testa permissões reais do motor SQL. Não lê `.env`, não se conecta a banco remoto e não simula que Supabase Auth/PostgREST/Storage estejam validados.

Tabelas públicas de catálogo permitem apenas SELECT de registros ativos vinculados a unidade/categoria ativas. Indisponível é diferente de desativado: permanece visível com botão bloqueado. Tabelas de clientes, pedidos, pagamentos, tokens e eventos não têm grants públicos. Usuário autenticado comum não é administrador. Equipe só pode ler seu vínculo; escrita de admin será projetada na fase de autenticação. Não há SECURITY DEFINER.

O serviço futuro de pedidos deverá calcular valores no servidor e gravar pedido/itens/opções atomicamente; constraints locais não substituem esse serviço. Horários, sobreposição de zonas, regras de adicionais, cupons, reembolsos e transições ainda exigem implementação/testes antes de habilitar pedidos.

## Comandos

| Comando | Finalidade |
|---|---|
| `npm run dev` | Desenvolvimento Next.js |
| `npm run build` / `npm start` | Build e execução de produção |
| `npm run typecheck` | TypeScript estrito |
| `npm run lint` | ESLint Next.js/React |
| `npm run format:check` / `npm run format` | Conferir ou aplicar formatação |
| `npm test` | Carrinho e validação do catálogo |
| `npm run test:db` | Migração, seed, RLS, grants e constraints em banco efêmero |
| `node scripts/test-database.mjs --generate-types` | Regerar tipos do schema validado (sem metadados de joins) |
| `npm run db:types` | Gerar tipos completos pelo Supabase local, incluindo relacionamentos |
| `node scripts/generate-seed.mjs` | Regenerar seed a partir do catálogo de homologação |

Em 03/10/2026, `npm audit --omit=dev` encontrou **0 vulnerabilidades nas dependências de execução**. A auditoria completa apontou 5 alertas altos transitivos na cadeia de desenvolvimento do ESLint (`braces`/`micromatch`/`fast-glob`), sem correção automática disponível nesta versão. Atualizar essa cadeia quando houver versão corrigida; não usar `npm audit fix --force` sem revisar o impacto.

## Organização

```text
src/app/                 Rotas, layout, erros e ajustes globais
src/components/landing/  Hero, header, conteúdo institucional e footer
src/components/menu/     Catálogo e destaques
src/components/cart/     Estado e interface do carrinho
src/server/              Configuração e leitura Supabase (server-only)
src/lib/                 Schemas Zod e funções puras
src/data/                Catálogo exclusivo de homologação
src/types/               Types do banco gerados
public/assets/           Assets servidos pelo Next.js
css/                     Identidade visual original reaproveitada
supabase/                Configuração, migrações e seed
tests/ e scripts/        Validação e manutenção
```

`index.html`, `js/` e `assets/` originais foram preservados como referência desta migração; não são a aplicação Next.js e não entram no bundle. Os scripts antigos de manipulação do DOM/GSAP não são carregados. Animações de entrada avançadas ficam para revisão visual futura. Não usar Live Server para validar a aplicação nova.

Carrinho legado `nuclear-cart` armazenava nomes/preços sem IDs: não é importado como autoridade. A versão atual usa `nuclear-cart-v2`; portanto carrinhos antigos começam vazios, sem apagar a chave antiga.

## Próximas fases

1. Aplicar e verificar schema/RLS no Supabase de teste; confirmar unidade e dados comerciais.
2. Personalização: tamanhos, bordas, adicionais e notas; regra de meio a meio a definir.
3. Checkout, entrega/retirada, horário, cálculo seguro e pedidos transacionais/idempotentes.
4. Mercado Pago sandbox, Pix/cartão, webhook, reconciliação e testes de falhas.
5. Acompanhamento seguro e painel com autenticação/autorizações.
6. Gestão de catálogo/pedidos/configurações, notificações e operação.
7. Homologação em preview, revisão de segurança/performance e preparação comercial.

Plano completo e critérios: [auditoria](docs/AUDITORIA-DELIVERY.md).

## Deploy

O diretório raiz da aplicação na Vercel deve apontar para este repositório (`PizzariaNuclear`), com preset Next.js e `npm run build`. Validar primeiro em preview, com Supabase de teste. Não publicar produção nesta fase. Confirmar configuração atual no painel antes de alterar o deploy existente.

Esta fase mantém `noindex` e aviso de homologação. Não retirar até validar dados empresariais, preços e checkout. Não definir secrets usando `next.config.env`; variáveis privilegiadas pertencem somente ao ambiente server-side.
