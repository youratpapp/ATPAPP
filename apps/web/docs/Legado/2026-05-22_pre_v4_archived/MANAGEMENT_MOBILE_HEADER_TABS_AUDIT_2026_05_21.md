# Management Mobile Header And Tabs Audit - 2026-05-21

Fonte executiva:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/EXECUTION_QUEUE.md`
- `docs/MULTILOCAL_SWITCHER_AUDIT_2026_05_21.md`

Objetivo: corrigir `MANAGEMENT-UX-01`, reduzindo tiers de navegacao e densidade visual no workspace de local em mobile.

## Evidencias

- Screenshots e diagnostics: `docs/screenshots/management-mobile-header-audit-2026-05-21-run1/`
- Rotas auditadas:
  - `/gestao`
  - `/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/painel`
  - `/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/agenda?visao=nova-reserva`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop wide
- Console/rede: 0 eventos nos diagnostics
- Typecheck: `npx.cmd tsc -b --pretty false` passou

## Problema

No mobile, o workspace tinha camadas demais antes da tarefa:

- header do local;
- seletor Jogador/Trabalho;
- acoes voltar/publico;
- shell da unidade;
- seletor de unidade;
- tabs internas de modulo;
- bottom nav de trabalho.

As tabs internas duplicavam a navegacao do bottom nav e ainda ficavam cortadas quando havia muitos modulos.

## Correcao aplicada

Arquivo:

- `src/App.css`

Mudancas:

- Em mobile, `.place-management-tabs` deixa de aparecer no shell interno.
- A troca de rotina fica concentrada no bottom nav de trabalho.
- O `Modulo ativo` continua visivel como contexto da pagina.
- O header do Management OS ficou mais compacto no mobile: titulo menor, gap menor e menos altura antes da operacao.

## Resultado UX

- Reduz uma camada de menu no mobile.
- Evita dois menus concorrendo pela mesma funcao.
- A primeira dobra chega mais rapido em `Modulo ativo`, `Hoje e prioridades` e fila.
- Desktop continua com tabs internas completas.
- Rotas, permissoes, loaders e backend foram preservados.

## Pendencias restantes

- O nome de unidade muito longo ainda ocupa duas linhas em alguns dados QA; isso e aceitavel para nomes reais, mas pode ser revisitado com abreviacao responsiva se necessario.
- `ACADEMY-DB-01`: aplicar migration remota de convite de staff.
- `ACADEMY-DB-02`: aplicar migration remota de chamada/presenca.
