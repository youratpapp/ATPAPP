# Management Focus Audit - 2026-05-21

Fonte executiva:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/EXECUTION_QUEUE.md`
- `docs/CROSS_APP_FLOW_AUDIT_2026_05_21.md`

Objetivo: continuar o sprint transversal corrigindo `CROSS-UX-01`, a agregacao excessiva de `Trabalho Hoje` para gestor/owner com muitas unidades.

## Evidencias

- Screenshots e diagnostics: `docs/screenshots/management-focus-audit-2026-05-21-run1/`
- Rotas auditadas: `/gestao`, `/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/painel`, `/locais/49709592-173c-49c6-aa22-bacb6ec0b31b/reservar`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop wide
- Console/rede: 0 eventos nos diagnostics
- Typecheck: `npx.cmd tsc -b --pretty false` passou

## Problema

Em usuarios owner/manager com muitas academias, clubes ou dados de QA, a primeira dobra de `/gestao` somava todas as pendencias como se fossem uma unica operacao.

Isso quebrava a regra central do Playbook V3:

- a tela precisa responder "o que preciso resolver agora?";
- a rotina diaria nao deve virar uma arvore de modulos;
- o gestor precisa enxergar o maior bloqueio sem uma lista infinita.

## Correcao aplicada

Arquivos:

- `src/pages/ManagementHubPage.tsx`
- `src/App.css`

Mudancas:

- Criado estado de unidade em foco para `Trabalho Hoje`.
- O foco inicial usa a unidade com maior prioridade operacional.
- Quando ha mais de uma unidade, a primeira dobra mostra o seletor `Unidade em foco`.
- Os cards principais do gestor agora usam apenas a unidade selecionada:
  - pendencias criticas;
  - reservas;
  - aulas;
  - financeiro;
  - clientes;
  - estoque.
- O total global segue preservado nos blocos secundarios/lista de unidades.

## Resultado UX

- A primeira dobra deixa de apresentar numero global inflado.
- O gestor entende qual unidade esta ativa antes de entrar nos cards.
- O CTA dos cards abre a rota correta da unidade em foco.
- Player App e Management OS seguem separados.
- Permissoes, loaders e backend foram preservados.

## Validacao

Passou:

- `/gestao` mobile 390 e 430;
- `/gestao` desktop 1366 e desktop amplo;
- dashboard da academia QA;
- rota publica de reserva da academia QA;
- console sem erro;
- rede sem falha capturada;
- typecheck.

Observacao visual:

- No mobile, o seletor ocupa uma faixa propria e evita texto comprimido.
- No desktop, o controle fica alinhado ao titulo da secao e nao compete com os cards.

## Pendencias restantes

- `CROSS-UX-02`: action rail da pagina publica do local em mobile ainda pode ficar apertada em locais com muitas ofertas.
- `CROSS-UX-03`: usuarios multi-local ainda podem se beneficiar de uma etapa mais clara de escolha de unidade antes de entrar no workspace interno.
- `ACADEMY-DB-01`: aplicar migration remota de convite de staff.
- `ACADEMY-DB-02`: aplicar migration remota de chamada/presenca.
