# Role Based Restructure Sprint Guide

Data: 2026-05-15

Fonte: `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`, `ROLE_BASED_RESTRUCTURE_QUEUE.md`, `ROLE_BASED_RESTRUCTURE_IMPLEMENTATION_SPEC.md`, `PLAYER_APP_V2_IMPLEMENTATION_SPEC.md`, `COMPETITION_OS_V2_IMPLEMENTATION_SPEC.md`, `MANAGEMENT_OS_V2_IMPLEMENTATION_SPEC.md`, `ROLE_BASED_RESTRUCTURE_PLAYBOOK.md`, `PLAYER_APP_V2_UX_PLAN.md`, `COMPETITION_OS_V2_UX_PLAN.md`, `MANAGEMENT_OS_V2_UX_PLAN.md`.

## Objetivo

Permitir executar a reestruturacao em sprints curtos, sem perder padrao, sem pular areas e sem transformar cada tarefa em redesign improvisado.

Este guia tambem define a ordem de leitura. MDs historicos so entram depois dos specs v2, para confirmar cobertura funcional e nao para reintroduzir padroes antigos.

## Ordem De Fonte

1. `RESTRUCTURE_SOURCE_OF_TRUTH_POLICY.md`
2. Spec da superficie: Player, Competition ou Management.
3. `ROLE_BASED_RESTRUCTURE_QUEUE.md`
4. MDs funcionais especificos da area.
5. Codigo real.
6. QA e screenshots.

Se houver conflito, siga a politica e o spec v2. Preserve a funcao antiga, nao necessariamente a tela antiga.

## Comando De Sprint

Use este comando em rodadas futuras:

```text
Execute o proximo sprint da Role Based Restructure Queue.
```

Ou, para escopo fechado:

```text
Execute somente o item PLAYER-UX-01 da Role Based Restructure Queue.
```

## Regras De Sprint

1. Ler os MDs fonte antes de alterar.
2. Executar somente os itens do sprint atual.
3. Nao avancar para area seguinte se a atual nao cumprir aceite.
4. Nao remover funcionalidades existentes.
5. Nao esconder funcao sem reposicionar.
6. Nao criar acao sem persistencia real.
7. Se faltar backend estrutural, documentar gap e criar task.
8. Validar mobile quando a task afetar player/mobile.
9. Rodar lint/build quando houver codigo.
10. Atualizar MDs ao final.
11. Registrar explicitamente se alguma estrutura legada foi removida, fundida ou reposicionada.

## Definition Of Ready

Uma task esta pronta para entrar no sprint quando tem:

- ID;
- area;
- objetivo;
- usuario alvo;
- problema atual;
- comportamento desejado;
- escopo;
- fora de escopo;
- arquivos provaveis;
- riscos;
- validacao;
- criterios de aceite.

## Definition Of Done

Uma task esta concluida quando:

- comportamento implementado ou documentado como gap;
- nenhuma funcao existente foi removida;
- permissoes/plano respeitados;
- mobile/desktop validados conforme escopo;
- lint/build passam quando houve codigo;
- screenshots gerados quando possivel;
- `EXECUTION_QUEUE.md` ou `ROLE_BASED_RESTRUCTURE_QUEUE.md` atualizado;
- `CURRENT_PRODUCT_STATE.md` atualizado se o estado do produto mudou;
- MD especifico da area atualizado se necessario.

## Ordem Recomendada De Sprints

### Sprint 0 - Fundacao De Papeis

Itens:

- `ROLE-UX-00`
- `ROLE-UX-01`
- `DESIGN-UX-00`

Objetivo:

- criar base para nao refazer telas erradas.

Nao implementar:

- redesign profundo de paginas.

Status:

- concluido em 2026-05-15. A partir daqui, sprints de tela devem respeitar matriz de visibilidade, shell por modo e tokens de densidade por modo.

### Sprint 1 - Player Home E Navegacao

Itens:

- `PLAYER-UX-01`
- parte de `ROLE-UX-01` se necessaria para nav.

Objetivo:

- primeira dobra do jogador deixar de parecer painel.

Status:

- concluido em 2026-05-15. `/inicio` agora abre por proxima acao/intencao e separa `Trabalho` do fluxo de jogador.

### Sprint 2 - Locais / Reserva / Aulas

Itens:

- `PLAYER-UX-02`
- `PLAYER-UX-03`
- `PLAYER-UX-04`

Objetivo:

- transformar descoberta em fluxos leves por intencao.

Status:

- `PLAYER-UX-02` concluido em 2026-05-15.
- `PLAYER-UX-03` concluido em 2026-05-15.
- `PLAYER-UX-04` concluido em 2026-05-15.
- Proxima execucao recomendada: `COMP-UX-02`.

### Sprint 3 - Jogar / Ranking / Perfil

Itens:

- `PLAYER-UX-05`
- `PLAYER-UX-06`
- `PLAYER-UX-07`

Objetivo:

- completar experiencia comum do jogador.

### Sprint 4 - Competition Player/Public

Itens:

- `COMP-UX-01`
- `COMP-UX-02`
- `COMP-UX-03`

Objetivo:

- evento/inscricao parecer produto para jogador, nao cockpit.

Status:

- `COMP-UX-01` concluido em 2026-05-15.
- Proxima execucao recomendada: `COMP-UX-02`.

### Sprint 5 - Competition Setup

Itens:

- `COMP-SETUP-01`
- `COMP-SETUP-02`

Objetivo:

- reorganizar formularios complexos de torneio/liga.

### Sprint 6 - Competition Operation

Itens:

- `COMP-OPS-01`
- `COMP-OPS-02`

Objetivo:

- organizador resolver fila operacional sem cacar.

### Sprint 7 - Management Shell E Professor

Itens:

- `MGMT-UX-01`
- `MGMT-UX-02`

Objetivo:

- gestao por papel e sem cockpit indevido.

### Sprint 8 - Agenda / Academia

Itens:

- `MGMT-AGENDA-01`
- `MGMT-ACADEMY-01`

Objetivo:

- consolidar operacao diaria de clube/academia.

### Sprint 9 - Financeiro / CRM / Cantina

Itens:

- `MGMT-FINANCE-01`
- `MGMT-CRM-01`
- `MGMT-CANTEEN-01`

Objetivo:

- rotinas internas por fila e acao.

### Sprint 10 - Equipe / Ajustes / Public Pages

Itens:

- `MGMT-TEAM-01`
- `MGMT-SETTINGS-01`
- `PUBLIC-PLACE-01`
- `PUBLIC-COMP-01`

Objetivo:

- fechar configuracao e camada publica sem vazamento.

### Sprint 11 - QA Final

Itens:

- `QA-ROLE-01`
- `QA-DESIGN-01`

Objetivo:

- validar consistencia por papel, mobile e mercado.

## Template Para Atualizar Uma Task

Use este formato quando detalhar ou concluir qualquer item:

```md
### [status] TASK-ID - Titulo

Area:
Usuario alvo:
Prioridade:
Status:

Problema atual:

Objetivo:

Escopo:

Fora de escopo:

Arquivos provaveis:

Backend/permissoes:

UX esperada:

Mobile:

Desktop:

Criterios de aceite:

Validacao:

Riscos:

Documentacao a atualizar:
```

## Evidencias Minimas Por Sprint

Quando possivel, gerar:

- screenshot mobile 390px antes/depois;
- screenshot desktop se for area operacional;
- resumo de fluxo validado;
- lista de arquivos alterados;
- comandos de validacao.
