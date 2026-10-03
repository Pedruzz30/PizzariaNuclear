# Pizzaria Nuclear — auditoria e plano de evolução

Data: 02/10/2026. Etapa: auditoria anterior à implementação.

Este documento descreve o código local e verificações pontuais no site público. Não certifica prontidão de produção. Nenhum código funcional, banco, configuração remota ou pagamento foi alterado nesta etapa.

## 1. Diagnóstico da arquitetura

O projeto é uma landing page estática com cardápio e carrinho local. Não existe aplicação Next.js, backend de pedidos ou integração de pagamentos. A interface já oferece uma base aproveitável; a camada transacional precisará ser construída.

O repositório está em `PizzariaNuclear`, dentro da pasta Nuclear. O commit observado é `996b04f` (`first commit`). Antes da auditoria, `index.html` já tinha alterações não commitadas: o título visível mudou de “PIZZA NOT BORING” para “SABOR QUE EXPLODE”. Essa alteração foi preservada. O site publicado ainda exibia o texto antigo no percurso observado.

Há 2.277 linhas de HTML, oito arquivos CSS (55.218 bytes) e seis scripts locais (45.228 bytes). A página concentra apresentação e dados. Scripts se comunicam por DOM, atributos `data-*`, eventos e funções globais; não existe camada de domínio nem separação entre preço de exibição e preço confiável.

## 2. Stack identificada

| Camada | Estado atual |
|---|---|
| Interface | HTML5, CSS próprio e JavaScript nativo |
| Next.js / React / TypeScript | Ausentes; não há versão instalada |
| Estado | Array fechado no escopo de `cart.js` e `localStorage` |
| Animações | GSAP 3.13.0 carregado de jsDelivr; CSS e IntersectionObserver |
| Fontes | Anton e Inter via Google Fonts |
| Persistência remota / APIs / autenticação | Ausentes no repositório |
| Hospedagem pública | Vercel, confirmada pelos cabeçalhos HTTP |
| Ferramentas de projeto | Git e configuração de Live Server na porta 5501 |
| Gerenciamento de dependências | Sem `package.json`, lockfile ou pipeline de build |
| Testes / lint / CI | Ausentes |

Não há dependências npm para auditar ou remover. GSAP está em uso, portanto não é dependência comprovadamente desnecessária. A ausência de lockfile e a carga por CDN devem ser revistas na migração.

## 3. Estrutura atual

```text
PizzariaNuclear/
  .git/
  .vscode/settings.json
  index.html
  css/
    main.css, header.css, hero.css, products.css
    sections.css, cart.css, footer.css, responsive.css
  js/
    main.js, hero-animations.js, carousel.js
    cart.js, menu.js, ui.js
  assets/
    assets-board.png
    logo/NuclearLogo.png, nuclear-logo.svg, nuclear-seal.svg
    pizzas/PizzaHero.png, hero-pizza.png
    pizzas/margherita.png, diavola.png, quatro-queijos.png, prosciutto.png
```

Não foram encontrados AGENTS.md aplicáveis no projeto, `.env`, `.gitignore`, configuração local da Vercel, migrations ou código Supabase. Configurações do painel da Vercel e secrets remotos não foram inspecionados; ausência local não prova ausência na conta.

## 4. Funcionalidades e catálogo existentes

| Classificação | Resultado |
|---|---|
| Funcionando no percurso testado | Página pública, adicionar item, aumentar quantidade, remover, persistir após recarregar, total, botão de fechamento desabilitado no carrinho vazio, busca e filtro de doces |
| Implementado por leitura do código | Diminuir quantidade, excluir ao chegar a zero, toast, menu móvel, carrossel, navegação por âncoras, Escape para fechar carrinho, mensagem de WhatsApp |
| Parcialmente implementado | Carrinho sem IDs e personalizações; responsividade com overflow; acessibilidade de modais; SEO básico; newsletter apenas visual |
| Inexistente | Banco, checkout dedicado, pedidos persistidos, cálculo confiável, taxa, pagamento, webhook, acompanhamento, login/admin, disponibilidade operacional, horário aplicado, cupons reais e notificações persistidas |
| Precisa ser corrigido | Preços controlados pelo navegador, dados fictícios, newsletter que promete envio sem enviar, foco fora do modal, inconsistências no título e conteúdo comercial |
| Recomendação futura | Meio a meio após definição comercial, múltiplas lojas operacionais, estoque de ingredientes, fidelidade, relatórios, notificações externas e agendamento |

O clique em diminuir quantidade foi exercitado antes da remoção, mas o subtotal intermediário não foi registrado separadamente. O envio do WhatsApp não foi acionado: o destino e a composição foram conferidos no código.

Há 14 produtos únicos e 18 botões de adicionar: quatro produtos aparecem também no carrossel, duplicando nomes e preços no HTML.

| Categoria | Produto | Preço atual |
|---|---|---:|
| Tradicionais | Margherita | R$ 42,90 |
| Tradicionais | Calabresa Nuclear | R$ 45,90 |
| Tradicionais | Portuguesa | R$ 47,90 |
| Tradicionais | Frango com Catupiry | R$ 46,90 |
| Especiais | Diavola | R$ 48,90 |
| Especiais | Quatro Queijos | R$ 51,90 |
| Especiais | Prosciutto | R$ 54,90 |
| Especiais | Trufada | R$ 62,90 |
| Veganas | Horta Nuclear | R$ 44,90 |
| Veganas | Cogumelos | R$ 49,90 |
| Veganas | Caprese Vegana | R$ 46,90 |
| Doces | Nutella com Morango | R$ 39,90 |
| Doces | Banana Nuclear | R$ 36,90 |
| Doces | Romeu e Julieta | R$ 37,90 |

O texto oferece tamanho único de 35 cm e oito fatias. Pequena/média/grande/família não estão cadastradas. Somente quatro sabores possuem imagens específicas. Migrar o conteúdo como catálogo inicial de homologação; confirmar sua validade comercial antes de publicar vendas.

## 5. Problemas encontrados e experiência do usuário

| Prioridade | Evidência | Consequência e correção proposta |
|---|---|---|
| Bloqueador de vendas integradas | `js/cart.js:338` lê `data-price`; `:382` abre WhatsApp | Criar serviço de pedidos que consulta preços, disponibilidade, opções e entrega no banco |
| Alta | `js/cart.js:35` valida apenas tipos e números finitos | Aceita quantidades fracionárias/negativas e preços adulterados no armazenamento; validar esquema, limites e versão; nunca reutilizar valores como autoridade |
| Alta | `js/cart.js:218` une itens pelo nome | Mistura futuras pizzas com bordas, tamanhos ou notas diferentes; usar assinatura de configuração e ID da linha |
| Alta | `js/ui.js:269` anuncia cupom enviado sem backend | Remover promessa ou integrar serviço com consentimento e confirmação real |
| Alta | `index.html:2068` informa projeto fictício e CNPJ zerado | Substituir apenas por informações fornecidas e verificadas pelo responsável |
| Alta | 320 e 390 px: largura rolável da raiz de 530 px | Corrigir limites de largura, toolbar/filtros e elementos decorativos; validar carrossel interno separado do documento |
| Média | Tab a partir de “Fechar carrinho” vazio levou foco ao BODY | Modal não mantém foco; implementar contenção, fundo inerte, restauração e navegação por teclado |
| Média | `index.html:175` mantém aria-label “Pizza Not Boring” | Título acessível e `data-word` não acompanham “SABOR QUE EXPLODE”; sincronizar sem desfazer a edição do usuário |
| Média | `index.html:1721` promete 10% na retirada | Não há escolha de retirada ou aplicação do desconto; confirmar a regra antes de codificar |
| Média | Savassi anuncia delivery 24h e horário 18h–01h | Resolver contradição e confirmar quais unidades realmente existem |
| Média | Preços repetidos no carrossel e cardápio | Derivar ambas as apresentações do mesmo catálogo |
| Média | `closeCart()` agenda ocultação após 420 ms | Possível corrida se reabrir rapidamente; cancelar timer ou usar estado de componente |
| Baixa | Links sociais apontam para páginas genéricas | Substituir por perfis reais ou retirar |
| Baixa | `originalHTML` não utilizado em hero-animations.js | Remover na conversão do módulo; revisar lógica de carrossel baseada em dois cards visíveis |

A identidade visual é consistente e deve ser mantida: fundo claro, vermelho, títulos Anton, corpo Inter, fotos, cards arredondados e carrinho lateral. A jornada atual é curta para montar uma lista, mas termina antes de informar frete, endereço, disponibilidade e pagamento. Não existe confirmação de que a pizzaria recebeu o pedido.

Acessibilidade positiva: idioma pt-BR, labels de busca/email, nomes em botões de ícone, foco CSS, toast `aria-live`, dialog identificado e tratamento parcial de movimento reduzido. Faltam contenção de foco, retorno de foco do menu móvel, link para pular navegação e validação automatizada de contraste. Smooth scroll, tilt e animação do contador ainda precisam respeitar movimento reduzido consistentemente. Não foi feita certificação com leitores de tela.

SEO positivo: título, description, headings e conteúdo presente no HTML. Faltam canonical, Open Graph/Twitter, ícone explícito, sitemap, robots e dados estruturados do negócio real. As futuras rotas de pedido/admin devem ser privadas e `noindex`.

## 6. Riscos técnicos e performance

As imagens locais únicas referenciadas somam 10.853.330 bytes (aproximadamente 10,35 MiB), sem representar necessariamente o download inicial por causa do lazy loading. `PizzaHero.png` tem 2,62 MB; `hero-pizza.png`, 3,03 MB; fotos de sabores ficam em torno de 1,15–1,26 MB. Há dimensões explícitas, `decoding`, lazy loading e prioridade no hero, mas não variantes responsivas. `assets-board.png` e `nuclear-logo.svg` não são referenciados pelo HTML analisado; não foram excluídos.

Usar imagens WebP/AVIF, tamanhos responsivos, `next/image`, fontes locais com `next/font` e importação seletiva de animações. A marca PNG de 302 KB merece otimização. Conteúdo `.reveal` começa invisível e depende de JavaScript: garantir degradação utilizável.

Não atribuir nota de Core Web Vitals sem medição. Lighthouse, métricas em aparelhos reais, LCP/INP/CLS de campo e rede lenta ficam pendentes. Risco central da migração: scripts que alteram DOM diretamente conflitando com React/hidratação. Converter interações por componente, com limpeza de listeners e animações; não colar todo o HTML em `dangerouslySetInnerHTML`.

## 7. Riscos de segurança

Não foi encontrado indício de secrets pelos padrões pesquisados nos arquivos de trabalho. Isso não substitui varredura especializada de todo o histórico e do build futuro. Sem `.gitignore`, a próxima configuração de credenciais pode ser commitada acidentalmente.

Não existe backend exposto no código para comprovar SQL injection, acesso indevido a pedidos ou falha de autenticação administrativa. Esses mecanismos estão ausentes, e não podem ser presumidos seguros. A interpolação de nomes do carrinho usa `textContent`, um ponto positivo; `innerHTML` observado limpa elementos ou lê conteúdo local, sem comprovação de XSS explorável neste percurso.

A resposta pública possui HTTPS/HSTS e cache da Vercel. Não trouxe CSP, X-Content-Type-Options, Referrer-Policy ou proteção explícita contra enquadramento. CORS `*` no HTML estático não demonstra vazamento privado, mas não deve ser copiado para APIs autenticadas. GSAP externo não possui `integrity` no HTML.

Controles necessários: autorização por operação, RLS, SQL parametrizado, Zod com limites de payload, rate limit compartilhado entre instâncias, proteção de login, verificação de origem/CSRF em mutações por cookie, tokens de acompanhamento, `no-store` em dados privados, escape de texto, uploads restritos e redaction de logs. Não confiar em esconder links ou no layout de `/admin` para proteger endpoints.

## 8. Proposta do banco

PostgreSQL/Supabase como autoridade. IDs UUID; datas `timestamptz` em UTC; moeda BRL; montantes inteiros em centavos com limites; slugs únicos; FKs e índices. O envio ao provedor converte centavos para string decimal sem arredondamento por ponto flutuante.

| Tabela | Responsabilidade e campos essenciais |
|---|---|
| stores | Identidade da unidade operacional; iniciar com uma somente após confirmação; preparar `store_id` nos dados operacionais |
| categories | id, store_id, name, slug, description, image_url, display_order, active, created_at, updated_at |
| products | id, category_id, store_id, name, slug, description, image_url, base_price_cents, active, available, featured, display_order, timestamps |
| product_sizes | id, product_id, name, slug, price_cents, active, display_order; preço final da variante, não acréscimo implícito |
| option_groups | id, store_id, name, kind, min_selections, max_selections, active; borda, adicionais etc. |
| product_options | id, option_group_id, name, additional_price_cents, active, display_order |
| product_option_groups | Liga produto ao grupo e define obrigatoriedade/limites específicos |
| product_option_relations | Liga produto às opções efetivamente permitidas; chave composta única |
| customers | id, auth_user_id opcional, name, phone, email opcional, created_at; guest permitido |
| customer_addresses | Campos sugeridos: customer_id, cep, street, number, complement, neighborhood, city, state, reference, created_at |
| orders | UUID interno, store_id, número público único por unidade, customer_id opcional, snapshots de identificação/endereço, order_type, subtotal/delivery_fee/discount/total em centavos, moeda, payment_method, payment_status, order_status, notas separadas, timestamps |
| order_items | order_id, product_id/size_id opcionais para histórico, snapshots de nome/tamanho, quantity, unit_price_cents, total_price_cents, notes |
| order_item_options | item_id, option_id opcional, snapshots de grupo/nome/preço/quantidade |
| order_item_flavors | Extensão para futuros sabores e frações; snapshot da regra de cobrança; recurso inicialmente desabilitado |
| payments | order_id, provider, provider_order_id, provider_payment_id, attempt, idempotency_key, amount_cents, currency, method, normalized_status, provider_status/detail, external_reference, expires_at, timestamps |
| checkout_requests | Sessão guest, idempotency_key, hash do payload, order_id, estado e expiração; UNIQUE por sessão/chave |
| delivery_zones | store_id, cep_start, cep_end, fee_cents, minimum_order_cents opcional, estimated_minutes, active |
| coupons / coupon_redemptions | Código normalizado, tipo, valor, vigência, mínimo, limites e reservas/uso transacionais; desabilitados até teste específico |
| store_settings | store_id, contato/endereço públicos, timezone, mínimo, tempo médio, modos de atendimento e pagamento, override de abertura |
| store_hours / store_closures | Dia, abre/fecha, virada de dia e exceções/feriados; evitar depender de texto livre |
| staff_members | auth_user_id, store_id, role, active; inicialmente ADMIN |
| order_events | Transições com autor, origem, instante e sequência; separação entre informação pública e interna |
| webhook_events | Identidade externa/deduplicação, resource_id, estado de processamento, tentativas, próximo retry, erro sanitizado |
| notification_outbox / audit_logs | Eventos a enviar após commit; auditoria de operações privilegiadas |
| order_access_tokens | Hash de token aleatório, pedido, expiração e revogação; nunca expor lista pública |

Tamanhos terão preços por produto: é flexível para sabores premium e evita preço global incorreto. Não cadastrar quatro tamanhos com valores inventados. Para produto com variantes, a variante escolhida determina o preço-base; `base_price_cents` atende produtos sem variantes ou apresentação consistente.

Entrega inicial por intervalos de CEP administráveis, sem sobreposição por loja, com conferência de cidade/UF e endereço. CEP isolado é intervalo com início=fim. Bairros são legíveis, mas nomes livres variam; distância exige geocodificação e custo externo. CEP fora da área bloqueia entrega e oferece retirada quando habilitada. Frete de retirada é zero. Nenhuma tarifa padrão gratuita para área desconhecida.

Snapshots preservam pedidos quando catálogo ou endereço mudar. Desativar produtos é preferível a exclusão física; FKs históricas não devem apagar itens em cascata ao excluir catálogo. Quantidade inteira positiva, opções compatíveis, somas consistentes, desconto limitado e moeda fixa são invariantes.

Criação do pedido e snapshots ocorre numa única transação, com leitura consistente/locks de catálogo e regras de loja. Alteração de preço exige nova confirmação do cliente. Nunca fazer múltiplos inserts REST independentes como se fossem uma transação. Preferir função SQL restrita e `SECURITY INVOKER`, acessível somente à credencial de servidor autorizada; revogar EXECUTE de PUBLIC/anon/authenticated. A chave privilegiada exige validação completa da aplicação, pois ignora RLS.

## 9. Proposta de arquitetura

Next.js App Router + TypeScript estrito + React, mantendo CSS e composição visual. Catálogo inicial renderizado no servidor; busca, filtros, personalização e carrinho em componentes cliente pequenos. Supabase Auth para equipe; guest checkout com sessão opaca para clientes.

```text
Cliente → Next.js (interface e Route Handlers)
                  ├─ catálogo público → Supabase/PostgreSQL
                  ├─ validação + cálculo + pedido transacional → PostgreSQL
                  └─ tentativa de pagamento → Mercado Pago
Mercado Pago → webhook validado → evento persistido → consulta ao provedor
                                               → pagamento/pedido + outbox
Admin autenticado → autorização de função/unidade → serviços → PostgreSQL
Cliente com acesso ao pedido → endpoint limitado → histórico de status
```

Serviços de domínio para catálogo, orçamento, pedidos, pagamentos, horário e entrega; adaptadores isolados de Supabase/Mercado Pago. Zod nas entradas. Carrinho em Context/reducer com persistência versionada é suficiente inicialmente; Zustand só se a complexidade justificar. A persistência guarda IDs/configuração e preço estimado, sem PII, tokens de cartão ou secrets.

Polling autorizado e com backoff atende a primeira versão de acompanhamento. Realtime autenticado pode acelerar o painel depois, sem publicar eventos privados em canais abertos. Dados privados nunca entram no cache público; catálogo pode usar cache curto e invalidação administrativa, mas checkout sempre relê a fonte confiável.

Pagamento e pedido são máquinas de estado independentes. Dinheiro/cartão na entrega não ficam automaticamente “approved”. Pagamento tardio de pedido cancelado vira exceção operacional/reembolso, não reabertura automática. Cancelar pedido pago exige fluxo de estorno; não basta trocar status local.

## 10. Plano por fases e critérios de passagem

Cada etapa terá diff pequeno, análise de impacto, testes relevantes, correções e registro do resultado antes da próxima. Commits incluem apenas arquivos daquela etapa, preservando trabalho anterior do usuário.

| Fase | Entrega | Critério de passagem / risco principal |
|---|---|---|
| 1 — Auditoria | Este documento e baseline | Evidências e limitações registradas; nenhum deploy |
| 2 — Fundação | Next.js/TS, scripts, ignore, env.example, lint, layout e migração gradual da interface | Build/typecheck/lint; catálogo e carrinho equivalentes; screenshots mobile/desktop; risco de hidratação |
| 3 — Supabase | Ambientes, schema, constraints, índices, migrations, seed, RLS, Auth de equipe inicial | Reset reproduzível; testes anon/guest/admin; nenhuma tabela privada acessível |
| 4 — Catálogo | Leitura dinâmica e mesmas categorias/cards | 14 produtos de homologação, preços coerentes, produto inativo oculto, indisponível bloqueado |
| 5 — Personalização/carrinho | Modal acessível, tamanhos, bordas, extras, notas, persistência | Combinações distintas preservadas; validação de opções; nenhuma regra meio a meio inventada |
| 6 — Checkout e pedidos | Identificação, entrega/retirada, endereço, orçamento seguro e criação atômica | Horário/área/mínimo validados; preço alterado exige confirmação; concorrência/idempotência testadas |
| 7 — Mercado Pago teste | Pix e cartões tokenizados; webhook, reconciliação, expiração | Aprovação/rejeição/retry/duplicação/timeout validados sem cobrança real |
| 8 — Acompanhamento | Página segura, detalhes mínimos, status e histórico | Token inválido/expirado bloqueado; ausência de enumeração/PII em cache/log |
| 9 — Administração | Login completo, pedidos, catálogo, tamanhos/opções, configurações e imagens | Autorização em toda operação; transições válidas, auditoria e concorrência |
| 10 — Operação | Horários finais, disponibilidade, taxas, WhatsApp suporte e notificações internas | Regras reais confirmadas; painel recebe pedidos e suporta recuperação após desconexão |
| 11 — Qualidade | Segurança, carga, acessibilidade, performance e testes E2E | Matriz crítica aprovada; nenhuma pendência financeira ou de privacidade crítica |
| 12 — Preview | Homologação do dono/equipe, sandbox, backups e restauração | Compra teste completa e operação da cozinha demonstradas |
| 13 — Produção | Migrações compatíveis, secrets segregados, publicação gradual | Checklist completo, observabilidade e rollback operacional disponíveis |

O controle de horário/disponibilidade/entrega começa no serviço de pedidos, não fica adiado para depois de receber pagamentos. Autenticação base antecede qualquer exposição de telas administrativas.

## 11. Arquivos provavelmente criados

```text
package.json, package-lock.json, tsconfig.json, next.config.ts
eslint.config.mjs, .gitignore, .env.example, README.md
src/app/layout.tsx, page.tsx, error.tsx, not-found.tsx
src/app/checkout/page.tsx
src/app/pedido/[id]/page.tsx
src/app/admin/login/page.tsx
src/app/admin/(protected)/layout.tsx, page.tsx
src/app/admin/(protected)/products/page.tsx
src/app/admin/(protected)/orders/page.tsx
src/app/admin/(protected)/settings/page.tsx
src/app/api/checkout/quote/route.ts
src/app/api/orders/route.ts
src/app/api/orders/[id]/route.ts
src/app/api/orders/[id]/payments/route.ts
src/app/api/webhooks/mercadopago/route.ts
src/app/api/admin/products/route.ts
src/app/api/admin/orders/[id]/route.ts
src/app/api/admin/settings/route.ts
src/components/{layout,menu,cart,checkout,orders,admin}/...
src/lib/{validation,money,cart}/...
src/server/{catalog,pricing,orders,payments,delivery,hours,auth}/...
src/lib/supabase/{browser,server,privileged}.ts
src/lib/mercadopago/{client,webhook,status-map}.ts
src/types/database.ts
src/proxy.ts (conforme versão Next.js escolhida)
supabase/config.toml, migrations/, seed.sql, tests/
tests/unit/, tests/integration/, tests/e2e/
vitest.config.ts, playwright.config.ts, .github/workflows/ci.yml
docs/OPERACAO.md, docs/DEPLOY.md
```

Lista proposta, não scaffold já implementado. Evitar endpoint público genérico de alterar pagamento. CRUD administrativo pode usar Server Actions onde simplificar, mantendo a mesma autorização. Jobs internos de outbox/reconciliação terão invocação autenticada e persistência de retries, definidos junto à infraestrutura.

## 12. Arquivos provavelmente modificados ou migrados

| Origem | Tratamento |
|---|---|
| `index.html` | Converter seções em componentes; preservar “SABOR QUE EXPLODE”; retirar responsabilidade de fonte do catálogo |
| `css/*.css` | Reutilizar inicialmente; ajustar caminhos, overflow, estados, foco, modal e movimento reduzido |
| `js/cart.js` | Substituir por estado tipado e componentes; revalidar/descartar carrinho legado sem IDs com aviso ao usuário |
| `js/menu.js` | Transformar busca/filtros em estado derivado do catálogo |
| `js/main.js`, `ui.js` | Extrair layout, toast, navegação, menu; resolver newsletter |
| `js/carousel.js`, `hero-animations.js` | Adaptar efeitos ao ciclo de vida React e manter fallback acessível |
| `assets/` | Copiar/migrar a `public/assets/`; manter originais, gerar versões otimizadas |
| `.vscode/settings.json` | Rever apenas se necessário para novo fluxo de desenvolvimento |

Não é necessária uma reformulação visual. A troca da camada de aplicação é necessária para a arquitetura solicitada; será feita de forma incremental com baseline visual e funcional.

## 13. Integrações externas necessárias

Obrigatórias: projeto Vercel com escopo definido; Supabase de teste e produção; aplicação Mercado Pago da pizzaria com contas/credenciais de teste e produção segregadas. Nenhuma integração autenticada desses serviços estava disponível entre as ferramentas desta sessão.

ViaCEP é opcional para conveniência, com timeout e preenchimento manual sempre disponível. Não decide cobertura/taxa. Storage Supabase só para imagens administráveis; imagens atuais podem continuar locais na primeira migração. Serviço de erros e rate limit distribuído devem ser definidos antes de expor checkout. WhatsApp externo, email e push ficam desacoplados pela outbox, sem envio nesta etapa.

Dependências comerciais: unidade(s) real(is), contato/endereço/CNPJ, preços e tamanhos, regra de meio a meio, taxa por CEP, horário, mínimo, tempo estimado, desconto de retirada, meios locais e política operacional de cancelamento. Nada disso será inferido dos exemplos fictícios.

## 14. Variáveis de ambiente propostas

| Variável | Escopo e finalidade |
|---|---|
| NEXT_PUBLIC_SUPABASE_URL | Pública; URL do projeto do ambiente |
| NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY | Pública; acesso limitado pelas permissões e RLS |
| SUPABASE_SECRET_KEY | Exclusiva do servidor privilegiado |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Alternativa legada à publishable, se o projeto exigir |
| SUPABASE_SERVICE_ROLE_KEY | Alternativa legada à secret; nunca NEXT_PUBLIC |
| NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY | Pública; inicialização do SDK cliente |
| MERCADO_PAGO_ACCESS_TOKEN | Exclusiva do servidor |
| MERCADO_PAGO_WEBHOOK_SECRET | Exclusiva do webhook no servidor |
| MERCADO_PAGO_ENVIRONMENT | Configuração explícita test/production; validar contra resposta do provedor |
| APP_URL | Origem canônica confiável do ambiente, definida pelo operador |
| CRON_SECRET | Somente se houver jobs HTTP agendados |
| DATABASE_URL / SUPABASE_DB_PASSWORD | Apenas ferramentas de migração/CI se usadas; não necessárias ao navegador |
| RATE_LIMIT_* / observabilidade | Variáveis do provedor selecionado, com segredo somente server-side |

Os nomes novos de chaves seguem a [documentação de API keys do Supabase](https://supabase.com/docs/guides/getting-started/api-keys). Não configurar simultaneamente alternativas sem uma política clara. `MERCADO_PAGO_PUBLIC_KEY` sem NEXT_PUBLIC não chega automaticamente ao código cliente Next.js.

Criar `.env.example` só com placeholders e `.gitignore` antes de armazenar credenciais: `.env*` com exceção do example, node_modules, .next, .vercel e artefatos locais sensíveis. Validar env no servidor sem imprimir valores. Módulos privilegiados importam `server-only`. Produção e preview recebem credenciais diferentes; não depender apenas do prefixo do token para distinguir ambiente. Não solicitar secrets pelo chat.

## 15. Plano Supabase e RLS

Provisionar/identificar primeiro o projeto correto e o ambiente. Migrations versionadas, seed idempotente de homologação, tipos gerados e índices nas FKs/filtros. Conferir changelog antes de implementar: foi lido o índice e identificada a atualização PostgreSQL 15.19/17.11; versão e extensões reais do futuro projeto ainda precisam ser verificadas.

| Papel | Permissões propostas |
|---|---|
| anon | SELECT apenas de catálogo ativo e projeção pública de configurações; sem pedidos/clientes/pagamentos/equipe |
| cliente guest | APIs Next.js com sessão/token específico; nenhum acesso amplo direto ao banco |
| authenticated comum | Não se torna administrador só por estar logado; sem escrita comercial |
| staff ADMIN ativo | Permissões autorizadas por usuário/unidade, políticas específicas e serviços validados |
| credencial de servidor | Pedidos e reconciliação após validação completa; uso restrito a módulos privilegiados |

Ativar RLS e limitar GRANTs em todas as tabelas expostas; índices nas colunas de política; nenhuma política universal `true` para tabelas privadas. SELECT, INSERT, UPDATE e DELETE têm decisões próprias; UPDATE inclui USING e WITH CHECK. Rejeitar consultas cruzadas de unidade e autoatribuição de papel. `user_metadata` editável não é fonte de autorização; consultar associação de equipe ativa no servidor para evitar papel revogado ainda válido em JWT antigo.

Views públicas devem ser explicitamente seguras, com `security_invoker` quando aplicável. Evitar SECURITY DEFINER; se excepcionalmente necessário, documentar autorização, search_path fixo e revogar execução pública. Nenhuma correção será feita desativando RLS. Referência: [RLS oficial](https://supabase.com/docs/guides/database/postgres/row-level-security).

Auth SSR usa o fluxo oficial de cookies e validação do usuário no servidor, sem confiar só na sessão fornecida pelo cliente. Referência: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client?queryGroups=framework&framework=nextjs).

Storage proposto: bucket público somente para imagens públicas do cardápio; escrita/deleção de ADMIN. JPEG/PNG/WebP/AVIF; limite inicial sugerido 5 MB e limite de dimensões; validar conteúdo real e reprocessar, remover metadados, nomes aleatórios e impedir SVG/HTML enviados pelo usuário. Bucket nunca armazena documentos de cliente. Não confundir SVG confiável já incluído no projeto com upload externo.

## 16. Plano Mercado Pago

Recomendação: Checkout Transparente pela Orders API, com componente oficial de cartão/tokenização e Pix no site. O catálogo oficial consultado identifica Payments API como legacy. Checkout Pro é alternativa com redirecionamento, mas não é a primeira escolha para a experiência solicitada. A implementação validará versão do SDK, elegibilidade da conta e métodos disponíveis. Referências: [visão geral](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/overview) e [cartões](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/websites/cards).

O Pix será criado no servidor via Orders API com chave de idempotência persistida e referência do pedido. A tela exibirá QR Code/copia e cola, valor, expiração e estado pendente. A documentação exige `X-Idempotency-Key`; email do pagador entra na validação conforme o método. Referência: [Pix oficial](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/payment-integration/websites/pix).

Nossos requisitos de consistência: transação local cria pedido e tentativa; commit; chamada externa; gravação do resultado. Não existe transação única entre PostgreSQL e Mercado Pago. Timeout após cobrança mantém tentativa incerta e reusa a mesma chave na recuperação. Não gerar nova cobrança enquanto a anterior estiver indefinida. Nova tentativa após rejeição terminal tem chave própria e controle de concorrência.

Cartão completo/CVV trafegam apenas pelos componentes oficiais do provedor, não pelo backend da loja ou Supabase. Tokens não entram em logs ou armazenamento durável. Crédito é o primeiro alvo; débito só será habilitado se o produto/conta o suportar — não prometer qualquer cartão de débito.

Webhook valida assinatura conforme SDK/documentação atual, persiste evento antes de confirmar recebimento e consulta o recurso no provedor. Referência: [notificações de Orders](https://www.mercadopago.com.br/developers/pt/docs/checkout-api-orders/notifications).

Controles adicionais do projeto: comparar referência, conta destinatária, ambiente, moeda e valor; status do provedor mapeado explicitamente ao domínio; deduplicação por recurso/evento e transição idempotente; proteção contra eventos antigos e processamento concorrente. Atualização do pagamento, pedido e outbox deve ser atômica. Retentativas/reconciliação duráveis cobrem webhook perdido ou indisponibilidade. Redirecionamento e callback do navegador nunca autorizam “pago”.

Incluir expiração de Pix, pagamento tardio, estorno parcial/total e contestação no modelo operacional. Não iniciar preparo de pagamento online pendente. Métodos locais continuam com recebimento pendente até ação autorizada registrada. Só usar contas e meios de teste nesta fase.

## 17. Plano administrativo

`/admin/login` público; demais páginas, ações e APIs exigem autenticação Supabase validada e vínculo ADMIN ativo. Usuários de equipe provisionados pelo responsável; sem cadastro que permita escolher papel administrativo. MFA para administradores antes de operar pagamentos reais.

Dashboard com filtros por unidade/status, detalhes completos autorizados e atualização incremental. Transições permitidas: confirmado → preparando → pronto → saiu para entrega → entregue; retirada pula entrega externa. Ações inválidas, corrida entre atendentes e edição de pedidos cancelados devem ser rejeitadas por controle de versão/lock.

Gestão de categorias, produto, preço, imagens, tamanhos, grupos/opções, disponibilidade, ordem e destaque. Configurações de horário, exceções, taxa, mínimo, contato e métodos. Histórico de quem mudou preço/status. Pagamento não possui campo livre “marcar aprovado” para Mercado Pago.

Reembolso é operação distinta, autorizada, idempotente e auditada. Futuro RBAC permite gerente, atendente, cozinha e entregador, com exposição mínima de dados por papel. Nenhum papel futuro recebe acesso por default.

## 18. Estratégia de testes e resultados da auditoria

Resultados executados nesta etapa:

- `node --check` passou nos seis scripts locais.
- Parser do HTML não encontrou IDs duplicados ou referências locais `./...` inexistentes.
- Site público: Margherita R$ 42,90; aumento para duas unidades exibiu R$ 85,80; após reload permaneceu; remoção deixou total zero e checkout desabilitado.
- Busca “calabresa” retornou Calabresa Nuclear e Diavola, coerente com busca também na descrição. Filtro Doces retornou os três sabores esperados.
- Console do percurso não registrou warnings/errors. Não cobre todas as interações, falhas de rede ou navegadores.
- Viewports: 320→scrollWidth 530; 390→530; 768→753; 1440→1425. Valores menores nos dois últimos incluem espaço da barra; os menores apresentam overflow. Inspeção visual em 390 e 1440 px; não equivale a teste em iPhone/Android físico.
- Tab do botão de fechar o carrinho vazio escapou do dialog para BODY.
- Cabeçalhos HTTP públicos inspecionados. Nenhum pedido real, mensagem, cadastro ou pagamento foi enviado.

Não há `npm test`, build ou lint para rodar atualmente. Não foram executados testes de Supabase/RLS, sandbox Mercado Pago, admin, Lighthouse, carga ou segurança dinâmica: esses sistemas não existem ou não estão conectados. Tampouco foi feita avaliação jurídica da política de dados.

Matriz de aceitação futura:

| Área | Casos obrigatórios |
|---|---|
| Carrinho | Adicionar, remover, aumentar/diminuir/limpar, borda, adicional, observações, variantes separadas, reload, armazenamento corrompido |
| Checkout | Retirada sem taxa; entrega dentro/fora da zona; CEP manual e indisponibilidade ViaCEP; mínimo; loja fechada; virada da meia-noite; endereço inválido |
| Integridade | Preço adulterado no navegador; preço alterado durante checkout; produto/opção desativados; tamanho de outro produto; IDs inválidos; quantidade negativa/fracionária/excessiva |
| Concorrência | Dois submits com mesma chave geram um pedido; mesma chave com payload diferente é rejeitada; cupons limitados/reservados atomicamente |
| Pagamentos | Pix pendente/aprovado/expirado; cartão aprovado/rejeitado/3DS; timeout depois de criação; múltiplas tentativas; ambiente/valor/moeda/referência incorretos |
| Webhooks | Assinatura inválida, evento duplicado, replay, fora de ordem, concorrência, falha no banco, reconciliação após perda, estorno e aprovação tardia |
| Segurança | Admin sem login, usuário logado sem papel, papel revogado, RLS anon/authenticated, acesso a outro pedido/unidade, CSRF, rate limit, XSS armazenado, upload hostil |
| Experiência | Playwright Chromium/Firefox/WebKit; 320/390/768/1440; teclado e axe; iPhone/Android reais; rede lenta; SDK bloqueado; restauração de sessão |

Unitários para cálculo em centavos, horários, regras e transições; integração contra PostgreSQL/Supabase real de teste para transações/RLS; contratos de API; E2E no preview; sandbox real do provedor além de mocks. CI deve exigir types, lint, unitários, integração e build. Logs dos testes não contêm secrets ou dados reais.

## 19. Estratégia de deploy

Primeiro migrar localmente e validar. Usar branch/commits por fase e deploy de preview, sem alterar o projeto de produção antes da homologação. A seleção de versão Next.js/Node será feita pela versão estável suportada e corrigida no momento da instalação, com dependências fixadas e lockfile. Referência: [instalação Next.js](https://nextjs.org/docs/app/getting-started/installation).

Vercel: confirmar projeto/time, repositório, root directory e branch de produção no painel; hoje não há configuração local que comprove esses detalhes. Definir build Next.js, região próxima ao banco, limites/observabilidade e variáveis por ambiente. Referência: [ambientes Vercel](https://vercel.com/docs/deployments/environments).

Banco de preview separado de produção, somente dados sintéticos, credenciais MP teste e webhook HTTPS próprio. Preview protegido, com acesso apenas ao endpoint de webhook conforme configuração segura da plataforma. Não copiar dados pessoais de produção para homologação.

Migrações aplicadas uma vez por fluxo controlado, não durante cada build concorrente. Preferir expandir schema de forma compatível antes de trocar código. Backup e ensaio de restauração antecedem mudanças de produção. Rollback de aplicação não desfaz schema nem cobranças: manter compatibilidade e reconciliação durante rollback. Nunca restaurar banco por conveniência apagando pedidos pagos.

## 20. Checklist de produção

- [ ] Unidade(s), dados empresariais, contatos, horários, catálogo/preços e regras comerciais confirmados; conteúdo fictício removido.
- [ ] Fluxo completo no preview aprovado pelo responsável e equipe: compra → pagamento → painel → preparo → entrega/retirada.
- [ ] Supabase produção separado; migrations reproduzíveis, RLS/GRANTs/RPCs/Storage testados e advisors revisados.
- [ ] Nenhum secret em Git, bundle, source map, respostas ou logs; rotação se houver exposição.
- [ ] Credenciais corretas da pizzaria e webhook de produção configurados; ambiente verificado explicitamente.
- [ ] Idempotência sob concorrência e recuperação de timeouts, falha de webhook, aprovação tardia, estorno e contestação testadas.
- [ ] Admin com MFA, menor privilégio, revogação de acesso e trilha de auditoria.
- [ ] Checkout valida preços, disponibilidade, opções, zona, taxa, mínimo e horário no servidor.
- [ ] Acompanhamento sem enumeração, token protegido, sem PII em analytics/referrer/cache público e com dados mínimos expostos.
- [ ] CSP compatível com SDK oficial, proteção de mutações, rate limits, limites de payload e uploads validados.
- [ ] Testes críticos, build, acessibilidade e mobile aprovados; metas de performance medidas, não presumidas.
- [ ] Backups habilitados conforme plano contratado; restauração testada e responsáveis definidos.
- [ ] Logs sanitizados com correlation ID, alertas de pagamentos inconsistentes, jobs atrasados e falhas de checkout/webhook.
- [ ] Política de privacidade, retenção, atendimento e cancelamento revisada pelo responsável; consentimento separado para marketing.
- [ ] Operação sabe lidar com queda do painel, loja fechada, pedido pago não recebido e atendimento de reembolso.
- [ ] Publicação gradual, monitoramento inicial e procedimento de rollback compatível com pedidos reais.

**Estado final desta entrega:** auditoria e proposta concluídas; implementação funcional ainda não iniciada, conforme o pedido de analisar e entregar o diagnóstico primeiro. A próxima etapa técnica é a fundação Next.js/TypeScript preservando a interface. Integrações remotas e regras comerciais serão verificadas antes de depender delas.
