# Cross App Flow Audit - 2026-05-21

Fonte executiva:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/EXECUTION_QUEUE.md`
- Auditor: `scripts/capture-visual-audit.mjs`

Objetivo desta rodada: continuar o mesmo tipo de teste E2E/UX feito em academia, torneio e liga, agora validando fluxos transversais do app e corrigindo problemas de navegação, permissão e continuidade que aparecem entre Player App e Management OS.

## Evidencias

Rodada owner/player:

- `docs/screenshots/cross-app-flow-audit-2026-05-21-run1/`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop wide.
- Rotas: `/inicio`, `/locais`, `/locais?intent=booking`, `/locais?intent=classes`, `/eventos`, `/agenda`, `/minhas-reservas`, `/minhas-aulas`, `/meus-pagamentos`, `/ranking`, `/perfil`, `/gestao`, rotas da academia QA e `/locais/:placeId/reservar`.

Rodadas por papel:

- `docs/screenshots/cross-app-role-audit-2026-05-21-professor/`
- `docs/screenshots/cross-app-role-audit-2026-05-21-recepcao/`
- `docs/screenshots/cross-app-role-audit-2026-05-21-financeiro/`
- `docs/screenshots/cross-app-role-audit-2026-05-21-caixa/`
- Viewports: mobile 390 e desktop 1366.

Diagnostico:

- Typecheck: `npx.cmd tsc -b --pretty false` passou.
- Console: 0 erros/warnings nas rotas auditadas.
- Network failures: 0 falhas capturadas pelo auditor visual.

## Correcoes Aplicadas

### 1. Financeiro operacional para academias

Arquivo:

- `src/lib/place-management.ts`

Problema:

- Uma academia com contratos, mensalidades e cobrancas de alunos conseguia criar recebiveis, mas a rota `/gestao/:placeId/financeiro` nao ficava acessivel para o owner/financeiro quando o produto era `academy`.

Solucao:

- O plano `academy` agora habilita `finance`, sem habilitar CRM, cantina ou socios automaticamente.

Resultado:

- A rota da academia QA `/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/financeiro?visao=recebiveis` abre a central financeira.
- Recebiveis de mensalidade de academia aparecem com CTA `Marcar pago` e `Enviar lembrete`.

### 2. Alias publico de reserva

Arquivo:

- `src/pages/PlacePublicPage.tsx`

Problema:

- Links como `/locais/:placeId/reservar` caiam na pagina publica geral, em vez de abrir/focar o fluxo de reserva. Isso quebrava a continuidade `Jogar -> Reservar -> Confirmar`.

Solucao:

- Criado parser de intencao publica com aliases:
  - `reservar`, `reserva`, `quadra`, `quadras`, `booking`, `bookings` -> `booking`
  - `aula`, `aulas`, `academia`, `turmas`, `classes` -> `academy`
  - `jogo`, `jogos`, `partidas`, `matches` -> `matches`
  - `planos`, `mensalidades`, `socios` -> `plans`

Resultado:

- `/locais/49709592-173c-49c6-aa22-bacb6ec0b31b/reservar` abre direto com CTA `Reservar quadra` e o fluxo de reserva visivel.

### 3. Nova reserva na gestao prioriza formulario

Arquivo:

- `src/pages/PlacesPage.tsx`

Problema:

- Em `Agenda -> Nova reserva`, a fila operacional/lista de espera podia aparecer antes do formulario, principalmente no mobile, quebrando a tarefa da recepcao: criar reserva rapidamente.

Solucao:

- A fila operacional deixa de renderizar acima do formulario quando `bookingView === "new"`.

Resultado:

- `/gestao/:placeId/agenda?visao=nova-reserva` abre com formulario de quadra/data/horario/duracao antes dos resumos.

## Validacao Por Papel

### Jogador / owner em modo Jogador

Rotas validadas:

- `/inicio`
- `/locais`
- `/locais?intent=booking`
- `/locais?intent=classes`
- `/eventos`
- `/agenda`
- `/minhas-reservas`
- `/minhas-aulas`
- `/meus-pagamentos`
- `/ranking`
- `/perfil`

Resultado:

- Sem erro de console.
- Player App manteve separacao entre agenda/pagamentos pessoais e gestao.
- `Minha agenda` preserva aliases de reservas, aulas e pagamentos.

### Owner / gestor

Rotas validadas:

- `/gestao`
- `/gestao/:academyId/painel`
- `/gestao/:academyId/agenda?visao=nova-reserva`
- `/gestao/:academyId/financeiro?visao=recebiveis`
- `/gestao/:academyId/academia?visao=hoje`

Resultado:

- Sem erro de console.
- Financeiro da academia aparece para owner.
- A academia QA ficou com modulos: Painel, Reservas, Academia, Financeiro, Equipe, Ajustes.

### Professor

Login:

- `prof.renato@demo.atp.local`

Rotas:

- `/gestao`
- `/gestao/36b29d6c-fabb-475a-a059-47d5ece74a09/academia?visao=hoje`
- `/gestao/36b29d6c-fabb-475a-a059-47d5ece74a09/academia?visao=alunos`
- tentativa de `/financeiro`

Resultado:

- Professor ve rotina de aulas, turmas, alunos e reposicoes.
- Tentativa de Financeiro redireciona para Academia.
- Sem financeiro/cantina/equipe para professor comum.

### Recepcao

Login:

- `recepcao.prime@demo.atp.local`

Rotas:

- `/gestao`
- `/gestao/487b9846-9739-4f42-bc5f-60ea0cb4d050/agenda?visao=nova-reserva`
- `/gestao/487b9846-9739-4f42-bc5f-60ea0cb4d050/clientes?visao=rotina`
- tentativa de `/financeiro`

Resultado:

- Recepcao ve reservas, check-ins, lista de espera, clientes e aulas.
- Tentativa de Financeiro redireciona para Agenda.
- Sem financeiro amplo/setup estrutural.

### Financeiro

Login:

- `financeiro.prime@demo.atp.local`

Rotas:

- `/gestao`
- `/gestao/487b9846-9739-4f42-bc5f-60ea0cb4d050/financeiro?visao=recebiveis`
- tentativa de `/agenda`

Resultado:

- Financeiro ve recebiveis, pagamentos, despesas e resumo.
- Tentativa de Agenda redireciona para Financeiro.
- Sem agenda/academia/cantina/equipe.

### Caixa

Login:

- `caixa.prime@demo.atp.local`

Rotas:

- `/gestao`
- `/gestao/487b9846-9739-4f42-bc5f-60ea0cb4d050/cantina?visao=vender`
- tentativa de `/financeiro`

Resultado:

- Caixa ve venda rapida, vendas do dia, estoque e produtos.
- Tentativa de Financeiro redireciona para Cantina.
- Sem financeiro amplo.

## Pendencias Detectadas

- `CROSS-UX-01`: Work Today do owner ainda agrega volume muito alto de pendencias quando o usuario tem muitos locais/competições QA. Precisa de filtro de local ativo/prioridade antes de virar lista longa.
- `CROSS-UX-02`: Pagina publica do local em mobile funciona, mas a action rail pode ficar visualmente apertada quando ha muitos produtos do local. Reavaliar como tabs compactas ou cards menores.
- `CROSS-UX-03`: A tela de gestao de local ainda mostra seletor de local dentro do shell. Funciona, mas usuarios com muitas academias podem precisar de uma pagina/seletor de unidade mais claro antes de entrar no workspace.
- `ACADEMY-DB-01`: aplicar migration remota de convite de staff.
- `ACADEMY-DB-02`: aplicar migration remota de chamada/presenca.

## Follow-up CROSS-UX-01

Status: resolvido em `docs/MANAGEMENT_FOCUS_AUDIT_2026_05_21.md`.

Evidencias:

- `docs/screenshots/management-focus-audit-2026-05-21-run1/`
- `npx.cmd tsc -b --pretty false`
- Console/rede: 0 eventos nos diagnostics.

Resumo:

- `Trabalho Hoje` do owner agora usa unidade em foco.
- Cards de primeira dobra deixam de somar todas as unidades.
- O seletor `Unidade em foco` aparece quando ha mais de uma unidade gerenciada.
- Rotas, permissoes, loaders e backend foram preservados.

## Conclusao

A rodada corrigiu tres problemas práticos de fluxo e confirmou que os papeis principais de trabalho preservam permissões por redirecionamento/wrapper, sem expor modulos proibidos. A proxima rodada deve atacar a confusao de usuario multi-local e a densidade do Work Today para owners com muitos dados.
