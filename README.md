# Pizzaria Nuclear

Fundação do delivery em **Next.js 16.3.8 / React 19.3 / TypeScript**, com catálogo preparado para **Supabase/PostgreSQL**. A identidade visual e a edição “SABOR QUE EXPLODE” foram preservadas.

**Entrada atual do site:** execute `npm run dev` nesta pasta e abra `http://localhost:3000`. O arquivo `index.legacy.html` é apenas a versão estática antiga; seus produtos e unidades fictícios não representam o site Next.js. Não abra esse arquivo para conferir o cardápio atual.

## Estado desta fase

- App Router, renderização de página no servidor e componentes cliente apenas para interações.
- Cardápio transcrito da referência anterior: 21 sabores de pizza, 2 kalzones e 5 bebidas em 3 categorias, com busca, filtros e destaques. A lista de pizzas ainda precisa ser conferida com o cardápio comercial atual.
- Pizzas nos tamanhos Pequena (R$ 50), Média (R$ 55), Grande (R$ 65) e Maracanã (R$ 70). Inteiras e meio a meio têm o mesmo preço por tamanho; o segundo sabor é obrigatório no meio a meio.
- Bordas opcionais de Catupiry e Cheddar (R$ 3 cada) e seis adicionais (R$ 2 a R$ 4) somente para pizzas. Kalzones custam R$ 25/R$ 30 e bebidas R$ 4 a R$ 14, sem bordas ou adicionais.
- Personalização e observações ligadas às tabelas públicas do catálogo. O carrinho separa combinações diferentes, limita quantidades e recalcula os valores pelo catálogo atual; preços não são salvos no localStorage.
- Fontes locais e `next/image`; carrinho/menu com dialog nativo, foco e Escape.
- Cliente Supabase tipado, limitado à chave pública; validação Zod da resposta; sem fallback silencioso quando o banco falha.
- Migração de 21 tabelas, valores em centavos, snapshots, constraints, índices, RLS e grants explícitos.
- Checkout de retirada preparado para Mercado Pago Checkout Pro em teste (Pix/cartão): valida contato, opções, horários e preço no PostgreSQL; grava pedido, itens e pagamento em uma transação com idempotência.
- Página privada por sessão para acompanhar o pedido. O retorno do Mercado Pago consulta a API do provedor; webhook assinado também consulta a API antes de mudar o estado do pagamento. A URL de retorno nunca é aceita como prova de pagamento.
- Migração aplicada somente ao projeto de teste. **A abertura de pedidos permanece desabilitada** até credenciais de teste, URL HTTPS pública e compra de teste estarem validadas. Entrega permanece desabilitada até cadastrar bairros/CEPs, taxa e pedido mínimo.
- Testes unitários e SQL/RLS com PostgreSQL embarcado (PGlite); types gerados por introspecção.

**Ainda não recebe pagamentos reais.** O checkout criado está restrito ao ambiente de teste e fechado pela configuração da loja. Autenticação da equipe, painel de pedidos, entrega e homologação de uma compra de teste ainda são necessários. O WhatsApp permanece como consulta da lista, sem registrar pedido no banco.

Os preços mostrados no navegador são estimativas. O checkout recalcula os valores a partir das tabelas do banco dentro da mesma transação que cria o pedido; não aceita preço ou total enviados pelo cliente.

Em 03/10/2026, o projeto Supabase de **teste** `vtadejzspvolvhkcvvxv` recebeu as migrações de catálogo, contato e checkout. A API pública confirmou 1 unidade, 3 categorias ativas, 28 produtos ativos, 84 preços por tamanho, 29 opções e 7 horários de funcionamento. Os 14 produtos do catálogo antigo permanecem inativos para preservar histórico. O `ordering_enabled` continua `false`; nenhuma cobrança foi iniciada. Endereço, horário e telefone foram informados pelo responsável, mas a apresentação final do cardápio ainda está em homologação.

## Desenvolvimento

Node.js 22.15 ou superior (validado com 24.11.0) e npm. Instalar com `npm ci`. Os comandos `dev`, `build` e `start` usam os certificados confiáveis do sistema para a conexão HTTPS com o Supabase.

1. Copie `.env.example` para `.env.local` se ainda não houver configuração. Use `CATALOG_SOURCE=supabase` para ler o projeto de teste ou `demo` para inspecionar a interface sem serviços externos.
2. Execute `npm run dev`.
3. Abra `http://localhost:3000`.

`demo` é um modo explícito de homologação, identificado na página. Em desenvolvimento sem variável configurada, ele é o padrão. Em build/runtime de produção, o padrão é `supabase`. A produção da Vercel rejeita `demo`.

Não sobrescreva um `.env`/`.env.local` existente com o exemplo. `.env.local` tem precedência sobre `.env`. Nunca commite credenciais ou as envie pelo chat. O catálogo usa apenas a chave pública; o checkout utiliza chave privilegiada somente no servidor.

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

No projeto de teste configurado acima, as cinco primeiras migrações em `supabase/migrations/` **já foram aplicadas**. Não as executar novamente pelo SQL Editor. A migração `20261005012008_reconcile_checkout_payment_transitions.sql` corrige a conciliação de pagamentos e **ainda precisa ser aplicada ao projeto de teste antes da compra de homologação**. A migração de catálogo registra os preços informados para a Nuclear, preserva os produtos antigos como inativos e usa IDs estáveis. O seed SQL é gerado da mesma fonte para novos ambientes locais; não aplicá-lo em produção sem revisão comercial.

Para novos projetos de teste administrados pela CLI, preferir `supabase login`, `supabase link --project-ref ...`, revisar `supabase db push --dry-run --include-seed` e só então `supabase db push --include-seed`. No projeto atual, o histórico remoto registra a migração inicial. Não aplicar pela CLI uma migração já executada no SQL Editor sem reconciliar o histórico. Consulte `--help` da versão instalada antes de operar o ambiente remoto.

Neste Windows, a CLI instalada precisou de `$env:BUN_OPTIONS='--use-system-ca'` no terminal antes de acessar a API de gerenciamento. Isso mantém a validação TLS ativa.

Após mudar `CATALOG_SOURCE`, reinicie o Next.js. A leitura remota dos 28 produtos, os preços por tamanho, as opções e os dados de atendimento foram verificados pela chave pública. A propagação de mudanças de disponibilidade ainda deve ser conferida quando a gestão do catálogo for implementada.

## Fonte do cardápio e atendimento

`src/data/menu-source.json` reúne os dados informados pelo responsável: sabores e ingredientes transcritos da foto, preços, bordas, adicionais, bebidas, contato e horário. `node scripts/generate-catalog.mjs` gera a fixture local `src/data/demo-catalog.json`; `node scripts/generate-seed.mjs` gera `supabase/seed.sql`. Mudanças comerciais devem partir da fonte e ser levadas ao projeto de teste por **nova migração revisada**; regenerar o seed não atualiza automaticamente um banco remoto já migrado.

`product_sizes` guarda os preços finais por tamanho; `option_groups`, `product_options` e `product_option_relations` guardam a seleção de segundo sabor, borda e adicionais. O meio a meio usa acréscimo zero para o segundo sabor, portanto conserva o preço do tamanho. O atendimento exibido é: todos os dias, das 17h às 23h, na Rod. Saturnino Braga, 1051 - Centro, Lídice, Rio Claro - RJ; telefone/WhatsApp (24) 99919-2282.

## Checkout de teste e verificação

O botão de pagamento só é liberado quando a loja permite pedidos/retirada no banco e estas variáveis existem **no servidor**: `SUPABASE_SECRET_KEY` (ou `SUPABASE_SERVICE_ROLE_KEY`), `MERCADOPAGO_TEST_ACCESS_TOKEN`, `MERCADOPAGO_TEST_WEBHOOK_SECRET`, `APP_URL=https://SEU-PREVIEW` e as variáveis públicas do Supabase. Não enviar esses valores pelo chat nem usar prefixo `NEXT_PUBLIC_` em chaves privadas. O checkout rejeita URL local porque o Mercado Pago exige URLs de retorno e webhook com domínio acessível. Em desenvolvimento local, o formulário fica visível para revisão, mas o botão permanece desativado.

O fluxo é: carrinho → `POST /api/checkout` → `create_checkout_order` no banco → preferência de teste no Mercado Pago → redirecionamento ao sandbox → `/pedido/[id]`. O cookie HttpOnly vincula a sessão ao pedido. `POST /api/webhooks/mercadopago` valida `x-signature`/`x-request-id`, consulta o pagamento na API do Mercado Pago e confere referência, valor, moeda e modo de teste antes de atualizar o banco. A página de retorno também faz a consulta porque pagamentos de teste do Checkout Pro podem não gerar webhook automático. A consulta de status não confia nos parâmetros de retorno para aprovar um pagamento.

O Checkout Pro pode incluir saldo em conta Mercado Pago além de Pix/cartão, pois esse meio não pode ser excluído na preferência. Boleto e cartões de débito/pré-pagos estão excluídos. Confira os meios mostrados na compra de teste. A integração recusa URLs de checkout fora de `sandbox.mercadopago.com` e pagamentos marcados `live_mode=true`.

**Para habilitar depois da homologação:** configurar aplicação e webhook de teste no Mercado Pago, fornecer as credenciais pelo arquivo local/ambiente da hospedagem, apontar `APP_URL` para preview HTTPS, testar compra com comprador de teste, validar retorno/webhook e só então alterar `store_settings.ordering_enabled` para `true` no projeto de teste. `pickup_enabled`, `pix_enabled` e `card_enabled` já estão preparados; `delivery_enabled=false` até receber área, taxa e mínimo. Não usar credenciais de produção nesta fase.

## Banco local e segurança

`supabase/config.toml` e migrations são compatíveis com o fluxo local oficial. `npm run db:start` requer Docker disponível; `npm run db:reset` **apaga e recria somente o banco Supabase local** e aplica o seed. `npm run db:stop` encerra os containers. Esses serviços não são iniciados pelos testes SQL embarcados.

`npm run test:db` executa a migração em um PostgreSQL efêmero via PGlite, cria somente o contrato mínimo de `auth.users`/`auth.uid()` e testa permissões reais do motor SQL. Não lê `.env`, não se conecta a banco remoto e não simula que Supabase Auth/PostgREST/Storage estejam validados.

Tabelas públicas de catálogo permitem apenas SELECT de registros ativos vinculados a unidade/categoria ativas. Indisponível é diferente de desativado: permanece visível com botão bloqueado. Tabelas de clientes, pedidos, pagamentos, tokens e eventos não têm grants públicos. Usuário autenticado comum não é administrador. Equipe só pode ler seu vínculo; escrita de admin será projetada na fase de autenticação. O RPC de checkout não usa `SECURITY DEFINER`; um auxiliar legado que usa essa opção teve sua execução revogada para `anon` e `authenticated`.

O RPC de checkout é `SECURITY INVOKER` e tem `EXECUTE` apenas para `service_role`. Ele valida o horário, a modalidade, os preços e opções do catálogo, o mínimo e a zona de entrega (quando cadastrada), e grava pedido/itens/pagamento atomicamente. O webhook só altera estado após consulta ao provedor; nenhum usuário anônimo ou autenticado recebe acesso direto às tabelas privadas. Ainda faltam regras comerciais de entrega, política de reembolsos, tratamento operacional de pedidos e proteção adicional contra abuso antes de habilitar pedidos para clientes.

## Comandos

| Comando                                                                       | Finalidade                                                           |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| `npm run dev`                                                                 | Desenvolvimento Next.js                                              |
| `npm run build` / `npm start`                                                 | Build e execução de produção                                         |
| `npm run typecheck`                                                           | TypeScript estrito                                                   |
| `npm run lint`                                                                | ESLint Next.js/React                                                 |
| `npm run format:check` / `npm run format`                                     | Conferir ou aplicar formatação                                       |
| `npm test`                                                                    | Carrinho e validação do catálogo                                     |
| `npm run test:db`                                                             | Migração, seed, RLS, grants e constraints em banco efêmero           |
| `node scripts/test-database.mjs --generate-types`                             | Regerar tipos do schema validado (sem metadados de joins)            |
| `npm run db:types`                                                            | Gerar tipos completos pelo Supabase local, incluindo relacionamentos |
| `node scripts/generate-catalog.mjs`                                           | Regenerar a fixture a partir da fonte comercial                      |
| `node scripts/generate-seed.mjs`                                              | Regenerar seed para novos ambientes locais                           |
| `node --use-system-ca --env-file=.env.local scripts/inspect-test-catalog.mjs` | Conferir o catálogo público do projeto de teste                      |

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

`index.legacy.html`, `js/` e `assets/` originais foram preservados como referência desta migração; não são a aplicação Next.js e não entram no bundle. Os scripts antigos de manipulação do DOM/GSAP não são carregados. Animações de entrada avançadas ficam para revisão visual futura. Não usar Live Server para validar a aplicação nova.

Carrinho legado `nuclear-cart` armazenava nomes/preços sem IDs: não é importado como autoridade. A versão atual usa `nuclear-cart-v3` e migra itens válidos de `nuclear-cart-v2`, sem importar preços. Caso um item antigo deixe de ser uma combinação válida após cadastrar tamanhos obrigatórios, ele sai do subtotal e pode ser removido na interface.

## Próximas fases

1. Revisar a transcrição dos ingredientes da foto, disponibilidade de cada item e dados comerciais antes de sair da homologação.
2. Receber bairros/CEPs, taxas e pedido mínimo; implementar a cotação e o formulário de entrega antes de habilitá-la.
3. Configurar credenciais de teste e preview HTTPS; executar compra de teste Pix/cartão e simulação de webhook.
4. Painel da equipe com autenticação, autorização e transições operacionais de pedidos.
5. Gestão de catálogo/pedidos/configurações, notificações, reembolsos e operação.
6. Homologação em preview, revisão de segurança/performance e preparação comercial.

Plano completo e critérios: [auditoria](docs/AUDITORIA-DELIVERY.md).

## Deploy

Em 06/10/2026, o catálogo Next.js foi publicado no projeto Vercel separado `pizzaria-nuclear-site`, em `https://pizzaria-nuclear-site.vercel.app/`. O antigo endereço `https://pedruzz30.github.io/PizzariaNuclear/` usa GitHub Pages a partir da raiz da `main`; o novo `index.html` redireciona para a Vercel e `index.legacy.html` preserva a página estática anterior. O GitHub Pages não executa as rotas `/api` nem a página dinâmica `/pedido/[id]` do Next.js.

O novo projeto Vercel usa a raiz deste repositório (`PizzariaNuclear`), preset Next.js, `npm ci` e `npm run build`. Preview e produção usam somente URL/chave pública do Supabase de teste, `STORE_ID` e `CATALOG_SOURCE=supabase`; nenhuma chave privilegiada ou credencial Mercado Pago foi configurada. A URL de produção mostra o catálogo em homologação, com `noindex` e pedidos desativados. Não habilitar pagamentos antes de aplicar a migração pendente, configurar credenciais de teste e validar uma compra.

Esta fase mantém `noindex` e aviso de homologação. Não retirar até validar dados empresariais, preços e checkout. Não definir secrets usando `next.config.env`; variáveis privilegiadas pertencem somente ao ambiente server-side.

## Todos os direitos reservados -- space underground -- 2026
