# Multilocal Switcher Audit - 2026-05-21

Fonte executiva:

- `docs/APP_WORKFLOW_EXECUTION_PLAYBOOK_V3.md`
- `docs/EXECUTION_QUEUE.md`
- `docs/MANAGEMENT_FOCUS_AUDIT_2026_05_21.md`

Objetivo: corrigir `CROSS-UX-03`, reduzindo a confusao de usuarios com multiplos locais dentro do workspace de gestao.

## Evidencias

- Screenshots e diagnostics: `docs/screenshots/multilocal-switcher-audit-2026-05-21-run3/`
- Rotas auditadas:
  - `/gestao`
  - `/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/painel`
  - `/gestao/49709592-173c-49c6-aa22-bacb6ec0b31b/agenda?visao=nova-reserva`
- Viewports: mobile 390, mobile 430, desktop 1366, desktop wide
- Console/rede: 0 eventos nos diagnostics
- Typecheck: `npx.cmd tsc -b --pretty false` passou

## Problema

Depois da correcao do `Trabalho Hoje`, a entrada por `/gestao` ficou mais clara. Mas dentro do workspace do local ainda havia um seletor longo de `Local ativo` no cabecalho.

Em usuario multi-local, isso competia com:

- nome da unidade;
- status de pendencias;
- abas de modulo;
- tarefa atual.

## Correcao aplicada

Arquivos:

- `src/components/place/PlaceAdminShell.tsx`
- `src/App.css`

Mudancas:

- O seletor longo virou um disclosure compacto de `Unidade ativa`.
- O nome da unidade fica visivel.
- A troca de unidade fica em `Trocar unidade`, sob demanda.
- O select antigo foi preservado dentro do disclosure, mantendo rotas e comportamento.
- A selecao principal antes do workspace continua acontecendo em `/gestao`, com unidade em foco.

## Achado visual corrigido na mesma rodada

O audit mobile do painel da academia mostrou cards brancos em `Sinais de suporte` e `Relatorios do local`.

Correcao:

- `.place-operations-grid button` e `.place-report-peaks div` receberam tratamento dark no Management OS.
- Os cards agora usam superficie escura, borda suave e destaque verde, alinhados ao DNA premium aprovado.

## Resultado UX

- O workspace comunica melhor: "esta e a unidade ativa".
- Trocar unidade continua possivel, mas nao parece uma decisao obrigatoria em toda tela.
- O header do workspace ficou menos poluido.
- Cards brancos remanescentes foram removidos da primeira experiencia do painel.
- Backend, loaders, permissoes e rotas foram preservados.

## Pendencias restantes

- Abas internas de modulo ainda podem ficar densas no mobile quando a unidade tem muitos modulos. Proxima evolucao sugerida: agrupar modulos diarios no bottom nav e mover setup raro para `Mais/Ajustes`.
- `ACADEMY-DB-01`: aplicar migration remota de convite de staff.
- `ACADEMY-DB-02`: aplicar migration remota de chamada/presenca.
